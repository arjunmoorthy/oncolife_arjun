import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { MockPatient } from '@/lib/mockData';

interface PatientProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: MockPatient | null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export function PatientProfileModal({ open, onOpenChange, patient }: PatientProfileModalProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{patient.firstName} {patient.lastName}</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary">{patient.mrn}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Demographics</h4>
          <InfoRow label="Date of Birth" value={patient.dateOfBirth} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Email" value={patient.email} />
        </div>
        <Separator />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Treatment</h4>
          <InfoRow label="Cancer Type" value={patient.cancerType} />
          <InfoRow label="Plan Name" value={patient.planName} />
          <InfoRow label="Chemo Start" value={patient.chemoStartDate} />
          <InfoRow label="Chemo End" value={patient.chemoEndDate} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

