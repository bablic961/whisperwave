// app/forgot-password/page.tsx - Forgot password page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка');
        return;
      }

      setSuccess(true);
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
            <h2 className="mb-6 text-2xl font-bold text-white">Забыли пароль?</h2>
            <p className="mb-6 text-[#A0AEC0]">
              Введите ваш email и мы отправим инструкции по восстановлению пароля.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-[#EF4444]/20 p-3 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
                  required
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Отправить инструкции
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[#A0AEC0]">
              <Link href="/login" className="font-medium text-[#00D4FF] hover:text-[#7C3AED]">
                Вернуться к входу
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/20 text-4xl text-[#10B981]">
              ✓
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">Инструкции отправлены!</h2>
            <p className="mb-6 text-[#A0AEC0]">
              Мы отправили письмо на {email}. Проверьте почту для восстановления пароля.
            </p>
            <Link href="/login" className="font-medium text-[#00D4FF] hover:text-[#7C3AED]">
              Вернуться к входу
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
