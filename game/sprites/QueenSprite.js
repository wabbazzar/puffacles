/**
 * Queen Sprite Management System
 * Flying queen with tap-to-flap mechanics
 *
 * Frame Layout (4x4 grid, 48x48 per frame):
 * Row 0 (0-3):  hover - idle floating, slow wing flap
 * Row 1 (4-7):  flap_up - upward thrust, fast wing beat
 * Row 2 (8-11): fall - falling/gliding, wings up
 * Row 3 (12-15): dive - dive attack (placeholder)
 */

class QueenSprite {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        this.body = null;

        // Ready state
        this.isReady = false;
        this.spriteSheetReady = false;

        // Physics constants (from PRD)
        this.gravity = 400;        // px/sec²
        this.flapImpulse = -180;   // px/sec (instant upward velocity)
        this.maxFallSpeed = 200;   // px/sec
        this.maxRiseSpeed = -250;  // px/sec
        this.baseHorizontalSpeed = 120; // px/sec (base value)
        this.speedMultiplier = 1.0;     // Can be reduced for AI queen
        this.horizontalSpeed = this.baseHorizontalSpeed * this.speedMultiplier;

        // Display properties
        this.displaySize = 48; // pixels
        this.hitboxSize = 32;  // pixels (centered)

        // Frame detection (set after image analysis)
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = 16;

        // Animation mappings for flying queen
        this.animations = {
            'hover': { frames: [0, 1, 2, 3], frameRate: 8, description: 'Idle floating' },
            'flap_up': { frames: [4, 5, 6, 7], frameRate: 16, description: 'Upward thrust' },
            'fall': { frames: [8, 9, 10, 11], frameRate: 8, description: 'Falling/gliding' },
            'dive': { frames: [12, 13, 14, 15], frameRate: 12, description: 'Dive attack' }
        };

        // Current animation state
        this.currentAnimation = 'hover';

        // Combat state
        this.isDiving = false;
        this.diveSpeed = 300; // Fast downward speed during dive

        // Lives system
        this.lives = 3; // Reduced for faster military victories
        this.isInvincible = false;
        this.invincibilityDuration = 2000; // 2 seconds
        this.invincibilityTimer = 0;
        this.invincibilityFlashRate = 100; // ms between flashes

