/**
 * Worker Sprite Management System
 * Ground-based worker cats that gather treats
 *
 * Uses puffy_4_by_4.png sprite sheet:
 * Row 0 (0-3):  walk_down - walking toward camera
 * Row 1 (4-7):  walk_left - walking left
 * Row 2 (8-11): walk_right - walking right
 * Row 3 (12-15): walk_up - walking away from camera
 */

class WorkerSprite {
    constructor(scene, teamId = 'player') {
        this.scene = scene;
        this.sprite = null;
        this.body = null;
        this.teamId = teamId; // 'player' or 'ai'

        // Ready state
        this.isReady = false;
        this.spriteSheetReady = false;

        // Movement properties
        this.walkSpeed = 45; // Faster speed so workers can collect before dying

        // Display properties
        this.displaySize = 32; // Smaller than queen (48)
        this.hitboxSize = 24;

        // Frame detection
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = 16;

        // Animation mappings
        this.animations = {
            'walk_down': { frames: [0, 1, 2, 3], frameRate: 8 },
            'walk_left': { frames: [4, 5, 6, 7], frameRate: 8 },
            'walk_right': { frames: [8, 9, 10, 11], frameRate: 8 },
            'walk_up': { frames: [12, 13, 14, 15], frameRate: 8 },
            'idle': { frames: [0], frameRate: 1 }
        };

        this.currentAnimation = 'idle';

        // Carrying state
        this.isCarrying = false;
        this.carryingTreat = null;

        this.init();
    }

    async init() {
        try {
            console.log('Worker: Initializing...');
            await this.analyzeImageDimensions();
            this.loadSpriteSheet();
        } catch (error) {
            console.error('Worker: Failed to initialize:', error);
        }
    }

    async analyzeImageDimensions() {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                this.frameWidth = Math.floor(width / 4);
                this.frameHeight = Math.floor(height / 4);

                console.log(`Worker: Image ${width}x${height}, frame size ${this.frameWidth}x${this.frameHeight}`);
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load puffy_4_by_4.png'));
            };

