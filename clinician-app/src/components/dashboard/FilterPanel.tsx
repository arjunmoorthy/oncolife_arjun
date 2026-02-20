import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface FilterPanelProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  symptoms: string[];
  selectedSymptoms: string[];
  onToggleSymptom: (s: string) => void;
}

export function FilterPanel({
  startDate, endDate, onStartDateChange, onEndDateChange,
  symptoms, selectedSymptoms, onToggleSymptom,
}: FilterPanelProps) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="space-y-4 p-4">
        <h3 className="text-sm font-semibold">Filters</h3>

        <div className="space-y-2">
          <Label className="text-xs">Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Symptoms</Label>
          <div className="space-y-1.5">
            {symptoms.map((s) => (
              <label key={s} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(s)}
                  onChange={() => onToggleSymptom(s)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

