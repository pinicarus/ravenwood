"use strict";

const facies = require("facies");

/**
 * Storage for internal properties of Value instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A store for a DI injectable value.
 */
const Value = class Value {
	/**
	 * Constructs a new injectable value storage.
	 *
	 * @param {String} name  - The name to register the value with.
	 * @param {*}      value - The value to register.
	 *
	 * @throws {TypeError} Whenever the name is not a string.
	 */
	constructor(name, value) {
		facies.match(arguments, [new facies.TypeDefinition(String)], false);

		properties.set(this, {
			name,
			value,
		});
	}

	/**
	 * Returns the name to register the value with.
	 *
	 * @returns {String} - The name to register the value with.
	 */
	get name() {
		return properties.get(this).name;
	}

	/**
	 * Returns the value to register.
	 *
	 * @returns {*} - The value to register.
	 */
	get value() {
		return properties.get(this).value;
	}
};

module.exports = {Value};
