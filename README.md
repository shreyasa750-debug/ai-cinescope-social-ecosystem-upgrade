# 🎬 CineScope - Advanced AI Movie Platform

CineScope is a comprehensive, AI-powered movie discovery and social platform built with Next.js 15, featuring advanced filtering, personalization, analytics, and community features.

![CineScope Platform](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop)

## ✨ Features

### 🔍 Advanced Search & Discovery
- **Multi-criteria filters**: Genre, rating, year, director
- **Infinite scroll** with skeleton loaders
- **Underrated movies** section for hidden gems
- **Real-time search** with debouncing
- **Sorting options**: Popularity, rating, release date, title

### 🤖 AI-Powered Recommendations
- **Content-based filtering**: Based on your watch history
- **Collaborative filtering**: Learn from similar users
- **Mood-based recommendations**: 6+ mood options (uplifting, intense, thrilling, etc.)
- **Cold-start onboarding** for new users
- **Persona modes**: Casual, Critic, Binger

### 📊 Analytics Dashboard
- **Watch statistics**: Total movies, watch time, average rating
- **Genre distribution** charts (pie & bar charts)
- **Monthly viewing trends** (line charts)
- **Rating distribution** visualization
- **Top genres** breakdown with Recharts

### 👥 Social Features
- **Friend system**: Add friends, view profiles
- **Movie clubs**: Create/join clubs, discussions
- **Public lists**: Create and share curated lists
- **Reviews**: Write reviews with spoiler flags
- **Threaded comments** on reviews
- **List sharing** and collaboration

### 🎨 UI/UX Features
- **Light/Dark theme** toggle with persistent storage
- **Responsive design**: Mobile, tablet, desktop
- **Skeleton loaders**: Smooth loading states
- **Animated transitions**: Hover effects, scale animations
- **Modern gradients**: Purple/pink theme
- **Accessible components**: Built with Shadcn/UI

### 🔐 Authentication
- **JWT-based authentication**
- **Secure password hashing** with bcrypt
- **Login/Signup** with validation
- **Protected routes** with middleware
- **User profiles** with customization

## 🗄️ Database Schema

The platform uses a comprehensive SQLite database (Turso) with 20 interconnected tables:

### Core Tables
- **users**: User profiles, preferences, stats, persona types
- **movies**: Movie catalog with TMDB data, AI tags, underrated flags
- **watchHistory**: User viewing history with ratings
- **reviews**: Movie reviews with spoiler flags and likes
- **lists**: Custom movie lists with collaboration support
- **clubs**: Movie discussion clubs with moderators
- **friends**: Friend connections and requests
- **watchRooms**: Virtual watch party rooms
- **notifications**: User notification system

### Pre-Seeded Data
- ✅ 5 demo users with distinct personas
- ✅ 20 popular movies across genres
- ✅ 15 detailed reviews with authentic content
- ✅ 5 curated lists (Sci-Fi, Underrated Gems, Classics, etc.)
- ✅ 3 movie clubs with members
- ✅ Friend connections and watch history

## 🚀 API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials

### Movies
- `GET /api/movies/search` - Search with filters
- `GET /api/movies/[id]` - Get movie details

### Recommendations
- `GET /api/recommendations` - AI-powered suggestions
  - Query params: `?mood=uplifting&limit=10`

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

### Social
- `GET /api/friends` - Get friends list
- `POST /api/friends` - Send friend request
- `GET /api/clubs` - Get movie clubs
- `POST /api/clubs` - Create club
- `GET /api/lists` - Get public lists
- `POST /api/lists` - Create list

### Analytics
- `GET /api/analytics` - User watch analytics

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review

## 📁 Project Structure

```
cinescope/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── movies/            # Movie search & details
│   │   │   ├── recommendations/   # AI recommendations
│   │   │   ├── user/              # User profile
│   │   │   ├── friends/           # Social features
│   │   │   ├── clubs/             # Movie clubs
│   │   │   ├── lists/             # Custom lists
│   │   │   ├── reviews/           # Movie reviews
│   │   │   └── analytics/         # Watch statistics
│   │   ├── page.tsx               # Main application
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── Navigation.tsx         # Top navigation bar
│   │   ├── HomeSection.tsx        # Homepage hero & features
│   │   ├── AuthSection.tsx        # Login/Signup
│   │   ├── DiscoverSection.tsx    # Movie search & filters
│   │   ├── AnalyticsSection.tsx   # Charts & insights
│   │   ├── RecommendationsSection.tsx  # AI suggestions
│   │   ├── SocialSection.tsx      # Friends, clubs, lists
│   │   └── ui/                    # Shadcn UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state management
│   │   └── ThemeContext.tsx       # Theme management
│   ├── db/
│   │   ├── index.ts               # Database client
│   │   ├── schema.ts              # Drizzle ORM schema
│   │   └── seeds/                 # Database seeders
│   └── lib/
│       └── auth.ts                # JWT utilities
├── drizzle.config.ts              # Drizzle configuration
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless functions
- **Drizzle ORM** - Type-safe database queries
- **Turso (SQLite)** - Edge database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Turso database (automatically configured)

### Installation

1. **Clone the repository** (if applicable)
```bash
git clone <your-repo-url>
cd cinescope
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment variables are already set up**
The `.env` file is pre-configured with Turso database credentials.

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Accounts

