# Ravenwood

`ravenwood` is a pipeline-oriented, extremely modular, HTTP server tailored on standard compliance
for [nodejs](https://nodejs.org).

[![NPM Summary](https://nodei.co/npm/ravenwood.png)](https://www.npmjs.com/package/ravenwood)
[![NPM Downloads](https://nodei.co/npm-dl/ravenwood.png?months=1)](https://www.npmjs.com/package/ravenwood)

[![Build Status](https://travis-ci.org/pinicarus/ravenwood.svg?branch=master)](https://travis-ci.org/pinicarus/ravenwood)
[![Coverage Status](https://coveralls.io/repos/github/pinicarus/ravenwood/badge.svg?branch=master)](https://coveralls.io/github/pinicarus/ravenwood?branch=master)

## Features

- Two-ways middlewares
- Dependencies Injection

See the [changelog](https://github.com/pinicarus/ravenwood/blob/master/CHANGELOG.md) and the
[API reference](https://github.com/pinicarus/ravenwood/blob/master/API.md)

Ravenwood is pipeline oriented, so requests are processed by a chain of *middleware* stages before reaching a final
handler. Stages are operating both ways: on entry, before the final handler and on exit, after the final handler. This
is because depending on the use case, various actions may need to be performed on either or both logical paths.

The middleware stages are organised as a stack so any middleware called on entry will also be called on exit, unless an
exception bubbles up the pipeline.

```
                 ┌────────────┐   ┌────────────┐         ┌────────────┐   ┌────────────┐
                 │ Middleware │   │ Middleware │         │ Middleware │   │ Handler    │
                 │            │   │            │         │            │   │            │
 HTTP Request ─>─│ enter()    │─>─│ enter()    │─>─ ┄ ─>─│ enter()    │─>─│            │
                 │            │   │            │         │            │   │  handle()  │
HTTP Response ─<─│    leave() │─<─│    leave() │─<─ ┄ ─<─│    leave() │─<─│            │
                 │            │   │            │         │            │   │            │
                 └────────────┘   └────────────┘         └────────────┘   └────────────┘
```

Pipeline stages have a (string) type, which is use to determine where to place each stage along the chain define on the
server. Stages that are not specifically typed will always be traversed first, even when no final handler was defined
(leading to e.g. 404 or 405 responses).

### Middlewares

Middlewares can be given either as plain object descriptors or as classes extending the `Middleware` class.
Descriptors will be scaffolded into classes just as if given straight as such:

```javascript
// Descriptor
{
	type:  "authentication",
	enter: () => {}, // The function to call on pipeline entry
	leave: () => {}, // The function to call on pipeline exit
}

// Class
class extends Middleware("authentication") {
	enter() {} // The method to call on pipeline entry
	leave() {} // The method to call on pipeline exit
}
```

### Routes

Routes can be given either as plain object descriptors or as classes extending the `Route` class.
Descriptors will be scaffolded into classes just as if given straight as such:

```javascript
// Descriptor
{
	method:      "GET",
	path:        "/",
	middlewares: [middlewareDescriptor, middlewareClass], // Route-specific middlewares
	handle: () => {}, // The function to call as a final handler
}

// Class
class extends Route("GET", "/", middlewareDescriptor, middlewareClass) {
	handle() {} // The function to call as a final handler
}
```

### Server

Servers is where middleware and routes building blocks are all tied together into a proper pipeline.
A server is built from a [piquouze container](https://www.npmjs.org/package/piquouze) to handle dependencies injection,
with names modified by the mapping function before registration on the container.

```javascript
const server = new Server(container, options, mapping);
```

To use middleware types, it is required to first define all stages in order:

```javascript
server.setPipeline("stageType1", "stageType2", "stageType3");
```

Shared middlewares can then be added to the server. They will be reordered according to the defined pipeline stage
types:

```javascript
server.addMiddleware(middlewareDescriptor, middlewareClass/*, ...*/);
```

Routes can also be added to the server:

```javascript
server.addRoute(routeDescriptor, routeClass/*, ...*/);
```

Requests can then be served once the server is started:

```javascript
server.start(hostname, port);
```

Servers can be started and stopped as many times as required, as long as a started server is not started again before
being properly stopped and a stopped server being stopped again before being properly started.

#### Testing

Servers can be easily tested by injecting fake request and observing the responses:

```javascript
server.inject(request).then((response) => {});
```

Request injection can also be used to implemented various middlewares requiring output from the server.

#### Error Handling

Basic servers automatically handle error cases for situations where HTTP statuses 404, 405, 500, 501 and 505 may apply.
Error responses are very terse but this behaviour can be modified by overriding the server `catch` method:

```javascript
class VerboseServer extends Server {
	catch(error) {
		return new Promise((resolve) => resolve(new Response(500, "Explanatory reason")));
	}
}
```

### Dependencies Injection

Middleware and route functions are all injected with dependencies previously defined on the container.
Middleware and route class constructors are injected as well.

Each time a request is handled, a new child container is built and the request object registered on it with the result
of mapping the name `"request"`. The list of defined HTTP methods for the request path is registered with the result of
mapping the name `"allowed"`.

Each time a middleware or route handle function return an instance of the `DI` class, all the values and factories
registered on it will be transfered to the container so that they can be injected on later stages, including during the
exit phase of the pipeline.
