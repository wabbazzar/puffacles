/**
 * AI Queen Controller
 * Controls a queen sprite with basic AI behavior:
 * - Patrol back and forth
 * - Stay airborne with periodic flaps
 * - Chase player when in range
 * - Occasional dive attacks
 */

class AIQueenController {
    constructor(scene, queenSprite) {
        this.scene = scene;
        this.queen = queenSprite;

        // AI behavior state
        this.state = 'patrol'; // 'patrol', 'chase', 'dive', 'recover'
        this.patrolDirection = 1; // 1 = right, -1 = left

        // Timing
        this.flapTimer = 0;
        this.flapInterval = 400; // ms between flaps
        this.stateTimer = 0;
        this.diveRecoverTime = 500; // ms to recover after dive - faster recovery for more aggression

        // Behavior tuning - Aggressive settings for ~50/50 military/economic wins
        this.chaseRange = 120; // pixels - moderate chase range
        this.diveRange = 40; // pixels - tighter dive range for more accurate attacks
        this.diveChance = 0.03; // 3% dive chance per frame when in range (aggressive)
        this.patrolBounds = { left: 40, right: 280 }; // x bounds for patrolling
        this.workerHuntChance = 0.02; // 2% chance to target enemy workers (aggressive)

        // Target (player queen or worker)
        this.target = null;
        this.playerQueen = null; // Primary target reference
        this.targetWorkers = []; // Enemy workers to hunt

        console.log('AIQueenController: Initialized');
    }

    /**
     * Set the target queen to chase/attack
     */
    setTarget(targetQueen) {
        this.target = targetQueen;
        this.playerQueen = targetQueen;
    }

    /**
     * Set enemy workers to potentially hunt
     */
    setTargetWorkers(workers) {
        this.targetWorkers = workers || [];
    }

    /**
     * Update AI behavior - call in scene update loop
     */
    update(time, delta) {
        if (!this.queen || !this.queen.isFullyReady()) return;

        // Update timers
        this.flapTimer += delta;
        this.stateTimer += delta;

        // Stay airborne - flap periodically
        if (this.flapTimer >= this.flapInterval) {
            this.queen.flap();
            this.flapTimer = 0;
            // Randomize next flap interval slightly
            this.flapInterval = 350 + Math.random() * 150;
        }

        // Run state machine
        switch (this.state) {
            case 'patrol':
                this.doPatrol();
                this.checkForChase();
                break;
            case 'chase':
                this.doChase();
                this.checkForDive();
                break;
            case 'dive':
                this.doDive();
                break;
            case 'recover':
                this.doRecover();
                break;
        }
    }

    /**
     * Patrol behavior - fly back and forth, occasionally hunt workers
     */
    doPatrol() {
        const pos = this.queen.getPosition();

        // Occasionally switch to hunting a worker
        if (Math.random() < this.workerHuntChance && this.targetWorkers.length > 0) {
            const nearestWorker = this.findNearestWorker();
            if (nearestWorker) {
                this.target = nearestWorker;
                this.state = 'chase';
                console.log('AIQueen: Hunting enemy worker!');
                return;
            }
        }

        // Reverse direction at patrol bounds
        if (pos.x <= this.patrolBounds.left) {
            this.patrolDirection = 1;
        } else if (pos.x >= this.patrolBounds.right) {
            this.patrolDirection = -1;
        }

        // Move in patrol direction
        this.queen.moveHorizontal(this.patrolDirection);
    }

    /**
     * Find the nearest enemy worker that can be attacked
     */
    findNearestWorker() {
        if (!this.targetWorkers || this.targetWorkers.length === 0) return null;

        const myPos = this.queen.getPosition();
        let nearest = null;
        let nearestDist = Infinity;

        for (const worker of this.targetWorkers) {
            if (!worker.isFullyReady() || worker.getIsDead() || worker.getIsInvincible()) continue;

            const workerPos = worker.getPosition();
            const dist = this.getDistance(myPos, workerPos);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = worker;
            }
        }

