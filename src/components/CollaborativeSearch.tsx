"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Share2, Copy, Check, UserPlus, Search } from 'lucide-react';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface CollaborativeSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Participant {
  id: number;
  username: string;
  profileImage: string;
  isHost: boolean;
}

interface SearchResult {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  rating: number;
  votedBy: number[];
}

export function CollaborativeSearch({ open, onOpenChange }: CollaborativeSearchProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const inviteLink = sessionId ? `${window.location.origin}/search-together/${sessionId}` : '';

  useEffect(() => {
    if (open && !sessionId) {
      createSession();
    }
  }, [open]);

  const createSession = async () => {
    try {
      const response = await fetch('/api/search/collaborative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      setIsHost(true);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !sessionId) return;

    try {
      const response = await fetch(`/api/search/collaborative/${sessionId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleVote = async (movieId: number) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/search/collaborative/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
      });
      
      // Update local state
      setResults(results.map(result =>
        result.id === movieId
          ? { ...result, votedBy: [...result.votedBy, 1] } // Replace 1 with actual userId
          : result
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Search Together
            <Badge variant="secondary" className="ml-2">
              {participants.length} participant{participants.length !== 1 && 's'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Search for movies together and vote on what to watch
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-4 gap-4 h-full">
          {/* Main Search Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="space-y-3 overflow-y-auto">
              {results.map((movie) => (
                <Card key={movie.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <img
                      src={getMoviePosterUrl(movie.posterPath)}
                      alt={movie.title}
                      className="w-20 h-30 object-cover rounded"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{movie.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{movie.releaseDate?.substring(0, 4)}</span>
                        <span>⭐ {movie.rating?.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {movie.votedBy.length} vote{movie.votedBy.length !== 1 && 's'}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleVote(movie.id)}
                      variant={movie.votedBy.includes(1) ? 'default' : 'outline'}
                      className="gap-2"
                    >
                      {movie.votedBy.includes(1) ? (
                        <><Check className="h-4 w-4" /> Voted</>
                      ) : (
                        <>👍 Vote</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {results.length === 0 && (
                <Card className="p-12 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No results yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start searching to find movies together
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Invite Link */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="font-semibold text-sm">Invite Friends</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-xs"
                  />
                  <Button size="icon" onClick={copyInviteLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold text-sm">Participants</span>
                </div>
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
                  {participants.length === 0 && (
                    <div className="text-center py-4">
                      <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-xs text-muted-foreground">
                        Waiting for participants...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
