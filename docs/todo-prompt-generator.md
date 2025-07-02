# Todo Prompt Generator - Master Autonomous Game Development Guide

## Purpose
This document provides the exact instructions needed to transform any game specification (spec.md) into a comprehensive, autonomous development plan (todo.md) that enables an AI agent to build fully functional, visually-intensive games that work seamlessly across both mobile and desktop platforms without human intervention.

## Core Principles of Autonomous Game Development

### 1. Visual Verification First
**Never trust console logs alone.** Every feature must be visually verifiable through automated DOM inspection, visual state comparison, and actual gameplay testing on both mobile and desktop viewports.

### 2. Mobile-First Game Design
Build mobile experience first with touch controls, then enhance for desktop. Every game mechanic must work flawlessly on touch devices before adding keyboard/mouse enhancements. Target 320px-428px mobile viewports as primary.

### 3. Beautiful Visual Intensity
Games should be visually stunning with smooth animations, particle effects, glowing elements, and polished aesthetics. 60 FPS is non-negotiable. Visual feedback for every interaction within 50ms.

### 4. Phase -1 is Mandatory
ALWAYS start with cursor rules and Makefile generation. This phase must be completed before any code is written. No exceptions.

### 5. Git-Driven Development
Commit early and often. Create commits after each successful phase, before risky changes, and when visual tests pass. Use descriptive commit messages.

### 6. Unified Input Architecture
Single methods handle touch, mouse, and keyboard input. No separate mobile/desktop code paths. One codebase, multiple input methods.

### 7. PWA by Default
Every game is a Progressive Web App with offline capability, installable on home screens, and native app-like experience.

## Critical Todo.md Structure

