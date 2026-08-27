// app/error.tsx - Error Boundary
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27] px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#EF4444]/20 to-[#7C3AED]/20 text-5xl text-[#EF4444]">
          ⚠️
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Что-то пошло не так</h1>
          <p className="mt-2 text-[#A0AEC0]">Мы уже получили информацию об этой ошибке.</p>
        </div>
        {error.digest && (
          <div className="rounded-lg bg-white/5 p-4 font-mono text-xs text-[#718096]">
            Error ID: {error.digest}
          </div>
        )}
        <button
          onClick={reset}
          className="rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-[#00D4FF]/20 transition-transform hover:scale-105 active:scale-95"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
