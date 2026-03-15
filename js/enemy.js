function createEnemy(id, col, row, releaseTime) {
  return {
    id,
    col,
    row,
    startCol: col,
    startRow: row,
    pixelX: col * TILE_SIZE,
    pixelY: row * TILE_SIZE,
    direction: DIRECTIONS.UP,
    state: 'penned',
    releaseTime,
    speed: ENEMY_BASE_SPEED,
    moving: false,
    bobOffset: 0,
  };
}

function createEnemies(level) {
  return ENEMY_POSITIONS.map((pos, i) => {
    const releaseDelay = i * ENEMY_RELEASE_INTERVAL;
    const enemy = createEnemy(i, pos.col, pos.row, releaseDelay);
    enemy.speed = ENEMY_BASE_SPEED * Math.pow(1.1, level - 1);
    return enemy;
  });
}

function oppositeDirection(dir) {
  if (dir === DIRECTIONS.UP) return DIRECTIONS.DOWN;
  if (dir === DIRECTIONS.DOWN) return DIRECTIONS.UP;
  if (dir === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
  if (dir === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
  return null;
}

function updateEnemy(enemy, maze, playerCol, playerRow, dt, elapsed) {
  if (enemy.state === 'penned') {
    enemy.bobOffset = Math.sin(elapsed * 0.005) * 3;
    if (elapsed >= enemy.releaseTime) {
      enemy.state = 'exiting';
      enemy.col = PEN_EXIT.col;
      enemy.row = PEN_EXIT.row;
      enemy.pixelX = enemy.col * TILE_SIZE;
      enemy.pixelY = enemy.row * TILE_SIZE;
      enemy.direction = DIRECTIONS.UP;
    }
    return;
  }

  if (enemy.state === 'exiting') {
    // Move up out of pen area
    const targetRow = PEN_EXIT.row - 1;
    if (enemy.row > targetRow) {
      enemy.row = targetRow;
      enemy.pixelY = enemy.row * TILE_SIZE;
    }
    enemy.pixelX = enemy.col * TILE_SIZE;
    enemy.pixelY = enemy.row * TILE_SIZE;
    enemy.state = 'active';
    enemy.direction = DIRECTIONS.LEFT;
    return;
  }

  if (enemy.state === 'eaten') {
    // Return to pen
    enemy.col = enemy.startCol;
    enemy.row = enemy.startRow;
    enemy.pixelX = enemy.col * TILE_SIZE;
    enemy.pixelY = enemy.row * TILE_SIZE;
    enemy.state = 'penned';
    enemy.releaseTime = elapsed + 3000;
    return;
  }

  const currentSpeed = enemy.state === 'frightened' ? FRIGHTENED_SPEED : enemy.speed;
  const pixelsPerFrame = currentSpeed * TILE_SIZE * dt;

  const targetX = enemy.col * TILE_SIZE;
  const targetY = enemy.row * TILE_SIZE;
  const atCenter = Math.abs(enemy.pixelX - targetX) < 1 && Math.abs(enemy.pixelY - targetY) < 1;

  if (atCenter) {
    enemy.pixelX = targetX;
    enemy.pixelY = targetY;

    // Choose next direction at this tile
    const validDirs = getValidDirections(maze, enemy.col, enemy.row, enemy.state);
    const opposite = oppositeDirection(enemy.direction);
    const nonReverse = validDirs.filter(d => d !== opposite);
    const choices = nonReverse.length > 0 ? nonReverse : validDirs;

    let chosenDir;
    if (enemy.state === 'frightened') {
      chosenDir = choices[Math.floor(Math.random() * choices.length)];
    } else {
      // 70% chase, 30% random
      if (Math.random() < 0.7 && choices.length > 0) {
        // Pick direction that minimizes distance to player
        let bestDist = Infinity;
        chosenDir = choices[0];
        for (const dir of choices) {
          const nc = enemy.col + dir.dx;
          const nr = enemy.row + dir.dy;
          const dist = Math.abs(nc - playerCol) + Math.abs(nr - playerRow);
          if (dist < bestDist) {
            bestDist = dist;
            chosenDir = dir;
          }
        }
      } else {
        chosenDir = choices[Math.floor(Math.random() * choices.length)];
      }
    }

    if (chosenDir) {
      enemy.direction = chosenDir;
      const nc = enemy.col + chosenDir.dx;
      const nr = enemy.row + chosenDir.dy;

      // Handle tunnel wrapping
      if (nc < 0) {
        enemy.col = COLS - 1;
        enemy.pixelX = enemy.col * TILE_SIZE;
      } else if (nc >= COLS) {
        enemy.col = 0;
        enemy.pixelX = enemy.col * TILE_SIZE;
      } else {
        enemy.col = nc;
        enemy.row = nr;
      }
      enemy.moving = true;
    } else {
      enemy.moving = false;
    }
  }

  // Move toward target
  if (enemy.moving) {
    const destX = enemy.col * TILE_SIZE;
    const destY = enemy.row * TILE_SIZE;
    const dx = destX - enemy.pixelX;
    const dy = destY - enemy.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= pixelsPerFrame) {
      enemy.pixelX = destX;
      enemy.pixelY = destY;
    } else {
      enemy.pixelX += (dx / dist) * pixelsPerFrame;
      enemy.pixelY += (dy / dist) * pixelsPerFrame;
    }
  }
}

function frightenEnemy(enemy) {
  if (enemy.state === 'active') {
    enemy.state = 'frightened';
    enemy.direction = oppositeDirection(enemy.direction);
  }
}

function unFrightenEnemy(enemy) {
  if (enemy.state === 'frightened') {
    enemy.state = 'active';
  }
}

function resetEnemy(enemy, elapsed) {
  enemy.col = enemy.startCol;
  enemy.row = enemy.startRow;
  enemy.pixelX = enemy.col * TILE_SIZE;
  enemy.pixelY = enemy.row * TILE_SIZE;
  enemy.state = 'penned';
  enemy.releaseTime = elapsed + (enemy.id + 1) * ENEMY_RELEASE_INTERVAL;
  enemy.moving = false;
}

function checkCollision(enemy, player) {
  if (enemy.state === 'penned' || enemy.state === 'exiting' || enemy.state === 'eaten') return false;
  // Tile-based collision with a little pixel tolerance
  const dx = Math.abs(enemy.pixelX - player.pixelX);
  const dy = Math.abs(enemy.pixelY - player.pixelY);
  return dx < TILE_SIZE * 0.7 && dy < TILE_SIZE * 0.7;
}

function renderEnemy(ctx, enemy, frame, wasabiTimer) {
  const hudOffset = HUD_HEIGHT * TILE_SIZE;
  const bobY = enemy.state === 'penned' ? enemy.bobOffset : 0;
  if (enemy.state === 'eaten') return;
  const flashing = enemy.state === 'frightened' && wasabiTimer > 0 && wasabiTimer <= WASABI_FLASH_THRESHOLD;
  drawRat(ctx, enemy.pixelX, enemy.pixelY + hudOffset + bobY, enemy.direction, enemy.state === 'frightened', frame, flashing);
}
