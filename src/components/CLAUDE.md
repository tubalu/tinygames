# Vue Components Module

[Root Directory](../../CLAUDE.md) > [src](../) > **components**

## Module Responsibilities

This module contains all reusable Vue components for the Minesweeper application. The centerpiece is a pixel-perfect recreation of Windows 3.1 Minesweeper with authentic styling, complete difficulty system, and advanced mouse interactions including the classic simultaneous left+right click chord feature.

## Entry and Startup

**Primary Component**: `Minesweeper.vue` (646 lines)
- **Authentic Windows 3.1 Minesweeper**: Pixel-perfect recreation with classic styling
- **Complete Difficulty System**: Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (30×16, 99 mines)
- **Advanced Mouse Interactions**: Simultaneous left+right click chord revealing
- **Authentic Game Mechanics**: First-click safety, proper mine placement, digital LED displays
- **Full Window Chrome**: Title bar, menu bar, status panel with mine counter and timer

**Template Components**:
- `HelloWorld.vue` - Basic greeting component with props
- `TheWelcome.vue` - Welcome screen with informational sections
- `WelcomeItem.vue` - Reusable welcome item template

## External Interfaces

### Minesweeper Component API
```typescript
// No props - self-contained game
// Emits: No custom events
// Exposes: Game state through reactive refs

interface Cell {
  isMine: boolean
  isRevealed: boolean  
  isFlagged: boolean
  adjacentMines: number
}

// Game state
const board = ref<Cell[][]>([])
const gameStatus = ref<'playing' | 'won' | 'lost'>('playing')
const timer = ref(0)
```

### HelloWorld Component API
```typescript
interface Props {
  msg: string  // Required greeting message
}
```

### Component Events
- **Mouse Events**: `@click`, `@contextmenu`, `@mousedown`, `@mouseup`
- **Game Events**: Internal state changes for win/lose conditions
- **Timer Events**: Automatic timer progression during gameplay

## Key Dependencies and Configuration

### Vue 3 Features Used
- **Composition API**: `ref()`, `computed()`, `onMounted()`, `onUnmounted()`
- **Reactive State**: Complex nested reactivity for game board
- **Event Handlers**: Mouse event handling with preventDefault
- **Lifecycle Hooks**: Component mounting and cleanup

### External Dependencies
- Vue 3.5.11 core reactivity system
- TypeScript for type safety and interfaces
- CSS scoped styles for component isolation

### Difficulty Configuration
```typescript
type Difficulty = 'beginner' | 'intermediate' | 'expert'

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
```

## Data Models

### Cell Interface
```typescript
interface Cell {
  isMine: boolean        // Contains a mine
  isRevealed: boolean    // Player has revealed this cell
  isFlagged: boolean     // Player has flagged as suspected mine
  adjacentMines: number  // Count of adjacent mines (0-8)
}
```

### Game State Types
```typescript
type GameStatus = 'playing' | 'won' | 'lost'

// Computed properties
const remainingMines = computed(() => MINES_COUNT - flaggedCellsCount)
```

## Testing and Quality

### Unit Tests
**Location**: `__tests__/HelloWorld.spec.ts`

```typescript
describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

### Testing Coverage
- ✅ Basic component rendering (HelloWorld)
- ❌ Minesweeper game logic testing (missing)
- ❌ User interaction testing (missing)
- ❌ Game state transition testing (missing)

### Recommended Test Additions
1. **Minesweeper Game Logic**:
   - Mine placement randomization
   - Adjacent mine calculation
   - Cell reveal recursion
   - Win/lose condition detection

2. **User Interaction**:
   - Left click cell revealing
   - Right click flag toggling
   - Both mouse buttons for adjacent reveal

3. **Game State**:
   - Timer functionality
   - Game reset behavior
   - Board initialization

## Frequently Asked Questions (FAQ)

### Q: How does the mine placement algorithm work?
A: Mines are placed randomly using `Math.random()` in a while loop until `MINES_COUNT` mines are placed. The algorithm ensures no duplicate mines by checking if a cell already contains a mine.

### Q: What is the adjacent reveal feature?
A: When both left and right mouse buttons are pressed on a revealed cell, if the number of adjacent flags equals the cell's number, all non-flagged adjacent cells are automatically revealed.

### Q: How is reactivity handled for the game board?
A: The game board is a `ref<Cell[][]>()` containing a 2D array of Cell objects. Vue 3's reactivity system tracks changes to nested objects automatically.

### Q: How does the difficulty system work?
A: The game features three classic difficulty levels matching Windows 3.1 Minesweeper exactly. Players can switch difficulties through the Game menu dropdown, which dynamically resizes the board and adjusts mine counts.

### Q: What makes this Windows 3.1 authentic?
A: Every detail matches the original: #c0c0c0 background color, inset/outset borders using CSS border-color, MS Sans Serif fonts, digital LED-style counters, exact number colors (blue=1, green=2, red=3, etc.), and authentic window chrome with title bar and menu.

## Related File List

### Component Files
- `Minesweeper.vue` - Main game component (325 lines)
- `HelloWorld.vue` - Template component with props
- `TheWelcome.vue` - Welcome screen composition  
- `WelcomeItem.vue` - Reusable welcome item template

### Icon Components
- `icons/IconCommunity.vue`
- `icons/IconDocumentation.vue`
- `icons/IconEcosystem.vue`
- `icons/IconSupport.vue`
- `icons/IconTooling.vue`

### Test Files
- `__tests__/HelloWorld.spec.ts` - Basic component test

## Change Log (Changelog)

- **2025-08-30**: **MAJOR UPDATE** - Complete Minesweeper overhaul to Windows 3.1 authentic version
  - ✅ **Pixel-Perfect Styling**: Authentic Windows 3.1 appearance with proper colors, borders, and fonts
  - ✅ **Complete Difficulty System**: All three classic levels (Beginner/Intermediate/Expert) with proper dimensions
  - ✅ **Advanced Interactions**: Simultaneous left+right click chord revealing, menu system, authentic mouse behaviors
  - ✅ **Game Mechanics**: First-click mine avoidance, digital counters, proper win/lose states, smiley button reactions
  - ✅ **Dynamic Sizing**: Board adapts to different difficulties with responsive design for Expert's wide 30×16 grid
- **2025-08-29**: Initial documentation. Minesweeper component analysis completed, identified testing gaps for game logic.