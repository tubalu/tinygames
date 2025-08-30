import { ref } from 'vue'
import type { 
  LeaderboardEntry, 
  ScoreSubmission, 
  LeaderboardResponse, 
  SubmissionResponse 
} from '@/types/leaderboard'

export const useGlobalLeaderboard = () => {
  const isSubmitting = ref(false)
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  /**
   * Submit a new score to the global leaderboard
   */
  const submitScore = async (submission: ScoreSubmission): Promise<LeaderboardEntry | null> => {
    if (isSubmitting.value) {
      throw new Error('Already submitting a score')
    }

    isSubmitting.value = true
    error.value = null

    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      })

      const data: SubmissionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.success || !data.entry) {
        throw new Error('Invalid response from server')
      }

      return data.entry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      console.error('Score submission failed:', err)
      throw new Error(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Fetch leaderboard for a specific game and difficulty
   */
  const getLeaderboard = async (
    gameType: string, 
    difficulty: string, 
    limit = 50
  ): Promise<LeaderboardEntry[]> => {
    isFetching.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        game: gameType,
        difficulty: difficulty,
        limit: limit.toString()
      })

      const response = await fetch(`/api/leaderboard/get?${params}`)
      const data: LeaderboardResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      return data.leaderboard || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      error.value = errorMessage
      console.error('Leaderboard fetch failed:', err)
      throw new Error(errorMessage)
    } finally {
      isFetching.value = false
    }
  }

  /**
   * Check if a score would qualify for the leaderboard top N
   */
  const checkIfHighScore = async (
    gameType: string,
    difficulty: string,
    score: number,
    topN = 50
  ): Promise<boolean> => {
    try {
      const leaderboard = await getLeaderboard(gameType, difficulty, topN)
      
      // If leaderboard has fewer than topN entries, it's definitely a high score
      if (leaderboard.length < topN) {
        return true
      }

      // For minesweeper (lower score is better), check if score is better than worst
      const worstScore = leaderboard[leaderboard.length - 1]?.score
      if (worstScore !== undefined) {
        return score < worstScore // Lower time is better for minesweeper
      }

      return true
    } catch (err) {
      console.error('High score check failed:', err)
      // If we can't check, assume it's a high score to be safe
      return true
    }
  }

  /**
   * Get current user's rank for a specific difficulty
   */
  const getUserRank = async (
    gameType: string,
    difficulty: string,
    playerName: string
  ): Promise<number | null> => {
    try {
      const leaderboard = await getLeaderboard(gameType, difficulty, 100)
      const userEntry = leaderboard.find(entry => entry.playerName === playerName)
      
      if (userEntry) {
        return leaderboard.indexOf(userEntry) + 1
      }

      return null
    } catch (err) {
      console.error('User rank check failed:', err)
      return null
    }
  }

  /**
   * Clear any error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    isSubmitting,
    isFetching,
    error,
    
    // Methods
    submitScore,
    getLeaderboard,
    checkIfHighScore,
    getUserRank,
    clearError
  }
}