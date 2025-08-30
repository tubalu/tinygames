<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="leaderboard-window" @click.stop>
      <!-- Title bar -->
      <div class="title-bar">
        <span class="title-text">🏆 Global Leaderboard</span>
        <button class="control-button close" @click="handleClose">×</button>
      </div>
      
      <!-- Game tabs (for future multi-game support) -->
      <div class="game-tabs">
        <button 
          v-for="game in availableGames" 
          :key="game"
          :class="{ active: selectedGame === game }"
          @click="selectedGame = game"
          class="tab-button"
        >
          {{ gameDisplayNames[game] }}
        </button>
      </div>
      
      <!-- Difficulty tabs -->
      <div class="difficulty-tabs">
        <button 
          v-for="diff in availableDifficulties" 
          :key="diff"
          :class="{ active: selectedDifficulty === diff }"
          @click="handleDifficultyChange(diff)"
          class="tab-button"
          :disabled="isLoading"
        >
          {{ difficultyNames[diff] }}
        </button>
      </div>
      
      <!-- Leaderboard content -->
      <div class="leaderboard-content">
        <div v-if="isLoading" class="loading-state">
          <p>Loading scores...</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <p>Failed to load leaderboard</p>
          <button class="win-button" @click="fetchLeaderboard">Retry</button>
        </div>
        
        <div v-else-if="currentScores.length === 0" class="empty-state">
          <p>No scores yet for {{ difficultyNames[selectedDifficulty] }}.</p>
          <p>Be the first to set a record!</p>
        </div>
        
        <div v-else class="score-table-container">
          <table class="score-table">
            <thead>
              <tr>
                <th class="rank-col">Rank</th>
                <th class="name-col">Player</th>
                <th class="time-col">Time</th>
                <th class="date-col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(entry, index) in currentScores" 
                :key="entry.id"
                :class="{ 'highlight-row': isRecentEntry(entry) }"
              >
                <td class="rank-col">
                  <span class="rank-number">{{ index + 1 }}</span>
                  <span v-if="index === 0" class="trophy">🥇</span>
                  <span v-else-if="index === 1" class="trophy">🥈</span>
                  <span v-else-if="index === 2" class="trophy">🥉</span>
                </td>
                <td class="name-col">{{ entry.playerName }}</td>
                <td class="time-col">{{ formatTime(entry.score) }}</td>
                <td class="date-col">{{ formatDate(entry.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Footer buttons -->
      <div class="button-panel">
        <button class="win-button" @click="fetchLeaderboard" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
        <button class="win-button" @click="handleClose">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { 
  LeaderboardEntry, 
  GameType, 
  MineweeperDifficulty 
} from '@/types/leaderboard'
import { GAME_CONFIGS, DIFFICULTY_NAMES } from '@/types/leaderboard'

interface Props {
  initialGame?: GameType
  initialDifficulty?: MineweeperDifficulty
  highlightEntryId?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialGame: 'minesweeper',
  initialDifficulty: 'beginner'
})

const emit = defineEmits<Emits>()

// State
const selectedGame = ref<GameType>(props.initialGame)
const selectedDifficulty = ref<MineweeperDifficulty>(props.initialDifficulty)
const currentScores = ref<LeaderboardEntry[]>([])
const isLoading = ref(false)
const error = ref(false)

// Computed
const availableGames = computed(() => Object.keys(GAME_CONFIGS) as GameType[])
const availableDifficulties = computed(() => GAME_CONFIGS[selectedGame.value].difficulties)
const difficultyNames = computed(() => DIFFICULTY_NAMES)

const gameDisplayNames: Record<GameType, string> = {
  minesweeper: 'Minesweeper'
}

// Methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
}

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

const isRecentEntry = (entry: LeaderboardEntry): boolean => {
  return entry.id === props.highlightEntryId
}

const fetchLeaderboard = async () => {
  isLoading.value = true
  error.value = false
  
  try {
    const response = await fetch(
      `/api/leaderboard/get?game=${selectedGame.value}&difficulty=${selectedDifficulty.value}&limit=50`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard')
    }
    
    const data = await response.json()
    currentScores.value = data.leaderboard || []
  } catch (err) {
    console.error('Fetch leaderboard error:', err)
    error.value = true
    currentScores.value = []
  } finally {
    isLoading.value = false
  }
}

const handleDifficultyChange = (difficulty: MineweeperDifficulty) => {
  selectedDifficulty.value = difficulty
}

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

// Watchers
watch([selectedGame, selectedDifficulty], () => {
  fetchLeaderboard()
}, { immediate: false })

// Lifecycle
onMounted(() => {
  fetchLeaderboard()
})
</script>

<style scoped>
/* Windows 3.1 Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
}

.leaderboard-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  box-shadow: 
    inset 1px 1px 0px #ffffff,
    2px 2px 4px rgba(0, 0, 0, 0.3);
  width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Title bar */
.title-bar {
  background: linear-gradient(90deg, #0000ff 0%, #000080 100%);
  color: white;
  padding: 2px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}

.title-text {
  padding-left: 4px;
}

.control-button {
  background: #c0c0c0;
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  width: 16px;
  height: 14px;
  font-size: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: black;
}

.control-button:active {
  border-color: #808080 #dfdfdf #dfdfdf #808080;
}

/* Tabs */
.game-tabs, .difficulty-tabs {
  display: flex;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
}

.tab-button {
  padding: 4px 12px;
  background: #c0c0c0;
  border: none;
  border-right: 1px solid #808080;
  cursor: pointer;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  color: #000000;
  min-width: 80px;
}

.tab-button:hover:not(:disabled) {
  background: #d4d0c8;
}

.tab-button.active {
  background: #ffffff;
  border-bottom: 2px solid #ffffff;
  font-weight: bold;
}

.tab-button:disabled {
  color: #808080;
  cursor: not-allowed;
}

/* Leaderboard content */
.leaderboard-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #000000;
}

.error-state .win-button {
  margin-top: 8px;
}

/* Score table */
.score-table-container {
  overflow: auto;
  max-height: 400px;
}

.score-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
}

.score-table th {
  background: #c0c0c0;
  border: 1px solid #808080;
  padding: 4px 8px;
  text-align: left;
  font-weight: bold;
  position: sticky;
  top: 0;
}

.score-table td {
  border: 1px solid #c0c0c0;
  padding: 4px 8px;
  background: #ffffff;
}

.score-table tr:nth-child(even) td {
  background: #f0f0f0;
}

.score-table tr.highlight-row td {
  background: #ffff80;
  font-weight: bold;
}

.rank-col {
  width: 60px;
  text-align: center;
}

.name-col {
  width: 40%;
  min-width: 120px;
}

.time-col {
  width: 80px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.date-col {
  width: 100px;
  text-align: center;
}

.rank-number {
  font-weight: bold;
}

.trophy {
  margin-left: 4px;
  font-size: 10px;
}

/* Button panel */
.button-panel {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #808080;
  background: #c0c0c0;
  flex-shrink: 0;
}

.win-button {
  min-width: 80px;
  height: 23px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  cursor: pointer;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  font-weight: normal;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.win-button:hover:not(:disabled) {
  background: #d4d0c8;
}

.win-button:active:not(:disabled) {
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  background: #a0a0a0;
}

.win-button:disabled {
  color: #808080;
  cursor: not-allowed;
}

/* Animation */
.leaderboard-window {
  animation: dialogAppear 0.3s ease-out;
}

@keyframes dialogAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>