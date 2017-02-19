"use strict";

const assert   = require("assert");

const R        = require("ramda");
const piquouze = require("piquouze");

const {DI}       = requireSrc("di");
const {Response} = requireSrc("response");
const {run}      = requireSrc("pipeline");

describe("pipeline", function () {
	it("should conform", function () {
		assert(run instanceof Function);
	});

	it("should traverse full pipeline", function () {
		const values = [];

		const pipeline = [class {
			enter() {
				values.push(1);
			}

			leave() {
				values.push(-1);
			}
		}, class {
			enter() {
				values.push(2);
			}

			leave() {
				values.push(-2);
			}
		}];

		return run(new piquouze.Container(), R.identity, pipeline, class {
			handle() {
				values.push(3);
				return new Response(200);
			}
		}).then((response) => {
			assert(response instanceof Response);
			assert.equal(response.statusCode, 200);
			assert.deepEqual(values, [1, 2, 3, -2, -1]);
		});
	});

	it("should allow pipeline entry response", function () {
		const values = [];

		const pipeline = [class {
			enter() {
				values.push(1);
				return new Response(200);
			}

			leave() {
				values.push(-1);
			}
		}, class {
			enter() {
				values.push(2);
			}

			leave() {
				values.push(-2);
			}
		}];

		return run(new piquouze.Container(), R.identity, pipeline, class {
			handle() {
				values.push(3);
			}
		}).then((response) => {
			assert(response instanceof Response);
			assert.equal(response.statusCode, 200);
			assert.deepEqual(values, [1, -1]);
		});
	});

	it("should allow pipeline exit response", function () {
		const values = [];

		const pipeline = [class {
			enter() {
				values.push(1);
			}

			leave() {
				values.push(-1);
			}
		}, class {
			enter() {
				values.push(2);
			}

			leave() {
				values.push(-2);
				return new Response(200);
			}
		}];

		return run(new piquouze.Container(), R.identity, pipeline, class {
			handle() {
				values.push(3);
			}
		}).then((response) => {
			assert(response instanceof Response);
			assert.equal(response.statusCode, 200);
			assert.deepEqual(values, [1, 2, 3, -2, -1]);
		});
	});

	it("should allow DI injection from pipeline", function () {
		const values = [];

		const pipeline = [class {
			enter() {
				values.push(1);
				return new DI().registerValue("statusCode", 201);
			}

			leave() {
				values.push(-1);
			}
		}, class {
			enter() {
				values.push(2);
			}

			leave() {
				values.push(-2);
			}
		}];

		return run(new piquouze.Container(), R.identity, pipeline, class {
			constructor(statusCode) {
				this._statusCode = statusCode;
			}

			handle() {
				values.push(3);
				return new Response(this._statusCode);
			}
		}).then((response) => {
			assert(response instanceof Response);
			assert.equal(response.statusCode, 201);
			assert.deepEqual(values, [1, 2, 3, -2, -1]);
		});
	});

	it("should refuse unknown stage return type", function () {
		const values = [];

		const pipeline = [class {
			enter() {
				values.push(1);
			}

			leave() {
				values.push(-1);
			}
		}, class {
			enter() {
				return 2;
			}

			leave() {
				values.push(-2);
			}
		}];

		return run(new piquouze.Container(), R.identity, pipeline, class {
			handle() {
				values.push(3);
				return new Response(200);
			}
		}).reflect().then((inspection) => {
			assert(inspection.isRejected());

			const reason = inspection.reason();
			assert(reason instanceof TypeError);
			assert.equal(reason.message, "invalid stage result: 2");

			assert.deepEqual(values, [1]);
		});
	});
});
