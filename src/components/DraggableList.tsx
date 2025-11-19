"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Eye } from 'lucide-react';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  rating: number;
}

interface DraggableListProps {
  movies: Movie[];
  onReorder: (movies: Movie[]) => void;
  onRemove?: (movieId: number) => void;
  onView?: (movieId: number) => void;
}

export function DraggableList({ movies, onReorder, onRemove, onView }: DraggableListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [items, setItems] = useState(movies);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove from old position
    newItems.splice(draggedIndex, 1);
    // Insert at new position
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onReorder(items);
  };

  const handleRemove = (movieId: number) => {
    const newItems = items.filter(item => item.id !== movieId);
    setItems(newItems);
    onRemove?.(movieId);
  };

  return (
    <div className="space-y-2">
      {items.map((movie, index) => (
        <Card
          key={movie.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`cursor-move hover:shadow-md transition-all ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <CardContent className="flex items-center gap-4 p-4">
            {/* Drag Handle */}
            <div className="flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
              <span className="text-lg font-semibold text-muted-foreground w-6">
                {index + 1}
              </span>
            </div>

            {/* Movie Poster */}
            <img
              src={getMoviePosterUrl(movie.posterPath)}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded"
            />

            {/* Movie Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{movie.title}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{movie.releaseDate?.substring(0, 4)}</span>
                <span>⭐ {movie.rating?.toFixed(1)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onView && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onView(movie.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(movie.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No movies in this list</p>
        </Card>
      )}
    </div>
  );
}
