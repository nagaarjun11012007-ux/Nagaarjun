const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const restartBtn = document.getElementById('restart');

let width = canvas.width;
let height = canvas.height;

// Game variables
let paddle = { w: 100, h: 12, x: (width - 100) / 2, y: height - 30, speed: 7 };
let ball = { x: width / 2, y: height / 2, r: 8, vx: 4, vy: -4 };
let bricks = [];
let rows = 5, cols = 9, brickW = 64, brickH = 18, padding = 10, offsetTop = 40, offsetLeft = 30;
let score = 0, lives = 3, running = true;

// Initialize bricks
function initBricks() {
  bricks = [];
  for (let r = 0; r < rows; r++) {
    bricks[r] = [];
    for (let c = 0; c < cols; c++) {
      const bx = offsetLeft + c * (brickW + padding);
      const by = offsetTop + r * (brickH + padding);
      bricks[r][c] = { x: bx, y: by, w: brickW, h: brickH, alive: true };
    }
  }
}

// Reset game
function reset() {
  paddle.x = (width - paddle.w) / 2;
  ball.x = width / 2;
  ball.y = height / 2;
  ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = -4;
  score = 0;
  lives = 3;
  running = true;
  initBricks();
  updateUI();
}

// Draw rounded rectangle
function drawRoundedRect(x, y, w, h, r = 6) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, width, height);
  const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 800);
  grad.addColorStop(0, 'rgba(56,189,248,0.03)');
  grad.addColorStop(1, 'rgba(2,6,23,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const b = bricks[r][c];
      if (b && b.alive) {
        ctx.fillStyle = `hsl(${r * 25 + c * 6}, 75%, 55%)`;
        drawRoundedRect(b.x, b.y, b.w, b.h, 4);
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    }
  }

  ctx.fillStyle = '#38bdf8';
  drawRoundedRect(paddle.x, paddle.y, paddle.w, paddle.h, 8);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();

  ctx.font = '12px system-ui';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Bricks: ' + remainingBricks() + '  •  Score: ' + score, 10, height - 6);
}

function remainingBricks() {
  let c = 0;
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < cols; i++)
      if (bricks[r][i] && bricks[r][i].alive) c++;
  return c;
}

// Update game logic
function update() {
  if (!running) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0 || ball.x + ball.r > width) ball.vx *= -1;
  if (ball.y - ball.r < 0) ball.vy *= -1;

  if (
    ball.y + ball.r > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const speed = Math.hypot(ball.vx, ball.vy);
    const angle = hitPos * (Math.PI / 3);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
  }

  if (ball.y - ball.r > height) {
    lives--;
    updateUI();
    if (lives <= 0) {
      running = false;
      setTimeout(() => alert('Game Over! Score: ' + score), 100);
    } else {
      ball.x = width / 2;
      ball.y = height / 2;
      ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ball.vy = -4;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const b = bricks[r][c];
      if (b && b.alive) {
        if (
          ball.x > b.x &&
          ball.x < b.x + b.w &&
          ball.y - ball.r < b.y + b.h &&
          ball.y + ball.r > b.y
        ) {
          b.alive = false;
          score += 10;
          updateUI();
          ball.vy *= -1;
          ball.vx *= 1.03;
          ball.vy *= 1.03;
          if (remainingBricks() === 0) {
            running = false;
            setTimeout(() => alert('You Win! Score: ' + score), 100);
          }
        }
      }
    }
  }

  draw();
}

function updateUI() {
  scoreEl.textContent = 'Score: ' + score;
  livesEl.textContent = 'Lives: ' + lives;
}

let left = false, right = false;
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') left = true;
  if (e.key === 'ArrowRight') right = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') left = false;
  if (e.key === 'ArrowRight') right = false;
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  paddle.x = Math.min(width - paddle.w, Math.max(0, x - paddle.w / 2));
});

function gameloop() {
  if (left) paddle.x -= paddle.speed;
  if (right) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(width - paddle.w, paddle.x));
  update();
  requestAnimationFrame(gameloop);
}

restartBtn.addEventListener('click', reset);
function resizeCanvas() {
  const maxW = Math.min(window.innerWidth * 0.96, 900);
  const scale = maxW / width;
  canvas.style.width = Math.round(width * scale) + 'px';
  canvas.style.height = Math.round(height * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);

initBricks();
updateUI();
draw();
gameloop();
resizeCanvas();
