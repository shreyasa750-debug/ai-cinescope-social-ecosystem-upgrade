"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Trash2, Star, Film, TrendingUp, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  movies?: Array<{
    title: string;
    year: string;
    genre: string;
    rating: string;
  }>;
}

const QUICK_PROMPTS = [
  'Recommend a thriller',
  'Best movies of 2024',
  'Movies like Inception',
  'Feel-good comedies',
  'Underrated sci-fi films',
  'Oscar winners',
];

const DEMO_MOVIES = [
  { title: 'Inception', year: '2010', genre: 'Sci-Fi, Thriller', rating: '8.8' },
  { title: 'The Dark Knight', year: '2008', genre: 'Action, Crime', rating: '9.0' },
  { title: 'Interstellar', year: '2014', genre: 'Sci-Fi, Drama', rating: '8.7' },
  { title: 'Pulp Fiction', year: '1994', genre: 'Crime, Drama', rating: '8.9' },
  { title: 'The Shawshank Redemption', year: '1994', genre: 'Drama', rating: '9.3' },
];

export function ChatbotSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load chat history
    const savedMessages = localStorage.getItem('chatbot_history');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages, (key, value) => {
        if (key === 'timestamp') return new Date(value);
        return value;
      });
      setMessages(parsed);
    } else {
      // Welcome message
      const welcomeMsg: Message = {
        id: '1',
        role: 'bot',
        content: "👋 Hi! I'm CineBot, your AI movie assistant. I can help you:\n\n🎬 Discover new movies\n⭐ Find movies by genre, actor, or director\n🔥 Get trending recommendations\n📊 Learn about movie ratings and reviews\n\nJust ask me anything about movies!",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    localStorage.setItem('chatbot_history', JSON.stringify(msgs));
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Movie recommendations
    if (input.includes('recommend') || input.includes('suggest')) {
      if (input.includes('thriller')) {
        return "Here are some amazing thrillers I recommend:\n\n🎬 Se7en (1995) - Dark and gripping\n🎬 Prisoners (2013) - Intense mystery\n🎬 Gone Girl (2014) - Psychological thriller\n🎬 No Country for Old Men (2007) - Neo-noir masterpiece\n\nWould you like more recommendations in a different genre?";
      }
      if (input.includes('comedy') || input.includes('funny')) {
        return "Here are some feel-good comedies:\n\n😄 The Grand Budapest Hotel (2014)\n😄 Superbad (2007)\n😄 The Big Lebowski (1998)\n😄 Amélie (2001)\n\nPerfect for a fun movie night!";
      }
      if (input.includes('sci-fi') || input.includes('science fiction')) {
        return "Sci-Fi lovers will enjoy:\n\n🚀 Blade Runner 2049 (2017)\n🚀 Arrival (2016)\n🚀 Ex Machina (2014)\n🚀 The Matrix (1999)\n\nEach one is visually stunning and thought-provoking!";
      }
      return "I'd love to recommend movies! What genre are you interested in? (Action, Comedy, Drama, Horror, Sci-Fi, Thriller, Romance)";
    }

    // Trending movies
    if (input.includes('trending') || input.includes('popular')) {
      return "🔥 Here's what's trending right now:\n\n1. Oppenheimer - Epic biographical thriller\n2. Barbie - Fun and colorful adventure\n3. Dune: Part Two - Sci-fi masterpiece\n4. The Holdovers - Heartwarming drama\n\nWhich one catches your eye?";
    }

    // Movies like X
    if (input.includes('like') || input.includes('similar')) {
      if (input.includes('inception')) {
        return "If you loved Inception, try:\n\n🎬 Shutter Island (2010)\n🎬 The Prestige (2006)\n🎬 Memento (2000)\n🎬 Source Code (2011)\n\nAll have mind-bending plots!";
      }
      return "I can find similar movies! Just tell me which movie you enjoyed, and I'll suggest similar ones.";
    }

    // Actors
    if (input.includes('actor') || input.includes('actress')) {
      return "Looking for movies by a specific actor? Some popular choices:\n\n⭐ Leonardo DiCaprio - Django Unchained, The Wolf of Wall Street\n⭐ Meryl Streep - The Devil Wears Prada, Sophie's Choice\n⭐ Denzel Washington - Training Day, Malcolm X\n\nWho's your favorite actor?";
    }

    // Directors
    if (input.includes('director')) {
      return "Great directors to explore:\n\n🎥 Christopher Nolan - Known for complex narratives\n🎥 Quentin Tarantino - Master of dialogue\n🎥 Greta Gerwig - Fresh perspectives\n🎥 Denis Villeneuve - Visual storytelling\n\nWhich director interests you?";
    }

    // Genres
    if (input.includes('genre')) {
      return "I can recommend movies from these genres:\n\n🎭 Drama - Deep emotional stories\n🎬 Action - High-octane excitement\n😂 Comedy - Laugh-out-loud moments\n😱 Horror - Spine-chilling thrills\n💕 Romance - Heartwarming tales\n🔍 Mystery - Puzzle-solving adventures\n\nWhich genre appeals to you?";
    }

    // Default response
    return "I'm here to help with movie recommendations! Try asking:\n\n• 'Recommend a thriller'\n• 'What's trending?'\n• 'Movies like Inception'\n• 'Best comedies'\n• 'Oscar winners'\n\nWhat would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    saveMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate bot response
    const response = generateResponse(input);
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: response,
      timestamp: new Date(),
      movies: input.toLowerCase().includes('best') ? DEMO_MOVIES.slice(0, 3) : undefined,
    };

    saveMessages([...newMessages, botMsg]);
    setIsTyping(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    const welcomeMsg: Message = {
      id: '1',
      role: 'bot',
      content: "Chat cleared! How can I help you discover movies today?",
      timestamp: new Date(),
    };
    saveMessages([welcomeMsg]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Bot className="h-10 w-10 text-primary" />
            AI Movie Chatbot
          </h1>
          <p className="text-muted-foreground">
            Ask me anything about movies, get recommendations, and discover new films
          </p>
        </div>
        <Button onClick={clearChat} variant="outline" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Area */}
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {message.role === 'user' ? (
                        '👤'
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                      {/* Movie cards */}
                      {message.movies && message.movies.length > 0 && (
                        <div className="grid gap-2 mt-4">
                          {message.movies.map((movie, idx) => (
                            <div
                              key={idx}
                              className="bg-background rounded-lg p-3 border"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{movie.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {movie.year} • {movie.genre}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  {movie.rating}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask me about movies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Tip: Try asking "What's trending?" or "Recommend a thriller"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <Card className="text-center hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold text-sm">Movie Info</p>
            <p className="text-xs text-muted-foreground mt-1">Get details</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold text-sm">Trending</p>
            <p className="text-xs text-muted-foreground mt-1">What's hot</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold text-sm">By Actor</p>
            <p className="text-xs text-muted-foreground mt-1">Find favorites</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold text-sm">Personalized</p>
            <p className="text-xs text-muted-foreground mt-1">Just for you</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
