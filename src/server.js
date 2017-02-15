"use strict";

const http   = require("http");
const https  = require("https");
const url    = require("url");

const P        = require("bluebird");
const R        = require("ramda");
const Topo     = require("topo");
const Trie     = require("route-trie");
const facies   = require("facies");
const piquouze = require("piquouze");

const {Body}     = require("./body");
const {arrayify} = require("./utils");
const {run}      = require("./pipeline");

const {
	always,
	scaffoldMiddlewares,
} = require("./middleware");

const {
	DefaultRoute,
	scaffoldRoutes,
} = require("./route");

const {
	Headers,
	normalize,
} = require("./headers");

const {
	Request,
	fixPath,
	setParams,
} = require("./request");

const {
	MissingResponse,
	Response,
} = require("./response");

const {
	httpVersionNotSupported,
	internalServerError,
	methodNotAllowed,
	movedPermanently,
	notFound,
	notImplemented,
} = require("./status");

/**
 * Server options.
 * @typedef {Object} ServerOptions
 *
 * @property {Object}  [network={}]                       - Network options.
 * @property {Boolean} [network.keepAlive=false]          - Whether to allow server-side keep-alive connections.
 * @property {Object}  [network.tls={}]                   - The TLS options to use (see the `tls' module for more).
 * @property {Object}  [routing={}]                       - Routing options.
 * @property {Boolean} [routing.ignoreCase=true]          - Whether routing should ignore case.
 * @property {Boolean} [routing.ignoreMultiSlash=true]    - Whether routing should ignore multiple consecutive slashes.
 * @property {Boolean} [routing.ignoreTrailingSlash=true] - Whether routing should ignore trailing slashes.
 * @property {Boolean} [routing.internalRedirect=true]    - Whether malformed paths should be internally redirected.
 */

/**
 * A listening server address
 * @typedef {Object} ServerAddress
 *
 * @property {String} address - The network address the server is listening to.
 * @property {String} family  - The network family the listened address belongs to.
 * @property {Number} port    - The port the server is listening to.
 */

/**
 * Appends middlewares into an existing middlewares set.
 * @private
 *
 * @param {Object<String, Array<Function>>} set         - The middlewares set to add to.
 * @param {Array<String>}                   types       - The allowed middleware types.
 * @param {Array<Function>}                 middlewares - The middlewares to add.
 *
 * @returns {Object<String, Array<Function>>} The middlewares set with the middlewares added.
 * @throws  {RangeError}                      Whenever a middleware is not of an allowed type.
 */
const append = function append(set, types, middlewares) {
	middlewares.forEach((middleware) => {
		const type = middleware.type;

		if (!R.contains(type, types)) {
			throw new RangeError(`unknown middleware type: ${type}`);
		}

		let values = set[type];

		if (!values) {
			values = set[type] = [];
		}
		values.push(middleware);
	});
	return set;
};

/**
 * Prepares a route for serving requests.
 * @private
 *
 * @param {Object}   properties - Server properties to prepare the route with.
 * @param {Function} route      - The route class to prepare.
 *
 * @returns {Function} The route handler ready for serving requests.
 */
const prepare = function prepare(properties, route) {
	const stages           = properties.pipeline.nodes;
	const routeMiddlewares = append({}, stages, route.middlewares || []);
	const middlewares      = R.mergeWith(R.concat, properties.middlewares, routeMiddlewares);

	const pipeline = stages.reduce((data, stage) => {
		const datum = middlewares[stage];

		if (!datum) {
			return data;
		}
		return data.concat(datum);
	}, properties.always);

	return (container, mapping) => run(container, mapping, pipeline, route);
};

/**
 * Prepares handlers for default conditions.
 * @private
 *
 * @param {Object} properties - Server properties to prepare the handlers with.
 *
 * @returns {Object<String, Function>} The handlers for handling default conditions.
 */
const prepareDefaults = function prepareDefaults(properties) {
	return R.map((statusCode) => prepare(properties, DefaultRoute(statusCode)), {
		movedPermanently,
		methodNotAllowed,
		notFound,
	});
};

/**
 * Converts an error into a response.
 * @private
 *
 * @param {Error} error - The error to convert.
 *
 * @returns {Response} The response for the matching error.
 */
const convert = R.cond([
	[R.is(MissingResponse), ()      => new Response(notImplemented)],
	[R.T,                   (error) => new Response(internalServerError, error.message.split(/[\r\n]/, 1)[0])],
]);

/**
 * Creates a function to respond to a downstream pending request.
 * @private
 *
 * @param {http.ServerResponse} downstream - The downstream to respond to.
 * @param {Number}              version    - The HTTP version to respond with.
 * @param {Object}              options    - Network options to use when sending.
 *
 * @returns {Function} The function to respond to the downstream request.
 */
