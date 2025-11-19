"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BarChart3, Plus, Clock, CheckCircle2 } from 'lucide-react';

interface Poll {
  id: string;
  clubId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: string;
  createdBy: string;
  hasVoted: boolean;
  userVote?: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
}

export function PollsDialog({ open, onOpenChange, clubId }: PollsDialogProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    duration: '7',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && clubId) {
      fetchPolls();
    }
  }, [open, clubId]);

  const fetchPolls = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/polls`);
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await fetch(`/api/clubs/${clubId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      
      // Refresh polls to show updated results
      fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) return;

    try {
      await fetch(`/api/clubs/${clubId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: newPoll.options.filter(opt => opt.trim()),
          durationDays: parseInt(newPoll.duration),
        }),
      });
      
      setIsCreating(false);
      setNewPoll({ question: '', options: ['', ''], duration: '7' });
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Club Polls
          </DialogTitle>
          <DialogDescription>
            Vote on polls and see what the community thinks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isCreating ? (
            <>
              <Button onClick={() => setIsCreating(true)} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Poll
              </Button>

              {/* Active Polls */}
              <div className="space-y-4">
                {polls.map((poll) => {
                  const timeLeft = Math.max(
                    0,
                    Math.floor((new Date(poll.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <Card key={poll.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{poll.question}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <span>{poll.totalVotes} votes</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeLeft > 0 ? `${timeLeft} days left` : 'Ended'}
                              </span>
                            </CardDescription>
                          </div>
                          {poll.hasVoted && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Voted
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {poll.hasVoted || timeLeft === 0 ? (
                          // Show results
                          poll.options.map((option) => {
                            const percentage = poll.totalVotes > 0
                              ? (option.votes / poll.totalVotes) * 100
                              : 0;
                            const isUserVote = poll.userVote === option.id;

                            return (
                              <div key={option.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className={isUserVote ? 'font-medium' : ''}>
                                    {option.text}
                                    {isUserVote && ' ✓'}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {option.votes} ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <Progress value={percentage} />
                              </div>
                            );
                          })
                        ) : (
                          // Show voting options
                          <RadioGroup onValueChange={(value) => handleVote(poll.id, value)}>
                            {poll.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {polls.length === 0 && !loading && (
                  <Card className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No polls yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create the first poll for this club!
                    </p>
                  </Card>
                )}
              </div>
            </>
          ) : (
            // Create Poll Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="What movie should we watch next week?"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {newPoll.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {newPoll.options.length < 6 && (
                  <Button variant="outline" size="sm" onClick={addOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <select
                  value={newPoll.duration}
                  onChange={(e) => setNewPoll({ ...newPoll, duration: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewPoll({ question: '', options: ['', ''], duration: '7' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePoll}
                  disabled={!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())}
                  className="flex-1"
                >
                  Create Poll
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