            img.src = 'assets/puffy_4_by_4.png?t=' + Date.now();
        });
    }

    loadSpriteSheet() {
        // Check if texture already exists
        if (this.scene.textures.exists('worker_sprites')) {
            console.log('Worker: Sprite sheet already loaded, reusing');
            this.setupAnimationsIfNeeded();
            this.markAsReadyForCreation();
            return;
        }

        console.log(`Worker: Loading sprite sheet (${this.frameWidth}x${this.frameHeight} frames)`);

        this.scene.load.spritesheet('worker_sprites', 'assets/puffy_4_by_4.png', {
            frameWidth: this.frameWidth,
            frameHeight: this.frameHeight
        });

        this.scene.load.once('complete', () => {
            console.log('Worker: Sprite sheet loaded');
            this.setupAnimations();
            this.markAsReadyForCreation();
        });

        this.scene.load.once('loaderror', (file) => {
            console.error('Worker: Failed to load sprite sheet:', file);
        });

        this.scene.load.start();
    }

    setupAnimationsIfNeeded() {
        if (this.scene.anims.exists('worker_walk_down')) {
            return;
        }
        this.setupAnimations();
    }

    markAsReadyForCreation() {
        this.spriteSheetReady = true;
        console.log('Worker: Ready for sprite creation');
    }

    setupAnimations() {
        console.log('Worker: Setting up walking animations...');

        Object.keys(this.animations).forEach(animKey => {
            const anim = this.animations[animKey];
            const shouldLoop = animKey !== 'idle';

            this.scene.anims.create({
                key: `worker_${animKey}`,
                frames: this.scene.anims.generateFrameNumbers('worker_sprites', {
                    frames: anim.frames
                }),
                frameRate: anim.frameRate,
                repeat: shouldLoop ? -1 : 0
            });

            console.log(`Worker: Created 'worker_${animKey}' @ ${anim.frameRate}fps`);
        });
    }

    createSprite(x, y) {
        console.log('Worker: Creating sprite...');

        if (this.sprite) {
            console.log('Worker: Sprite already exists');
            return;
        }

        this.sprite = this.scene.add.sprite(x, y, 'worker_sprites', 0);
        this.sprite.setDisplaySize(this.displaySize, this.displaySize);

        // Enable physics
        this.scene.physics.add.existing(this.sprite);
        this.body = this.sprite.body;

        // Set hitbox
        const hitboxOffset = (this.displaySize - this.hitboxSize) / 2;
        this.body.setSize(this.hitboxSize, this.hitboxSize);
        this.body.setOffset(hitboxOffset, hitboxOffset);

        // Enable gravity so workers can climb/fall on platforms
        this.body.setGravityY(300);
        this.body.setCollideWorldBounds(true);

        // Tint AI workers
        if (this.teamId === 'ai') {
            this.sprite.setTint(0x6699ff);
        }

        // Start idle
        this.sprite.play('worker_idle');
        this.currentAnimation = 'idle';

        this.isReady = true;
        console.log(`Worker (${this.teamId}): Sprite created at (${x}, ${y})`);
    }

    /**
     * Move toward a target position
     */
    moveToward(targetX, targetY) {
        if (!this.isReady || !this.body) return;

        const pos = this.getPosition();
        const dx = targetX - pos.x;
        const dy = targetY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            // Close enough, stop
            this.stop();
            return true; // Arrived
        }

        // Normalize and apply speed
        const vx = (dx / dist) * this.walkSpeed;
        const vy = (dy / dist) * this.walkSpeed;

        this.body.setVelocity(vx, vy);

        // Update animation based on movement direction
        this.updateWalkAnimation(vx, vy);

        return false; // Still moving
    }

    updateWalkAnimation(vx, vy) {
        let newAnim = 'idle';

        // Determine primary direction
        if (Math.abs(vx) > Math.abs(vy)) {
            // Horizontal movement
            newAnim = vx > 0 ? 'walk_right' : 'walk_left';
        } else if (Math.abs(vy) > 1) {
            // Vertical movement
            newAnim = vy > 0 ? 'walk_down' : 'walk_up';
        }

        if (newAnim !== this.currentAnimation) {
            this.currentAnimation = newAnim;
            this.sprite.play(`worker_${newAnim}`);
        }
    }

    stop() {
        if (!this.body) return;
        this.body.setVelocity(0, 0);

        if (this.currentAnimation !== 'idle') {
            this.currentAnimation = 'idle';
            this.sprite.play('worker_idle');
        }
    }

    /**
     * Pick up a treat
     */
    pickUpTreat(treat) {
        this.isCarrying = true;
        this.carryingTreat = treat;
        // Visual feedback - slightly larger when carrying
        this.sprite.setDisplaySize(this.displaySize + 4, this.displaySize + 4);
        console.log(`Worker (${this.teamId}): Picked up treat`);
    }

    /**
     * Drop treat at base
     */
    dropTreat() {
        const treat = this.carryingTreat;
        this.isCarrying = false;
        this.carryingTreat = null;
        this.sprite.setDisplaySize(this.displaySize, this.displaySize);
        console.log(`Worker (${this.teamId}): Dropped treat at base`);
        return treat;
    }

    getIsCarrying() {
        return this.isCarrying;
    }

    isFullyReady() {
        return this.isReady && this.sprite && this.body;
    }

    getPosition() {
        if (!this.sprite) return { x: 0, y: 0 };
        return { x: this.sprite.x, y: this.sprite.y };
    }

    getTeamId() {
        return this.teamId;
    }

    /**
     * Worker gets killed by a queen dive attack
     * Returns any treat they were carrying
     */
    die() {
        if (!this.isReady) return null;

        console.log(`Worker (${this.teamId}): Killed!`);

        // Drop any carried treat
        const droppedTreat = this.isCarrying ? this.carryingTreat : null;
        this.isCarrying = false;
        this.carryingTreat = null;

        // Visual death effect - flash and shrink
        if (this.sprite) {
            this.sprite.setTint(0xff0000);
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 300,
                ease: 'Power2'
            });
        }

        // Mark as not ready during death
        this.isReady = false;
        this.isDead = true;

        return droppedTreat;
    }

    /**
     * Respawn worker at base after delay
     */
    respawn(baseX, baseY) {
        if (!this.sprite) return;

        console.log(`Worker (${this.teamId}): Respawning at base`);

        // Reset position
        this.sprite.setPosition(baseX, baseY);
        this.sprite.setAlpha(1);
        this.sprite.setScale(1);

        // Reset tint
        if (this.teamId === 'ai') {
            this.sprite.setTint(0x6699ff);
        } else {
            this.sprite.clearTint();
        }

        // Reset display size
        this.sprite.setDisplaySize(this.displaySize, this.displaySize);

        // Reset state
        this.isReady = true;
        this.isDead = false;
        this.isCarrying = false;
        this.carryingTreat = null;
        this.stop();

        // Brief invincibility (handled by caller checking isInvincible)
        this.isInvincible = true;
        this.scene.time.delayedCall(1000, () => {
            this.isInvincible = false;
        });
    }

    getIsInvincible() {
        return this.isInvincible || false;
    }

    getIsDead() {
        return this.isDead || false;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        this.isReady = false;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkerSprite;
}
