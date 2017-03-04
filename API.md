# Classes

<dl>
<dt><a href="#Body">Body</a></dt>
<dd><p>A readable stream to a buffer or stream body.</p>
</dd>
<dt><a href="#DI">DI</a></dt>
<dd><p>A store for DI injectable values.</p>
</dd>
<dt><a href="#Request">Request</a></dt>
<dd><p>An HTTP request.</p>
</dd>
<dt><a href="#MissingResponse">MissingResponse</a></dt>
<dd><p>An error represents the lack of response.</p>
</dd>
<dt><a href="#Response">Response</a></dt>
<dd><p>An HTTP response.</p>
</dd>
<dt><a href="#Server">Server</a></dt>
<dd><p>An HTTP server designed to expose a consistent request handling pipeline with plugin-oriented hooks.</p>
</dd>
</dl>

# Constants

<dl>
<dt><a href="#Middleware">Middleware</a></dt>
<dd><p>The generic base class for all middlewares</p>
</dd>
<dt><a href="#Route">Route</a></dt>
<dd><p>The base class for all routes.</p>
</dd>
</dl>

# Functions

<dl>
<dt><a href="#defaultPipeline">defaultPipeline(server)</a> ⇒ <code><a href="#Server">Server</a></code></dt>
<dd><p>Adds a default pipeline to a server.</p>
</dd>
</dl>

# Typedefs

<dl>
<dt><a href="#MiddlewareDescriptor">MiddlewareDescriptor</a> : <code>Object</code></dt>
<dd><p>A middleware descriptor.</p>
</dd>
<dt><a href="#RouteDescriptor">RouteDescriptor</a> : <code>Object</code></dt>
<dd><p>A route descriptor.</p>
</dd>
<dt><a href="#ServerOptions">ServerOptions</a> : <code>Object</code></dt>
<dd><p>Server options.</p>
</dd>
<dt><a href="#ServerAddress">ServerAddress</a> : <code>Object</code></dt>
<dd><p>A listening server address</p>
</dd>
</dl>

<a name="Body"></a>

# Body
A readable stream to a buffer or stream body.

**Kind**: global class  
<a name="new_Body_new"></a>

## new Body(source)
Constructs a new stream.


| Param | Type | Description |
| --- | --- | --- |
| source | <code>Buffer</code> &#124; <code>stream.Readable</code> | The downstream data source. |

<a name="DI"></a>

# DI
A store for DI injectable values.

**Kind**: global class  

