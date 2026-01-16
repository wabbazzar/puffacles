# @fix_plan.md - Prioritized Task List

## Current Sprint: Queen Movement Prototype

### High Priority
- [ ] Create queen sprite sheet using pixel-plugin MCP tools (4x4 grid, 48x48 frames)
  - Use `create_canvas`, `add_layer`, `draw_pixels`, `set_palette`
  - Create 4 animation rows: hover, flap_up, fall, dive
- [ ] Export sprite to `assets/queen_sprite_4x4.png` using `export_sprite`
- [ ] Create `game/sprites/QueenSprite.js` class
- [ ] Create `game/scenes/QueenTestScene.js`
- [ ] Create `queen-test.html` test harness

### Medium Priority
- [ ] Implement gravity physics (400 px/sec²)
- [ ] Implement flap input (-180 px/sec impulse)
- [ ] Implement horizontal movement (120 px/sec)
- [ ] Add velocity caps (terminal velocity)
- [ ] Wire up animation state machine

### Testing (Use dev-browser MCP)
- [ ] Start dev server (`make serve`)
- [ ] Use dev-browser to navigate to `http://localhost:8000/queen-test.html`
- [ ] Take screenshot to verify sprite renders with crown and wings
- [ ] Test flap control via dev-browser click
- [ ] Verify gravity and boundary collision visually
- [ ] Check for console errors

### Low Priority (Polish)
- [ ] Tune physics values for good feel
- [ ] Test on mobile (touch controls)
- [ ] Verify 60 FPS performance

## Blockers
None currently.

## Reference Files (READ BEFORE STARTING)
- `assets/puffy_4_by_4.png` - Visual reference for sprite style (same cat character)
- `game/sprites/PuffySprite.js` - Code pattern to follow for sprite class
- `docs/prd_queen_movement.md` - Full specifications
