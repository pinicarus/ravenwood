"use strict";

const assert = require("assert");
const fs     = require("fs");
const stream = require("stream");

const P = require("bluebird");

const {Body} = requireSrc("body");

describe("body", function () {
	const pump = (stream) => new P((resolve, reject) => {
		const content = [];

		stream.once("error", reject);
		stream.on("data",    (chunk) => content.push(chunk));
		stream.once("end",   () => resolve(Buffer.concat(content)));
	});

	it("should conform", function () {
		assert(Body instanceof Function);
		assert(new Body(Buffer.alloc(0)) instanceof Body);
		assert(new Body(Buffer.alloc(0)) instanceof stream.Readable);
	});

	it("should stream buffers", function () {
		const source = Buffer.from("foo,bar,baz", "utf8");

		return P.join(pump(new Body(source)), source, assert.deepEqual);
	});

	it("should stream streams", function () {
		return P.join(
			pump(new Body(fs.createReadStream(__filename))),
			P.fromCallback((callback) => fs.readFile(__filename, callback)),
			assert.deepEqual);
	});

	it("should pipe to writable streams", function () {
		const source = Buffer.from("foo,bar,baz", "utf8");
		const target = new stream.PassThrough();

		new Body(source).pipe(target);
		return P.join(pump(target), source, assert.deepEqual);
	});
});
