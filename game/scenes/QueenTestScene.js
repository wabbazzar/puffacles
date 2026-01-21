/**
 * Queen Test Scene
 * Test harness for queen flying mechanics with AI opponent
 * Now includes workers, treats, and dual win conditions
 */

class QueenTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QueenTestScene' });
        this.queen = null;        // Player queen
        this.aiQueen = null;      // AI-controlled queen
        this.aiController = null; // AI controller
        this.cursors = null;
        this.keys = null;

        // Workers
        this.playerWorkers = [];
        this.aiWorkers = [];
        this.workerAIs = [];

        // Treats
        this.treats = [];
        this.treatSpawnTimer = 0;
        this.treatSpawnInterval = 4000; // ms between spawns - balanced pace
        this.maxTreats = 3; // Moderate treats on field

        // Bases
        this.playerBase = null;
        this.aiBase = null;

        // Score (treats collected)
        this.playerScore = 0;
        this.aiScore = 0;
        this.winScore = 6; // First to 6 treats wins (harder for economic victory to balance military)

        // HUD elements
        this.playerLivesText = null;
        this.aiLivesText = null;
        this.playerScoreText = null;
        this.aiScoreText = null;

        // Game state
        this.gameOver = false;
        this.winner = null;
        this.winCondition = null; // 'military' or 'economic'

        // Near-miss tracking
        this.lastNearMissTime = 0;

        // AI vs AI mode
        this.isAIvsAI = false;
        this.playerAIController = null; // AI controller for player queen in AI vs AI mode

        // Mobile controls state
        this.mobileControls = {
            left: false,
            right: false,
            divePressed: false
        };
        this.isMobile = false;
    }

    resetState() {
        // Destroy existing sprites/objects before resetting
        if (this.queen && this.queen.sprite) {
            this.queen.sprite.destroy();
        }
        if (this.aiQueen && this.aiQueen.sprite) {
            this.aiQueen.sprite.destroy();
        }

        // Destroy workers
        for (const worker of this.playerWorkers) {
            if (worker && worker.sprite) worker.sprite.destroy();
        }
        for (const worker of this.aiWorkers) {
            if (worker && worker.sprite) worker.sprite.destroy();
        }

        // Destroy treats
        for (const treat of this.treats) {
            if (treat && treat.sprite) treat.sprite.destroy();
        }

        // Reset references
        this.queen = null;
        this.aiQueen = null;
        this.aiController = null;

        // Reset arrays
        this.playerWorkers = [];
        this.aiWorkers = [];
        this.workerAIs = [];
        this.treats = [];

        // Reset timers
        this.treatSpawnTimer = 0;

        // Reset scores
        this.playerScore = 0;
        this.aiScore = 0;

        // Reset game state
        this.gameOver = false;
        this.winner = null;
        this.winCondition = null;

        // Reset platforms group
        this.platforms = null;

        // Reset mobile controls
        this.mobileControls = {
            left: false,
            right: false,
            divePressed: false
        };

        // Reset AI vs AI state
        this.playerAIController = null;

        console.log('QueenTestScene: State reset');
    }

    preload() {
        // Queen sprite will handle its own loading
    }

    create() {
        console.log('QueenTestScene: Creating...');

        // Reset all state (scene.restart() doesn't call constructor)
        this.resetState();

        // Kitchen background color (warm beige/cream)
        this.cameras.main.setBackgroundColor('#f5e6d3');

        // Set world bounds (320x180 game resolution)
        this.physics.world.setBounds(0, 0, 320, 180);

        // Create kitchen platforms
        this.platforms = this.physics.add.staticGroup();
        this.createKitchenPlatforms();

        // Create player queen sprite
        this.queen = new QueenSprite(this);

        // Wait for sprite sheet to load, then create both sprites
        this.time.addEvent({
            delay: 100,
            callback: this.checkQueenReady,
            callbackScope: this,
            loop: true
        });

        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Detect if mobile/touch device (or force with ?mobile=1 URL param)
        const urlParams = new URLSearchParams(window.location.search);
        this.isMobile = !this.sys.game.device.os.desktop || urlParams.get('mobile') === '1';

        // Check for AI vs AI mode
        this.isAIvsAI = urlParams.get('mode') === 'aivai';
        if (this.isAIvsAI) {
            console.log('QueenTestScene: AI vs AI mode enabled');
        }

        // Setup touch/click input for flap (only for non-control areas, disabled in AI vs AI mode)
        this.input.on('pointerdown', (pointer) => {
            if (this.isAIvsAI) return; // No player input in AI vs AI mode
            if (this.queen && this.queen.isFullyReady()) {
                // On mobile, only flap if not touching control buttons
                if (this.isMobile) {
                    // Control buttons are in bottom corners - flap zone is middle/upper area
                    const isControlArea = pointer.y > 140 && (pointer.x < 80 || pointer.x > 260);
                    if (!isControlArea) {
                        this.queen.flap();
                    }
                } else {
                    this.queen.flap();
                }
            }
        });

        // Create mobile controls if on mobile/touch device
        if (this.isMobile) {
            this.createMobileControls();
        }

        // HUD Layout:
        // Top-left: Player lives + score (stacked)
        // Top-right: AI lives + score (stacked)
        // Bottom-left: Debug position/velocity
        // Bottom-right: AI state

        // Player HUD (top-left)
        this.playerLivesText = this.add.text(5, 5, 'P1: ♥♥♥', {
            fontSize: '10px',
            color: '#ff6600',
            fontStyle: 'bold'
        });

        this.playerScoreText = this.add.text(5, 18, 'Treats: 0/6', {
            fontSize: '8px',
            color: '#ff6600'
        });

        // AI HUD (top-right)
        this.aiLivesText = this.add.text(315, 5, 'AI: ♥♥♥', {
            fontSize: '10px',
            color: '#6699ff',
            fontStyle: 'bold',
            align: 'right'
        }).setOrigin(1, 0);

        this.aiScoreText = this.add.text(315, 18, 'Treats: 0/6', {
            fontSize: '8px',
            color: '#6699ff',
            align: 'right'
        }).setOrigin(1, 0);

        // Debug text (bottom-left)
        this.debugText = this.add.text(5, 175, '', {
            fontSize: '7px',
            color: '#555555'
        }).setOrigin(0, 1);

        // AI state text (bottom-right)
        this.aiStateText = this.add.text(315, 175, '', {
            fontSize: '7px',
            color: '#555555',
            align: 'right'
        }).setOrigin(1, 1);

        // AI vs AI mode indicator (top center)
        if (this.isAIvsAI) {
            this.aiModeText = this.add.text(160, 5, 'AI vs AI MODE', {
                fontSize: '8px',
                color: '#ffff00',
                fontStyle: 'bold',
                backgroundColor: '#333333',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5, 0);
        }

        // Create bases (visual markers)
        this.createBases();

        // Listen for treat deposits
        this.events.on('treatDeposited', this.onTreatDeposited, this);

        console.log('QueenTestScene: Created');
    }

    createBases() {
        // Player base (left side, on ground platform)
        this.playerBase = { x: 40, y: 160 };
        this.add.rectangle(this.playerBase.x, this.playerBase.y, 30, 15, 0xff6600, 0.4)
            .setStrokeStyle(2, 0xff6600);
        this.add.text(this.playerBase.x, this.playerBase.y - 12, 'BASE', {
            fontSize: '6px',
            color: '#ff6600'
        }).setOrigin(0.5);

        // AI base (right side, on ground platform)
        this.aiBase = { x: 280, y: 160 };
        this.add.rectangle(this.aiBase.x, this.aiBase.y, 30, 15, 0x6699ff, 0.4)
            .setStrokeStyle(2, 0x6699ff);
        this.add.text(this.aiBase.x, this.aiBase.y - 12, 'BASE', {
            fontSize: '6px',
            color: '#6699ff'
        }).setOrigin(0.5);
    }

    createMobileControls() {
        const btnAlpha = 0.5;
        const btnSize = 28;
        const padding = 8;

        // Left arrow button (bottom-left)
        const leftBtn = this.add.circle(padding + btnSize/2, 180 - padding - btnSize/2, btnSize/2, 0xff6600, btnAlpha)
            .setStrokeStyle(2, 0xff6600)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);

        // Draw left arrow
        const leftArrow = this.add.triangle(
            padding + btnSize/2, 180 - padding - btnSize/2,
            8, 0, -4, -6, -4, 6,
            0xffffff
        ).setScrollFactor(0).setDepth(101);

        // Right arrow button
        const rightBtn = this.add.circle(padding + btnSize * 1.8, 180 - padding - btnSize/2, btnSize/2, 0xff6600, btnAlpha)
            .setStrokeStyle(2, 0xff6600)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);

        // Draw right arrow
        const rightArrow = this.add.triangle(
            padding + btnSize * 1.8, 180 - padding - btnSize/2,
            -8, 0, 4, -6, 4, 6,
            0xffffff
        ).setScrollFactor(0).setDepth(101);

        // Dive button (bottom-right)
        const diveBtn = this.add.circle(320 - padding - btnSize/2, 180 - padding - btnSize/2, btnSize/2, 0xcc3300, btnAlpha)
            .setStrokeStyle(2, 0xcc3300)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);

        // Draw dive arrow (down)
        const diveArrow = this.add.triangle(
            320 - padding - btnSize/2, 180 - padding - btnSize/2,
            0, 8, -6, -4, 6, -4,
            0xffffff
        ).setScrollFactor(0).setDepth(101);

        // Left button handlers
        leftBtn.on('pointerdown', () => {
            this.mobileControls.left = true;
            leftBtn.setFillStyle(0xff9933, 0.8);
        });
        leftBtn.on('pointerup', () => {
            this.mobileControls.left = false;
            leftBtn.setFillStyle(0xff6600, btnAlpha);
        });
        leftBtn.on('pointerout', () => {
            this.mobileControls.left = false;
            leftBtn.setFillStyle(0xff6600, btnAlpha);
        });

        // Right button handlers
        rightBtn.on('pointerdown', () => {
            this.mobileControls.right = true;
            rightBtn.setFillStyle(0xff9933, 0.8);
        });
        rightBtn.on('pointerup', () => {
            this.mobileControls.right = false;
            rightBtn.setFillStyle(0xff6600, btnAlpha);
        });
        rightBtn.on('pointerout', () => {
            this.mobileControls.right = false;
            rightBtn.setFillStyle(0xff6600, btnAlpha);
        });

        // Dive button handlers
        diveBtn.on('pointerdown', () => {
            this.mobileControls.divePressed = true;
            diveBtn.setFillStyle(0xff5533, 0.8);
            if (this.queen && this.queen.isFullyReady()) {
                this.queen.startDive();
            }
        });
        diveBtn.on('pointerup', () => {
            this.mobileControls.divePressed = false;
            diveBtn.setFillStyle(0xcc3300, btnAlpha);
        });
        diveBtn.on('pointerout', () => {
            this.mobileControls.divePressed = false;
            diveBtn.setFillStyle(0xcc3300, btnAlpha);
        });

        console.log('Mobile controls created');
    }

    createKitchenPlatforms() {
        // Kitchen platform layout:
        // - Ground floor (full width) at bottom
        // - Countertops at mid-height on sides
        // - Floating shelf in middle-top area
        // - Small platforms for vertical variety

        // Ground floor (dark wood counter)
        this.createPlatform(160, 175, 320, 10, 0x5d4037, 'ground');

        // Left counter (kitchen counter - tan)
        this.createPlatform(50, 130, 80, 8, 0xd7ccc8, 'counter');

        // Right counter (kitchen counter - tan)
        this.createPlatform(270, 130, 80, 8, 0xd7ccc8, 'counter');

        // Middle floating shelf (wooden)
        this.createPlatform(160, 95, 60, 6, 0x8d6e63, 'shelf');

        // Upper left small platform (spice rack)
        this.createPlatform(70, 60, 40, 5, 0xa1887f, 'shelf');

        // Upper right small platform (spice rack)
        this.createPlatform(250, 60, 40, 5, 0xa1887f, 'shelf');

        console.log('Kitchen platforms created');
    }

    createPlatform(x, y, width, height, color, type = 'platform') {
        // Create visual rectangle
        const platformRect = this.add.rectangle(x, y, width, height, color);

        // Add a subtle border for depth
        platformRect.setStrokeStyle(1, Phaser.Display.Color.ValueToColor(color).darken(30).color);

        // Add highlight on top edge for 3D effect
        const highlight = this.add.rectangle(x, y - height/2 + 1, width - 2, 2,
            Phaser.Display.Color.ValueToColor(color).lighten(20).color);

        // Create physics body (invisible, just for collision)
        const platformBody = this.add.rectangle(x, y, width, height);
        this.physics.add.existing(platformBody, true); // true = static body
        this.platforms.add(platformBody);

        // Make non-ground platforms one-way (can jump through from below)
        // Only collide from above, not from below/sides
        if (type !== 'ground') {
            platformBody.body.checkCollision.down = false;
            platformBody.body.checkCollision.left = false;
            platformBody.body.checkCollision.right = false;
        }

        // Store reference for later
        platformBody.platformType = type;
        platformBody.visualRect = platformRect;

        return platformBody;
    }

    checkQueenReady() {
        if (this.queen && this.queen.spriteSheetReady && !this.queen.sprite) {
            // Create player sprite on left side
            this.queen.createSprite(80, 90);

            // Add collision between player queen and platforms
            if (this.queen.sprite && this.platforms) {
                this.physics.add.collider(this.queen.sprite, this.platforms);
            }

            // Create AI queen on right side (reuse loaded sprite sheet)
            this.createAIQueen();

            // Stop the check loop
            this.time.removeAllEvents();
            console.log('QueenTestScene: Both queens created');
        }
    }

    createAIQueen() {
        // Create AI queen sprite manually (sprite sheet already loaded)
        this.aiQueen = new QueenSprite(this);

        // Wait a frame for AI queen to be ready
        this.time.delayedCall(200, () => {
            if (this.aiQueen.spriteSheetReady) {
                this.aiQueen.createSprite(240, 90);

                // Tint AI queen blue to distinguish from player
                if (this.aiQueen.sprite) {
                    this.aiQueen.sprite.setTint(0x6699ff);
                }

                // Make AI queen slightly slower (83% of player speed = ~100 px/sec)
                this.aiQueen.setSpeedMultiplier(0.83);

                // Add collision between AI queen and platforms
                if (this.aiQueen.sprite && this.platforms) {
                    this.physics.add.collider(this.aiQueen.sprite, this.platforms);
                }

                // Create AI controller for the AI queen
                this.aiController = new AIQueenController(this, this.aiQueen);
                this.aiController.setTarget(this.queen);

                // In AI vs AI mode, create AI controller for player queen too
                if (this.isAIvsAI) {
                    this.playerAIController = new AIQueenController(this, this.queen);
                    this.playerAIController.setTarget(this.aiQueen);
                    console.log('QueenTestScene: Player AI Controller initialized (AI vs AI mode)');
                }

                console.log('QueenTestScene: AI Queen initialized');

                // Now create workers
                this.createWorkers();
            }
        });
    }

    createWorkers() {
        // Wait for worker sprite sheet to load
        const playerWorker = new WorkerSprite(this, 'player');
        const aiWorker = new WorkerSprite(this, 'ai');

        this.time.delayedCall(500, () => {
            // Create player worker at player base
            if (playerWorker.spriteSheetReady) {
                playerWorker.createSprite(this.playerBase.x, this.playerBase.y - 15);
                this.playerWorkers.push(playerWorker);

                // Add collision between worker and platforms
                if (playerWorker.sprite && this.platforms) {
                    this.physics.add.collider(playerWorker.sprite, this.platforms);
                }

                const playerWorkerAI = new WorkerAI(this, playerWorker, this.playerBase);
                this.workerAIs.push(playerWorkerAI);
            }

            // Create AI worker at AI base
            if (aiWorker.spriteSheetReady) {
                aiWorker.createSprite(this.aiBase.x, this.aiBase.y - 15);
                this.aiWorkers.push(aiWorker);

                // Add collision between worker and platforms
                if (aiWorker.sprite && this.platforms) {
                    this.physics.add.collider(aiWorker.sprite, this.platforms);
                }

                const aiWorkerAI = new WorkerAI(this, aiWorker, this.aiBase);
                this.workerAIs.push(aiWorkerAI);
            }

            // Tell AI queen about player workers so it can hunt them
            if (this.aiController) {
                this.aiController.setTargetWorkers(this.playerWorkers);
            }

            // In AI vs AI mode, tell player AI about AI workers so it can hunt them
            if (this.playerAIController) {
                this.playerAIController.setTargetWorkers(this.aiWorkers);
            }

            console.log('QueenTestScene: Workers initialized');

            // Expose workers to window for debugging
            window.workerP1 = playerWorker;
            window.workerAI = aiWorker;
            window.game = this.game;
            window.scene = this;
        });
    }

    spawnTreat() {
        if (this.treats.length >= this.maxTreats) return;

        // Spawn treats in areas that will land on ground (avoiding platform centers)
        // Ground spans full width, platforms are at:
        // - Left counter: x 10-90
        // - Right counter: x 230-310
        // - Middle shelf: x 130-190
        // Good ground zones: 95-125, 195-225 (clear paths to ground)
        const zones = [
            { min: 95, max: 125 },   // Between left counter and middle
            { min: 195, max: 225 }   // Between middle and right counter
        ];
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const x = zone.min + Math.random() * (zone.max - zone.min);
        const y = 20 + Math.random() * 30;  // 20-50 (spawn high, fall down)

        // Random treat type for visual variety
        const treatTypes = ['fish', 'chicken', 'kibble'];
        const treatType = treatTypes[Math.floor(Math.random() * treatTypes.length)];

        // Create a container for the treat graphics
        const treatContainer = this.add.container(x, y);

        // Draw different treat types
        const graphics = this.add.graphics();
        this.createTreatGraphics(graphics, treatType);
        treatContainer.add(graphics);

        // Add physics to the container
        this.physics.add.existing(treatContainer);
        treatContainer.body.setSize(12, 10);
        treatContainer.body.setOffset(-6, -5);
        treatContainer.body.setGravityY(30);
        treatContainer.body.setBounce(0.2);
        treatContainer.body.setCollideWorldBounds(true);

        // Add collision with platforms
        if (this.platforms) {
            this.physics.add.collider(treatContainer, this.platforms);
        }

        // Add bobbing animation when treat lands
        this.tweens.add({
            targets: treatContainer,
            y: treatContainer.y - 2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            paused: true
        });

        const treat = {
            sprite: treatContainer,
            type: treatType,
            claimedBy: null
        };

        this.treats.push(treat);
        console.log(`${treatType} treat spawned at (${x.toFixed(0)}, ${y.toFixed(0)}) - falling!`);
    }

    createTreatGraphics(graphics, type) {
        switch (type) {
            case 'fish':
                // Cute pixel fish treat
                graphics.fillStyle(0xff9966); // Salmon color
                graphics.fillEllipse(0, 0, 10, 6); // Body
                graphics.fillTriangle(5, 0, 8, -3, 8, 3); // Tail
                graphics.fillStyle(0xffcc99); // Lighter belly
                graphics.fillEllipse(-1, 1, 6, 3);
                graphics.fillStyle(0x000000);
                graphics.fillCircle(-3, -1, 1); // Eye
                break;

            case 'chicken':
                // Chicken drumstick
                graphics.fillStyle(0xcc8844); // Cooked brown
                graphics.fillEllipse(0, 0, 8, 6); // Meat part
                graphics.fillStyle(0xffeedd); // Bone color
                graphics.fillRect(4, -1, 4, 2); // Bone
                graphics.fillCircle(7, 0, 2); // Bone end
                graphics.fillStyle(0xddaa66); // Highlight
                graphics.fillEllipse(-1, -1, 4, 2);
                break;

            case 'kibble':
                // Cat kibble (small star/cross shape)
                graphics.fillStyle(0x996633); // Brown kibble
                graphics.fillCircle(0, 0, 4);
                graphics.fillStyle(0xbb8844); // Lighter center
                graphics.fillCircle(0, 0, 2);
                // Add sparkle
                graphics.fillStyle(0xffffcc);
                graphics.fillCircle(-1, -1, 1);
                break;
        }
    }

    onTreatDeposited(data) {
        const { teamId, treat } = data;

        // Remove treat from array
        const index = this.treats.indexOf(treat);
        if (index > -1) {
            this.treats.splice(index, 1);
        }

        // Update score
        if (teamId === 'player') {
            this.playerScore++;
        } else {
            this.aiScore++;
        }

        console.log(`Treat deposited by ${teamId}. Score: P${this.playerScore} - AI${this.aiScore}`);

        // Check for economic victory
        if (this.playerScore >= this.winScore) {
            this.endGame('Player', 'economic');
        } else if (this.aiScore >= this.winScore) {
            this.endGame('AI', 'economic');
        }
    }

    update(time, delta) {
        if (!this.queen || !this.queen.isFullyReady()) return;

        // Skip updates if game is over
        if (this.gameOver) return;

        // Handle player input (only in normal mode, not AI vs AI)
        if (!this.isAIvsAI) {
            // Handle horizontal movement (keyboard + mobile)
            let horizontalDir = 0;

            if (this.cursors.left.isDown || this.keys.A.isDown || this.mobileControls.left) {
                horizontalDir = -1;
            } else if (this.cursors.right.isDown || this.keys.D.isDown || this.mobileControls.right) {
                horizontalDir = 1;
            }

            if (horizontalDir !== 0) {
                this.queen.moveHorizontal(horizontalDir);
            } else {
                this.queen.stopHorizontal();
            }

            // Handle flap input (W, Up, Space)
            if (Phaser.Input.Keyboard.JustDown(this.keys.W) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                this.queen.flap();
            }

            // Handle dive input (S, Down)
            if (Phaser.Input.Keyboard.JustDown(this.keys.S) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.queen.startDive();
            }
        }

        // Update player queen (animation state machine)
        this.queen.update(delta);

        // Update AI queen
        if (this.aiQueen && this.aiQueen.isFullyReady()) {
            this.aiQueen.update(delta);
        }

        // Update player AI controller (AI vs AI mode)
        if (this.playerAIController) {
            this.playerAIController.update(time, delta);
        }

        // Update AI controller
        if (this.aiController) {
            this.aiController.update(time, delta);
        }

        // Update worker AIs
        for (const workerAI of this.workerAIs) {
            workerAI.update(time, delta, this.treats);
        }

        // Spawn treats periodically
        this.treatSpawnTimer += delta;
        if (this.treatSpawnTimer >= this.treatSpawnInterval) {
            this.spawnTreat();
            this.treatSpawnTimer = 0;
        }

        // Check for combat collision
        this.checkCombatCollision();

        // Update HUD
        this.updateHUD();

        // Update debug text (player)
        const pos = this.queen.getPosition();
        const vel = this.queen.getVelocity();
        this.debugText.setText(
            `pos: ${pos.x.toFixed(0)},${pos.y.toFixed(0)} vel: ${vel.x.toFixed(0)},${vel.y.toFixed(0)}`
        );

        // Update AI state text
        if (this.aiController) {
            this.aiStateText.setText(`AI: ${this.aiController.getState()}`);
        }
    }

    updateHUD() {
        // Update lives display
        if (this.queen && this.playerLivesText) {
            const lives = this.queen.getLives();
            const hearts = '♥'.repeat(Math.max(0, lives));
            const empty = '♡'.repeat(Math.max(0, 3 - lives));
            this.playerLivesText.setText(`P1: ${hearts}${empty}`);
        }

        if (this.aiQueen && this.aiLivesText) {
            const lives = this.aiQueen.getLives();
            const hearts = '♥'.repeat(Math.max(0, lives));
            const empty = '♡'.repeat(Math.max(0, 3 - lives));
            this.aiLivesText.setText(`AI: ${hearts}${empty}`);
        }

        // Update score display
        if (this.playerScoreText) {
            this.playerScoreText.setText(`Treats: ${this.playerScore}/${this.winScore}`);
        }
        if (this.aiScoreText) {
            this.aiScoreText.setText(`Treats: ${this.aiScore}/${this.winScore}`);
        }
    }

    checkCombatCollision() {
        if (!this.queen || !this.queen.isFullyReady()) return;
        if (!this.aiQueen || !this.aiQueen.isFullyReady()) return;

        // Get sprite positions and bounds
        const playerSprite = this.queen.sprite;
        const aiSprite = this.aiQueen.sprite;
        const playerBounds = playerSprite.getBounds();
        const aiBounds = aiSprite.getBounds();

        // Check if sprites are overlapping
        const overlap = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, aiBounds);

        if (!overlap) return;

        // Calculate overlap depth for tighter collision detection
        const overlapX = Math.min(playerBounds.right, aiBounds.right) - Math.max(playerBounds.left, aiBounds.left);
        const overlapY = Math.min(playerBounds.bottom, aiBounds.bottom) - Math.max(playerBounds.top, aiBounds.top);
        const overlapArea = overlapX * overlapY;
        const minOverlapForHit = 150; // Require significant overlap (roughly 40% of hitbox)

        // Determine dive states
        const playerDiving = this.queen.getIsDiving();
        const aiDiving = this.aiQueen.getIsDiving();

        // Combat hit requires significant overlap
        if (overlapArea >= minOverlapForHit) {
            // Get positions for height check
            const playerPos = this.queen.getPosition();
            const aiPos = this.aiQueen.getPosition();

            if (playerDiving && !aiDiving && !this.aiQueen.getIsInvincible()) {
                // Check if player is above AI (attacker must be higher = lower Y value)
                const playerAbove = playerPos.y < aiPos.y - 10; // Reduced from 20 to 10 for easier attacks
                if (playerAbove) {
                    // Player kills AI
                    console.log('Combat: Player above AI, attack successful');
                    this.onQueenHit(this.aiQueen, this.queen);
                } else {
                    // Attack failed - attacker not above target, mutual knockback
                    console.log('Combat: Attack failed - player not above AI target');
                    this.applyMutualKnockback(this.queen, this.aiQueen, 100);
                    this.queen.endDive();
                }
                return;
            } else if (aiDiving && !playerDiving && !this.queen.getIsInvincible()) {
                // Check if AI is above player (attacker must be higher = lower Y value)
                const aiAbove = aiPos.y < playerPos.y - 10; // Reduced from 20 to 10 for easier attacks
                if (aiAbove) {
                    // AI kills player
                    console.log('Combat: AI above player, attack successful');
                    this.onQueenHit(this.queen, this.aiQueen);
                } else {
                    // Attack failed - attacker not above target, mutual knockback
                    console.log('Combat: Attack failed - AI not above player target');
                    this.applyMutualKnockback(this.queen, this.aiQueen, 100);
                    this.aiQueen.endDive();
                }
                return;
            } else if (playerDiving && aiDiving) {
                // Both diving - mutual knockback, no damage
                this.applyMutualKnockback(this.queen, this.aiQueen, 150);
                this.queen.endDive();
                this.aiQueen.endDive();
                this.cameras.main.shake(80, 0.008);
                return;
            }
        } else if (overlapArea > 0 && (playerDiving || aiDiving)) {
            // Near-miss: overlap exists but not enough for hit
            // Only trigger once per near-miss (use cooldown)
            const now = this.time.now;
            if (!this.lastNearMissTime || now - this.lastNearMissTime > 300) {
                this.onNearMiss(playerDiving ? this.queen : this.aiQueen);
                this.lastNearMissTime = now;
            }
        }

        // Non-dive collision: apply knockback bump (queens feel solid)
        if (!playerDiving && !aiDiving) {
            this.applyMutualKnockback(this.queen, this.aiQueen, 80);
        }

        // Also check queen vs worker combat
        this.checkQueenVsWorkerCombat();
    }

    /**
     * Apply knockback to both queens pushing them apart
     */
    applyMutualKnockback(queen1, queen2, force) {
        const pos1 = queen1.getPosition();
        const pos2 = queen2.getPosition();

        // Calculate direction from queen1 to queen2
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normalize and apply knockback
        const nx = dx / dist;
        const ny = dy / dist;

        // Push queens apart
        if (queen1.body && queen2.body) {
            queen1.body.setVelocity(
                queen1.body.velocity.x - nx * force,
                queen1.body.velocity.y - ny * force * 0.5
            );
            queen2.body.setVelocity(
                queen2.body.velocity.x + nx * force,
                queen2.body.velocity.y + ny * force * 0.5
            );
        }
    }

    checkQueenVsWorkerCombat() {
        // Player queen (diving) vs AI workers
        if (this.queen && this.queen.isFullyReady() && this.queen.getIsDiving()) {
            const queenPos = this.queen.getPosition();
            for (const worker of this.aiWorkers) {
                if (!worker.isFullyReady() || worker.getIsDead() || worker.getIsInvincible()) continue;

                const workerPos = worker.getPosition();
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.queen.sprite.getBounds(),
                    worker.sprite.getBounds()
                );

                if (overlap) {
                    // Check if queen is above worker (attacker must be higher = lower Y value)
                    const queenAbove = queenPos.y < workerPos.y - 10; // Smaller tolerance for workers
                    console.log(`Queen vs Worker: queen.y=${queenPos.y.toFixed(0)}, worker.y=${workerPos.y.toFixed(0)}, above=${queenAbove}`);

                    if (queenAbove) {
                        this.onWorkerKilled(worker, this.queen);
                        break; // Only kill one worker per frame
                    } else {
                        // Attack failed - queen not above worker
                        console.log('Combat: Attack failed - queen not above worker');
                    }
                }
            }
        }

        // AI queen (diving) vs player workers
        if (this.aiQueen && this.aiQueen.isFullyReady() && this.aiQueen.getIsDiving()) {
            const queenPos = this.aiQueen.getPosition();
            for (const worker of this.playerWorkers) {
                if (!worker.isFullyReady() || worker.getIsDead() || worker.getIsInvincible()) continue;

                const workerPos = worker.getPosition();
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.aiQueen.sprite.getBounds(),
                    worker.sprite.getBounds()
                );

                if (overlap) {
                    // Check if queen is above worker
                    const queenAbove = queenPos.y < workerPos.y - 10;
                    console.log(`AI Queen vs Worker: queen.y=${queenPos.y.toFixed(0)}, worker.y=${workerPos.y.toFixed(0)}, above=${queenAbove}`);

                    if (queenAbove) {
                        this.onWorkerKilled(worker, this.aiQueen);
                        break;
                    } else {
                        console.log('Combat: Attack failed - AI queen not above worker');
                    }
                }
            }
        }
    }

    onWorkerKilled(worker, attacker) {
        console.log(`Worker killed by ${attacker === this.queen ? 'Player' : 'AI'} queen!`);

        // Get position for particles before death
        const pos = worker.getPosition();

        // Create smaller hit particles for worker
        this.createHitParticles(pos.x, pos.y);

        // Kill the worker and get any dropped treat
        const droppedTreat = worker.die();

        // Drop treat at worker's position if they were carrying
        if (droppedTreat && droppedTreat.sprite) {
            droppedTreat.sprite.setPosition(pos.x, pos.y);
            droppedTreat.claimedBy = null; // Make treat available again
        }

        // Brief freeze-frame (shorter than queen hit)
        this.physics.world.pause();
        this.time.delayedCall(30, () => {
            this.physics.world.resume();
        });

        // Screen shake (smaller than queen hit)
        this.cameras.main.shake(60, 0.008);

        // End attacker's dive
        attacker.endDive();

        // Respawn worker at their base after 3 second delay
        const isPlayerWorker = worker.getTeamId() === 'player';
        const base = isPlayerWorker ? this.playerBase : this.aiBase;
        const respawnDelay = 3000; // 3 seconds

        // Show ghost/respawn indicator at base
        const ghostColor = isPlayerWorker ? 0xff6600 : 0x6699ff;
        const ghostIndicator = this.add.circle(base.x, base.y - 10, 12, ghostColor, 0.3);

        // Pulse animation for respawn indicator
        this.tweens.add({
            targets: ghostIndicator,
            alpha: { from: 0.3, to: 0.7 },
            scale: { from: 0.8, to: 1.2 },
            duration: 500,
            yoyo: true,
            repeat: 2, // Pulse 3 times during 3 second wait
            onComplete: () => {
                ghostIndicator.destroy();
            }
        });

        this.time.delayedCall(respawnDelay, () => {
            worker.respawn(base.x, base.y);
        });
    }

    onQueenHit(victim, attacker) {
        console.log('HIT! Queen hit by dive attack!');

        // Take damage - returns true if queen is defeated
        const defeated = victim.takeDamage();

        // Get hit position for particles
        const hitPos = victim.getPosition();

        // Create hit particles burst
        this.createHitParticles(hitPos.x, hitPos.y);

        // Brief freeze-frame effect (pause physics for 50ms)
        this.physics.world.pause();
        this.time.delayedCall(50, () => {
            this.physics.world.resume();
        });

        // Flash the victim red with stronger effect
        if (victim.sprite) {
            victim.sprite.setTint(0xff0000);
            // Flash white then red for impact
            this.time.delayedCall(50, () => {
                victim.sprite.setTint(0xffffff);
            });
            this.time.delayedCall(100, () => {
                victim.sprite.setTint(0xff0000);
            });
            this.time.delayedCall(250, () => {
                // Reset tint (keep AI blue)
                if (victim === this.aiQueen) {
                    victim.sprite.setTint(0x6699ff);
                } else {
                    victim.sprite.clearTint();
                }
            });
        }

        // Stronger screen shake for queen hits
        this.cameras.main.shake(120, 0.015);

        // End attacker's dive
        attacker.endDive();

        // Check for game over (military victory)
        if (defeated) {
            this.endGame(attacker === this.queen ? 'Player' : 'AI', 'military');
            return;
        }

        // Respawn victim at their home base
        this.respawnQueen(victim);
    }

    /**
     * Near-miss feedback - subtle visual cue when dive barely misses
     */
    onNearMiss(attacker) {
        const pos = attacker.getPosition();

        // Small screen shake to indicate "close!"
        this.cameras.main.shake(30, 0.003);

        // Create whoosh lines behind the attacker
        this.createWhooshLines(pos.x, pos.y, attacker.sprite.flipX ? 1 : -1);

        console.log('Near miss!');
    }

    /**
     * Create whoosh/speed lines for near-miss feedback
     */
    createWhooshLines(x, y, direction) {
        const lineCount = 3;
        const baseColor = 0xcccccc; // Light gray whoosh lines

        for (let i = 0; i < lineCount; i++) {
            const offsetY = (i - 1) * 6; // Spread lines vertically
            const startX = x + direction * 8;
            const startY = y + offsetY;

            // Create a small line
            const line = this.add.line(
                0, 0,
                startX, startY,
                startX + direction * (12 + Math.random() * 8), startY,
                baseColor, 0.6
            );
            line.setLineWidth(1);

            // Fade out quickly
            this.tweens.add({
                targets: line,
                alpha: 0,
                duration: 150,
                ease: 'Power2',
                onComplete: () => {
                    line.destroy();
                }
            });
        }
    }

    /**
     * Create burst of hit particles at position
     */
    createHitParticles(x, y) {
        const particleCount = 8;
        const colors = [0xffff00, 0xff6600, 0xffffff, 0xff0000]; // Yellow, orange, white, red

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 3;

            const particle = this.add.circle(x, y, size, color);

            // Animate particle outward
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.2,
                duration: 300 + Math.random() * 200,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    respawnQueen(queen) {
        // Determine spawn position based on which queen
        const isPlayer = queen === this.queen;
        const spawnX = isPlayer ? 80 : 240;
        const spawnY = 90;

        // Move queen to spawn position
        if (queen.sprite && queen.body) {
            queen.sprite.setPosition(spawnX, spawnY);
            queen.body.setVelocity(0, 0);
            queen.endDive(); // Make sure dive state is reset
        }

        console.log(`Queen respawned at (${spawnX}, ${spawnY})`);
    }

    endGame(winner, condition = 'military') {
        this.gameOver = true;
        this.winner = winner;
        this.winCondition = condition;

        const conditionText = condition === 'military' ? 'MILITARY VICTORY' : 'ECONOMIC VICTORY';
        console.log(`GAME OVER! ${winner} WINS by ${conditionText}!`);

        // Record stats
        if (typeof StatsManager !== 'undefined') {
            StatsManager.recordWin(winner, condition, this.isAIvsAI);
        }

        // Stop both queens
        if (this.queen && this.queen.body) {
            this.queen.body.setVelocity(0, 0);
        }
        if (this.aiQueen && this.aiQueen.body) {
            this.aiQueen.body.setVelocity(0, 0);
        }

        // Show win screen
        const conditionLabel = this.winCondition === 'military' ? 'MILITARY' : 'ECONOMIC';
        const winText = this.add.text(160, 50, `${winner} WINS!`, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        const victoryTypeText = this.add.text(160, 75, conditionLabel + ' VICTORY', {
            fontSize: '10px',
            color: '#ffdd00',
            backgroundColor: '#333333',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);

        // Show stats
        let statsText = 'Games: 0 | Military: --% | Economic: --%';
        if (typeof StatsManager !== 'undefined') {
            statsText = StatsManager.getStatsDisplay(this.isAIvsAI);
        }
        const statsDisplay = this.add.text(160, 95, statsText, {
            fontSize: '8px',
            color: '#aaaaaa',
            backgroundColor: '#222222',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);

        // In AI vs AI mode, auto-restart with countdown
        if (this.isAIvsAI) {
            let countdown = 3;
            const countdownText = this.add.text(160, 115, `Restarting in ${countdown}...`, {
                fontSize: '10px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 5, y: 3 }
            }).setOrigin(0.5);

            const countdownTimer = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    countdown--;
                    if (countdown > 0) {
                        countdownText.setText(`Restarting in ${countdown}...`);
                    } else {
                        this.scene.restart();
                    }
                },
                repeat: 2
            });
        } else {
            const restartText = this.add.text(160, 115, 'Click to restart', {
                fontSize: '10px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 5, y: 3 }
            }).setOrigin(0.5);

            // Click to restart (only in non-AI vs AI mode)
            this.input.once('pointerdown', () => {
                this.scene.restart();
            });
        }

        // Reset stats button (small, bottom corner)
        const resetBtn = this.add.text(160, 140, '[Reset Stats]', {
            fontSize: '7px',
            color: '#666666'
        }).setOrigin(0.5).setInteractive();

        resetBtn.on('pointerover', () => resetBtn.setColor('#ffffff'));
        resetBtn.on('pointerout', () => resetBtn.setColor('#666666'));
        resetBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation(); // Prevent restart trigger
            if (typeof StatsManager !== 'undefined') {
                StatsManager.resetStats(this.isAIvsAI);
                statsDisplay.setText(StatsManager.getStatsDisplay(this.isAIvsAI));
            }
        });
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueenTestScene;
}
