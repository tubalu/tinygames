import type { VercelRequest, VercelResponse } from '@vercel/node'
import { v4 as uuidv4 } from 'uuid'

interface ScoreSubmission {
  gameType: string
  difficulty: string
  score: number
  playerName: string
  gameConfig: {
    boardWidth: number
    boardHeight: number
    minesCount: number
  }
}

interface LeaderboardEntry extends ScoreSubmission {
  id: string
  timestamp: string
}

// In-memory storage for local development
// In production, this will be replaced with Vercel KV
let mockLeaderboard: { [key: string]: LeaderboardEntry[] } = {}

// For local development without KV
const isLocal = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Set CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const body: ScoreSubmission = req.body

    // Validation
    if (!body.gameType || !body.difficulty || typeof body.score !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid required fields' })
    }

    if (body.score < 0 || body.score > 999) {
      return res.status(400).json({ error: 'Invalid score range' })
    }

    // Sanitize player name
    const playerName = (body.playerName || '').trim() || 'Anonymous'

    const entry: LeaderboardEntry = {
      id: uuidv4(),
      gameType: body.gameType,
      difficulty: body.difficulty,
      score: body.score,
      playerName: playerName.slice(0, 20), // Limit length
      timestamp: new Date().toISOString(),
      gameConfig: body.gameConfig
    }

    const key = `${body.gameType}:${body.difficulty}`

    if (isLocal) {
      // Local development: use in-memory storage
      if (!mockLeaderboard[key]) {
        mockLeaderboard[key] = []
      }
      
      mockLeaderboard[key].push(entry)
      
      // Sort by score (ascending for minesweeper - lower time is better)
      mockLeaderboard[key].sort((a, b) => a.score - b.score)
      
      // Keep only top 100
      mockLeaderboard[key] = mockLeaderboard[key].slice(0, 100)
      
      console.log(`Local leaderboard updated for ${key}:`, entry)
    } else {
      // Production: use Vercel KV
      try {
        const { kv } = await import('@vercel/kv')
        
        // Store in KV with sorted set for fast retrieval
        await kv.zadd(key, { score: body.score, member: JSON.stringify(entry) })
        
        // Keep only top 100 scores
        await kv.zremrangebyrank(key, 100, -1)
      } catch (error) {
        console.error('KV operation failed:', error)
        return res.status(500).json({ error: 'Database operation failed' })
      }
    }

    return res.status(200).json({ success: true, entry })
  } catch (error) {
    console.error('Submit score error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Export mock leaderboard for local development access
export { mockLeaderboard }