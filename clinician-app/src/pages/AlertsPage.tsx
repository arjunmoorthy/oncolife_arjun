import { useState, useEffect } from 'react';
import type { MockAlert } from '@/lib/mockData';
import { api } from '@/lib/api';
import { AlertsList } from '@/components/alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function toMockAlert(a: any): MockAlert {
  return {
    id: a.id,
    patientId: a.patientId,
    patientName: `${a.patient?.user?.firstName ?? ''} ${a.patient?.user?.lastName ?? ''}`.trim(),
    triageLevel: a.triageLevel,
    symptom: a.symptom ?? '',
    message: a.message ?? '',
    acknowledged: a.acknowledged ?? false,
    acknowledgedBy: a.acknowledgedBy,
    createdAt: a.createdAt,
  };
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<MockAlert[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get<any[]>('/alerts').then((data) => setAlerts(data.map(toMockAlert))).catch(() => {});
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/acknowledge`, {});
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, acknowledged: true } : a,
        ),
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const displayed = showAll ? alerts : alerts.filter((a) => !a.acknowledged);
  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            {unackCount} unacknowledged alert{unackCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAll ? 'ghost' : 'default'}
            size="sm"
            onClick={() => setShowAll(false)}
            className={cn(!showAll && 'pointer-events-none')}
          >
            Unacknowledged
          </Button>
          <Button
            variant={showAll ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowAll(true)}
            className={cn(showAll && 'pointer-events-none')}
          >
            All
          </Button>
        </div>
      </div>

      <AlertsList alerts={displayed} onAcknowledge={handleAcknowledge} />
    </div>
  );
}

