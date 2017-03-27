"use strict";

const R = require("ramda");

const facies = require("facies");

const {Body}    = require("./body");
const {Headers} = require("./headers");
const {Message} = require("./message");

/**
 * Storage for the internal properties of Request instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An HTTP request.
 */
const Request = class Request extends Message {
	/**
	 * Constructs a new request.
	 *
	 * @param{String}                 method     - The request method.
	 * @param{String}                 path       - The request path.
	 * @param{Object<String, String>} [query]    - The request query key/value pairs.
	 * @param{Headers}                [headers]  - The request headers.
	 * @param{Body}                   [body]     - The request body.
	 * @param{Headers}                [trailers] - The request trailing headers.
	 *
	 * @throws {TypeError} Whenever the headers does not extend Headers.
	 * @throws {TypeError} Whenever the body does not extend Body.
	 * @throws {TypeError} Whenever the trailers does not extend Headers.
	 */
	constructor(method, path, query, headers, body, trailers) {
		const [
			_method,
			_path,
			_query,
			_headers,
			_body,
			_trailers,
		] = facies.match(arguments, [
			new facies.TypeDefinition(String),
			new facies.TypeDefinition(String),
			new facies.TypeDefinition({}, {}),
			new facies.TypeDefinition(Headers, new Headers()),
			new facies.TypeDefinition(Body,    new Body(Buffer.alloc(0))),
			new facies.TypeDefinition(Headers, new Headers()),
		], true);

		super(_headers, _body, _trailers);

		properties.set(this, {
			method: _method.toUpperCase(),
			path:   _path,
			query:  _query,
		});
	}

	/**
	 * Returns the request HTTP method.
	 *
	 * @returns {String} The HTTP method.
	 */
	get method() {
		return properties.get(this).method;
	}

	/**
	 * Returns the request path.
	 *
	 * @returns {String} The request path.
	 */
	get path() {
		return properties.get(this).path;
	}

	/**
	 * Returns the request path parameters.
	 *
	 * @returns {Object<String, String>} The request path parameters.
	 */
	get params() {
		const params = properties.get(this).params;

		return params ? R.clone(params) : {};
	}

	/**
	 * Returns the request query parameters.
	 *
	 * @returns {Object<String, String>} The request query parameters.
	 */
	get query() {
		return R.clone(properties.get(this).query);
	}
};

/**
 * Fixes a request path during routing.
 * @private
 *
 * @param {Request} request - The request to fix the path of.
 * @param {String}  path    - The path to fix the request with.
 */
const fixPath = function fixPath(request, path) {
	properties.get(request).path = path;
};

/**
 * Sets the request path parameters during routing.
 * @private
 *
 * @param {Request}                request - The request to fix the path of.
 * @param {Object<String, String>} params  - The request path parameters.
 */
const setParams = function setParams(request, params) {
	properties.get(request).params = R.clone(params);
};

module.exports = {
	Request,
	fixPath,
	setParams,
};
