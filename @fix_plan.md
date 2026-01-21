# Ralph Round 2: Combat & Balance Fixes

**Goal:** Implement missing combat features and balance the game for ~50/50 military/economic victories.

**Current State (from testing):**
- 100% economic victories, 0% military
- Queens rarely die (combat too weak/rare)
- P1 worker significantly outperforms AI worker
- Attack animation is not directional
- No "above target" requirement for successful attacks

---

## Phase 1: Combat System Fixes

### Task 1.1: Enforce "Above Target" Attack Requirement
**File:** `/home/wabbazzar/code/puffacles/game/scenes/QueenTestScene.js`

Queens must be ABOVE their target to land a successful dive attack.

- [ ] In `checkCombatCollision()`, add height check before awarding damage
- [ ] Attacker's Y position must be < victim's Y position (attacker higher on screen)
- [ ] Allow ~20px tolerance (attacker.y < victim.y - 20)
- [ ] If attacker is NOT above, treat as mutual knockback instead of hit
- [ ] Add console.log for debugging: "Attack failed - attacker not above target"

**Test:** In AI vs AI mode, verify that horizontal/below attacks result in knockback, not kills.

---

### Task 1.2: Queens Attack Workers (verify/fix)
**File:** `/home/wabbazzar/code/puffacles/game/scenes/QueenTestScene.js`

Verify queen dive attacks reliably kill workers.

- [ ] Verify `checkQueenVsWorkerCombat()` is being called every frame
- [ ] Add "above target" check for worker kills too
- [ ] Ensure worker hitbox overlap detection works (may need looser bounds)
- [ ] Add console.log: "Queen attacking worker - above: {bool}, overlap: {bool}"

**Test:** Watch AI queen dive at workers; verify kills happen when queen is above.

---

### Task 1.3: Directional Attack Animation
**File:** `/home/wabbazzar/code/puffacles/game/sprites/QueenSprite.js`

Make dive attack animation point toward attack direction.

- [ ] In `startDive()`, rotate sprite based on horizontal velocity/direction
- [ ] If moving left during dive, flip sprite AND add slight rotation (-15deg)
- [ ] If moving right during dive, normal flip AND slight rotation (15deg)
- [ ] Straight down dive = no rotation
- [ ] Reset rotation in `endDive()`

**Test:** Visually confirm dive animation tilts in movement direction.

---

## Phase 2: Balance Adjustments

### Task 2.1: Slow Down Worker Units
**Files:** 
- `/home/wabbazzar/code/puffacles/game/sprites/WorkerSprite.js`
- `/home/wabbazzar/code/puffacles/game/controllers/WorkerAI.js`

Workers are too fast, making economic victories too easy.

- [ ] In WorkerSprite.js: reduce `walkSpeed` from 60 to 40
- [ ] In WorkerAI.js `moveToward()`: reduce `speed` from 120 to 40 (should match walkSpeed)
- [ ] This gives queens more time to intercept workers

**Test:** Workers should take noticeably longer to reach treats and return to base.

---

### Task 2.2: Make AI Queen More Aggressive
**File:** `/home/wabbazzar/code/puffacles/game/controllers/AIQueenController.js`

AI queen needs to attack more often for military victories to happen.

- [ ] Increase `diveChance` from 0.01 to 0.03 (3x more dive attempts)
- [ ] Increase `workerHuntChance` from 0.003 to 0.02 (hunt workers more)
- [ ] Reduce `diveRecoverTime` from 800 to 500ms (faster recovery)
- [ ] Decrease `chaseRange` threshold for "close enough to dive" from 50 to 40px

**Test:** AI queen should attempt dives more frequently in AI vs AI mode.

---

### Task 2.3: Reduce Queen Lives for Faster Military Wins
**File:** `/home/wabbazzar/code/puffacles/game/sprites/QueenSprite.js`

5 lives is too many; games end economically before military.

- [ ] Change `this.lives = 5` to `this.lives = 3` in constructor
- [ ] Change `this.lives = 5` to `this.lives = 3` in `resetLives()`
- [ ] Update HUD display to show 3 hearts max instead of 5

**Test:** Queens should die after 3 hits instead of 5.

---

### Task 2.4: Increase Treat Win Threshold
**File:** `/home/wabbazzar/code/puffacles/game/scenes/QueenTestScene.js`

4 treats is too easy; increase to give combat more time.

- [ ] Change `this.winScore = 4` to `this.winScore = 6`
- [ ] Update HUD text from "0/4" to "0/6"

**Test:** Economic victory should require 6 treats instead of 4.

---

## Phase 3: Queen Respawn Polish

### Task 3.1: Verify Queen Respawn Works Correctly
**File:** `/home/wabbazzar/code/puffacles/game/scenes/QueenTestScene.js`

- [ ] Verify `respawnQueen()` moves queen to correct start position
- [ ] Player queen spawns at (80, 90)
- [ ] AI queen spawns at (240, 90)
- [ ] Verify velocity is reset to (0, 0)
- [ ] Verify dive state is properly cleared

**Test:** After queen takes damage, they should reappear at their start position.

---

## Exit Criteria

Run 10 AI vs AI games and verify:

1. [ ] At least 3 military victories (30%+)
2. [ ] At least 3 economic victories (30%+)
3. [ ] Worker kills happen at least 5 times total
4. [ ] No console errors during gameplay
5. [ ] Attack animation visibly tilts during diagonal dives

**How to test:**
```bash
make serve
# Open http://localhost:8000/queen-test.html?mode=aivai
# Watch 10 games, record results in this file
```

---

## Test Results (2026-01-20)

| Game | Winner | Condition |
|------|--------|-----------|
| 1 | Player | military |
| 2 | Player | military |
| 3 | AI | economic |
| 4 | AI | economic |
| 5 | AI | economic |
| 6 | AI | military |
| 7 | Player | economic |
| 8 | AI | military |
| 9 | Player | military |
| 10 | AI | economic |

**Summary:**
- Military Wins: 5 / 10 (50%) ✅
- Economic Wins: 5 / 10 (50%) ✅
- Balance target achieved!

---

## Notes

- Always test with `?mode=aivai` for consistent AI behavior
- Use browser console to debug: `window.scene.queen.getLives()`
- Screenshot key moments for verification
