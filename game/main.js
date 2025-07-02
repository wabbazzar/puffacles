// Hop Hop Puff - Mobile-First Phaser.js Game Engine
// Simplified version - straight to gameplay

console.log('🐱 Hop Hop Puff - Loading mobile-first game engine...');

// Vector2 class for joystick math
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    sub(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    mul(n) {
        return new Vector2(this.x * n, this.y * n);
    }
    div(n) {
        return new Vector2(this.x / n, this.y / n);
    }
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    normalize() {
        return this.mag() === 0 ? new Vector2(0, 0) : this.div(this.mag());
    }
}

// Working Joystick class (canvas-based)
// Simple Movement Button class
class MovementButton {
    constructor(x, y, width, height, direction, gameScene) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.direction = direction; // 'left' or 'right'
        this.pressed = false;
        this.gameScene = gameScene;
        this.listener();
    }

    listener() {
        addEventListener('touchstart', e => {
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    e.preventDefault();
                    this.pressed = true;
                    if ('vibrate' in navigator) {
                        navigator.vibrate(30);
                    }
                    break;
                }
            }
        }, { passive: false });

        addEventListener('touchend', e => {
            // Check if any remaining touches are still on this button
            let stillPressed = false;
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    stillPressed = true;
                    break;
                }
            }
            if (!stillPressed) {
                this.pressed = false;
            }
        }, { passive: false });

        addEventListener('touchmove', e => {
            // Check if any touches are on this button
            let isPressed = false;
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    isPressed = true;
                    break;
                }
            }
            this.pressed = isPressed;
        }, { passive: false });

        // Mouse events for desktop testing
        addEventListener('mousedown', e => {
            if (this.isInside(e.pageX, e.pageY)) {
                this.pressed = true;
            }
        });

        addEventListener('mouseup', () => {
            this.pressed = false;
        });
    }

    isInside(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height;
    }

    draw(context) {
        // Unobtrusive design - subtle colors
        const fillColor = this.pressed ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)';
        const borderColor = this.pressed ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)';
        
        // Draw button background
        context.fillStyle = fillColor;
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw button border
        context.strokeStyle = borderColor;
        context.lineWidth = 1;
        context.strokeRect(this.x, this.y, this.width, this.height);

        // Draw arrow indicator
        context.fillStyle = this.pressed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const arrow = this.direction === 'left' ? '←' : '→';
        context.fillText(arrow, centerX, centerY);
    }

    update(context) {
        this.draw(context);
    }
}

// Simple Jump Button class
class JumpButton {
    constructor(x, y, width, height, gameScene) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.pressed = false;
        this.gameScene = gameScene;
        this.listener();
    }

    listener() {
        addEventListener('touchstart', e => {
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    e.preventDefault();
                    this.pressed = true;
                    this.jump();
                    if ('vibrate' in navigator) {
                        navigator.vibrate(50);
                    }
                    break;
                }
            }
        }, { passive: false });

        addEventListener('touchend', e => {
            // Check if any remaining touches are still on this button
            let stillPressed = false;
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    stillPressed = true;
                    break;
                }
            }
            if (!stillPressed) {
                this.pressed = false;
            }
        }, { passive: false });

        addEventListener('touchmove', e => {
            // Check if any touches are on this button
            let isPressed = false;
            for (let touch of e.touches) {
                if (this.isInside(touch.pageX, touch.pageY)) {
                    isPressed = true;
                    break;
                }
            }
            this.pressed = isPressed;
        }, { passive: false });

        // Mouse events for desktop testing
        addEventListener('mousedown', e => {
            if (this.isInside(e.pageX, e.pageY)) {
                this.pressed = true;
                this.jump();
            }
        });

        addEventListener('mouseup', () => {
            this.pressed = false;
        });
    }

    isInside(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height;
    }

    jump() {
        const gameScene = this.gameScene || window.game?.scene?.getScene('GameScene');
        if (!gameScene || !gameScene.puffy || !gameScene.puffy.sprite) return;

        // Only jump when on ground/platform
        if (gameScene.puffy.sprite.body.touching.down || gameScene.puffy.sprite.body.blocked.down) {
            gameScene.puffy.sprite.body.setVelocityY(-300);
            gameScene.puffy.playAnimation('walk_up');
        }
    }

    draw(context) {
        // Unobtrusive design - subtle colors with slight orange tint for jump
        const fillColor = this.pressed ? 'rgba(255, 180, 100, 0.4)' : 'rgba(255, 180, 100, 0.2)';
        const borderColor = this.pressed ? 'rgba(255, 180, 100, 0.8)' : 'rgba(255, 180, 100, 0.4)';
        
        // Draw button background
        context.fillStyle = fillColor;
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw button border
        context.strokeStyle = borderColor;
        context.lineWidth = 1;
        context.strokeRect(this.x, this.y, this.width, this.height);

        // Draw jump indicator
        context.fillStyle = this.pressed ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        context.fillText('↑', centerX, centerY);
    }

    update(context) {
        this.draw(context);
    }
}

