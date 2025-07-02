/**
 * Puffacles - Cross-Platform Platformer Game
 * Mobile-first implementation with desktop enhancement
 * Built with Phaser.js following cross-platform development principles
 */

class PuffaclesGame {
    constructor() {
        this.gameStarted = false;
        this.gameTime = 0;
        this.playerLives = 9;
        this.score = 0;
        
        // Mobile-first configuration
        this.mobileConfig = {
            width: 800,        // Game world width
            height: 600,       // Game world height
            targetFPS: 60      // 60 FPS requirement
        };
        
        // Camera following settings
        this.cameraOffset = 0;
        this.worldBounds = { width: 2000, height: 600 }; // Scrolling world
        
        this.initPhaser();
        this.setupInputHandlers();
    }
    
    initPhaser() {
        // Mobile-first Phaser.js configuration
        const config = {
            type: Phaser.AUTO,
            width: this.mobileConfig.width,
            height: this.mobileConfig.height,
            canvas: document.getElementById('puffacles-canvas'),
            backgroundColor: '#87CEEB',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: this.mobileConfig.width,
                height: this.mobileConfig.height
            },
            render: {
                antialias: false,    // Mobile optimization
                pixelArt: true      // Crisp sprite rendering
            },
            scene: {
                preload: this.preload.bind(this),
                create: this.create.bind(this),
                update: this.update.bind(this)
            }
        };
        
