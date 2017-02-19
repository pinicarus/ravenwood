"use strict";

const assert = require("assert");

const piquouze = require("piquouze");

const {
	DI,
	transfer,
	scan,
} = requireSrc("di");

describe("di", function () {
	it("should conform", function () {
		assert(scan instanceof Function);
	});

	it("should store and transfer DI values", function () {
		const di = new DI()
			.registerFactory("foo", () => 1, new piquouze.caching.Always())
			.registerFactory(function bar() { return 2; })
			.registerValue("baz", 3)
			.registerValue("quux", 4);

		const container = {
			factories: [],
			values:    [],

			registerFactory(name, value, policy) {
				this.factories.push({name, value, policy});
			},

			registerValue(name, value) {
				this.values.push({name, value});
			},
		};

		transfer(di, container, (name) => name.toUpperCase());

		assert.equal(container.factories.length, 2);
		assert.equal(container.values.length, 2);

		assert.equal(container.factories[0].name, "FOO");
		assert.equal(container.factories[1].name, "BAR");

		assert.equal(container.factories[0].value(), 1);
		assert.equal(container.factories[1].value(), 2);

		assert(container.factories[0].policy instanceof piquouze.caching.Always);
		assert.equal(container.factories[1].policy, undefined);

		assert.equal(container.values[0].name, "BAZ");
		assert.equal(container.values[1].name, "QUUX");

		assert.equal(container.values[0].value, 3);
		assert.equal(container.values[1].value, 4);
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
