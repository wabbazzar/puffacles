/**
 * Worker AI Controller - SIMPLIFIED VERSION
 * Workers stick to ground level and collect treats that land there.
 * No complex pathfinding - just horizontal movement.
 */

class WorkerAI {
    constructor(scene, workerSprite, basePosition) {
        this.scene = scene;
        this.worker = workerSprite;
        this.basePosition = basePosition;

        // AI state
        this.state = 'seeking';
        this.targetTreat = null;

        // Timing
        this.depositTime = 200;
        this.depositTimer = 0;

        // Stuck detection
        this.lastX = 0;
        this.stuckFrames = 0;

        console.log(`WorkerAI (${workerSprite.getTeamId()}): Initialized (simplified)`);
    }

    update(time, delta, treats) {
        if (!this.worker || !this.worker.isFullyReady()) return;

        // Stuck detection
        const pos = this.worker.getPosition();
        if (Math.abs(pos.x - this.lastX) < 1 && this.state !== 'depositing') {
            this.stuckFrames++;
            if (this.stuckFrames > 120) { // ~2 seconds at 60fps
                console.log(`WorkerAI: Stuck, resetting target`);
                this.targetTreat = null;
                this.state = 'seeking';
                this.stuckFrames = 0;
            }
        } else {
            this.stuckFrames = 0;
        }
        this.lastX = pos.x;

        switch (this.state) {
            case 'seeking':
                this.doSeeking(treats);
                break;
            case 'collecting':
                this.doCollecting();
                break;
            case 'returning':
                this.doReturning();
                break;
            case 'depositing':
                this.doDepositing(delta);
                break;
        }
    }

    doSeeking(treats) {
        // Find nearest ground-level treat
        const pos = this.worker.getPosition();
        let bestTreat = null;
        let bestDist = Infinity;

        for (const treat of treats) {
            if (!treat.sprite || !treat.sprite.active) continue;
            if (treat.claimedBy && treat.claimedBy !== this.worker) continue;

            const tx = treat.sprite.x;
            const ty = treat.sprite.y;

            // Only consider treats on or near ground level (y > 140)
            if (ty < 140) continue;

            const dist = Math.abs(tx - pos.x);
            if (dist < bestDist) {
                bestDist = dist;
                bestTreat = treat;
            }
        }

        if (bestTreat) {
            this.targetTreat = bestTreat;
            this.targetTreat.claimedBy = this.worker;
            this.state = 'collecting';
            console.log(`WorkerAI (${this.worker.getTeamId()}): Targeting treat at ${Math.round(bestTreat.sprite.x)}`);
        } else {
            // No treats, idle at base
            this.moveToward(this.basePosition.x);
        }
    }

    doCollecting() {
        if (!this.targetTreat || !this.targetTreat.sprite || !this.targetTreat.sprite.active) {
            this.targetTreat = null;
            this.state = 'seeking';
            return;
        }

        const pos = this.worker.getPosition();
        const treatX = this.targetTreat.sprite.x;
        const treatY = this.targetTreat.sprite.y;

        // Move toward treat
        const dx = treatX - pos.x;

        if (Math.abs(dx) < 15 && Math.abs(treatY - pos.y) < 25) {
            // Close enough - pick up!
            this.worker.pickUpTreat(this.targetTreat);
            this.targetTreat.sprite.setVisible(false);
            this.state = 'returning';
            console.log(`WorkerAI (${this.worker.getTeamId()}): Picked up treat!`);
        } else {
            this.moveToward(treatX);
        }
    }

    doReturning() {
        const pos = this.worker.getPosition();
        const dx = this.basePosition.x - pos.x;

        if (Math.abs(dx) < 20) {
            // At base - deposit
            this.state = 'depositing';
            this.depositTimer = 0;
            this.worker.stop();
            console.log(`WorkerAI (${this.worker.getTeamId()}): At base, depositing`);
        } else {
            this.moveToward(this.basePosition.x);
        }
    }

    doDepositing(delta) {
        this.depositTimer += delta;
        this.worker.stop();

        if (this.depositTimer >= this.depositTime) {
            const treat = this.worker.dropTreat();
            if (treat) {
                this.scene.events.emit('treatDeposited', {
                    teamId: this.worker.getTeamId(),
                    treat: treat
                });
                if (treat.sprite) {
                    treat.sprite.destroy();
                }
            }
            this.targetTreat = null;
            this.state = 'seeking';
            console.log(`WorkerAI (${this.worker.getTeamId()}): Deposited! Seeking more...`);
        }
    }

    moveToward(targetX) {
        if (!this.worker.body) return;

        const pos = this.worker.getPosition();
        const dx = targetX - pos.x;
        const speed = 20; // Extremely slow for balanced military/economic wins

        if (Math.abs(dx) > 5) {
            const dir = dx > 0 ? 1 : -1;
            this.worker.body.setVelocityX(dir * speed);
            this.worker.updateWalkAnimation(dir * speed, 0);
        } else {
            this.worker.body.setVelocityX(0);
            this.worker.updateWalkAnimation(0, 0);
        }
    }

    getState() {
        return this.state;
    }

    getCurrentPath() {
        return null; // No pathfinding in simplified version
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkerAI;
}
