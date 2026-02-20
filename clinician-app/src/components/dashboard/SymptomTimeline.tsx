import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MockTimelinePoint } from '@/lib/mockData';

interface SymptomTimelineProps {
  data: MockTimelinePoint[];
  selectedSymptoms: string[];
}

const SYMPTOM_LINES: { key: keyof MockTimelinePoint; name: string; color: string }[] = [
  { key: 'cough', name: 'Cough', color: '#EA580C' },
  { key: 'pain', name: 'Pain', color: '#16A34A' },
  { key: 'vomiting', name: 'Vomiting', color: '#0EA5E9' },
  { key: 'constipation', name: 'Constipation', color: '#1E40AF' },
];

const severityLabels: Record<number, string> = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
  4: 'Very Severe',
};

export function SymptomTimeline({ data, selectedSymptoms }: SymptomTimelineProps) {
  const visibleLines = SYMPTOM_LINES.filter(
    (l) => selectedSymptoms.length === 0 || selectedSymptoms.includes(l.name),
  );
  const showTemp = selectedSymptoms.length === 0 || selectedSymptoms.includes('Temperature');

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Symptom Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="severity"
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              tickFormatter={(v: number) => severityLabels[v] || ''}
              tick={{ fontSize: 11 }}
              width={80}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              domain={[96, 104]}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${v}°F`}
              width={50}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value);
                if (name === 'Temperature') return [`${v.toFixed(1)}°F`, name];
                return [severityLabels[v] || v, name];
              }}
            />
            <Legend />
            {visibleLines.map((line) => (
              <Line
                key={line.key}
                yAxisId="severity"
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
            {showTemp && (
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#DC2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

