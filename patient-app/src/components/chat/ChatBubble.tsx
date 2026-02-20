import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  role: 'BOT' | 'PATIENT';
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isBot = role === 'BOT';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fadeIn',
        isBot ? 'justify-start' : 'justify-end',
      )}
    >
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          R
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isBot
            ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
            : 'bg-primary text-white',
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'mt-1 text-[10px]',
              isBot ? 'text-[#64748B]' : 'text-white/70',
            )}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

