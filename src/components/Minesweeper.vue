<template>
  <div class="minesweeper" :class="{ 'win-celebration': celebrateWin }">
    <!-- Main window frame with Windows 3.1 style -->
    <div class="window-frame">
      <!-- Title bar -->
      <div class="title-bar">
        <span class="title-text">Minesweeper</span>
        <div class="window-controls">
          <button class="control-button minimize">_</button>
          <button class="control-button maximize">□</button>
          <button class="control-button close">×</button>
        </div>
      </div>
      
      <!-- Menu bar -->
      <div class="menu-bar">
        <div class="menu-item" @click.stop="toggleGameMenu" :class="{ active: gameMenuOpen }">
          Game
          <div v-if="gameMenuOpen" class="dropdown-menu" @click.stop>
            <div class="menu-option" @click="resetGame">New</div>
            <div class="menu-separator"></div>
            <div class="menu-option" @click="setDifficulty('beginner')" :class="{ checked: currentDifficulty === 'beginner' }">
              Beginner
            </div>
            <div class="menu-option" @click="setDifficulty('intermediate')" :class="{ checked: currentDifficulty === 'intermediate' }">
              Intermediate
            </div>
            <div class="menu-option" @click="setDifficulty('expert')" :class="{ checked: currentDifficulty === 'expert' }">
              Expert
            </div>
          </div>
        </div>
        <div class="menu-item" @click="showLeaderboard">Scores</div>
        <span class="menu-item">Help</span>
      </div>
      
      <!-- Status panel -->
      <div class="status-panel">
        <div class="mine-counter">
          <div class="digit-display">{{ String(remainingMines).padStart(3, '0').split('').join('') }}</div>
        </div>
        <button 
          class="smiley-button" 
          :class="{ 'pressed': smileyPressed }"
          @click="resetGame"
          @mousedown="smileyPressed = true"
          @mouseup="smileyPressed = false"
          @mouseleave="smileyPressed = false"
        >
          <span class="smiley">{{ getSmileyFace() }}</span>
        </button>
        <div class="timer-counter">
          <div class="digit-display">{{ String(Math.min(timer, 999)).padStart(3, '0').split('').join('') }}</div>
        </div>
      </div>
      
      <!-- Game board -->
      <div class="game-container" :class="`difficulty-${currentDifficulty}`">
        <div class="game-board" :class="{ 'game-over': gameStatus !== 'playing' }">
          <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
            <div
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              class="cell"
              :class="{
                'revealed': cell.isRevealed,
                'mine': cell.isMine && cell.isRevealed,
                'flagged': cell.isFlagged,
                'pressed': isPressedCell(rowIndex, colIndex),
                'mine-wrong': cell.isMine && gameStatus === 'lost' && !cell.isRevealed,
                'flag-wrong': !cell.isMine && cell.isFlagged && gameStatus === 'lost'
              }"
              @click="handleCellClick(rowIndex, colIndex)"
              @contextmenu.prevent="toggleFlag(rowIndex, colIndex)"
              @mousedown="handleMouseDown($event, rowIndex, colIndex)"
              @mouseup="handleMouseUp($event, rowIndex, colIndex)"
              @mouseleave="handleMouseLeave(rowIndex, colIndex)"
              @mouseenter="handleMouseEnter(rowIndex, colIndex)"
            >
              <span v-if="getCellDisplay(cell)" class="cell-content" :class="getCellClass(cell)">
                {{ getCellDisplay(cell) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Name Input Dialog -->
    <NameInputDialog
      v-if="showNameInputDialog"
      :score="timer"
      :difficulty="currentDifficulty"
      @submit="handleScoreSubmission"
      @skip="handleSkipSubmission"
      @close="showNameInputDialog = false"
    />

    <!-- Leaderboard Modal -->
    <LeaderboardModal
      v-if="showLeaderboardModal"
      :initial-game="'minesweeper'"
      :initial-difficulty="currentDifficulty"
      :highlight-entry-id="lastSubmittedEntryId"
      @close="showLeaderboardModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NameInputDialog from './NameInputDialog.vue'
import LeaderboardModal from './LeaderboardModal.vue'
import { useGlobalLeaderboard } from '@/composables/useGlobalLeaderboard'
import type { MineweeperDifficulty } from '@/types/leaderboard'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

// Classic Minesweeper difficulty settings (using imported type)
type Difficulty = MineweeperDifficulty

interface DifficultyConfig {
  width: number
  height: number
  mines: number
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 }
}

const currentDifficulty = ref<Difficulty>('beginner')
const gameMenuOpen = ref(false)

// Current game settings (reactive)
const boardWidth = computed(() => DIFFICULTY_CONFIGS[currentDifficulty.value].width)
const boardHeight = computed(() => DIFFICULTY_CONFIGS[currentDifficulty.value].height)
const minesCount = computed(() => DIFFICULTY_CONFIGS[currentDifficulty.value].mines)

const board = ref<Cell[][]>([])
const gameStatus = ref<'playing' | 'won' | 'lost'>('playing')
const timer = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const firstClick = ref(true)

// Mouse and interaction state
const mouseButtons = ref(new Set<number>())
const pressedCells = ref(new Set<string>())
const smileyPressed = ref(false)
const isMouseDown = ref(false)
const currentHoverCell = ref<{row: number, col: number} | null>(null)
const celebrateWin = ref(false)

// Leaderboard state
const showNameInputDialog = ref(false)
const showLeaderboardModal = ref(false)
const lastSubmittedEntryId = ref<string | undefined>(undefined)

// Leaderboard composable
const { submitScore } = useGlobalLeaderboard()

const remainingMines = computed(() => {
  const flaggedCount = board.value.flat().filter(cell => cell.isFlagged).length
  return minesCount.value - flaggedCount
})

function initializeBoard() {
  board.value = Array(boardHeight.value).fill(null).map(() =>
    Array(boardWidth.value).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0
    }))
  )
}

