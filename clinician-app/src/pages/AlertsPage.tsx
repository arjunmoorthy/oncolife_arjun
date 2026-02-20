import { useState } from 'react';
import { MOCK_ALERTS } from '@/lib/mockData';
import type { MockAlert } from '@/lib/mockData';
import { AlertsList } from '@/components/alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<MockAlert[]>(MOCK_ALERTS);
  const [showAll, setShowAll] = useState(false);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, acknowledged: true, acknowledgedBy: 'c001' } : a,
      ),
    );
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

