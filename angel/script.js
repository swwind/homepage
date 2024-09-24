/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');

let width = canvas.width, height = canvas.height;

const blockWidth = 50;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

resize();
addEventListener('resize', resize);

let cx = 0, cy = 0, cs = 1.0;
let tx = 0, ty = 0, ts = 1.0;

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
    const x1 = cx - cs * width / 2;
    const x2 = cx + cs * width / 2;
    const y1 = cy - cs * height / 2;
    const y2 = cy + cs * height / 2;

    const block = blockWidth / cs;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#ccc';

    // draw |
    for (let x = Math.floor(x1 / block) * block; x <= x2; x += block) {
        ctx.beginPath();
        ctx.moveTo((x - x1) / cs, 0);
        ctx.lineTo((x - x1) / cs, height);
        ctx.closePath();
        ctx.stroke();
    }

    // draw -
    for (let y = Math.floor(y1 / block) * block; y <= y2; y += block) {
        ctx.beginPath();
        ctx.moveTo(0, (y - y1) / cs);
        ctx.lineTo(width, (y - y1) / cs);
        ctx.closePath();
        ctx.stroke();
    }
}

const ctx = canvas.getContext('2d');

if (!ctx) {
    throw new Error("Canvas 2D not supported");
}

requestAnimationFrame(function animationFrame() {
    requestAnimationFrame(animationFrame);
    linearAppoarch();
    clear(ctx);

    drawLines(ctx);
});

addEventListener('keydown', (e) => {
    // console.log(e.key);
    switch (e.key) {
        case '=': {
            ts = ts / 1.05;
            break;
        }
        case '-': {
            ts = ts * 1.05;
            break;
        }
        case 'a':
        case 'ArrowLeft': {
            tx = tx - width / cs * 0.02;
            break;
        }
        case 'd':
        case 'ArrowRight': {
            tx = tx + width / cs * 0.02;
            break;
        }
        case 'w':
        case 'ArrowUp': {
            ty = ty - width / cs * 0.02;
            break;
        }
        case 's':
        case 'ArrowDown': {
            ty = ty + width / cs * 0.02;
            break;
        }
    }
})