### Phase -1: MANDATORY INITIALIZATION (DO THIS FIRST - NO EXCEPTIONS)
```markdown
## Phase -1: Project Initialization & Development Environment
### CRITICAL: DO THESE FIRST - BEFORE ANY OTHER WORK

### -1.1 Cursor Rule Creation (MANDATORY FIRST STEP)
- [ ] Create `.cursorrules` file with game-specific development principles
- [ ] Include: mobile-first, visual verification, git workflow, PWA requirements
- [ ] Include: specific game mechanics and visual style from spec
- [ ] Include: performance targets (60 FPS mobile, <50ms touch response)
- [ ] Enable cursor rule and keep active throughout development

### -1.2 Claude Context File Creation (MANDATORY SECOND STEP)
- [ ] Create `CLAUDE.md` file for AI assistant context
- [ ] Include complete project overview and current state
- [ ] Add file structure map and key file locations
- [ ] Specify testing procedures and success criteria
- [ ] Include common commands and debugging procedures
- [ ] Update after each major phase completion

### -1.3 Makefile Generation (MANDATORY THIRD STEP)
- [ ] Create comprehensive Makefile with all cross-platform commands
- [ ] Include mobile-ready server (0.0.0.0 binding)
- [ ] Add visual test commands
- [ ] Include git workflow helpers
- [ ] Add PWA testing commands

### -1.4 Git Repository Initialization (MANDATORY FOURTH STEP)
- [ ] Initialize git repository
- [ ] Create .gitignore for game assets and test files:
  ```
  tests/*.html
  tests/test_results/
  tests/screenshots/
  *.log
  .DS_Store
  node_modules/
  ```
- [ ] Make initial commit with project structure
- [ ] Set up commit message conventions
```

### Phase 0: Visual Test Infrastructure (ALWAYS SECOND)
```markdown
## Phase 0: Mobile-First Environment & Visual Test Infrastructure
### ALWAYS START HERE AFTER PHASE -1 - NO EXCEPTIONS

### 0.1 Mobile-First Project Structure
- [ ] Create mobile-optimized directory structure:
  ```
  project-root/
  ├── index.html
  ├── manifest.json
  ├── service-worker.js
  ├── assets/
  │   ├── sprites/
  │   ├── audio/
  │   └── fonts/
  ├── styles/
  │   ├── mobile.css
  │   └── desktop.css
  ├── scripts/
  │   └── game.js
  └── tests/
      ├── mobile_test.html
      ├── visual_test.html
      ├── touch_test.html
      ├── render_verify.html
      ├── debug_render.html
      └── test_runner.js
  ```
- [ ] Set up asset organization (sprites, audio, effects)
- [ ] Create cache-busting HTML templates
- [ ] Configure mobile viewport settings

### 0.2 Visual Test Harness
- [ ] Create tests/mobile_test.html for touch interaction testing
- [ ] Create tests/visual_test.html for cross-platform verification
- [ ] Create tests/touch_test.html for gesture recognition
- [ ] Create tests/render_verify.html for rendering verification
- [ ] Create tests/debug_render.html for performance debugging
- [ ] Build automated visual diff tools in tests/
- [ ] Set up performance monitoring (FPS, memory, touch latency)
- [ ] Create gesture recognition testing (swipe, tap, pinch)

### 0.3 Game Engine Setup (if applicable)
- [ ] Initialize game engine with mobile-first config
- [ ] Set up responsive canvas/viewport scaling
- [ ] Configure touch event handling
- [ ] Test basic rendering on mobile devices
```

## Makefile Template (Auto-Include in Every Project)

```makefile
.PHONY: serve test visual-test mobile-test touch-test device-test verify-render clean-cache debug-render auto-test game-test pwa-test git-init git-phase git-checkpoint force-serve

# Core development server (mobile-ready)
serve:
	@python3 -m http.server 8000 --bind 0.0.0.0 || python -m SimpleHTTPServer 8000

# Kill existing servers and run
force-serve:
	@echo "Stopping any existing servers..."
	@pkill -f "python.*http.server" || true
	@sleep 1
	@echo "Starting server on http://localhost:8000"
	@python3 -m http.server 8000

# Cross-platform game testing
game-test:
	@open http://localhost:8000/index.html || xdg-open http://localhost:8000/index.html

# Mobile-specific testing
mobile-test:
	@open http://localhost:8000/tests/mobile_test.html || xdg-open http://localhost:8000/tests/mobile_test.html

# Touch control testing
touch-test:
	@open http://localhost:8000/tests/touch_test.html || xdg-open http://localhost:8000/tests/touch_test.html

# Visual verification
visual-test:
	@open http://localhost:8000/tests/visual_test.html || xdg-open http://localhost:8000/tests/visual_test.html

# Device testing information
device-test:
	@echo "Connect mobile device and navigate to:"
	@echo "http://$(shell ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}'):8000/"
	@echo ""
	@echo "Game features:"
	@echo "  • Touch controls + gesture recognition"
	@echo "  • PWA installation support"
	@echo "  • Offline gameplay capability"
	@echo "  • 60 FPS performance target"

# Render verification
verify-render:
	@open http://localhost:8000/tests/render_verify.html

# Cache management
clean-cache:
	@echo "Desktop: Ctrl+Shift+R (Win/Linux) or Cmd+Shift+R (Mac)"
	@echo "Mobile Safari: Settings > Safari > Clear History and Website Data"
	@echo "Chrome Mobile: Menu > History > Clear browsing data"

# Debug render pipeline
debug-render:
	@open http://localhost:8000/tests/debug_render.html

# Automated test suite
auto-test:
	@node tests/test_runner.js || python tests/test_runner.py

# PWA testing
pwa-test:
	@open http://localhost:8000/tests/pwa_test.html

# Git workflow helpers
git-init:
	@git init
	@echo "tests/*.html" >> .gitignore
	@echo "tests/test_results/" >> .gitignore
	@echo "*.log" >> .gitignore
	@echo ".DS_Store" >> .gitignore
	@echo "# Game Project" > README.md
	@echo "See CLAUDE.md for development context" >> README.md
	@touch CLAUDE.md
	@git add -A
	@git commit -m "Initial commit: Mobile-first game setup"

git-phase:
	@git add -A
	@git status
	@echo "Ready to commit phase completion. Use: git commit -m 'Phase X: Description'"

git-checkpoint:
	@git add -A
	@git commit -m "Checkpoint: Working game state before next feature"

# Development workflow
start: serve
	@sleep 2
	@make game-test
```

## Claude Context File Template (CLAUDE.md)

```markdown
# [Game Name] - Claude AI Development Context

## Project Overview
[Brief description of the game, its core mechanics, and target audience]

## Current Development Status
- **Current Phase**: Phase X - [Description]
- **Last Completed**: [What was just finished]
- **Next Steps**: [What needs to be done next]
- **Known Issues**: [Any current bugs or problems]

## Project Structure
```
project-root/
├── index.html          # Main game file
├── CLAUDE.md          # This file - AI context
├── .cursorrules       # Cursor IDE rules
├── Makefile           # Build commands
├── manifest.json      # PWA manifest
├── service-worker.js  # Offline support
├── assets/
│   ├── sprites/       # Game graphics
│   ├── audio/         # Sound effects
│   └── fonts/         # Typography
├── styles/
│   ├── mobile.css     # Mobile-first styles
│   └── desktop.css    # Desktop enhancements
├── scripts/
│   └── game.js        # Main game logic
└── tests/
    ├── mobile_test.html    # Touch testing
    ├── visual_test.html    # Cross-platform
    └── test_runner.js      # Automated tests
```

## Key Development Principles
1. **Mobile-First**: Always test on 320px viewport first
2. **Visual Verification**: Test in browser, not console
3. **60 FPS Required**: Performance is non-negotiable
4. **Touch Before Mouse**: Implement touch controls first
5. **Git Commits**: After each successful phase

## Testing Procedures
```bash
# Start development server
make serve

# Test mobile experience first
make mobile-test

# Verify visual elements
make visual-test

# Check performance
make debug-render
```

## Success Criteria for Current Phase
- [ ] [Specific measurable outcome 1]
- [ ] [Specific measurable outcome 2]
- [ ] [Specific measurable outcome 3]

## Common Issues & Solutions
1. **Touch not working**: Check tests/touch_test.html
2. **Performance issues**: Run tests/debug_render.html
3. **Visual glitches**: Use tests/visual_test.html

## Important Code Patterns
```javascript
// Unified input handler (use this pattern)
class UnifiedInput {
  handleInput(action, inputType) {
    // Single method for all inputs
  }
}

// Game state management (use this pattern)
const GameStates = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused'
};
```

## Performance Targets
- Mobile: 60 FPS on iPhone SE
- Touch response: <50ms
- Load time: <3 seconds on 3G
- Memory: <100MB usage

## Next Phase Planning
[Description of what the next phase will implement]

## Notes for Claude
- Always run visual tests before claiming completion
- Update this file after major changes
- Commit to git after each successful phase
- Test on mobile viewport (320px) first
- Keep all test files in tests/ directory
```

### When to Update CLAUDE.md
- **After each phase completion**: Update current status and next steps
- **When encountering bugs**: Document in Known Issues section
- **After major refactoring**: Update code patterns and structure
- **When changing approach**: Document why and what changed
- **Before switching contexts**: Ensure next session has full context

## Cursor Rules vs CLAUDE.md

### Cursor Rules (.cursorrules)
- **Purpose**: Real-time coding assistance in Cursor IDE
- **Format**: Brief, rule-based directives
- **Scope**: General development principles
- **Updates**: Rarely, only for major principle changes

### CLAUDE.md
- **Purpose**: Comprehensive context for AI assistants
- **Format**: Detailed documentation with examples
- **Scope**: Current project state, specific issues, next steps
- **Updates**: Frequently, after each phase or major change

Both files serve different but complementary purposes in autonomous development.

## Cursor Rules Template (MUST BE CREATED IN PHASE -1)

```
Mobile-First Game Development Rules for [GAME NAME]:

1. VISUAL VERIFICATION: Test every feature visually in browser, never trust console logs alone
2. MOBILE FIRST: Implement touch controls before keyboard/mouse. Test on 320px-428px viewports
3. PERFORMANCE: Maintain 60 FPS on mobile. Touch response must be <50ms
4. UNIFIED INPUT: Single methods handle touch/mouse/keyboard (no separate code paths)
5. GIT WORKFLOW: Commit after each phase, before risks, when tests pass
6. VISUAL POLISH: Every interaction needs visual feedback. Smooth animations mandatory
7. PWA FEATURES: Include manifest.json, service worker, offline capability
8. TOUCH TARGETS: Minimum 44px for all interactive elements
9. GESTURE SUPPORT: Implement swipe/tap/long-press where appropriate
10. CACHE BUSTING: Include cache headers in every HTML file

Game-Specific Rules:
- [Include specific visual style from spec]
- [Include core game mechanics]
- [Include performance requirements]
- [Include special features]
```

## Rules for Extracting Game Information from Spec.md

### 1. Identify Core Game Mechanics
- **Game Type**: Platformer, puzzle, arcade, strategy, etc.
- **Core Loop**: What does the player do repeatedly?
- **Win/Loss Conditions**: How does the game end?
- **Scoring System**: How is progress measured?

### 2. Extract Visual Requirements
- **Art Style**: Pixel art, vector, realistic, stylized
- **Color Palette**: Specific colors mentioned
- **Effects**: Particles, glow, shadows, animations
- **UI Style**: HUD layout, menu design, button styles

### 3. Determine Input Requirements
- **Mobile Controls**: Touch zones, gestures, virtual buttons
- **Desktop Controls**: Keyboard mappings, mouse interactions
- **Special Inputs**: Accelerometer, haptic feedback, audio

### 4. Performance Specifications
- **Target FPS**: Usually 60 FPS for action games
- **Target Devices**: Mobile-first means iPhone SE baseline
- **Memory Constraints**: Important for mobile browsers
- **Network Requirements**: Offline capability needed?

### 5. Technical Stack
- **Engine**: Phaser.js, Three.js, Canvas API, DOM-based
- **Dependencies**: External libraries or pure vanilla JS
- **Asset Pipeline**: Sprite sheets, audio formats, fonts

## Game-Specific Phase Templates

### For Arcade/Action Games (Tetris, Snake, Platformers)
```markdown
## Phase 1: Mobile-First Core Gameplay
### 1.1 Touch Control System
- [ ] Implement virtual D-pad or swipe gestures
- [ ] Add visual feedback for touch zones
- [ ] Test gesture recognition accuracy in tests/touch_test.html
- [ ] Ensure 44px+ touch targets
- [ ] Verify controls in tests/mobile_test.html

### 1.2 Game Physics/Movement
- [ ] Character/piece movement with touch
- [ ] Collision detection optimization for mobile
- [ ] Smooth animations at 60 FPS
- [ ] Haptic feedback for collisions
- [ ] Performance verification in tests/visual_test.html

### 1.3 Mobile HUD
- [ ] Score/lives display optimized for small screens
- [ ] Pause button in thumb-friendly location
- [ ] Responsive text sizing
- [ ] High contrast for outdoor visibility
```

### For Puzzle/Strategy Games (Card Games, Match-3)
```markdown
## Phase 1: Mobile-First Board/Grid System
### 1.1 Touch-Optimized Grid
- [ ] Responsive grid that fits mobile screens
- [ ] Touch-friendly tile/card sizes
- [ ] Drag and drop with visual feedback
- [ ] Pinch-to-zoom for detailed view

### 1.2 Game State Management
- [ ] Turn-based logic with animations
- [ ] Undo/redo with visual transitions
- [ ] Auto-save game state
- [ ] Offline persistence
```

### For Educational/Quiz Games (Flashcards)
```markdown
## Phase 1: Mobile-First Learning Interface
### 1.1 Content Presentation
- [ ] Readable text on small screens
- [ ] Touch-friendly answer selection
- [ ] Progress visualization
- [ ] Gesture-based navigation

### 1.2 Feedback System
- [ ] Immediate visual feedback for answers
- [ ] Celebration animations for correct
- [ ] Gentle correction for wrong answers
- [ ] Progress tracking visualization
```

## Visual Effects & Polish Requirements

### Mobile-First Visual Effects
```markdown
### Essential Visual Feedback (Mobile)
- [ ] Touch ripple effects at contact point
- [ ] Button press states (scale/glow)
- [ ] Smooth transitions between states
- [ ] Loading states with progress
- [ ] Error states with helpful messages

### Performance-Safe Effects
- [ ] CSS animations preferred over JS
- [ ] GPU-accelerated transforms only
- [ ] Particle effects with object pooling
- [ ] Efficient sprite batching
- [ ] Texture atlases for mobile
```

### Game Feel Enhancements
```markdown
### Juice & Polish
- [ ] Screen shake for impacts (optional toggle)
- [ ] Glow effects for important elements
- [ ] Smooth camera movements
- [ ] Parallax backgrounds (performance permitting)
- [ ] Dynamic music/sound (future enhancement)
```

## PWA Requirements for Games

### Manifest.json Template
```json
{
  "name": "[Full Game Name]",
  "short_name": "[Short Name]",
  "description": "[Game Description]",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "portrait",
  "background_color": "#000000",
  "theme_color": "#00ffff",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Service Worker Features
```javascript
// Essential game caching (exclude test files)
const GAME_ASSETS = [
  '/',
  '/index.html',
  '/styles/game.css',
  '/scripts/game.js',
  // All sprite sheets
  // All audio files
  // All level data
  // NOTE: Do NOT cache tests/ directory
];

// Skip caching for test files
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/tests/')) {
    return; // Always fetch test files fresh
  }
  // Normal caching logic here
});
```

## Mobile-Specific Considerations

### Touch Gesture Patterns
```markdown
### Common Game Gestures
- **Tap**: Primary action (shoot, jump, select)
- **Swipe**: Directional movement (min 30px threshold)
- **Long Press**: Secondary action (power-up, menu)
- **Pinch**: Zoom in/out for strategic view
- **Double Tap**: Special action (boost, special move)

### Gesture Conflict Resolution
- Prevent browser defaults (pull-to-refresh, zoom)
- Handle multi-touch appropriately
- Gesture dead zones to prevent accidents
- Visual feedback for gesture recognition
```

### Performance Optimization Checklist
```markdown
### Mobile Performance Must-Haves
- [ ] RequestAnimationFrame for game loop
- [ ] Object pooling for frequently created objects
- [ ] Texture atlases to reduce draw calls
- [ ] Efficient collision detection (spatial hashing)
- [ ] Progressive asset loading
- [ ] Memory cleanup between levels
- [ ] Battery-efficient render cycles
```

## Cross-Platform Testing Protocol

### Device Testing Matrix
```markdown
### Primary Mobile Targets
- [ ] iPhone SE (375x667) - Smallest target
- [ ] iPhone 12/13 (390x844) - Most common
- [ ] iPhone 14 Pro Max (430x932) - Largest
- [ ] iPad (768x1024) - Tablet experience

### Desktop Targets
- [ ] 1920x1080 - Standard desktop
- [ ] 1366x768 - Common laptop
- [ ] 2560x1440 - High-res desktop
```

### Performance Benchmarks
```markdown
### Minimum Performance Requirements
- Mobile: 60 FPS during gameplay
- Desktop: 60+ FPS with enhanced effects
- Touch latency: <50ms response time
- Load time: <3 seconds on 3G
- Memory: <100MB for mobile
- Battery: 2+ hours continuous play
```

## Common Game Patterns

### State Management
```markdown
const GameStates = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

// Single state handler
function updateGameState(newState) {
  // Handle all transitions in one place
  // Update UI, pause/resume game loop
  // Trigger animations, save progress
}
```

### Unified Input Handler
```markdown
class UnifiedInput {
  constructor(game) {
    this.setupTouch();    // Mobile first
    this.setupKeyboard(); // Desktop enhancement
    this.setupMouse();    // Additional desktop
  }
  
  handleAction(action, inputType) {
    // Single method for all input types
    // Same game response regardless of input
  }
}
```

## Example Todo.md Structure

```markdown
# [Game Name] - Fully Autonomous Mobile-First Development Plan

## Critical Success Factors
- Mobile-first gameplay with perfect touch controls
- 60 FPS performance on iPhone SE and up
- Beautiful visual effects and smooth animations
- PWA installable with offline play
- Cross-platform unified codebase
- Zero configuration deployment

## Phase -1: Mandatory Initialization
### -1.1 Cursor Rules [ALWAYS FIRST]
### -1.2 CLAUDE.md Context File [ALWAYS SECOND]
### -1.3 Makefile Generation [ALWAYS THIRD]
### -1.4 Git Init with proper .gitignore [ALWAYS FOURTH]

## Phase 0: Visual Test Infrastructure
### 0.1 Create test directory structure
### 0.2 Build tests/mobile_test.html
### 0.3 Build tests/visual_test.html
### 0.4 Set up automated test runner

## Phase 1: Mobile-First Core Gameplay
[Touch controls and basic game loop]

## Phase 2: Desktop Enhancement
[Keyboard/mouse without breaking mobile]

## Phase 3: Visual Polish & Effects
[Particles, animations, juice]

## Phase 4: Game States & UI
[Menus, pause, game over, victory]

## Phase 5: PWA & Performance
[Offline, installation, optimization]

## Phase 6: Cross-Platform Testing
[Device matrix, performance validation]

## Debugging Procedures
[Platform-specific troubleshooting]

## Success Criteria
[Measurable outcomes for completion]
```

## Key Reminders for Autonomous Agents

1. **Phase -1 ALWAYS comes first** - No code before cursor rules, CLAUDE.md, and Makefile
2. **Mobile viewport 320px-428px** is primary target, desktop is enhancement
3. **Visual test every feature** - If you can't see it working, it's not done
4. **Commit after every phase** - Git history shows progress
5. **Touch first, keyboard second** - Mobile controls must work before desktop
6. **44px minimum touch targets** - No exceptions for accessibility
7. **60 FPS is non-negotiable** - Optimize until achieved
8. **PWA from the start** - Not an afterthought
9. **Beautiful matters** - Polish and juice make games memorable
10. **One codebase** - Unified methods, no platform-specific branches
11. **Update CLAUDE.md** - Keep AI context current after major changes

## Final Checklist for Generated Todo.md

- [ ] Phase -1 with cursor rules, CLAUDE.md, and Makefile is FIRST
- [ ] CLAUDE.md provides comprehensive context for AI assistants
- [ ] Phase 0 creates visual test infrastructure in tests/ directory
- [ ] Test files organized in dedicated tests/ folder
- [ ] Mobile-first implementation throughout
- [ ] Touch controls with gesture support
- [ ] Visual feedback for all interactions
- [ ] 60 FPS performance targets specified
- [ ] PWA features included by default
- [ ] Git workflow integrated in all phases
- [ ] Cross-platform testing procedures
- [ ] Beautiful visual effects planned
- [ ] Debugging procedures included
- [ ] Success criteria clearly defined
- [ ] Unified input handling specified
- [ ] Responsive design breakpoints
- [ ] Performance optimization phases

## Final Cleanup Note

When development is complete:
- Keep production files in root and subdirectories
- Test files remain in tests/ directory (can be excluded from deployment)
- Update .gitignore to exclude test results but keep test files for future development
- Document any platform-specific workarounds discovered during testing

## Usage Instructions

1. **Read the spec.md thoroughly** - Understand the game vision
2. **Identify the game type** - Arcade, puzzle, educational, etc.
3. **Extract visual requirements** - Art style, effects, polish level
4. **Note all input methods** - Touch gestures, keyboard, special inputs
5. **Find performance targets** - FPS, device targets, constraints
6. **Create Phase -1 FIRST** - Cursor rules, CLAUDE.md, and Makefile before anything
7. **Build mobile-first phases** - Touch before keyboard always
8. **Add visual polish phases** - Games should be beautiful
9. **Include PWA features** - Every game is installable
10. **Generate comprehensive todo.md** - Enable full autonomy
11. **Ensure CLAUDE.md is detailed** - AI assistants need context

The resulting todo.md should enable an AI agent to build a complete, polished, mobile-first game that looks beautiful, runs smoothly, and works perfectly across all devices without any human intervention.