"use strict";

/**
 * HTTP response status codes.
 * @enum {Number}
 */
const statuses = {
	continue:           100,
	switchingProtocols: 101,

	ok:                          200,
	created:                     201,
	accepted:                    202,
	nonAuthoritativeInformation: 203,
	noContent:                   204,
	resetContent:                205,
	partialContent:              206,

	multipleChoices:   300,
	movedPermanently:  301,
	movedTemporarily:  302,
	seeOther:          303,
	notModified:       304,
	useProxy:          305,
	temporaryRedirect: 307,
	permanentRedirect: 308,
	tooManyRedirects:  310,

	badRequest:                  400,
	unauthorized:                401,
	paymentRequired:             402,
	forbidden:                   403,
	notFound:                    404,
	methodNotAllowed:            405,
	notAcceptable:               406,
	proxyAuthenticationRequired: 407,
	requestTimeout:              408,
	conflict:                    409,
	gone:                        410,
	lengthRequired:              411,
	preconditionFailed:          412,
	requestEntityTooLarge:       413,
	requestURITooLong:           414,
	unsupportedMediaType:        415,
	requestedRangeUnsatisfiable: 416,
	expectationFailed:           417,
	imATeapot:                   418,
	misdirectedRequest:          421,
	upgradeRequired:             426,
	preconditionRequired:        428,
	tooManyRequests:             429,
	requestHeaderFieldsTooLarge: 431,

	internalServerError:           500,
	notImplemented:                501,
	badGateway:                    502,
	serviceUnavailable:            503,
	gatewayTimeout:                504,
	httpVersionNotSupported:       505,
	variantAlsoNegotiates:         506,
	notExtended:                   510,
	networkAuthenticationRequired: 511,
};

module.exports = statuses;
