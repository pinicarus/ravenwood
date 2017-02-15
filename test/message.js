"use strict";

const assert = require("assert");

const {Headers} = requireSrc("headers");
const {Message} = requireSrc("message");

describe("message", function () {
	it("should conform", function () {
		assert(Message instanceof Function);

		assert(new Message(new Headers(), null, new Headers()) instanceof Message);
	});

	it("should expose minimal message", function () {
		const message = new Message(new Headers(), null, new Headers());

		assert.deepEqual(message.headers, {});
		assert.equal(message.body, null);
		assert.deepEqual(message.trailers, {});
	});

	it("should expose a consistent header view", function () {
		const message = new Message(new Headers(), null, new Headers());

		assert.deepEqual(message.headers, {});
		assert.deepEqual(message.trailers, {});
		message.addHeader("foo", "1");
		assert.deepEqual(message.headers, {Foo: ["1"]});
		assert.deepEqual(message.trailers, {});
		assert.deepEqual(message.getHeader("foo"), ["1"]);
		message.addHeader("foo", ["2", "3"]);
		assert.deepEqual(message.headers, {Foo: ["1", "2", "3"]});
		assert.deepEqual(message.trailers, {});
		assert.deepEqual(message.getHeader("foo"), ["1", "2", "3"]);
		message.setHeader("foo", "0");
		assert.deepEqual(message.headers, {Foo: ["0"]});
		assert.deepEqual(message.trailers, {});
		assert.deepEqual(message.getHeader("foo"), ["0"]);
		message.setHeader("foo", ["4", "5"]);
		assert.deepEqual(message.headers, {Foo: ["4", "5"]});
		assert.deepEqual(message.trailers, {});
		assert.deepEqual(message.getHeader("foo"), ["4", "5"]);
		message.addTrailer("bar", "6");
		assert.deepEqual(message.headers, {Foo: ["4", "5"], Trailer: ["Bar"]});
		assert.deepEqual(message.trailers, {Bar: ["6"]});
		assert.deepEqual(message.getHeader("foo"), ["4", "5"]);
		assert.deepEqual(message.getHeader("trailer"), ["Bar"]);
		assert.deepEqual(message.getHeader("bar"), ["6"]);
		message.addTrailer("bar", ["7", "8"]);
		assert.deepEqual(message.headers, {Foo: ["4", "5"], Trailer: ["Bar"]});
		assert.deepEqual(message.trailers, {Bar: ["6", "7", "8"]});
		assert.deepEqual(message.getHeader("foo"), ["4", "5"]);
		assert.deepEqual(message.getHeader("trailer"), ["Bar"]);
		assert.deepEqual(message.getHeader("bar"), ["6", "7", "8"]);
		message.setTrailer("bar", "0");
		assert.deepEqual(message.headers, {Foo: ["4", "5"], Trailer: ["Bar"]});
		assert.deepEqual(message.trailers, {Bar: ["0"]});
		assert.deepEqual(message.getHeader("foo"), ["4", "5"]);
		assert.deepEqual(message.getHeader("trailer"), ["Bar"]);
		assert.deepEqual(message.getHeader("bar"), ["0"]);
		message.setTrailer("bar", ["9", "a"]);
		assert.deepEqual(message.headers, {Foo: ["4", "5"], Trailer: ["Bar"]});
		assert.deepEqual(message.trailers, {Bar: ["9", "a"]});
		assert.deepEqual(message.getHeader("foo"), ["4", "5"]);
		assert.deepEqual(message.getHeader("trailer"), ["Bar"]);
		assert.deepEqual(message.getHeader("bar"), ["9", "a"]);
		message.unsetHeader("foo");
		assert.deepEqual(message.headers, {Trailer: ["Bar"]});
		assert.deepEqual(message.trailers, {Bar: ["9", "a"]});
		assert.deepEqual(message.getHeader("foo"), []);
		assert.deepEqual(message.getHeader("trailer"), ["Bar"]);
		assert.deepEqual(message.getHeader("bar"), ["9", "a"]);
		message.setTrailer("baz", ["b"]);
		assert.deepEqual(message.headers, {Trailer: ["Bar", "Baz"]});
		assert.deepEqual(message.trailers, {Bar: ["9", "a"], Baz: ["b"]});
		assert.deepEqual(message.getHeader("foo"), []);
		assert.deepEqual(message.getHeader("trailer"), ["Bar", "Baz"]);
		assert.deepEqual(message.getHeader("bar"), ["9", "a"]);
		assert.deepEqual(message.getHeader("baz"), ["b"]);
		message.unsetHeader("bar");
		assert.deepEqual(message.headers, {Trailer: ["Baz"]});
		assert.deepEqual(message.trailers, {Baz: ["b"]});
		assert.deepEqual(message.getHeader("foo"), []);
		assert.deepEqual(message.getHeader("trailer"), ["Baz"]);
		assert.deepEqual(message.getHeader("bar"), []);
		assert.deepEqual(message.getHeader("baz"), ["b"]);
		message.unsetHeader("baz");
		assert.deepEqual(message.headers, {});
		assert.deepEqual(message.trailers, {});
		assert.deepEqual(message.getHeader("foo"), []);
		assert.deepEqual(message.getHeader("trailer"), []);
		assert.deepEqual(message.getHeader("bar"), []);
		assert.deepEqual(message.getHeader("baz"), []);
	});

	it("should import headers", function () {
		const m1 = new Message(new Headers(), null, new Headers())
			.setHeader("foo", "1").setTrailer("baz", "2");
		const m2 = new Message(new Headers(), null, new Headers())
			.setHeader("foo", "3").setHeader("bar", "4")
			.setTrailer("baz", "5").setTrailer("quux", "6");

		assert.deepEqual(m1.headers, {Foo: ["1"], Trailer: ["Baz"]});
		assert.deepEqual(m1.trailers, {Baz: ["2"]});
		assert.deepEqual(m2.headers, {Foo: ["3"], Bar: ["4"], Trailer: ["Baz", "Quux"]});
		assert.deepEqual(m2.trailers, {Baz: ["5"], Quux: ["6"]});
		m1.importHeaders(m2);
		assert.deepEqual(m1.headers, {Foo: ["1", "3"], Bar: ["4"], Trailer: ["Baz", "Quux"]});
		assert.deepEqual(m1.trailers, {Baz: ["2", "5"], Quux: ["6"]});
		assert.deepEqual(m2.headers, {Foo: ["3"], Bar: ["4"], Trailer: ["Baz", "Quux"]});
		assert.deepEqual(m2.trailers, {Baz: ["5"], Quux: ["6"]});
	});
});
