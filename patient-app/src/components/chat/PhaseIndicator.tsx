import { cn } from '@/lib/utils';
import { ConversationPhase } from '@oncolife/shared';

interface PhaseIndicatorProps {
  currentPhase: ConversationPhase;
}

const phases = [
  { phase: ConversationPhase.DISCLAIMER, label: 'Welcome' },
  { phase: ConversationPhase.EMERGENCY_CHECK, label: 'Safety' },
  { phase: ConversationPhase.SYMPTOM_SELECTION, label: 'Symptoms' },
  { phase: ConversationPhase.SCREENING, label: 'Questions' },
  { phase: ConversationPhase.SUMMARY, label: 'Summary' },
];

function getPhaseIndex(phase: ConversationPhase): number {
  if (phase === ConversationPhase.DISCLAIMER || phase === ConversationPhase.PATIENT_CONTEXT) return 0;
  if (phase === ConversationPhase.EMERGENCY_CHECK) return 1;
  if (phase === ConversationPhase.SYMPTOM_SELECTION) return 2;
  if (phase === ConversationPhase.SCREENING || phase === ConversationPhase.FOLLOW_UP || phase === ConversationPhase.BRANCHED) return 3;
  if (phase === ConversationPhase.SUMMARY || phase === ConversationPhase.ADDING_NOTES || phase === ConversationPhase.COMPLETED) return 4;
  return 0;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = getPhaseIndex(currentPhase);

  if (currentPhase === ConversationPhase.EMERGENCY) return null;

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {phases.map((p, i) => (
        <div key={p.phase} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-200',
                i <= currentIndex
                  ? 'bg-primary scale-110'
                  : 'bg-[#E2E8F0]',
              )}
            />
            <span
              className={cn(
                'mt-1 text-[10px] font-medium hidden sm:block',
                i <= currentIndex ? 'text-primary' : 'text-[#64748B]',
              )}
            >
              {p.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div
              className={cn(
                'h-[2px] w-6 sm:w-10 transition-all duration-200',
                i < currentIndex ? 'bg-primary' : 'bg-[#E2E8F0]',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

