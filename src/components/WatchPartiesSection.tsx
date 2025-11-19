"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, Video, Plus, Play, Pause, MessageCircle, Send, Calendar, Clock, Film, Lock, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  posterPath: string;
  runtime: number;
}

interface WatchRoom {
  room: {
    id: number;
    hostId: number;
    movieId: number;
    status: string;
    scheduledFor: string | null;
    createdAt: string;
  };
  movie: Movie | null;
  host: {
    id: number;
    username: string;
    profileImage: string | null;
  } | null;
  participants: Array<{
    user: {
      id: number;
      username: string;
      profileImage: string | null;
    };
    joinedAt: string;
  }>;
  playbackState: {
    currentTime: number;
    isPlaying: boolean;
    updatedAt: string;
  } | null;
}

interface ChatMessage {
  message: {
    id: number;
    roomId: number;
    userId: number;
    message: string;
    timestamp: string;
  };
  user: {
    id: number;
    username: string;
    profileImage: string | null;
  };
}

export function WatchPartiesSection() {
  const { token, user } = useAuth();
  const [activeRooms, setActiveRooms] = useState<WatchRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<WatchRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (token) {
      fetchActiveRooms();
    }
  }, [token]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      chatPollingRef.current = setInterval(fetchMessages, 3000);
      return () => {
        if (chatPollingRef.current) {
          clearInterval(chatPollingRef.current);
        }
      };
    }
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchActiveRooms = async () => {
    // In a real app, you'd have an endpoint to list active rooms
    // For now, we'll just show the current room if one exists
  };

  const searchMovies = async (query: string) => {
    if (!query.trim() || !token) return;
    
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.movies || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      toast.error('Failed to search movies');
    }
  };

  const createRoom = async () => {
    if (!token || !selectedMovie) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/watch-rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: selectedMovie.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Watch room created! Share the link with friends.');
        setCreateDialogOpen(false);
        await joinRoom(data.room.id);
      } else {
        toast.error(data.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (roomId: number) => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Join the room
      const joinResponse = await fetch(`/api/watch-rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!joinResponse.ok && joinResponse.status !== 400) {
        const errorData = await joinResponse.json();
        if (errorData.code !== 'ALREADY_JOINED') {
          throw new Error(errorData.error);
        }
      }

      // Fetch room details
      const roomResponse = await fetch(`/api/watch-rooms/${roomId}`);
      const roomData = await roomResponse.json();
      
      setCurrentRoom(roomData);
      toast.success('Joined watch room!');
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!token || !currentRoom) return;
    
    try {
      const response = await fetch(`/api/watch-rooms/${currentRoom.room.id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCurrentRoom(null);
        setMessages([]);
        toast.success('Left watch room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  const syncPlayback = async (currentTime: number, isPlaying: boolean) => {
    if (!token || !currentRoom || currentRoom.host?.id !== user?.id) return;
    
    try {
      await fetch(`/api/watch-rooms/${currentRoom.room.id}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentTime, isPlaying }),
      });
    } catch (error) {
      console.error('Error syncing playback:', error);
    }
  };

  const fetchMessages = async () => {
    if (!token || !currentRoom) return;
    
    try {
      const response = await fetch(`/api/watch-rooms/${currentRoom.room.id}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!token || !currentRoom || !newMessage.trim()) return;
    
    try {
      const response = await fetch(`/api/watch-rooms/${currentRoom.room.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Sign in to join watch parties</p>
          <p className="text-sm text-muted-foreground mt-2">
            Watch movies together with friends in real-time
          </p>
        </Card>
      </div>
    );
  }

  // Room View
  if (currentRoom) {
    const isHost = currentRoom.host?.id === user?.id;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Watch Party</h2>
            <p className="text-muted-foreground">
              {currentRoom.movie?.title} • {currentRoom.participants.length} viewers
            </p>
          </div>
          <Button variant="outline" onClick={leaveRoom} className="gap-2">
            <LogOut className="h-4 w-4" />
            Leave Room
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Area */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg">
                {currentRoom.movie?.posterPath ? (
                  <img
                    src={getMoviePosterUrl(currentRoom.movie.posterPath)}
                    alt={currentRoom.movie.title}
                    className="w-full h-full object-cover rounded-t-lg opacity-50"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-24 w-24 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-32 w-32 text-white opacity-50" />
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  {isHost ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => syncPlayback(0, true)}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncPlayback(0, false)}
                        className="gap-2"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                      <Badge variant="secondary" className="ml-auto">
                        Host Controls
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="ml-auto">
                      Synced with host
                    </Badge>
                  )}
                </div>

                {/* Participants */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <Users className="h-4 w-4 inline mr-1" />
                    Participants ({currentRoom.participants.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {currentRoom.participants.map((participant) => (
                      <Badge key={participant.user.id} variant="secondary" className="gap-1">
                        {participant.user.username}
                        {participant.user.id === currentRoom.host?.id && ' 👑'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.message.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {msg.user.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Room List View
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Watch Parties</h2>
          <p className="text-muted-foreground">
            Watch movies together with friends in real-time
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Watch Party</DialogTitle>
              <DialogDescription>
                Choose a movie to watch together with friends
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Movie</Label>
                <Input
                  placeholder="Search for a movie..."
                  value={movieSearch}
                  onChange={(e) => {
                    setMovieSearch(e.target.value);
                    searchMovies(e.target.value);
                  }}
                />
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="h-[300px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {searchResults.map((movie) => (
                      <Card
                        key={movie.id}
                        className={`cursor-pointer transition-colors ${
                          selectedMovie?.id === movie.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedMovie(movie)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <img
                            src={getMoviePosterUrl(movie.posterPath)}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{movie.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {movie.releaseDate?.substring(0, 4)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Button
                onClick={createRoom}
                disabled={!selectedMovie || creating}
                className="w-full gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Create Watch Room
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Rooms */}
      <Card className="p-12 text-center">
        <Video className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">No active watch parties</p>
        <p className="text-sm text-muted-foreground mb-4">
          Create a room to start watching movies with friends
        </p>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Room
        </Button>
      </Card>
    </div>
  );
}
