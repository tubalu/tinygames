export interface LeaderboardEntry {
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

export interface ScoreSubmission {
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

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  game: string
  difficulty: string
  total: number
}

export interface SubmissionResponse {
  success: boolean
  entry?: LeaderboardEntry
  error?: string
}

export type GameType = 'minesweeper'
export type MineweeperDifficulty = 'beginner' | 'intermediate' | 'expert'

export const GAME_CONFIGS = {
  minesweeper: {
    name: 'Minesweeper',
    difficulties: ['beginner', 'intermediate', 'expert'] as const,
    scoreMetric: 'time',
    unit: 'seconds',
    lowerIsBetter: true
  }
} as const

export const DIFFICULTY_NAMES = {
  beginner: 'Beginner',
  intermediate: 'Intermediate', 
  expert: 'Expert'
} as const