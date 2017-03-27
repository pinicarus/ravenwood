"use strict";

const P = require("bluebird");

const {Response} = require("./response");
const {arrayify} = require("./utils");

const {
	Factory,
	Value,
	transfer,
} = require("./di");

/**
 * A pipeline execution context.
 * @private
 * @typedef {Object} Context
 *
 * @property {?Response}       response - The pipeline response.
 * @property {Array<Function>} leave    - The function to execution when the pipeline leaves.
 */

/**
 * Creates a pipeline stage methods injector.
 * @private
 *
 * @param {piquouze.Container} container - The DI container to inject with.
 *
 * @returns {Function} The pipeline stage methods injector.
 */
const injector = function injector(container) {
	return (stage, method) => {
		const injected = container.inject(stage);
		const instance = injected();

		return P.method(container.inject(instance[method], instance));
	};
};

/**
 * Creates a response/DI dispatcher.
 * @private
 *
 * @param {piquouze.Container} container - The DI container to dispatch DI values to.
 * @param {Function}           mapping   - The mapping of names to the DI container.
 *
 * @returns {Function} The response/DI dispatcher.
 */
const dispatcher = function dispatcher(container, mapping) {
	return (data) => {
		if (data instanceof Response) {
			container.registerValue(mapping("response"), data);
			return data;
		}
		arrayify(data).forEach((datum) => {
			switch (true) {
				case datum instanceof Factory:
					// fallthrough
				case datum instanceof Value:
					transfer(datum, container, mapping);
					// fallthrough
				case datum === undefined:
					break;
				default:
					throw new TypeError(`invalid stage result: ${datum}`);
			}
		});
		return null;
	};
};

/**
 * Enters a pipeline.
 * @private
 *
 * @param {Function}        inject   - The pipeline stage injector.
 * @param {Function}        dispatch - The response/DI dispatcher.
 * @param {Array<Function>} pipeline - The pipeline to enter.
 *
 * @returns {Promise<Context>} The pipeline context.
 */
const enter = function enter(inject, dispatch, pipeline) {
	return P.reduce(pipeline, (context, stage) => {
		if (context.response) {
			return context;
		}

		const enter = inject(stage, "enter");

		return enter().then((data) => {
			context.response = dispatch(data);
			context.leave.unshift(stage);
			return context;
		});
	}, {
		response: null,
		leave:    [],
	});
};

/**
 * Handles a pipeline route.
 * @private
 *
 * @param {Context}  context  - The pipeline context.
 * @param {Function} inject   - The pipeline stage injector.
 * @param {Function} dispatch - The response/DI dispatcher.
 * @param {Function} route    - The route to handle.
 *
 * @returns {Promise<Context>} The pipeline context.
 */
const handle = function handle(context, inject, dispatch, route) {
	return P.try(() => {
		if (context.response) {
			return context;
		}

		const handle = inject(route, ["handle"]);

		return handle().then((data) => {
			context.response = dispatch(data);
			return context;
		});
	});
};

/**
 * Leaves a pipeline.
 * @private
 *
 * @param {Context}  context  - The pipeline context.
 * @param {Function} inject   - The pipeline stage injector.
 * @param {Function} dispatch - The response/DI dispatcher.
 *
 * @returns {Promise<?Response>} The pipeline response.
 */
const leave = function leave(context, inject, dispatch) {
	return P.reduce(context.leave, (response, stage) => {
		const leave = inject(stage, "leave");

		return leave().then((data) => dispatch(data) || response);
	}, context.response);
};

/**
 * Runs a pipeline.
 * @private
 *
 * @param {piquouze.Container}                        container - The DI container for the pipeline execution.
 * @param {Function}                                  mapping   - The mapping of names to the DI container.
 * @param {Array<{enter: Function, leave: Function}>} pipeline  - The pipeline to enter.
 * @param {{handle: Function}}                        route     - The route to handle.
 *
 * @returns {Promise<?Response>} The pipeline response.
 */
const run = function run(container, mapping, pipeline, route) {
	const inject   = injector(container);
	const dispatch = dispatcher(container, mapping);

	return enter(inject, dispatch, pipeline)
		.then((context) => handle(context, inject, dispatch, route))
		.then((context) => leave(context, inject, dispatch));
};

module.exports = {run};
