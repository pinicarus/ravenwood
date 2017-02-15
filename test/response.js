"use strict";

const assert = require("assert");

const {Message} = requireSrc("message");
const {ok}      = requireSrc("status");

const {
	MissingResponse,
	Response,
} = requireSrc("response");

describe("response", function () {
	it("should conform", function () {
		assert(MissingResponse instanceof Function);
		assert(Response instanceof Function);

		assert(new MissingResponse() instanceof Error);
		assert(new Response(ok) instanceof Response);
		assert(new Response(ok) instanceof Message);
	});

	it("should expose minimal response", function () {
		const response = new Response(ok);

		assert.equal(response.statusCode, ok);
		assert.equal(response.statusMessage, "OK");
		assert.deepEqual(response.headers, {});
		assert.equal(response.body, null);
		assert.deepEqual(response.trailers, {});
	});
});
