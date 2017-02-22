"use strict";

const assert = require("assert");

const {
	arrayify,
	scaffold,
} = requireSrc("utils");

describe("utils", function () {
	it("should conform", function () {
		assert(arrayify instanceof Function);
		assert(scaffold instanceof Function);
	});

	it("should turn values to arrays", function () {
		assert.deepEqual(arrayify(1), [1]);
		assert.deepEqual(arrayify([1]), [1]);
		assert.deepEqual(arrayify([[1]]), [[1]]);
	});

	it("should scaffold descriptors and classes", function () {
		const A = class {};
		const B = class extends A {};
		const C = class extends B {};

		const scaffolder = (descriptor) => {
			switch (descriptor.name) {
				case "A": return A;
				case "B": return B;
				case "C": return C;
				default:  throw new RangeError("invalid descriptor");
			}
		};

		assert.deepEqual(scaffold([], A, scaffolder, {}), []);

		const classes = scaffold([
			{name: "A"}, A,
			{name: "B"}, B,
			{name: "C"}, C,
		], A, scaffolder, {name: String});

		assert.deepEqual(classes, [A, A, B, B, C, C]);
		assert.throws(
			()      => scaffold([class X {}], A, scaffolder, {}),
			(error) => error instanceof TypeError && error.message === "invalid type: X");
		assert.throws(
			()      => scaffold([{}], A, scaffolder, {name: String}),
			(error) => error instanceof TypeError && error.message === "wrong type");
		assert.throws(
			()      => scaffold([{name: "X"}], A, scaffolder, {name: String}),
			(error) => error instanceof RangeError && error.message === "invalid descriptor");
	});
});
