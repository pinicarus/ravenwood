"use strict";

const {Body}       = require("./body");
const {Middleware} = require("./middleware");
const {Request}    = require("./request");
const {Route}      = require("./route");
const status       = require("./status");

const {
	Factory,
	Value,
} = require("./di");

const {
	MissingResponse,
	Response,
} = require("./response");

const {
	Server,
	defaultPipeline,
} = require("./server");

module.exports = Object.freeze({
	Body,
	Middleware,
	Request,
	Response,
	Route,
	Server,
	defaultPipeline,

	DI: Object.freeze({
		Factory,
		Value,
	}),

	errors: Object.freeze({
		MissingResponse,
	}),

	status: Object.freeze(Object.assign({}, status)),
});
