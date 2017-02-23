"use strict";

const assert = require("assert");

const {scan} = requireSrc("di");

describe("di", function () {
	it("should conform", function () {
		assert(scan instanceof Function);
	});

	it("should scan functors", function () {
		const target                      = (a, b = 2) => [a, b];
		const {functor, params, defaults} = scan(target);

		assert.equal(functor, target);
		assert.deepEqual(params, ["a", "b"]);
		assert.deepEqual(Object.keys(defaults), ["b"]);
		assert(defaults.b instanceof Function);
		assert.equal(defaults.b(), 2);
	});
});