const responder = function responder(downstream, version, options) {
	return (response) => P.fromCallback((callback) => {
		let _response = response;

		const trailers = _response.trailers;
		if (!R.isEmpty(trailers)) {
			if (version >= 1.1) {
				downstream.addTrailers(trailers);
			} else {
				_response = new Response(httpVersionNotSupported);
			}
		}

		R.forEachObjIndexed((values, name) => downstream.setHeader(name, values), _response.headers);
		downstream.setHeader(normalize("connection"), options.keepAlive ? "keep-alive" : "close");

		downstream.writeHead(_response.statusCode, _response.statusMessage);

		const body = _response.body;
		if (!body) {
			downstream.end(() => callback(null));
		} else {
			downstream.on("finish", () => callback(null));
			body.pipe(downstream, {end: true});
		}
	});
};

/**
 * Storage for the internal properties of Server instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * Handles an HTTP request.
 * @private
 *
 * @param {Server}                   server   - The server to handle the request with.
 * @param {Request}                  request  - The incoming request.
 * @param {Object<String, Function>} defaults - Handlers for default conditions.
 *
 * @returns {Promise<Response>} The outgoing response.
 */
const handle = function handle(server, request, defaults) {
	const check = (response) => {
		if (!(response instanceof Response)) {
			throw new MissingResponse();
		}
	};

	return P.try(() => {
		const props   = properties.get(server);
		const mapping = props.mapping;

		const container = props.container.createChild();
		container.registerValue(mapping("request"), request);

		const {router, routing} = props;
		let   path              = request.path;
		let   match             = router.match(path);
		if (!match.node) {
			path = match.fpr || match.tsr;
			if (path) {
				fixPath(request, path);
				if (!routing.internalRedirect) {
					return defaults.movedPermanently(container, mapping)
						.then((response) => response.setHeader("location", path));
				}
				match = router.match(path);
			}
		}

		const {node, params} = match;
		setParams(request, params);
		if (!node) {
			return defaults.notFound(container, mapping);
		}
		container.registerValue(mapping("allowed"), node.getAllow());

		const route = node.getHandler(request.method);
		return route ? route.handle(container, mapping): defaults.methodNotAllowed(container, mapping);
	}).tap(check).catch(server.catch.bind(server)).tap(check).catch(convert);
};

/**
 * An HTTP server designed to expose a consistent request handling pipeline with plugin-oriented hooks.
 */
