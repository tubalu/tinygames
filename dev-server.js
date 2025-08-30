import express from 'express'

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Parse JSON bodies
app.use(express.json())

// Simple in-memory storage for development
let mockLeaderboard = {}

// API Routes
app.post('/api/leaderboard/submit', (req, res) => {
  const { gameType, difficulty, score, playerName, gameConfig } = req.body

  if (!gameType || !difficulty || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid required fields' })
  }

  const entry = {
    id: Math.random().toString(36).substring(7),
    gameType,
    difficulty,
    score,
    playerName: (playerName || '').trim() || 'Anonymous',
    timestamp: new Date().toISOString(),
    gameConfig
  }

  const key = `${gameType}:${difficulty}`
  
  if (!mockLeaderboard[key]) {
    mockLeaderboard[key] = []
  }
  
  mockLeaderboard[key].push(entry)
  mockLeaderboard[key].sort((a, b) => a.score - b.score)
  mockLeaderboard[key] = mockLeaderboard[key].slice(0, 100)
  
  console.log(`Score submitted for ${key}:`, entry)
  res.json({ success: true, entry })
})

app.get('/api/leaderboard/get', (req, res) => {
  const { game, difficulty, limit = '50' } = req.query
  
  if (!game || !difficulty) {
    return res.status(400).json({ error: 'Missing game or difficulty parameter' })
  }

  const key = `${game}:${difficulty}`
  const maxResults = Math.min(parseInt(limit) || 50, 100)
  const leaderboard = (mockLeaderboard[key] || []).slice(0, maxResults)
  
  console.log(`Leaderboard fetched for ${key}:`, leaderboard.length, 'entries')
  res.json({ leaderboard, game, difficulty, total: leaderboard.length })
})

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available at:`)
  console.log(`   POST http://localhost:${PORT}/api/leaderboard/submit`)
  console.log(`   GET  http://localhost:${PORT}/api/leaderboard/get`)
  console.log(`🎮 Start Vite dev server with: npm run dev`)
  console.log(`📡 Vite will proxy API requests from http://localhost:5173 to this server`)
})