"use strict";

const R             = require("ramda");
const facies        = require("facies");
const isPlainObject = require("is-plain-obj");

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

/**
 * Checks if a type extends a parent type.
 * @private
 *
 * @param {Function} type   - The type to check.
 * @param {Function} parent - The parent type to check for extension.
 *
 * @returns {Boolean} Whether the type extends the parent type.
 */
const inherits = function inherits(type, parent) {
	for (let current = type; current; current = Object.getPrototypeOf(current)) {
		if (current === parent) {
			return true;
		}
	}
	return false;
};

/**
 * Scaffolds a list of classes or descriptors.
 * @private
 *
 * @param {Array<(Function | *)>} values     - The values to scaffold.
 * @param {Function}              base       - The scaffolded hierarchy base type.
 * @param {Function}              scaffolder - The scaffolder function to call on descriptors.
 * @param {Object}                descriptor - The descriptor to typematch.
 *
 * @returns {Array<Function>} The values with plain object descriptors scaffolded.
 * @throws  {TypeError}       Whenever a value is not a valid descriptor or does not extend the base class.
 */
const scaffold = function scaffold(values, base, scaffolder, descriptor) {
	const _values = facies.match(values, R.repeat(new facies.TypeDefinition([Function, descriptor]), values.length));

	return _values.map((value) => {
		if (isPlainObject(value)) {
			return scaffolder(value);
		}

		if (!inherits(value, base)) {
			throw new TypeError(`invalid type: ${value.name}`);
		}
		return value;
	});
};

module.exports = {
	arrayify,
	scaffold,
};
