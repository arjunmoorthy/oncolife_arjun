import { TriageLevel, SeverityLevel } from '@oncolife/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MockConversation } from '@/lib/mockData';

interface SessionsTableProps {
  sessions: MockConversation[];
}

const triageConfig: Record<string, { label: string; className: string }> = {
  [TriageLevel.CALL_911]: { label: 'Call 911', className: 'bg-red-100 text-red-700 border-red-200' },
  [TriageLevel.URGENT]: { label: 'Urgent', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  [TriageLevel.NOTIFY_CARE_TEAM]: { label: 'Notify', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  [TriageLevel.NONE]: { label: 'None', className: 'bg-green-100 text-green-700 border-green-200' },
};

const severityColors: Record<string, string> = {
  [SeverityLevel.SEVERE]: 'text-red-600',
  [SeverityLevel.MODERATE]: 'text-orange-600',
  [SeverityLevel.MILD]: 'text-green-600',
};

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <Card className="shadow-sm rounded-xl">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No sessions found for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Chat Sessions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Triage Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const tc = triageConfig[s.triageLevel] || triageConfig[TriageLevel.NONE];
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.date}</TableCell>
                  <TableCell className="text-sm">{s.symptoms.join(', ')}</TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-medium', severityColors[s.severity])}>
                      {s.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border', tc.className)} variant="outline">{tc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'complete' ? 'secondary' : 'default'} className="capitalize">
                      {s.status === 'complete' ? 'Complete' : 'In Progress'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

