"use strict";

var GRID_SIZE = 4;
var START_TILES = 2;
var BEST_SCORE_KEY = "2048-best-score";

var KeyDirectionMap = {
	38: 0, // up
	39: 1, // right
	40: 2, // down
	37: 3  // left
};

var Tile = function (position, value) {
	this.x = position.x;
	this.y = position.y;
	this.value = value;
	this.previousPosition = null;
	this.mergedFrom = null;
};

Tile.prototype.savePosition = function () {
	this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
	this.x = position.x;
	this.y = position.y;
};

var Grid = function (size) {
	this.size = size;
	this.cells = this.buildEmptyGrid();
};

Grid.prototype.buildEmptyGrid = function () {
	var cells = [];
	for (var x = 0; x < this.size; x++) {
		cells.push([]);
		for (var y = 0; y < this.size; y++) {
			cells[x].push(null);
		}
	}
	return cells;
};

Grid.prototype.eachCell = function (callback) {
	for (var x = 0; x < this.size; x++) {
		for (var y = 0; y < this.size; y++) {
			callback(x, y, this.cells[x][y]);
		}
	}
};

Grid.prototype.availableCells = function () {
	var cells = [];
	this.eachCell(function (x, y, tile) {
		if (!tile) {
			cells.push({ x: x, y: y });
		}
	});
	return cells;
};

Grid.prototype.randomAvailableCell = function () {
	var cells = this.availableCells();
	if (cells.length === 0) {
		return null;
	}
	return cells[Math.floor(Math.random() * cells.length)];
};

Grid.prototype.withinBounds = function (position) {
	return position.x >= 0 && position.x < this.size &&
		position.y >= 0 && position.y < this.size;
};

Grid.prototype.cellContent = function (position) {
	if (!this.withinBounds(position)) {
		return null;
	}
	return this.cells[position.x][position.y];
};

Grid.prototype.cellAvailable = function (position) {
	return !this.cellContent(position);
};

Grid.prototype.insertTile = function (tile) {
	this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
	this.cells[tile.x][tile.y] = null;
};

var Actuator = function () {
	this.gridContainer = $("#grid-container");
	this.tileContainer = $("#tile-container");
	this.scoreValue = $("#score-value");
	this.bestValue = $("#best-value");
	this.gameMessage = $("#game-message");
	this.gameMessageText = $("#game-message-text");

	this.buildGridCells();
};

Actuator.prototype.buildGridCells = function () {
	for (var x = 0; x < GRID_SIZE; x++) {
		for (var y = 0; y < GRID_SIZE; y++) {
			var cell = $('<div class="grid-cell"></div>');
			this.applyPosition(cell, { x: x, y: y });
			this.gridContainer.append(cell);
		}
	}
};

Actuator.prototype.cellPercent = function () {
	var gap = 2.5;
	return (100 - (GRID_SIZE - 1) * gap) / GRID_SIZE;
};

Actuator.prototype.applyPosition = function (element, position) {
	var gap = 2.5;
	var cell = this.cellPercent();
	element.css({
		left: position.x * (cell + gap) + "%",
		top: position.y * (cell + gap) + "%",
		width: cell + "%",
		height: cell + "%"
	});
};

Actuator.prototype.actuate = function (grid, metadata) {
	var self = this;

	window.requestAnimationFrame(function () {
		self.tileContainer.empty();

		grid.eachCell(function (x, y, tile) {
			if (tile) {
				self.addTile(tile);
			}
		});

		self.scoreValue.text(metadata.score);
		self.bestValue.text(metadata.bestScore);

		if (metadata.over) {
			self.showMessage("Game over!");
		} else if (metadata.won) {
			self.showMessage("You win!");
		} else {
			self.clearMessage();
		}
	});
};

Actuator.prototype.addTile = function (tile) {
	var self = this;
	var valueClass = tile.value > 2048 ? "tile-super" : "tile-" + tile.value;
	var element = $('<div class="tile ' + valueClass + '"></div>').text(tile.value);
	var position = tile.previousPosition || { x: tile.x, y: tile.y };

	this.applyPosition(element, position);
	this.tileContainer.append(element);

	if (tile.previousPosition) {
		window.requestAnimationFrame(function () {
			self.applyPosition(element, { x: tile.x, y: tile.y });
		});
	} else if (tile.mergedFrom) {
		element.addClass("tile-merged");
		tile.mergedFrom.forEach(function (merged) {
			self.addTile(merged);
		});
	} else {
		element.addClass("tile-new");
	}
};

Actuator.prototype.showMessage = function (text) {
	this.gameMessageText.text(text);
	this.gameMessage.addClass("shown");
};

Actuator.prototype.clearMessage = function () {
	this.gameMessage.removeClass("shown");
};

