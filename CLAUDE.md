# CLAUDE.md

## ⚠ Cross-repo contract — READ BEFORE EDITING RAIN / iframe CODE

Puffacles is consumed by **wabbazzar.com** as an easter-egg game in an
iframe. The two repos share a formal contract at
[`docs/puffacles-contract.md`](docs/puffacles-contract.md) covering:

- `?bg=wabbazzar` query param → fetch `/ascii-art.json`
- JSON shape (accept both `{glyphs:[...]}` and bare array)
- Glyphs are **already iOS-squircle-masked by the site** — the game
  **MUST NOT** apply additional clipping/masking (double-rounds = broken).
- Silent fallback on any fetch/parse error (no console noise).
- `postMessage("puffacles:exit")` → parent dismisses the iframe.

Any change to those behaviors requires coordinated updates in both
wabbazzar.github.io and this repo. Read the contract doc first.

## Project Overview

**Puffy Runner** (served at `/`) is a Chrome-Dino-style endless runner
built on Phaser.js. Tap/Space to jump; survive as long as possible.
Older prototypes (`/queen-test.html`) still live in the tree for
reference but aren't the canonical entry.

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
