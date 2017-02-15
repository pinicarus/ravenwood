"use strict";

const http = require("http");

const facies = require("facies");

const {Body}    = require("./body");
const {Headers} = require("./headers");
const {Message} = require("./message");

/**
 * An error represents the lack of response.
 */
const MissingResponse = class MissingResponse extends Error {
	/**
	 * Constructs a new error for a missing response.
	 */
	constructor() {
		super("missing response");
	}
};

/**
 * Storage for the internal properties of Response instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An HTTP response.
 */
const Response = class Response extends Message {
	/**
	 * Constructs a new HTTP response.
	 *
	 * @param {Number}  statusCode      - The response status code.
	 * @param {String}  [statusMessage] - The response status message.
	 * @param {Headers} [headers]       - The response headers.
	 * @param {Body}    [body]          - The response body.
	 * @param {Headers} [trailers]      - The response trailers.
	 *
	 * @throws {TypeError} Whenever the status code is not a number.
	 * @throws {TypeError} Whenever the status message is not a string.
	 * @throws {TypeError} Whenever the headers does not extend Headers.
	 * @throws {TypeError} Whenever the body does not extend Body.
	 * @throws {TypeError} Whenever the trailers does not extend Headers.
	 */
	constructor(statusCode, statusMessage, headers, body, trailers) {
		const [
			_statusCode,
			_statusMessage,
			_headers,
			_body,
			_trailers,
		] = facies.match(arguments, [
			new facies.TypeDefinition(Number),
			new facies.TypeDefinition(String,  null),
			new facies.TypeDefinition(Headers, new Headers()),
			new facies.TypeDefinition(Body,    null),
			new facies.TypeDefinition(Headers, new Headers()),
		], true);

		super(_headers, _body, _trailers);

		properties.set(this, {
			statusCode:    _statusCode,
			statusMessage: _statusMessage || http.STATUS_CODES[_statusCode],
		});
	}

	/**
	 * Returns the response status code.
	 *
	 * @returns {Number} The response status code.
	 */
	get statusCode() {
		return properties.get(this).statusCode;
	}

	/**
	 * Returns the response status message.
	 *
	 * @returns {String} The response status message.
	 */
	get statusMessage() {
		return properties.get(this).statusMessage;
	}
};

module.exports = {
	MissingResponse,
	Response,
};
