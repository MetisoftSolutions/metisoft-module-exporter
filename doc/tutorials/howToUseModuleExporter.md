The purpose of `ModuleExporter` is to make it easier to add functions of different visibility levels to the `exports` object of a Node module.

# Initial setup

```javascript
var ModuleExporter = require('path/to/module-exporter/index.js').ModuleExporter;
var m = new ModuleExporter();

function publicFunction() {
  // ...
}
m.$$public(publicFunction);
```

# Usage
Functions that are exported using a `ModuleExporter` object can either be *named functions* or they can be given a name when passed into a `ModuleExporter`. The name is used as the key for the `exports` object.

```javascript
// named function
function foo(x, y) {
  return x + y;
}

// unnamed function
var bar = function(x, y) {
  return x + y;
};

// another unnamed function
var baz = (x, y) => { return x + y };

...

m.$$public(foo);            // exports['foo'] will point to the function
m.$$public(bar);            // nothing will be added to exports, since there is no name!
m.$$public(baz, 'sum');     // this function will be added, but under exports['sum']
```

There are three visibility levels that can be specified for functions:
- Private
- Public
- Client

## Private
Private functions are intended to only be used within a module itself, and shouldn't be accessible to outside callers. You might wonder why you would need to even export a private function in the first place. Normally you don't, but if you want to be able to run automated tests of your private functions, those functions will need to be accessible to the test code. To compromise, calling `$$private()` adds a function to a sub-object of `exports` called `__test`. Everything under `__test` is intended for use only by testing code.

## Public
Public functions are intended to be called by other modules, but are only accessible on the server.

## Client
Client functions are public functions that are also intended to be accessible by the client via web services (see the `web-service-server-util` and `web-service-client-util` modules). Calling `$$client()` will add the function as a public function as well as to the `__exportsToClient` sub-object of `exports`.

## Exporting a class
In addition to the visibility levels, you can also add a class as an export. Using `$$class()` will export the constructor function as the `export` object itself. Any other functions that you've added using `$$private()`, `$$public()`, and `$$client()` will be added as properties of the constructor function. Please note that only one class can be exported like this per module.

```javascript
// MyClass.js

function concat(str1, str2) {
  return str1 + str;
}
m.$$public(concat);

function MyClass() {
  this.x = 100;
}
m.$$class(MyClass);

MyClass.prototype.add = function add(y) {
  this.x += y;
};

module.exports = exports = m.$$getExports();
```

```javascript
// user.js

var MyClass = require('./MyClass.js');

// we can create a new MyClass object directly from the require
var object = new MyClass();
// add() is accessible because it's part of the MyClass prototype;
// you don't have to export functions on the prototype
object.add(200);

// we can also call public functions that we exported, even though
// they aren't part of the actual class
MyClass.concat('hi', 'there');
```

## Exporting
To export your functions, simply assign the return value of `$$getExports()` to `module.exports` and `exports`:
```javascript
module.exports = exports = m.$$getExports();
```

## Example
```javascript
function foo(x, y) {
  return x+y;
}
m.$$public(foo);

function __bar(x, y) {
  return x*y;
}
m.$$private(__bar);

function baz(userData, args) {
  var x = args.x,
      y = args.y;
      
  return Promise.resolve({
    result: x/y * 100
  });
}
m.$$client(baz, 'calcPercent');

module.exports = exports = m.$$getExports();
```

After running this, the value of `module.exports` and `exports` will be:
```javascript
{
  __test: {
    __bar: <function>
  },
  __exportsToClient: {
    calcPercent: <function>
  },
  foo: <function>,
  calcPercent: <function>
}
```