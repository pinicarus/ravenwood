"use strict";

const assert = require("assert");

const {Middleware} = requireSrc("middleware");

const {
	DefaultRoute,
	Route,
	scaffoldRoutes,
} = requireSrc("route");

describe("route", function () {
	const inherits = (value, base = Route("", "")) => {
		const parent = Object.getPrototypeOf(base);

		for(let prototype = Object.getPrototypeOf(value); prototype; prototype = Object.getPrototypeOf(prototype)) {
			if (prototype === parent) {
				return true;
			}
		}
		return false;
	};

	it("should conform", function () {
		assert(DefaultRoute instanceof Function);
		assert(Route instanceof Function);
		assert(scaffoldRoutes instanceof Function);

		assert(inherits(DefaultRoute(100)));
		assert(inherits(Route("get", "/")));
	});

	it("should scaffold descriptors", function () {
		const routes = [
			Route("get", "/"),
			{method: "post", path: "/foo", handle: () => 1},
			{method: "put",  path: "/bar", handle: () => 2, middlewares: [{}]},
			Route("delete", "/baz", {}, {}),
			class extends Route("patch", "/quux") {
				handle() {
					return 3;
				}
			},
		];
		const scaffolded = scaffoldRoutes(routes);

		assert.equal(scaffolded.length, routes.length);
		scaffolded.forEach((route) => assert(inherits(route)));

		assert.equal(scaffolded[0].method, "get");
		assert.equal(scaffolded[1].method, "post");
		assert.equal(scaffolded[2].method, "put");
		assert.equal(scaffolded[3].method, "delete");
		assert.equal(scaffolded[4].method, "patch");

		assert.equal(scaffolded[0].path, "/");
		assert.equal(scaffolded[1].path, "/foo");
		assert.equal(scaffolded[2].path, "/bar");
		assert.equal(scaffolded[3].path, "/baz");
		assert.equal(scaffolded[4].path, "/quux");

		assert.equal(scaffolded[0].middlewares.length, 0);
		assert.equal(scaffolded[1].middlewares.length, 0);
		assert.equal(scaffolded[2].middlewares.length, 1);
		assert.equal(scaffolded[3].middlewares.length, 2);
		assert.equal(scaffolded[4].middlewares.length, 0);

		scaffolded.forEach((route) => route.middlewares.forEach((middleware) =>
			assert(inherits(middleware, Middleware()))));

		assert.equal(new scaffolded[0]().handle(), undefined);
		assert.equal(new scaffolded[1]().handle(), 1);
		assert.equal(new scaffolded[2]().handle(), 2);
		assert.equal(new scaffolded[3]().handle(), undefined);
		assert.equal(new scaffolded[4]().handle(), 3);
	});

	it("should prepare injection", function () {
		const [route] = scaffoldRoutes([{
			method: "get",
			path:   "/",
			handle: (x, y = 1) => [x, y],
		}]);

		assert.deepEqual(route.prototype.handle.$inject, ["x", "y"]);
		assert.equal(route.prototype.handle.$defaults.y(), 1);
	});

	it("should create default route", function () {
		const route = DefaultRoute(200);
		const response = new route().handle();

		assert.equal(response.statusCode, 200);
	});
});
