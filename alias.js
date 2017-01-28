"use strict";

const path = require("path");

/**
 * Requires a path located somewhere below the module `src' directory.
 * @private
 *
 * @param {...String} args The path parts after the module `src' directory.
 *
 * @returns {*} The required module.
 */
const requireSrc = function requireSrc(...args) {
	return require(path.resolve(...[__dirname, "src"].concat(args)));
};

global.requireSrc = requireSrc;
