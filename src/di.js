"use strict";

const piquouze = require("piquouze");

const {Factory} = require("./di/factory");
const {Value}   = require("./di/value");

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
 * Transfers values stored from a DI Value or Factory instances in a container.
 * @private
 *
 * @param {(Factory | Value)}  di        - The DI value or factory to transfer.
 * @param {piquouze.Container} container - The container to transfer values to.
 * @param {Function}           mapping   - The mapping of names to the DI container.
 */
const transfer = function transfer(di, container, mapping) {
	const name = mapping(di.name);

	switch (true) {
		case di instanceof Factory:
			if (di.policy) {
				container.registerFactory(name, di.value, di.policy);
			} else {
				container.registerFactory(name, di.value);
			}
			break;
		case di instanceof Value:
			container.registerValue(name, di.value);
			break;
	}
};

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

module.exports = {
	Factory,
	Value,
	transfer,
	scan,
};
