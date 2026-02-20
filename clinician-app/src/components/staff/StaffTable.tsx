import { UserRole } from '@oncolife/shared';
import { cn } from '@/lib/utils';
import { Edit, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MockClinician } from '@/lib/mockData';

interface StaffTableProps {
  staff: MockClinician[];
  onEdit: (clinician: MockClinician) => void;
  onToggleStatus: (id: string) => void;
}

const roleLabels: Record<string, { label: string; className: string }> = {
  [UserRole.PROVIDER]: { label: 'Provider', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  [UserRole.NAVIGATOR]: { label: 'Navigator', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  [UserRole.ADMIN]: { label: 'Admin', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function StaffTable({ staff, onEdit, onToggleStatus }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No staff members found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => {
          const role = roleLabels[member.role] || { label: member.role, className: '' };
          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.firstName} {member.lastName}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {member.email}
              </TableCell>
              <TableCell>
                <Badge className={cn('border', role.className)} variant="outline">
                  {role.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(member.id)}>
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

