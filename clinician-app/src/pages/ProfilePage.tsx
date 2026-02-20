import { useState } from 'react';
import { Plus } from 'lucide-react';
import { UserRole } from '@oncolife/shared';
import { MOCK_CLINICIANS } from '@/lib/mockData';
import type { MockClinician } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffModal } from '@/components/staff/StaffModal';

export function ProfilePage() {
  const [staff, setStaff] = useState<MockClinician[]>(MOCK_CLINICIANS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<MockClinician | null>(null);

  // Current user is the first clinician (Dr. Sarah Chen)
  const currentUser = staff[0];
  const providers = staff.filter((s) => s.role === UserRole.PROVIDER);

  const handleEdit = (member: MockClinician) => {
    setEditingStaff(member);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const } : s,
      ),
    );
  };

  const handleSave = (data: {
    firstName: string; lastName: string; email: string;
    phone: string; role: UserRole; assignedProviderIds: string[];
  }) => {
    if (editingStaff) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id ? { ...s, ...data } : s,
        ),
      );
    } else {
      const newMember: MockClinician = {
        id: `c${String(staff.length + 1).padStart(3, '0')}`,
        userId: `u-c${String(staff.length + 1).padStart(3, '0')}`,
        clinic: currentUser.clinic,
        address: currentUser.address,
        faxNumber: '',
        status: 'active',
        ...data,
      };
      setStaff([...staff, newMember]);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Profile</h1>

      {/* Personal Information */}
      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Full Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
            <InfoField label="Email" value={currentUser.email} />
            <InfoField label="Phone" value={currentUser.phone} />
            <InfoField label="Role" value={currentUser.role} />
            <InfoField label="Clinic" value={currentUser.clinic} />
            <InfoField label="Address" value={currentUser.address} />
            <InfoField label="Fax Number" value={currentUser.faxNumber} />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Staff Management */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#0F172A]">Staff Management</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardContent className="p-0">
          <StaffTable staff={staff} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
        </CardContent>
      </Card>

      <StaffModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        staff={editingStaff}
        providers={providers}
        onSave={handleSave}
      />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

