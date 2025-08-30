const PLAYER_NAME_KEY = 'minesweeper-player-name'

export class PlayerStorageService {
  /**
   * Get the previously saved player name from localStorage
   */
  static getSavedPlayerName(): string {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY) || ''
    } catch (error) {
      console.warn('Failed to retrieve player name from localStorage:', error)
      return ''
    }
  }

  /**
   * Save the player name to localStorage for future use
   */
  static savePlayerName(name: string): void {
    try {
      const trimmedName = name.trim()
      if (trimmedName) {
        localStorage.setItem(PLAYER_NAME_KEY, trimmedName)
      } else {
        // If empty name, remove the key
        localStorage.removeItem(PLAYER_NAME_KEY)
      }
    } catch (error) {
      console.warn('Failed to save player name to localStorage:', error)
    }
  }

  /**
   * Clear the saved player name
   */
  static clearPlayerName(): void {
    try {
      localStorage.removeItem(PLAYER_NAME_KEY)
    } catch (error) {
      console.warn('Failed to clear player name from localStorage:', error)
    }
  }

  /**
   * Check if localStorage is available
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}