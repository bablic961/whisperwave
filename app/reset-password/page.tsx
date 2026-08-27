// app/reset-password/page.tsx - Reset password page
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка сброса пароля');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1F3D] p-8 shadow-2xl">
        {!success ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-white">Новый пароль</h2>
            <p className="mb-6 text-[#A0AEC0]">Введите новый пароль для вашего аккаунта.</p>

            {error && (
              <div className="mb-4 rounded-lg bg-[#EF4444]/20 p-3 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Новый пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Подтверждение пароля</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-8 py-3 font-semibold text-white shadow-lg shadow-[#00D4FF]/30 transition-all hover:shadow-[#00D4FF]/50 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Сброс...' : 'Сбросить пароль'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/20 text-4xl text-[#10B981]">
              ✓
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">Пароль успешно изменен!</h2>
            <p className="text-[#A0AEC0]">Перенаправление на страницу входа...</p>
          </div>
        )}
      </div>
    </div>
  );
}