var GameManager = function () {
	this.actuator = new Actuator();
	this.bestScore = parseInt(localStorage.getItem(BEST_SCORE_KEY), 10) || 0;

	this.setup();
	this.bindEvents();
};

GameManager.prototype.bindEvents = function () {
	var self = this;

	$(document).on("keydown", function (e) {
		var direction = KeyDirectionMap[e.keyCode];
		if (direction !== undefined) {
			e.preventDefault();
			self.move(direction);
		}
	});

	$("#restart-button, #retry-button").on("click", function (e) {
		e.preventDefault();
		self.setup();
	});
};

GameManager.prototype.setup = function () {
	this.grid = new Grid(GRID_SIZE);
	this.score = 0;
	this.over = false;
	this.won = false;

	this.addStartTiles();
	this.actuate();
};

GameManager.prototype.addStartTiles = function () {
	for (var i = 0; i < START_TILES; i++) {
		this.addRandomTile();
	}
};

GameManager.prototype.addRandomTile = function () {
	var cell = this.grid.randomAvailableCell();
	if (!cell) {
		return;
	}
	var value = Math.random() < 0.9 ? 2 : 4;
	this.grid.insertTile(new Tile(cell, value));
};

GameManager.prototype.actuate = function () {
	if (this.score > this.bestScore) {
		this.bestScore = this.score;
		localStorage.setItem(BEST_SCORE_KEY, this.bestScore);
	}

	this.actuator.actuate(this.grid, {
		score: this.score,
		bestScore: this.bestScore,
		over: this.over,
		won: this.won
	});
};

GameManager.prototype.getVector = function (direction) {
	var vectors = {
		0: { x: 0, y: -1 }, // up
		1: { x: 1, y: 0 },  // right
		2: { x: 0, y: 1 },  // down
		3: { x: -1, y: 0 }  // left
	};
	return vectors[direction];
};

GameManager.prototype.buildTraversals = function (vector) {
	var traversals = { x: [], y: [] };

	for (var pos = 0; pos < this.grid.size; pos++) {
		traversals.x.push(pos);
		traversals.y.push(pos);
	}

	if (vector.x === 1) {
		traversals.x = traversals.x.reverse();
	}
	if (vector.y === 1) {
		traversals.y = traversals.y.reverse();
	}

	return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
	var previous;

	do {
		previous = cell;
		cell = { x: previous.x + vector.x, y: previous.y + vector.y };
	} while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

	return {
		farthest: previous,
		next: cell
	};
};

GameManager.prototype.positionsEqual = function (first, second) {
	return first.x === second.x && first.y === second.y;
};

GameManager.prototype.tileMatchesAvailable = function () {
	var self = this;
	var matchFound = false;

	this.grid.eachCell(function (x, y, tile) {
		if (matchFound || !tile) {
			return;
		}

		for (var direction = 0; direction < 4; direction++) {
			var vector = self.getVector(direction);
			var neighbour = self.grid.cellContent({ x: x + vector.x, y: y + vector.y });

			if (neighbour && neighbour.value === tile.value) {
				matchFound = true;
				return;
			}
		}
	});

	return matchFound;
};

GameManager.prototype.movesAvailable = function () {
	return this.grid.availableCells().length > 0 || this.tileMatchesAvailable();
};

GameManager.prototype.move = function (direction) {
	if (this.over) {
		return;
	}

	var self = this;
	var vector = this.getVector(direction);
	var traversals = this.buildTraversals(vector);
	var moved = false;

	this.grid.eachCell(function (x, y, tile) {
		if (tile) {
			tile.mergedFrom = null;
			tile.savePosition();
		}
	});

	traversals.x.forEach(function (x) {
		traversals.y.forEach(function (y) {
			var cell = { x: x, y: y };
			var tile = self.grid.cellContent(cell);

			if (!tile) {
				return;
			}

			var positions = self.findFarthestPosition(cell, vector);
			var next = self.grid.cellContent(positions.next);

			if (next && next.value === tile.value && !next.mergedFrom) {
				var merged = new Tile(positions.next, tile.value * 2);
				merged.mergedFrom = [tile, next];

				self.grid.insertTile(merged);
				self.grid.removeTile(tile);

				tile.updatePosition(positions.next);

				self.score += merged.value;

				if (merged.value === 2048) {
					self.won = true;
				}

				moved = true;
			} else if (!self.positionsEqual(cell, positions.farthest)) {
				self.grid.removeTile(tile);
				tile.updatePosition(positions.farthest);
				self.grid.insertTile(tile);

				moved = true;
			}
		});
	});

	if (moved) {
		this.addRandomTile();

		if (!this.movesAvailable()) {
			this.over = true;
		}

		this.actuate();
	}
};

$(function () {
	new GameManager();
});