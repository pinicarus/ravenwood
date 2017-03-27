"use strict";

const facies   = require("facies");
const piquouze = require("piquouze");

/**
 * Storage for internal properties of Factory instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A store for a DI injectable factory.
 */
const Factory = class Factory {
	/**
	 * Constructs a new injectable factory storage.
	 *
	 * @param {String}          [name]   - The name to register the factory with.
	 * @param {Function}        factory  - The factory to register.
	 * @param {piquouze.Policy} [policy] - The caching policy to register the factory with.
	 *
	 * @throws {TypeError} Whenever no name was given and none could be inferred.
	 * @throws {TypeError} Whenever the factory is not a Function.
	 * @throws {TypeError} Whenever the policy does not inherit from piquouze.Policy.
	 */
	constructor(name, factory, policy) {
		let [
			_name,
			_factory,
			_policy,
		] = facies.match(arguments, [
			new facies.TypeDefinition(String, null),
			new facies.TypeDefinition(Function),
			new facies.TypeDefinition(piquouze.Policy, null),
		], true);

		properties.set(this, {
			name:   _name || new piquouze.Scanner(_factory).name,
			value:  _factory,
			policy: _policy,
		});
	}

	/**
	 * Returns the name to register the factory with.
	 *
	 * @returns {String} - The name to register the factory with.
	 */
	get name() {
		return properties.get(this).name;
	}

	/**
	 * Returns the factory to register.
	 *
	 * @returns {Function} - The factory to register.
	 */
	get value() {
		return properties.get(this).value;
	}

	/**
	 * Returns the caching policy to register the factory with.
	 *
	 * @returns {piquouze.Policy} - The caching policy to register the factory with.
	 */
	get policy() {
		return properties.get(this).policy;
	}
};

module.exports = {Factory};
