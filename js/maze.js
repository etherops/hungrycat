function createMaze() {
  return MAZE_LAYOUT.map(row => [...row]);
}

function renderMaze(ctx, maze, frame, wasabiActive) {
  const hudOffset = HUD_HEIGHT * TILE_SIZE;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE + hudOffset;
      const tile = maze[row][col];

      switch (tile) {
        case WALL:
          drawWall(ctx, x, y, maze, col, row, wasabiActive);
          break;
        case CORRIDOR_SUSHI:
          drawSushi(ctx, x, y);
          break;
        case WASABI:
          drawWasabi(ctx, x, y, frame);
          break;
        case PEN_GATE:
          drawPenGate(ctx, x, y);
          break;
        // CORRIDOR_EMPTY and RAT_PEN: draw nothing (black background)
      }
    }
  }
}

const TUNNEL_ROWS = [8, 13];
const TUNNEL_COLS = [4, 16];

function isTileWalkable(maze, col, row) {
  if (col < 0 || col >= COLS) return TUNNEL_ROWS.includes(row);
  if (row < 0 || row >= ROWS) return TUNNEL_COLS.includes(col);
  const tile = maze[row][col];
  return tile !== WALL;
}

function isTileWalkableForEnemy(maze, col, row, enemyState) {
  if (col < 0 || col >= COLS) return TUNNEL_ROWS.includes(row);
  if (row < 0 || row >= ROWS) return TUNNEL_COLS.includes(col);
  return maze[row][col] !== WALL;
  const tile = maze[row][col];
  if (tile === WALL) return false;
  // Only penned/eaten enemies can walk through pen gate; active enemies cannot re-enter
  if (tile === PEN_GATE && enemyState === 'active') return true;
  if (tile === PEN_GATE) return true;
  return true;
}

function countRemainingSushi(maze) {
  let count = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (maze[row][col] === CORRIDOR_SUSHI) count++;
    }
  }
  return count;
}

function getValidDirections(maze, col, row, enemyState) {
  const dirs = [];
  if (isTileWalkableForEnemy(maze, col, row - 1, enemyState)) dirs.push(DIRECTIONS.UP);
  if (isTileWalkableForEnemy(maze, col, row + 1, enemyState)) dirs.push(DIRECTIONS.DOWN);
  if (isTileWalkableForEnemy(maze, col - 1, row, enemyState)) dirs.push(DIRECTIONS.LEFT);
  if (isTileWalkableForEnemy(maze, col + 1, row, enemyState)) dirs.push(DIRECTIONS.RIGHT);
  return dirs;
}
