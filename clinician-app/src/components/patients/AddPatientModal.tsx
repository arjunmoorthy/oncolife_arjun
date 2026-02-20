import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MOCK_CLINICIANS } from '@/lib/mockData';
import { UserRole } from '@oncolife/shared';

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    firstName: string; lastName: string; dob: string;
    mrn: string; providerId: string; navigatorId?: string;
  }) => void;
}

export function AddPatientModal({ open, onOpenChange, onAdd }: AddPatientModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [mrn, setMrn] = useState('');
  const [providerId, setProviderId] = useState('');
  const [navigatorId, setNavigatorId] = useState('');

  const providers = MOCK_CLINICIANS.filter((c) => c.role === UserRole.PROVIDER);
  const navigators = MOCK_CLINICIANS.filter((c) => c.role === UserRole.NAVIGATOR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !mrn || !providerId) return;
    onAdd({ firstName, lastName, dob, mrn, providerId, navigatorId: navigatorId || undefined });
    setFirstName('');
    setLastName('');
    setDob('');
    setMrn('');
    setProviderId('');
    setNavigatorId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>Enter patient information below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrn">MRN *</Label>
              <Input id="mrn" value={mrn} onChange={(e) => setMrn(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Provider *</Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Dr. {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Navigator (optional)</Label>
            <Select value={navigatorId} onValueChange={setNavigatorId}>
              <SelectTrigger><SelectValue placeholder="Select navigator" /></SelectTrigger>
              <SelectContent>
                {navigators.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.firstName} {n.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

