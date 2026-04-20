/**
 * Puffy Runner — responsive Chrome T-Rex-style endless runner.
 * The canvas fills the entire viewport. Logic is resolution-agnostic:
 * positions are derived from this.scale.width / this.scale.height.
 */

class PuffyRunnerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuffyRunnerScene' });
    }

    preload() {
        // PuffySprite self-loads when instantiated in create().
    }

    create() {
        // --- Tunables ---
        this.GRAVITY = 1500;
        this.JUMP_IMPULSE = -640;
        this.WORLD_SPEED_MIN = 240;
        this.WORLD_SPEED_MAX = 620;
        this.DAY_NIGHT_PERIOD = 2500;
        this.INVULN_MS = 1200;
        this.PUFFY_DISPLAY = 48;       // kept fixed — the hero is the pixel-art focal point
        this.HITBOX_W = 24;            // centered slim hitbox inside the 48×48 sprite
        this.HITBOX_H = 24;
        this.JUMP_BUFFER_MS = 120;     // allow a slightly-early jump press to register on landing
        this.GRACE_MS = 1400;          // no obstacles spawn during this window at game start

        // --- State ---
        this.worldSpeed = 0; // set after computeLayout
        this.distance = 0;
        this.lives = 3;
        this.isInvuln = false;
        this.invulnTimer = 0;
        this.dayNight = 'day';
        this.lastFlipBucket = 0;
        this.gameState = 'playing';
        this.spawnAccumulator = 0;
        this.nextSpawnIn = 1.2;
        this.puffyGrounded = false;
        this.jumpBufferedAt = -1;

        this.highScore = parseInt(localStorage.getItem('puffyRunnerHighScore') || '0', 10);

        // --- Colors ---
        // Background text uses a neutral mid-gray that reads on both day and
        // night backgrounds — we never re-color bg text, only the HUD.
        this.palette = {
            day:   { bg: '#f7f7f7', hud: '#1e1e1e' },
            night: { bg: '#101018', hud: '#dcdcdc' }
        };
        this.BG_TEXT_COLOR = '#6c6c6c';
        this.BG_SOFT_COLOR = '#9a9a9a';
        this.cameras.main.setBackgroundColor(this.palette.day.bg);

        // --- Layout (depends on viewport) ---
        this.computeLayout();
        this.worldSpeed = this.SCALED_WORLD_SPEED_MIN;

        // --- Background text layers ---
        this.bgLayers = { stars: [], mountains: [], hills: [], clouds: [], tufts: [], ground: [] };
        this.buildBackground();

        // --- Optional Wabbazzar ASCII rain (enabled via ?bg=wabbazzar) ---
        //
        // The wabbazzar.com easter egg redirects here with that query param. When
        // set, we async-fetch /ascii-art.json from the same origin, then drift
        // random glyphs from the top of the screen downward behind gameplay.
        //
        // Contract the site side should honour:
        //   GET /ascii-art.json → JSON. Either:
        //     (a) an array of strings, each a multi-line ASCII art blob, OR
        //     (b) { "glyphs": [string, ...] }
        //   CORS: same-origin with wabbazzar.com works; otherwise the response
        //   needs Access-Control-Allow-Origin for the game's host.
        this._wabbazzarGlyphs = null;
        this._wabbazzarRain = [];
        this._wabbazzarSpawnTimer = null;
        try {
            const params = new URLSearchParams(window.location.search);
            if ((params.get('bg') || '').toLowerCase() === 'wabbazzar') {
                this.loadWabbazzarAscii();
            }
        } catch (_) { /* ignore param parsing issues */ }

        // --- Obstacles ---
        this.obstacles = this.physics.add.group();

        // --- Puffy (async sprite-sheet load) ---
        this.puffy = new PuffySprite(this);
        this.puffy._displaySize = this.PUFFY_DISPLAY; // informational only
        this.spriteCheckEvent = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => this.tryCreatePuffy()
        });

        // --- HUD ---
        this.buildHud();

        // --- Input ---
        this.wireInput();

        // --- Resize handling (debounced — mobile URL-bar toggles fire a storm) ---
        this._resizePending = null;
        this._onResizeRaw = (gameSize) => {
            if (this._resizePending) this._resizePending.remove(false);
            this._resizePending = this.time.delayedCall(120, () => {
                this._resizePending = null;
                this.onResize(gameSize);
            });
        };
        this.scale.on('resize', this._onResizeRaw);

        // Clean up scale-manager listener on shutdown/restart — the scale manager
        // is global, so its listeners survive a scene restart unless we remove them.
        // Without this cleanup, every death+restart leaked another listener; after
        // many restarts each resize event triggered N background rebuilds, which
        // manifested as a hitch/freeze even while the main loop kept running.
        this.events.once('shutdown', () => {
            this.scale.off('resize', this._onResizeRaw);
            if (this._resizePending) this._resizePending.remove(false);
        });
        this.events.once('destroy', () => {
            this.scale.off('resize', this._onResizeRaw);
        });
    }

    // ---------- Layout ----------
    computeLayout() {
        const w = this.scale.width;
        const h = this.scale.height;
        // worldScale drives puffy size, ground line spacing, jump strength. We cap
        // the upper bound so obstacles on huge monitors don't become so wide that
        // Puffy lands on top of them mid-pass.
        this.worldScale = Phaser.Math.Clamp(Math.min(w / 900, h / 540), 0.7, 1.4);
        this.PUFFY_SIZE = Math.round(48 * this.worldScale);

        this.GROUND_Y = Math.round(h * 0.82);
        this.PUFFY_X = Math.max(60, Math.round(w * 0.14));
        this.PUFFY_GROUND_Y = this.GROUND_Y - Math.round(this.PUFFY_SIZE / 2);

        // Physics scaled to visual. Speed uses a softer scale factor so the game
        // doesn't become punishingly fast on big monitors.
        const speedScale = Phaser.Math.Clamp(this.worldScale, 0.85, 1.25);
        this.SCALED_GRAVITY = this.GRAVITY * this.worldScale;
        this.SCALED_JUMP = this.JUMP_IMPULSE * this.worldScale;
        this.SCALED_WORLD_SPEED_MIN = this.WORLD_SPEED_MIN * speedScale;
        this.SCALED_WORLD_SPEED_MAX = this.WORLD_SPEED_MAX * speedScale;
        this.SPEED_SCALE = speedScale;

        // Fonts also scale.
        const t = this.worldScale;
        this.fonts = {
            bg:      Math.max(9,  Math.round(12 * t)),
            ground:  Math.max(10, Math.round(14 * t)),
            cactus:  Math.max(14, Math.round(20 * t)),
            bird:    Math.max(11, Math.round(14 * t)),
            hud:     Math.max(13, Math.round(17 * t)),
            over:    Math.max(20, Math.round(28 * t))
        };
    }

    // ---------- Background ----------
    // Uses a tiny number of WIDE text tiles per layer to minimise draw calls
    // and re-render overhead. Each tile's string contains enough content to
    // fill a full viewport width on its own.
    buildBackground() {
        const w = this.scale.width;
        const h = this.scale.height;
        const softColor = this.BG_SOFT_COLOR;
        const textColor = this.BG_TEXT_COLOR;

        const mkStyle = (size, color) => ({
            fontFamily: 'Menlo, Consolas, "Courier New", monospace',
            fontSize: size + 'px',
            color,
            padding: { x: 0, y: 0 }
        });

        const buildLongString = (chunks, targetChars) => {
            let out = '';
            while (out.length < targetChars) {
                out += Phaser.Utils.Array.GetRandom(chunks);
            }
            return out;
        };

        const emPx = this.fonts.bg * 0.6;              // rough monospace em
        const groundEmPx = this.fonts.ground * 0.6;
        const tileChars = Math.max(80, Math.ceil(w / emPx) + 40);
        const groundChars = Math.max(80, Math.ceil(w / groundEmPx) + 40);

        // --- Stars (2 rows × 2 tiles = 4) ---
        const starChunks = ['. ', '* ', '  ', '  ', '  ', '· ', '+ '];
        for (let row = 0; row < 2; row++) {
            const y = Math.round(h * (0.05 + row * 0.07));
            for (let col = 0; col < 2; col++) {
                const line = buildLongString(starChunks, tileChars);
                const t = this.add.text(col * (tileChars * emPx), y, line,
                    mkStyle(this.fonts.bg, softColor));
                t.setAlpha(0);
                this.bgLayers.stars.push(t);
            }
        }

        // --- Mountains (2 tiles, far back) ---
        const mtnChunks = ['/\\', '  ', ' /\\', '/\\/\\', '    ', '  /\\/\\'];
        const mountainY = Math.round(this.GROUND_Y - h * 0.20);
        // Rain glyphs clip to the mountain silhouette line — that's the visual
        // horizon the user reads, not the ground strip 20% further down.
        this.HORIZON_Y = mountainY;
        for (let col = 0; col < 2; col++) {
            const line = buildLongString(mtnChunks, tileChars);
            const t = this.add.text(col * (tileChars * emPx), mountainY, line,
                mkStyle(this.fonts.bg, softColor)).setAlpha(0.55);
            this.bgLayers.mountains.push(t);
        }

        // --- Clouds — sparse scatter, a handful of tiny text objects ---
        const cloudGlyphs = ['(   ~~~   )', '(  ~~  )', '( ~~~~~~ )', '( ~ ~ )'];
        const cloudCount = Math.max(3, Math.min(6, Math.round(w / 260)));
        const cloudBandTop = Math.round(h * 0.09);
        const cloudBandBot = Math.round(h * 0.30);
        for (let i = 0; i < cloudCount; i++) {
            const x = Math.round(i * (w * 1.4 / cloudCount) + Phaser.Math.Between(0, 80));
            const y = Phaser.Math.Between(cloudBandTop, cloudBandBot);
            const glyph = Phaser.Utils.Array.GetRandom(cloudGlyphs);
            const t = this.add.text(x, y, glyph, mkStyle(this.fonts.bg, softColor)).setAlpha(0.65);
            this.bgLayers.clouds.push(t);
        }

        // --- Hills (2 tiles, closer) ---
        const hillChunks = ['_____', '  ___   ', ' _____ ', '___', '    ', '_______'];
        const hillY = Math.round(this.GROUND_Y - h * 0.09);
        for (let col = 0; col < 2; col++) {
            const line = buildLongString(hillChunks, tileChars);
            const t = this.add.text(col * (tileChars * emPx), hillY, line,
                mkStyle(this.fonts.bg, textColor)).setAlpha(0.35);
            this.bgLayers.hills.push(t);
        }

        // --- Tufts (2 tiles, foreground flourish above the ground) ---
        const tuftChunks = [" ", " ", " ", " ", ".", ",", "`", "'", '"'];
        for (let col = 0; col < 2; col++) {
            const line = buildLongString(tuftChunks, groundChars);
            const t = this.add.text(col * (groundChars * groundEmPx),
                this.GROUND_Y - Math.round(this.fonts.ground * 0.4),
                line, mkStyle(this.fonts.ground, textColor)).setAlpha(0.55);
            this.bgLayers.tufts.push(t);
        }

        // --- Ground strip (2 tiles) ---
        const groundChunks = ['.', '_', '_', '_', '.'];
        for (let col = 0; col < 2; col++) {
            const line = buildLongString(groundChunks, groundChars);
            const t = this.add.text(col * (groundChars * groundEmPx), this.GROUND_Y + 4,
                line, mkStyle(this.fonts.ground, textColor));
            this.bgLayers.ground.push(t);
        }
    }

    // ---------- Wabbazzar rain ----------
    loadWabbazzarAscii() {
        // Try same-origin first (the common case: /puffacles/ is served from
        // wabbazzar.com). Fall back to the absolute URL for local testing.
        const candidates = ['/ascii-art.json', 'https://wabbazzar.com/ascii-art.json'];
        const tryNext = (i) => {
            if (i >= candidates.length) return;
            fetch(candidates[i], { cache: 'no-cache' })
                .then(r => r.ok ? r.json() : Promise.reject(r.status))
                .then(data => {
                    const glyphs = Array.isArray(data)
                        ? data
                        : (Array.isArray(data.glyphs) ? data.glyphs : null);
                    if (!glyphs || !glyphs.length) throw new Error('empty glyphs');
                    this._wabbazzarGlyphs = glyphs;
                    this.startWabbazzarRain();
                })
                .catch(() => tryNext(i + 1));
        };
        tryNext(0);
    }

    startWabbazzarRain() {
        if (this._wabbazzarSpawnTimer || !this._wabbazzarGlyphs) return;
        // Spawn one glyph every ~1.5s; each glyph drifts for 8–14s.
        this._wabbazzarSpawnTimer = this.time.addEvent({
            delay: 1400,
            loop: true,
            callback: () => this.spawnWabbazzarGlyph(),
            callbackScope: this
        });
        // Prime with a first glyph immediately so the effect is visible.
        this.spawnWabbazzarGlyph();

        this.events.once('shutdown', () => {
            if (this._wabbazzarSpawnTimer) {
                this._wabbazzarSpawnTimer.remove(false);
                this._wabbazzarSpawnTimer = null;
            }
        });
    }

    // Lazily build / rebuild the horizon clip mask so glyphs that drift
    // below the ground line disappear as they "sink" behind the horizon.
    _ensureRainMask() {
        const horizon = this.HORIZON_Y || this.GROUND_Y;
        if (this._rainMask && this._rainMaskForGroundY === horizon &&
            this._rainMaskForW === this.scale.width) return;
        if (this._rainMaskShape) this._rainMaskShape.destroy();
        const g = this.make.graphics({ add: false });
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, this.scale.width, horizon);
        this._rainMaskShape = g;
        this._rainMask = g.createGeometryMask();
        this._rainMaskForGroundY = horizon;
        this._rainMaskForW = this.scale.width;
        if (this._wabbazzarRain) {
            for (const c of this._wabbazzarRain) {
                if (c && c.setMask) c.setMask(this._rainMask);
            }
        }
    }

    spawnWabbazzarGlyph() {
        if (!this._wabbazzarGlyphs || !this._wabbazzarGlyphs.length) return;

        this._ensureRainMask();

        const glyph = Phaser.Utils.Array.GetRandom(this._wabbazzarGlyphs);
        const fontSize = Math.max(9, Math.round(10 * this.worldScale));

        const text = this.add.text(0, 0, glyph, {
            fontFamily: 'Menlo, Consolas, "Courier New", monospace',
            fontSize: fontSize + 'px',
            color: this.BG_TEXT_COLOR,      // same mid-gray as the rest of the bg
            align: 'left',
            lineSpacing: -1,
            padding: { x: 2, y: 2 }
        }).setOrigin(0.5, 0.5);

        // Rounded-rect "squircle" tile — iOS-style 22.37% of the short side.
        // Padding is at least equal to the corner radius so glyph characters
        // never poke outside the curved area.
        const pad = Math.max(8, Math.round(fontSize * 1.1));
        const tileW = text.width + pad * 2;
        const tileH = text.height + pad * 2;
        const radius = Math.max(6, Math.round(Math.min(tileW, tileH) * 0.2237));

        const bg = this.add.graphics();
        bg.lineStyle(1.5, 0x6c6c6c, 1);
        bg.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, radius);

        const x = Phaser.Math.Between(40, Math.max(60, this.scale.width - 60));
        const startY = -(tileH + 20);
        const container = this.add.container(x, startY, [bg, text])
            .setAlpha(0.75)
            .setDepth(0);
        // Initial tilt — random static rotation the tile carries as it falls.
        const startAngle = Phaser.Math.Between(-18, 18);
        container.setAngle(startAngle);
        container.setMask(this._rainMask);   // clip below the horizon line.

        // Falling tween — drift downward past the horizon.
        const duration = Phaser.Math.Between(9000, 15000);
        const endY = (this.HORIZON_Y || this.GROUND_Y) + tileH;
        const drift = Phaser.Math.Between(-80, 80);

        const fallTween = this.tweens.add({
            targets: container,
            y: endY,
            x: container.x + drift,
            alpha: { from: 0.85, to: 0.45 },
            duration,
            ease: 'Sine.easeIn',
            onComplete: () => {
                const idx = this._wabbazzarRain.indexOf(container);
                if (idx >= 0) this._wabbazzarRain.splice(idx, 1);
                if (swayTween) swayTween.stop();
                container.destroy();
            }
        });

        // Sway tween — gently rocks the tile left/right around its tilt
        // as it falls (mimics the wabbazzar site's floating phones).
        const swayRange = Phaser.Math.Between(4, 10);
        const swayTween = this.tweens.add({
            targets: container,
            angle: { from: startAngle - swayRange, to: startAngle + swayRange },
            duration: Phaser.Math.Between(1800, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        container._fallTween = fallTween;
        container._swayTween = swayTween;
        this._wabbazzarRain.push(container);
    }

    // ---------- Puffy bootstrap ----------
    tryCreatePuffy() {
        if (!this.puffy || !this.puffy.spriteSheetReady || this.puffy.sprite) return;

        this.puffy.createSprite(this.PUFFY_X, this.PUFFY_GROUND_Y);
        const b = this.puffy.body;

        // Size the visual sprite according to worldScale.
        this.puffy.sprite.setDisplaySize(this.PUFFY_SIZE, this.PUFFY_SIZE);
        this.puffyBaseScale = this.puffy.sprite.scaleX;

        // Centered hitbox scaled with worldScale; shorter body → forgiving landings.
        const hbW = Math.round(this.HITBOX_W * this.worldScale);
        const hbH = Math.round(this.HITBOX_H * this.worldScale);
        const offsetX = Math.round((this.puffy.displaySize - hbW) / 2);
        const offsetY = Math.round((this.puffy.displaySize - hbH) / 2);
        b.setSize(hbW, hbH);
        b.setOffset(offsetX, offsetY);
        this._runHitboxW = hbW;
        this._runHitboxH = hbH;

        b.setVelocity(0, 0);
        b.setGravityY(this.SCALED_GRAVITY);
        b.setMaxVelocity(0, 1800 * this.worldScale);
        b.setCollideWorldBounds(false);
        b.setAllowGravity(true);
        this.puffyGrounded = true;

        this.physics.add.overlap(this.puffy.sprite, this.obstacles, this.onHit, null, this);
        this.puffy.playAnimation('walk_right');

        if (this.spriteCheckEvent) {
            this.spriteCheckEvent.remove(false);
            this.spriteCheckEvent = null;
        }
    }

    // ---------- HUD ----------
    buildHud() {
        const c = this.palette[this.dayNight].hud;
        const style = {
            fontFamily: 'Menlo, Consolas, "Courier New", monospace',
            fontSize: this.fonts.hud + 'px',
            color: c
        };
        this.hudDistance = this.add.text(this.scale.width - 10, 8, 'DIST 00000', style).setOrigin(1, 0);
        this.hudHigh = this.add.text(this.scale.width - 10, 8 + this.fonts.hud + 2,
            `HI   ${this.padScore(this.highScore)}`, style).setOrigin(1, 0);
        this.hudLives = this.add.text(10, 8, this.livesString(), style);

        this.gameOverText = this.add.text(
            this.scale.width / 2, this.scale.height * 0.42,
            '', {
                fontFamily: 'Menlo, Consolas, "Courier New", monospace',
                fontSize: this.fonts.over + 'px',
                color: c,
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    refreshHud() {
        // Only invoke setText when the rendered text actually changes — each
        // setText() triggers a full canvas re-render for the text object.
        const distStr = 'DIST ' + this.padScore(Math.floor(this.distance));
        if (distStr !== this._lastDistStr) {
            this.hudDistance.setText(distStr);
            this._lastDistStr = distStr;
        }
        const livesStr = this.livesString();
        if (livesStr !== this._lastLivesStr) {
            this.hudLives.setText(livesStr);
            this._lastLivesStr = livesStr;
        }
    }

    repositionHud() {
        this.hudDistance.setPosition(this.scale.width - 10, 8);
        this.hudHigh.setPosition(this.scale.width - 10, 8 + this.fonts.hud + 2);
        this.hudLives.setPosition(10, 8);
        this.gameOverText.setPosition(this.scale.width / 2, this.scale.height * 0.42);
    }

    // ---------- Input ----------
    wireInput() {
        // Capture keys so browser never scrolls on Space/Arrow keys.
        const KeyCodes = Phaser.Input.Keyboard.KeyCodes;
        const capture = [KeyCodes.SPACE, KeyCodes.UP, KeyCodes.DOWN,
                         KeyCodes.W, KeyCodes.S, KeyCodes.R, KeyCodes.ENTER];
        this.input.keyboard.addCapture(capture);

        this.keyR = this.input.keyboard.addKey(KeyCodes.R);

        const jumpDown = () => this.onJumpPressed();

        this.input.keyboard.on('keydown-SPACE', jumpDown);
        this.input.keyboard.on('keydown-UP', jumpDown);
        this.input.keyboard.on('keydown-W', jumpDown);
        this.input.keyboard.on('keydown-ENTER', jumpDown);

        // Any pointer tap / click = jump.
        this.input.on('pointerdown', () => {
            if (this.gameState === 'gameover') { this.restart(); return; }
            this.onJumpPressed();
        });
    }

    onJumpPressed() {
        if (this.gameState === 'gameover') { this.restart(); return; }
        if (this.gameState !== 'playing') return;
        // Buffer jump: if airborne, remember the press; consume on landing.
        this.jumpBufferedAt = this.time.now;
        if (this.puffyGrounded) this.jump();
    }

    jump() {
        if (!this.puffy || !this.puffy.isFullyReady()) return;
        if (!this.puffyGrounded) return;
        this.puffy.body.setVelocityY(this.SCALED_JUMP);
        this.puffyGrounded = false;
        this.jumpBufferedAt = -1;
        // No visual scale/rotation change — Puffy's size stays locked to baseScale.
    }

    // ---------- Main loop ----------
    update(time, delta) {
        // R restart at any time.
        if (this.gameState === 'gameover') {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) this.restart();
            return;
        }
        if (this.gameState !== 'playing') return;

        const dt = delta / 1000;

        // Distance & speed ramp (scaled with the capped speed scale).
        this.distance += this.worldSpeed * dt * 0.08;
        this.worldSpeed = Math.min(
            this.SCALED_WORLD_SPEED_MAX,
            this.SCALED_WORLD_SPEED_MIN + this.distance * 0.18 * this.SPEED_SCALE
        );

        // Puffy per-frame.
        if (this.puffy && this.puffy.isFullyReady()) {
            this.puffy.sprite.x = this.PUFFY_X;
            this.puffy.body.setVelocityX(0);

            // Ground clamp — only when falling/resting, so it can't kill an upward jump
            // velocity set via a keydown event between frames.
            if (this.puffy.sprite.y >= this.PUFFY_GROUND_Y && this.puffy.body.velocity.y >= 0) {
                this.puffy.sprite.y = this.PUFFY_GROUND_Y;
                this.puffy.body.setVelocityY(0);
                if (!this.puffyGrounded) {
                    this.puffyGrounded = true;
                    // Consume buffered jump.
                    if (this.jumpBufferedAt > 0 &&
                        time - this.jumpBufferedAt < this.JUMP_BUFFER_MS) {
                        this.jumpBufferedAt = -1;
                        this.time.delayedCall(0, () => this.jump());
                    }
                }
            } else {
                this.puffyGrounded = false;
            }

            // Hero stays animated whether grounded or airborne. If the sprite's
            // animation has stopped (Phaser may stop it when we modify the frame
            // directly elsewhere), force-restart the walk cycle from its current
            // frame rather than calling playAnimation() (which early-returns when
            // currentDirection already matches).
            if (!this.puffy.sprite.anims.isPlaying) {
                this.puffy.sprite.anims.play({ key: 'walk_right', repeat: -1 }, true);
            }

            // Invincibility flicker.
            if (this.isInvuln) {
                this.invulnTimer -= delta;
                const on = Math.floor(this.invulnTimer / 70) % 2 === 0;
                this.puffy.sprite.setAlpha(on ? 1 : 0.35);
                if (this.invulnTimer <= 0) {
                    this.isInvuln = false;
                    this.puffy.sprite.setAlpha(1);
                }
            }
        }

        // Scroll parallax layers — stars < mountains < clouds < hills < tufts < ground.
        this.scrollLayer(this.bgLayers.stars,     0.05 * this.worldSpeed * dt);
        this.scrollLayer(this.bgLayers.mountains, 0.18 * this.worldSpeed * dt);
        this.scrollLayer(this.bgLayers.clouds,    0.35 * this.worldSpeed * dt);
        this.scrollLayer(this.bgLayers.hills,     0.55 * this.worldSpeed * dt);
        this.scrollLayer(this.bgLayers.tufts,     0.95 * this.worldSpeed * dt);
        this.scrollLayer(this.bgLayers.ground,    this.worldSpeed * dt);

        // Obstacle scroll & cull.
        this.obstacles.getChildren().forEach((obs) => {
            obs.x -= this.worldSpeed * dt;
            if (obs.passed !== true && obs.x < this.PUFFY_X - 30) {
                obs.passed = true;
            }
            if (obs.x < -80) {
                this._disposeObstacle(obs);
                obs.destroy();
            }
        });

        // Obstacle spawner. Grace period at start; never spawn too close to last obstacle.
        this.spawnAccumulator += dt;
        if (time > this.GRACE_MS && this.spawnAccumulator >= this.nextSpawnIn) {
            // Horizontal gap scales slightly with speed so faster world still feels fair.
            const reactionPx = Math.max(280, this.worldSpeed * 1.05);
            const jitterPx = Phaser.Math.Between(0, 260);
            const minGap = reactionPx + jitterPx;

            // Refuse to spawn if an obstacle already exists to the right of (viewport - minGap).
            const rightmost = this.obstacles.getChildren()
                .reduce((m, o) => Math.max(m, o.x), -Infinity);
            if (rightmost > this.scale.width - minGap) {
                // try again shortly.
                this.nextSpawnIn = 0.15;
                this.spawnAccumulator = 0;
            } else {
                this.spawnAccumulator = 0;
                this.nextSpawnIn = minGap / this.worldSpeed;
                this.spawnObstacle();
            }
        }

        // Day/night flip at intervals.
        const bucket = Math.floor(this.distance / this.DAY_NIGHT_PERIOD);
        if (bucket !== this.lastFlipBucket) {
            this.lastFlipBucket = bucket;
            this.toggleDayNight();
        }

        // HUD.
        this.refreshHud();
    }

    scrollLayer(layer, dx) {
        if (!layer.length) return;
        for (const t of layer) t.x -= dx;
        // Recycle each off-screen-left tile to the right of the rightmost tile in its row.
        let guard = 0;
        while (guard++ < 16) {
            // Find leftmost item fully off-screen left.
            let candidate = null;
            for (const t of layer) {
                if (t.x + t.width < 0) { candidate = t; break; }
            }
            if (!candidate) break;
            // Find rightmost edge in the same y-row.
            let maxRight = -Infinity;
            for (const t of layer) {
                if (Math.abs(t.y - candidate.y) < 2 && (t.x + t.width) > maxRight) {
                    maxRight = t.x + t.width;
                }
            }
            candidate.x = Math.max(maxRight, this.scale.width);
        }
    }

    // ---------- Obstacles ----------
    spawnObstacle() {
        const r = Math.random();
        if (r < 0.68) this.spawnCactus();
        else this.spawnBird();
    }

    spawnCactus() {
        const textColor = this.BG_TEXT_COLOR;
        // Compact 2-line cactus glyph.
        const glyphs = [
            ' Y \n/|\\',
            'Y Y\n\\|/',
            ' \\Y/\n |',
            ' Y \n *|',
            'Y\n|'
        ];
        const glyph = Phaser.Utils.Array.GetRandom(glyphs);
        const style = {
            fontFamily: 'Menlo, Consolas, "Courier New", monospace',
            fontSize: this.fonts.cactus + 'px',
            color: textColor,
            lineSpacing: -2,
            align: 'center'
        };
        const t = this.add.text(this.scale.width + 40, this.GROUND_Y + 2, glyph, style)
            .setOrigin(0.5, 1);
        this.physics.add.existing(t);
        t.body.setAllowGravity(false);
        // Narrow + short body — keeps X-overlap tight so jump timing has generous slack.
        const bw = Math.max(8, Math.round(t.width * 0.28));
        const bh = Math.max(16, Math.round(t.height * 0.55));
        t.body.setSize(bw, bh);
        t.body.setOffset((t.width - bw) / 2, (t.height - bh));
        t.obstacleType = 'cactus';
        this.obstacles.add(t);
    }

    spawnBird() {
        const textColor = this.BG_TEXT_COLOR;
        const style = {
            fontFamily: 'Menlo, Consolas, "Courier New", monospace',
            fontSize: this.fonts.bird + 'px',
            color: textColor,
            align: 'center'
        };
        // Single glyph — we convey "flapping" via a cheap scale/y wiggle tween
        // instead of setText (which forces an expensive texture regen each beat).
        const t = this.add.text(this.scale.width + 40, 0, '>-<', style).setOrigin(0.5, 0.5);

        // All birds sit at jumpable heights — no ducking in this build.
        // Low: skims ground; mid: wing-height; all clear with a timed jump.
        const bucket = Math.random();
        let y;
        if (bucket < 0.5)  y = this.GROUND_Y - this.PUFFY_SIZE * 0.40; // mid  → jump
        else               y = this.GROUND_Y - this.PUFFY_SIZE * 0.18; // low  → jump
        t.y = y;

        this.physics.add.existing(t);
        t.body.setAllowGravity(false);
        const bw = Math.max(10, Math.round(t.width * 0.38));
        const bh = Math.max(6, Math.round(t.height * 0.55));
        t.body.setSize(bw, bh);
        t.body.setOffset((t.width - bw) / 2, (t.height - bh) / 2);
        t.obstacleType = 'bird';
        t.birdHeight = (bucket < 0.5) ? 'mid' : 'low';

        this.obstacles.add(t);
    }

    // ---------- Combat ----------

    _disposeObstacle(obs) {
        if (obs._flapTween) {
            obs._flapTween.stop();
            obs._flapTween.remove();
            obs._flapTween = null;
        }
        if (obs._flapTimer) {
            obs._flapTimer.remove(false);
            obs._flapTimer = null;
        }
    }
    onHit(puffySprite, obstacle) {
        if (this.isInvuln || this.gameState !== 'playing') return;
        this.lives -= 1;
        this.isInvuln = true;
        this.invulnTimer = this.INVULN_MS;
        this._disposeObstacle(obstacle);
        obstacle.destroy();
        this.cameras.main.shake(120, 0.004);

        if (this.lives <= 0) this.gameOver();
    }

    // ---------- Day/night ----------
    // Flipping repaints only 4 HUD text objects (cheap) plus changes camera
    // bg + star alpha. Background ASCII uses neutral mid-gray that reads on
    // both palettes — so we don't iterate/re-style them.
    toggleDayNight() {
        this.dayNight = (this.dayNight === 'day') ? 'night' : 'day';
        const p = this.palette[this.dayNight];
        this.cameras.main.setBackgroundColor(p.bg);
        const starAlpha = this.dayNight === 'night' ? 0.7 : 0;
        for (const s of this.bgLayers.stars) s.setAlpha(starAlpha);
        if (this.hudDistance) this.hudDistance.setColor(p.hud);
        if (this.hudHigh)     this.hudHigh.setColor(p.hud);
        if (this.hudLives)    this.hudLives.setColor(p.hud);
        if (this.gameOverText) this.gameOverText.setColor(p.hud);
    }

    // ---------- Resize ----------
    onResize(gameSize) {
        const w = gameSize.width, h = gameSize.height;
        if (!w || !h) return;
        this.cameras.resize(w, h);
        this.computeLayout();

        // Reposition Puffy if present.
        if (this.puffy && this.puffy.sprite) {
            this.puffy.sprite.x = this.PUFFY_X;
            // If grounded, snap; else keep vertical progress proportional.
            if (this.puffyGrounded) this.puffy.sprite.y = this.PUFFY_GROUND_Y;
        }

        // Rebuild background on resize for correct spacing.
        for (const layer of Object.values(this.bgLayers)) {
            for (const t of layer) t.destroy();
            layer.length = 0;
        }
        this.buildBackground();
        // Re-apply the current day/night star visibility since we just rebuilt them.
        const starAlpha = this.dayNight === 'night' ? 0.7 : 0;
        for (const s of this.bgLayers.stars) s.setAlpha(starAlpha);

        this.repositionHud();
    }

    // ---------- Game over / restart ----------
    gameOver() {
        this.gameState = 'gameover';
        if (this.distance > this.highScore) {
            this.highScore = Math.floor(this.distance);
            localStorage.setItem('puffyRunnerHighScore', String(this.highScore));
            this.hudHigh.setText(`HI   ${this.padScore(this.highScore)}`);
        }
        this.gameOverText.setText('G A M E   O V E R\n\nSPACE / TAP to restart');
        if (this.puffy && this.puffy.sprite) {
            this.puffy.body.setVelocity(0, 0);
            this.puffy.body.setAllowGravity(false);
            this.puffy.sprite.y = this.PUFFY_GROUND_Y;
            this.puffy.sprite.setAlpha(0.5);
        }
        // Kill any active tween on Puffy so he stays put.
        this.tweens.killTweensOf(this.puffy?.sprite);
    }

    restart() {
        // Listener cleanup is handled by the scene 'shutdown' handler above,
        // so scene.restart() triggers a clean teardown + rebuild.
        this.scene.restart();
    }

    // ---------- Debug surface (used by autopilot bot) ----------
    getDebugState() {
        if (!this.puffy || !this.puffy.sprite) return { ready: false };
        const hbW = this._runHitboxW || this.HITBOX_W;
        const hbH = this._runHitboxH || this.HITBOX_H;
        const puffyBox = {
            x: this.puffy.sprite.x - hbW / 2,
            y: this.puffy.sprite.y - hbH / 2,
            w: hbW,
            h: hbH
        };
        const obs = this.obstacles.getChildren()
            .map(o => ({
                type: o.obstacleType,
                birdHeight: o.birdHeight || null,
                x: o.x, y: o.y,
                w: o.body ? o.body.width : o.width,
                h: o.body ? o.body.height : o.height,
                left: o.x - (o.body ? o.body.width : o.width) / 2,
                right: o.x + (o.body ? o.body.width : o.width) / 2,
                top: o.y - (o.body ? o.body.height : o.height) / 2,
                bottom: o.y + (o.body ? o.body.height : o.height) / 2,
                passed: !!o.passed
            }))
            .sort((a, b) => a.x - b.x);
        return {
            ready: true,
            gameState: this.gameState,
            lives: this.lives,
            distance: Math.floor(this.distance),
            worldSpeed: Math.round(this.worldSpeed),
            dayNight: this.dayNight,
            grounded: this.puffyGrounded,
            invuln: this.isInvuln,
            puffy: puffyBox,
            groundY: this.GROUND_Y,
            obstacles: obs,
            viewport: { w: this.scale.width, h: this.scale.height }
        };
    }

    // ---------- Formatting helpers ----------
    padScore(n) { return String(n).padStart(5, '0'); }
    livesString() {
        const hearts = '♥'.repeat(Math.max(0, this.lives));
        const empties = '·'.repeat(Math.max(0, 3 - this.lives));
        return hearts + empties;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuffyRunnerScene;
}
