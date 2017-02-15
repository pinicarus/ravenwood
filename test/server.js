"use strict";

const assert = require("assert");
const http   = require("http");
const net    = require("net");

const P = require("bluebird");

const {Body}     = requireSrc("body");
const {Request}  = requireSrc("request");
const {Response} = requireSrc("response");

const {
	Server,
	defaultPipeline,
} = requireSrc("server");

describe("server", function () {
	it("should conform", function () {
		assert(Server instanceof Function);
		assert(defaultPipeline instanceof Function);

		assert(new Server() instanceof Server);
	});

	it("should set default pipeline", function () {
		const stages = [];

		defaultPipeline({
			setPipeline(...values) {
				stages.push(...values);
				return this;
			},
		});

		assert.deepEqual(stages, ["incoming", "validation", "authentication", "authorization", "general"]);
	});

	it("should traverse middleware", function () {
		const values = [];

		return defaultPipeline(new Server()).addMiddleware({
			type:  "incoming",
			enter: () => {
				values.push(1);
			},
			leave: () => {
				values.push(-1);
			},
		}, {
			type:  "incoming",
			enter: () => {
				values.push(2);
			},
			leave: () => {
				values.push(-2);
			},
		}).addRoute({
			method: "GET",
			path:   "/",
			handle: () => new Response(200),
		}).inject(new Request("GET", "/")).then((response) => {
			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.headers, {});
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
			assert.deepEqual(values, [1, 2, -2, -1]);
		});
	});

	it("should fail to add middleware of unknown type", function () {
		assert.throws(() => new Server().addMiddleware({
			type:  "foo",
			enter: () => {},
			leave: () => {},
		}), RangeError);
	});

	it("should respond 404 to unknown path", function () {
		return new Server().inject(new Request("GET", "/")).then((response) => {
			assert.equal(response.statusCode, 404);
			assert.equal(response.statusMessage, "Not Found");
			assert.deepEqual(response.headers, {});
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should respond 405 to unknown method", function () {
		return new Server().addRoute({
			method: "GET",
			path:   "/",
			handle: () => new Response(200),
		}).inject(new Request("POST", "/")).then((response) => {
			assert.equal(response.statusCode, 405);
			assert.equal(response.statusMessage, "Method Not Allowed");
			assert.deepEqual(response.headers, {});
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should internally redirect improper path", function () {
		return new Server().addRoute({
			method: "GET",
			path:   "/",
			handle: () => new Response(200),
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 200);
			assert.equal(response.statusMessage, "OK");
			assert.deepEqual(response.headers, {});
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should externally redirect improper path", function () {
		return new Server({
			routing: {internalRedirect: false},
		}).addRoute({
			method: "GET",
			path:   "/",
			handle: () => new Response(200),
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 301);
			assert.equal(response.statusMessage, "Moved Permanently");
			assert.deepEqual(response.headers, {Location: ["/"]});
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should provide default response", function () {
		return new Server().addRoute({
			method: "GET",
			path:   "/",
			handle: () => {},
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 501);
			assert.equal(response.statusMessage, "Not Implemented");
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should catch exception", function () {
		return new Server().addRoute({
			method: "GET",
			path:   "/",
			handle: () => {
				throw new Error("foo");
			},
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 500);
			assert.equal(response.statusMessage, "foo");
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should catch exception w/ catch handler", function () {
		const CustomServer = class CustomServer extends Server {
			catch(error) {
				return P.resolve(new Response(418));
			}
		};

		return new CustomServer().addRoute({
			method: "GET",
			path:   "/",
			handle: () => {},
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 418);
			assert.equal(response.statusMessage, "I'm a teapot");
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should still catch exception from catch handler", function () {
		const CustomServer = class CustomServer extends Server {
			catch() {
				throw new Error("foo");
			}
		};

		return new CustomServer().addRoute({
			method: "GET",
			path:   "/",
			handle: () => {},
		}).inject(new Request("GET", "//")).then((response) => {
			assert.equal(response.statusCode, 500);
			assert.equal(response.statusMessage, "foo");
			assert.equal(response.body, null);
			assert.deepEqual(response.trailers, {});
		});
	});

	it("should create HTTPS server w/ TLS options", function () {
		const server = new Server({
			network: {
				tls: {
					passphrase: "foo",
				},
			},
		});

		return server.start(0).then(() => server.stop());
	});

	describe("network activity", function () {
		const request = (hostname, port, method, path, body) => P.fromCallback((callback) => {
			const req = http.request({
				hostname,
				port,
				method,
				path,
			}, (response) => {
				const chunks = [];

				response.on("data", (chunk) => chunks.push(chunk));
				response.once("end", () => callback(null, {
					statusCode: response.statusCode,
					headers:    response.headers,
					trailers:   response.trailers,
					body:       Buffer.concat(chunks),
				}));
			});

			if (body) {
				req.write(body);
			}
			req.end();
		});

		it("should start and stop", function () {
			const server = new Server();

			return P.using(server.start(0).disposer(() => server.stop()), () => server.start(0).catch((error) => {
				assert(error instanceof Error);
				assert.equal(error.message, "server already started");
			})).then(() => server.stop().catch((error) => {
				assert(error instanceof Error);
				assert.equal(error.message, "server already stopped");
			}));
		});

		it("should refuse to start on invalid port", function () {
			assert.throws(() => new Server().start(-1), RangeError);
			assert.throws(() => new Server().start(Infinity), RangeError);
		});

		it("should handle real request w/o body", function () {
			const server = new Server().addRoute({
				method: "GET",
				path:   "/",
				handle: () => new Response(200).addTrailer("foo", "bar"),
			});

			return P.using(server.start(0).disposer(() => server.stop()), ({address, port}) =>
				request(address, port, "GET", "/").then((response) => {
					assert.equal(response.statusCode, 200);
					assert.equal(response.headers.connection, "close");
					assert.equal(response.headers.trailer, "Foo");
					assert.equal(response.trailers.foo, "bar");
				}));
		});

		it("should handle real request & keep alive", function () {
			const server = new Server({
				network: {
					keepAlive: true,
				},
			}).addRoute({
				method: "GET",
				path:   "/",
				handle: () => new Response(200).addTrailer("foo", "bar"),
			});

			return P.using(server.start(0).disposer(() => server.stop()), ({address, port}) =>
				request(address, port, "GET", "/").then((response) => {
					assert.equal(response.statusCode, 200);
					assert.equal(response.headers.connection, "keep-alive");
					assert.equal(response.headers.trailer, "Foo");
					assert.equal(response.trailers.foo, "bar");
				}));
		});

		it("should handle real request w/ body", function () {
			const server = new Server().addRoute({
				method: "POST",
				path:   "/",
				handle: () => new Response(200, new Body(Buffer.from("bar", "utf8"))),
			});

			return P.using(server.start(0).disposer(() => server.stop()), ({address, port}) =>
				request(address, port, "POST", "/", Buffer.from("foo", "utf8")).then((response) => {
					assert.equal(response.statusCode, 200);
					assert.deepEqual(response.body, Buffer.from("bar", "utf8"));
				}));
		});

		it("should fail to respond trailers to HTTP/1.0 request", function () {
			const server = new Server().addRoute({
				method: "GET",
				path:   "/",
				handle: () => new Response(200).addTrailer("foo", "bar"),
			});

			return P.using(server.start(0).disposer(() => server.stop()), ({address, port}) =>
				P.fromCallback((callback) => {
					const chunks = [];
					const socket = net.connect(port, address, () => {
						socket.write("GET / HTTP/1.0\r\n\r\n");
					});

					socket.on("data", (chunk) => chunks.push(chunk));
					socket.once("end", () => callback(null, Buffer.concat(chunks)));
				})).then((response) => {
					assert(response.toString("utf8").startsWith("HTTP/1.1 505 HTTP Version Not Supported"));
				});
		});
	});
});
