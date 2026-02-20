import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { TriageLevel } from '@oncolife/shared';
import { cn } from '@/lib/utils';
import type { MockPatient } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PatientTableProps {
  patients: MockPatient[];
}

type SortKey = 'name' | 'diagnosis' | 'lastChatbot' | 'lastChemo' | 'severity';
type SortDir = 'asc' | 'desc';

const severityOrder: Record<string, number> = {
  [TriageLevel.CALL_911]: 0,
  [TriageLevel.URGENT]: 1,
  [TriageLevel.NOTIFY_CARE_TEAM]: 2,
  [TriageLevel.NONE]: 3,
};

const severityConfig: Record<string, { label: string; className: string }> = {
  [TriageLevel.CALL_911]: { label: 'Call 911', className: 'bg-red-100 text-red-700 border-red-200' },
  [TriageLevel.URGENT]: { label: 'Urgent', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  [TriageLevel.NOTIFY_CARE_TEAM]: { label: 'Notify', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  [TriageLevel.NONE]: { label: 'None', className: 'bg-green-100 text-green-700 border-green-200' },
};

export function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('severity');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...patients].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name':
        cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        break;
      case 'diagnosis':
        cmp = a.cancerType.localeCompare(b.cancerType);
        break;
      case 'lastChatbot':
        cmp = a.lastChatbot.localeCompare(b.lastChatbot);
        break;
      case 'lastChemo':
        cmp = a.lastChemo.localeCompare(b.lastChemo);
        break;
      case 'severity':
        cmp = (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortHeader = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <button
      className="flex items-center gap-1 font-medium hover:text-foreground"
      onClick={() => handleSort(sKey)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No patients found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortHeader label="Patient" sKey="name" /></TableHead>
          <TableHead><SortHeader label="Diagnosis" sKey="diagnosis" /></TableHead>
          <TableHead><SortHeader label="Last Chatbot" sKey="lastChatbot" /></TableHead>
          <TableHead><SortHeader label="Last Chemo" sKey="lastChemo" /></TableHead>
          <TableHead><SortHeader label="Severity" sKey="severity" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((patient) => {
          const sev = severityConfig[patient.severity] || severityConfig[TriageLevel.NONE];
          return (
            <TableRow
              key={patient.id}
              className="cursor-pointer"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{patient.cancerType}</TableCell>
              <TableCell className="text-sm">{patient.lastChatbot}</TableCell>
              <TableCell className="text-sm">{patient.lastChemo}</TableCell>
              <TableCell>
                <Badge className={cn('border', sev.className)} variant="outline">
                  {sev.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

