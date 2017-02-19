"use strict";

const stream = require("stream");

const facies = require("facies");

/**
 * A readable stream to a buffer or stream body.
 */
const Body = class Body extends stream.PassThrough {
	/**
	 * Constructs a new stream.
	 *
	 * @param {(Buffer | stream.Readable)} source - The downstream data source.
	 */
	constructor(source) {
		facies.match(arguments, [new facies.TypeDefinition([Buffer, stream.Readable])], true);

		super();

		if (Buffer.isBuffer(source)) {
			this.end(source);
		} else {
			source.pipe(this);
		}
	}
};

module.exports = {Body};
