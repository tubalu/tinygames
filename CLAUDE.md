# Vue Minesweeper - Vue 3 Learning Project

## Change Log (Changelog)

- **2025-08-30**: **MAJOR UPDATE** - Completely rebuilt Minesweeper with authentic Windows 3.1 styling and functionality
  - ✅ **Authentic Windows 3.1 Design**: Pixel-perfect recreation with classic inset/outset borders, proper colors (#c0c0c0), and MS Sans Serif fonts
  - ✅ **Complete Difficulty System**: Added Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (30×16, 99 mines) levels
  - ✅ **Classic Game Menu**: Fully functional Game dropdown menu with difficulty selection and visual indicators
  - ✅ **Advanced Mouse Interactions**: Implemented simultaneous left+right click chord revealing (signature Windows 3.1 feature)
  - ✅ **Authentic Game Logic**: First click never hits mine, proper mine placement, recursive cell revealing, digital LED counters
  - ✅ **Window Chrome**: Complete window frame with title bar, menu bar, mine counter, timer, and smiley reset button
  - ✅ **Dynamic Board Sizing**: Game board automatically adapts to different difficulty levels with responsive design
- **2025-08-29**: Initial project documentation created. Comprehensive analysis of Vue 3 Minesweeper SPA with full testing setup.

## Project Vision

A Vue 3 learning project featuring an authentic Windows 3.1 Minesweeper game built with modern Vue.js ecosystem tools. This project demonstrates advanced Vue 3 Composition API patterns, complex event handling, reactive state management, and pixel-perfect CSS styling to recreate classic desktop software experiences in the browser.

## Architecture Overview

This is a single-page application (SPA) built with Vue 3 and TypeScript, following modern Vue.js best practices. The application features a clean component-based architecture with reactive state management and comprehensive testing coverage.

**Key Technologies:**
- Vue 3.5.11 with Composition API
- TypeScript 5.5.4 for type safety
- Vite 5.4.8 for fast development and building
- Pinia 2.2.4 for state management
- Vue Router 4.4.5 for navigation
- Vitest 2.1.2 for unit testing
- Playwright 1.48.0 for end-to-end testing

## Module Structure Diagram

```mermaid
graph TD
    A["(Root) Vue Minesweeper"] --> B["src"];
    B --> C["components"];
    B --> D["views"];
    B --> E["stores"];
    B --> F["assets"];
    A --> G["e2e"];
    
    C --> H["Minesweeper.vue"];
    C --> I["HelloWorld.vue"];
    C --> J["TheWelcome.vue"];
    C --> K["icons/"];
    
    D --> L["HomeView.vue"];
    D --> M["AboutView.vue"];
    
    E --> N["counter.ts"];
    
    G --> O["vue.spec.ts"];

    click C "./src/components/CLAUDE.md" "View components module docs"
    click D "./src/views/CLAUDE.md" "View views module docs"  
    click E "./src/stores/CLAUDE.md" "View stores module docs"
    click G "./e2e/CLAUDE.md" "View e2e tests module docs"
```

## Module Index

| Module | Path | Responsibility | Entry Points |
|--------|------|----------------|--------------|
| **Components** | `src/components/` | Reusable Vue components including main Minesweeper game | `Minesweeper.vue`, `HelloWorld.vue` |
| **Views** | `src/views/` | Vue Router page components | `HomeView.vue`, `AboutView.vue` |
| **Stores** | `src/stores/` | Pinia state management | `counter.ts` |
| **Assets** | `src/assets/` | Static assets and global styles | `main.css`, `base.css` |
| **E2E Tests** | `e2e/` | Playwright end-to-end tests | `vue.spec.ts` |

## Running and Development

### Prerequisites
- Node.js 20+ (configured via `.nvmrc`)
- npm or equivalent package manager

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Development Server
- **Development**: `http://localhost:5173`
- **Preview**: `http://localhost:4173`
- **Hot Module Replacement**: Enabled via Vite

## Testing Strategy

### Unit Testing (Vitest)
```bash
# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch
```

**Configuration**: `vitest.config.ts`
- Environment: jsdom for DOM simulation
- Framework: Vue Test Utils for component testing
- Current Coverage: Basic component rendering tests

### End-to-End Testing (Playwright)
```bash
# Install browser dependencies (first time)
npx playwright install

# Run e2e tests
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project=chromium

# Debug mode
npm run test:e2e -- --debug
```

**Configuration**: `playwright.config.ts`
- Browsers: Chromium, Firefox, WebKit
- Auto-start dev server for testing
- HTML reporter enabled

## Coding Standards

### TypeScript Configuration
- **Strict mode**: Enabled across all TypeScript configs
- **Module resolution**: Node with path aliases (`@` -> `./src`)
- **Target**: ES2020+ with modern features

### ESLint Configuration
```bash
# Lint and fix code
npm run lint

# Format code
npm run format
```

**Rules Applied**:
- Vue 3 essential rules via `eslint-plugin-vue`
- TypeScript integration via `@vue/eslint-config-typescript`
- Vitest testing rules for test files
- Playwright rules for e2e tests
- Prettier integration for consistent formatting

### Code Organization
- **Single File Components**: `.vue` files with `<script setup>` syntax
- **Composition API**: Preferred over Options API
- **TypeScript**: Strong typing for props, refs, and interfaces
- **CSS Modules**: Scoped styles in components

## AI Usage Guidelines

### Code Generation
When working with this Vue project, AI should focus on:
- **Component Development**: Creating reactive Vue components using Composition API
- **Type Safety**: Ensuring proper TypeScript interfaces and type definitions
- **Testing**: Writing comprehensive unit and integration tests
- **Performance**: Optimizing reactivity and component lifecycle

### Vue-Specific Patterns
- Use `<script setup>` for component logic
- Prefer `ref()` and `reactive()` for state management
- Implement proper prop validation with TypeScript
- Follow Vue 3 reactivity patterns

### Game Logic Considerations
The Minesweeper component demonstrates:
- **Advanced State Management**: Multiple reactive refs for game state, difficulty levels, mouse tracking, and menu visibility
- **Complex Event Handling**: Simultaneous mouse button detection, chord clicking, context menu prevention, and menu interaction
- **Sophisticated Algorithms**: Recursive cell revealing, mine placement with exclusions, adjacent mine calculation, and win condition detection  
- **Authentic Game Mechanics**: Windows 3.1 behavior patterns, digital timer/counter displays, dynamic board sizing, and proper game flow
- **Pixel-Perfect Styling**: CSS techniques for authentic Windows 3.1 appearance including inset/outset borders, proper color schemes, and classic fonts

### Development Workflow
1. **Component First**: Start with component interface design
2. **Type Safety**: Add TypeScript interfaces early
3. **Test Coverage**: Write tests alongside implementation
4. **Performance**: Consider reactivity patterns and unnecessary re-renders

---

*Documentation generated on 2025-08-29. For technical questions about Vue 3 patterns or project architecture, refer to the module-specific CLAUDE.md files.*