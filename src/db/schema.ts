import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  profileImage: text('profile_image'),
  bio: text('bio'),
  preferences: text('preferences', { mode: 'json' }), // {genres: [], moods: [], watchHabits: {}}
  persona: text('persona').default('casual'), // casual/critic/binger
  parentalControls: text('parental_controls', { mode: 'json' }), // {enabled, ageRating, blockedContent}
  stats: text('stats', { mode: 'json' }), // {moviesWatched, reviewsWritten, listsCreated}
  createdAt: text('created_at').notNull(),
  lastActive: text('last_active').notNull(),
});

// Movies table
export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdbId: integer('tmdb_id').notNull().unique(),
  title: text('title').notNull(),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  overview: text('overview'),
  releaseDate: text('release_date'),
  runtime: integer('runtime'),
  genres: text('genres', { mode: 'json' }), // Array of genre strings
  director: text('director'),
  cast: text('cast', { mode: 'json' }), // Array of cast members
  rating: real('rating'),
  voteCount: integer('vote_count'),
  popularity: real('popularity'),
  trailers: text('trailers', { mode: 'json' }), // Array of trailer URLs
  underrated: integer('underrated', { mode: 'boolean' }).default(false),
  aiTags: text('ai_tags', { mode: 'json' }), // Array of mood tags
  createdAt: text('created_at').notNull(),
});

// Watch History table
export const watchHistory = sqliteTable('watch_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  watchedAt: text('watched_at').notNull(),
  rating: integer('rating'), // 1-5
  createdAt: text('created_at').notNull(),
});

// Watchlist table
export const watchlist = sqliteTable('watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  addedAt: text('added_at').notNull(),
});

// Favorite Movies table
export const favoriteMovies = sqliteTable('favorite_movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  addedAt: text('added_at').notNull(),
});

// Friends table (many-to-many relationship)
export const friends = sqliteTable('friends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Friend Requests table
export const friendRequests = sqliteTable('friend_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromUserId: integer('from_user_id').notNull().references(() => users.id),
  toUserId: integer('to_user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // pending/accepted/rejected
  createdAt: text('created_at').notNull(),
});

// Reviews table
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  rating: integer('rating').notNull(), // 1-5
  title: text('title').notNull(),
  content: text('content').notNull(),
  spoilers: integer('spoilers', { mode: 'boolean' }).default(false),
  likes: integer('likes').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Review Comments table
export const reviewComments = sqliteTable('review_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reviewId: integer('review_id').notNull().references(() => reviews.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

// Lists table (custom movie lists)
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  cover: text('cover'),
  followers: integer('followers').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// List Movies table (junction table)
export const listMovies = sqliteTable('list_movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => lists.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  addedAt: text('added_at').notNull(),
});

// List Collaborators table
export const listCollaborators = sqliteTable('list_collaborators', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => lists.id),
  userId: integer('user_id').notNull().references(() => users.id),
  addedAt: text('added_at').notNull(),
});

// Clubs table
export const clubs = sqliteTable('clubs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  banner: text('banner'),
  movieOfTheWeek: integer('movie_of_the_week').references(() => movies.id),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

// Club Members table
export const clubMembers = sqliteTable('club_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clubId: integer('club_id').notNull().references(() => clubs.id),
  userId: integer('user_id').notNull().references(() => users.id),
  isModerator: integer('is_moderator', { mode: 'boolean' }).default(false),
  joinedAt: text('joined_at').notNull(),
});

// Club Discussions table
export const clubDiscussions = sqliteTable('club_discussions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clubId: integer('club_id').notNull().references(() => clubs.id),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

// Discussion Comments table
export const discussionComments = sqliteTable('discussion_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discussionId: integer('discussion_id').notNull().references(() => clubDiscussions.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

// Watch Rooms table
export const watchRooms = sqliteTable('watch_rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hostId: integer('host_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  status: text('status').notNull().default('waiting'), // waiting/playing/ended
  scheduledFor: text('scheduled_for'),
  createdAt: text('created_at').notNull(),
});

// Watch Room Participants table
export const watchRoomParticipants = sqliteTable('watch_room_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => watchRooms.id),
  userId: integer('user_id').notNull().references(() => users.id),
  joinedAt: text('joined_at').notNull(),
});

// Watch Room Chat Messages table
export const watchRoomMessages = sqliteTable('watch_room_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => watchRooms.id),
  userId: integer('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // friend_request/review_like/club_invite
  fromUserId: integer('from_user_id').references(() => users.id),
  content: text('content').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Badges table
export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  rarity: text('rarity').notNull(), // common/rare/epic/legendary
  requirements: text('requirements', { mode: 'json' }).notNull(), // {type, value}
  rewardPoints: integer('reward_points').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// User Badges table
export const userBadges = sqliteTable('user_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  badgeId: integer('badge_id').notNull().references(() => badges.id),
  progress: integer('progress').notNull().default(0),
  unlocked: integer('unlocked', { mode: 'boolean' }).default(false),
  unlockedAt: text('unlocked_at'),
  createdAt: text('created_at').notNull(),
});

// Challenges table
export const challenges = sqliteTable('challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // daily/weekly/special
  target: integer('target').notNull(),
  rewardType: text('reward_type').notNull(), // points/badge
  rewardValue: integer('reward_value').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

// User Challenges table
export const userChallenges = sqliteTable('user_challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id),
  progress: integer('progress').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
});

// Polls table
export const polls = sqliteTable('polls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clubId: integer('club_id').notNull().references(() => clubs.id),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  question: text('question').notNull(),
  options: text('options', { mode: 'json' }).notNull(), // Array of option strings
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// Poll Votes table
export const pollVotes = sqliteTable('poll_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').notNull().references(() => polls.id),
  userId: integer('user_id').notNull().references(() => users.id),
  optionIndex: integer('option_index').notNull(),
  votedAt: text('voted_at').notNull(),
});

// User Profiles table (multi-profile support)
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  avatar: text('avatar'),
  ageRating: text('age_rating').notNull().default('PG-13'), // G/PG/PG-13/R/NC-17
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Profile Watch History table
export const profileWatchHistory = sqliteTable('profile_watch_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id').notNull().references(() => userProfiles.id),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  watchedAt: text('watched_at').notNull(),
  rating: integer('rating'), // 1-5
  createdAt: text('created_at').notNull(),
});

// OTT Availability table
export const ottAvailability = sqliteTable('ott_availability', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  movieId: integer('movie_id').notNull().references(() => movies.id),
  platform: text('platform').notNull(), // netflix/prime/disney/hbo/apple
  region: text('region').notNull().default('US'),
  available: integer('available', { mode: 'boolean' }).default(true),
  updatedAt: text('updated_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// Watch Room State table
export const watchRoomState = sqliteTable('watch_room_state', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => watchRooms.id),
  currentTime: integer('current_time').notNull().default(0), // seconds
  isPlaying: integer('is_playing', { mode: 'boolean' }).default(false),
  updatedAt: text('updated_at').notNull(),
});