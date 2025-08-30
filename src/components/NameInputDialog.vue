<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="name-input-window" @click.stop>
      <!-- Title bar -->
      <div class="title-bar">
        <span class="title-text">🏆 New High Score!</span>
        <button class="control-button close" @click="handleSkip">×</button>
      </div>
      
      <!-- Dialog content -->
      <div class="dialog-content">
        <div class="score-info">
          <p class="congratulations">Congratulations!</p>
          <p class="time-display">You finished {{ difficultyDisplay }} in {{ formatTime(score) }}!</p>
        </div>
        
        <div class="input-section">
          <label class="input-label">Enter your name for the global leaderboard:</label>
          <div class="input-wrapper">
            <input 
              ref="nameInputRef"
              v-model="playerName"
              type="text" 
              maxlength="20"
              placeholder="Your name (optional)"
              class="name-input"
              @keyup.enter="handleSubmit"
              @keyup.escape="handleSkip"
            />
          </div>
          <div class="input-hint">
            Leave blank to submit as "Anonymous"
          </div>
        </div>
        
        <!-- Button panel -->
        <div class="button-panel">
          <button 
            class="win-button submit" 
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : getSubmitButtonText() }}
          </button>
          <button 
            class="win-button skip" 
            @click="handleSkip"
            :disabled="isSubmitting"
          >
            Skip
          </button>
        </div>
        
        <!-- Error message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { PlayerStorageService } from '@/services/playerStorage'
import type { MineweeperDifficulty } from '@/types/leaderboard'
import { DIFFICULTY_NAMES } from '@/types/leaderboard'

interface Props {
  score: number
  difficulty: MineweeperDifficulty
}

interface Emits {
  (e: 'submit', data: { name: string, score: number }): void
  (e: 'skip'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const nameInputRef = ref<HTMLInputElement>()
const playerName = ref(PlayerStorageService.getSavedPlayerName() || '')
const isSubmitting = ref(false)
const errorMessage = ref('')

const difficultyDisplay = computed(() => DIFFICULTY_NAMES[props.difficulty])

const getSubmitButtonText = () => {
  const name = playerName.value.trim()
  return name ? 'Submit Score' : 'Submit as Anonymous'
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs} seconds`
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    const finalName = playerName.value.trim() || 'Anonymous'
    
    // Save the name for next time (only if not empty/Anonymous)
    if (finalName !== 'Anonymous') {
      PlayerStorageService.savePlayerName(finalName)
    }
    
    emit('submit', { name: finalName, score: props.score })
  } catch (error) {
    errorMessage.value = 'Failed to submit score. Please try again.'
    console.error('Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSkip = () => {
  emit('skip')
}

const handleBackdropClick = () => {
  handleSkip()
}

onMounted(async () => {
  // Focus and select the input text
  await nextTick()
  nameInputRef.value?.focus()
  nameInputRef.value?.select()
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
  padding: 20px;
}

.name-input-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-190px, -110px);
  background: #c0c0c0;
  border: 2px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  box-shadow: 
    inset 1px 1px 0px #ffffff,
    2px 2px 4px rgba(0, 0, 0, 0.3);
  width: 380px;
  height: 220px;
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

/* Dialog content */
.dialog-content {
  padding: 16px;
  height: calc(220px - 20px); /* Total height minus title bar */
  box-sizing: border-box;
  overflow: hidden;
}

.score-info {
  margin-bottom: 16px;
  text-align: center;
}

.congratulations {
  font-weight: bold;
  font-size: 12px;
  margin: 0 0 8px 0;
  color: #000080;
}

.time-display {
  margin: 0;
  font-size: 11px;
  color: #000000;
}

.input-section {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  color: #000000;
}

.input-wrapper {
  margin-bottom: 4px;
}

.name-input {
  width: 100%;
  padding: 2px 4px;
  border: 2px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  background: #ffffff;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  box-sizing: border-box;
}

.name-input:focus {
  outline: none;
  background: #ffffff;
}

.input-hint {
  font-size: 10px;
  color: #666666;
  font-style: italic;
}

/* Button panel */
.button-panel {
  display: flex;
  gap: 8px;
  justify-content: center;
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

.win-button.submit {
  font-weight: bold;
}

/* Error message */
.error-message {
  margin-top: 12px;
  padding: 8px;
  background: #ffe0e0;
  border: 1px solid #ff8080;
  color: #800000;
  font-size: 10px;
  text-align: center;
}

/* Animation */
.name-input-window {
  /* No animation - appears instantly to avoid positioning conflicts */
}
</style>