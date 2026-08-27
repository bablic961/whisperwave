// app/page.tsx - Landing Page
import Link from 'next/link';
import { WaveBackground } from '@/components/shared/WaveBackground';
import { AnimatedLogo } from '@/components/shared/AnimatedLogo';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0E27]">
      <WaveBackground />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <AnimatedLogo className="h-10 w-10" />
          <span className="text-2xl font-bold text-white">WhisperWave</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-white/80 hover:text-white transition-colors">
            Вход
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-6 py-2 text-sm font-medium text-white shadow-lg shadow-[#00D4FF]/20 transition-transform hover:scale-105 active:scale-95"
          >
            Начать
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-8">
          <div className="animate-fade-in-up space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
              Волны общения <br />
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent">
                Защищенные как океан
              </span>
            </h1>
            <p className="text-lg text-[#A0AEC0] md:text-xl max-w-2xl mx-auto">
              WhisperWave — это мессенджер с философией &ldquo;цифрового океана&rdquo;.
              Каждое сообщение — это волна, достигающая собеседника с мгновенной доставкой.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 animate-fade-in-up animation-delay-200 md:flex-row md:space-x-4 md:space-y-0">
            <Link
              href="/register"
              className="w-full md:w-auto rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-[#00D4FF]/30 transition-all hover:shadow-[#00D4FF]/50 hover:scale-105 active:scale-95"
            >
              Создать аккаунт
            </Link>
            <Link
              href="/about"
              className="w-full md:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
            >
              Узнать больше
            </Link>
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-8 md:grid-cols-3 animate-fade-in-up animation-delay-400">
          <FeatureCard
            title="Энд-кенд шифрование"
            description="Каждое сообщение зашифровано и доступно только вам и вашему собеседнику"
            icon="🔒"
          />
          <FeatureCard
            title="Мгновенная доставка"
            description="Задержка менее 100мс для любых сообщений по всему миру"
            icon="⚡"
          />
          <FeatureCard
            title="Кроссплатформенность"
            description="Работает в браузере и как PWA на любых устройствах"
            icon="📱"
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12 md:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Продукт</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/features">Функции</Link></li>
                <li><Link href="/pricing">Тарифы</Link></li>
                <li><Link href="/download">Приложения</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Ресурсы</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/blog">Блог</Link></li>
                <li><Link href="/help">Помощь</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Компания</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/about">О нас</Link></li>
                <li><Link href="/careers">Вакансии</Link></li>
                <li><Link href="/legal">Правовая информация</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Социальные сети</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="#">Twitter</Link></li>
                <li><Link href="#">GitHub</Link></li>
                <li><Link href="#">Discord</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
            <p className="text-sm text-white/40">© 2024 WhisperWave. Все права защищены.</p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-sm text-white/40 hover:text-white">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#00D4FF]/30 hover:bg-white/10">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 text-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}
