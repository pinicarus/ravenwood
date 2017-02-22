"use strict";

const assert = require("assert");

const {
	Middleware,
	always,
	scaffoldMiddlewares,
} = requireSrc("middleware");

describe("middleware", function () {
	const inherits = (value) => {
		const parent = Object.getPrototypeOf(Middleware());

		for(let prototype = Object.getPrototypeOf(value); prototype; prototype = Object.getPrototypeOf(prototype)) {
			if (prototype === parent) {
				return true;
			}
		}
		return false;
	};

	it("should conform", function () {
		assert(Middleware instanceof Function);
		assert.equal(typeof always, "symbol");
		assert(scaffoldMiddlewares instanceof Function);

		assert(inherits(Middleware("M1")));
	});

	it("should scaffold descriptors", function () {
		const middlewares = [
			Middleware("foo"),
			{},
			{enter: () => 1},
			{leave: () => 2},
			{enter: () => 3, leave: () => 4},
			{type: "bar"},
			{type: "bar", enter: () => 5},
			{type: "bar", leave: () => 6},
			{type: "bar", enter: () => 7, leave: () => 8},
			class extends Middleware("baz") {
				enter() {
					return 9;
				}

				leave() {
					return -9;
				}
			},
		];
		const scaffolded = scaffoldMiddlewares(middlewares);

		assert.equal(scaffolded.length, middlewares.length);
		scaffolded.forEach((middleware) => assert(inherits(middleware)));

		assert.equal(scaffolded[0].type, "foo");
		assert.equal(scaffolded[1].type, always);
		assert.equal(scaffolded[2].type, always);
		assert.equal(scaffolded[3].type, always);
		assert.equal(scaffolded[4].type, always);
		assert.equal(scaffolded[5].type, "bar");
		assert.equal(scaffolded[6].type, "bar");
		assert.equal(scaffolded[7].type, "bar");
		assert.equal(scaffolded[8].type, "bar");
		assert.equal(scaffolded[9].type, "baz");

		assert.equal(new scaffolded[0]().enter(), undefined);
		assert.equal(new scaffolded[0]().leave(), undefined);
		assert.equal(new scaffolded[1]().enter(), undefined);
		assert.equal(new scaffolded[1]().leave(), undefined);
		assert.equal(new scaffolded[2]().enter(), 1);
		assert.equal(new scaffolded[2]().leave(), undefined);
		assert.equal(new scaffolded[3]().enter(), undefined);
		assert.equal(new scaffolded[3]().leave(), 2);
		assert.equal(new scaffolded[4]().enter(), 3);
		assert.equal(new scaffolded[4]().leave(), 4);
		assert.equal(new scaffolded[5]().enter(), undefined);
		assert.equal(new scaffolded[5]().leave(), undefined);
		assert.equal(new scaffolded[6]().enter(), 5);
		assert.equal(new scaffolded[6]().leave(), undefined);
		assert.equal(new scaffolded[7]().enter(), undefined);
		assert.equal(new scaffolded[7]().leave(), 6);
		assert.equal(new scaffolded[8]().enter(), 7);
		assert.equal(new scaffolded[8]().leave(), 8);
		assert.equal(new scaffolded[9]().enter(), 9);
		assert.equal(new scaffolded[9]().leave(), -9);
	});

	it("should prepare injection", function () {
		const [middleware] = scaffoldMiddlewares([{
			enter: (x, y = 1) => [x, y],
			leave: (x, y = 2) => [x, y],
		}]);

		assert.deepEqual(middleware.prototype.enter.$inject, ["x", "y"]);
		assert.deepEqual(middleware.prototype.leave.$inject, ["x", "y"]);

		assert.equal(middleware.prototype.enter.$defaults.y(), 1);
		assert.equal(middleware.prototype.leave.$defaults.y(), 2);
	});
});