function placeMines(excludeRow: number, excludeCol: number) {
  let minesPlaced = 0
  while (minesPlaced < minesCount.value) {
    const row = Math.floor(Math.random() * boardHeight.value)
    const col = Math.floor(Math.random() * boardWidth.value)
    
    // Don't place mine on first clicked cell or if already has mine
    if ((row !== excludeRow || col !== excludeCol) && !board.value[row][col].isMine) {
      board.value[row][col].isMine = true
      minesPlaced++
    }
  }
  
  calculateAdjacentMines()
}

function calculateAdjacentMines() {
  for (let row = 0; row < boardHeight.value; row++) {
    for (let col = 0; col < boardWidth.value; col++) {
      if (!board.value[row][col].isMine) {
        let count = 0
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i
            const newCol = col + j
            if (newRow >= 0 && newRow < boardHeight.value && newCol >= 0 && newCol < boardWidth.value) {
              if (board.value[newRow][newCol].isMine) count++
            }
          }
        }
        board.value[row][col].adjacentMines = count
      }
    }
  }
}

function startTimer() {
  if (timerInterval.value === null) {
    timerInterval.value = setInterval(() => {
      if (timer.value < 999) timer.value++
    }, 1000)
  }
}

function stopTimer() {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function revealCell(row: number, col: number) {
  if (gameStatus.value !== 'playing' || board.value[row][col].isFlagged || board.value[row][col].isRevealed) return

  if (firstClick.value) {
    placeMines(row, col)
    firstClick.value = false
    startTimer()
  }

  if (board.value[row][col].isMine) {
    gameStatus.value = 'lost'
    board.value[row][col].isRevealed = true
    revealAllMines()
    stopTimer()
    return
  }

  revealCellRecursive(row, col)
  checkWinCondition()
}

function revealCellRecursive(row: number, col: number) {
  if (
    row < 0 || row >= boardHeight.value ||
    col < 0 || col >= boardWidth.value ||
    board.value[row][col].isRevealed ||
    board.value[row][col].isFlagged
  ) return

  board.value[row][col].isRevealed = true

  if (board.value[row][col].adjacentMines === 0) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        revealCellRecursive(row + i, col + j)
      }
    }
  }
}

function toggleFlag(row: number, col: number) {
  if (gameStatus.value !== 'playing' || board.value[row][col].isRevealed) return
  board.value[row][col].isFlagged = !board.value[row][col].isFlagged
}

