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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // JWT認証
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action } = body;

    // --- summarize_url: URLをGeminiで要約 ---
    if (action === 'summarize_url') {
      const { url } = body as { url: string };

      // URLのコンテンツを取得
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      const html = await res.text();
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 20000);

      // Gemini で要約
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `
以下のWebページの内容から、キャンペーン情報を抽出してください。
JSONのみを返し、コードブロックや説明文は不要です。

{
  "title": "キャンペーン名（簡潔に）",
  "summary": "キャンペーン内容の要約（2〜4文）",
  "deadline": "締め切り日（YYYY-MM-DD形式、不明な場合はnull）",
  "source_type": "sns（X/Instagram等）/ official（企業サイト）/ other"
}

ページ内容:
${text}
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().replace(/```json\n|\n```|```/g, '').trim();
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }
      const data = JSON.parse(responseText);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- add_campaign: キャンペーン登録 ---
    if (action === 'add_campaign') {
      const { url, title, summary, deadline, source_type } = body;
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { error } = await supabase
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
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
