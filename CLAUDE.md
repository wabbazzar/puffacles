# CLAUDE.md

## Project Overview

**Puffy Queen** is a simplified Killer Queen-inspired 1v1 arcade game built with Phaser.js. Players control a flying Queen cat while AI-controlled workers gather treats. Two win conditions: Military (kill enemy queen 3x) or Economic (collect 6 treats).

## Current Phase

**Phase 1: Queen Movement Prototype**
- See `docs/prd_queen_movement.md` for full specifications
- Focus: Basic queen sprite with tap-to-flap flying mechanics

## Development Commands

```bash
make serve        # Start dev server on port 8000
make start-server # Start server in background
make stop-server  # Stop background server
make queen-test   # Open queen movement test
make device-test  # Show IP for mobile testing
make help         # Show all commands
```

## Architecture

```
puffacles/
├── assets/
│   ├── puffy_4_by_4.png      # Reference sprite (walking)
│   ├── puffy.png             # Static puffy image
│   └── queen_sprite_4x4.png  # Queen sprite (to be created)
├── game/
│   └── sprites/
│       ├── PuffySprite.js    # Reference implementation
│       └── QueenSprite.js    # Queen sprite (to be created)
├── docs/
│   └── prd_queen_movement.md # Current PRD
├── styles/
│   ├── mobile.css
│   └── desktop.css
└── queen-test.html           # Test harness (to be created)
```

## Game Design Summary

### Units
- **Queen** (player-controlled): Flies, attacks with dive, 3 lives
- **Workers** (AI): Gather treats, fully autonomous

### Win Conditions
1. **Military**: Kill enemy queen 3 times
2. **Economic**: Collect 6 treats into your base

### Queen Mechanics
- **Movement**: Tap to flap (upward impulse) + joystick horizontal
- **Attack**: Dive attack (down + button) - one-hit kills
- **Physics**: Gravity 400px/s², flap impulse -180px/s

## Technical Specs

| Property | Value |
|----------|-------|
| Engine | Phaser.js 3.70.0 |
| Resolution | 320x180 (16:9 landscape) |
| Sprite Size | 48x48 frames, 32x32 hitbox |
| Target FPS | 60 |

## Branch

Currently on `killer-queen` branch.