function revealAllMines() {
  board.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMine && !cell.isRevealed) {
        cell.isRevealed = true
      }
    })
  })
}

function checkWinCondition() {
  const allNonMinesRevealed = board.value.every(row =>
    row.every(cell => cell.isMine || cell.isRevealed)
  )
  if (allNonMinesRevealed) {
    gameStatus.value = 'won'
    stopTimer()
    
    // Show name input dialog for leaderboard submission
    showNameInputDialog.value = true
    
    // Auto-flag all mines with animation
    autoFlagRemainingMines()
  }
}

function autoFlagRemainingMines() {
  const unflaggedMines: Array<{row: number, col: number}> = []
  
  // Find all unflagged mines
  board.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMine && !cell.isFlagged) {
        unflaggedMines.push({ row: rowIndex, col: colIndex })
      }
    })
  })
  
  // Flag them one by one with a nice animation
  unflaggedMines.forEach((mine, index) => {
    setTimeout(() => {
      board.value[mine.row][mine.col].isFlagged = true
      
      // Play a subtle sound effect (you can add actual sound later)
      if (index === unflaggedMines.length - 1) {
        // Trigger celebration effect when all flags are placed
        celebrateWin.value = true
        setTimeout(() => {
          celebrateWin.value = false
        }, 1000)
        console.log('🎉 All mines flagged!')
      }
    }, index * 100) // 100ms delay between each flag
  })
}

// Leaderboard handlers
async function handleScoreSubmission(data: { name: string, score: number }) {
  try {
    const entry = await submitScore({
      gameType: 'minesweeper',
      difficulty: currentDifficulty.value,
      score: data.score,
      playerName: data.name,
      gameConfig: {
        boardWidth: boardWidth.value,
        boardHeight: boardHeight.value,
        minesCount: minesCount.value
      }
    })

    if (entry) {
      lastSubmittedEntryId.value = entry.id
    }

    // Close name input dialog and show leaderboard
    showNameInputDialog.value = false
    showLeaderboardModal.value = true
  } catch (error) {
    console.error('Failed to submit score:', error)
    // Still show leaderboard even if submission failed
    showNameInputDialog.value = false
    showLeaderboardModal.value = true
  }
}

function handleSkipSubmission() {
  showNameInputDialog.value = false
  showLeaderboardModal.value = true
}

function showLeaderboard() {
  showLeaderboardModal.value = true
  gameMenuOpen.value = false
}

function resetGame() {
  gameStatus.value = 'playing'
  timer.value = 0
  firstClick.value = true
  pressedCells.value.clear()
  mouseButtons.value.clear()
  celebrateWin.value = false
  showNameInputDialog.value = false
  showLeaderboardModal.value = false
  lastSubmittedEntryId.value = undefined
  stopTimer()
  initializeBoard()
}

function getSmileyFace() {
  if (gameStatus.value === 'lost') return '😵'
  if (gameStatus.value === 'won') return '😎'
  if (isMouseDown.value) return '😮'
  return '🙂'
}

function getCellDisplay(cell: Cell) {
  if (cell.isFlagged) return '🚩'
  if (!cell.isRevealed) return ''
  if (cell.isMine) return '💣'
  if (cell.adjacentMines === 0) return ''
  return cell.adjacentMines.toString()
}

function getCellClass(cell: Cell) {
  if (cell.isRevealed && cell.adjacentMines > 0) {
    return `number-${cell.adjacentMines}`
  }
  return ''
}

function isPressedCell(row: number, col: number) {
  return pressedCells.value.has(`${row}-${col}`)
}

function handleCellClick(row: number, col: number) {
  if (gameStatus.value !== 'playing') return
  revealCell(row, col)
}

function handleMouseDown(event: MouseEvent, row: number, col: number) {
  event.preventDefault()
  mouseButtons.value.add(event.button)
  isMouseDown.value = true
  
  // Left button only - prepare for potential reveal
  if (event.button === 0 && !board.value[row][col].isRevealed && !board.value[row][col].isFlagged) {
    pressedCells.value.add(`${row}-${col}`)
  }
  
  // Both buttons pressed - chord click (Windows 3.1 feature)
  if (mouseButtons.value.has(0) && mouseButtons.value.has(2)) {
    handleChordClick(row, col)
  }
}

