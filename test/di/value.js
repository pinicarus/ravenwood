"use strict";

const assert = require("assert");

const {Value} = requireSrc("di", "value");

describe("di", function () {
	describe("value", function () {
		it("should conform", function () {
			assert(Value instanceof Function);
			assert(new Value("foo", "bar") instanceof Value);
		});

		it("should store DI values", function () {
			const di = new Value("foo", "bar");

			assert.equal(di.name, "foo");
			assert.equal(di.value, "bar");
		});
	});
});
