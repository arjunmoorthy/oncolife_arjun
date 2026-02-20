import { Users, AlertTriangle, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardsProps {
  totalPatients: number;
  alertsToday: number;
  pendingReviews: number;
}

export function StatCards({ totalPatients, alertsToday, pendingReviews }: StatCardsProps) {
  const stats = [
    {
      label: 'Total Patients',
      value: totalPatients,
      icon: Users,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      label: 'Alerts Today',
      value: alertsToday,
      icon: AlertTriangle,
      iconColor: alertsToday > 0 ? 'text-red-600' : 'text-muted-foreground',
      iconBg: alertsToday > 0 ? 'bg-red-50' : 'bg-muted',
      valueColor: alertsToday > 0 ? 'text-red-600' : undefined,
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews,
      icon: ClipboardList,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm rounded-xl">
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.valueColor || 'text-[#0F172A]'}`}>
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

