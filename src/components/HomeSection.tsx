"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Film,
  Sparkles,
  Users,
  TrendingUp,
  Search,
  BarChart3,
  MessageSquare,
  Star,
  Heart,
  Zap,
} from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (section: string) => void;
}

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const features = [
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Find movies with multi-criteria filters, ratings, genres, and more',
      action: () => onNavigate('discover'),
      badge: 'Popular',
    },
    {
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Get personalized suggestions based on your taste and mood',
      action: () => onNavigate('recommendations'),
      badge: 'AI-Powered',
    },
    {
      icon: BarChart3,
      title: 'Watch Analytics',
      description: 'Track your viewing habits with beautiful charts and insights',
      action: () => onNavigate('analytics'),
      badge: 'Insights',
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Connect with friends, share reviews, and join movie clubs',
      action: () => onNavigate('social'),
      badge: 'Community',
    },
    {
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Chat with AI about movies, get recommendations via voice',
      action: () => onNavigate('chat'),
      badge: 'New',
    },
    {
      icon: TrendingUp,
      title: 'Underrated Gems',
      description: 'Discover hidden treasures that deserve more attention',
      action: () => onNavigate('discover'),
      badge: 'Curated',
    },
  ];

  const stats = [
    { label: 'Movies', value: '20,000+', icon: Film },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Reviews', value: '50K+', icon: Star },
    { label: 'Lists', value: '5K+', icon: Heart },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4" variant="secondary">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered Movie Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to CineScope
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Your intelligent movie companion. Discover, track, and share your cinematic journey
          with advanced AI recommendations and social features.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={() => onNavigate('discover')} className="gap-2">
            <Search className="h-5 w-5" />
            Explore Movies
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate('recommendations')} className="gap-2">
            <Sparkles className="h-5 w-5" />
            Get Recommendations
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={feature.action}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Movie Journey?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join thousands of movie enthusiasts discovering, tracking, and discussing films
          with the power of AI.
        </p>
        <Button size="lg" onClick={() => onNavigate('discover')} className="gap-2">
          <Film className="h-5 w-5" />
          Start Exploring
        </Button>
      </div>
    </div>
  );
}
