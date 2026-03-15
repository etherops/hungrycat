# Hungry Cat - Game Spec

## Concept
Pac-Man clone where a **cat** eats **sushi** in a maze while avoiding **rats**.

## Tech Stack
- **Vanilla HTML/CSS/JS** — single `index.html` + supporting files
- **Canvas API** for rendering
- **GitHub Pages** for deployment (static files only, no build step)

## Game Mechanics

### Player (Cat)
- Arrow key / WASD movement
- Moves tile-by-tile through the maze
- Eating a sushi increments score
- 3 lives; losing all = game over

### Enemies (Rats)
- 3 rats start in a central pen, release on a short timer
- Simple chase AI: periodically pick direction toward player, otherwise random
- Collision with cat = lose a life, cat respawns at start position

### Maze
- Fixed grid layout (roughly 20x20 tiles)
- Walls, corridors, sushi pellets on open tiles
- Classic Pac-Man-inspired layout (simplified)

### Sushi (Pellets)
- Small sushi sprites on every open corridor tile
- Clearing all sushi = level complete (restart maze, increment level, slightly faster rats)

### Power-ups (MVP: one type)
- **Wasabi** — appears in 4 fixed spots (like Pac-Man power pellets)
- Eating wasabi: rats turn blue and flee for ~5 seconds; cat can eat rats for bonus points
- Eaten rats respawn in pen

## UI / Screens
1. **Title screen** — "Hungry Cat" + Press Start
2. **Game HUD** — score, level, lives (shown as cat icons)
3. **Game Over screen** — final score + Play Again button

## Visual Style
- Pixel-art aesthetic using emoji or simple sprite drawings on canvas
- Cat: grey striped tabby sprite
- Rats: grey sprite
- Sushi: small maki roll sprite
- Wasabi: green blob
- Walls: dark blue, rounded corners

## File Structure
```
index.html          — entry point, canvas element, minimal CSS
js/
  game.js           — game loop, state management
  player.js         — cat movement & input
  enemy.js          — rat AI & movement
  maze.js           — maze definition & rendering
  sprites.js        — draw functions for all entities
  constants.js      — tile size, speeds, colors, maze layout
```

## Scoring
| Event | Points |
|---|---|
| Sushi eaten | 10 |
| Rat eaten (wasabi mode) | 200 |
| Level clear bonus | 500 |

## Controls
| Key | Action |
|---|---|
| Arrow keys / WASD | Move |
| Enter / Space | Start / Restart |

## Out of Scope (for now)
- Sound effects / music
- Mobile touch controls
- Multiple maze layouts
- High score persistence
- Animations beyond basic sprite movement
