function drawCat(ctx, x, y, direction, frame) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  const r = TILE_SIZE * 0.4;

  // Body - grey
  ctx.fillStyle = '#888899';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Stripes - darker grey
  ctx.strokeStyle = '#555566';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.3);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.3);
  ctx.moveTo(cx - r * 0.6, cy + r * 0.1);
  ctx.lineTo(cx + r * 0.6, cy + r * 0.1);
  ctx.moveTo(cx - r * 0.4, cy + r * 0.5);
  ctx.lineTo(cx + r * 0.4, cy + r * 0.5);
  ctx.stroke();

  // Ears
  ctx.fillStyle = '#888899';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.7, cy - r * 0.5);
  ctx.lineTo(cx - r * 0.3, cy - r * 1.1);
  ctx.lineTo(cx - r * 0.0, cy - r * 0.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.0, cy - r * 0.5);
  ctx.lineTo(cx + r * 0.3, cy - r * 1.1);
  ctx.lineTo(cx + r * 0.7, cy - r * 0.5);
  ctx.fill();

  // Inner ears - pink
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy - r * 0.55);
  ctx.lineTo(cx - r * 0.3, cy - r * 0.9);
  ctx.lineTo(cx - r * 0.1, cy - r * 0.55);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.1, cy - r * 0.55);
  ctx.lineTo(cx + r * 0.3, cy - r * 0.9);
  ctx.lineTo(cx + r * 0.55, cy - r * 0.55);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Pupils - direction aware
  let px = 0, py = 0;
  if (direction) {
    px = direction.dx * r * 0.1;
    py = direction.dy * r * 0.1;
  }
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3 + px, cy - r * 0.15 + py, r * 0.1, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.3 + px, cy - r * 0.15 + py, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth - animated chomp
  const mouthOpen = Math.sin(frame * 0.3) > 0;
  if (mouthOpen) {
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.35, r * 0.2, 0, Math.PI);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#555566';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.15, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.15, cy + r * 0.35);
    ctx.stroke();
  }
}

function drawRat(ctx, x, y, direction, frightened, frame, flashing) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  const r = TILE_SIZE * 0.38;

  // Body — flash white/blue when wasabi is about to expire
  const flashWhite = flashing && Math.floor(frame / 5) % 2 === 0;
  const bodyColor = frightened ? (flashWhite ? '#ffffff' : '#4444ff') : '#999999';
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Ears - round
  ctx.fillStyle = frightened ? (flashWhite ? '#dddddd' : '#3333cc') : '#ccbbbb';
  ctx.beginPath();
  ctx.arc(cx - r * 0.6, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.6, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  if (frightened) {
    // X eyes when frightened
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    const ex1 = cx - r * 0.3, ex2 = cx + r * 0.3, ey = cy - r * 0.1;
    ctx.beginPath();
    ctx.moveTo(ex1 - 2, ey - 2); ctx.lineTo(ex1 + 2, ey + 2);
    ctx.moveTo(ex1 + 2, ey - 2); ctx.lineTo(ex1 - 2, ey + 2);
    ctx.moveTo(ex2 - 2, ey - 2); ctx.lineTo(ex2 + 2, ey + 2);
    ctx.moveTo(ex2 + 2, ey - 2); ctx.lineTo(ex2 - 2, ey + 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.15, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tail
  const tailWag = Math.sin(frame * 0.4) * r * 0.3;
  ctx.strokeStyle = frightened ? '#3333cc' : '#999999';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.8);
  ctx.quadraticCurveTo(cx + tailWag, cy + r * 1.5, cx + tailWag + r * 0.3, cy + r * 1.2);
  ctx.stroke();

  // Nose
  ctx.fillStyle = frightened ? '#6666ff' : '#ffaaaa';
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.2, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawSushi(ctx, x, y) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;

  // Nori wrap (dark circle)
  ctx.fillStyle = '#1a3a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Rice (white inner)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Fish center (salmon)
  ctx.fillStyle = '#ff6644';
  ctx.beginPath();
  ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawWasabi(ctx, x, y, frame) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  const pulse = 1 + Math.sin(frame * 0.1) * 0.15;
  const r = 5 * pulse;

  ctx.fillStyle = '#44dd44';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#88ff88';
  ctx.beginPath();
  ctx.arc(cx - 1, cy - 1, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawWall(ctx, x, y, maze, col, row, wasabiActive) {
  const isWall = (c, r) => {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    return maze[r][c] === WALL;
  };

  ctx.fillStyle = wasabiActive ? '#0a2a1a' : COLORS.wall;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  ctx.strokeStyle = wasabiActive ? '#22aa44' : COLORS.wallBorder;
  ctx.lineWidth = 1;

  const top = !isWall(col, row - 1);
  const bottom = !isWall(col, row + 1);
  const left = !isWall(col - 1, row);
  const right = !isWall(col + 1, row);

  if (top) { ctx.beginPath(); ctx.moveTo(x, y + 0.5); ctx.lineTo(x + TILE_SIZE, y + 0.5); ctx.stroke(); }
  if (bottom) { ctx.beginPath(); ctx.moveTo(x, y + TILE_SIZE - 0.5); ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE - 0.5); ctx.stroke(); }
  if (left) { ctx.beginPath(); ctx.moveTo(x + 0.5, y); ctx.lineTo(x + 0.5, y + TILE_SIZE); ctx.stroke(); }
  if (right) { ctx.beginPath(); ctx.moveTo(x + TILE_SIZE - 0.5, y); ctx.lineTo(x + TILE_SIZE - 0.5, y + TILE_SIZE); ctx.stroke(); }
}

function drawPenGate(ctx, x, y) {
  ctx.fillStyle = COLORS.penGate;
  ctx.fillRect(x + 2, y + TILE_SIZE / 2 - 1, TILE_SIZE - 4, 3);
}

function drawLife(ctx, x, y) {
  const s = 12;
  const cx = x + s / 2;
  const cy = y + s / 2;

  ctx.fillStyle = '#888899';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 2);
  ctx.lineTo(cx - 1, cy - 5);
  ctx.lineTo(cx + 1, cy - 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 1, cy - 2);
  ctx.lineTo(cx + 3, cy - 5);
  ctx.lineTo(cx + 5, cy - 2);
  ctx.fill();
}
