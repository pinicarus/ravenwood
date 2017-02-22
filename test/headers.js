"use strict";

const assert = require("assert");

const {
	Headers,
	normalize,
} = requireSrc("headers");

describe("headers", function () {
	it("should conform", function () {
		assert(Headers instanceof Function);
		assert(normalize instanceof Function);
		assert(new Headers() instanceof Headers);
	});

	it("should normalize names", function () {
		assert.equal(normalize(""), "");
		assert.equal(normalize("foo"), "Foo");
		assert.equal(normalize("Foo"), "Foo");
		assert.equal(normalize("foo-bar"), "Foo-Bar");
	});

	it("should hold values", function () {
		const headers = new Headers();

		assert.deepEqual(headers.get(), {});
		headers.add("foo", "1");
		assert.deepEqual(headers.get(), {Foo: ["1"]});
		assert.deepEqual(headers.get("foo"), ["1"]);
		headers.add("foo", "2");
		assert.deepEqual(headers.get(), {Foo: ["1", "2"]});
		assert.deepEqual(headers.get("foo"), ["1", "2"]);
		headers.add("foo", ["3", "4"]);
		assert.deepEqual(headers.get(), {Foo: ["1", "2", "3", "4"]});
		assert.deepEqual(headers.get("foo"), ["1", "2", "3", "4"]);
		headers.set("foo", "0");
		assert.deepEqual(headers.get(), {Foo: ["0"]});
		assert.deepEqual(headers.get("foo"), ["0"]);
		headers.set("foo", ["5", "6"]);
		assert.deepEqual(headers.get(), {Foo: ["5", "6"]});
		assert.deepEqual(headers.get("foo"), ["5", "6"]);
		headers.unset("foo");
		assert.deepEqual(headers.get(), {});
		headers.parsePairs(["foo", "7", "bar", "8", "foo", "9"]);
		assert.deepEqual(headers.get(), {Foo: ["7", "9"], Bar: ["8"]});
		assert.deepEqual(headers.get("foo"), ["7", "9"]);
		assert.deepEqual(headers.get("bar"), ["8"]);
		assert.deepEqual(headers.get("baz"), []);
	});

	it("should import values", function () {
		const h1 = new Headers().set("foo", "1");
		const h2 = new Headers().set("foo", "2").set("bar", "3");

		assert.deepEqual(h1.get(), {Foo: ["1"]});
		assert.deepEqual(h2.get(), {Foo: ["2"], Bar: ["3"]});
		h1.import(h2);
		assert.deepEqual(h1.get(), {Foo: ["1", "2"], Bar: ["3"]});
		assert.deepEqual(h2.get(), {Foo: ["2"], Bar: ["3"]});
		h1.unset("bar");
		assert.deepEqual(h1.get(), {Foo: ["1", "2"]});
		assert.deepEqual(h2.get(), {Foo: ["2"], Bar: ["3"]});
	});

	it("should fail to parse odd-length array of key/value pairs", function () {
		assert.throws(() => new Headers().parsePairs(["foo", "1", "bar"]));
	});
});
