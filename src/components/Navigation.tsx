"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Film,
  Search,
  User,
  LogOut,
  Menu,
  Moon,
  Sun,
  Home,
  Compass,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
  Keyboard,
  Shield,
  UserCircle,
  Bot,
  UsersRound,
  Trophy,
  Target,
} from 'lucide-react';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { ParentalControlsDialog } from './ParentalControlsDialog';
import { ProfileSwitcher } from './ProfileSwitcher';
import { AIChatDialog } from './AIChatDialog';
import { CollaborativeSearch } from './CollaborativeSearch';

interface NavigationProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function Navigation({ onNavigate, currentSection }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [parentalControlsOpen, setParentalControlsOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [aiChatOpen, setAIChatOpen] = useState(false);
  const [collaborativeSearchOpen, setCollaborativeSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('discover');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', section: 'home' },
    { icon: Compass, label: 'Discover', section: 'discover' },
    { icon: TrendingUp, label: 'Recommendations', section: 'recommendations' },
    { icon: Users, label: 'Social', section: 'social' },
    { icon: BarChart3, label: 'Analytics', section: 'analytics' },
    { icon: Trophy, label: 'Badges', section: 'badges' },
    { icon: Target, label: 'Challenges', section: 'challenges' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Film className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CineScope
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.section}
                variant={currentSection === item.section ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.section)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* AI Chat */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAIChatOpen(true)}
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </Button>

            {/* Collaborative Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollaborativeSearchOpen(true)}
              title="Search Together"
              className="hidden md:flex"
            >
              <UsersRound className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Keyboard Shortcuts */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts"
              className="hidden md:flex"
            >
              <Keyboard className="h-5 w-5" />
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setProfileSwitcherOpen(true)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Switch Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('analytics')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setParentalControlsOpen(true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Parental Controls
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
                    <Keyboard className="mr-2 h-4 w-4" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => onNavigate('auth')} size="sm">
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.section}
                      variant={currentSection === item.section ? 'default' : 'ghost'}
                      onClick={() => onNavigate(item.section)}
                      className="justify-start gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Dialogs */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <ParentalControlsDialog open={parentalControlsOpen} onOpenChange={setParentalControlsOpen} />
      <ProfileSwitcher
        open={profileSwitcherOpen}
        onOpenChange={setProfileSwitcherOpen}
        onProfileSelect={(profile) => {
          console.log('Profile selected:', profile);
        }}
      />
      <CollaborativeSearch open={collaborativeSearchOpen} onOpenChange={setCollaborativeSearchOpen} />
      <AIChatDialog open={aiChatOpen} onOpenChange={setAIChatOpen} />
    </>
  );
}