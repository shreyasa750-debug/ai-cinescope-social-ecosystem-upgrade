"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, Share2, Film, Star, Trophy, Clock, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'watched' | 'review' | 'badge';
  timestamp: string;
  movie?: {
    id: number;
    title: string;
    poster: string;
    rating?: number;
  };
  review?: {
    rating: number;
    text: string;
  };
  badge?: {
    name: string;
    icon: string;
  };
  likes: string[];
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

const DEMO_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'Sarah Johnson',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    type: 'watched',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    movie: {
      id: 550,
      title: 'Inception',
      poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      rating: 9.5,
    },
    likes: ['user2', 'user3'],
    comments: [
      {
        id: 'c1',
        userId: 'user2',
        username: 'Mike Chen',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        text: 'One of the best sci-fi films ever! 🎬',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: '2',
    userId: 'user2',
    username: 'Mike Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    type: 'review',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    movie: {
      id: 155,
      title: 'The Dark Knight',
      poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    },
    review: {
      rating: 10,
      text: 'Christopher Nolan\'s masterpiece! Heath Ledger\'s Joker is unforgettable. The perfect blend of action, drama, and philosophical depth.',
    },
    likes: ['user1', 'user3', 'user4'],
    comments: [],
  },
  {
    id: '3',
    userId: 'user3',
    username: 'Emma Davis',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    type: 'badge',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    badge: {
      name: 'Movie Marathon Master',
      icon: '🏆',
    },
    likes: ['user1'],
    comments: [],
  },
];

export function SocialFeedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [commentDialogPost, setCommentDialogPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const savedPosts = localStorage.getItem('social_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(DEMO_POSTS);
      localStorage.setItem('social_posts', JSON.stringify(DEMO_POSTS));
    }
  }, []);

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('social_posts', JSON.stringify(updatedPosts));
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const currentUserId = 'current_user';
        const hasLiked = post.likes.includes(currentUserId);
        return {
          ...post,
          likes: hasLiked
            ? post.likes.filter(id => id !== currentUserId)
            : [...post.likes, currentUserId],
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `c${Date.now()}`,
          userId: 'current_user',
          username: 'You',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current',
          text: commentText,
          timestamp: new Date().toISOString(),
        };
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });
    savePosts(updatedPosts);
    setCommentText('');
    setCommentDialogPost(null);
    toast.success('Comment added!');
  };

  const handleShare = (post: Post) => {
    navigator.clipboard.writeText(`Check out this post: ${post.movie?.title || post.badge?.name}`);
    toast.success('Link copied to clipboard!');
  };

  const handleCreatePost = () => {
    if (!selectedMovie || !reviewText || rating === 0) {
      toast.error('Please fill all fields');
      return;
    }

    const newPost: Post = {
      id: `post${Date.now()}`,
      userId: 'current_user',
      username: 'You',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current',
      type: 'review',
      timestamp: new Date().toISOString(),
      movie: {
        id: Date.now(),
        title: selectedMovie,
        poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      },
      review: {
        rating,
        text: reviewText,
      },
      likes: [],
      comments: [],
    };

    savePosts([newPost, ...posts]);
    setNewPostDialog(false);
    setSelectedMovie('');
    setRating(0);
    setReviewText('');
    toast.success('Post created!');
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderPost = (post: Post) => {
    const isLiked = post.likes.includes('current_user');
    const likeIcon = isLiked ? '❤️' : '🤍';

    return (
      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.userAvatar} />
              <AvatarFallback>{post.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{post.username}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimestamp(post.timestamp)}
              </div>
            </div>
            {post.type === 'watched' && (
              <Badge variant="secondary" className="gap-1">
                <Film className="h-3 w-3" />
                Watched
              </Badge>
            )}
            {post.type === 'review' && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Review
              </Badge>
            )}
            {post.type === 'badge' && (
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-3 w-3" />
                Achievement
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post Content */}
          {post.type === 'watched' && post.movie && (
            <div className="flex gap-4">
              <img
                src={`https://image.tmdb.org/t/p/w200${post.movie.poster}`}
                alt={post.movie.title}
                className="w-24 h-36 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Poster';
                }}
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{post.movie.title}</h3>
                {post.movie.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{post.movie.rating}/10</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {post.type === 'review' && post.movie && post.review && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <img
                  src={`https://image.tmdb.org/t/p/w200${post.movie.poster}`}
                  alt={post.movie.title}
                  className="w-24 h-36 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Poster';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{post.movie.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < post.review!.rating / 2
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{post.review.rating}/10</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{post.review.text}</p>
            </div>
          )}

          {post.type === 'badge' && post.badge && (
            <div className="text-center py-6">
              <div className="text-6xl mb-3">{post.badge.icon}</div>
              <h3 className="font-bold text-xl">Earned "{post.badge.name}"!</h3>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-6 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:text-red-500 transition-colors"
              onClick={() => handleLike(post.id)}
            >
              <span className="text-xl">{likeIcon}</span>
              <span className="font-medium">{post.likes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setCommentDialogPost(post.id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{post.comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => handleShare(post)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Comments Preview */}
          {post.comments.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              {post.comments.slice(0, 2).map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{comment.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded-lg p-3">
                    <p className="font-semibold text-sm">{comment.username}</p>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
              {post.comments.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setCommentDialogPost(post.id)}
                >
                  View all {post.comments.length} comments
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Social Feed</h1>
          <p className="text-muted-foreground">See what your friends are watching</p>
        </div>
        <Dialog open={newPostDialog} onOpenChange={setNewPostDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Movie Title</label>
                <Input
                  placeholder="Enter movie name..."
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        i < rating
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleCreatePost} className="w-full">
                Post Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {posts.map(post => renderPost(post))}
      </div>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogPost !== null}
        onOpenChange={(open) => !open && setCommentDialogPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {posts
                .find(p => p.id === commentDialogPost)
                ?.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>{comment.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.username}</p>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentDialogPost) {
                  handleComment(commentDialogPost);
                }
              }}
            />
            <Button
              size="icon"
              onClick={() => commentDialogPost && handleComment(commentDialogPost)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
