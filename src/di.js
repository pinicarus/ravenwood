"use strict";

const facies   = require("facies");
const piquouze = require("piquouze");

/**
 * A functor scanning result.
 * @private
 * @typedef {Object} DIReflect
 *
 * @property {Function}                 functor  - The scanned functor.
 * @property {Array<String>}            params   - The functor parameters names.
 * @property {Object<String, Function>} defaults - The functor parameters default values constructors.
 */

/**
 * Scans a functor for parameters and defaults.
 * @private
 *
 * @param {Function} functor - The functor to inject.
 *
 * @returns {DIReflect} The scanned functor, parameters and defaults.
 */
const scan = function scan(functor) {
	const scanner = new piquouze.Scanner(functor);

	return {
		functor,
		params:   scanner.params,
		defaults: scanner.defaults,
	};
};

module.exports = {scan};
