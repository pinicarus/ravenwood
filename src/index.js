"use strict";

const {Body}       = require("./body");
const {DI}         = require("./di");
const {Middleware} = require("./middleware");
const {Request}    = require("./request");
const {Route}      = require("./route");
const status       = require("./status");

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
	DI,
	Middleware,
	Request,
	Response,
	Route,
	Server,
	defaultPipeline,

	errors: Object.freeze({
		MissingResponse,
	}),

	status: Object.freeze(Object.assign(status)),
});
