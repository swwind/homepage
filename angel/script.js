/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

let width = canvas.width,
  height = canvas.height;

const searchParams = new URL(location.href).searchParams;

const bs = 50;
const k = Number(searchParams.get("k") || 1);

document.getElementById("k").textContent = k;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

resize();
addEventListener("resize", resize);

const angel = new Image();
angel.src = "./angel.png";
const akuma = new Image();
akuma.src = "./akuma.png";

let cx = bs / 2,
  cy = bs / 2,
  cs = 1.0;
let tx = bs / 2,
  ty = bs / 2,
  ts = 1.0;

function linearAppoarch() {
  cx = cx - (cx - tx) * 0.25;
  cy = cy - (cy - ty) * 0.25;
  cs = cs - (cs - ts) * 0.25;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function clear(ctx) {
  ctx.clearRect(0, 0, width, height);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function drawLines(ctx) {
  const x1 = cx - cs * width * 0.5;
  const x2 = cx + cs * width * 0.5;
  const y1 = cy - cs * height * 0.5;
  const y2 = cy + cs * height * 0.5;

  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#ccc";

  // draw |
  for (let x = Math.floor(x1 / bs) * bs; x <= x2; x += bs) {
    ctx.beginPath();
    ctx.moveTo((x - x1) / cs, 0);
    ctx.lineTo((x - x1) / cs, height);
    ctx.closePath();
    ctx.stroke();
  }

  // draw -
  for (let y = Math.floor(y1 / bs) * bs; y <= y2; y += bs) {
    ctx.beginPath();
    ctx.moveTo(0, (y - y1) / cs);
    ctx.lineTo(width, (y - y1) / cs);
    ctx.closePath();
    ctx.stroke();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function drawAngel(ctx, x, y) {
  const dx = (x * bs - cx) / cs + width / 2;
  const dy = (y * bs - cy) / cs + height / 2;

  ctx.drawImage(angel, dx, dy, bs / cs, bs / cs);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function drawAkuma(ctx, x, y) {
  const dx = (x * bs - cx) / cs + width / 2;
  const dy = (y * bs - cy) / cs + height / 2;

  ctx.drawImage(akuma, dx, dy, bs / cs, bs / cs);
}

/** @type {"akuma"|"angel"} */
let turn = "akuma";
let ax = 0,
  ay = 0;
const deadCells = [];

function updatePlayer(player) {
  turn = player;
  const span = document.getElementById("player");
  if (player === "akuma") {
    span.textContent = "Devil";
    span.style.color = "#fe0100";
  } else {
    span.textContent = "Angel";
    span.style.color = "#ede94d";
  }
}

updatePlayer(turn);

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {[number, number][]} cells
 */
function drawDeadCell(ctx, cells) {
  ctx.fillStyle = "#ff6969";

  for (const [x, y] of cells) {
    const dx = (x * bs - cx) / cs + width / 2;
    const dy = (y * bs - cy) / cs + height / 2;
    ctx.fillRect(dx, dy, bs / cs, bs / cs);
  }

  if (cells.length > 0) {
    drawAkuma(ctx, ...cells[cells.length - 1]);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} ax
 * @param {number} ay
 * @param {number} k
 */
function drawSafeCell(ctx, ax, ay, k) {
  ctx.fillStyle = "#82ffa5";

  const dx = ((ax - k) * bs - cx) / cs + width / 2;
  const dy = ((ay - k) * bs - cy) / cs + height / 2;
  const sz = ((2 * k + 1) * bs) / cs;
  ctx.fillRect(dx, dy, sz, sz);
}

const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Canvas 2D not supported");
}

requestAnimationFrame(function animationFrame() {
  requestAnimationFrame(animationFrame);

  linearAppoarch();
  clear(ctx);

  drawSafeCell(ctx, ax, ay, k);
  drawDeadCell(ctx, deadCells);
  drawAngel(ctx, ax, ay);

  drawLines(ctx);
});

const steps = [];

function withdraw() {
  if (steps.length > 0) {
    const step = steps.pop();
    if (step.type === "angel") {
      ax = step.x;
      ay = step.y;
      updatePlayer("angel");
    } else {
      deadCells.pop();
      updatePlayer("akuma");
    }
  }
}

addEventListener("keydown", (e) => {
  // console.log(e.key);
  switch (e.key) {
    case "=": {
      ts = ts / 1.05;
      break;
    }
    case "-": {
      ts = ts * 1.05;
      break;
    }
    case "a":
    case "ArrowLeft": {
      tx = tx - bs;
      break;
    }
    case "d":
    case "ArrowRight": {
      tx = tx + bs;
      break;
    }
    case "w":
    case "ArrowUp": {
      ty = ty - bs;
      break;
    }
    case "s":
    case "ArrowDown": {
      ty = ty + bs;
      break;
    }
    case "o": {
      ts = 1.0;
      tx = bs / 2;
      ty = bs / 2;
      break;
    }
    case "z": {
      withdraw();
      break;
    }
  }
});

addEventListener("wheel", (e) => {
  ts = ts + (ts * e.deltaY) / 2000;
});

let right_down = false,
  rx = 0,
  ry = 0,
  sx = 0,
  sy = 0;

addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    right_down = true;
    rx = e.clientX;
    ry = e.clientY;
    sx = tx;
    sy = ty;
  }
});

addEventListener("mouseup", (e) => {
  if (e.button === 2) {
    right_down = false;
  }
});

addEventListener("mousemove", (e) => {
  if (right_down) {
    tx = sx - (e.clientX - rx) * cs;
    ty = sy - (e.clientY - ry) * cs;
  }
});

addEventListener("contextmenu", (e) => e.preventDefault());

addEventListener("click", (e) => {
  const x = (e.clientX - width / 2) * cs + cx;
  const y = (e.clientY - height / 2) * cs + cy;

  const xx = Math.floor(x / bs);
  const yy = Math.floor(y / bs);

  if (turn === "akuma") {
    if (
      !(ax === xx && ay === yy) &&
      !deadCells.some(([x, y]) => x === xx && y === yy)
    ) {
      deadCells.push([xx, yy]);
      steps.push({ type: "akuma" });
      updatePlayer("angel");
    }
  } else {
    const dis = Math.max(Math.abs(xx - ax), Math.abs(yy - ay));
    if (
      dis > 0 &&
      dis <= k &&
      !deadCells.some(([x, y]) => x === xx && y === yy)
    ) {
      steps.push({ type: "angel", x: ax, y: ay });
      ax = xx;
      ay = yy;
      updatePlayer("akuma");
    }
  }
});
