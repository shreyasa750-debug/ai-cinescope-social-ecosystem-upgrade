"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Send, Play, Pause, Volume2, VolumeX, Maximize, Copy, Check } from 'lucide-react';

interface WatchPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId?: string;
  movieId?: number;
}

interface Participant {
  id: number;
  username: string;
  profileImage: string;
  isHost: boolean;
}

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
}

export function WatchPartyDialog({ open, onOpenChange, roomId, movieId }: WatchPartyDialogProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const inviteLink = `${window.location.origin}/watch-party/${roomId}`;

  useEffect(() => {
    if (open && roomId) {
      // Initialize WebSocket connection for real-time sync
      connectToWatchParty();
    }
  }, [open, roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToWatchParty = async () => {
    // Fetch initial party data
    try {
      const response = await fetch(`/api/watch-party/${roomId}`);
      const data = await response.json();
      setParticipants(data.participants || []);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error connecting to watch party:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      roomId,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch('/api/watch-party/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Broadcast play/pause state to all participants
    broadcastPlayerState({ action: isPlaying ? 'pause' : 'play', time: currentTime });
  };

  const broadcastPlayerState = async (state: any) => {
    try {
      await fetch('/api/watch-party/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, ...state }),
      });
    } catch (error) {
      console.error('Error broadcasting state:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Watch Party
            <Badge variant="secondary" className="ml-2">
              {participants.length} watching
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-4 gap-4 h-full">
          {/* Video Player Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video Player */}
            <Card className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-20 w-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-75">Movie Player</p>
                  <p className="text-sm opacity-50">Synchronized playback coming soon</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Invite Link */}
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyInviteLink} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </h3>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.profileImage} />
                        <AvatarFallback>{participant.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{participant.username}</span>
                      {participant.isHost && (
                        <Badge variant="secondary" className="text-xs">Host</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat */}
            <Card className="flex flex-col flex-1">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Chat</h3>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{msg.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
