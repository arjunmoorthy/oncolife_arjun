import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { SeverityLevel } from '@oncolife/shared';
import { cn } from '@/lib/utils';
import {
  MOCK_PATIENTS, getTimelineForPatient, getConversationsForPatient, getCheckInsForPatient,
} from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PatientHeader } from '@/components/dashboard/PatientHeader';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SymptomTimeline } from '@/components/dashboard/SymptomTimeline';
import { SessionsTable } from '@/components/dashboard/SessionsTable';
import { PatientProfileModal } from '@/components/patients/PatientProfileModal';

const ALL_SYMPTOMS = ['Cough', 'Pain', 'Vomiting', 'Constipation', 'Temperature'];

const severityColors: Record<string, string> = {
  [SeverityLevel.SEVERE]: 'border-l-red-500 bg-red-50',
  [SeverityLevel.MODERATE]: 'border-l-orange-500 bg-orange-50',
  [SeverityLevel.MILD]: 'border-l-green-500 bg-green-50',
};

export function PatientDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = MOCK_PATIENTS.find((p) => p.id === id);

  const [startDate, setStartDate] = useState('2026-02-14');
  const [endDate, setEndDate] = useState('2026-02-20');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-muted-foreground">Patient not found</p>
        <Button variant="link" onClick={() => navigate('/patients')} className="mt-2">
          Back to Patients
        </Button>
      </div>
    );
  }

  const timeline = getTimelineForPatient(patient.id);
  const conversations = getConversationsForPatient(patient.id);
  const checkIns = getCheckInsForPatient(patient.id);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Patients
      </Button>

      <PatientHeader patient={patient} onViewProfile={() => setProfileOpen(true)} />

      {/* Chart area with filter sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <FilterPanel
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          symptoms={ALL_SYMPTOMS}
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={toggleSymptom}
        />
        <div className="space-y-6">
          <SymptomTimeline data={timeline} selectedSymptoms={selectedSymptoms} />
          <SessionsTable sessions={conversations} />
        </div>
      </div>

      <Separator />

      {/* Tabbed detail view */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat">Chat History</TabsTrigger>
          <TabsTrigger value="checkins">Daily Check-ins</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <Card key={conv.id} className="shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <button
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => setExpandedConv(expandedConv === conv.id ? null : conv.id)}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{conv.date} — {conv.symptoms.join(', ')}</p>
                        <p className="text-xs text-muted-foreground">{conv.messages.length} messages</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">{conv.severity}</Badge>
                  </button>
                  {expandedConv === conv.id && (
                    <div className="mt-4 space-y-2 border-t pt-3">
                      {conv.messages.map((msg, i) => (
                        <div key={i} className={cn('rounded-lg p-3 text-sm', msg.role === 'bot' ? 'bg-muted' : 'bg-primary/5')}>
                          <span className="font-medium text-xs">{msg.role === 'bot' ? 'OncoLife Bot' : 'Patient'}:</span>
                          <p className="mt-0.5">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="checkins" className="mt-4 space-y-3">
          {checkIns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No check-ins yet</div>
          ) : (
            checkIns.map((ci) => (
              <Card key={ci.id} className={cn('shadow-sm rounded-xl border-l-4', severityColors[ci.severity] || '')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{ci.date}</p>
                      <p className="mt-1 text-sm">{ci.summaryText}</p>
                      {ci.patientQuote && (
                        <p className="mt-2 text-xs italic text-muted-foreground">"{ci.patientQuote}"</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0 ml-4">{ci.severity}</Badge>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {ci.symptoms.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card className="shadow-sm rounded-xl">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
                <InfoField label="MRN" value={patient.mrn} />
                <InfoField label="Date of Birth" value={patient.dateOfBirth} />
                <InfoField label="Phone" value={patient.phone} />
                <InfoField label="Email" value={patient.email} />
                <InfoField label="Cancer Type" value={patient.cancerType} />
                <InfoField label="Treatment Plan" value={patient.planName} />
                <InfoField label="Chemo Start" value={patient.chemoStartDate} />
                <InfoField label="Chemo End" value={patient.chemoEndDate} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PatientProfileModal patient={patient} open={profileOpen} onOpenChange={setProfileOpen} />
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
