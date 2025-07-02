# Hop Hop Puff - Game Specification

## Overview
A cat-themed reimagining of Donkey Kong where Puffy the cat climbs through a kitchen to reach beef jerky at the top while avoiding hazards.

## Core Gameplay
- **Objective**: Guide Puffy from bottom to top of kitchen to reach beef jerky
- **Lives**: 3 lives total, restart level on death
- **Win Condition**: Simple reach - touching beef jerky completes level
- **Scoring**: Higher score for lower completion time

## Technical Specifications
- **Framework**: Phaser.js
- **Target FPS**: 60fps
- **Rendering**: HTML5 Canvas
- **Platform**: Mobile-first, responsive design
- **Screen Target**: iPhone dimensions, auto-adapting to device
- **Browser**: Modern browsers only

## Sprite System
- **Source Asset**: 4x4 sprite sheet (16 frames total)
  - Row 1: Walking up/away (4 frames)
  - Row 2: Walking left (4 frames) 
  - Row 3: Walking down/toward (4 frames)
  - Row 4: Walking right (4 frames, horizontally flipped from row 3)
- **Display Size**: 48x48 pixels
- **Collision Hitbox**: 32x32 pixels (centered in sprite)
- **Implementation**: Pre-slice all frames at load time for optimal performance

## Character Movement
- **Type**: Smooth/analog movement (not grid-based)
- **Speed**: Normal walking pace (100-120 pixels per second), constant throughout level
- **Animation**: Speed-based timing, 4-frame walk cycle
- **Platform Landing**: Bottom pixels of sprite determine platform collision
- **Ladder Climbing**: Uses up/away walking animation

## Level Design
- **Structure**: Classic Donkey Kong layout
- **Platforms**: 6 horizontal levels total
- **Ladders**: 2-3 ladders per level, some ladders are broken (don't span full height)
- **Responsive Scaling**: Platform width and ladder length adapt to screen size
- **Ladder Placement**: Proportional to platform length
- **Static Elements**: All level geometry remains same size except platform/ladder dimensions

## Hazard System
- **Flying Insects**: Spawn from bottom, move upward
- **Rolling Fruits**: Spawn from top, roll down platforms following gravity
- **Spawn Pattern**: Random intervals (unlimited simultaneous hazards)
- **Collision Effect**: All hazards are harmful, instant death on contact
- **Physics**: Fruits follow DK-style rolling/bouncing physics, insects fly in straight paths

## User Interface
### Game States
- **Start Screen**: Title, instructions, play button
- **Game Over Screen**: Final score/time display, restart option  
- **Pause Screen**: Accessible during gameplay

### In-Game UI
- **Location**: Top bar
- **Elements**: Lives remaining, current score, elapsed timer
- **Pause**: Spacebar or 'P' key triggers pause

## Controls
- **Mobile**: Virtual D-pad (on-screen directional buttons)
- **Desktop**: WASD keys
- **Detection**: Auto-detect device type and show appropriate controls
- **Directions**: Up (ladder climbing), Down (ladder descending), Left/Right (platform movement)

## Responsive Design
- **Screen Adaptation**: Game automatically fits iPhone screens and adapts to other devices
- **Scaling Strategy**: 
  - Puffy sprite: Fixed 48x48 pixels
  - Platform thickness: Fixed pixel height
  - Platform width: Scales with screen width
  - Ladder length: Scales with screen height
  - Ladder spacing: Proportional to available platform width

## Audio
- **Current Scope**: No audio implementation
- **Future Consideration**: Sound effects and background music to be added later

## Performance Requirements
- **Frame Rate**: Consistent 60fps
- **Collision Detection**: Optimized for real-time performance with multiple hazards
- **Memory Management**: Efficient sprite handling and hazard cleanup

## Asset Requirements
### Graphics
- 4x4 sprite sheet for Puffy character (provided)
- Beef jerky sprite for goal object
- Flying insect sprites (simple animation)
- Fruit sprites for rolling hazards (apple, orange, etc.)
- Platform/ladder graphics (kitchen-themed)
- UI elements (lives, score display, virtual D-pad)

### Implementation Priority
1. Core movement and collision system
2. Level structure and responsive scaling  
3. Hazard spawning and physics
4. UI implementation and game states
5. Polish and optimization

## Success Metrics
- Smooth 60fps gameplay on target devices
- Intuitive controls for both mobile and desktop
- Challenging but fair difficulty progression
- Responsive design working across device sizes

---

**Version**: 1.0  
**Date**: June 27, 2025  
**Status**: Ready for Implementation