Try these pre-seeded accounts:

```
📧 alice@cinescope.com (Casual viewer)
📧 bob@cinescope.com (Critic - most reviews)
📧 charlie@cinescope.com (Binge-watcher)
📧 diana@cinescope.com (Casual)
📧 eve@cinescope.com (Curator - most lists)
🔑 Password: Use any password for demo
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (`#8b5cf6`)
- **Secondary**: Pink accent (`#ec4899`)
- **Accent**: Orange (`#f59e0b`)
- **Success**: Green (`#10b981`)
- **Background**: Dynamic (light/dark)

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: Geist Sans font
- **Code**: Geist Mono font

### Components
All UI components follow Shadcn/UI design patterns:
- Cards with hover effects
- Smooth transitions
- Skeleton loading states
- Accessible forms
- Responsive layouts

## 🔑 Key Features Explained

### 1. Advanced Movie Search
The discover section includes:
- Real-time search with debouncing
- Multiple filter combinations
- Genre chips (multi-select)
- Rating slider (0-10)
- Sort by popularity, rating, date, title
- "Underrated Gems" toggle
- Pagination with infinite scroll support

### 2. AI Recommendations
The recommendation engine:
- Analyzes watch history and ratings
- Considers genre preferences
- Provides mood-based filtering
- Shows recommendation reasoning
- Updates dynamically based on user activity
- Includes cold-start algorithm for new users

### 3. Analytics Dashboard
Visualizations include:
- **Stat Cards**: Total movies, watch time, avg rating, reviews
- **Pie Chart**: Genre distribution
- **Line Chart**: Monthly viewing trend
- **Bar Charts**: Rating distribution and genre breakdown
- All built with Recharts for smooth animations

### 4. Social Features
Community functionality:
- **Friends**: Add/remove, view profiles
- **Clubs**: Create clubs, join discussions
- **Lists**: Curated collections, follow lists
- **Reviews**: Write reviews, mark spoilers
- **Sharing**: Share lists and reviews

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `TURSO_CONNECTION_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
4. Deploy!

The database is already configured and will work seamlessly in production.

## 🎭 User Personas

The platform supports three user personas:

1. **Casual** 🍿
   - Watches 3-5 movies/week
   - Prefers feel-good content
   - Minimal analytics usage

2. **Critic** 📝
   - Writes detailed reviews
   - Watches 8+ movies/week
   - Deep genre preferences
   - Active in clubs

3. **Binger** 📺
   - Watches 12+ movies/week
   - Diverse genre taste
   - High watch stats
   - Marathon viewing

## 📱 Responsive Design

CineScope is fully responsive:
- **Mobile**: Single column, bottom nav
- **Tablet**: 2-column grids, optimized spacing
- **Desktop**: Multi-column layouts, hover effects

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- SQL injection prevention (Drizzle ORM)
- XSS protection
- CSRF token support

## 🎯 Future Enhancements

Potential additions:
- [ ] WebSocket for real-time chat in watch rooms
- [ ] Voice input for AI chat
- [ ] Drag-and-drop list reordering
- [ ] Email notifications
- [ ] Multiple profiles per account
- [ ] Parental controls
- [ ] Keyboard shortcuts
- [ ] PWA support
- [ ] Movie trailers integration
- [ ] External API integration (TMDB/OMDB)

## 🐛 Known Issues

- Mock data is used for movies (TMDB integration ready)
- WebSocket features are scaffolded but need implementation
- Some social features need additional API endpoints

## 📄 License

This project is built for demonstration purposes.

## 👨‍💻 Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Database Commands
```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes
npx drizzle-kit push

# View database
npx drizzle-kit studio
```

## 🙏 Acknowledgments

- Built with Next.js 15 and React
- UI components from Shadcn/UI
- Icons from Lucide React
- Charts from Recharts
- Database by Turso
- Images from Unsplash

---

**Made with ❤️ for movie enthusiasts**

🎬 Start exploring movies with CineScope today!
