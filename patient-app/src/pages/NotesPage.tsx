import { useState, useEffect } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface DiaryEntry {
  id: string;
  patientId: string;
  content: string;
  forDoctor: boolean;
  createdAt: string;
}

export function NotesPage() {
  const { patientId } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newForDoctor, setNewForDoctor] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoadingData(true);
    api.get<DiaryEntry[]>(`/patients/${patientId}/diary`)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [patientId]);

  const handleCreate = async () => {
    if (!newContent.trim() || !patientId) return;
    try {
      const entry = await api.post<DiaryEntry>(`/patients/${patientId}/diary`, {
        content: newContent.trim(),
        forDoctor: newForDoctor,
      });
      setEntries([entry, ...entries]);
    } catch {
      // silently fail
    }
    setNewContent('');
    setNewForDoctor(false);
    setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">Your Diary</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              A private space to reflect on your journey.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {loadingData ? (
            <div className="py-16 text-center">
              <p className="text-[#64748B]">Loading diary entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#64748B]">No diary entries yet. Start writing!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="shadow-sm rounded-xl transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0F172A]">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {entry.forDoctor && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs">
                            <Stethoscope className="mr-1 h-3 w-3" />
                            For Doctor
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-[#0F172A]">
                        {entry.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* New Entry Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Diary Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="How are you feeling today?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[120px]"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newForDoctor}
                  onChange={(e) => setNewForDoctor(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-primary focus:ring-primary"
                />
                <Stethoscope className="h-4 w-4 text-[#64748B]" />
                Share with my doctor
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newContent.trim()}>
                Save Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

