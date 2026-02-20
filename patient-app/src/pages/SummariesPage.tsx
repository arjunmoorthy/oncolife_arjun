import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { SeverityLevel } from '@oncolife/shared';
import { cn } from '@/lib/utils';

interface Summary {
  id: string;
  conversationId: string;
  patientId: string;
  summaryText: string;
  patientAddedNotes?: string;
  recommendations: string[];
  educationLinks: string[];
  createdAt: string;
}

const severityStyles: Record<string, string> = {
  [SeverityLevel.MILD]: 'bg-green-100 text-green-700 border-green-200',
  [SeverityLevel.MODERATE]: 'bg-amber-100 text-amber-700 border-amber-200',
  [SeverityLevel.SEVERE]: 'bg-red-100 text-red-700 border-red-200',
};

export function SummariesPage() {
  const { patientId } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoadingData(true);
    api.get<Summary[]>(`/patients/${patientId}/summaries`)
      .then(setSummaries)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [patientId]);

  const filtered = summaries.filter((s) => {
    if (search && !s.summaryText.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0F172A]">Daily Check-ins</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Review your past conversations and symptom reports
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Search summaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          {loadingData ? (
            <div className="py-16 text-center">
              <p className="text-[#64748B]">Loading summaries...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#64748B]">No summaries found.</p>
            </div>
          ) : (
            filtered.map((summary) => (
              <Card key={summary.id} className="shadow-sm rounded-xl transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#0F172A]">
                          {new Date(summary.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-[#0F172A]">
                        {summary.summaryText}
                      </p>

                      {summary.patientAddedNotes && (
                        <p className="text-sm italic text-[#64748B]">
                          &ldquo;{summary.patientAddedNotes}&rdquo;
                        </p>
                      )}

                      {Array.isArray(summary.recommendations) && summary.recommendations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(summary.recommendations as string[]).map((rec, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

