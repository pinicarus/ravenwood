"use strict";

const R         = require("ramda");
const facies    = require("facies");
const normalize = require("titlecase");

const {arrayify} = require("./utils");

/**
 * Concatenates arrays and removes duplicates.
 * @private
 *
 * @param {Array} first  - The first array.
 * @param {Array} second - The second array.
 *
 * @returns {Array} The concatenated array with duplicates removed.
 */
const concatUniq = R.pipe(R.concat, R.uniq);

/**
 * Storage for the internal properties of Headers instances.
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A set of request or response headers
 * @private
 */
const Headers = class Headers {
	/**
	 * Constructs a new empty headers set.
	 */
	constructor() {
		properties.set(this, {});
	}

	/**
	 * Imports anothers headers set into the headers set.
	 *
	 * @param {Headers} headers - The headers set to import.
	 *
	 * @returns {Headers}   The headers set with the other headers set imported.
	 * @throws  {TypeError} Whenever the value is not a headers set.
	 */
	import(headers) {
		facies.match(arguments, [new facies.TypeDefinition(Headers)], true);

		properties.set(this, R.mergeWith(concatUniq, properties.get(this), properties.get(headers)));
		return this;
	}

	/**
	 * Gets the headers in the set name and values.
	 *
	 * @param {String} [name] - The header name to get.
	 *
	 * @returns {(Array<String> | Object<String, Array<String>>)} The header values.
	 * @throws  {TypeError}                                       Whenever name is not a string.
	 */
	get(name) {
		const [_name] = facies.match(arguments, [new facies.TypeDefinition(String, null)], true);

		const props = properties.get(this);

		if (_name) {
			return Array.from(props[normalize(_name)] || []);
		}
		return R.map(Array.from, props);
	}

	/**
	 * Adds a header value to the headers set.
	 *
	 * @param {String}                   name  - The header name.
	 * @param {(Array<String> | String)} value - The header value(s).
	 *
	 * @returns {Headers}   The headers set with the header value(s) added.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string or array of strings.
	 */
	add(name, value) {
		facies.match(arguments, [
			new facies.TypeDefinition(String),
			new facies.TypeDefinition([Array, String]),
		], true);

		const values = arrayify(value);
		facies.match(values, R.repeat(new facies.TypeDefinition(String), values.length));

		const props      = properties.get(this);
		const normalized = normalize(name);

		props[normalized] = (props[normalized] || []).concat(values);
		return this;
	}

	/**
	 * Sets a header value into the headers set.
	 *
	 * @param {String}                   name  - The header name.
	 * @param {(Array<String> | String)} value - The header value(s).
	 *
	 * @returns {Headers}   The headers set with the header value(s) set.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 * @throws  {TypeError} Whenever the header value is not a string or array of strings.
	 */
	set(name, value) {
		facies.match(arguments, [
			new facies.TypeDefinition(String),
			new facies.TypeDefinition([Array, String]),
		], true);

		const values = arrayify(value);
		facies.match(values, R.repeat(new facies.TypeDefinition(String), values.length));

		properties.get(this)[normalize(name)] = values;
		return this;
	}

	/**
	 * Unsets a header from the headers set.
	 *
	 * @param {String} name  - The header name.
	 *
	 * @returns {Headers}   The headers set with the header value removed.
	 * @throws  {TypeError} Whenever the header name is not a string.
	 */
	unset(name) {
		facies.match(arguments, [new facies.TypeDefinition(String)], true);

		delete properties.get(this)[normalize(name)];
		return this;
	}

	/**
	 * Parses name/value pairs flattened in an array into the headers set.
	 *
	 * @param {Array<String>} pairs - The key/value pairs to parse.
	 *
	 * @returns {Headers}    The headers set with the headers added.
	 * @throws  {TypeError}  Whenever the pairs are not an array.
	 * @throws  {TypeError}  Whenever a header name is not a string.
	 * @throws  {TypeError}  Whenever a header value is not a string.
	 * @throws  {RangeError} Whenever the pairs are not an even-sized array.
	 */
	parsePairs(pairs) {
		facies.match(arguments, [new facies.TypeDefinition(Array)], true);

		const length = pairs.length;
		if (length & 1 !== 0) {
			throw new RangeError(`invalid length: ${length}`);
		}

		for(let index = 0; index < length; index += 2) {
			this.add(pairs[index], pairs[index + 1]);
		}
		return this;
	}
};

module.exports = {
	Headers,
	normalize,
};