        return nearest;
    }

    /**
     * Check if should start chasing player
     */
    checkForChase() {
        if (!this.target || !this.target.isFullyReady()) return;

        const myPos = this.queen.getPosition();
        const targetPos = this.target.getPosition();
        const dist = this.getDistance(myPos, targetPos);

        if (dist < this.chaseRange) {
            this.state = 'chase';
            this.stateTimer = 0;
            console.log('AIQueen: Switching to chase');
        }
    }

    /**
     * Chase behavior - move toward target aggressively
     */
    doChase() {
        // Check if target is still valid (handles both queen and worker)
        const targetValid = this.target &&
            (this.target.isFullyReady ? this.target.isFullyReady() : true) &&
            (!this.target.getIsDead || !this.target.getIsDead());

        if (!targetValid) {
            // Switch back to player queen if worker target is gone
            this.target = this.playerQueen;
            if (!this.target || !this.target.isFullyReady()) {
                this.state = 'patrol';
                return;
            }
        }

        const myPos = this.queen.getPosition();
        const targetPos = this.target.getPosition ? this.target.getPosition() : { x: 160, y: 90 };

        // Move toward target horizontally - tighter tracking (5px deadzone instead of 10)
        if (targetPos.x < myPos.x - 5) {
            this.queen.moveHorizontal(-1);
        } else if (targetPos.x > myPos.x + 5) {
            this.queen.moveHorizontal(1);
        } else {
            this.queen.stopHorizontal();
        }

        // Also adjust altitude to get above target for dive
        if (myPos.y > targetPos.y + 30) {
            // Already above, good position for dive
        } else if (myPos.y > targetPos.y - 10) {
            // Need to gain altitude - flap more
            if (this.flapTimer > 200) {
                this.queen.flap();
                this.flapTimer = 0;
            }
        }

        // Check if target is out of range
        const dist = this.getDistance(myPos, targetPos);
        if (dist > this.chaseRange * 1.5) {
            this.target = this.playerQueen; // Reset to player
            this.state = 'patrol';
            console.log('AIQueen: Target out of range, returning to patrol');
        }
    }

    /**
     * Check if should dive attack
     */
    checkForDive() {
        if (!this.target || !this.target.isFullyReady()) return;

        const myPos = this.queen.getPosition();
        const targetPos = this.target.getPosition();
        const dist = this.getDistance(myPos, targetPos);

        // Only dive if close, above target, and random chance
        const isAboveTarget = myPos.y < targetPos.y - 10; // Reduced from 20 to 10 for easier dive initiation
        const isCloseEnough = dist < this.diveRange;
        const rollDive = Math.random() < this.diveChance;

        if (isAboveTarget && isCloseEnough && rollDive) {
            this.state = 'dive';
            this.stateTimer = 0;
            console.log('AIQueen: DIVE ATTACK!');
        }
    }

    /**
     * Dive attack behavior
     */
    doDive() {
        // Start the actual dive attack on the queen sprite
        if (!this.queen.getIsDiving()) {
            this.queen.startDive();
        }

        // Stop flapping during dive
        this.flapTimer = -200; // Delay next flap

        // Move toward target horizontally during dive
        if (this.target && this.target.isFullyReady()) {
            const myPos = this.queen.getPosition();
            const targetPos = this.target.getPosition();

            if (targetPos.x < myPos.x) {
                this.queen.moveHorizontal(-1);
            } else {
                this.queen.moveHorizontal(1);
            }
        }

        // End dive state when queen's dive ends (hit bottom or timeout)
        const pos = this.queen.getPosition();
        if (!this.queen.getIsDiving() || pos.y >= 160 || this.stateTimer > 1000) {
            this.queen.endDive();
            this.state = 'recover';
            this.stateTimer = 0;
            console.log('AIQueen: Dive ended, recovering');
        }
    }

    /**
     * Recover after dive - hover in place briefly
     */
    doRecover() {
        this.queen.stopHorizontal();

        if (this.stateTimer >= this.diveRecoverTime) {
            this.state = 'patrol';
            this.stateTimer = 0;
            console.log('AIQueen: Recovery complete, resuming patrol');
        }
    }

    /**
     * Calculate distance between two positions
     */
    getDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get current AI state
     */
    getState() {
        return this.state;
    }

    /**
     * Force a state change (for testing)
     */
    setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIQueenController;
}