        this.init();
    }

    async init() {
        try {
            console.log('Queen: Initializing with dynamic frame detection...');
            await this.analyzeImageDimensions();
            this.loadSpriteSheet();
        } catch (error) {
            console.error('Queen: Failed to initialize:', error);
            this.handleLoadError(error);
        }
    }

    async analyzeImageDimensions() {
        console.log('Queen: Analyzing regal_puffy_4by4.png dimensions...');

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                // Calculate frame size for 4x4 grid
                this.frameWidth = Math.floor(width / 4);
                this.frameHeight = Math.floor(height / 4);

                console.log(`Queen: Image ${width}x${height}, frame size ${this.frameWidth}x${this.frameHeight}`);

                if (this.frameWidth <= 0 || this.frameHeight <= 0) {
                    reject(new Error(`Invalid frame dimensions: ${this.frameWidth}x${this.frameHeight}`));
                    return;
                }

                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load regal_puffy_4by4.png'));
            };

            img.src = 'assets/regal_puffy_4by4.png?t=' + Date.now();
        });
    }

    loadSpriteSheet() {
        // Check if texture already exists (for multiple queen instances)
        if (this.scene.textures.exists('queen_sprites')) {
            console.log('Queen: Sprite sheet already loaded, reusing');
            this.setupAnimationsIfNeeded();
            this.markAsReadyForCreation();
            return;
        }

        console.log(`Queen: Loading sprite sheet (${this.frameWidth}x${this.frameHeight} frames)`);

        this.scene.load.spritesheet('queen_sprites', 'assets/regal_puffy_4by4.png', {
            frameWidth: this.frameWidth,
            frameHeight: this.frameHeight
        });

        this.scene.load.once('complete', () => {
            console.log('Queen: Sprite sheet loaded');
            this.setupAnimations();
            this.markAsReadyForCreation();
        });

        this.scene.load.once('loaderror', (file) => {
            console.error('Queen: Failed to load sprite sheet:', file);
            this.handleLoadError(new Error(`Failed to load: ${file.key}`));
        });

        this.scene.load.start();
    }

    setupAnimationsIfNeeded() {
        // Check if animations already exist
        if (this.scene.anims.exists('queen_hover')) {
            console.log('Queen: Animations already exist, skipping setup');
            return;
        }
        this.setupAnimations();
    }

    markAsReadyForCreation() {
        this.spriteSheetReady = true;
        console.log('Queen: Ready for sprite creation');
    }

    setupAnimations() {
        console.log('Queen: Setting up flying animations...');

        // Animations that should loop
        const loopingAnimations = ['hover', 'fall'];

        Object.keys(this.animations).forEach(animKey => {
            const anim = this.animations[animKey];
            const shouldLoop = loopingAnimations.includes(animKey);

            this.scene.anims.create({
                key: `queen_${animKey}`,
                frames: this.scene.anims.generateFrameNumbers('queen_sprites', {
                    frames: anim.frames
                }),
                frameRate: anim.frameRate,
                repeat: shouldLoop ? -1 : 0 // hover/fall loop, flap_up/dive play once
            });

            console.log(`Queen: Created 'queen_${animKey}' @ ${anim.frameRate}fps - ${anim.description} (loop: ${shouldLoop})`);
        });

        console.log('Queen: All animations ready');
    }

    createSprite(x = null, y = null) {
        console.log('Queen: Creating sprite...');

        if (this.sprite) {
            console.log('Queen: Sprite already exists');
            return;
        }

        const posX = x !== null ? x : 160; // Default to center of 320 width
        const posY = y !== null ? y : 90;  // Default to center of 180 height

        this.sprite = this.scene.add.sprite(posX, posY, 'queen_sprites', 0);
        this.sprite.setDisplaySize(this.displaySize, this.displaySize);

        // Enable physics
        this.scene.physics.add.existing(this.sprite);
        this.body = this.sprite.body;

        // Set hitbox (32x32 centered in 48x48 display)
        const hitboxOffset = (this.displaySize - this.hitboxSize) / 2;
        this.body.setSize(this.hitboxSize, this.hitboxSize);
        this.body.setOffset(hitboxOffset, hitboxOffset);

        // Set physics properties
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.3); // More bounce for tighter feel
        this.body.setGravityY(this.gravity);
        this.body.setMaxVelocityY(this.maxFallSpeed);
        this.body.setDragX(400); // Air friction for tighter horizontal control

        // Start with hover animation
        this.sprite.play('queen_hover');
        this.currentAnimation = 'hover';

        this.isReady = true;

        console.log(`Queen: Sprite created at (${posX}, ${posY})`);
    }

    /**
     * Flap - apply upward impulse
     */
    flap() {
        if (!this.isReady || !this.body) return;

        // Apply instant upward velocity (not additive)
        this.body.setVelocityY(this.flapImpulse);

        // Clamp to max rise speed
        if (this.body.velocity.y < this.maxRiseSpeed) {
            this.body.setVelocityY(this.maxRiseSpeed);
        }

        console.log('Queen: Flap!');
    }

    /**
     * Move horizontally
     * @param {number} direction -1 for left, 1 for right, 0 for stop
     */
    moveHorizontal(direction) {
        if (!this.isReady || !this.body) return;

        this.body.setVelocityX(direction * this.horizontalSpeed);

        // Flip sprite based on direction
        if (direction < 0) {
            this.sprite.setFlipX(true);
        } else if (direction > 0) {
            this.sprite.setFlipX(false);
        }
    }

    /**
     * Stop horizontal movement
     */
    stopHorizontal() {
        if (!this.isReady || !this.body) return;
        this.body.setVelocityX(0);
    }

    /**
     * Start dive attack
     */
    startDive() {
        if (!this.isReady || !this.body) return;
        if (this.isDiving) return; // Already diving

        this.isDiving = true;
        this.body.setVelocityY(this.diveSpeed);
        this.body.setMaxVelocityY(this.diveSpeed); // Allow faster fall during dive

        // Play dive animation
        this.currentAnimation = 'dive';
        this.sprite.play('queen_dive');

        // Apply directional rotation based on horizontal velocity
        const vx = this.body.velocity.x;
        if (vx < -20) {
            // Moving left - tilt left (negative rotation)
            this.sprite.setRotation(-0.35); // ~20 degrees left
        } else if (vx > 20) {
            // Moving right - tilt right (positive rotation)
            this.sprite.setRotation(0.35); // ~20 degrees right
        } else {
            // Straight down - no rotation
            this.sprite.setRotation(0);
        }

        console.log('Queen: DIVE ATTACK!');
    }

    /**
     * End dive attack (call when hitting ground or target)
     */
    endDive() {
        if (!this.isDiving) return;

        this.isDiving = false;
        this.body.setMaxVelocityY(this.maxFallSpeed); // Reset max fall speed

        // Reset rotation
        if (this.sprite) {
            this.sprite.setRotation(0);
        }

        console.log('Queen: Dive ended');
    }

    /**
     * Check if currently diving (for combat detection)
     */
    getIsDiving() {
        return this.isDiving;
    }

    /**
     * Take damage - lose a life and become invincible
     * Returns true if queen died (no lives left)
     */
    takeDamage() {
        if (this.isInvincible) return false;

        this.lives--;
        console.log(`Queen: Took damage! Lives remaining: ${this.lives}`);

        if (this.lives <= 0) {
            console.log('Queen: DEFEATED!');
            return true; // Queen is dead
        }

        // Start invincibility
        this.startInvincibility();
        return false;
    }

    /**
     * Start invincibility period after taking damage
     */
    startInvincibility() {
        this.isInvincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
        console.log('Queen: Invincibility started');
    }

    /**
     * Update invincibility timer - call in update loop
     */
    updateInvincibility(delta) {
        if (!this.isInvincible) return;

        this.invincibilityTimer -= delta;

        // Flash effect during invincibility
        if (this.sprite) {
            const flashOn = Math.floor(this.invincibilityTimer / this.invincibilityFlashRate) % 2 === 0;
            this.sprite.setAlpha(flashOn ? 1 : 0.3);
        }

        // End invincibility
        if (this.invincibilityTimer <= 0) {
            this.isInvincible = false;
            if (this.sprite) {
                this.sprite.setAlpha(1);
            }
            console.log('Queen: Invincibility ended');
        }
    }

    /**
     * Check if currently invincible
     */
    getIsInvincible() {
        return this.isInvincible;
    }

    /**
     * Get current lives count
     */
    getLives() {
        return this.lives;
    }

    /**
     * Reset lives (for game restart)
     */
    resetLives() {
        this.lives = 3; // Match initial lives count
        this.isInvincible = false;
        if (this.sprite) {
            this.sprite.setAlpha(1);
        }
    }

    /**
     * Set speed multiplier (use < 1.0 for slower AI queen)
     * @param {number} multiplier - Speed multiplier (0.83 = ~100px/sec vs 120px/sec base)
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
        this.horizontalSpeed = this.baseHorizontalSpeed * this.speedMultiplier;
        console.log(`Queen: Speed multiplier set to ${multiplier}, horizontal speed now ${this.horizontalSpeed}`);
    }

    /**
     * Update - call in scene update loop
     * Handles animation state machine based on velocity
     * @param {number} delta - Time since last frame in ms
     */
    update(delta = 16.67) {
        if (!this.isReady || !this.body) return;

        // Update invincibility
        this.updateInvincibility(delta);

        const vy = this.body.velocity.y;
        const pos = this.getPosition();

        // End dive if we hit the bottom
        if (this.isDiving && pos.y >= 160) {
            this.endDive();
        }

        // Update dive rotation based on current velocity (for dynamic direction changes)
        if (this.isDiving && this.sprite) {
            const vx = this.body.velocity.x;
            if (vx < -20) {
                this.sprite.setRotation(-0.35);
            } else if (vx > 20) {
                this.sprite.setRotation(0.35);
            } else {
                this.sprite.setRotation(0);
            }
            return; // Skip normal animation logic if diving
        }

        // Skip normal animation logic if diving
        if (this.isDiving) {
            return;
        }

        let newAnimation = 'hover';

        // Animation state machine based on vertical velocity
        if (vy < -50) {
            newAnimation = 'flap_up';
        } else if (vy > 50) {
            newAnimation = 'fall';
        } else {
            newAnimation = 'hover';
        }

        // Only change animation if different
        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation = newAnimation;
            this.sprite.play(`queen_${newAnimation}`);
        }
    }

    /**
     * Check if sprite is fully ready for use
     */
    isFullyReady() {
        return this.isReady && this.sprite && this.body;
    }

    /**
     * Get current position
     */
    getPosition() {
        if (!this.sprite) return { x: 0, y: 0 };
        return { x: this.sprite.x, y: this.sprite.y };
    }

    /**
     * Get current velocity
     */
    getVelocity() {
        if (!this.body) return { x: 0, y: 0 };
        return { x: this.body.velocity.x, y: this.body.velocity.y };
    }

    handleLoadError(error) {
        console.error('Queen: Load error:', error.message);

        // Create error placeholder
        if (this.scene && this.scene.add) {
            this.sprite = this.scene.add.rectangle(160, 90, 48, 48, 0xff0000);
            this.scene.add.text(160, 110, 'SPRITE\nERROR', {
                fontSize: '10px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }
    }

    showDebugInfo() {
        console.log('Queen Debug:');
        console.log(`  Ready: ${this.isReady}`);
        console.log(`  Animation: ${this.currentAnimation}`);
        if (this.sprite) {
            console.log(`  Position: (${this.sprite.x.toFixed(1)}, ${this.sprite.y.toFixed(1)})`);
        }
        if (this.body) {
            console.log(`  Velocity: (${this.body.velocity.x.toFixed(1)}, ${this.body.velocity.y.toFixed(1)})`);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueenSprite;
}
