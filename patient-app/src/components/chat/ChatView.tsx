import { useState, useRef, useEffect } from 'react';
import { ConversationPhase, MessageType } from '@oncolife/shared';
import { SYMPTOM_DEFINITIONS } from '@oncolife/shared';
import { useAuth } from '@/contexts/AuthContext';
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

export function ChatView() {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<ConversationPhase>(ConversationPhase.DISCLAIMER);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summarySubmitted, setSummarySubmitted] = useState(false);

  useEffect(() => {
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'BOT',
      content: `Hi ${user?.firstName || 'there'}! 👋 I'm Ruby, your symptom management assistant. Before we begin, I need to check — are you experiencing any emergency symptoms?`,
      messageType: MessageType.TEXT,
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
    setPhase(ConversationPhase.EMERGENCY_CHECK);
  }, [user?.firstName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, phase]);

  const addBotMessage = (content: string, type?: MessageType, options?: { label: string; value: string }[]) => {
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'BOT',
          content,
          messageType: type,
          options,
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 600);
  };

  const addPatientMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `patient-${Date.now()}`,
        role: 'PATIENT',
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleEmergencySelect = (symptomId: string) => {
    addPatientMessage(`Emergency: ${symptomId}`);
    setIsEmergency(true);
    setPhase(ConversationPhase.EMERGENCY);
  };

  const handleEmergencyNone = () => {
    addPatientMessage('No emergency symptoms');
    setPhase(ConversationPhase.SYMPTOM_SELECTION);
    addBotMessage("Great, glad to hear that. Now let's check in on how you're feeling. Please select any symptoms you're experiencing.");
  };

  const handleSymptomSubmit = (selectedIds: string[]) => {
    const names = selectedIds
      .map((id) => SYMPTOM_DEFINITIONS.find((s) => s.id === id)?.name || id)
      .join(', ');
    addPatientMessage(names);
    setPhase(ConversationPhase.SCREENING);
    addBotMessage(
      `Let's talk about your ${SYMPTOM_DEFINITIONS.find((s) => s.id === selectedIds[0])?.name || 'symptom'}. How would you rate the severity?`,
      MessageType.OPTION_SELECT,
      [
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
      ],
    );
  };

  const handleAnswer = (answer: string) => {
    addPatientMessage(answer);
    setPhase(ConversationPhase.SUMMARY);
    addBotMessage("Thank you for sharing. Here's a summary of our conversation today.");
  };

  const handleSummarySubmit = (patientNotes: string) => {
    if (patientNotes) addPatientMessage(patientNotes);
    setSummarySubmitted(true);
    setPhase(ConversationPhase.COMPLETED);
    addBotMessage("Your summary has been submitted and shared with your care team. Take care, and don't hesitate to check in again! 💚");
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
          {phase === ConversationPhase.EMERGENCY_CHECK && (
            <EmergencyCheck
              onSelect={handleEmergencySelect}
              onNone={handleEmergencyNone}
            />
          )}

          {phase === ConversationPhase.SYMPTOM_SELECTION && (
            <SymptomSelector onSubmit={handleSymptomSubmit} />
          )}

          {phase === ConversationPhase.SCREENING && !loading && lastBotMsg?.options && (
            <QuestionRenderer
              messageType={lastBotMsg.messageType || MessageType.TEXT}
              options={lastBotMsg.options}
              onAnswer={handleAnswer}
            />
          )}

          {phase === ConversationPhase.SUMMARY && !summarySubmitted && (
            <SummaryCard
              summaryText="Patient reported moderate nausea for 3 days and mild fatigue. Anti-nausea medication partially effective. Oral intake maintained but reduced."
              recommendations={['Continue anti-nausea medication', 'Try ginger tea', 'Small frequent meals']}
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

