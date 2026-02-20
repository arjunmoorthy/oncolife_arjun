import { TriageLevel } from '@oncolife/shared';
import { cn } from '@/lib/utils';
import { AlertTriangle, Phone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MockAlert } from '@/lib/mockData';

interface AlertCardProps {
  alert: MockAlert;
  onAcknowledge: (id: string) => void;
}

const alertStyles: Record<string, { bg: string; border: string; icon: typeof AlertTriangle; badgeClass: string; label: string }> = {
  [TriageLevel.CALL_911]: {
    bg: 'bg-red-50',
    border: 'animate-pulse border-2 border-red-500',
    icon: Phone,
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    label: 'Call 911',
  },
  [TriageLevel.URGENT]: {
    bg: 'bg-orange-50',
    border: 'border border-orange-300',
    icon: AlertTriangle,
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Urgent',
  },
  [TriageLevel.NOTIFY_CARE_TEAM]: {
    bg: 'bg-amber-50',
    border: 'border border-amber-300',
    icon: Bell,
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Notify Care Team',
  },
  [TriageLevel.NONE]: {
    bg: 'bg-green-50',
    border: 'border border-green-300',
    icon: Bell,
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    label: 'None',
  },
};

export function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const style = alertStyles[alert.triageLevel] || alertStyles[TriageLevel.NONE];
  const Icon = style.icon;
  const time = new Date(alert.createdAt).toLocaleString();

  return (
    <div className={cn('rounded-xl p-4', style.bg, style.border)}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{alert.patientName}</p>
              <Badge className={cn('border', style.badgeClass)} variant="outline">
                {style.label}
              </Badge>
            </div>
            <p className="text-sm font-medium">{alert.symptom}</p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
        </div>
        <div>
          {alert.acknowledged ? (
            <Badge variant="secondary">Acknowledged</Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

