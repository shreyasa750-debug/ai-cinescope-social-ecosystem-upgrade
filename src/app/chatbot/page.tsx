import { ChatbotSection } from '@/components/ChatbotSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'AI Chatbot | CineScope+',
  description: 'Get personalized movie recommendations from our AI assistant',
};

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChatbotSection />
    </Suspense>
  );
}
