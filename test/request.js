"use strict";

const assert = require("assert");

const {Body}    = requireSrc("body");
const {Message} = requireSrc("message");

const {
	Request,
	fixPath,
	setParams,
} = requireSrc("request");

describe("request", function () {
	it("should conform", function () {
		assert(Request instanceof Function);

		assert(new Request("get", "/") instanceof Request);
		assert(new Request("get", "/") instanceof Message);
	});

	it("should expose minimal request", function () {
		const request = new Request("get", "/");

		assert.equal(request.method, "GET");
		assert.equal(request.path, "/");
		assert.deepEqual(request.params, {});
		assert.deepEqual(request.query, {});
		assert.deepEqual(request.headers, {});
		assert(request.body instanceof Body);
		assert.deepEqual(request.trailers, {});
	});

	it("should expose enhanced request", function () {
		const request = new Request("get", "/");

		fixPath(request, "/foo");
		assert.equal(request.path, "/foo");
		setParams(request, {bar: "baz"});
		assert.deepEqual(request.params, {bar: "baz"});
	});
});