* [DI](#DI)
    * [new DI()](#new_DI_new)
    * [.registerValue(name, value)](#DI+registerValue) ⇒ <code>[DI](#DI)</code>
    * [.registerFactory([name], factory, [policy])](#DI+registerFactory) ⇒ <code>[DI](#DI)</code>

<a name="new_DI_new"></a>

## new DI()
Constructs a new injectable values storage.

<a name="DI+registerValue"></a>

## dI.registerValue(name, value) ⇒ <code>[DI](#DI)</code>
Stores a value for registration.

**Kind**: instance method of <code>[DI](#DI)</code>  
**Returns**: <code>[DI](#DI)</code> - The DI storage with the value added for registration.  
**Throws**:

- <code>TypeError</code> Whenever the name is not a string.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name to register the value with. |
| value | <code>\*</code> | The value to register. |

<a name="DI+registerFactory"></a>

## dI.registerFactory([name], factory, [policy]) ⇒ <code>[DI](#DI)</code>
Stores a factory for registration.

**Kind**: instance method of <code>[DI](#DI)</code>  
**Returns**: <code>[DI](#DI)</code> - The DI storage with the value added for registration.  
**Throws**:

- <code>TypeError</code> Whenever no name was given and none could be inferred.
- <code>TypeError</code> Whenever the factory is not a Function.
- <code>TypeError</code> Whenever the policy does not inherit from piquouze.Policy.


| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>String</code> | The name to register the factory with. |
| factory | <code>function</code> | The factory to register. |
| [policy] | <code>Policy</code> | The caching policy to register the factory with.. |

<a name="Request"></a>

# Request
An HTTP request.

**Kind**: global class  

* [Request](#Request)
    * [new Request()](#new_Request_new)
    * [.method](#Request+method) ⇒ <code>String</code>
    * [.path](#Request+path) ⇒ <code>String</code>
    * [.params](#Request+params) ⇒ <code>Object.&lt;String, String&gt;</code>
    * [.query](#Request+query) ⇒ <code>Object.&lt;String, String&gt;</code>

<a name="new_Request_new"></a>

## new Request()
Constructs a new request.

**Throws**:

- <code>TypeError</code> Whenever the headers does not extend Headers.
- <code>TypeError</code> Whenever the body does not extend Body.
- <code>TypeError</code> Whenever the trailers does not extend Headers.

<a name="Request+method"></a>

## request.method ⇒ <code>String</code>
Returns the request HTTP method.

**Kind**: instance property of <code>[Request](#Request)</code>  
**Returns**: <code>String</code> - The HTTP method.  
<a name="Request+path"></a>

## request.path ⇒ <code>String</code>
Returns the request path.

**Kind**: instance property of <code>[Request](#Request)</code>  
**Returns**: <code>String</code> - The request path.  
<a name="Request+params"></a>

## request.params ⇒ <code>Object.&lt;String, String&gt;</code>
Returns the request path parameters.

**Kind**: instance property of <code>[Request](#Request)</code>  
**Returns**: <code>Object.&lt;String, String&gt;</code> - The request path parameters.  
<a name="Request+query"></a>

## request.query ⇒ <code>Object.&lt;String, String&gt;</code>
Returns the request query parameters.

**Kind**: instance property of <code>[Request](#Request)</code>  
**Returns**: <code>Object.&lt;String, String&gt;</code> - The request query parameters.  
<a name="MissingResponse"></a>

# MissingResponse
An error represents the lack of response.

**Kind**: global class  
<a name="new_MissingResponse_new"></a>

## new MissingResponse()
Constructs a new error for a missing response.

<a name="Response"></a>

# Response
An HTTP response.

**Kind**: global class  

* [Response](#Response)
    * [new Response(statusCode, [statusMessage], [headers], [body], [trailers])](#new_Response_new)
    * [.statusCode](#Response+statusCode) ⇒ <code>Number</code>
    * [.statusMessage](#Response+statusMessage) ⇒ <code>String</code>

<a name="new_Response_new"></a>

## new Response(statusCode, [statusMessage], [headers], [body], [trailers])
Constructs a new HTTP response.

**Throws**:

- <code>TypeError</code> Whenever the status code is not a number.
- <code>TypeError</code> Whenever the status message is not a string.
- <code>TypeError</code> Whenever the headers does not extend Headers.
- <code>TypeError</code> Whenever the body does not extend Body.
- <code>TypeError</code> Whenever the trailers does not extend Headers.


| Param | Type | Description |
| --- | --- | --- |
| statusCode | <code>Number</code> | The response status code. |
| [statusMessage] | <code>String</code> | The response status message. |
| [headers] | <code>[Headers](#new_Headers_new)</code> | The response headers. |
| [body] | <code>[Body](#Body)</code> | The response body. |
| [trailers] | <code>[Headers](#new_Headers_new)</code> | The response trailers. |

<a name="Response+statusCode"></a>

## response.statusCode ⇒ <code>Number</code>
Returns the response status code.

**Kind**: instance property of <code>[Response](#Response)</code>  
**Returns**: <code>Number</code> - The response status code.  
<a name="Response+statusMessage"></a>

## response.statusMessage ⇒ <code>String</code>
Returns the response status message.

**Kind**: instance property of <code>[Response](#Response)</code>  
**Returns**: <code>String</code> - The response status message.  
<a name="Server"></a>

# Server
An HTTP server designed to expose a consistent request handling pipeline with plugin-oriented hooks.

**Kind**: global class  

* [Server](#Server)
    * [new Server([container], [options], [mapping])](#new_Server_new)
    * [.setPipeline(...stages)](#Server+setPipeline) ⇒ <code>[Server](#Server)</code>
    * [.addMiddleware(...middlewares)](#Server+addMiddleware) ⇒ <code>[Server](#Server)</code>
    * [.addRoute(...routes)](#Server+addRoute) ⇒ <code>[Server](#Server)</code>
    * [.start([hostname], port)](#Server+start) ⇒ <code>[Promise.&lt;ServerAddress&gt;](#ServerAddress)</code>
    * [.inject(request)](#Server+inject) ⇒ <code>[Promise.&lt;Response&gt;](#Response)</code>
    * [.catch(error)](#Server+catch) ⇒ <code>Promise.&lt;?Response&gt;</code>
    * [.stop()](#Server+stop) ⇒ <code>Promise</code>

<a name="new_Server_new"></a>

## new Server([container], [options], [mapping])
Constructs a new server.

**Throws**:

- <code>TypeError</code> Whenever the DI container is not an object.
- <code>TypeError</code> Whenever the options are not a valid object.


| Param | Type | Description |
| --- | --- | --- |
| [container] | <code>piquouze.Container</code> | The DI container used to inject middlewares and routes. |
| [options] | <code>[ServerOptions](#ServerOptions)</code> | The server options. |
| [mapping] | <code>function</code> | The mapping of names to the DI container. |

<a name="Server+setPipeline"></a>

## server.setPipeline(...stages) ⇒ <code>[Server](#Server)</code>
Sets a full pipeline.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>[Server](#Server)</code> - The server with the pipeline set.  
**Throws**:

- <code>TypeError</code> Whenever a pipeline stage is not a string.


| Param | Type | Description |
| --- | --- | --- |
| ...stages | <code>String</code> | The ordered list of pipeline stages. |

<a name="Server+addMiddleware"></a>

## server.addMiddleware(...middlewares) ⇒ <code>[Server](#Server)</code>
Adds middlewares to the request handling pipeline.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>[Server](#Server)</code> - The server with the middlewares added.  
**Throws**:

- <code>TypeError</code> Whenever a value is not a valid descriptor or does not extend the Middleware base class.
- <code>RangeError</code> Whenever a middleware type is not defined in the pipeline.


| Param | Type | Description |
| --- | --- | --- |
| ...middlewares | <code>function</code> &#124; <code>[MiddlewareDescriptor](#MiddlewareDescriptor)</code> | The middlewares types to add. |

<a name="Server+addRoute"></a>

## server.addRoute(...routes) ⇒ <code>[Server](#Server)</code>
Adds routes to the server.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>[Server](#Server)</code> - The server with the routes added.  
**Throws**:

- <code>TypeError</code> Whenever a route value is not a valid descriptor or does not extend the Route class.
- <code>RangeError</code> Whenever a route middleware type is not defined in the pipeline.


| Param | Type | Description |
| --- | --- | --- |
| ...routes | <code>function</code> &#124; <code>[RouteDescriptor](#RouteDescriptor)</code> | The routes to add. |

<a name="Server+start"></a>

## server.start([hostname], port) ⇒ <code>[Promise.&lt;ServerAddress&gt;](#ServerAddress)</code>
Starts listening for requests.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>[Promise.&lt;ServerAddress&gt;](#ServerAddress)</code> - Resolved when the server is listening.  
**Throws**:

- <code>TypeError</code> Whenever the hostname is not a string.
- <code>TypeError</code> Whenever the port is not a number.
- <code>RangeError</code> Whenever the port is not a strictly positive integer.


| Param | Type | Description |
| --- | --- | --- |
| [hostname] | <code>String</code> | The hostname to bind to. |
| port | <code>Number</code> | The port number to listen to. |

<a name="Server+inject"></a>

## server.inject(request) ⇒ <code>[Promise.&lt;Response&gt;](#Response)</code>
Injects an HTTP request.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>[Promise.&lt;Response&gt;](#Response)</code> - The outgoing response.  
**Throws**:

- <code>TypeError</code> Whenever the request is invalid.


| Param | Type | Description |
| --- | --- | --- |
| request | <code>[Request](#Request)</code> | The incoming request. |

<a name="Server+catch"></a>

## server.catch(error) ⇒ <code>Promise.&lt;?Response&gt;</code>
Catches an error during request processing.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>Promise.&lt;?Response&gt;</code> - The response to send out.  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error to catch. |

<a name="Server+stop"></a>

## server.stop() ⇒ <code>Promise</code>
Stops listening for requests.

**Kind**: instance method of <code>[Server](#Server)</code>  
**Returns**: <code>Promise</code> - Resolved whenever the server is stopped.  
<a name="statuses"></a>

# statuses : <code>enum</code>
HTTP response status codes.

**Kind**: global enum  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| continue | <code>Number</code> | <code>100</code> | 
| switchingProtocols | <code>Number</code> | <code>101</code> | 
| ok | <code>Number</code> | <code>200</code> | 
| created | <code>Number</code> | <code>201</code> | 
| accepted | <code>Number</code> | <code>202</code> | 
| nonAuthoritativeInformation | <code>Number</code> | <code>203</code> | 
| noContent | <code>Number</code> | <code>204</code> | 
| resetContent | <code>Number</code> | <code>205</code> | 
| partialContent | <code>Number</code> | <code>206</code> | 
| multipleChoices | <code>Number</code> | <code>300</code> | 
| movedPermanently | <code>Number</code> | <code>301</code> | 
| movedTemporarily | <code>Number</code> | <code>302</code> | 
| seeOther | <code>Number</code> | <code>303</code> | 
| notModified | <code>Number</code> | <code>304</code> | 
| useProxy | <code>Number</code> | <code>305</code> | 
| temporaryRedirect | <code>Number</code> | <code>307</code> | 
| permanentRedirect | <code>Number</code> | <code>308</code> | 
| tooManyRedirects | <code>Number</code> | <code>310</code> | 
| badRequest | <code>Number</code> | <code>400</code> | 
| unauthorized | <code>Number</code> | <code>401</code> | 
| paymentRequired | <code>Number</code> | <code>402</code> | 
| forbidden | <code>Number</code> | <code>403</code> | 
| notFound | <code>Number</code> | <code>404</code> | 
| methodNotAllowed | <code>Number</code> | <code>405</code> | 
| notAcceptable | <code>Number</code> | <code>406</code> | 
| proxyAuthenticationRequired | <code>Number</code> | <code>407</code> | 
| requestTimeout | <code>Number</code> | <code>408</code> | 
| conflict | <code>Number</code> | <code>409</code> | 
| gone | <code>Number</code> | <code>410</code> | 
| lengthRequired | <code>Number</code> | <code>411</code> | 
| preconditionFailed | <code>Number</code> | <code>412</code> | 
| requestEntityTooLarge | <code>Number</code> | <code>413</code> | 
| requestURITooLong | <code>Number</code> | <code>414</code> | 
| unsupportedMediaType | <code>Number</code> | <code>415</code> | 
| requestedRangeUnsatisfiable | <code>Number</code> | <code>416</code> | 
| expectationFailed | <code>Number</code> | <code>417</code> | 
| imATeapot | <code>Number</code> | <code>418</code> | 
| misdirectedRequest | <code>Number</code> | <code>421</code> | 
| upgradeRequired | <code>Number</code> | <code>426</code> | 
| preconditionRequired | <code>Number</code> | <code>428</code> | 
| tooManyRequests | <code>Number</code> | <code>429</code> | 
| requestHeaderFieldsTooLarge | <code>Number</code> | <code>431</code> | 
| internalServerError | <code>Number</code> | <code>500</code> | 
| notImplemented | <code>Number</code> | <code>501</code> | 
| badGateway | <code>Number</code> | <code>502</code> | 
| serviceUnavailable | <code>Number</code> | <code>503</code> | 
| gatewayTimeout | <code>Number</code> | <code>504</code> | 
| httpVersionNotSupported | <code>Number</code> | <code>505</code> | 
| variantAlsoNegotiates | <code>Number</code> | <code>506</code> | 
| notExtended | <code>Number</code> | <code>510</code> | 
| networkAuthenticationRequired | <code>Number</code> | <code>511</code> | 

<a name="Middleware"></a>

# Middleware
The generic base class for all middlewares

**Kind**: global constant  
**Throws**:

- <code>TypeError</code> Whenever the type is not a string.


| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>String</code> | The middleware type. |

<a name="Route"></a>

# Route
The base class for all routes.

**Kind**: global constant  
**Throws**:

- <code>TypeError</code> Whenever the method is not a string.
- <code>TypeError</code> Whenever the path is not a string.
- <code>TypeError</code> Whenever a value is not a valid descriptor or does not extend the Middleware base class.


| Param | Type | Description |
| --- | --- | --- |
| method | <code>String</code> | The route method to handle. |
| path | <code>String</code> | The route path pattern to handle. |
| ...middlewares | <code>function</code> &#124; <code>[MiddlewareDescriptor](#MiddlewareDescriptor)</code> | The route specific middlewares. |

<a name="defaultPipeline"></a>

# defaultPipeline(server) ⇒ <code>[Server](#Server)</code>
Adds a default pipeline to a server.

**Kind**: global function  
**Returns**: <code>[Server](#Server)</code> - The server with the default pipeline set.  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>[Server](#Server)</code> | The server to set the default pipeline on. |

<a name="MiddlewareDescriptor"></a>

# MiddlewareDescriptor : <code>Object</code>
A middleware descriptor.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The type of middleware. |
| enter | <code>function</code> | The functor to call when requests are initially processed. |
| leave | <code>function</code> | The functor to call when responses are finally sent out. |

<a name="RouteDescriptor"></a>

# RouteDescriptor : <code>Object</code>
A route descriptor.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| method | <code>String</code> | The route HTTP method to handle. |
| path | <code>String</code> | The route path pattern to handle. |
| middlewares | <code>Array.&lt;(function()\|MiddlewareDescriptor)&gt;</code> | The middlewares to call on the route. |
| handle | <code>function</code> | The functor to call on incoming requests. |

<a name="ServerOptions"></a>

# ServerOptions : <code>Object</code>
Server options.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| network | <code>Object</code> | <code>{}</code> | Network options. |
| network.keepAlive | <code>Boolean</code> | <code>false</code> | Whether to allow server-side keep-alive connections. |
| network.tls | <code>Object</code> | <code>{}</code> | The TLS options to use (see the `tls' module for more). |
| routing | <code>Object</code> | <code>{}</code> | Routing options. |
| routing.ignoreCase | <code>Boolean</code> | <code>true</code> | Whether routing should ignore case. |
| routing.ignoreMultiSlash | <code>Boolean</code> | <code>true</code> | Whether routing should ignore multiple consecutive slashes. |
| routing.ignoreTrailingSlash | <code>Boolean</code> | <code>true</code> | Whether routing should ignore trailing slashes. |
| routing.internalRedirect | <code>Boolean</code> | <code>true</code> | Whether malformed paths should be internally redirected. |

<a name="ServerAddress"></a>

# ServerAddress : <code>Object</code>
A listening server address

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | The network address the server is listening to. |
| family | <code>String</code> | The network family the listened address belongs to. |
| port | <code>Number</code> | The port the server is listening to. |

