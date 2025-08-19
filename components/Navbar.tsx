
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() { await supabase.auth.signOut(); }

  return (
    <div className="border-b bg-white sticky top-0 z-10">
      <div className="container h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Updated brand and navigation text from "Game" to "App" */}
          <Link href="/" className="font-semibold">AI Mini-App Hub</Link>
          <Link href="/submit" className="text-sm text-gray-600 hover:underline">提交应用</Link>
        </div>
        <div className="flex items-center gap-3">
          {email ? (<>
            <span className="text-sm text-gray-600">已登录：{email}</span>
            <button className="btn" onClick={signOut}>登出</button>
          </>) : (<Link className="btn" href="/auth">登录</Link>)}
        </div>
      </div>
    </div>
  );
}
