"use strict";

/**
 * Turns a value in an array.
 * @private
 *
 * @param {(Array<*> | *)} value - The value to wrap in an array.
 *
 * @returns {Array<*>} The value wrapped in an array.
 */
const arrayify = function arrayify(value) {
	return Array.isArray(value) ? value : [value];
};

module.exports = {arrayify};
