/**
 * Autopilot survival bot for Puffy Runner.
 *
 * Connects to a running game at http://localhost:8000/puffy-runner.html via the
 * dev-browser server, polls scene state at ~60Hz, and issues keydown/keyup events
 * to jump or duck around obstacles. Target: survive >=60s without dying.
 *
 * Usage (run from skills/dev-browser dir so @/ alias resolves):
 *   cd /home/wabbazzar/.claude/plugins/cache/dev-browser-marketplace/dev-browser/66682fb0513a/skills/dev-browser
 *   npx tsx /home/wabbazzar/code/puffacles/tools/puffy_bot.ts
 */

import { connect, waitForPageLoad } from "@/client.js";

type ObstacleInfo = {
  type: "cactus" | "bird";
  birdHeight: "high" | "mid" | "low" | null;
  x: number; y: number;
  w: number; h: number;
  left: number; right: number; top: number; bottom: number;
  passed: boolean;
};

type DebugState = {
  ready: boolean;
  gameState: "playing" | "gameover";
  lives: number;
  distance: number;
  worldSpeed: number;
  dayNight: "day" | "night";
  grounded: boolean;
  invuln: boolean;
  puffy: { x: number; y: number; w: number; h: number };
  groundY: number;
  obstacles: ObstacleInfo[];
  viewport: { w: number; h: number };
};

const TARGET_SECONDS = Number(process.env.TARGET_SECONDS ?? 60);
const POLL_HZ = 60;

async function main() {
const VIEW_W = Number(process.env.VIEW_W ?? 1280);
const VIEW_H = Number(process.env.VIEW_H ?? 720);
const GAME_URL = process.env.GAME_URL ?? "http://localhost:8001/puffy-runner.html";
const client = await connect();
const page = await client.page(`puffy-runner-bot-${VIEW_W}x${VIEW_H}`, {
  viewport: { width: VIEW_W, height: VIEW_H }
});

const errors: string[] = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));
page.on("console", (m) => {
  const t = m.type();
  if (t === "error") errors.push(`CONSOLE_ERROR ${m.text()}`);
});

await page.goto(`${GAME_URL}?t=${Date.now()}`, { waitUntil: "networkidle" });
await waitForPageLoad(page);
await page.waitForTimeout(1500);

async function getState(): Promise<DebugState | null> {
  return await page.evaluate(() => {
    const s = (window as any).game?.scene?.getScene("PuffyRunnerScene");
    if (!s) return null;
    return s.getDebugState();
  });
}

async function keydown(key: string) { await page.keyboard.down(key); }
async function keyup(key: string)   { await page.keyboard.up(key); }
async function keypress(key: string) {
  await page.keyboard.press(key);
}

const start = Date.now();
let lastLogAt = 0;
let duckDownHeld = false;
let lastAction = "idle";
let framesSincePress = 0;
let deathCause: any = null;
let maxDistance = 0;

console.log(`[bot] starting — target ${TARGET_SECONDS}s survival`);

while (true) {
  const elapsed = (Date.now() - start) / 1000;
  if (elapsed > TARGET_SECONDS + 2) break;
  const s = await getState();
  if (!s || !s.ready) { await page.waitForTimeout(50); continue; }

  maxDistance = Math.max(maxDistance, s.distance);

  if (s.gameState === "gameover") {
    // Capture death context: which obstacle was closest to Puffy at x < 0 ?
    deathCause = {
      atSeconds: elapsed.toFixed(2),
      distance: s.distance,
      worldSpeed: s.worldSpeed,
      lives: s.lives,
      grounded: s.grounded,
      // Nearest obstacle behind the player (likely the killer).
      nearest: s.obstacles
        .filter(o => Math.abs(o.x - s.puffy.x) < 200)
        .sort((a, b) => Math.abs(a.x - s.puffy.x) - Math.abs(b.x - s.puffy.x))[0] ?? null
    };
    break;
  }

  // Only consider obstacles still to the right of Puffy and within reaction window.
  const speed = s.worldSpeed;
  const upcoming = s.obstacles
    .filter(o => !o.passed && o.right > s.puffy.x - 10)
    .sort((a, b) => a.left - b.left);
  const next = upcoming[0];

  framesSincePress++;
  let want: "jump" | "duck" | "stand" = "stand";

  if (next) {
    const distPx = next.left - (s.puffy.x + s.puffy.w / 2);
    const timeToHit = distPx / speed; // seconds
    // All obstacles are now jump-only.
    const jumpWindow = 0.65;
    if (timeToHit < jumpWindow && timeToHit > 0 && s.grounded) want = "jump";
  }

  // Per-close-obstacle debug.
  if (next) {
    const distPx = next.left - (s.puffy.x + s.puffy.w / 2);
    if (distPx < 220 && distPx > -60 && (elapsed - lastLogAt) > 0.25) {
      lastLogAt = elapsed;
      console.log(`[${elapsed.toFixed(2)}s] gap=${Math.round(distPx)}px type=${next.type}${next.birdHeight ? ":"+next.birdHeight : ""} t2h=${(distPx/speed).toFixed(2)}s grounded=${s.grounded} lives=${s.lives} want=${want} last=${lastAction}`);
    }
  }

  // Apply action.
  if (want === "jump") {
    if (s.grounded && framesSincePress > 1) {
      await keypress("Space");
      lastAction = `jump@${elapsed.toFixed(2)}s`;
      framesSincePress = 0;
    }
  }

  if (elapsed - lastLogAt > 5) {
    lastLogAt = elapsed;
    console.log(`[${elapsed.toFixed(0).padStart(3, ' ')}s] dist=${s.distance.toString().padStart(5, ' ')} speed=${s.worldSpeed} lives=${s.lives} grounded=${s.grounded} next=${next ? `${next.type}(${next.birdHeight ?? '-'})@${Math.round(next.left - s.puffy.x)}px` : "-"} action=${lastAction}`);
  }

  await page.waitForTimeout(Math.round(1000 / POLL_HZ));
}

if (duckDownHeld) await keyup("ArrowDown");

const finalElapsed = (Date.now() - start) / 1000;
const finalState = await getState();

console.log("\n================= RESULT =================");
if (deathCause) {
  console.log(`DIED at ${deathCause.atSeconds}s  (target ${TARGET_SECONDS}s)`);
  console.log(`distance=${deathCause.distance} worldSpeed=${deathCause.worldSpeed}`);
  console.log(`grounded=${deathCause.grounded}`);
  console.log(`killer:`, JSON.stringify(deathCause.nearest, null, 2));
} else {
  console.log(`SURVIVED ${finalElapsed.toFixed(1)}s  (target ${TARGET_SECONDS}s)  maxDist=${maxDistance}`);
  console.log(`final lives=${finalState?.lives} gameState=${finalState?.gameState}`);
}
console.log(`errors: ${errors.length ? errors.join("\n  ") : "(none)"}`);
await page.screenshot({ path: "tmp/puffy-runner-bot-final.png" });

await client.disconnect();
process.exit(deathCause ? 2 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
