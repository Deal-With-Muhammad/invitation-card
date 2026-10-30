// Records each design's opening as a short silent loop for the gallery tiles.
//   npm run previews -- [ids,comma,separated]      (dev server on :3000 must be running)
//   PREVIEW_BASE=http://localhost:3408 npm run previews -- peony
// → public/previews/<id>/loop.mp4, loop.webm, poster.webp (540×960)
// Needs chromium, ffmpeg (libx264, libvpx-vp9) and ImageMagick on PATH.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
const outRoot = "public/previews";
const list = process.argv[2] ?? readdirSync("public/art", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).join(",");
const W = 390, H = 693; // 9:16 phone viewport (CSS px); frames are captured at 540×960
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn("chromium", ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--hide-scrollbars", "--mute-audio", `--user-data-dir=${tmpdir()}/rec-${port}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50 && !targets; i++) { await sleep(200); targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => null); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0; const pending = new Map(); const listeners = new Set();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listeners.forEach((l) => l(m)); };
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 540 / W, mobile: true });

for (const id of list.split(",")) {
  const dir = `${outRoot}/${id}`;
  const tmp = `${tmpdir()}/rec-frames-${id}`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  mkdirSync(dir, { recursive: true });
  await send("Page.navigate", { url: `${base}/preview/${id}` });
  await sleep(4500); // fonts and art
  // Filmed openings run ~6 s: keep recording until the names have risen in after them.
  const openMs = (await send("Runtime.evaluate", { expression: `parseInt(getComputedStyle(document.querySelector(".pt-hero") ?? document.body).getPropertyValue("--open")) || 0`, returnByValue: true })).result?.result?.value ?? 0;
  const after = Math.max(5200, openMs + 1500);

  const frames = [];
  const onFrame = (m) => {
    if (m.method !== "Page.screencastFrame") return;
    frames.push({ data: m.params.data, t: m.params.metadata.timestamp });
    send("Page.screencastFrameAck", { sessionId: m.params.sessionId });
  };
  listeners.add(onFrame);
  await send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 540, maxHeight: 960, everyNthFrame: 1 });
  await sleep(900); // the closed card
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: W / 2, y: H * 0.55, button: "left", clickCount: 1 });
  await sleep(after); // opening, then the hero
  await send("Page.stopScreencast");
  listeners.delete(onFrame);

  // Frames arrive irregularly: write a concat list with real durations, capped to the recording.
  let list = "ffconcat version 1.0\n";
  const t0 = frames[0]?.t ?? 0;
  frames.forEach((f, i) => {
    const file = `${tmp}/f${String(i).padStart(4, "0")}.jpg`;
    writeFileSync(file, Buffer.from(f.data, "base64"));
    const next = frames[i + 1]?.t ?? f.t + 0.5;
    if (f.t - t0 > 1 + after / 1000) return;
    list += `file '${file}'\nduration ${Math.max(0.016, next - f.t).toFixed(3)}\n`;
  });
  writeFileSync(`${tmp}/list.txt`, list);
  const vf = "fps=24,scale=540:960:force_original_aspect_ratio=increase,crop=540:960,format=yuv420p";
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "29", "-movflags", "+faststart", "-an", `${dir}/loop.mp4`]);
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-an", `${dir}/loop.webm`]);
  // Poster: the opened hero (last frame).
  const last = frames.at(-1);
  if (last) {
    writeFileSync(`${tmp}/last.jpg`, Buffer.from(last.data, "base64"));
    spawnSync("magick", [`${tmp}/last.jpg`, "-resize", "540x960^", "-gravity", "center", "-extent", "540x960", "-quality", "78", `${dir}/poster.webp`]);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log("recorded", id, frames.length, "frames");
}
ws.close();
chrome.kill();