        this.game = new Phaser.Game(config);
    }
    
    preload() {
        // Load Puffy sprite (reusing from hop-hop-puff)
        this.load.image('puffy', 'assets/puffy_winks_transparent.png');
        
        // Create simple colored rectangles for obstacles (Phase 3)
        this.load.image('block', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        console.log('Puffacles assets loaded');
    }
    
    create() {
        // World bounds for camera following
        this.physics.world.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);
        
        // Create Puffy player sprite
        this.player = this.physics.add.sprite(100, 400, 'puffy');
        this.player.setDisplaySize(48, 48); // Standard Puffy size
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false); // Allow scrolling beyond initial view
        
        // Player physics
        this.player.body.setSize(32, 40); // Collision box
        
        // Camera following system (Phase 1 requirement)
        this.cameras.main.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(200, 100); // Camera deadzone for smooth following
        
        // Create ground platforms
        this.platforms = this.physics.add.staticGroup();
        this.createInitialPlatforms();
        
        // Player-platform collision
        this.physics.add.collider(this.player, this.platforms);
        
        // Keyboard controls (desktop enhancement)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Player movement state
        this.playerState = {
            isJumping: false,
            isMoving: false,
            lastDirection: 'right'
        };
        
        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        this.gameStarted = true;
        
        console.log('Puffacles game created - Phase 0 & 1 complete');
    }
    
    createInitialPlatforms() {
        // Ground platform
        for (let x = 0; x < this.worldBounds.width; x += 64) {
            const ground = this.platforms.create(x, this.worldBounds.height - 32, 'block');
            ground.setDisplaySize(64, 64);
            ground.setTint(0x8B4513); // Brown ground
        }
        
        // Some basic platforms for testing
        const platform1 = this.platforms.create(300, 450, 'block');
        platform1.setDisplaySize(128, 32);
        platform1.setTint(0x32CD32); // Green platform
        
        const platform2 = this.platforms.create(600, 350, 'block');
        platform2.setDisplaySize(96, 32);
        platform2.setTint(0x32CD32);
        
        const platform3 = this.platforms.create(900, 250, 'block');
        platform3.setDisplaySize(128, 32);
        platform3.setTint(0x32CD32);
    }
    
    update(time, delta) {
        if (!this.gameStarted) return;
        
        // Update game time for scoring
        this.gameTime += delta;
        this.updateUI();
        
        // Handle player movement (unified input system)
        this.handlePlayerMovement();
        
        // Camera following logic (Phase 1 requirement)
        this.updateCameraFollowing();
    }
    
    handlePlayerMovement() {
        const player = this.player;
        const speed = 200;
        const jumpSpeed = -500;
        
        // Reset movement state
        this.playerState.isMoving = false;
        
        // Left movement (keyboard or touch)
        if (this.cursors.left.isDown || this.inputState.left) {
            player.setVelocityX(-speed);
            this.playerState.isMoving = true;
            this.playerState.lastDirection = 'left';
        }
        // Right movement (keyboard or touch)
        else if (this.cursors.right.isDown || this.inputState.right) {
            player.setVelocityX(speed);
            this.playerState.isMoving = true;
            this.playerState.lastDirection = 'right';
        }
        else {
            player.setVelocityX(0);
        }
        
        // Jumping (keyboard or touch)
        const canJump = player.body.touching.down || player.body.blocked.down;
        if ((this.cursors.space.isDown || this.spaceKey.isDown || this.inputState.jump) && canJump && !this.playerState.isJumping) {
            player.setVelocityY(jumpSpeed);
            this.playerState.isJumping = true;
        }
        
        // Reset jump state when landing
        if (canJump && this.playerState.isJumping) {
            this.playerState.isJumping = false;
        }
    }
    
    updateCameraFollowing() {
        // Camera follows player when moving right (Phase 1 requirement)
        // Simple implementation - camera centers on player when moving right
        if (this.playerState.lastDirection === 'right' && this.playerState.isMoving) {
            // Camera automatically follows due to startFollow, but we can add custom logic here
            // For now, Phaser's built-in camera following handles this
        }
        
        // Prevent camera from going too far left (basic left boundary)
        if (this.cameras.main.scrollX < 0) {
            this.cameras.main.setScroll(0, this.cameras.main.scrollY);
        }
    }
    
    updateUI() {
        // Update health display
        document.getElementById('health-display').textContent = `❤️ Lives: ${this.playerLives}`;
        
        // Update score/time display
        const timeSeconds = Math.floor(this.gameTime / 1000);
        document.getElementById('score-display').textContent = `⏱️ Time: ${timeSeconds}s`;
    }
    
    setupInputHandlers() {
        // Unified input state for touch and keyboard
        this.inputState = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false
        };
        
        // Mobile touch controls
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        // D-pad touch controls
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        dpadButtons.forEach(btn => {
            const direction = btn.getAttribute('data-direction');
            if (!direction) return;
            
            // Touch start
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.inputState[direction] = true;
                this.addTouchFeedback(btn);
            }, { passive: false });
            
            // Touch end
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.inputState[direction] = false;
                this.removeTouchFeedback(btn);
            }, { passive: false });
            
            // Mouse events for desktop testing
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.inputState[direction] = true;
                this.addTouchFeedback(btn);
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.inputState[direction] = false;
                this.removeTouchFeedback(btn);
            });
        });
        
        // Jump button
        const jumpBtn = document.querySelector('.jump-btn');
        if (jumpBtn) {
            // Touch events
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.inputState.jump = true;
                this.addTouchFeedback(jumpBtn);
            }, { passive: false });
            
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.inputState.jump = false;
                this.removeTouchFeedback(jumpBtn);
            }, { passive: false });
            
            // Mouse events for desktop testing
            jumpBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.inputState.jump = true;
                this.addTouchFeedback(jumpBtn);
            });
            
            jumpBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.inputState.jump = false;
                this.removeTouchFeedback(jumpBtn);
            });
        }
    }
    
    addTouchFeedback(element) {
        element.style.transform = 'scale(0.95)';
        element.style.opacity = '1';
    }
    
    removeTouchFeedback(element) {
        element.style.transform = 'scale(1)';
        element.style.opacity = '0.8';
    }
    
    // Health system methods (Phase 2)
    takeDamage() {
        this.playerLives--;
        this.updateUI();
        
        // Visual feedback for damage
        this.player.setTint(0xff0000);
        setTimeout(() => {
            this.player.clearTint();
        }, 200);
        
        if (this.playerLives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        console.log('Game Over - Puffacles');
        // Game over logic will be implemented in Phase 7
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Puffacles - Cross-Platform Platformer');
    window.puffaclesGame = new PuffaclesGame();
});

// Performance monitoring for mobile
if (typeof performance !== 'undefined') {
    setInterval(() => {
        const fps = Math.round(1000 / (performance.now() - (window.lastFrameTime || performance.now())));
        window.lastFrameTime = performance.now();
        
        if (fps < 55) {
            console.warn(`Puffacles FPS: ${fps} - Below 60 FPS target`);
        }
    }, 1000);
} 