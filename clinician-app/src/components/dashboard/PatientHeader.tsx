import { UserCircle, RefreshCw, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MockPatient } from '@/lib/mockData';

interface PatientHeaderProps {
  patient: MockPatient;
  onViewProfile: () => void;
}

export function PatientHeader({ patient, onViewProfile }: PatientHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{patient.mrn}</Badge>
            <span className="text-sm text-muted-foreground">{patient.cancerType}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onViewProfile}>
          <UserCircle className="mr-2 h-4 w-4" />
          Patient Profile
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Dashboard
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Send Fax
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
}

