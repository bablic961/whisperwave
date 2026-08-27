// app/not-found.tsx - 404 Page
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27] px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#7C3AED]/20 text-6xl text-[#F59E0B]">
          🌊
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">404</h1>
          <p className="mt-2 text-[#A0AEC0]">Волна ушла, но контент не найден</p>
        </div>
        <p className="text-[#718096]">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-[#00D4FF]/20 transition-transform hover:scale-105 active:scale-95"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
