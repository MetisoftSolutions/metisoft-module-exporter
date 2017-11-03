'use strict';
var _ = require('lodash');

/**
 * @class
 * @classdesc Objects of this class maintain a list of functions to export.
 *    Add functions of various visibility types to the `ModuleExporter` object,
 *    then use `$$getExports()` to generate the object to assign to Node's
 *    `module.exports` and `exports`.
 */
function ModuleExporter() {
	this.__exports = {
		__test: {},
		__exportsToClient: {}
	};  
	this.__class = null;
}

/**
 * Adds the named function to the module exports as a publicly-accessible
 * function.
 *
 * @public
 * @param {Function} fn
 *
 * @param {String} name
 *		Optional. If given, this will be the property name on the exports object
 *		that points to `fn`. Otherwise, `fn.name` is used.
 */
ModuleExporter.prototype.$$public = function $$public(fn, name) {
	var propName = name || fn.name;

	if (propName) {
		this.__exports[propName] = fn;
	}
};

/**
 * Adds the named function to the module exports as a privately-accessible
 * function. Most users of the module should not access the added function.
 * For testing purposes, however, the function will be made available underneath
 * the `__test` object within the exports object.
 *
 * @public
 * @param {Function} fn
 *
 * @param {String} name
 *		Optional. If given, this will be the property name on the exports object
 *		that points to `fn`. Otherwise, `fn.name` is used.
 */
ModuleExporter.prototype.$$private = function $$private(fn, name) {
	var propName = name || fn.name;
	
	if (propName) {
		this.__exports.__test[propName] = fn;
	}
};

/**
 * Adds the named function to the module exports as both a publicly-accessible
 * function and as a function that will be marked for export to the client. That
 * is, it will be added using `$$public()` as well as added to the `__exportsToClient`
 * object within the exports object.
 *
 * @public
 * @param {Function} fn
 *
 * @param {String} name
 *		Optional. If given, this will be the property name on the exports object
 *		that points to `fn`. Otherwise, `fn.name` is used.
 */
ModuleExporter.prototype.$$client = function $$client(fn, name) {
	var propName = name || fn.name;
	
	if (propName) {
		this.$$public(fn, propName);
		this.__exports.__exportsToClient[propName] = fn;
	}
};

/**
 * Adds the named function as the class of this module. The class will be
 * exported such that it can be used directly from the `require()`'s return
 * value. Any other functions added using `$$public()`, `$$private()`, and
 * `$$client()` will still be accessible from the module's exports.
 *
 * ```javascript
 * // MyClass.js
 * function MyClass() { ... }
 * function foo() { ... }
 *
 * m.$$public(foo);
 * m.$$class(MyClass);
 * ```
 *
 * ```javascript
 * // someOtherFile.js
 * var MyClass = require('MyClass.js');
 *
 * var object = new MyClass();
 * MyClass.foo();
 * ```
 *
 * @public
 * @param {Function} fn
 */
ModuleExporter.prototype.$$class = function $$class(fn) {
	if (fn.name) {
		this.__class = fn;
	}
};

/**
 * Retrieves the object used to export functions/values as a Node module.
 *
 * @public
 * @returns {Object}
 *            The exports object. This can be assigned to `module.exports`
 *            and `exports`.
 */
ModuleExporter.prototype.$$getExports = function $$getExports() {
	var exp;
	
	if (this.__class)
		exp = this.__class;
	
	exp = _.assignIn(exp, this.__exports);
	
	return exp;
};

exports = module.exports = ModuleExporter;