const Server = class Server {
	/**
	 * Constructs a new server.
	 *
	 * @param {piquouze.Container} [container] - The DI container used to inject middlewares and routes.
	 * @param {ServerOptions}      [options]   - The server options.
	 * @param {Function}           [mapping]   - The mapping of names to the DI container.
	 *
	 * @throws {TypeError} Whenever the DI container is not an object.
	 * @throws {TypeError} Whenever the options are not a valid object.
	 */
	constructor(container, options, mapping) {
		const [
			_container,
			_options,
			_mapping,
		] = facies.match(arguments, [
			new facies.TypeDefinition(piquouze.Container, new piquouze.Container()),
			new facies.TypeDefinition({
				network: [undefined, {
					keepAlive: [undefined, Boolean],
					tls:       [undefined, {}],
				}],
				routing: [undefined, {
					ignoreCase:          [undefined, Boolean],
					ignoreMultiSlash:    [undefined, Boolean],
					ignoreTrailingSlash: [undefined, Boolean],
					internalRedirect:    [undefined, Boolean],
				}],
			}, {}),
			new facies.TypeDefinition(Function, R.identity),
		], true);

		const {
			network = {},
			routing = {},
		} = _options;

		properties.set(this, {
			container:   _container,
			always:      [],
			mapping:     R.either(_mapping, R.identity),
			middlewares: {},
			pipeline:    new Topo(),
			server:      null,

			network: {
				keepAlive: R.defaultTo(false, network.keepAlive),
				tls:       R.defaultTo({},    network.tls),
			},

			router: new Trie({
				ignoreCase:            R.defaultTo(true, routing.ignoreCase),
				fixedPathRedirect:     R.defaultTo(true, routing.ignoreMultiSlash),
				trailingSlashRedirect: R.defaultTo(true, routing.ignoreTrailingSlash),
			}),

			routing: {
				internalRedirect: R.defaultTo(true, routing.internalRedirect),
			},
		});
	}

	/**
	 * Sets a full pipeline.
	 *
	 * @param {...String} stages - The ordered list of pipeline stages.
	 *
	 * @returns {Server}    The server with the pipeline set.
	 * @throws  {TypeError} Whenever a pipeline stage is not a string.
	 */
	setPipeline(...stages) {
		facies.match(stages, R.repeat(new facies.TypeDefinition(String), stages.length));

		const props    = properties.get(this);
		const pipeline = props.pipeline = new Topo();

		stages.forEach((stage, index) => pipeline.add(stage, {
			group:  stage,
			before: stages[index + 1],
			after:  stages[index - 1],
		}));
		return this;
	}

	/**
	 * Adds middlewares to the request handling pipeline.
	 *
	 * @param {...(Function | MiddlewareDescriptor)} middlewares - The middlewares types to add.
	 *
	 * @returns {Server}     The server with the middlewares added.
	 * @throws  {TypeError}  Whenever a value is not a valid descriptor or does not extend the Middleware base class.
	 * @throws  {RangeError} Whenever a middleware type is not defined in the pipeline.
	 */
	addMiddleware(...middlewares) {
		const props = properties.get(this);

		const [
			_always,
			_middlewares,
		] = R.partition((middleware) => middleware.type === always, scaffoldMiddlewares(middlewares));

		props.always.push(..._always);
		append(props.middlewares, props.pipeline.nodes, _middlewares);
		return this;
	}

	/**
	 * Adds routes to the server.
	 *
	 * @param {...(Function | RouteDescriptor)} routes - The routes to add.
	 *
	 * @returns {Server}     The server with the routes added.
	 * @throws  {TypeError}  Whenever a route value is not a valid descriptor or does not extend the Route class.
	 * @throws  {RangeError} Whenever a route middleware type is not defined in the pipeline.
	 */
	addRoute(...routes) {
		const props = properties.get(this);

		scaffoldRoutes(routes).forEach((route) => {
			const node   = props.router.define(route.path);

			node.handle(route.method, {
				handle: prepare(props, route),
			});
		});
		return this;
	}

	/**
	 * Starts listening for requests.
	 *
	 * @param {String} [hostname] - The hostname to bind to.
	 * @param {Number} port       - The port number to listen to.
	 *
	 * @returns {Promise<ServerAddress>} Resolved when the server is listening.
	 * @throws  {TypeError}              Whenever the hostname is not a string.
	 * @throws  {TypeError}              Whenever the port is not a number.
	 * @throws  {RangeError}             Whenever the port is not a strictly positive integer.
	 */
	start(hostname, port) {
		const [
			_hostname,
			_port,
		] = facies.match(arguments, [
			new facies.TypeDefinition(String, "127.0.0.1"),
			new facies.TypeDefinition(Number),
		], true);
		if (_port < 0 || !Number.isInteger(_port)) {
			throw new RangeError(`invalid port number: ${_port}`);
		}

		const props = properties.get(this);

		const defaults = prepareDefaults(props);

		if (props.server !== null) {
			return P.reject(new Error("server already started"));
		}
		return P.fromCallback((callback) => {
			const server = props.server = R.isEmpty(props.network.tls)
				? http.createServer()
				: https.createServer(props.network.tls);

			server.on("request", (req, res) => {
				const resource = url.parse(req.url, true);

				const request = new Request(
					req.method,
					resource.pathname,
					R.map(arrayify, resource.query),
					new Headers().parsePairs(req.rawHeaders),
					new Body(req),
					new Headers().parsePairs(req.rawTrailers));

				const respond = responder(res, parseFloat(req.httpVersion), props.network);

				handle(this, request, defaults).then(respond);
			});
			server.listen(_port, _hostname, () => callback(null, server.address()));
		});
	}

	/**
	 * Injects an HTTP request.
	 *
	 * @param {Request} request    - The incoming request.
	 *
	 * @returns {Promise<Response>} The outgoing response.
	 * @throws  {TypeError}         Whenever the request is invalid.
	 */
	inject(request) {
		facies.match(arguments, [new facies.TypeDefinition(Request)], true);

		const props = properties.get(this);

		return handle(this, request, prepareDefaults(props));
	}

	/**
	 * Catches an error during request processing.
	 *
	 * @param {Error} error - The error to catch.
	 *
	 * @returns {Promise<?Response>} The response to send out.
	 */
	catch(error) {
		return P.try(() => convert(error));
	}

	/**
	 * Stops listening for requests.
	 *
	 * @returns {Promise} Resolved whenever the server is stopped.
	 */
	stop() {
		const props = properties.get(this);

		if (props.server === null) {
			return P.reject(new Error("server already stopped"));
		}
		return P.fromCallback((callback) => {
			const server = props.server;

			props.server = null;
			server.close(() => callback(null));
		});
	}
};

/**
 * Adds a default pipeline to a server.
 *
 * @param {Server} server - The server to set the default pipeline on.
 *
 * @returns {Server} The server with the default pipeline set.
 */
const defaultPipeline = function defaultPipeline(server) {
	return server.setPipeline(
		"incoming",
		"validation",
		"authentication",
		"authorization",
		"general"
	);
};

module.exports = {
	Server,
	defaultPipeline,
};
