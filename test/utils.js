"use strict";

const assert = require("assert");

const {arrayify} = requireSrc("utils");

describe("utils", function () {
	it("should conform", function () {
		assert(arrayify instanceof Function);
	});

	it("should turn values to arrays", function () {
		assert.deepEqual(arrayify(1), [1]);
		assert.deepEqual(arrayify([1]), [1]);
		assert.deepEqual(arrayify([[1]]), [[1]]);
	});
});