// Main Game Class
class HopHopPuffGame {
    constructor() {
        console.log('🎮 Initializing Hop Hop Puff...');
        this.game = null;
        this.isMobile = 'ontouchstart' in window;
        this.leftButton = null;
        this.rightButton = null;
        this.jumpButton = null;
        this.controlsCanvas = null;
        this.controlsContext = null;
        this.init();
    }
    
    init() {
        console.log('📱 Device detected:', this.isMobile ? 'Mobile' : 'Desktop');
        this.setupPhaserConfig();
        this.createGame();
        
        // Always set up mobile controls on small screens
        if (this.isMobile || window.innerWidth <= 768) {
            console.log('🎮 Setting up mobile controls...');
            // Wait a bit for DOM to be ready
            setTimeout(() => {
                this.setupMobileControls();
            }, 100);
        }
    }
    
    setupPhaserConfig() {
        const baseWidth = 320;
        const baseHeight = 568;
        
        this.config = {
            type: Phaser.AUTO,
            width: baseWidth,
            height: baseHeight,
            parent: 'game-container',
            backgroundColor: '#87CEEB', // Sky blue
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 400 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 320,
                    height: 480
                },
                max: {
                    width: 800,
                    height: 1200
                }
            },
            render: {
                antialias: false,
                pixelArt: true
            },
            scene: [LoadingScene, GameScene]
        };
    }
    
    createGame() {
        console.log('🎮 Creating Phaser game...');
            this.game = new Phaser.Game(this.config);
        window.game = this.game;
        window.hopHopPuffGame = this;
    }
            
    setupMobileControls() {
        console.log('📱 Setting up mobile controls...');
            
        // Find or wait for canvas element
        this.controlsCanvas = document.getElementById('controls-canvas');
        if (!this.controlsCanvas) {
            console.error('❌ Controls canvas not found! Retrying in 500ms...');
            setTimeout(() => {
                this.setupMobileControls();
            }, 500);
            return;
        }

        console.log('✅ Controls canvas found, initializing...');
        this.controlsContext = this.controlsCanvas.getContext('2d');
        this.resizeCanvas();

        // Position buttons INSIDE THE GREEN GROUND AREA (taller ground: 60px)
        // The ground is now 60px tall (from height-60 to height)
        // But we need to map this to screen coordinates, not game coordinates
        const gameContainer = document.getElementById('game-container');
        const gameCanvas = gameContainer ? gameContainer.querySelector('canvas') : null;
        
        // Calculate the actual rendered ground area on screen
        const windowHeight = window.innerHeight;
        const groundHeightPx = 60; // Ground is now 60px tall
        const groundScreenTop = windowHeight - groundHeightPx;
        const groundScreenBottom = windowHeight;
        
        const buttonWidth = 60;
        const buttonHeight = 40; // Increased to fit better in 60px ground area  
        const groundMargin = 10; // Margin from ground edges
        const buttonSpacing = 10;
        
        // Position buttons within the visual ground area on screen
        const leftButtonX = 20;
        const rightButtonX = leftButtonX + buttonWidth + buttonSpacing;
        // Position in the lower part of the ground area for better visibility
        const movementButtonY = groundScreenTop + groundMargin;
        
        // Jump button on the right side, within ground area
        const jumpButtonX = window.innerWidth - 20 - buttonWidth;
        const jumpButtonY = movementButtonY;

        console.log(`⬅️ Creating left button at (${leftButtonX}, ${movementButtonY})`);
        console.log(`➡️ Creating right button at (${rightButtonX}, ${movementButtonY})`);
        console.log(`⬆️ Creating jump button at (${jumpButtonX}, ${jumpButtonY})`);

        this.leftButton = new MovementButton(leftButtonX, movementButtonY, buttonWidth, buttonHeight, 'left', null);
        this.rightButton = new MovementButton(rightButtonX, movementButtonY, buttonWidth, buttonHeight, 'right', null);
        this.jumpButton = new JumpButton(jumpButtonX, jumpButtonY, buttonWidth, buttonHeight, null);

        // Start rendering loop
        this.renderMobileControls();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.repositionControls();
        });
        
        console.log('✅ Mobile controls setup complete!');
    }

    resizeCanvas() {
        this.controlsCanvas.width = window.innerWidth;
        this.controlsCanvas.height = window.innerHeight;
        this.controlsCanvas.style.width = window.innerWidth + 'px';
        this.controlsCanvas.style.height = window.innerHeight + 'px';
    }

    repositionControls() {
        // Reposition buttons INSIDE THE GREEN GROUND AREA (consistent with setupMobileControls)
        const windowHeight = window.innerHeight;
        const groundHeightPx = 60; // Taller ground area
        const groundScreenTop = windowHeight - groundHeightPx;
        
        const buttonWidth = 60;
        const buttonHeight = 40;
        const groundMargin = 10;
        const buttonSpacing = 10;
        
        // Reposition movement buttons within visual ground area
        const leftButtonX = 20;
        const rightButtonX = leftButtonX + buttonWidth + buttonSpacing;
        const movementButtonY = groundScreenTop + groundMargin;
        
        // Reposition jump button within ground area
        const jumpButtonX = window.innerWidth - 20 - buttonWidth;
        const jumpButtonY = movementButtonY;

        if (this.leftButton) {
            this.leftButton.x = leftButtonX;
            this.leftButton.y = movementButtonY;
        }
        if (this.rightButton) {
            this.rightButton.x = rightButtonX;
            this.rightButton.y = movementButtonY;
        }
        if (this.jumpButton) {
            this.jumpButton.x = jumpButtonX;
            this.jumpButton.y = jumpButtonY;
        }
        console.log('📐 Controls repositioned for window resize');
    }

    renderMobileControls() {
        const render = () => {
            if (!this.controlsContext) return;

            // Clear canvas
            this.controlsContext.clearRect(0, 0, this.controlsCanvas.width, this.controlsCanvas.height);

            // Update and draw all three buttons
            if (this.leftButton) {
                this.leftButton.update(this.controlsContext);
            }
            if (this.rightButton) {
                this.rightButton.update(this.controlsContext);
            }
            if (this.jumpButton) {
                this.jumpButton.update(this.controlsContext);
            }

            requestAnimationFrame(render);
        };
        render();
    }
}

