# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hop Hop Puff is a mobile-first HTML5 game built with Phaser.js where Puffy the cat climbs through kitchen platforms to reach beef jerky at the top. This is a cat-themed reimagining of Donkey Kong with responsive design and cross-platform support.

## Development Commands

The project uses a comprehensive Makefile with cross-platform commands:

### Essential Commands
- `make serve` - Start mobile-ready development server on port 8000 (binds to 0.0.0.0)
- `make full-test` - Complete autonomous testing workflow (start server + open game)
- `make game-test` - Open main game for testing
- `make mobile-test` - Test mobile touch controls and virtual D-pad
- `make stop-server` - Stop background development server

### Testing Commands
- `make visual-test` - Test cross-platform Phaser.js canvas rendering
- `make touch-test` - Test touch event handling and latency
- `make sprite-test` - Test Puffy 4x4 sprite animations (all 16 frames)
- `make sprite-debug` - Debug sprite loading and frame detection
- `make ladder-test` - Test ladder climbing mechanics
- `make physics-test` - Test physics isolation

### Debugging & Maintenance
- `make check-logs` - View server activity logs
- `make clean-cache` - Show cache clearing instructions for mobile/desktop
- `make device-test` - Show mobile device connection instructions
- `make help` - Show all available commands

## Architecture

### Core Structure
```
hop-hop-puff/
├── index.html              # Main game entry point with mobile-first design
├── game/
│   ├── main.js            # Core Phaser.js game engine with mobile optimization
│   └── sprites/
│       └── PuffySprite.js # Character sprite management with 4x4 frame system
├── assets/
│   ├── puffy_4_by_4.png   # 4x4 sprite sheet (16 frames)
│   └── [other assets]
├── styles/
│   ├── mobile.css         # Mobile-first styling
│   └── desktop.css        # Desktop enhancements
└── [test files]           # Various test HTML files for different features
```

### Game Engine (game/main.js)
- **Phaser.js 3.70.0** with mobile-first responsive scaling
- **Vector2 class** for joystick mathematics
- **MovementButton class** for touch controls with 44px+ touch targets
- **Unified input handling** supporting both touch and keyboard
- **60 FPS target** with performance optimization for mobile

### Character System (game/sprites/PuffySprite.js)
- **4x4 sprite sheet** with dynamic frame detection (16 total frames)
- **Frame layout**: Row 0 (up), Row 1 (left), Row 2 (down), Row 3 (right/flipped left)
- **Display size**: 48x48 pixels, **Hitbox**: 32x32 pixels (centered)
- **Speed**: 100 pixels per second with smooth analog movement
- **Animation system** with direction-based sprite selection and horizontal flipping

### Mobile-First Design
- **Responsive scaling** using Phaser.Scale.FIT mode
- **Touch controls** with virtual D-pad and haptic feedback
- **Cache-busting** system for mobile browsers
- **PWA ready** with manifest and mobile meta tags

## Technical Specifications

### Performance Requirements
- **60 FPS** on mobile and desktop
- **Touch response time** <50ms
- **Smooth physics** with Phaser.js arcade physics system
- **Gravity**: 300 pixels/second² for platform jumping

### Sprite System Details
- **Source**: 4x4 sprite sheet with automatic dimension detection
- **Animations**: 16fps for walking, 4fps for idle states
- **Frame mapping**: Pre-calculated for optimal performance
- **Collision**: Bottom pixels determine platform landing

### Testing Infrastructure
- **Comprehensive test suite** with specialized HTML test files
- **Cross-platform testing** for mobile and desktop
- **Performance monitoring** with FPS tracking
- **Touch latency testing** for mobile optimization

## Development Workflow

1. **Start development**: `make serve` (binds to all interfaces for mobile testing)
2. **Test on mobile**: Connect device to http://[your-ip]:8000/
3. **Run tests**: `make full-test` for complete testing workflow
4. **Debug issues**: Use specific test commands (sprite-test, mobile-test, etc.)
5. **Clear cache**: `make clean-cache` for mobile/desktop cache instructions

## Important Notes

- **Mobile-first approach**: All development prioritizes mobile experience
- **No package.json**: Pure HTML5 game using CDN-hosted Phaser.js
- **Cache-busting**: Essential for mobile browsers and game asset updates
- **Touch-first controls**: Virtual D-pad with keyboard fallback for desktop
- **Performance critical**: 60 FPS requirement across all platforms

## Game Mechanics

- **Objective**: Guide Puffy from bottom to top of kitchen platforms
- **Lives system**: 3 lives with level restart on death
- **Platform structure**: 6 horizontal levels with 2-3 ladders each
- **Controls**: Virtual D-pad (mobile) or WASD (desktop)
- **Physics**: Gravity-based with platform collision detection