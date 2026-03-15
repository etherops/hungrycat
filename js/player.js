function createPlayer() {
  return {
    col: PLAYER_START.col,
    row: PLAYER_START.row,
    pixelX: PLAYER_START.col * TILE_SIZE,
    pixelY: PLAYER_START.row * TILE_SIZE,
    direction: null,
    nextDirection: null,
    speed: PLAYER_SPEED,
    moving: false,
  };
}

function handleInput(player, key) {
  switch (key) {
    case 'ArrowUp': case 'w': case 'W':
      player.nextDirection = DIRECTIONS.UP; break;
    case 'ArrowDown': case 's': case 'S':
      player.nextDirection = DIRECTIONS.DOWN; break;
    case 'ArrowLeft': case 'a': case 'A':
      player.nextDirection = DIRECTIONS.LEFT; break;
    case 'ArrowRight': case 'd': case 'D':
      player.nextDirection = DIRECTIONS.RIGHT; break;
  }
}

function updatePlayer(player, maze, dt) {
  const events = [];
  const pixelsPerFrame = player.speed * TILE_SIZE * dt;

  // Snap check: are we at the center of current tile?
  const targetX = player.col * TILE_SIZE;
  const targetY = player.row * TILE_SIZE;
  const atCenter = Math.abs(player.pixelX - targetX) < 1 && Math.abs(player.pixelY - targetY) < 1;

  if (atCenter) {
    player.pixelX = targetX;
    player.pixelY = targetY;

    // Try next direction first
    if (player.nextDirection) {
      const nc = player.col + player.nextDirection.dx;
      const nr = player.row + player.nextDirection.dy;
      if (isTileWalkable(maze, nc, nr)) {
        player.direction = player.nextDirection;
        player.nextDirection = null;
      }
    }

    // Try current direction
    if (player.direction) {
      const nc = player.col + player.direction.dx;
      const nr = player.row + player.direction.dy;
      if (isTileWalkable(maze, nc, nr)) {
        player.col = nc;
        player.row = nr;
        player.moving = true;

        // Handle tunnel wrapping
        if (player.col < 0) {
          player.col = COLS - 1;
          player.pixelX = player.col * TILE_SIZE;
        } else if (player.col >= COLS) {
          player.col = 0;
          player.pixelX = player.col * TILE_SIZE;
        }
      } else {
        player.moving = false;
      }
    }

    // Consume tile at current position
    const tile = maze[player.row]?.[player.col];
    if (tile === CORRIDOR_SUSHI) {
      maze[player.row][player.col] = CORRIDOR_EMPTY;
      events.push('sushi');
    } else if (tile === WASABI) {
      maze[player.row][player.col] = CORRIDOR_EMPTY;
      events.push('wasabi');
    }
  }

  // Move pixel position toward target
  if (player.moving && player.direction) {
    const destX = player.col * TILE_SIZE;
    const destY = player.row * TILE_SIZE;
    const dx = destX - player.pixelX;
    const dy = destY - player.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= pixelsPerFrame) {
      player.pixelX = destX;
      player.pixelY = destY;
    } else {
      player.pixelX += (dx / dist) * pixelsPerFrame;
      player.pixelY += (dy / dist) * pixelsPerFrame;
    }
  }

  return events;
}

function resetPlayer(player) {
  player.col = PLAYER_START.col;
  player.row = PLAYER_START.row;
  player.pixelX = PLAYER_START.col * TILE_SIZE;
  player.pixelY = PLAYER_START.row * TILE_SIZE;
  player.direction = null;
  player.nextDirection = null;
  player.moving = false;
}

function renderPlayer(ctx, player, frame) {
  const hudOffset = HUD_HEIGHT * TILE_SIZE;
  drawCat(ctx, player.pixelX, player.pixelY + hudOffset, player.direction, frame);
}
