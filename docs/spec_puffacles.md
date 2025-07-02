# Puffacles Game Specification

## Overview
Puffacles is a side-scrolling platformer game featuring Puffy, a character who must navigate through obstacles and challenges while progressing to the right. The game builds upon the existing hop-hop-puff mechanics with camera following, health system, and escalating difficulty.

## Core Mechanics

### Character Movement
- **Basic Controls**: Puffy can walk left/right and jump
- **Existing Foundation**: Built on hop-hop-puff/puffy's birthday invite codebase

### Camera System
- **Right Movement**: Camera always keeps Puffy centered when moving right
- **Left Movement**: Basic left boundary (simplest implementation)
- **Implementation**: Use easiest/simplest camera following approach

### Health & Lives System
- **Starting Health**: 9 lives
- **Damage**: Lose 1 life per obstacle hit or fall
- **Game Over**: When all lives are lost

### Scoring System
- **Primary Score**: Based on completion time (lower time = higher score)
- **Bonus Points**: Extra points for remaining lives at completion
- **Display**: Basic UI showing current health and score

## Obstacle Types

### Static Obstacles
- Blocks to jump over
- Gaps to jump across
- Walls to navigate around

### Moving Obstacles
- Moving platforms with predictable patterns
- Timing-based challenges

### Arcade-Style Dodging Elements
- Predictable pattern obstacles
- Objects with learnable movement patterns
- Pattern-based spawning system

## Difficulty Progression

### Scaling Methods (All Starting with Easiest Implementation)
1. **Speed Increase**: Speed up existing obstacle patterns
2. **Density Increase**: More obstacles per screen section
3. **Reduced Safe Spaces**: Shorter breaks between obstacle patterns

### Target Gameplay
- **Duration**: Approximately 5 minutes of gameplay
- **Progression**: Gradual difficulty increase without complex programming
- **Inspiration**: Tetris-style difficulty scaling (simple parameter changes)

## Development Phases

### Phase 1: Foundation
1. Implement simple camera following system
2. Add basic collision detection for health loss
3. Create simple static obstacles (blocks, gaps)
4. Test basic movement and jumping mechanics

### Phase 2: Moving Elements
1. Add moving platforms with predictable patterns
2. Implement timing-based obstacle mechanics
3. Test player interaction with moving elements

### Phase 3: Arcade Dodging
1. Introduce predictable pattern obstacles
2. Add falling objects or moving hazards
3. Implement pattern-based obstacle spawning system
4. Test dodging mechanics and timing

### Phase 4: Difficulty Scaling
1. Implement speed scaling for existing patterns
2. Add obstacle density controls
3. Reduce safe space parameters
4. Test difficulty curve progression

### Phase 5: Polish & Systems
1. Complete scoring system implementation
2. Add game over and restart mechanics
3. Create basic UI for health and score display
4. Final testing and balancing

## Technical Approach

### Implementation Strategy
- **Incremental Development**: Build and test one mechanic at a time
- **Simplicity First**: Always choose the easiest implementation approach
- **Flexible Structure**: Keep level/section structure adaptable
- **Pattern-Based**: Use repeatable, scalable obstacle patterns

### Testing Philosophy
- Test each mechanic thoroughly before moving to next phase
- Ensure each element works well individually before combining
- Focus on getting core mechanics right before adding complexity

## Success Metrics
- Smooth camera following without jarring movements
- Responsive character controls
- Clear visual feedback for health/damage
- Engaging difficulty progression
- Approximately 5 minutes of compelling gameplay