// Loading Scene
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }
    
    preload() {
        console.log('📦 Loading Scene: Basic assets + birthday assets...');
        
        // Create loading bar
        const { width, height } = this.cameras.main;
        const loadingText = this.add.text(width * 0.5, height * 0.4, '🐱 Hop Hop Puff', {
            fontSize: '24px',
            color: '#00ffff',
            align: 'center'
        }).setOrigin(0.5);

        const progressBar = this.add.rectangle(width * 0.5, height * 0.6, 200, 20, 0x333333).setOrigin(0.5);
        const progressFill = this.add.rectangle(width * 0.5, height * 0.6, 0, 16, 0x00ffff).setOrigin(0.5);

        // Load birthday assets - Following Phaser.js Framework Priority (Rule 3)
        this.load.image('gift', 'assets/gift.png');
        this.load.image('puffy_winks', 'assets/puffy_winks.png');

        // Note: PuffySprite handles its own loading
        // Basic assets loaded here for birthday feature

        // Update loading progress
        this.load.on('progress', (progress) => {
            progressFill.width = 196 * progress;
        });

        this.load.on('complete', () => {
            console.log('✅ Assets loaded (including birthday assets), starting game...');
            this.scene.start('GameScene');
        });
        
        // Start loading
        this.load.start();
    }
}

