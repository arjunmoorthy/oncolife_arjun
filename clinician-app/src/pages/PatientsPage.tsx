import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { TriageLevel } from '@oncolife/shared';
import { MOCK_PATIENTS, MOCK_ALERTS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StatCards } from '@/components/patients/StatCards';
import { PatientTable } from '@/components/patients/PatientTable';
import { AddPatientModal } from '@/components/patients/AddPatientModal';

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [checkinFilter, setCheckinFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [patients, setPatients] = useState(MOCK_PATIENTS);

  const todayAlerts = MOCK_ALERTS.filter((a) => {
    const d = new Date(a.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString() && !a.acknowledged;
  });

  const filteredPatients = useMemo(() => {
    let result = patients;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.cancerType.toLowerCase().includes(q),
      );
    }

    if (severityFilter !== 'all') {
      result = result.filter((p) => p.severity === severityFilter);
    }

    if (checkinFilter !== 'all') {
      const now = new Date();
      result = result.filter((p) => {
        const last = new Date(p.lastChatbot);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (checkinFilter === '1') return diffDays <= 1;
        if (checkinFilter === '3') return diffDays <= 3;
        if (checkinFilter === '7') return diffDays <= 7;
        return true;
      });
    }

    return result;
  }, [patients, search, severityFilter, checkinFilter]);

  const handleAddPatient = (data: {
    firstName: string; lastName: string; dob: string;
    mrn: string; providerId: string; navigatorId?: string;
  }) => {
    const newPatient = {
      id: `P${String(patients.length + 1).padStart(3, '0')}`,
      userId: `u-p${String(patients.length + 1).padStart(3, '0')}`,
      firstName: data.firstName,
      lastName: data.lastName,
      mrn: data.mrn,
      dateOfBirth: data.dob,
      cancerType: 'Not Specified',
      planName: '',
      chemoStartDate: '',
      chemoEndDate: '',
      phone: '',
      email: '',
      lastChatbot: 'Never',
      lastChemo: 'N/A',
      severity: TriageLevel.NONE,
      providerId: data.providerId,
      navigatorId: data.navigatorId,
    };
    setPatients([...patients, newPatient]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">Patients</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <StatCards
        totalPatients={patients.length}
        alertsToday={todayAlerts.length}
        pendingReviews={2}
      />

      {/* Search & Filters */}
      <Card className="shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Name, ID, or diagnosis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value={TriageLevel.CALL_911}>Call 911</SelectItem>
                <SelectItem value={TriageLevel.URGENT}>Urgent</SelectItem>
                <SelectItem value={TriageLevel.NOTIFY_CARE_TEAM}>Notify</SelectItem>
                <SelectItem value={TriageLevel.NONE}>None</SelectItem>
              </SelectContent>
            </Select>
            <Select value={checkinFilter} onValueChange={setCheckinFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Last Check-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Check-ins</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="3">Last 3 days</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card className="shadow-sm rounded-xl">
        <CardContent className="p-0">
          <PatientTable patients={filteredPatients} />
        </CardContent>
      </Card>

      <AddPatientModal open={addOpen} onOpenChange={setAddOpen} onAdd={handleAddPatient} />
    </div>
  );
}

