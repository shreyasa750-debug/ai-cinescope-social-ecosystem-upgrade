"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Settings, Baby, Users as UsersIcon } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  type: 'adult' | 'kid' | 'guest';
  avatar: string;
  color: string;
  isActive: boolean;
}

interface ProfileSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileSelect: (profileId: string) => void;
}

const PROFILE_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
];

const PROFILE_ICONS: Record<string, any> = {
  adult: User,
  kid: Baby,
  guest: UsersIcon,
};

export function ProfileSwitcher({ open, onOpenChange, onProfileSelect }: ProfileSwitcherProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileType, setNewProfileType] = useState<'adult' | 'kid' | 'guest'>('adult');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/user/profiles');
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    try {
      await fetch('/api/user/profiles/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      onProfileSelect(profileId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error switching profile:', error);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    try {
      const response = await fetch('/api/user/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfileName,
          type: newProfileType,
          color: PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
        }),
      });
      
      const data = await response.json();
      setProfiles([...profiles, data.profile]);
      setNewProfileName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Who's Watching?</DialogTitle>
          <DialogDescription>
            Select a profile to continue with personalized recommendations
          </DialogDescription>
        </DialogHeader>

        {!isCreating ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-6">
              {profiles.map((profile) => {
                const Icon = PROFILE_ICONS[profile.type];
                return (
                  <Card
                    key={profile.id}
                    className={`cursor-pointer hover:border-primary transition-all ${
                      profile.isActive && 'border-primary'
                    }`}
                    onClick={() => handleSelectProfile(profile.id)}
                  >
                    <CardContent className="flex flex-col items-center p-6 space-y-3">
                      <div className={`w-20 h-20 rounded-full ${profile.color} flex items-center justify-center`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-medium">{profile.name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {profile.type}
                        </Badge>
                      </div>
                      {profile.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add Profile Card */}
              <Card
                className="cursor-pointer hover:border-primary border-dashed transition-all"
                onClick={() => setIsCreating(true)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 h-full">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">Add Profile</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage Profiles
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label>Profile Name</Label>
              <Input
                placeholder="Enter profile name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['adult', 'kid', 'guest'] as const).map((type) => {
                  const Icon = PROFILE_ICONS[type];
                  return (
                    <Card
                      key={type}
                      className={`cursor-pointer transition-all ${
                        newProfileType === type ? 'border-primary' : ''
                      }`}
                      onClick={() => setNewProfileType(type)}
                    >
                      <CardContent className="flex flex-col items-center p-4 space-y-2">
                        <Icon className="h-8 w-8" />
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewProfileName('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="flex-1"
              >
                Create Profile
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
