import { useState } from 'react';
import { MessageType } from '@oncolife/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuestionOption {
  label: string;
  value: string;
}

interface QuestionRendererProps {
  messageType: MessageType;
  options?: QuestionOption[];
  onAnswer: (answer: string) => void;
}

export function QuestionRenderer({
  messageType,
  options = [],
  onAnswer,
}: QuestionRendererProps) {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

  switch (messageType) {
    case MessageType.OPTION_SELECT:
      return (
        <div className="animate-fadeIn flex flex-wrap gap-2">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              onClick={() => onAnswer(opt.value)}
              className="transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      );

    case MessageType.MULTI_SELECT:
      return (
        <div className="animate-fadeIn space-y-3">
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setMultiSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(opt.value)) next.delete(opt.value);
                    else next.add(opt.value);
                    return next;
                  });
                }}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200',
                  multiSelected.has(opt.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-primary/30',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {multiSelected.size > 0 && (
            <Button
              size="sm"
              onClick={() => onAnswer(Array.from(multiSelected).join(','))}
            >
              Confirm ({multiSelected.size})
            </Button>
          )}
        </div>
      );

    case MessageType.NUMBER_INPUT:
      return (
        <div className="animate-fadeIn flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Enter a number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            className="w-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && numberValue) onAnswer(numberValue);
            }}
          />
          <Button
            size="sm"
            disabled={!numberValue}
            onClick={() => onAnswer(numberValue)}
          >
            Submit
          </Button>
        </div>
      );

    case MessageType.DATE_PICK:
      return (
        <div className="animate-fadeIn flex items-center gap-2">
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-44"
          />
          <Button
            size="sm"
            disabled={!dateValue}
            onClick={() => onAnswer(dateValue)}
          >
            Submit
          </Button>
        </div>
      );

    case MessageType.TEXT:
    default:
      return (
        <div className="animate-fadeIn flex gap-2">
          <Textarea
            placeholder="Type your response..."
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && textValue.trim()) {
                e.preventDefault();
                onAnswer(textValue.trim());
              }
            }}
          />
          <Button
            size="sm"
            disabled={!textValue.trim()}
            onClick={() => {
              if (textValue.trim()) onAnswer(textValue.trim());
            }}
            className="self-end"
          >
            Send
          </Button>
        </div>
      );
  }
}

