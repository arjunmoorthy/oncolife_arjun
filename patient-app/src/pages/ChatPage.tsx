import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatView } from '@/components/chat/ChatView';

export function ChatPage() {
  const [conversationKey, setConversationKey] = useState(0);

  const handleNewConversation = () => {
    setConversationKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Chat with Ruby</h1>
          <p className="text-sm text-[#64748B]">Your AI symptom management assistant</p>
        </div>
        <Button onClick={handleNewConversation} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatView key={conversationKey} />
      </div>
    </div>
  );
}

