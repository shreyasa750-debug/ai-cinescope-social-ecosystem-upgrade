"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Plus, Check } from 'lucide-react';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  posterPath?: string;
  poster_path?: string;
  rating: number;
  year?: number;
  genre?: string;
  language?: string;
  runtime?: number;
}

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const posterUrl = getMoviePosterUrl(movie);
  const rating = movie.rating || 0;

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(movie);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Top Actions */}
            <div className="flex justify-between items-start">
              <Badge className="bg-black/60 text-white border-0">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                {rating.toFixed(1)}
              </Badge>
              <button
                onClick={handleAddToWatchlist}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              >
                {isInWatchlist ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Plus className="h-4 w-4 text-white" />
                )}
              </button>
            </div>

            {/* Bottom Info */}
            <div className="space-y-2">
              <h3 className="text-white font-bold text-sm line-clamp-2">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/80">
                {movie.year && <span>{movie.year}</span>}
                {movie.genre && (
                  <>
                    <span>•</span>
                    <span>{movie.genre}</span>
                  </>
                )}
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <span>{movie.runtime}m</span>
                  </>
                )}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
                <Play className="h-4 w-4" />
                <span className="font-medium text-sm">Watch Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Simple View (No Hover) */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium text-xs line-clamp-1 flex-1">
                {movie.title}
              </h3>
              <Badge variant="secondary" className="ml-2 text-xs">
                <Star className="h-2.5 w-2.5 mr-1 fill-yellow-500 text-yellow-500" />
                {rating.toFixed(1)}
              </Badge>
            </div>
            {movie.year && (
              <p className="text-white/70 text-xs mt-1">{movie.year}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