function handleMouseUp(event: MouseEvent, row: number, col: number) {
  const wasLeftButton = mouseButtons.value.has(0)
  const wasRightButton = mouseButtons.value.has(2)
  const wasBothButtons = wasLeftButton && wasRightButton
  
  mouseButtons.value.delete(event.button)
  isMouseDown.value = mouseButtons.value.size > 0
  
  // Clear all pressed cells when releasing any button
  if (mouseButtons.value.size === 0) {
    pressedCells.value.clear()
  }
  
  // Single left click reveal
  if (event.button === 0 && !wasRightButton && !wasBothButtons) {
    if (!board.value[row][col].isRevealed && !board.value[row][col].isFlagged) {
      revealCell(row, col)
    }
  }
}

function handleMouseLeave(row: number, col: number) {
  pressedCells.value.delete(`${row}-${col}`)
  currentHoverCell.value = null
}

function handleMouseEnter(row: number, col: number) {
  currentHoverCell.value = { row, col }
  
  // If mouse is down and we're entering a new cell, update pressed state
  if (mouseButtons.value.has(0) && !board.value[row][col].isRevealed && !board.value[row][col].isFlagged) {
    pressedCells.value.add(`${row}-${col}`)
  }
}

function handleChordClick(row: number, col: number) {
  if (!board.value[row][col].isRevealed) return
  
  const cell = board.value[row][col]
  if (cell.adjacentMines === 0) return
  
  // Count adjacent flags
  let flaggedCount = 0
  const adjacentCells: [number, number][] = []
  
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      
      const newRow = row + i
      const newCol = col + j
      
      if (newRow >= 0 && newRow < boardHeight.value && newCol >= 0 && newCol < boardWidth.value) {
        if (board.value[newRow][newCol].isFlagged) {
          flaggedCount++
        } else if (!board.value[newRow][newCol].isRevealed) {
          adjacentCells.push([newRow, newCol])
          pressedCells.value.add(`${newRow}-${newCol}`)
        }
      }
    }
  }
  
  // If enough flags are placed, reveal adjacent cells
  if (flaggedCount === cell.adjacentMines) {
    setTimeout(() => {
      adjacentCells.forEach(([adjRow, adjCol]) => {
        revealCell(adjRow, adjCol)
      })
      pressedCells.value.clear()
    }, 50)
  }
}

function setDifficulty(difficulty: Difficulty) {
  currentDifficulty.value = difficulty
  gameMenuOpen.value = false
  resetGame()
}

function toggleGameMenu() {
  gameMenuOpen.value = !gameMenuOpen.value
}

function closeMenus(event: Event) {
  // Only close if clicking outside the menu
  if (!(event.target as Element)?.closest('.menu-item')) {
    gameMenuOpen.value = false
  }
}

onMounted(() => {
  initializeBoard()
  
  // Handle global mouse up to clear pressed states
  document.addEventListener('mouseup', () => {
    mouseButtons.value.clear()
    isMouseDown.value = false
    pressedCells.value.clear()
  })
  
  // Close menus when clicking outside
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  stopTimer()
  document.removeEventListener('mouseup', () => {})
  document.removeEventListener('click', closeMenus)
})
</script>

<style scoped>
/* Windows 3.1 authentic styling */
@import url('https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap');

.minesweeper {
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #c0c0c0;
  margin: 0;
  padding: 20px;
  user-select: none;
}

/* Main window frame */
.window-frame {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  box-shadow: inset 1px 1px 0px #ffffff;
  min-width: fit-content;
  max-width: calc(100vw - 40px);
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
}

.title-text {
  padding-left: 4px;
}

