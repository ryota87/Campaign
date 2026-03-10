import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">キャンペーン管理</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            id="password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            id="submit-btn"
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '処理中...' : isSignUp ? '新規登録' : 'ログイン'}
          </button>
        </form>

        <button
          id="toggle-mode-btn"
          onClick={() => setIsSignUp(v => !v)}
          className="mt-4 w-full text-center text-sm text-blue-500 hover:underline"
        >
          {isSignUp ? 'ログインはこちら' : '新規登録はこちら'}
        </button>
      </div>
    </div>
  );
}
