import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import {
  SYMPTOM_DEFINITIONS,
  SYMPTOM_CATEGORIES,
  type SymptomDefinition,
} from '@oncolife/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SymptomSelectorProps {
  onSubmit: (selectedIds: string[]) => void;
}

const visibleCategories = [
  SYMPTOM_CATEGORIES.DIGESTIVE,
  SYMPTOM_CATEGORIES.PAIN_NERVE,
  SYMPTOM_CATEGORIES.SYSTEMIC,
  SYMPTOM_CATEGORIES.SKIN_EXTERNAL,
] as const;

const symptomsByCategory = visibleCategories.map((cat) => ({
  category: cat,
  symptoms: SYMPTOM_DEFINITIONS.filter((s) => s.category === cat),
}));

export function SymptomSelector({ onSubmit }: SymptomSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(visibleCategories),
  );

  const toggleSymptom = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <p className="text-sm font-medium text-[#0F172A]">
        What symptoms are you experiencing? Select all that apply.
      </p>

      <div className="space-y-3">
        {symptomsByCategory.map(({ category, symptoms }) => (
          <div key={category} className="rounded-lg border border-[#E2E8F0] bg-white">
            <button
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0F172A] transition-all duration-200 hover:bg-[#F8FAFC]"
            >
              <span>{category}</span>
              {expanded.has(category) ? (
                <ChevronUp className="h-4 w-4 text-[#64748B]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#64748B]" />
              )}
            </button>

            {expanded.has(category) && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {symptoms.map((sym) => (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      selected.has(sym.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-primary/30 hover:text-[#0F172A]',
                    )}
                  >
                    {sym.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <Button
          onClick={() => onSubmit(Array.from(selected))}
          className="w-full"
        >
          Continue with {selected.size} symptom{selected.size > 1 ? 's' : ''}{' '}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

