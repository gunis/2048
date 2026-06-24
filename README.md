# 2048

A web version of the classic [2048](https://en.wikipedia.org/wiki/2048_(video_game)) puzzle game. Slide numbered tiles on a 4x4 grid, merge matching values, and try to reach the 2048 tile.

## Play

You can play the game [here](http://2048.gunis.sk) or serve the folder locally by opening `index.html` in your browser.

## Controls

Use the arrow keys (`↑` `↓` `←` `→`) to slide all tiles in a direction. Tiles with the same value merge into one when they collide. Click **New Game** to restart at any time.

## Features

- Random tile spawning (2 or 4) after every move
- Merge, scoring, and win (2048) / game-over detection
- Best score persisted in `localStorage` across sessions
- Animated tile movement, spawn, and merge

## Tech stack

- jQuery for DOM manipulation and event handling
- Bootstrap for base layout/styling
- Font Awesome for icons
- Plain CSS/JS, no build step — dependencies are vendored via Bower in `bower_components/`

## Project structure

```
index.html              Page markup and game layout
assets/css/main.css      Game board, tile, and UI styling
assets/js/main.js        Game logic (Grid, Tile, GameManager, Actuator)
bower_components/        Vendored jQuery, Bootstrap, Font Awesome
```

## Credits

Created by [Juraj Guniš](http://gunis.sk).