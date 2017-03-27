"use strict";

const assert = require("assert");

const piquouze = require("piquouze");

const {Factory} = requireSrc("di", "factory");

describe("di", function () {
	describe("factory", function () {
		it("should conform", function () {
			assert(Factory instanceof Function);
			assert(new Factory(() => {}) instanceof Factory);
		});

		it("should store DI factories", function () {
			const functor = function f() {};
			const policy  = new piquouze.caching.Always();

			let di = new Factory("foo", functor);
			assert.equal(di.name, "foo");
			assert.equal(di.value, functor);
			assert.equal(di.policy, null);

			di = new Factory(functor, policy);
			assert.equal(di.name, "f");
			assert.equal(di.value, functor);
			assert.equal(di.policy, policy);
		});
	});
});
