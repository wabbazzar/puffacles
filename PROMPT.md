# PROMPT.md - Queen Movement Prototype

## Project Goal

Build a flying queen sprite with tap-to-flap mechanics for "Puffy Queen" - a simplified Killer Queen-inspired game.

## Current Focus

**Phase 1: Queen Movement Prototype**
- Single controllable queen with flying mechanics
- No combat, workers, or win conditions yet

## Technical Stack

- **Engine:** Phaser.js 3.70.0
- **Resolution:** 320x180 (16:9 landscape)
- **Sprite Size:** 48x48 frames, 32x32 hitbox
- **Target:** 60 FPS on mobile

## Available Tools

### dev-browser MCP (Browser Testing)
**IMPORTANT:** Use dev-browser for all browser testing instead of manual verification:
- `dev-browser` skill - Navigate to URLs, interact with page, take screenshots
- Test the game at `http://localhost:8000/queen-test.html`
- Verify sprite rendering, animations, and controls work correctly
- Take screenshots to confirm visual output

### pixel-plugin MCP (Aseprite Integration)
Use these MCP tools to create pixel art assets programmatically:

**Canvas & Sprite Management:**
- `create_canvas` - Create new Aseprite sprite (192x192, rgb mode for 4x4 sheet)
- `add_layer` - Add layers (body, crown, wings, etc.)
- `add_frame` - Add animation frames
- `get_sprite_info` - Check sprite metadata

**Drawing:**
- `draw_pixels` - Draw individual pixels (batch supported)
- `draw_rectangle` - Draw filled/outline rectangles
- `draw_circle` - Draw circles
- `draw_line` - Draw lines
- `fill_area` - Flood fill (paint bucket)
- `draw_contour` - Draw polylines/polygons

**Animation:**
- `set_frame_duration` - Set frame timing
- `create_tag` - Create animation tags (hover, flap_up, fall, dive)
- `duplicate_frame` - Copy frames for animation

**Palette & Polish:**
- `set_palette` - Set color palette (max 16 colors)
- `apply_shading` - Add depth with light direction
- `draw_with_dither` - Dithering patterns for textures

**Export:**
- `export_sprite` - Export to PNG
- `export_spritesheet` - Export as spritesheet with layout options

## Priority Tasks

### 1. Create Queen Sprite Sheet (Using pixel-plugin MCP)
Create `assets/queen_sprite_4x4.png`:
- Use `create_canvas(192, 192, "rgb")` for 4x4 grid of 48x48 frames
- Row 0 (frames 0-3): `hover` - idle floating, slow wing flap
- Row 1 (frames 4-7): `flap_up` - upward thrust, fast wing beat
- Row 2 (frames 8-11): `fall` - falling/gliding, wings up
- Row 3 (frames 12-15): `dive` - dive attack (placeholder for later)
- Design: Orange tabby cat (Puffy) with small crown + fairy wings
- Use `set_palette` with max 16 colors
- Export with `export_spritesheet` (horizontal layout) or `export_sprite`

**VISUAL REFERENCE:** Study `assets/puffy_4_by_4.png` before creating the queen sprite:
- Same orange tabby cat character as base
- Same 4x4 grid layout (192x192 total, 48x48 per frame)
- Match the color palette style and pixel art aesthetic
- Queen adds: small gold crown on head + small fairy/insect wings
- The existing sprite shows walking animations - queen needs FLYING animations instead

### 2. Create QueenSprite.js
Location: `game/sprites/QueenSprite.js`

**CODE REFERENCE:** Follow `game/sprites/PuffySprite.js` patterns:
- Same class structure with `constructor(scene)`, `init()`, `createSprite(x, y)`
- Same `analyzeImageDimensions()` pattern for dynamic frame detection
- Same `setupAnimations()` pattern but with flying animations
- Same `isReady`, `spriteSheetReady` state management
- Same display size (48px) and hitbox size (32px)

**Key differences from PuffySprite:**
- Different animation set: `hover`, `flap_up`, `fall`, `dive` (not walk_up/down/left/right)
- Different physics: Always airborne, no ground state
- Add `flap()` method for upward impulse
- Add velocity-based animation state machine in `update()`

Physics values:
- Gravity: 400 px/sec²
- Flap impulse: -180 px/sec (instant upward velocity)
- Max fall speed: 200 px/sec
- Max rise speed: -250 px/sec
- Horizontal speed: 120 px/sec

Animation state machine (call in update loop):
- `vy < -50` → play `flap_up`
- `vy > 50` → play `fall`
- `-50 <= vy <= 50` → play `hover`
- Use `setFlipX()` for left/right facing based on horizontal velocity

### 3. Create QueenTestScene.js
Location: `game/scenes/QueenTestScene.js`
- Sky blue background (#87CEEB)
- Queen spawns at center
- World bounds collision enabled
- Wire up controls:
  - Joystick/WASD horizontal → move left/right
  - Tap fly button / W / Space → flap

### 4. Create Test Harness
Location: `queen-test.html`
- Load Phaser + QueenSprite + QueenTestScene
- Scale mode: `Phaser.Scale.FIT`
- Pixel art mode enabled (no antialiasing)

## Testing (IMPORTANT)

**Use dev-browser MCP for all testing:**
1. Start server: `make serve` (or `python -m http.server 8000`)
2. Use dev-browser skill to navigate to `http://localhost:8000/queen-test.html`
3. Take screenshots to verify:
   - Sprite renders correctly with crown and wings
   - Animations play (hover, flap_up, fall)
   - No console errors
4. Test controls via dev-browser:
   - Click/tap to test flap
   - Verify gravity pulls queen down
   - Verify queen bounces off boundaries

## Success Criteria

1. Queen sprite displays with crown and wings
2. Queen falls due to gravity when no input
3. Tapping flap gives upward boost
4. Horizontal movement works smoothly
5. Animations transition based on velocity
6. Queen bounces off screen boundaries
7. Runs at 60 FPS on mobile

**Verify all criteria using dev-browser screenshots and interaction.**

## Reference Files

- `docs/prd_queen_movement.md` - Full PRD with all specs
- `game/sprites/PuffySprite.js` - Reference sprite implementation
- `assets/puffy_4_by_4.png` - Reference sprite sheet format

## Development Commands

```bash
make serve        # Start dev server on port 8000
make queen-test   # Open queen movement test
make device-test  # Show IP for mobile testing
```

## Constraints

- Keep it simple - no over-engineering
- Match existing code patterns in the repo
- Pixel art aesthetic (crisp pixels, no smoothing)
- Movement should feel "flappy, not floaty"
