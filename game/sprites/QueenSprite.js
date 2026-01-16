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
        this.horizontalSpeed = 120; // px/sec

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
        console.log('Queen: Analyzing queen_sprite_4x4.png dimensions...');

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
                reject(new Error('Failed to load queen_sprite_4x4.png'));
            };

            img.src = 'assets/queen_sprite_4x4.png?t=' + Date.now();
        });
    }

    loadSpriteSheet() {
        console.log(`Queen: Loading sprite sheet (${this.frameWidth}x${this.frameHeight} frames)`);

        this.scene.load.spritesheet('queen_sprites', 'assets/queen_sprite_4x4.png', {
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

    markAsReadyForCreation() {
        this.spriteSheetReady = true;
        console.log('Queen: Ready for sprite creation');
    }

    setupAnimations() {
        console.log('Queen: Setting up flying animations...');

        Object.keys(this.animations).forEach(animKey => {
            const anim = this.animations[animKey];

            this.scene.anims.create({
                key: `queen_${animKey}`,
                frames: this.scene.anims.generateFrameNumbers('queen_sprites', {
                    frames: anim.frames
                }),
                frameRate: anim.frameRate,
                repeat: -1 // All animations loop
            });

            console.log(`Queen: Created 'queen_${animKey}' @ ${anim.frameRate}fps - ${anim.description}`);
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
        this.body.setBounce(0.1); // Slight bounce off boundaries
        this.body.setGravityY(this.gravity);
        this.body.setMaxVelocityY(this.maxFallSpeed);

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
     * Update - call in scene update loop
     * Handles animation state machine based on velocity
     */
    update() {
        if (!this.isReady || !this.body) return;

        const vy = this.body.velocity.y;
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
