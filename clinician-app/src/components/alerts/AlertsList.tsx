import { TriageLevel } from '@oncolife/shared';
import type { MockAlert } from '@/lib/mockData';
import { AlertCard } from './AlertCard';

interface AlertsListProps {
  alerts: MockAlert[];
  onAcknowledge: (id: string) => void;
}

const severityOrder: Record<string, number> = {
  [TriageLevel.CALL_911]: 0,
  [TriageLevel.URGENT]: 1,
  [TriageLevel.NOTIFY_CARE_TEAM]: 2,
  [TriageLevel.NONE]: 3,
};

export function AlertsList({ alerts, onAcknowledge }: AlertsListProps) {
  const sorted = [...alerts].sort(
    (a, b) => (severityOrder[a.triageLevel] ?? 4) - (severityOrder[b.triageLevel] ?? 4),
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No alerts</p>
        <p className="mt-1 text-sm text-muted-foreground">All caught up! No active alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
      ))}
    </div>
  );
}

