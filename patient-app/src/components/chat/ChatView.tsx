import { useState, useRef, useEffect, useCallback } from 'react';
import { ConversationPhase, MessageType } from '@oncolife/shared';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ChatBubble } from './ChatBubble';
import { SymptomSelector } from './SymptomSelector';
import { EmergencyCheck } from './EmergencyCheck';
import { QuestionRenderer } from './QuestionRenderer';
import { SummaryCard } from './SummaryCard';
import { EmergencyBanner } from './EmergencyBanner';
import { PhaseIndicator } from './PhaseIndicator';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessage {
  id: string;
  role: 'BOT' | 'PATIENT';
  content: string;
  messageType?: MessageType;
  options?: { label: string; value: string }[];
  timestamp: string;
}

interface EngineResponse {
  phase: ConversationPhase;
  message: string;
  messageType: MessageType;
  options?: string[];
  isComplete?: boolean;
  isEmergency?: boolean;
  summary?: {
    summaryText: string;
    recommendations: string[];
    educationLinks: string[];
  };
}

function toOptionObjects(options?: string[]): { label: string; value: string }[] | undefined {
  if (!options || options.length === 0) return undefined;
  return options.map((o) => ({ label: o, value: o }));
}

export function ChatView() {
  const { patientId } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ConversationPhase>(ConversationPhase.DISCLAIMER);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{ summaryText: string; recommendations: string[] } | null>(null);
  const [summarySubmitted, setSummarySubmitted] = useState(false);
  const startedRef = useRef(false);

  const addBotFromEngine = useCallback((er: EngineResponse) => {
    setPhase(er.phase);
    if (er.isEmergency) setIsEmergency(true);
    if (er.summary) setSummaryData({ summaryText: er.summary.summaryText, recommendations: er.summary.recommendations });
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        role: 'BOT',
        content: er.message,
        messageType: er.messageType,
        options: toOptionObjects(er.options),
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Start conversation on mount
  useEffect(() => {
    if (!patientId || startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      setLoading(true);
      try {
        const res = await api.post<{
          id: string;
          phase: ConversationPhase;
          engineResponse: EngineResponse;
        }>('/conversations', { patientId });
        setConversationId(res.id);
        addBotFromEngine(res.engineResponse);
      } catch {
        setMessages([{
          id: 'error',
          role: 'BOT',
          content: 'Sorry, I couldn\'t start a conversation. Please try refreshing the page.',
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [patientId, addBotFromEngine]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, phase]);

  const sendResponse = async (content: string, selectedOption?: string) => {
    if (!conversationId) return;
    // Add patient message
    setMessages((prev) => [
      ...prev,
      { id: `patient-${Date.now()}`, role: 'PATIENT', content, timestamp: new Date().toISOString() },
    ]);
    setLoading(true);
    try {
      const er = await api.post<EngineResponse>(`/conversations/${conversationId}/respond`, {
        content,
        selectedOption,
      });
      addBotFromEngine(er);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'BOT', content: 'Something went wrong. Please try again.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySelect = (symptomId: string) => {
    sendResponse(`Emergency: ${symptomId}`, symptomId);
  };

  const handleEmergencyNone = () => {
    sendResponse('No emergency symptoms', 'none');
  };

  const handleSymptomSubmit = (selectedIds: string[]) => {
    sendResponse(selectedIds.join(','), selectedIds.join(','));
  };

  const handleAnswer = (answer: string) => {
    sendResponse(answer, answer);
  };

  const handleSummarySubmit = async (patientNotes: string) => {
    if (!conversationId || !summaryData) return;
    setSummarySubmitted(true);
    try {
      await api.post(`/conversations/${conversationId}/summary`, {
        summaryText: summaryData.summaryText,
        patientAddedNotes: patientNotes || undefined,
        recommendations: summaryData.recommendations,
        educationLinks: [],
      });
    } catch {
      // Summary save failed — still allow completion
    }
    // Send a final response to advance to COMPLETED
    if (patientNotes) {
      sendResponse(patientNotes, 'submit_summary');
    } else {
      sendResponse('Summary submitted', 'submit_summary');
    }
  };

  const lastBotMsg = [...messages].reverse().find((m) => m.role === 'BOT');

  return (
    <div className="flex h-full flex-col">
      <EmergencyBanner visible={isEmergency} />
      <PhaseIndicator currentPhase={phase} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">R</div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {phase === ConversationPhase.EMERGENCY_CHECK && !loading && (
            <EmergencyCheck
              onSelect={handleEmergencySelect}
              onNone={handleEmergencyNone}
            />
          )}

          {phase === ConversationPhase.SYMPTOM_SELECTION && !loading && (
            <SymptomSelector onSubmit={handleSymptomSubmit} />
          )}

          {(phase === ConversationPhase.SCREENING || phase === ConversationPhase.FOLLOW_UP || phase === ConversationPhase.DISCLAIMER || phase === ConversationPhase.PATIENT_CONTEXT) && !loading && lastBotMsg?.options && (
            <QuestionRenderer
              messageType={lastBotMsg.messageType || MessageType.TEXT}
              options={lastBotMsg.options}
              onAnswer={handleAnswer}
            />
          )}

          {(phase === ConversationPhase.SCREENING || phase === ConversationPhase.FOLLOW_UP || phase === ConversationPhase.DISCLAIMER || phase === ConversationPhase.PATIENT_CONTEXT) && !loading && !lastBotMsg?.options && lastBotMsg?.messageType !== MessageType.SUMMARY && (
            <QuestionRenderer
              messageType={lastBotMsg?.messageType || MessageType.TEXT}
              onAnswer={handleAnswer}
            />
          )}

          {phase === ConversationPhase.SUMMARY && !summarySubmitted && summaryData && (
            <SummaryCard
              summaryText={summaryData.summaryText}
              recommendations={summaryData.recommendations}
              onSubmit={handleSummarySubmit}
            />
          )}

          {phase === ConversationPhase.COMPLETED && (
            <div className="text-center text-sm text-[#64748B]">
              Conversation complete. Start a new conversation to check in again.
            </div>
          )}

          {phase === ConversationPhase.EMERGENCY && (
            <div className="text-center text-sm font-medium text-red-600">
              Please call 911 or your local emergency number immediately.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

