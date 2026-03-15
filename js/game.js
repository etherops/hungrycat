const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * TILE_SIZE;
canvas.height = (ROWS + HUD_HEIGHT) * TILE_SIZE;

let gameState = {
  state: 'title',
  score: 0,
  level: 1,
  lives: INITIAL_LIVES,
  maze: null,
  player: null,
  enemies: [],
  wasabiTimer: 0,
  elapsed: 0,
  dyingTimer: 0,
  levelCompleteTimer: 0,
  frame: 0,
};

let lastTimestamp = 0;

function startLevel() {
  gameState.maze = createMaze();
  gameState.player = createPlayer();
  gameState.enemies = createEnemies(gameState.level);
  gameState.wasabiTimer = 0;
  gameState.elapsed = 0;
}

function startGame() {
  gameState.score = 0;
  gameState.level = 1;
  gameState.lives = INITIAL_LIVES;
  gameState.state = 'playing';
  startLevel();
}

function gameLoop(timestamp) {
  const dt = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0.016;
  lastTimestamp = timestamp;
  gameState.frame++;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (gameState.state === 'playing') {
    gameState.elapsed += dt * 1000;

    // Update player
    const events = updatePlayer(gameState.player, gameState.maze, dt);

    for (const event of events) {
      if (event === 'sushi') gameState.score += 10;
      if (event === 'wasabi') {
        gameState.score += 50;
        gameState.wasabiTimer = WASABI_DURATION;
        gameState.enemies.forEach(e => frightenEnemy(e));
      }
    }

    // Wasabi timer
    if (gameState.wasabiTimer > 0) {
      gameState.wasabiTimer -= dt * 1000;
      if (gameState.wasabiTimer <= 0) {
        gameState.wasabiTimer = 0;
        gameState.enemies.forEach(e => unFrightenEnemy(e));
      }
    }

    // Update enemies
    for (const enemy of gameState.enemies) {
      updateEnemy(enemy, gameState.maze, gameState.player.col, gameState.player.row, dt, gameState.elapsed);
    }

    // Check collisions
    for (const enemy of gameState.enemies) {
      if (checkCollision(enemy, gameState.player)) {
        if (enemy.state === 'frightened') {
          gameState.score += 200;
          enemy.state = 'eaten';
        } else if (enemy.state === 'active') {
          gameState.lives--;
          if (gameState.lives <= 0) {
            gameState.state = 'gameover';
          } else {
            gameState.state = 'dying';
            gameState.dyingTimer = 1000;
          }
          return;
        }
      }
    }

    // Win condition
    if (countRemainingSushi(gameState.maze) === 0) {
      gameState.state = 'levelcomplete';
      gameState.levelCompleteTimer = 2000;
      gameState.score += 500;
    }
  }

  if (gameState.state === 'dying') {
    gameState.dyingTimer -= dt * 1000;
    if (gameState.dyingTimer <= 0) {
      resetPlayer(gameState.player);
      gameState.enemies.forEach(e => resetEnemy(e, 0));
      gameState.elapsed = 0;
      gameState.wasabiTimer = 0;
      gameState.state = 'playing';
    }
  }

  if (gameState.state === 'levelcomplete') {
    gameState.levelCompleteTimer -= dt * 1000;
    if (gameState.levelCompleteTimer <= 0) {
      gameState.level++;
      startLevel();
      gameState.state = 'playing';
    }
  }
}

function render() {
  // Clear
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState.state === 'title') {
    renderTitleScreen();
    return;
  }

  // Draw maze
  renderMaze(ctx, gameState.maze, gameState.frame);

  // Draw entities (skip during dying flash)
  if (gameState.state !== 'dying' || Math.floor(gameState.dyingTimer / 150) % 2 === 0) {
    renderPlayer(ctx, gameState.player, gameState.frame);
  }
  gameState.enemies.forEach(e => renderEnemy(ctx, e, gameState.frame));

  // HUD
  renderHUD();

  // Overlays
  if (gameState.state === 'gameover') renderGameOver();
  if (gameState.state === 'levelcomplete') renderLevelComplete();
}

function renderHUD() {
  ctx.fillStyle = COLORS.hudBackground;
  ctx.fillRect(0, 0, canvas.width, HUD_HEIGHT * TILE_SIZE);

  // Score
  ctx.fillStyle = COLORS.text;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${gameState.score}`, 8, 22);

  // Level
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${gameState.level}`, canvas.width / 2, 22);

  // Lives
  ctx.textAlign = 'right';
  for (let i = 0; i < gameState.lives; i++) {
    drawLife(ctx, canvas.width - 20 - i * 18, 10);
  }
}

function renderTitleScreen() {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HUNGRY CAT', canvas.width / 2, canvas.height / 2 - 60);

  // Draw a big cat
  drawCat(ctx, canvas.width / 2 - TILE_SIZE, canvas.height / 2 - 30, DIRECTIONS.RIGHT, gameState.frame);

  // Draw some sushi
  drawSushi(ctx, canvas.width / 2 + 20, canvas.height / 2 - 30);
  drawSushi(ctx, canvas.width / 2 + 45, canvas.height / 2 - 30);
  drawSushi(ctx, canvas.width / 2 + 70, canvas.height / 2 - 30);

  ctx.fillStyle = COLORS.text;
  ctx.font = '14px monospace';
  const blink = Math.sin(gameState.frame * 0.08) > 0;
  if (blink) ctx.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2 + 40);

  ctx.fillStyle = '#888888';
  ctx.font = '11px monospace';
  ctx.fillText('Arrow Keys / WASD to Move', canvas.width / 2, canvas.height / 2 + 70);
  ctx.fillText('Eat all the sushi! Avoid the rats!', canvas.width / 2, canvas.height / 2 + 90);
}

function renderGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = COLORS.text;
  ctx.font = '16px monospace';
  ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 15);

  ctx.font = '12px monospace';
  const blink = Math.sin(gameState.frame * 0.08) > 0;
  if (blink) ctx.fillText('PRESS ENTER TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 50);
}

function renderLevelComplete() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = COLORS.text;
  ctx.font = '14px monospace';
  ctx.fillText(`+500 bonus!`, canvas.width / 2, canvas.height / 2 + 20);
}

// Input handling
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (gameState.state === 'title' || gameState.state === 'gameover') {
      startGame();
      return;
    }
  }

  if (gameState.state === 'playing' && gameState.player) {
    handleInput(gameState.player, e.key);
  }

  // Prevent arrow key scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
});

// Start
requestAnimationFrame(gameLoop);
