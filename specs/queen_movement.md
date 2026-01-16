# Queen Movement Specification

Full specification located at: `../docs/prd_queen_movement.md`

## Quick Reference

### Sprite Sheet
- File: `assets/queen_sprite_4x4.png`
- Size: 192x192 (4x4 grid of 48x48 frames)
- Animations: hover, flap_up, fall, dive

### Physics
| Property | Value |
|----------|-------|
| Gravity | 400 px/sec² |
| Flap Impulse | -180 px/sec |
| Max Fall Speed | 200 px/sec |
| Max Rise Speed | -250 px/sec |
| Horizontal Speed | 120 px/sec |

### Animation States
| Condition | Animation |
|-----------|-----------|
| vy < -50 | flap_up |
| vy > 50 | fall |
| -50 <= vy <= 50 | hover |

### Controls
| Input | Action |
|-------|--------|
| Joystick/WASD horizontal | Move left/right |
| Tap fly button / W / Space | Flap |
