"use strict";

const CIRCLE_LIFE = 250;
const MOUSE_TIME = 250;
const TRIANGLE_TIME = 600;
const TRIANGLE_DISTANT = 100;
const WAVE_TIME = 600;

/**
 * @param {HTMLCanvasElement} canvas
 */
function setupBaTouch(canvas) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("canvas is disabled");
  }

  function onresize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }
  addEventListener("resize", onresize);
  onresize();

  /** @type {{x: number, y: number, t: number}[]} */
  const circles = [];
  /** @type {{x: number, y: number, a: number, t: number}[]} */
  const waves = [];
  /** @type {{t: number, x1: number, y1: number, x2: number, y2: number}[]} */
  const moves = [];
  /** @type {{t: number, x: number, y: number, a: number, u: boolean, s: number}[]} */
  const triangles = [];

  function addWave(x, y) {
    waves.push({ x, y, t: Date.now(), a: Math.random() * Math.PI * 2 });
    setTimeout(() => waves.shift(), WAVE_TIME);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  function addCircle(x, y) {
    circles.push({ x, y, t: Date.now() });
    setTimeout(() => circles.shift(), CIRCLE_LIFE);
    addTriangle(x, y);
    addTriangle(x, y);
    addTriangle(x, y);
    addTriangle(x, y);
    addWave(x, y);
    addWave(x, y);
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  function addMovement(x1, y1, x2, y2) {
    moves.push({ x1, y1, x2, y2, t: Date.now() });
    setTimeout(() => moves.shift(), MOUSE_TIME);
    // make triangles
    const d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    let i = 1;
    while (distance + d >= TRIANGLE_DISTANT * i) {
      const k = TRIANGLE_DISTANT * i++ - distance; // 0 <= k <= d
      const nx = (x1 * (d - k) + x2 * k) / d;
      const ny = (y1 * (d - k) + y2 * k) / d;
      addTriangle(nx, ny);
    }
    distance = distance + d - TRIANGLE_DISTANT * (i - 1);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  function addTriangle(x, y) {
    triangles.push({
      x,
      y,
      t: Date.now(),
      a: Math.random() * Math.PI * 2,
      u: Math.random() < 0.5,
      s: Math.random(),
    });
    setTimeout(() => triangles.shift(), TRIANGLE_TIME);
  }

  let mousedown = false;
  let lastX = 0;
  let lastY = 0;
  let distance = 0;

  addEventListener("mousedown", (e) => {
    addCircle(e.x, e.y);
    mousedown = true;
    lastX = e.x;
    lastY = e.y;
  });

  addEventListener("mouseup", () => {
    mousedown = false;
  });

  addEventListener("mousemove", (e) => {
    if (mousedown) {
      addMovement(lastX, lastY, e.x, e.y);
      lastX = e.x;
      lastY = e.y;
    }
  });

  let touchX = 0;
  let touchY = 0;

  addEventListener("touchstart", (e) => {
    addCircle(e.touches[0].clientX, e.touches[0].clientY);
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  });

  addEventListener("touchmove", (e) => {
    addMovement(touchX, touchY, e.touches[0].clientX, e.touches[0].clientY);
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  });

  const sqrt3to2 = Math.sqrt(3) / 2;
  const szFn = (life) => {
    const st = Math.sqrt(life);
    return st * (1 - st) * 4;
  };
  const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
  const mixRgba = (c1, c2, p) => {
    const r = c1[0] * (1 - p) + c2[0] * p;
    const g = c1[1] * (1 - p) + c2[1] * p;
    const b = c1[2] * (1 - p) + c2[2] * p;
    const a = c1[3] * (1 - p) + c2[3] * p;
    return rgba(r, g, b, a);
  };

  requestAnimationFrame(function render() {
    const now = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw circles
    ctx.shadowBlur = 0;
    for (const c of circles) {
      const life = Math.min((now - c.t) / CIRCLE_LIFE, 1);
      const size = Math.exp(Math.log(life) / 4);
      const brit = Math.exp(Math.log(life) * 2);

      const color = mixRgba(
        [0x61, 0xb5, 0xe8, 0.5],
        [0xff, 0xff, 0xff, 0.5],
        brit
      );

      ctx.beginPath();
      ctx.arc(c.x, c.y, size * 45, 0, Math.PI * 2);
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fill();
    }

    // draw waves
    for (const w of waves) {
      const life = Math.min((now - w.t) / WAVE_TIME, 1);
      const lsin = Math.sin(life * Math.PI);
      const length = lsin * Math.PI * 1.25;
      const start = w.a - life * Math.PI;
      const radius = Math.exp(Math.log(life) / 4) * 50;

      for (let i = 0; i < 3; ++i) {
        ctx.beginPath();
        ctx.arc(w.x, w.y, radius, start, start + length);
        ctx.shadowBlur = 3;
        ctx.shadowColor = "white";
        ctx.strokeStyle = "white";
        ctx.lineWidth = lsin * 2;
        ctx.stroke();
      }
    }

    // draw line shadows
    ctx.shadowColor = "#99F3EF";
    ctx.strokeStyle = "#fff";
    for (const m of moves) {
      const life = Math.min((now - m.t) / MOUSE_TIME, 1);
      const size = Math.sqrt(1 - life);

      for (let i = 0; i < 3; ++i) {
        ctx.beginPath();
        ctx.moveTo(m.x1, m.y1);
        ctx.lineTo(m.x2, m.y2);
        ctx.shadowBlur = 5 * size * size * size * size;
        ctx.lineWidth = 3 * size * size * size * size + 1;
        ctx.stroke();
      }
    }

    // draw lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    for (const m of moves) {
      const life = Math.min((now - m.t) / MOUSE_TIME, 1);
      const size = Math.sqrt(1 - life);

      ctx.beginPath();
      ctx.moveTo(m.x1, m.y1);
      ctx.lineTo(m.x2, m.y2);
      ctx.lineWidth = 3 * size * size * size * size + 1;
      ctx.stroke();
    }

    // draw triangles
    for (const t of triangles) {
      const life = (now - t.t) / TRIANGLE_TIME;
      const ox = t.x + (life * 20 + 40) * Math.cos(t.a);
      const oy = t.y + (life * 20 + 40) * Math.sin(t.a);
      const s = (t.s * 5 + 15) * szFn(life);

      ctx.beginPath();
      ctx.moveTo(ox - s / 2, oy);
      ctx.lineTo(ox, oy + (t.u ? sqrt3to2 : -sqrt3to2) * s);
      ctx.lineTo(ox + s / 2, oy);
      ctx.fillStyle = rgba(
        0xff,
        0xff,
        0xff,
        Math.cos((t.t + now) / 50 + t.a) * 0.5 + 0.5
      );
      ctx.fill();
    }

    requestAnimationFrame(render);
  });
}
