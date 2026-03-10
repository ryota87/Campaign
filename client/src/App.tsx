import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Home from './components/Home';
import type { Session } from '@supabase/supabase-js';
import './index.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <Home session={session} />;
}
