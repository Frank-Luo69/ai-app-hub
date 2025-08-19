'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // 邮件里的链接仍然可用；用户点开也能登录
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    setLoading(false);
    if (error) setMsg(error.message);
    else setCodeSent(true);
  }

  async function verify() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email', // 验证邮箱验证码
    });
    setLoading(false);
    if (error) setMsg(error.message);
    else window.location.href = '/';
  }

  return (
    <div className="max-w-md mx-auto card space-y-3">
      <h1 className="text-xl font-semibold">登录</h1>

      <input
        type="email"
        placeholder="邮箱"
        className="w-full border rounded-xl px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {codeSent ? (
        <>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="输入 6 位验证码"
            className="w-full border rounded-xl px-3 py-2 tracking-widest text-center"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn-primary px-4 py-2 rounded-xl"
                  onClick={verify}
                  disabled={loading || code.length < 6}>
            验证并登录
          </button>
          <button className="btn" onClick={sendCode} disabled={loading}>重发验证码</button>
        </>
      ) : (
        <>
          <button className="btn-primary px-4 py-2 rounded-xl"
                  onClick={sendCode}
                  disabled={loading || !email}>
            发送登录验证码到邮箱
          </button>
          <div className="text-sm text-gray-500">
            邮件里也会附带“登录链接”；点链接在哪个设备打开，就会在哪个设备登录。
          </div>
        </>
      )}

      {msg && <div className="text-sm text-red-600">{msg}</div>}
    </div>
  );
}
