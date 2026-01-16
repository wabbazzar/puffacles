/**
 * Queen Test Scene
 * Test harness for queen flying mechanics
 */

class QueenTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QueenTestScene' });
        this.queen = null;
        this.cursors = null;
        this.keys = null;
    }

    preload() {
        // Queen sprite will handle its own loading
    }

    create() {
        console.log('QueenTestScene: Creating...');

        // Sky blue background
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Set world bounds (320x180 game resolution)
        this.physics.world.setBounds(0, 0, 320, 180);

        // Create queen sprite
        this.queen = new QueenSprite(this);

        // Wait for sprite sheet to load, then create the sprite
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

        // Setup touch/click input for flap
        this.input.on('pointerdown', () => {
            if (this.queen && this.queen.isFullyReady()) {
                this.queen.flap();
            }
        });

        // Add instructions text
        this.add.text(160, 10, 'WASD/Arrows to move, Space/Click to flap', {
            fontSize: '8px',
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5);

        // Add debug text
        this.debugText = this.add.text(5, 170, '', {
            fontSize: '8px',
            color: '#333333'
        }).setOrigin(0, 1);

        console.log('QueenTestScene: Created');
    }

    checkQueenReady() {
        if (this.queen && this.queen.spriteSheetReady && !this.queen.sprite) {
            // Create sprite at center of screen
            this.queen.createSprite(160, 90);

            // Stop the check loop
            this.time.removeAllEvents();
            console.log('QueenTestScene: Queen sprite created');
        }
    }

    update() {
        if (!this.queen || !this.queen.isFullyReady()) return;

        // Handle horizontal movement
        let horizontalDir = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            horizontalDir = -1;
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
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

        // Update queen (animation state machine)
        this.queen.update();

        // Update debug text
        const pos = this.queen.getPosition();
        const vel = this.queen.getVelocity();
        this.debugText.setText(
            `pos: ${pos.x.toFixed(0)},${pos.y.toFixed(0)} vel: ${vel.x.toFixed(0)},${vel.y.toFixed(0)}`
        );
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueenTestScene;
}
