// app/loading.tsx - Loading UI
import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#00D4FF]/30 border-t-[#00D4FF]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-[#7C3AED]/30 border-b-[#7C3AED] animate-spin-reverse"></div>
        </div>
        <p className="text-[#A0AEC0] animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
}
