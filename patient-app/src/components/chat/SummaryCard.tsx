import { useState } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SummaryCardProps {
  summaryText: string;
  recommendations: string[];
  onSubmit: (patientNotes: string) => void;
  onViewEducation?: () => void;
}

export function SummaryCard({
  summaryText,
  recommendations,
  onSubmit,
  onViewEducation,
}: SummaryCardProps) {
  const [patientNotes, setPatientNotes] = useState('');

  return (
    <div className="animate-fadeIn space-y-4">
      <Card className="shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Conversation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-[#0F172A]">{summaryText}</p>

          {recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Recommendations
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {rec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A]">
              Anything you'd like to add? (optional)
            </label>
            <Textarea
              placeholder="Add your own notes or context..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => onSubmit(patientNotes)}
            className="w-full sm:w-auto"
          >
            Submit Summary ✨
          </Button>
          {onViewEducation && (
            <Button
              variant="outline"
              onClick={onViewEducation}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View Resources
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

