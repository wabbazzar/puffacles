# PRD: Queen Movement & Pixel Art

## Overview

This PRD defines the basic queen movement prototype for "Puffy Queen" - a simplified Killer Queen-inspired game. This phase focuses solely on getting one controllable queen moving on screen with proper flying mechanics.

**Scope:** Single queen, tap-to-flap movement, no combat, no workers, no win conditions.

---

## 1. Canvas & Display

| Property | Value | Notes |
|----------|-------|-------|
| Game Resolution | 320x180 | 16:9 landscape, scales up cleanly |
| Render Mode | Pixel Art | `pixelArt: true`, no antialiasing |
| Scale Mode | `Phaser.Scale.FIT` | Maintains aspect ratio |
| Background | Sky blue `#87CEEB` | Reuse from existing game |

**Rationale:** 320x180 is a clean 16:9 resolution that scales perfectly to 1280x720, 1920x1080, etc. Landscape orientation suits arena combat.

---

## 2. Queen Sprite Specifications

### 2.1 Sprite Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Frame Size | 48x48 px | Matches existing Puffy sprite system |
| Display Size | 48x48 px | 1:1 display (no scaling) |
| Hitbox Size | 32x32 px | Centered, smaller than visual |
| Sheet Layout | 4x4 grid | 16 frames total (192x192 sheet) |

### 2.2 Animation States

We need NEW animations for flying queen (not walking). Create in Aseprite:

| State | Row | Frames | FPS | Loop | Description |
|-------|-----|--------|-----|------|-------------|
| `hover` | 0 | 0-3 | 8 | Yes | Idle floating, wings flapping slowly |
| `flap_up` | 1 | 4-7 | 16 | No | Upward thrust, wings beat hard |
| `fall` | 2 | 8-11 | 8 | Yes | Falling/gliding down, wings up |
| `dive` | 3 | 12-15 | 16 | No | Dive attack (for later, design now) |

### 2.3 Directional Facing

- Use `sprite.setFlipX(true/false)` for left/right facing
- No separate left/right animations needed
- Default facing: Right

### 2.4 Visual Design Guidelines

| Element | Specification |
|---------|---------------|
| Base Character | Puffy cat (orange tabby) |
| Queen Indicator | Small crown on head |
| Wings | Small fairy/insect wings (for flying) |
| Color Palette | Max 16 colors |
| Style | Cute, readable at small size |

**Aseprite Export Settings:**
- Format: PNG
- Sheet Type: By Rows
- Filename: `queen_sprite_4x4.png`
- Location: `assets/`

---

## 3. Movement Physics

### 3.1 Flying Mechanics (Tap to Flap)

| Property | Value | Notes |
|----------|-------|-------|
| Gravity | 400 px/sec² | Pulls queen down constantly |
| Flap Impulse | -180 px/sec | Instant upward velocity on tap |
| Max Fall Speed | 200 px/sec | Terminal velocity cap |
| Max Rise Speed | -250 px/sec | Cap upward velocity |
| Horizontal Speed | 120 px/sec | Left/right movement |

### 3.2 Control Mapping

| Input | Action |
|-------|--------|
| Joystick/WASD horizontal | Move left/right |
| Tap fly button / W / Space | Flap (add upward impulse) |
| Hold down + attack (later) | Dive attack |

### 3.3 Movement Feel

- **Flappy, not floaty:** Quick response to input, noticeable gravity
- **Commitment:** Once you start falling, you need to actively flap to recover
- **Air control:** Full horizontal control while airborne
- **No ground state:** Queen is always airborne (no landing on platforms in this prototype)

---

## 4. Boundaries & Arena

### 4.1 Prototype Arena

| Property | Value |
|----------|-------|
| Width | 320 px |
| Height | 180 px |
| Boundaries | Solid walls on all sides |
| Collision | `setCollideWorldBounds(true)` |

### 4.2 Visual Elements (Prototype Only)

- Sky blue background
- Simple border/frame to show arena bounds
- No platforms in movement prototype

---

## 5. Animation State Machine

```
                    ┌─────────────┐
                    │   hover     │ (default when vy ≈ 0)
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              │              ▼
     ┌──────────┐          │       ┌──────────┐
     │ flap_up  │◄─────────┴───────│   fall   │
     └──────────┘   (tap flap)     └──────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                           ▼
                    ┌──────────┐
                    │   dive   │ (later phase)
                    └──────────┘
```

**State Transitions:**
- `vy < -50` → `flap_up`
- `vy > 50` → `fall`
- `-50 <= vy <= 50` → `hover`
- Dive attack overrides all (later phase)

---

## 6. Implementation Checklist

### Phase 1: Static Queen (This PRD)
- [ ] Create queen sprite sheet in Aseprite (4x4, 48x48 frames)
- [ ] Export to `assets/queen_sprite_4x4.png`
- [ ] Create `QueenSprite.js` class (based on PuffySprite.js)
- [ ] Set up animation definitions
- [ ] Create test scene with queen at center

### Phase 2: Movement
- [ ] Implement gravity (constant downward pull)
- [ ] Implement flap input (upward impulse)
- [ ] Implement horizontal movement
- [ ] Add velocity caps (terminal velocity)
- [ ] Wire up animation state machine

### Phase 3: Polish
- [ ] Tune physics values for good feel
- [ ] Add world bounds collision
- [ ] Test on mobile (touch controls)
- [ ] Verify 60 FPS performance

---

## 7. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `assets/queen_sprite_4x4.png` | Create | New queen sprite sheet |
| `game/sprites/QueenSprite.js` | Create | Queen sprite class |
| `game/scenes/QueenTestScene.js` | Create | Isolated test scene |
| `queen-test.html` | Create | Test harness |

---

## 8. Success Criteria

The prototype is complete when:

1. Queen sprite displays on screen with crown and wings
2. Queen falls due to gravity when no input
3. Tapping flap button gives upward boost
4. Horizontal movement works smoothly
5. Animations transition correctly based on velocity
6. Queen bounces off screen boundaries
7. Runs at 60 FPS on mobile

---

## 9. Design Decisions (Closed)

1. **Crown design:** Simple 3-pixel gold crown - readable at small size, iconic
2. **Wing style:** Small fairy/insect wings - fits cute aesthetic, clear visual indicator of flight capability
3. **Flap cooldown:** No cooldown - allows rapid tapping for skill expression, gravity is the natural limiter
4. **Audio:** Later phase - focus on movement feel first, add SFX after mechanics are solid

---

## Appendix: Reference Values from Existing System

From `PuffySprite.js` and `main.js`:

```javascript
// Existing Puffy values (for reference)
displaySize: 48        // pixels
hitboxSize: 32         // pixels
speed: 100             // pixels/sec
gravity: 400           // pixels/sec²
jumpVelocity: -300     // pixels/sec

// Frame detection (4x4 grid)
frameWidth: 48         // auto-detected
frameHeight: 48        // auto-detected
totalFrames: 16
```
