import { useState, useEffect } from 'react';
import { UserRole } from '@oncolife/shared';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { MockClinician } from '@/lib/mockData';

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: MockClinician | null;
  providers: MockClinician[];
  onSave: (data: {
    firstName: string; lastName: string; email: string;
    phone: string; role: UserRole; assignedProviderIds: string[];
  }) => void;
}

export function StaffModal({ open, onOpenChange, staff, providers, onSave }: StaffModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.NAVIGATOR);
  const [assignedProviderIds, setAssignedProviderIds] = useState<string[]>([]);

  useEffect(() => {
    if (staff) {
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setEmail(staff.email);
      setPhone(staff.phone);
      setRole(staff.role);
      setAssignedProviderIds(staff.assignedProviderIds);
    } else {
      setFirstName(''); setLastName(''); setEmail('');
      setPhone(''); setRole(UserRole.NAVIGATOR); setAssignedProviderIds([]);
    }
  }, [staff, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    onSave({ firstName, lastName, email, phone, role, assignedProviderIds });
    onOpenChange(false);
  };

  const toggleProvider = (id: string) => {
    setAssignedProviderIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const isEdit = !!staff;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-first">First Name</Label>
              <Input id="staff-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-last">Last Name</Label>
              <Input id="staff-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email</Label>
            <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-phone">Phone</Label>
            <Input id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.PROVIDER}>Provider</SelectItem>
                <SelectItem value={UserRole.NAVIGATOR}>Navigator</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === UserRole.NAVIGATOR && providers.length > 0 && (
            <div className="space-y-2">
              <Label>Assigned Providers</Label>
              <div className="space-y-1.5 rounded-md border p-3">
                {providers.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={assignedProviderIds.includes(p.id)}
                      onChange={() => toggleProvider(p.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Dr. {p.firstName} {p.lastName}
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Add Staff'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

