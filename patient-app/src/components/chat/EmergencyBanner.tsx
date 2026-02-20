import { Phone, AlertTriangle } from 'lucide-react';

interface EmergencyBannerProps {
  visible: boolean;
}

export function EmergencyBanner({ visible }: EmergencyBannerProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] animate-fadeIn">
      <div className="bg-red-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <h2 className="text-lg font-bold">Emergency — Call 911 Immediately</h2>
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <p className="text-sm text-red-100">
            Based on your symptoms, you may need immediate medical attention.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
            >
              <Phone className="h-4 w-4" />
              Call 911
            </a>
            <a
              href="tel:988"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
              Crisis Line: 988
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

