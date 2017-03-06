"use strict";

const ravenwood = require("../src");

const server = ravenwood.defaultPipeline(new ravenwood.Server());

const toBuffer = function (stream) {
	return new Promise((resolve, reject) => {
		const data = [];

		stream.on("error", reject);
		stream.on("data",  (chunk) => data.push(chunk));
		stream.on("end",   () => resolve(Buffer.concat(data)));
	});
};

const ID = class extends ravenwood.Middleware("incoming") {
	constructor() {
		super();
		this._serverId = Math.random();
	}

	enter() {
		console.log("[ID] enter");
		return new ravenwood.DI().registerValue("ID", [this._serverId, Math.random()]);
	}

	leave() {
		console.log("[ID] leave");
	}
};

server.addMiddleware(ID);

server.addRoute({
	method: "POST",
	path:   "/news",
	handle: (request) => {
		return toBuffer(request.body).then((body) => {
			console.log("[CREATED]", body);
			return new ravenwood.Response(201);
		});
	},
});

const NewsReadAll = class extends ravenwood.Route("GET", "/news") {
	handle() {
		return new ravenwood.Response(200, new ravenwood.Body(Buffer.from("[]")));
	}
};

server.addRoute(NewsReadAll);

server.start(0).then((address) => console.log("ready on", address));
