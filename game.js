/* ============================================================
   SNAKE GAME - Game Logic (JavaScript)
   DSA Project | Data Structure: QUEUE
   
   This file contains all game logic.
   The C++ version of this logic is in: snake_logic.cpp
============================================================ */


// ============================================================
//  QUEUE CLASS (built from scratch — no library)
//
//  The snake body IS the queue:
//    Front = HEAD of snake  (enqueue here on each move)
//    Rear  = TAIL of snake  (dequeue here on each move)
//
//  C++ equivalent: class Queue with Node* front, Node* rear
// ============================================================
class Queue {
  constructor() {
    this.data = [];               // internal storage (array as queue)
  }

  enqueue(val) {
    this.data.unshift(val);       // add to FRONT → new snake head
  }                               // C++: newNode->next = front; front = newNode;

  dequeue() {
    return this.data.pop();       // remove from REAR → old snake tail
  }                               // C++: traverse to rear, delete it

  peek() {
    return this.data[0];          // look at head without removing
  }                               // C++: return front;

  get size() {
    return this.data.length;      // current snake length
  }                               // C++: return length;

  toArray() {
    return [...this.data];        // snapshot for collision check & rendering
  }

  isEmpty() {
    return this.data.length === 0;
  }
}


// ============================================================
//  CANVAS — responsive sizing
// ============================================================
const COLS = 21;
const ROWS = 21;

const wrap   = document.getElementById('canvas-wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

function calcSize() {
  const maxW = Math.min(window.innerWidth - 28, 480);
  const sz   = Math.floor(maxW / COLS) * COLS;
  canvas.width  = sz;
  canvas.height = sz;
  wrap.style.width  = sz + 'px';
  wrap.style.height = sz + 'px';
}
calcSize();
window.addEventListener('resize', () => { calcSize(); if (!running) draw(); });

const CW = () => canvas.width  / COLS;   // cell width
const CH = () => canvas.height / ROWS;   // cell height


// ============================================================
//  GAME STATE
// ============================================================
let snake;      // Queue — the snake body
let dir;        // current direction {dx, dy}
let nextDir;    // buffered next direction
let food;       // food position {x, y}
let score;      // current score
let best = 0;   // best score this session
let running = false;
let gameLoop;


// ============================================================
//  RANDOM FOOD — place food not on the snake body
//  C++ equivalent: placeFood(Queue& snake)
// ============================================================
function randomFood() {
  let pos;
  const body = snake.toArray();
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (body.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}


// ============================================================
//  SET DIRECTION — prevents 180-degree reversal
//  C++ equivalent: changeDirection(GameState& gs, int dx, int dy)
// ============================================================
function setDir(dx, dy) {
  if (dx ===  1 && dir.dx === -1) return;
  if (dx === -1 && dir.dx ===  1) return;
  if (dy ===  1 && dir.dy === -1) return;
  if (dy === -1 && dir.dy ===  1) return;
  nextDir = { dx, dy };
}


// ============================================================
//  START GAME — initialise queue and state
//  C++ equivalent: initGame(GameState& gs)
// ============================================================
function startGame() {
  snake   = new Queue();
  snake.enqueue({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });

  dir     = { dx: 1, dy: 0 };
  nextDir = { dx: 1, dy: 0 };
  food    = randomFood();
  score   = 0;
  running = true;

  document.getElementById('score').textContent  = '0';
  document.getElementById('length').textContent = '1';
  document.getElementById('overlay').style.display = 'none';

  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 130);   // tick every 130ms
  draw();
}


// ============================================================
//  GAME TICK — one step of game logic, runs every 130ms
//  C++ equivalent: void tick(GameState& gs)
// ============================================================
function tick() {
  if (!running) return;

  dir = nextDir;   // apply buffered direction

  // Calculate next head position
  const head = snake.peek();
  const nx   = head.x + dir.dx;
  const ny   = head.y + dir.dy;

  // ── WALL COLLISION ──
  // C++: if (hitWall(nx, ny)) { endGame(); }
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
    endGame();
    return;
  }

  // ── SELF COLLISION ──
  // C++: if (snake.contains(nx, ny)) { endGame(); }
  if (snake.toArray().some(s => s.x === nx && s.y === ny)) {
    endGame();
    return;
  }

  // ── ENQUEUE new head (move forward) ──
  // C++: gs.snake.enqueue(nx, ny);
  snake.enqueue({ x: nx, y: ny });

  const ateFood = (nx === food.x && ny === food.y);

  if (!ateFood) {
    // ── DEQUEUE tail — snake moves, same length ──
    // C++: gs.snake.dequeue();
    snake.dequeue();
  } else {
    // ── GROW — skip dequeue, queue size increases by 1 ──
    // C++: gs.score += 10; gs.food = placeFood(gs.snake);
    score += 10;
    food   = randomFood();
    if (score > best) best = score;
    document.getElementById('best').textContent = best;
  }

  document.getElementById('score').textContent  = score;
  document.getElementById('length').textContent = snake.size;

  draw();
}


