"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Mic, MicOff, Sparkles, Film, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  movies?: Array<{
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    releaseDate: string;
  }>;
}

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Welcome message
    if (open && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "👋 Hi! I'm your AI movie assistant. I can help you discover movies based on your mood, preferences, or specific criteria. Try asking me things like:\n\n• 'Recommend me a thriller'\n• 'Find movies like Inception'\n• 'What's good for a date night?'\n• 'Show me award-winning dramas'\n\nWhat are you in the mood for?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now');
      } catch (error) {
        toast.error('Failed to start voice recognition');
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate AI response with movie recommendations
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on your preferences, here are some great movies I think you'll enjoy! Each one has been carefully selected to match what you're looking for:",
        timestamp: new Date().toISOString(),
        movies: [
          {
            id: 550,
            title: 'Fight Club',
            posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            rating: 8.4,
            releaseDate: '1999-10-15',
          },
          {
            id: 155,
            title: 'The Dark Knight',
            posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            rating: 9.0,
            releaseDate: '2008-07-18',
          },
          {
            id: 13,
            title: 'Forrest Gump',
            posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
            rating: 8.5,
            releaseDate: '1994-07-06',
          },
        ],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    'Recommend a thriller',
    'Movies like Inception',
    'Best movies of 2024',
    'Feel-good comedies',
    'Award-winning dramas',
    'Action movies with great reviews',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Movie Assistant
          </DialogTitle>
          <DialogDescription>
            Get personalized movie recommendations through conversation
          </DialogDescription>
        </DialogHeader>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            {quickPrompts.map((prompt, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Movie Recommendations */}
                  {message.movies && message.movies.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {message.movies.map((movie) => (
                        <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <img
                            src={getMoviePosterUrl(movie.posterPath)}
                            alt={movie.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-2">
                            <p className="font-semibold text-sm line-clamp-1">{movie.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {movie.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {movie.releaseDate.substring(0, 4)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={isListening ? 'default' : 'outline'}
              onClick={toggleVoiceInput}
              className={isListening ? 'animate-pulse' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              placeholder="Ask me anything about movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-muted-foreground text-center mt-2 animate-pulse">
              🎤 Listening... Speak your movie preferences
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
