"use strict";

const assert = require("assert");

const {
	continue: statusContinue,
	switchingProtocols,

	ok,
	created,
	accepted,
	nonAuthoritativeInformation,
	noContent,
	resetContent,
	partialContent,

	multipleChoices,
	movedPermanently,
	movedTemporarily,
	seeOther,
	notModified,
	useProxy,
	temporaryRedirect,
	permanentRedirect,
	tooManyRedirects,

	badRequest,
	unauthorized,
	paymentRequired,
	forbidden,
	notFound,
	methodNotAllowed,
	notAcceptable,
	proxyAuthenticationRequired,
	requestTimeout,
	conflict,
	gone,
	lengthRequired,
	preconditionFailed,
	requestEntityTooLarge,
	requestURITooLong,
	unsupportedMediaType,
	requestedRangeUnsatisfiable,
	expectationFailed,
	imATeapot,
	misdirectedRequest,
	upgradeRequired,
	preconditionRequired,
	tooManyRequests,
	requestHeaderFieldsTooLarge,

	internalServerError,
	notImplemented,
	badGateway,
	serviceUnavailable,
	gatewayTimeout,
	httpVersionNotSupported,
	variantAlsoNegotiates,
	notExtended,
	networkAuthenticationRequired,
} = requireSrc("status");

describe("status", function () {
	it("should conform", function () {
		assert.equal(typeof(statusContinue),     "number");
		assert.equal(typeof(switchingProtocols), "number");

		assert.equal(typeof(ok),                          "number");
		assert.equal(typeof(created),                     "number");
		assert.equal(typeof(accepted),                    "number");
		assert.equal(typeof(nonAuthoritativeInformation), "number");
		assert.equal(typeof(noContent),                   "number");
		assert.equal(typeof(resetContent),                "number");
		assert.equal(typeof(partialContent),              "number");

		assert.equal(typeof(multipleChoices),   "number");
		assert.equal(typeof(movedPermanently),  "number");
		assert.equal(typeof(movedTemporarily),  "number");
		assert.equal(typeof(seeOther),          "number");
		assert.equal(typeof(notModified),       "number");
		assert.equal(typeof(useProxy),          "number");
		assert.equal(typeof(temporaryRedirect), "number");
		assert.equal(typeof(permanentRedirect), "number");
		assert.equal(typeof(tooManyRedirects),  "number");

		assert.equal(typeof(badRequest),                  "number");
		assert.equal(typeof(unauthorized),                "number");
		assert.equal(typeof(paymentRequired),             "number");
		assert.equal(typeof(forbidden),                   "number");
		assert.equal(typeof(notFound),                    "number");
		assert.equal(typeof(methodNotAllowed),            "number");
		assert.equal(typeof(notAcceptable),               "number");
		assert.equal(typeof(proxyAuthenticationRequired), "number");
		assert.equal(typeof(requestTimeout),              "number");
		assert.equal(typeof(conflict),                    "number");
		assert.equal(typeof(gone),                        "number");
		assert.equal(typeof(lengthRequired),              "number");
		assert.equal(typeof(preconditionFailed),          "number");
		assert.equal(typeof(requestEntityTooLarge),       "number");
		assert.equal(typeof(requestURITooLong),           "number");
		assert.equal(typeof(unsupportedMediaType),        "number");
		assert.equal(typeof(requestedRangeUnsatisfiable), "number");
		assert.equal(typeof(expectationFailed),           "number");
		assert.equal(typeof(imATeapot),                   "number");
		assert.equal(typeof(misdirectedRequest),          "number");
		assert.equal(typeof(upgradeRequired),             "number");
		assert.equal(typeof(preconditionRequired),        "number");
		assert.equal(typeof(tooManyRequests),             "number");
		assert.equal(typeof(requestHeaderFieldsTooLarge), "number");

		assert.equal(typeof(internalServerError),           "number");
		assert.equal(typeof(notImplemented),                "number");
		assert.equal(typeof(badGateway),                    "number");
		assert.equal(typeof(serviceUnavailable),            "number");
		assert.equal(typeof(gatewayTimeout),                "number");
		assert.equal(typeof(httpVersionNotSupported),       "number");
		assert.equal(typeof(variantAlsoNegotiates),         "number");
		assert.equal(typeof(notExtended),                   "number");
		assert.equal(typeof(networkAuthenticationRequired), "number");
	});
});
