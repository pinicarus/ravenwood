"use strict";

const R = require("ramda");

const {normalize} = require("./headers");

/**
 * Adds a value to a headers set, removing duplicates.
 * @private
 *
 * @param {Headers}                  headers - The headers set to add the value to.
 * @param {String}                   name    - The name of the header value to add.
 * @param {(Array<String> | String)} value   - The value(s) to add.
 *
 * @returns {Headers} The headers set with the value(s) added.
 */
const uniqAdd = function uniqAdd(headers, name, value) {
	const values = headers.get(name);

	return headers.set(name, R.uniq(values.concat(value)));
};

/**
 * Storage for the internal properties of Message instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An abstract HTTP message (request or response).
 * @private
 */
const Message = class Message {
	/**
	 * Constructs a new message.
	 *
	 * @param {Headers} headers  - The response headers.
	 * @param {Body}    [body]   - The message body.
	 * @param {Headers} trailers - The response trailers.
	 */
	constructor(headers, body, trailers) {
		properties.set(this, {
			headers,
			body,
			trailers,
		});
	}

	/**
	 * Returns the message headers.
	 *
	 * @returns {Object<String, Array<String>>} The message headers.
	 */
	get headers() {
		return properties.get(this).headers.get();
	}

	/**
	 * Returns the message body.
	 *
	 * @returns {?Body} The message body.
	 */
	get body() {
		return properties.get(this).body;
	}

	/**
	 * Returns the message trailers.
	 *
	 * @returns {Object<String, Array<String>>} The message trailers.
	 */
	get trailers() {
		return properties.get(this).trailers.get();
	}

	/**
	 * Gets a header values from the message.
	 *
	 * @param {String} name - The header name to get.
	 *
	 * @returns {Array<String>} The header values.
	 * @throws  {TypeError}     Whenever name is not a string.
	 */
	getHeader(name) {
		const props = properties.get(this);

		return props.headers.get(name).concat(props.trailers.get(name));
	}

	/**
	 * Imports another message headers in the message.
	 *
	 * @param {Message} message - The message to import the headers from.
	 *
	 * @returns {Message}   The message with the other message headers imported.
	 * @throws  {TypeError} Whenever the value is not a message.
	 */
	importHeaders(message) {
		const props = properties.get(this);
		const other = properties.get(message);

		props.headers.import(other.headers);
		props.trailers.import(other.trailers);
		return this;
	}

	/**
	 * Adds a header to the message.
	 *
	 * @param {String}                   name  - The header name.
	 * @param {(Array<String> | String)} value - The header value(s).
	 *
	 * @returns {Message}   The message with the header value(s) added.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string.
	 */
	addHeader(name, value) {
		properties.get(this).headers.add(name, value);
		return this;
	}

	/**
	 * Sets a header in the message.
	 *
	 * @param {String}                   name  - The header name.
	 * @param {(Array<String> | String)} value - The header value(s).
	 *
	 * @returns {Message}   The message with the header value(s) set.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string.
	 */
	setHeader(name, value) {
		properties.get(this).headers.set(name, value);
		return this;
	}

	/**
	 * Adds a trailing header to the message.
	 *
	 * @param {String} name  - The header name.
	 * @param {String} value - The header value.
	 *
	 * @returns {Message}   The message with the trailing header value added.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string.
	 */
	addTrailer(name, value) {
		const props = properties.get(this);

		props.trailers.add(name, value);
		uniqAdd(props.headers, "trailer", normalize(name));
		return this;
	}

	/**
	 * Adds a trailing header to the message.
	 *
	 * @param {String} name  - The header name.
	 * @param {String} value - The header value.
	 *
	 * @returns {Message}   The message with the trailing header value added.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string.
	 */
	setTrailer(name, value) {
		const props = properties.get(this);

		props.trailers.set(name, value);
		uniqAdd(props.headers, "trailer", normalize(name));
		return this;
	}

	/**
	 * Unsets a header from the message.
	 *
	 * @param {String} name - The header name.
	 *
	 * @returns {Message}   The message with the header value removed.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 */
	unsetHeader(name) {
		const props = properties.get(this);

		props.headers.unset(name);
		if (props.trailers.get(name).length > 0) {
			const _name  = normalize(name);
			const values = props.headers.get("trailer").filter((value) => value !== _name);

			props.trailers.unset(name);
			if (values.length > 0) {
				props.headers.set("trailer", values);
			} else {
				props.headers.unset("trailer");
			}
		}
		return this;
	}
};

module.exports = {Message};