// ============================================================
//  END GAME
//  C++ equivalent: printSummary(GameState& gs)
// ============================================================
function endGame() {
  running = false;
  clearInterval(gameLoop);

  document.getElementById('ol-title').textContent = 'GAME OVER';
  document.getElementById('ol-sub').textContent   = 'FINAL SCORE';
  const os = document.getElementById('ol-score');
  os.style.display = 'block';
  os.textContent   = score;
  document.getElementById('btn').textContent = 'PLAY AGAIN';
  document.getElementById('overlay').style.display = 'flex';
}


// ============================================================
//  DRAW — render everything on canvas
//  (No C++ equivalent — this is frontend only)
// ============================================================
function draw() {
  const W  = canvas.width, H = canvas.height;
  const cw = CW(), ch = CH();

  // Background + grid
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#0e0e0e';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      ctx.strokeRect(x * cw, y * ch, cw, ch);

  if (!snake) return;

  // Snake segments (drawn from Queue snapshot)
  const arr = snake.toArray();
  arr.forEach((seg, i) => {
    const isHead = (i === 0);
    const t = i / arr.length;

    // Bright green head → dark green tail gradient
    if (isHead) {
      ctx.fillStyle = '#00ff88';
    } else {
      const g = Math.floor(255 * (1 - t * 0.78));
      ctx.fillStyle = `rgb(0, ${g}, ${Math.floor(g * 0.42)})`;
    }

    const pad = isHead ? 1 : 2;
    ctx.beginPath();
    ctx.roundRect(seg.x * cw + pad, seg.y * ch + pad, cw - pad * 2, ch - pad * 2, isHead ? 4 : 2);
    ctx.fill();

    // Eyes on head
    if (isHead) {
      ctx.fillStyle = '#000';
      const cx = seg.x * cw + cw / 2, cy = seg.y * ch + ch / 2;
      const ex = dir.dx, ey = dir.dy;
      const r  = Math.max(1.5, cw * 0.11);
      ctx.beginPath(); ctx.arc(cx + ex*cw*0.22 + ey*cw*0.18, cy + ey*ch*0.22 + ex*ch*0.18, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + ex*cw*0.22 - ey*cw*0.18, cy + ey*ch*0.22 - ex*ch*0.18, r, 0, Math.PI*2); ctx.fill();
    }
  });

  // Food (red circle with shine + stem)
  const fx = food.x * cw + cw / 2, fy = food.y * ch + ch / 2, fr = cw * 0.36;
  ctx.fillStyle = '#ff3333';
  ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff9999';
  ctx.beginPath(); ctx.arc(fx - fr*0.3, fy - fr*0.32, fr*0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#44ff88';
  ctx.fillRect(fx - 1, fy - fr - 5, 2, 6);
}


// ============================================================
//  CONTROLS — Keyboard (Arrow Keys)
// ============================================================
document.addEventListener('keydown', e => {
  if (!running) return;
  const map = {
    ArrowUp:    [0, -1],
    ArrowDown:  [0,  1],
    ArrowLeft:  [-1, 0],
    ArrowRight: [1,  0]
  };
  if (map[e.key]) {
    const [dx, dy] = map[e.key];
    setDir(dx, dy);
    e.preventDefault();
  }
});


// ============================================================
//  CONTROLS — D-Pad Buttons (Mobile)
// ============================================================
function bindDpad(id, dx, dy) {
  const el = document.getElementById(id);
  el.addEventListener('touchstart', e => { e.preventDefault(); setDir(dx, dy); }, { passive: false });
  el.addEventListener('mousedown', () => setDir(dx, dy));
}
bindDpad('dbtn-up',    0, -1);
bindDpad('dbtn-down',  0,  1);
bindDpad('dbtn-left', -1,  0);
bindDpad('dbtn-right', 1,  0);


// ============================================================
//  CONTROLS — Touch Swipe on Canvas (Mobile)
// ============================================================
let swipeStartX = 0, swipeStartY = 0;

canvas.addEventListener('touchstart', e => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (!running) return;
  const dx    = e.changedTouches[0].clientX - swipeStartX;
  const dy    = e.changedTouches[0].clientY - swipeStartY;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 20) return;   // ignore tiny taps
  if (absDx > absDy) setDir(dx > 0 ? 1 : -1, 0);
  else               setDir(0, dy > 0 ? 1 : -1);
  e.preventDefault();
}, { passive: false });


// ============================================================
//  IDLE DRAW — show snake on page load before game starts
// ============================================================
snake = new Queue();
snake.enqueue({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
dir  = { dx: 1, dy: 0 };
food = { x: Math.floor(COLS / 2) + 4, y: Math.floor(ROWS / 2) };
draw();
