"use strict";

const R      = require("ramda");
const facies = require("facies");

const {Response}            = require("./response");
const {scan}                = require("./di");
const {scaffold}            = require("./utils");
const {scaffoldMiddlewares} = require("./middleware");

/**
 * A route descriptor.
 * @typedef {Object} RouteDescriptor
 *
 * @property {String}                                   method        - The route HTTP method to handle.
 * @property {String}                                   path          - The route path pattern to handle.
 * @property {Array<(Function | MiddlewareDescriptor)>} [middlewares] - The middlewares to call on the route.
 * @property {Function}                                 handle        - The functor to call on incoming requests.
 */

/**
 * The base class for all routes.
 * @private
 */
const AbstractRoute = class AbstractRoute {
	/**
	 * Handles an incoming request.
	 */
	handle() {}
};

/**
 * Default status code class.
 * @private
 */
const DefaultRoute = R.memoize(function DefaultRoute(statusCode) {
	return class DefaultRoute extends AbstractRoute {
		/**
		 * Handles an incoming request.
		 * @private
		 *
		 * @returns {Response} A response matching the status code.
		 */
		handle() {
			return new Response(statusCode);
		}
	};
});

/**
 * The base class for all routes.
 *
 * @param {String} method                                  - The route method to handle.
 * @param {String} path                                    - The route path pattern to handle.
 * @param {...(Function|MiddlewareDescriptor)} middlewares - The route specific middlewares.
 *
 * @throws {TypeError} Whenever the method is not a string.
 * @throws {TypeError} Whenever the path is not a string.
 * @throws {TypeError} Whenever a value is not a valid descriptor or does not extend the Middleware base class.
 */
const Route = R.memoize(function Route(method, path, ...middlewares) {
	facies.match([
		method,
		path,
	], [
		new facies.TypeDefinition(String),
		new facies.TypeDefinition(String),
	]);

	const _middlewares = Array.from(scaffoldMiddlewares(middlewares));

	return class Route extends AbstractRoute {
		/**
		 * The method to serve with this route.
		 * @private
		 *
		 * @returns {String} The method to serve with this route.
		 */
		static get method() {
			return method;
		}

		/**
		 * The path to serve with this route.
		 * @private
		 *
		 * @returns {String} The path to serve with this route.
		 */
		static get path() {
			return path;
		}

		/**
		 * The list of middlewares to apply on this route.
		 * @private
		 *
		 * @returns {Array<Function>} The middlewares to apply on this route.
		 */
		static get middlewares() {
			return Array.from(_middlewares);
		}
	};
});

/**
 * Generates a new route class from a route descriptor.
 * @private
 *
 * @param {RouteDescriptor} descriptor - The descriptor to generate the route class from.
 *
 * @returns {Function}  The generated route class.
 * @throws  {TypeError} Whenever a route middleware descriptor is not valid.
 */
const descriptorToClass = function descriptorToClass(descriptor) {
	const handle      = scan(descriptor.handle);
	const middlewares = descriptor.middlewares || [];

	const scaffolded = class extends Route(descriptor.method, descriptor.path, ...middlewares) {
		/**
		 * Handles an incoming request.
		 *
		 * @param {...*} values - The values to pass to the descriptor handle function.
		 *
		 * @returns {*} The value of the descriptor handle function.
		 */
		handle(...values) {
			return Reflect.apply(handle.functor, this, values);
		}
	};

	scaffolded.prototype.handle.$inject   = handle.params;
	scaffolded.prototype.handle.$defaults = handle.defaults;
	return scaffolded;
};

/**
 * Scaffolds a list of route classes or descriptors.
 * @private
 *
 * @param {Array<(Function | RouteDescriptor)>} routes - The routes to scaffold.
 *
 * @returns {Array<Function>} The routes with descriptors scaffolded.
 * @throws  {TypeError}       Whenever a route value is not a valid descriptor or does not extend the Route class.
 */
const scaffoldRoutes = function scaffoldRoutes(routes) {
	return scaffold(routes, AbstractRoute, descriptorToClass, {
		method:      String,
		path:        String,
		middlewares: [undefined, Array],
		handle:      Function,
	});
};

module.exports = {
	DefaultRoute,
	Route,
	scaffoldRoutes,
};
