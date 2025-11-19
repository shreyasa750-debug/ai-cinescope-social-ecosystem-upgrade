"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Clock, Ban } from 'lucide-react';

interface ParentalControlsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParentalSettings {
  enabled: boolean;
  maxRating: string;
  blockedGenres: string[];
  viewingSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
  requirePinForMature: boolean;
  pin?: string;
}

const AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const GENRES = ['action', 'horror', 'thriller', 'romance', 'drama', 'comedy', 'sci-fi', 'animation'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ParentalControlsDialog({ open, onOpenChange }: ParentalControlsDialogProps) {
  const [settings, setSettings] = useState<ParentalSettings>({
    enabled: false,
    maxRating: 'PG-13',
    blockedGenres: [],
    viewingSchedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '21:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    requirePinForMature: false,
    pin: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/parental-controls');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching parental controls:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/user/parental-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving parental controls:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSettings(prev => ({
      ...prev,
      blockedGenres: prev.blockedGenres.includes(genre)
        ? prev.blockedGenres.filter(g => g !== genre)
        : [...prev.blockedGenres, genre],
    }));
  };

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      viewingSchedule: {
        ...prev.viewingSchedule,
        days: prev.viewingSchedule.days.includes(day)
          ? prev.viewingSchedule.days.filter(d => d !== day)
          : [...prev.viewingSchedule.days, day],
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Parental Controls
          </DialogTitle>
          <DialogDescription>
            Set up restrictions to ensure age-appropriate content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Enable Parental Controls</CardTitle>
                  <CardDescription>Restrict content based on age ratings and preferences</CardDescription>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
            </CardHeader>
          </Card>

          {settings.enabled && (
            <>
              {/* Age Rating */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Maximum Age Rating
                  </CardTitle>
                  <CardDescription>Block content above this rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={settings.maxRating}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, maxRating: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RATINGS.map(rating => (
                        <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Blocked Genres */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Blocked Genres
                  </CardTitle>
                  <CardDescription>Hide movies from these genres</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <Badge
                        key={genre}
                        variant={settings.blockedGenres.includes(genre) ? 'destructive' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Viewing Schedule */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Viewing Schedule
                      </CardTitle>
                      <CardDescription>Set allowed viewing times</CardDescription>
                    </div>
                    <Switch
                      checked={settings.viewingSchedule.enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          viewingSchedule: { ...prev.viewingSchedule, enabled: checked },
                        }))
                      }
                    />
                  </div>
                </CardHeader>
                {settings.viewingSchedule.enabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={settings.viewingSchedule.startTime}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              viewingSchedule: { ...prev.viewingSchedule, startTime: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={settings.viewingSchedule.endTime}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              viewingSchedule: { ...prev.viewingSchedule, endTime: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Allowed Days</Label>
                      <div className="flex gap-2">
                        {DAYS.map(day => (
                          <Badge
                            key={day}
                            variant={settings.viewingSchedule.days.includes(day) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleDay(day)}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* PIN Protection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        PIN Protection
                      </CardTitle>
                      <CardDescription>Require PIN to access mature content</CardDescription>
                    </div>
                    <Switch
                      checked={settings.requirePinForMature}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, requirePinForMature: checked }))
                      }
                    />
                  </div>
                </CardHeader>
                {settings.requirePinForMature && (
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Set PIN (4 digits)</Label>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="Enter 4-digit PIN"
                        value={settings.pin}
                        onChange={(e) => setSettings(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