.window-controls {
  display: flex;
  gap: 2px;
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

/* Menu bar */
.menu-bar {
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  padding: 4px 8px;
  display: flex;
  gap: 0;
  overflow: visible;
}

.menu-item {
  padding: 2px 8px;
  cursor: pointer;
  position: relative;
}

.menu-item:hover,
.menu-item.active {
  background: #0000ff;
  color: white;
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  min-width: 120px;
  z-index: 9999;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: 1px;
}

.menu-option {
  padding: 4px 16px;
  cursor: pointer;
  position: relative;
  background: #c0c0c0;
  color: black;
}

.menu-option:hover {
  background: #0000ff;
  color: white;
}

.menu-option.checked::before {
  content: '●';
  position: absolute;
  left: 4px;
  top: 4px;
  font-size: 8px;
}

.menu-separator {
  height: 1px;
  background: #808080;
  margin: 2px 0;
  border-bottom: 1px solid #dfdfdf;
}

/* Status panel */
.status-panel {
  background: #c0c0c0;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
}

.mine-counter, .timer-counter {
  background: #000000;
  border: 1px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  padding: 2px 4px;
  min-width: 36px;
  text-align: center;
}

.digit-display {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  color: #ff0000;
  letter-spacing: 1px;
}

.smiley-button {
  width: 24px;
  height: 24px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin: 0 8px;
}

.smiley-button:active,
.smiley-button.pressed {
  border-color: #808080 #dfdfdf #dfdfdf #808080;
}

.smiley {
  font-size: 16px;
  line-height: 1;
}

/* Game container */
.game-container {
  padding: 8px;
  background: #c0c0c0;
}

.game-container.difficulty-beginner {
  padding: 8px; /* Same padding as other difficulties */
}

.game-container.difficulty-intermediate {
  padding: 8px;
}

.game-container.difficulty-expert {
  padding: 8px;
}

/* Game board */
.game-board {
  border: 3px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background: #c0c0c0;
  display: inline-block;
  max-width: calc(100vw - 40px);
  overflow-x: auto;
}

.board-row {
  display: flex;
  height: 16px;
}

/* Cells */
.cell {
  width: 16px;
  height: 16px;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  background: #c0c0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  font-family: 'MS Sans Serif', sans-serif;
  position: relative;
  box-sizing: border-box;
}

.cell:hover:not(.revealed):not(.flagged) {
  background: #d4d0c8;
}

/* Pressed state */
.cell.pressed {
  border-color: #808080 #ffffff #ffffff #808080;
  background: #a0a0a0;
}

/* Revealed cells */
.cell.revealed {
  border: 1px solid #808080;
  background: #c0c0c0;
  cursor: default;
}

.cell.revealed:hover {
  background: #c0c0c0;
}

/* Flagged cells */
.cell.flagged {
  background: #c0c0c0;
  overflow: hidden; /* Prevent animation overflow */
}

.cell.flagged .cell-content {
  animation: flagContentAppear 0.3s ease-out;
}

@keyframes flagContentAppear {
  0% {
    opacity: 0;
    transform: translateY(-2px);
  }
  50% {
    opacity: 0.7;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mine cell when revealed */
.cell.mine {
  background: #ff0000;
}

/* Wrong flag (red X) */
.cell.flag-wrong {
  background: #c0c0c0;
  color: #000000;
}

.cell.flag-wrong::after {
  content: '❌';
  position: absolute;
  font-size: 8px;
}

/* Mine that wasn't flagged (dark mine) */
.cell.mine-wrong {
  background: #c0c0c0;
}

.cell.mine-wrong::after {
  content: '💣';
  position: absolute;
  font-size: 8px;
  filter: brightness(0.5);
}

/* Cell content */
.cell-content {
  line-height: 1;
  font-size: 9px;
  font-weight: bold;
}

/* Number colors - exact Windows 3.1 colors */
.number-1 { color: #0000ff; }
.number-2 { color: #008000; }
.number-3 { color: #ff0000; }
.number-4 { color: #000080; }
.number-5 { color: #800000; }
.number-6 { color: #008080; }
.number-7 { color: #000000; }
.number-8 { color: #808080; }

/* Game over state */
.game-over .cell {
  pointer-events: none;
}

/* Win celebration effect */
.win-celebration {
  animation: winFlash 1s ease-in-out;
}

@keyframes winFlash {
  0%, 100% { 
    filter: brightness(1); 
  }
  25% { 
    filter: brightness(1.3) saturate(1.2); 
  }
  50% { 
    filter: brightness(1.1) saturate(1.1); 
  }
  75% { 
    filter: brightness(1.2) saturate(1.15); 
  }
}

/* Disable context menu on the entire game */
.window-frame {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
