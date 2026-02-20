import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { UserRole } from '@oncolife/shared';
import type { MockClinician } from '@/lib/mockData';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffModal } from '@/components/staff/StaffModal';

function toMockClinician(c: any): MockClinician {
  return {
    id: c.id,
    userId: c.userId,
    firstName: c.user?.firstName ?? '',
    lastName: c.user?.lastName ?? '',
    email: c.user?.email ?? '',
    phone: c.user?.phone ?? '',
    role: (c.user?.role ?? UserRole.PROVIDER) as UserRole,
    clinic: c.clinic ?? '',
    address: c.address ?? '',
    faxNumber: c.faxNumber ?? '',
    status: 'active',
    assignedProviderIds: c.assignedProviderIds ?? [],
  };
}

export function ProfilePage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<MockClinician[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<MockClinician | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      api.get<any[]>('/staff').then((data) => setStaff(data.map(toMockClinician))).catch(() => {});
    } else {
      // Non-admin: show current user info as the only staff member
      if (user) {
        setStaff([{
          id: '',
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: '',
          role: user.role as UserRole,
          clinic: '',
          address: '',
          faxNumber: '',
          status: 'active',
          assignedProviderIds: [],
        }]);
      }
    }
  }, [isAdmin, user]);

  const currentUser = staff.length > 0
    ? staff.find((s) => s.userId === user?.id) ?? staff[0]
    : { id: '', userId: '', firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: '', role: (user?.role ?? 'PROVIDER') as UserRole, clinic: '', address: '', faxNumber: '', status: 'active' as const, assignedProviderIds: [] as string[] };

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

  const handleSave = async (data: {
    firstName: string; lastName: string; email: string;
    phone: string; role: UserRole; assignedProviderIds: string[];
  }) => {
    if (editingStaff) {
      try {
        await api.patch(`/staff/${editingStaff.id}`, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });
        setStaff((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id ? { ...s, ...data } : s,
          ),
        );
      } catch (err) {
        console.error('Failed to update staff:', err);
      }
    } else {
      try {
        const created = await api.post<any>('/staff', {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: 'TempPass123!',
          role: data.role,
          phone: data.phone,
        });
        setStaff((prev) => [...prev, toMockClinician(created)]);
      } catch (err) {
        console.error('Failed to add staff:', err);
      }
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

      {isAdmin && (
        <>
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
        </>
      )}
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

