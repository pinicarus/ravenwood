"use strict";

const R      = require("ramda");
const facies = require("facies");

const {scan}     = require("./di");
const {scaffold} = require("./utils");

/**
 * A middleware descriptor.
 * @typedef {Object} MiddlewareDescriptor
 *
 * @property {String}   [type]  - The type of middleware.
 * @property {Function} [enter] - The functor to call when requests are initially processed.
 * @property {Function} [leave] - The functor to call when responses are finally sent out.
 */

const always = Symbol("always");

/**
 * The base class for all middlewares
 * @private
 */
const AbstractMiddleware = class AbstractMiddleware {
	/**
	 * Takes an action when requests are initially processed.
	 */
	enter() {}

	/**
	 * Takes an action when responses are finally sent out.
	 */
	leave() {}
};

/**
 * The generic base class for all middlewares
 *
 * @param {String} [type] - The middleware type.
 *
 * @throws {TypeError} Whenever the type is not a string.
 */
const Middleware = R.memoize(function Middleware(type) {
	facies.match(arguments, [new facies.TypeDefinition([undefined, String], null)], true);

	return class Middleware extends AbstractMiddleware {
		/**
		 * Returns the middleware type.
		 * @private
		 *
		 * @returns {(String | Symbol)} The middleware type.
		 */
		static get type() {
			return type || always;
		}
	};
});

/**
 * Generates a new middleware class from a middleware descriptor.
 * @private
 *
 * @param {MiddlewareDescriptor} descriptor - The descriptor to generate the middleware class from.
 *
 * @returns {Function} The generated middleware class.
 */
const descriptorToClass = function descriptorToClass(descriptor) {
	const enter = scan(descriptor.enter || R.always(undefined));
	const leave = scan(descriptor.leave || R.always(undefined));

	const scaffolded = class extends Middleware(descriptor.type) {
		/**
		 * Takes an action when requests are initially processed.
		 *
		 * @param {...*} values - The injected values to dispatch to the enter methods.
		 *
		 * @returns {*} The value of the descriptor enter function.
		 */
		enter(...values) {
			return Reflect.apply(enter.functor, this, values);
		}

		/**
		 * Takes an action when responses are finally sent out.
		 *
		 * @param {...*} values - The injected values to dispatch to the leave methods.
		 *
		 * @returns {*} The value of the descriptor leave function.
		 */
		leave(...values) {
			return Reflect.apply(leave.functor, this, values);
		}
	};

	scaffolded.prototype.enter.$inject   = enter.params;
	scaffolded.prototype.enter.$defaults = enter.defaults;
	scaffolded.prototype.leave.$inject   = leave.params;
	scaffolded.prototype.leave.$defaults = leave.defaults;
	return scaffolded;
};

/**
 * Scaffolds a list of middleware classes or descriptors.
 * @private
 *
 * @param {Array<(Function | MiddlewareDescriptor)>} middlewares - The middlewares to scaffold.
 *
 * @returns {Array<Function>} The middlewares with descriptors scaffolded.
 * @throws  {TypeError}       Whenever a value is not a valid descriptor or does not extend AbstractMiddleware.
 */
const scaffoldMiddlewares = function scaffoldMiddlewares(middlewares) {
	return scaffold(middlewares, AbstractMiddleware, descriptorToClass, {
		type:  [undefined, String],
		enter: [undefined, Function],
		leave: [undefined, Function],
	});
};

module.exports = {
	Middleware,
	always,
	scaffoldMiddlewares,
};
