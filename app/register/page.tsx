// app/register/page.tsx - Registration page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка регистрации');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      router.push('/chat');
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27] px-6">
      <div className="mb-8 text-center">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 animate-pulse-glow">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 50 Q35 20, 50 50 T80 50"
                stroke="url(#waveGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="20" stroke="#00D4FF" strokeWidth="2" opacity="0.5">
                <animate attributeName="r" from="20" to="40" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-3xl font-bold text-white">WhisperWave</span>
        </Link>
        <p className="mt-2 text-[#A0AEC0]">Начните свой цифровой океан</p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1F3D] p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">Регистрация</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-[#EF4444]/20 p-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Имя пользователя</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="username"
              className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Подтверждение пароля</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#A0AEC0]">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-medium text-[#00D4FF] hover:text-[#7C3AED]">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
