# 🏆 Minesweeper Global Leaderboard

A global leaderboard system for Vue 3 Minesweeper with authentic Windows 3.1 styling.

## ✨ Features

- **🌍 Global public leaderboard** - Anyone can view and submit scores
- **👤 Player name persistence** - Names are remembered across sessions
- **🎭 Anonymous submissions** - Optional name input with "Anonymous" fallback
- **🏅 Separate rankings** - Each difficulty level has its own leaderboard
- **🖥️ Windows 3.1 authentic UI** - Pixel-perfect classic styling
- **⚡ Serverless architecture** - Works on Vercel with zero backend configuration

## 🛠️ Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start API Server (Terminal 1)
```bash
npm run dev:api
```
This starts the API server on `http://localhost:3001`

### 3. Start Frontend (Terminal 2)  
```bash
npm run dev
```
This starts the Vite dev server on `http://localhost:5173` with API proxy

### 4. Play & Test
- Open `http://localhost:5173`
- Play Minesweeper and win a game
- Enter your name when prompted (or skip for Anonymous)
- View "High Scores" from the Game menu

## 🎮 How It Works

### Name Input Flow
1. **Win a game** → Name input dialog appears
2. **Pre-filled name** → Uses previously saved name (if any)
3. **Optional input** → Leave blank for "Anonymous" submission
4. **Name persistence** → Saved to localStorage for future games

### Leaderboard Display
- **Separate tabs** for each difficulty level
- **Top 50 scores** displayed per difficulty
- **Real-time updates** when new scores are submitted
- **Trophy icons** for top 3 positions
- **Time formatting** in minutes:seconds or seconds

### Data Storage
- **Local development** → In-memory storage (resets on server restart)
- **Production (Vercel)** → Vercel KV database (persistent)

## 🚀 Deployment

### Vercel Deployment
1. **Push to GitHub** 
2. **Connect to Vercel** 
3. **Add Vercel KV** (one-click from Vercel dashboard)
4. **Deploy** → Automatic serverless API + frontend

The production version uses Vercel KV for persistent, global storage.

## 📊 API Endpoints

### POST `/api/leaderboard/submit`
Submit a new score to the global leaderboard.

**Request Body:**
```json
{
  "gameType": "minesweeper",
  "difficulty": "beginner|intermediate|expert", 
  "score": 30,
  "playerName": "YourName",
  "gameConfig": {
    "boardWidth": 9,
    "boardHeight": 9,
    "minesCount": 10
  }
}
```

### GET `/api/leaderboard/get`
Get leaderboard for a specific game and difficulty.

**Query Parameters:**
- `game` - Game type (e.g., "minesweeper")
- `difficulty` - Difficulty level (e.g., "beginner")
- `limit` - Max results (optional, default: 50)

## 🔧 Technical Details

### Architecture
- **Frontend**: Vue 3 + TypeScript + Vite
- **API**: Serverless functions (Node.js)
- **Database**: Vercel KV (Redis) for production, in-memory for development
- **Styling**: Authentic Windows 3.1 CSS

### Key Components
- `NameInputDialog.vue` - Score submission with name input
- `LeaderboardModal.vue` - Global leaderboard display
- `useGlobalLeaderboard.ts` - API integration composable
- `PlayerStorageService.ts` - localStorage name persistence

### Game Integration
- Win condition triggers name input dialog
- "High Scores" menu item opens leaderboard
- Player name pre-filled from localStorage
- Anonymous submissions supported

## 🎯 Future Enhancements

The architecture supports easy addition of new games:
- **Tetris** → High score (points) based leaderboard
- **Snake** → Length-based scoring  
- **Pac-Man** → Points + level progression

Each game can have its own difficulties and scoring metrics while sharing the same leaderboard infrastructure.

---

**Enjoy your retro gaming experience!** 🎮