// Game Scene (simplified)
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.puffy = null;
        this.ground = null;
        this.block = null;
        this.cursors = null;
        this.isMoving = false;
        this.currentDirection = 'down';
        this.puffyCollisionsSetup = false; // Track collision setup
        this.gift = null; // Birthday gift sprite
        this.overlayScreen = null; // Birthday invitation overlay
        this.invitationShown = false; // Track if invitation has been shown
    }
    
    create() {
        const { width, height } = this.cameras.main;
        console.log(`🎮 Game Scene: Creating simplified game (${width}x${height})`);

        this.setupGameElements(width, height);
        this.setupKeyboardControls();
    }

    setupGameElements(width, height) {
        // Create ground (simple green rectangle) - 50% taller to accommodate mobile controls
        this.ground = this.add.rectangle(width * 0.5, height - 30, width, 60, 0x228B22);
        this.physics.add.existing(this.ground, true); // Static body

        // Create tiered platform structure (4 levels total including original block)
        // Following Phaser.js Framework Priority (Rule 3) - using Phaser physics groups
        this.platforms = this.physics.add.staticGroup();
        
        // Level 1: Original block (lowest tier) - adjusted for taller ground
        this.block1 = this.add.rectangle(width * 0.25, height - 100, 60, 24, 0x8B4513);
        this.block1.setStrokeStyle(2, 0x654321);
        this.physics.add.existing(this.block1, true);
        this.platforms.add(this.block1);

        // Level 2: Right side, higher - adjusted for taller ground
        this.block2 = this.add.rectangle(width * 0.75, height - 140, 60, 24, 0x8B4513);
        this.block2.setStrokeStyle(2, 0x654321);
        this.physics.add.existing(this.block2, true);
        this.platforms.add(this.block2);

        // Level 3: Left side, even higher - adjusted for taller ground
        this.block3 = this.add.rectangle(width * 0.25, height - 180, 60, 24, 0x8B4513);
        this.block3.setStrokeStyle(2, 0x654321);
        this.physics.add.existing(this.block3, true);
        this.platforms.add(this.block3);

        // Level 4: Right side, highest tier - adjusted for taller ground
        this.block4 = this.add.rectangle(width * 0.75, height - 220, 60, 24, 0x8B4513);
        this.block4.setStrokeStyle(2, 0x654321);
        this.physics.add.existing(this.block4, true);
        this.platforms.add(this.block4);

        // Add birthday gift on top platform (Level 4)
        // Make the gift much smaller and align its bottom with the top of the platform
        const giftScale = 0.1;
        const giftImage = this.textures.get('gift').getSourceImage();
        const giftDisplayHeight = giftImage.height * giftScale;
        const block4Top = this.block4.y - 12; // block4 is 24px tall, so top is y-12
        const giftY = block4Top - giftDisplayHeight / 2 + giftDisplayHeight * 0.10; // sink by 10%
        this.gift = this.add.image(width * 0.75, giftY, 'gift');
        this.gift.setScale(giftScale);
        this.physics.add.existing(this.gift, true); // STATIC body
        this.gift.body.setSize(giftDisplayHeight, giftDisplayHeight); // collision box matches display size

        // Create Puffy and set up collision checking
        this.puffy = new PuffySprite(this);
        this.setupPuffyWhenReady(width, height);

        console.log('✅ Game elements created: Puffy, ground, tiered platforms, and birthday gift');
    }

    setupPuffyWhenReady(width, height) {
        // Check for Puffy sprite sheet readiness and create sprite
        const checkPuffyReady = () => {
            if (this.puffy && this.puffy.spriteSheetReady && !this.puffy.sprite) {
                console.log('✅ Puffy sprite sheet is ready! Creating sprite...');
                
                // Create sprite at correct position - adjusted for taller ground
                const targetX = width * 0.3;
                const targetY = height - 80;
                this.puffy.createSprite(targetX, targetY);
                this.puffy.startInitialAnimation();
                
                                // Set up collisions (only once) - Using Phaser.js Framework Priority (Rule 3)
                if (!this.puffyCollisionsSetup) {
                    this.physics.add.collider(this.puffy.sprite, this.ground);
                    this.physics.add.collider(this.puffy.sprite, this.platforms);
                    
                    // Birthday gift collision - triggers invitation overlay
                    this.physics.add.overlap(this.puffy.sprite, this.gift, () => {
                        this.showBirthdayInvitation();
                    });
                    
                    this.puffyCollisionsSetup = true;
                    console.log('✅ Puffy sprite created and collisions set up with platforms and birthday gift');
                }
                
            } else if (!this.puffy || !this.puffy.spriteSheetReady) {
                // Check again in 100ms if not ready yet
                this.time.delayedCall(100, checkPuffyReady);
            }
        };
        
        // Start checking immediately
        checkPuffyReady();
    }

    setupKeyboardControls() {
        this.cursors = this.input.keyboard.addKeys('W,S,A,D');
        console.log('⌨️ Keyboard controls ready (WASD)');
    }

    update() {
        if (!this.puffy || !this.puffy.sprite) return;
        if (!this.puffy.isReady) return; // Block input/physics until Puffy is fully ready
        
        const speed = 120;
        let isMovingHorizontally = false;

        // Check mobile button states
        const hopHopPuffGame = window.hopHopPuffGame;
        const leftPressed = hopHopPuffGame && hopHopPuffGame.leftButton && hopHopPuffGame.leftButton.pressed;
        const rightPressed = hopHopPuffGame && hopHopPuffGame.rightButton && hopHopPuffGame.rightButton.pressed;

        // Handle horizontal movement (keyboard OR mobile buttons)
        if (this.cursors.A.isDown || leftPressed) {
                this.puffy.sprite.body.setVelocityX(-speed);
                this.puffy.playAnimation('walk_left');
            this.currentDirection = 'left';
            isMovingHorizontally = true;
        } else if (this.cursors.D.isDown || rightPressed) {
                this.puffy.sprite.body.setVelocityX(speed);
                this.puffy.playAnimation('walk_right');
            this.currentDirection = 'right';
            isMovingHorizontally = true;
        } else {
        this.puffy.sprite.body.setVelocityX(0);
            if (this.isMoving && !isMovingHorizontally) {
        const lastDirection = this.currentDirection || 'down';
        this.puffy.playAnimation(`idle_${lastDirection}`);
            }
        }

        // Handle jump (W key)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.W)) {
            if (this.puffy.sprite.body.touching.down || this.puffy.sprite.body.blocked.down) {
                this.puffy.sprite.body.setVelocityY(-300);
                this.puffy.playAnimation('walk_up');
            }
        }

        // Handle down movement (S key)
        if (this.cursors.S.isDown) {
            this.puffy.playAnimation('walk_down');
            this.currentDirection = 'down';
        }

        this.isMoving = isMovingHorizontally;
    }

    showBirthdayInvitation() {
        if (this.invitationShown) return;
        this.invitationShown = true;
        this.physics.pause();
        const { width, height } = this.cameras.main;
        // Remove any old overlay
        if (this.overlayScreen) {
            Object.values(this.overlayScreen).forEach(element => {
                if (element && element.destroy) element.destroy();
            });
        }
        // Inject Google Fonts for Playfair Display
        if (!document.getElementById('playfair-font')) {
            const link = document.createElement('link');
            link.id = 'playfair-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap';
            document.head.appendChild(link);
        }
        // Responsive overlay sizing
        const overlayW = Math.min(width * 0.95, 400);
        const overlayH = height < 500 ? 340 : 400;
        // Create a container to hold all overlay elements
        const overlayContainer = this.add.container(width / 2, height / 2).setDepth(100);
        // Overlay background
        const overlayBg = this.add.rectangle(0, 0, overlayW, overlayH, 0x000000, 0.85)
            .setOrigin(0.5).setStrokeStyle(2, 0xffffff);
        overlayContainer.add(overlayBg);
        // Title with improved responsive sizing
        const title = this.add.text(0, 0, "You're invited to Puffy's Birthday", {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: width < 400 ? '18px' : width < 500 ? '22px' : '28px',
            color: '#FFD700',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
            wordWrap: { width: overlayW * 0.9, useAdvancedWrap: true },
            fixedWidth: overlayW * 0.9
        }).setOrigin(0.5, 0);
        overlayContainer.add(title);
        // Details with improved text wrapping
        const detailsText = this.add.text(0, 0, [
            "When: July 3rd 7pm-10pm",
            "Where: Puffy's house",
            "What: Garden dinner + Puffy's favorite movie",
            "",
            "Can't wait to see you there! 🐱💕"
        ], {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: width < 500 ? '13px' : '16px',
            color: '#FFFFFF',
            align: 'center',
            lineSpacing: 8,
            backgroundColor: 'rgba(139, 69, 19, 0.85)',
            padding: { x: 16, y: 18 },
            wordWrap: { width: overlayW * 0.85, useAdvancedWrap: true },
            fixedWidth: overlayW * 0.85
        }).setOrigin(0.5, 0);
        overlayContainer.add(detailsText);
        // Puffy image
        const puffyW = width < 500 ? 90 : 140;
        const puffy = this.add.image(0, 0, 'puffy_winks');
        puffy.setDisplaySize(puffyW, puffyW).setOrigin(0.5, 0);
        overlayContainer.add(puffy);
        // Dynamically space elements vertically
        let y = -overlayH / 2 + 32;
        title.y = y;
        y += title.height + 18;
        detailsText.y = y;
        y += detailsText.height + 18;
        puffy.y = y;
        // Store overlay elements for cleanup (if needed)
        this.overlayScreen = { container: overlayContainer, background: overlayBg, title, details: detailsText, puffy };
        // Overlay remains until refresh
        console.log('✅ Birthday invitation overlay displayed (container, no overlap)');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, starting Hop Hop Puff...');
    
    // Hide loading screen immediately since we're going straight to game
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    window.hopHopPuffGame = new HopHopPuffGame();
});

console.log('✅ Hop Hop Puff main.js loaded successfully!'); 