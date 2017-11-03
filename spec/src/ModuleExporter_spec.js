'use strict';
var _ = require('lodash');
var ModuleExporter = require('../../index.js').ModuleExporter;

describe("ModuleExporter suite", function () {

	var m;

	beforeEach(function () {
		m = new ModuleExporter();
	});



	it("should add public functions to the exports object", function () {
		function publicFunction() { }
		function anotherPublicFunction() { }
		function publicFunctionWithDiffName() { }

		m.$$public(publicFunction);
		m.$$public(anotherPublicFunction);
		m.$$public(publicFunctionWithDiffName, 'diffName');
		var exp = m.$$getExports();

		var expected = {
			__test: {},
			__exportsToClient: {},
			publicFunction: publicFunction,
			anotherPublicFunction: anotherPublicFunction,
			diffName: publicFunctionWithDiffName
		};

		expect(exp).toEqual(expected);
	});



	it("should add private functions to the __test object", function () {
		function privateFunction() { }
		function anotherPrivateFunction() { }
		function privateFunctionWithDiffName() { }

		m.$$private(privateFunction);
		m.$$private(anotherPrivateFunction);
		m.$$private(privateFunctionWithDiffName, 'diffName');
		var exp = m.$$getExports();

		var expected = {
			__test: {
				privateFunction: privateFunction,
				anotherPrivateFunction: anotherPrivateFunction,
				diffName: privateFunctionWithDiffName
			},
			__exportsToClient: {}
		};

		expect(exp).toEqual(expected);
	});



	it("should add client functions to __exportsToClient and as public functions", function () {
		function clientFunction() { }
		function anotherClientFunction() { }
		function clientFunctionWithDiffName() { }

		m.$$client(clientFunction);
		m.$$client(anotherClientFunction);
		m.$$client(clientFunctionWithDiffName, 'diffName');
		var exp = m.$$getExports();

		var expected = {
			__test: {},
			__exportsToClient: {
				clientFunction: clientFunction,
				anotherClientFunction: anotherClientFunction,
				diffName: clientFunctionWithDiffName
			},
			clientFunction: clientFunction,
			anotherClientFunction: anotherClientFunction,
			diffName: clientFunctionWithDiffName
		};

		expect(exp).toEqual(expected);
	});



	it("should export a class and other functions properly", function () {
		function MyClass() { }
		function someFunction() { }
		function someOtherFunction() { }
		function someFunctionWithDiffName() { }

		m.$$public(someFunction);
		m.$$private(someOtherFunction);
		m.$$class(MyClass);
		m.$$public(someFunctionWithDiffName, 'diffName');
		var exp = m.$$getExports();

		expect(_.isFunction(exp)).toEqual(true);
		expect(_.isFunction(exp.someFunction)).toEqual(true);
		expect(_.isFunction(exp.__test.someOtherFunction)).toEqual(true);
		expect(_.isFunction(exp.diffName)).toEqual(true);
	});



	it("should add public, private, and client functions the exporter propertly", function () {
		function somePublicFunction() { }
		function someClientFunction() { }
		function somePrivateFunction() { }
		function someDiffNameFunction() { }

		m.$$public(somePublicFunction);
		m.$$client(someClientFunction);
		m.$$private(somePrivateFunction);
		m.$$private(someDiffNameFunction, 'diffName');

		var result = m.$$getExports();

		var expected = {
			__test: {
				somePrivateFunction: somePrivateFunction,
				diffName: someDiffNameFunction
			},
			__exportsToClient: {
				someClientFunction: someClientFunction
			},
			somePublicFunction: somePublicFunction,
			someClientFunction: someClientFunction
		};
		expect(result).toEqual(expected);
	});


	it("should export functions inside a class as part of that class", function () {
		function MyClass() {
			this.add = function (a, b) { return a + b; }
		}

		m.$$class(MyClass);

		var ExportResult = m.$$getExports();
		var myClass = new ExportResult();

		expect(myClass.add(2, 2)).toEqual(4);
	});
});