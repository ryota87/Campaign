// Supabase Edge Function - Campaign API
// Deno環境のため、ローカルのTypeScriptチェッカーではエラーが出る場合がある

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    console.log(`Action received: ${action}`);

    // JWT認証
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Tokenの取得 (Bearer を大文字小文字問わず削除)
    const token = authHeader.replace(/^Bearer\s+/i, '');
    console.log(`Token received (starts with): ${token.substring(0, 10)}...`);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error detail:', authError);
      return new Response(JSON.stringify({ 
        error: `Unauthorized: ${authError?.message || 'Invalid user'}`,
        debug: { hasToken: !!token, authError: authError?.message }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated user: ${user.id}`);

    // --- summarize_url: URLをGeminiで要約 ---
    if (action === 'summarize_url') {
      const { url } = body as { url: string };

      // URLのコンテンツを取得
      let html = '';
      console.log(`Fetching content from: ${url}...`);

      // SNS (X, TikTok, Instagram, Threads) の場合は可能な限り oEmbed API を試す
      const isSns = /twitter\.com|x\.com|tiktok\.com|instagram\.com|threads\.net/.test(url);
      if (isSns) {
        try {
          console.log(`Detected SNS URL: ${url}, trying oEmbed API...`);
          let oembedUrl = '';
          if (/twitter\.com|x\.com/.test(url)) {
            oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
          } else if (/tiktok\.com/.test(url)) {
            oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
          }
          // Instagram / Threads は認証トークンが必要なため、ここでは通常の fetch にフォールバック

          if (oembedUrl) {
            const oembedRes = await fetch(oembedUrl);
            if (oembedRes.ok) {
              const oembedData = await oembedRes.json();
              html = oembedData.html || oembedData.title || '';
              console.log('oEmbed API success');
            }
          }
        } catch (e) {
          console.warn('oEmbed API failed, falling back to raw fetch:', e);
        }
      }

      // oEmbed が失敗した、または SNS 以外の場合は通常の fetch
      if (!html) {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
        html = await res.text();
      }

      console.log(`Fetched content size: ${html.length} characters`);
      
      // 不要なタグ（script, style等）を中身ごと削除してノイズを減らす
      let cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
      
      const text = cleanedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 30000);

      // Gemini で要約 (Fallbackロジック)
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
      const MODEL_CANDIDATES = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-latest',
        'gemini-2.0-flash-001',
        'gemini-1.5-flash',
        'gemini-flash-latest',
        'gemini-2.0-flash'
      ];

      let lastError = null;
      let data = null;

      const prompt = `
以下のWebページの内容から、キャンペーン情報を抽出してください。
JSONのみを返し、コードブロックや説明文は不要です。
不明な項目がある場合は、省略したりデフォルト値を入れず、必ず "Unknown" という文字列を入れてください。

{
  "title": "キャンペーン名（簡潔に、不明な場合は "Unknown"）",
  "company": "主催企業名（不明な場合は "Unknown"）",
  "summary": "キャンペーン内容の要約（簡潔に2〜4文、。敬語（ですます）ではなく、体言止めや「〜。〜する。」などの簡潔な表現にすること。不明な場合は "Unknown"）",
  "start_date": "開始日（YYYY-MM-DD形式、不明な場合は "Unknown"）",
  "deadline": "締め切り日（YYYY-MM-DD形式、不明な場合は "Unknown"）",
  "discount_rate": "割引率（％）（数字のみ。不明な場合は "Unknown"）",
  "discount_amount": "割引金額（例：500円、1000円。不明な場合は "Unknown"）",
  "max_amount": "上限金額（例：2000円。不明な場合は "Unknown"）",
  "max_usage": "上限回数（例：1回、月3回。不明な場合は "Unknown"）",
  "source_type": "sns（X/Instagram/TikTok/Threads等）/ official（企業サイト）/ other"
}

ページ内容:
${text}
`;

      for (const modelName of MODEL_CANDIDATES) {
        try {
          console.log(`Trying model: ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          let responseText = result.response.text().replace(/```json\n|\n```|```/g, '').trim();
          
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
          }
          data = JSON.parse(responseText);
          console.log(`Model ${modelName} success!`);
          break; // 成功したら抜ける
        } catch (e: any) {
          console.error(`Model ${modelName} failed with error: ${e.message}`);
          lastError = e;
          // 404以外のエラー（APIキー無効など）はループを中断して即座に返す
          if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('403')) {
            break;
          }
          continue;
        }
      }

      if (!data) {
        console.error('All models failed. Last error:', lastError?.message);
        throw lastError || new Error('All Gemini models failed to process the request.');
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- add_campaign: キャンペーン登録 ---
    if (action === 'add_campaign') {
      const { url, title, summary, deadline, source_type } = body;
      const { data, error } = await supabaseClient
        .from('campaigns')
        .insert({ user_id: user.id, url, title, summary, deadline: deadline || null, source_type })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ campaign: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- update_campaign: キャンペーン更新 ---
    if (action === 'update_campaign') {
      const { campaign_id, ...updates } = body;
      const { data, error } = await supabaseClient
        .from('campaigns')
        .update(updates)
        .eq('id', campaign_id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ campaign: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- delete_campaign: キャンペーン削除 ---
    if (action === 'delete_campaign') {
      const { campaign_id } = body;
      const { error } = await supabaseClient
        .from('campaigns')
        .delete()
        .eq('id', campaign_id)
        .eq('user_id', user.id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(`Runtime error: ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
