/**
 * Puffy Sprite Management System
 * Handles 4x4 sprite sheet with dynamic frame size detection
 * 
 * Frame Layout (4x4 grid):
 * Row 0 (0-3):  Walking up/away (ladder climbing)
 * Row 1 (4-7):  Walking left  
 * Row 2 (8-11): Walking down/toward
 * Row 3 (12-15): Walking right
 */

class PuffySprite {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        this.body = null;
        
        // Animation state
        this.currentDirection = 'idle';
        this.isMoving = false;
        
        // Ready state
        this.isReady = false;
        this.spriteSheetReady = false;
        
        // Movement properties
        this.speed = 100; // pixels per second
        this.displaySize = 48; // pixels
        this.hitboxSize = 32; // pixels (centered)
        
        // Frame detection (will be set after image analysis)
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = 16;
        
        // Animation mappings
        this.animations = {
            'walk_up': { frames: [0, 1, 2, 3], description: 'Walking up/away (ladder)', flip: false },
            'walk_left': { frames: [4, 5, 6, 7], description: 'Walking left', flip: false },
            'walk_down': { frames: [8, 9, 10, 11], description: 'Walking down/toward', flip: false },
            'walk_right': { frames: [4, 5, 6, 7], description: 'Walking right (flipped left)', flip: true },
            'idle_up': { frames: [1], description: 'Idle facing up', flip: false },
            'idle_left': { frames: [5], description: 'Idle facing left', flip: false },
            'idle_down': { frames: [9], description: 'Idle facing down', flip: false },
            'idle_right': { frames: [5], description: 'Idle facing right (flipped left)', flip: true }
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🐱 Initializing Puffy sprite with dynamic frame detection...');
            
            // First, analyze the sprite sheet image
            await this.analyzeImageDimensions();
            
            // Then load and create the sprite
            this.loadSpriteSheet();
            
        } catch (error) {
            console.error('❌ Failed to initialize Puffy sprite:', error);
            this.handleLoadError(error);
        }
    }
    
    async analyzeImageDimensions() {
        console.log('📐 Analyzing puffy_4_by_4.png dimensions...');
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;
                
                // Calculate frame size for 4x4 grid
                this.frameWidth = Math.floor(width / 4);
                this.frameHeight = Math.floor(height / 4);
                
                console.log(`📐 Image dimensions: ${width}x${height}`);
                console.log(`📐 Calculated frame size: ${this.frameWidth}x${this.frameHeight}`);
                console.log(`📐 Total frames: ${this.totalFrames} (4x4 grid)`);
                
                if (this.frameWidth <= 0 || this.frameHeight <= 0) {
                    reject(new Error(`Invalid frame dimensions: ${this.frameWidth}x${this.frameHeight}`));
                    return;
                }
                
                resolve();
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load puffy_4_by_4.png for analysis'));
            };
            
            // Load the image with cache busting
            img.src = 'assets/puffy_4_by_4.png?t=' + Date.now();
        });
    }
    
    loadSpriteSheet() {
        console.log(`🎮 Loading sprite sheet with detected frame size: ${this.frameWidth}x${this.frameHeight}`);
        
        // Load the sprite sheet using detected dimensions
        this.scene.load.spritesheet('puffy_sprites', 'assets/puffy_4_by_4.png', {
            frameWidth: this.frameWidth,
            frameHeight: this.frameHeight
        });
        
        // Set load completion handler
        this.scene.load.once('complete', () => {
            console.log('✅ Sprite sheet loaded successfully!');
            // Don't create sprite immediately - let GameScene decide position
            this.setupAnimations();
            this.logFrameInfo();
            this.markAsReadyForCreation();
        });
        
        // Set error handler
        this.scene.load.once('loaderror', (file) => {
            console.error('❌ Failed to load sprite sheet:', file);
            this.handleLoadError(new Error(`Failed to load: ${file.key}`));
        });
        
        // Start loading
        this.scene.load.start();
    }
    
    createSprite(x = null, y = null) {
        console.log('🎯 Creating Puffy sprite...');
        
        // Prevent duplicate sprite creation
        if (this.sprite) {
            console.log('⚠️ Sprite already exists, skipping creation');
            return;
        }
        
        // Use provided position or default to (0, 0) - let GameScene handle positioning
        const posX = x !== null ? x : 0;
        const posY = y !== null ? y : 0;
        this.sprite = this.scene.add.sprite(posX, posY, 'puffy_sprites', 0);
        
        // Set display size (spec: 48x48 pixels)
        this.sprite.setDisplaySize(this.displaySize, this.displaySize);
        
        // Enable physics body
        this.scene.physics.add.existing(this.sprite);
        this.body = this.sprite.body;
        
        // Set hitbox (spec: 32x32 pixels, centered)
        const hitboxOffset = (this.displaySize - this.hitboxSize) / 2;
        this.body.setSize(this.hitboxSize, this.hitboxSize);
        this.body.setOffset(hitboxOffset, hitboxOffset);
        
        // Set physics properties
        this.body.setCollideWorldBounds(true);
        this.body.setGravityY(300); // Gravity for platform jumping
        
        // Mark as ready for use
        this.isReady = true;
        
        console.log(`✅ Sprite created at (${this.sprite.x}, ${this.sprite.y})`);
        console.log(`📏 Display size: ${this.displaySize}x${this.displaySize}`);
        console.log(`🎯 Hitbox size: ${this.hitboxSize}x${this.hitboxSize}`);
        console.log(`🟢 PuffySprite is now READY for physics operations!`);
    }
    
    markAsReadyForCreation() {
        // Mark that sprite sheet is loaded and ready for sprite creation
        this.spriteSheetReady = true;
        console.log('✅ Sprite sheet ready for sprite creation');
    }

    setupAnimations() {
        console.log('🎬 Setting up animations...');
        
        // Create all animations
        Object.keys(this.animations).forEach(animKey => {
            const anim = this.animations[animKey];
            
            // Moderate frame rates for natural walking (16 fps)
            const frameRate = animKey.startsWith('walk') ? 16 : 4; // 16 fps for walking, 4 for idle
            
            this.scene.anims.create({
                key: animKey,
                frames: this.scene.anims.generateFrameNumbers('puffy_sprites', { 
                    frames: anim.frames 
                }),
                frameRate: frameRate,
                repeat: animKey.startsWith('walk') ? -1 : 0
            });
            
            console.log(`📝 Created animation '${animKey}': frames [${anim.frames.join(', ')}] @ ${frameRate}fps - ${anim.description}`);
        });
        
        console.log('✅ All animations ready with natural walking speed!');
    }

    startInitialAnimation() {
        if (this.sprite) {
            // Start with idle down animation
            this.sprite.play('idle_down');
            this.currentDirection = 'idle_down';
            console.log('🎬 Started initial idle_down animation');
        }
    }
    
    logFrameInfo() {
        console.log('📊 Puffy Sprite Frame Analysis:');
        console.log(`   Image Dimensions: ${this.frameWidth * 4}x${this.frameHeight * 4}`);
        console.log(`   Frame Size: ${this.frameWidth}x${this.frameHeight}`);
        console.log(`   Display Size: ${this.displaySize}x${this.displaySize}`);
        console.log(`   Hitbox Size: ${this.hitboxSize}x${this.hitboxSize}`);
        console.log(`   Total Frames: ${this.totalFrames} (4x4 grid)`);
        console.log('   Animation Layout:');
        console.log('     Row 0 (0-3):  Walking up/away');
        console.log('     Row 1 (4-7):  Walking left (also used flipped for right)');
        console.log('     Row 2 (8-11): Walking down/toward');
        console.log('     Row 3 (12-15): Unused (or alternative animations)');
    }
    
    // Movement methods
    move(direction) {
        if (!this.isReady || !this.sprite || !this.body) {
            console.log(`⏳ PuffySprite not ready for movement (ready: ${this.isReady}, sprite: ${!!this.sprite}, body: ${!!this.body})`);
            return;
        }
        
        const wasMoving = this.isMoving;
        this.isMoving = true;
        
        // Update movement direction
        switch (direction) {
            case 'up':
                this.body.setVelocityY(-this.speed);
                this.body.setVelocityX(0);
                this.playAnimation('walk_up');
                break;
                
            case 'down':
                this.body.setVelocityY(this.speed);
                this.body.setVelocityX(0);
                this.playAnimation('walk_down');
                break;
                
            case 'left':
                this.body.setVelocityX(-this.speed);
                this.body.setVelocityY(0);
                this.playAnimation('walk_left');
                break;
                
            case 'right':
                this.body.setVelocityX(this.speed);
                this.body.setVelocityY(0);
                this.playAnimation('walk_right');
                break;
        }
        
        // Update animation speed if movement started
        if (!wasMoving && this.isMoving) {
            this.updateAnimationSpeed();
        }
    }
    
    stop() {
        if (!this.isReady || !this.sprite || !this.body) {
            console.log(`⏳ PuffySprite not ready for stop (ready: ${this.isReady}, sprite: ${!!this.sprite}, body: ${!!this.body})`);
            return;
        }
        
        this.isMoving = false;
        this.body.setVelocity(0, 0);
        
        // Switch to idle animation based on last direction
        const lastDirection = this.currentDirection.replace('walk_', '');
        this.playAnimation(`idle_${lastDirection}`);
    }
    
    playAnimation(animationKey) {
        if (!this.sprite || this.currentDirection === animationKey) return;
        
        this.currentDirection = animationKey;
        
        // Apply horizontal flip for rightward animations
        const animConfig = this.animations[animationKey];
        if (animConfig && animConfig.flip !== undefined) {
            this.sprite.setFlipX(animConfig.flip);
        }
        
        this.sprite.play(animationKey);
        
        console.log(`🎬 Playing animation: ${animationKey}${animConfig?.flip ? ' (horizontally flipped)' : ''}`);
    }
    
    updateAnimationSpeed() {
        // Moderate animation frame rates for natural movement
        const walkingFrameRate = this.isMoving ? 16 : 4; // 16 fps for walking, 4 for idle
        
        Object.keys(this.animations).forEach(animKey => {
            if (this.scene.anims.exists(animKey)) {
                const anim = this.scene.anims.get(animKey);
                anim.frameRate = animKey.startsWith('walk') ? walkingFrameRate : 4;
            }
        });
        
        console.log(`🎬 Updated animation speeds: walking=${walkingFrameRate}fps, idle=4fps`);
    }
    
    // Testing methods
    cycleAnimations() {
        if (!this.sprite) return;
        
        const animKeys = Object.keys(this.animations);
        const currentIndex = animKeys.indexOf(this.currentDirection);
        const nextIndex = (currentIndex + 1) % animKeys.length;
        const nextAnim = animKeys[nextIndex];
        
        this.playAnimation(nextAnim);
        
        console.log(`🔄 Cycling to animation: ${nextAnim} (${this.animations[nextAnim].description})`);
        return nextAnim;
    }
    
    // Error handling
    handleLoadError(error) {
        console.error('❌ Puffy sprite error:', error.message);
        
        // Create error placeholder
        if (this.scene && this.scene.add) {
            this.sprite = this.scene.add.rectangle(160, 120, 48, 48, 0xff0000);
            this.scene.add.text(160, 140, 'SPRITE\nERROR', {
                fontSize: '12px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    // Ready state check
    isFullyReady() {
        const ready = this.isReady && this.sprite && this.body;
        if (!ready) {
            console.log(`⏳ PuffySprite readiness check: ready=${this.isReady}, sprite=${!!this.sprite}, body=${!!this.body}`);
        }
        return ready;
    }

    // Debug visualization
    showDebugInfo() {
        console.log('🐛 PuffySprite Debug Info:');
        console.log(`   Ready State: ${this.isReady}`);
        console.log(`   Sprite Exists: ${!!this.sprite}`);
        console.log(`   Body Exists: ${!!this.body}`);
        
        if (this.sprite) {
            console.log(`   Position: (${this.sprite.x}, ${this.sprite.y})`);
            console.log(`   Current Animation: ${this.currentDirection}`);
            console.log(`   Is Moving: ${this.isMoving}`);
        }
        
        if (this.body) {
            console.log(`   Velocity: (${this.body.velocity.x}, ${this.body.velocity.y})`);
            console.log(`   Gravity: ${this.body.gravity.y}`);
        }
        
        console.log(`   Frame Size: ${this.frameWidth}x${this.frameHeight}`);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuffySprite;
} 