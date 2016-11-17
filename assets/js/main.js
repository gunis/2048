"use strict";

var MOVEMENT_DURATION = 100;
var MovementDirectionMap = {
	LEFT : 37,
	UP : 38,
	RIGHT : 39,
	DOWN : 40
};
var anyKeyPressed = false;

var canNumberBeMoved = function(element, directionKey) {
	var rowIndex = $( "#playground .row" ).index(element.closest('.row'));
	var colIndex = element.closest('.row').find('.cell').index(element.closest('.cell'));

	switch (directionKey) {
		case MovementDirectionMap.LEFT:
			if (0 === colIndex) {
				return false;
			}
			return true;
		break;
		case MovementDirectionMap.UP:
			if (0 === rowIndex) {
				return false;
			}
			return true;
			break;
		case MovementDirectionMap.RIGHT:
			if (3 === colIndex) {
				return false;
			}
			return true;
			break;
		case MovementDirectionMap.DOWN:
			if (3 === rowIndex) {
				return false;
			}
			return true;
			break;
	}
}

var moveNumber = function(element, directionKey) {
	if (canNumberBeMoved(element, directionKey)) {
		var cssMovementAttribute = ((-1 != $.inArray(directionKey, [MovementDirectionMap.LEFT, MovementDirectionMap.RIGHT])) ? 'left' : 'top');
		var sign = ((-1 != $.inArray(directionKey, [MovementDirectionMap.LEFT, MovementDirectionMap.UP])) ? -1 : 1);
		var currentNumberValue = parseInt(element.css(cssMovementAttribute));
		var value = sign * Math.floor(element.outerWidth(true));
		var movementObject = {};
		var rowIndex = $( "#playground .row" ).index(element.closest('.row'));
		var colIndex = element.closest('.row').find('.cell').index(element.closest('.cell'));

		switch (directionKey) {
			case MovementDirectionMap.LEFT:
				colIndex--;
			break;
			case MovementDirectionMap.UP:
				rowIndex--;
				break;
			case MovementDirectionMap.RIGHT:
				colIndex++;
				break;
			case MovementDirectionMap.DOWN:
				rowIndex++;
				break;
		}

		movementObject[cssMovementAttribute] = (currentNumberValue + value) + 'px';
		element
			.css({
				opacity : .5
			})
			.animate(
					movementObject,
					MOVEMENT_DURATION,
					function() {
						anyKeyPressed = false;
						element.css({
							left : 0,
							opacity : 1,
							top : 0
						});
						element.detach().appendTo('#playground .row:eq('+rowIndex+') .cell:eq('+colIndex+') div');
					}
			);
	}
	else {
		anyKeyPressed = false;
	}
}

$(function ($) {
	var currentNumber = $('#testing-number');
	$(document).keydown(function(e) {
	

		if (-1 != $.inArray(e.keyCode, $.map(MovementDirectionMap, function(v){ return v; }))) {
			e.preventDefault();
		
			if (!anyKeyPressed) {
				anyKeyPressed = true;
				moveNumber(currentNumber, e.keyCode);
			}
		}
	});
});