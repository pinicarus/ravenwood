"use strict";

const R        = require("ramda");
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
 * Storage for internal properties of DI instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A store for DI injectable values.
 */
const DI = class DI {
	/**
	 * Constructs a new injectable values storage.
	 */
	constructor() {
		properties.set(this, {
			values:    {},
			factories: {},
		});
	}

	/**
	 * Stores a value for registration.
	 *
	 * @param {String} name  - The name to register the value with.
	 * @param {*}      value - The value to register.
	 *
	 * @returns {DI}        The DI storage with the value added for registration.
	 * @throws  {TypeError} Whenever the name is not a string.
	 */
	registerValue(name, value) {
		facies.match(arguments, [new facies.TypeDefinition(String)], false);

		properties.get(this).values[name] = value;
		return this;
	}

	/**
	 * Stores a factory for registration.
	 *
	 * @param {String}   [name]   - The name to register the factory with.
	 * @param {Function} factory  - The factory to register.
	 * @param {Policy}   [policy] - The caching policy to register the factory with..
	 *
	 * @returns {DI}        The DI storage with the value added for registration.
	 * @throws {TypeError} Whenever no name was given and none could be inferred.
	 * @throws {TypeError} Whenever the factory is not a Function.
	 * @throws {TypeError} Whenever the policy does not inherit from piquouze.Policy.
	 */
	registerFactory(name, factory, policy) {
		const [
			_name,
			_factory,
			_policy,
		] = facies.match(arguments, [
			new facies.TypeDefinition(String, null),
			new facies.TypeDefinition(Function),
			new facies.TypeDefinition(piquouze.Policy, null),
		]);

		const props = properties.get(this);

		props.factories[_name || new piquouze.Scanner(_factory).name] = {
			value:  _factory,
			policy: _policy,
		};
		return this;
	}
};

/**
 * Transfers values stored from a DI instance in a container.
 * @private
 *
 * @param {DI}                 di        - The DI to transfer values from.
 * @param {piquouze.Container} container - The container to transfer values to.
 * @param {Function}           mapping   - The mapping of names to the DI container.
 */
const transfer = function transfer(di, container, mapping) {
	const props = properties.get(di);

	R.forEachObjIndexed((value, name) => container.registerValue(mapping(name), value), props.values);
	R.forEachObjIndexed(({value, policy}, name) => {
		const _name = mapping(name);

		if (policy) {
			container.registerFactory(_name, value, policy);
		} else {
			container.registerFactory(_name, value);
		}
	}, props.factories);
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
	DI,
	transfer,
	scan,
};
