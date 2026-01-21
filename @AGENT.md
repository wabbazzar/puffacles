# @AGENT.md - Build & Run Instructions

## Quick Start

```bash
# Start dev server
make serve

# Or manually
python -m http.server 8000
```

## Testing

```bash
# Open queen movement test in browser
make queen-test

# Get IP for mobile testing
make device-test
```

## Project Structure

```
puffacles/
├── assets/                    # Sprites, images
│   └── queen_sprite_4x4.png   # Queen sprite sheet (to create)
├── game/
│   ├── sprites/
│   │   ├── PuffySprite.js     # Reference implementation
│   │   └── QueenSprite.js     # Queen class (to create)
│   └── scenes/
│       └── QueenTestScene.js  # Test scene (to create)
├── docs/
│   └── prd_queen_movement.md  # Full specifications
├── queen-test.html            # Test harness (to create)
├── PROMPT.md                  # Development instructions
└── @fix_plan.md               # Task list
```

## Key Files to Reference

- `game/sprites/PuffySprite.js` - Pattern for sprite classes
- `docs/prd_queen_movement.md` - All technical specs

## Tech Stack

- Phaser.js 3.70.0 (loaded from CDN)
- Vanilla JavaScript (ES6+)
- No build step required

## Pixel Art Tools (MCP)

**pixel-plugin** MCP tools are available for creating sprites programmatically via Aseprite:
- `create_canvas` - New sprite with dimensions and color mode
- `add_layer`, `add_frame` - Structure the sprite
- `draw_pixels`, `draw_rectangle`, `draw_circle`, `fill_area` - Drawing primitives
- `set_palette` - Limit colors (max 16 for this project)
- `create_tag` - Define animation tags
- `export_sprite` - Export to PNG

Use these tools to create `assets/queen_sprite_4x4.png` instead of manual Aseprite work.

## Testing with dev-browser MCP (REQUIRED)

**IMPORTANT:** Use dev-browser skill for all browser testing:

```
1. Start server: make serve
2. Use dev-browser to navigate to http://localhost:8000/queen-test.html
3. Take screenshots to verify visual output
4. Interact with the page to test controls
```

dev-browser capabilities:
- Navigate to URLs
- Take screenshots (verify sprite rendering)
- Click/tap elements (test flap control)
- Check for console errors
- Verify animations and physics visually

## Validation Checklist

Use dev-browser to verify each item:
- [ ] `queen-test.html` loads without console errors
- [ ] Queen sprite renders with crown and wings visible
- [ ] Animations play correctly (hover, flap_up, fall)
- [ ] Tap/click triggers upward flap
- [ ] Gravity pulls queen down when no input
- [ ] Horizontal movement responsive
- [ ] Queen bounces off screen boundaries

## Reference Files (READ THESE)

**Visual reference for sprite creation:**
- `assets/puffy_4_by_4.png` - Existing Puffy sprite (same character, walking anims)

**Code pattern to follow:**
- `game/sprites/PuffySprite.js` - Reference implementation for sprite class structure
