import { mockLeaderboard } from './submit'

interface LeaderboardEntry {
  id: string
  gameType: string
  difficulty: string
  score: number
  playerName: string
  timestamp: string
  gameConfig: {
    boardWidth: number
    boardHeight: number
    minesCount: number
  }
}

// For local development without KV
const isLocal = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { game, difficulty, limit = '50' } = req.query

    if (!game || !difficulty) {
      return res.status(400).json({ error: 'Missing game or difficulty parameter' })
    }

    const key = `${game}:${difficulty}`
    const maxResults = Math.min(parseInt(limit) || 50, 100)

    let leaderboard: LeaderboardEntry[] = []

    if (isLocal) {
      // Local development: use in-memory storage
      leaderboard = (mockLeaderboard[key] || []).slice(0, maxResults)
      console.log(`Local leaderboard fetched for ${key}:`, leaderboard.length, 'entries')
    } else {
      // Production: use Vercel KV
      try {
        const { kv } = await import('@vercel/kv')
        
        // Get scores (ascending order - lower time is better for minesweeper)
        const scores = await kv.zrange(key, 0, maxResults - 1)
        
        leaderboard = scores.map(score => JSON.parse(score as string))
      } catch (error) {
        console.error('KV operation failed:', error)
        return res.status(500).json({ error: 'Database operation failed' })
      }
    }

    return res.status(200).json({
      leaderboard,
      game,
      difficulty,
      total: leaderboard.length
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}