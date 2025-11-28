"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film, Clock, Star, Trophy, TrendingUp, Calendar, Award, Target } from 'lucide-react';

interface AnalyticsData {
  totalMovies: number;
  totalHours: number;
  avgRating: number;
  streak: number;
  topGenres: Array<{ name: string; count: number; color: string }>;
  topActors: Array<{ name: string; movies: number }>;
  topDirectors: Array<{ name: string; movies: number }>;
  monthlyWatched: Array<{ month: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  preferredLanguages: Array<{ language: string; percentage: number }>;
}

const DEMO_DATA: AnalyticsData = {
  totalMovies: 247,
  totalHours: 486,
  avgRating: 7.8,
  streak: 12,
  topGenres: [
    { name: 'Sci-Fi', count: 68, color: '#8b5cf6' },
    { name: 'Action', count: 54, color: '#ec4899' },
    { name: 'Drama', count: 42, color: '#f59e0b' },
    { name: 'Thriller', count: 38, color: '#10b981' },
    { name: 'Comedy', count: 29, color: '#3b82f6' },
  ],
  topActors: [
    { name: 'Leonardo DiCaprio', movies: 12 },
    { name: 'Christian Bale', movies: 10 },
    { name: 'Tom Hanks', movies: 9 },
    { name: 'Brad Pitt', movies: 8 },
    { name: 'Morgan Freeman', movies: 7 },
  ],
  topDirectors: [
    { name: 'Christopher Nolan', movies: 8 },
    { name: 'Quentin Tarantino', movies: 6 },
    { name: 'Steven Spielberg', movies: 5 },
    { name: 'Martin Scorsese', movies: 5 },
    { name: 'David Fincher', movies: 4 },
  ],
  monthlyWatched: [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 22 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 19 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 23 },
  ],
  ratingDistribution: [
    { rating: 10, count: 15 },
    { rating: 9, count: 42 },
    { rating: 8, count: 68 },
    { rating: 7, count: 54 },
    { rating: 6, count: 32 },
    { rating: 5, count: 18 },
    { rating: 4, count: 12 },
    { rating: 3, count: 6 },
  ],
  preferredLanguages: [
    { language: 'English', percentage: 78 },
    { language: 'French', percentage: 12 },
    { language: 'Japanese', percentage: 6 },
    { language: 'Spanish', percentage: 4 },
  ],
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>(DEMO_DATA);
  const [animatedValues, setAnimatedValues] = useState({
    totalMovies: 0,
    totalHours: 0,
    avgRating: 0,
    streak: 0,
  });
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem('analytics_data');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      localStorage.setItem('analytics_data', JSON.stringify(DEMO_DATA));
    }

    // Animate counters
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        totalMovies: Math.floor(data.totalMovies * progress),
        totalHours: Math.floor(data.totalHours * progress),
        avgRating: parseFloat((data.avgRating * progress).toFixed(1)),
        streak: Math.floor(data.streak * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues({
          totalMovies: data.totalMovies,
          totalHours: data.totalHours,
          avgRating: data.avgRating,
          streak: data.streak,
        });
      }
    }, increment);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    drawPieChart();
    drawLineChart();
    drawBarChart();
  }, [data]);

  const drawPieChart = () => {
    const canvas = pieChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const total = data.topGenres.reduce((sum, genre) => sum + genre.count, 0);
    let currentAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.topGenres.forEach((genre) => {
      const sliceAngle = (genre.count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = genre.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });
  };

  const drawLineChart = () => {
    const canvas = lineChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw line
    const maxCount = Math.max(...data.monthlyWatched.map(d => d.count));
    const xStep = chartWidth / (data.monthlyWatched.length - 1);
    const yScale = chartHeight / maxCount;

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.monthlyWatched.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = canvas.height - padding - point.count * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    data.monthlyWatched.forEach((point, index) => {
      const x = padding + index * xStep;
      ctx.fillText(point.month, x, canvas.height - padding + 20);
    });
  };

  const drawBarChart = () => {
    const canvas = barChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxCount = Math.max(...data.ratingDistribution.map(d => d.count));
    const barWidth = chartWidth / data.ratingDistribution.length;
    const yScale = chartHeight / maxCount;

    data.ratingDistribution.forEach((item, index) => {
      const x = padding + index * barWidth;
      const barHeight = item.count * yScale;
      const y = canvas.height - padding - barHeight;

      // Draw bar
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

      // Draw label
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.rating.toString(), x + barWidth / 2, canvas.height - padding + 20);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Movie Analytics</h1>
        <p className="text-muted-foreground">Your complete viewing statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
          <CardHeader className="relative pb-2">
            <CardDescription className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Total Movies
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{animatedValues.totalMovies}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 this month
            </Badge>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />
          <CardHeader className="relative pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Watch Time
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{animatedValues.totalHours}h</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              20.3 days
            </Badge>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
          <CardHeader className="relative pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{animatedValues.avgRating}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(animatedValues.avgRating / 2)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardHeader className="relative pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Watch Streak
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{animatedValues.streak} days</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              Keep it up!
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart - Top Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Top Genres</CardTitle>
            <CardDescription>Your most-watched genres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <canvas
                ref={pieChartRef}
                width={300}
                height={300}
                className="max-w-full"
              />
            </div>
            <div className="mt-4 space-y-2">
              {data.topGenres.map((genre) => (
                <div key={genre.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: genre.color }}
                    />
                    <span className="text-sm">{genre.name}</span>
                  </div>
                  <Badge variant="secondary">{genre.count} movies</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Line Chart - Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Movies watched per month</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={lineChartRef}
              width={500}
              height={300}
              className="max-w-full"
            />
          </CardContent>
        </Card>

        {/* Bar Chart - Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>How you rate movies</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={barChartRef}
              width={500}
              height={300}
              className="max-w-full"
            />
          </CardContent>
        </Card>

        {/* Top Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Top Actors & Directors</CardTitle>
            <CardDescription>Your favorites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Most Watched Actors
              </h4>
              <div className="space-y-2">
                {data.topActors.map((actor, index) => (
                  <div key={actor.name} className="flex items-center justify-between">
                    <span className="text-sm">
                      {index + 1}. {actor.name}
                    </span>
                    <Badge variant="secondary">{actor.movies} movies</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Favorite Directors
              </h4>
              <div className="space-y-2">
                {data.topDirectors.map((director, index) => (
                  <div key={director.name} className="flex items-center justify-between">
                    <span className="text-sm">
                      {index + 1}. {director.name}
                    </span>
                    <Badge variant="secondary">{director.movies} movies</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Language Preferences</CardTitle>
          <CardDescription>Movies by language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.preferredLanguages.map((lang) => (
            <div key={lang.language} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{lang.language}</span>
                <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${lang.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
