(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $getPrototypeOf = $Object.getPrototypeOf;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v)) return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol)) return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined) desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    $freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  $freeze(SymbolValue.prototype);
  Symbol.iterator = Symbol();
  function toProperty(name) {
    if (isSymbol(name)) return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name]) rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name))) $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
    function is(left, right) {
      if (left === right) return left !== 0 || 1 / left === 1 / right;
      return left !== left && right !== right;
    }
    $defineProperty(Object, 'is', method(is));
    function assign(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        target[props[p]] = source[props[p]];
      }
      return target;
    }
    $defineProperty(Object, 'assign', method(assign));
    function mixin(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          descriptor,
          length = props.length;
      for (p = 0; p < length; p++) {
        descriptor = $getOwnPropertyDescriptor(source, props[p]);
        $defineProperty(target, props[p], descriptor);
      }
      return target;
    }
    $defineProperty(Object, 'mixin', method(mixin));
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function toObject(value) {
    if (value == null) throw $TypeError();
    return $Object(value);
  }
  function spread() {
    var rv = [],
        k = 0;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = toObject(arguments[i]);
      for (var j = 0; j < valueToSpread.length; j++) {
        rv[k++] = valueToSpread[j];
      }
    }
    return rv;
  }
  function getPropertyDescriptor(object, name) {
    while (object !== null) {
      var result = $getOwnPropertyDescriptor(object, name);
      if (result) return result;
      object = $getPrototypeOf(object);
    }
    return undefined;
  }
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    if (!proto) throw $TypeError('super is null');
    return getPropertyDescriptor(proto, name);
  }
  function superCall(self, homeObject, name, args) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if ('value'in descriptor) return descriptor.value.apply(self, args);
      if (descriptor.get) return descriptor.get.call(self).apply(self, args);
    }
    throw $TypeError("super has no method '" + name + "'.");
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (descriptor.get) return descriptor.get.call(self); else if ('value'in descriptor) return descriptor.value;
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function') ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null) return superClass.prototype;
    }
    if (superClass === null) return null;
    throw new TypeError();
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null) superCall(self, homeObject, 'constructor', args);
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var ACTION_SEND = 0;
  var ACTION_THROW = 1;
  function addIterator(object) {
    return defineProperty(object, Symbol.iterator, nonEnum(function() {
      return this;
    }));
  }
  function generatorWrap(generator) {
    return addIterator({
      next: function(x) {
        switch (generator.GState) {
          case ST_EXECUTING:
            throw new Error('"next" on executing generator');
          case ST_CLOSED:
            throw new Error('"next" on closed generator');
          case ST_NEWBORN:
            if (x !== undefined) {
              throw $TypeError('Sent value to newborn generator');
            }
          case ST_SUSPENDED:
            generator.GState = ST_EXECUTING;
            if (generator.moveNext(x, ACTION_SEND)) {
              generator.GState = ST_SUSPENDED;
              return {
                value: generator.current,
                done: false
              };
            }
            generator.GState = ST_CLOSED;
            return {
              value: generator.yieldReturn,
              done: true
            };
        }
      },
      throw: function(x) {
        switch (generator.GState) {
          case ST_EXECUTING:
            throw new Error('"throw" on executing generator');
          case ST_CLOSED:
            throw new Error('"throw" on closed generator');
          case ST_NEWBORN:
            generator.GState = ST_CLOSED;
            throw x;
          case ST_SUSPENDED:
            generator.GState = ST_EXECUTING;
            if (generator.moveNext(x, ACTION_THROW)) {
              generator.GState = ST_SUSPENDED;
              return {
                value: generator.current,
                done: false
              };
            }
            generator.GState = ST_CLOSED;
            return {
              value: generator.yieldReturn,
              done: true
            };
        }
      }
    });
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    createClass: createClass,
    defaultSuperCall: defaultSuperCall,
    exportStar: exportStar,
    generatorWrap: generatorWrap,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    spread: spread,
    superCall: superCall,
    superGet: superGet,
    superSet: superSet,
    toObject: toObject,
    toProperty: toProperty,
    typeof: typeOf
  };
})(typeof global !== 'undefined' ? global: this);
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/') return '/';
    var leadingSlash = path[0] === '/' ? '/': '';
    var trailingSlash = path.slice(- 1) === '/' ? '/': '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length) out.pop(); else up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0) out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH];
    path = removeDotSegments(path.replace(/\/\//.g, '/'));
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name) return false;
    if (name[0] === '/') return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME]) return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__1 = $traceurRuntime,
      canonicalizeUrl = $__1.canonicalizeUrl,
      resolveUrl = $__1.resolveUrl,
      isAbsolute = $__1.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href) baseURL = resolveUrl(global.location.href, './'); else baseURL = '';
  var UncoatedModuleEntry = function(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  UncoatedModuleEntry = ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var UncoatedModuleInstantiator = function(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_) return this.value_;
      return this.value_ = this.func.call(global);
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name) return;
    var url = System.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get) getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var System = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string") throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name)) return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (refererName) return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(name) {
      var m = getUncoatedModuleInstantiator(name);
      if (!m) return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance) return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(name, uncoatedModule) {
      name = String(name);
      moduleInstantiators[name] = new UncoatedModuleEntry(name, uncoatedModule);
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = System.normalize(name);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    }
  };
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  global.System = System;
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global: this);
System.registerModule("traceur@0.0.Y/src/runtime/polyfills/utils", function() {
  "use strict";
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x | 0;
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/runtime/polyfills/ArrayIterator", function() {
  "use strict";
  var $__3;
  var $__4 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/polyfills/utils"),
      toObject = $__4.toObject,
      toUint32 = $__4.toUint32;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function() {};
  ArrayIterator = ($traceurRuntime.createClass)(ArrayIterator, ($__3 = {}, Object.defineProperty($__3, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES) return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES) return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__3, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__3), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/events", function() {
  "use strict";
  var indexOf = function(callbacks, callback) {
    for (var i = 0,
        l = callbacks.length; i < l; i++) {
      if (callbacks[i] === callback) {
        return i;
      }
    }
    return - 1;
  };
  var callbacksFor = function(object) {
    var callbacks = object._promiseCallbacks;
    if (!callbacks) {
      callbacks = object._promiseCallbacks = {};
    }
    return callbacks;
  };
  var $__default = {
    mixin: function(object) {
      object.on = this.on;
      object.off = this.off;
      object.trigger = this.trigger;
      object._promiseCallbacks = undefined;
      return object;
    },
    on: function(eventName, callback) {
      var allCallbacks = callbacksFor(this),
          callbacks;
      callbacks = allCallbacks[eventName];
      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }
      if (indexOf(callbacks, callback) === - 1) {
        callbacks.push(callback);
      }
    },
    off: function(eventName, callback) {
      var allCallbacks = callbacksFor(this),
          callbacks,
          index;
      if (!callback) {
        allCallbacks[eventName] = [];
        return;
      }
      callbacks = allCallbacks[eventName];
      index = indexOf(callbacks, callback);
      if (index !== - 1) {
        callbacks.splice(index, 1);
      }
    },
    trigger: function(eventName, options) {
      var allCallbacks = callbacksFor(this),
          callbacks,
          callbackTuple,
          callback,
          binding;
      if (callbacks = allCallbacks[eventName]) {
        for (var i = 0; i < callbacks.length; i++) {
          callback = callbacks[i];
          callback(options);
        }
      }
    }
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/config", function() {
  "use strict";
  var EventTarget = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/events").default;
  var config = {instrument: false};
  EventTarget.mixin(config);
  function configure(name, value) {
    if (name === 'onerror') {
      config.on('error', value);
      return;
    }
    if (arguments.length === 2) {
      config[name] = value;
    } else {
      return config[name];
    }
  }
  ;
  return {
    get config() {
      return config;
    },
    get configure() {
      return configure;
    }
  };
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils", function() {
  "use strict";
  function objectOrFunction(x) {
    return typeof x === "function" || (typeof x === "object" && x !== null);
  }
  function isFunction(x) {
    return typeof x === "function";
  }
  function isNonThenable(x) {
    return !objectOrFunction(x);
  }
  function isArray(x) {
    return Object.prototype.toString.call(x) === "[object Array]";
  }
  var now = Date.now || function() {
    return new Date().getTime();
  };
  var keysOf = Object.keys || function(object) {
    var result = [];
    for (var prop in object) {
      result.push(prop);
    }
    return result;
  };
  return {
    get objectOrFunction() {
      return objectOrFunction;
    },
    get isFunction() {
      return isFunction;
    },
    get isNonThenable() {
      return isNonThenable;
    },
    get isArray() {
      return isArray;
    },
    get now() {
      return now;
    },
    get keysOf() {
      return keysOf;
    }
  };
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/instrument", function() {
  "use strict";
  var config = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/config").config;
  var now = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils").now;
  var $__default = function instrument(eventName, promise, child) {
    try {
      config.trigger(eventName, {
        guid: promise._guidKey + promise._id,
        eventName: eventName,
        detail: promise._detail,
        childGuid: child && promise._guidKey + child._id,
        label: promise._label,
        timeStamp: now(),
        stack: new Error(promise._label).stack
      });
    } catch (error) {
      setTimeout(function() {
        throw error;
      }, 0);
    }
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/all", function() {
  "use strict";
  var $__7 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isArray = $__7.isArray,
      isNonThenable = $__7.isNonThenable;
  var $__default = function all(entries, label) {
    var Constructor = this;
    return new Constructor(function(resolve, reject) {
      if (!isArray(entries)) {
        throw new TypeError('You must pass an array to all.');
      }
      var remaining = entries.length;
      var results = new Array(remaining);
      var entry,
          pending = true;
      if (remaining === 0) {
        resolve(results);
        return;
      }
      function fulfillmentAt(index) {
        return function(value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        };
      }
      function onRejection(reason) {
        remaining = 0;
        reject(reason);
      }
      for (var index = 0; index < entries.length; index++) {
        entry = entries[index];
        if (isNonThenable(entry)) {
          results[index] = entry;
          if (--remaining === 0) {
            resolve(results);
          }
        } else {
          Constructor.cast(entry).then(fulfillmentAt(index), onRejection);
        }
      }
    }, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/cast", function() {
  "use strict";
  var $__default = function cast(object, label) {
    var Constructor = this;
    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }
    return new Constructor(function(resolve) {
      resolve(object);
    }, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/race", function() {
  "use strict";
  var $__8 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isArray = $__8.isArray,
      isFunction = $__8.isFunction,
      isNonThenable = $__8.isNonThenable;
  var $__default = function race(entries, label) {
    var Constructor = this,
        entry;
    return new Constructor(function(resolve, reject) {
      if (!isArray(entries)) {
        throw new TypeError('You must pass an array to race.');
      }
      var pending = true;
      function onFulfillment(value) {
        if (pending) {
          pending = false;
          resolve(value);
        }
      }
      function onRejection(reason) {
        if (pending) {
          pending = false;
          reject(reason);
        }
      }
      for (var i = 0; i < entries.length; i++) {
        entry = entries[i];
        if (isNonThenable(entry)) {
          pending = false;
          resolve(entry);
          return;
        } else {
          Constructor.cast(entry).then(onFulfillment, onRejection);
        }
      }
    }, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/reject", function() {
  "use strict";
  var $__default = function reject(reason, label) {
    var Constructor = this;
    return new Constructor(function(resolve, reject) {
      reject(reason);
    }, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/resolve", function() {
  "use strict";
  var $__default = function resolve(value, label) {
    var Constructor = this;
    return new Constructor(function(resolve, reject) {
      resolve(value);
    }, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise", function() {
  "use strict";
  var config = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/config").config;
  var EventTarget = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/events").default;
  var instrument = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/instrument").default;
  var $__9 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      objectOrFunction = $__9.objectOrFunction,
      isFunction = $__9.isFunction,
      now = $__9.now;
  var cast = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/cast").default;
  var all = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/all").default;
  var race = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/race").default;
  var Resolve = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/resolve").default;
  var Reject = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise/reject").default;
  var guidKey = 'rsvp_' + now() + '-';
  var counter = 0;
  function noop() {}
  var $__default = Promise;
  function Promise(resolver, label) {
    if (!isFunction(resolver)) {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }
    if (!(this instanceof Promise)) {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }
    this._id = counter++;
    this._label = label;
    this._subscribers = [];
    if (config.instrument) {
      instrument('created', this);
    }
    if (noop !== resolver) {
      invokeResolver(resolver, this);
    }
  }
  function invokeResolver(resolver, promise) {
    function resolvePromise(value) {
      resolve(promise, value);
    }
    function rejectPromise(reason) {
      reject(promise, reason);
    }
    try {
      resolver(resolvePromise, rejectPromise);
    } catch (e) {
      rejectPromise(e);
    }
  }
  Promise.cast = cast;
  Promise.all = all;
  Promise.race = race;
  Promise.resolve = Resolve;
  Promise.reject = Reject;
  var PENDING = void 0;
  var SEALED = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  function subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;
    subscribers[length] = child;
    subscribers[length + FULFILLED] = onFulfillment;
    subscribers[length + REJECTED] = onRejection;
  }
  function publish(promise, settled) {
    var child,
        callback,
        subscribers = promise._subscribers,
        detail = promise._detail;
    if (config.instrument) {
      instrument(settled === FULFILLED ? 'fulfilled': 'rejected', promise);
    }
    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];
      invokeCallback(settled, child, callback, detail);
    }
    promise._subscribers = null;
  }
  Promise.prototype = {
    constructor: Promise,
    _id: undefined,
    _guidKey: guidKey,
    _label: undefined,
    _state: undefined,
    _detail: undefined,
    _subscribers: undefined,
    _onerror: function(reason) {
      config.trigger('error', reason);
    },
    then: function(onFulfillment, onRejection, label) {
      var promise = this;
      this._onerror = null;
      var thenPromise = new this.constructor(noop, label);
      if (this._state) {
        var callbacks = arguments;
        config.async(function invokePromiseCallback() {
          invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
        });
      } else {
        subscribe(this, thenPromise, onFulfillment, onRejection);
      }
      if (config.instrument) {
        instrument('chained', promise, thenPromise);
      }
      return thenPromise;
    },
    'catch': function(onRejection, label) {
      return this.then(null, onRejection, label);
    },
    'finally': function(callback, label) {
      var constructor = this.constructor;
      return this.then(function(value) {
        return constructor.cast(callback()).then(function() {
          return value;
        });
      }, function(reason) {
        return constructor.cast(callback()).then(function() {
          throw reason;
        });
      }, label);
    }
  };
  function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback),
        value,
        error,
        succeeded,
        failed;
    if (hasCallback) {
      try {
        value = callback(detail);
        succeeded = true;
      } catch (e) {
        failed = true;
        error = e;
      }
    } else {
      value = detail;
      succeeded = true;
    }
    if (handleThenable(promise, value)) {
      return;
    } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      resolve(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
  }
  function handleThenable(promise, value) {
    var then = null,
        resolved;
    try {
      if (promise === value) {
        throw new TypeError("A promises callback cannot return that same promise.");
      }
      if (objectOrFunction(value)) {
        then = value.then;
        if (isFunction(then)) {
          then.call(value, function(val) {
            if (resolved) {
              return true;
            }
            resolved = true;
            if (value !== val) {
              resolve(promise, val);
            } else {
              fulfill(promise, val);
            }
          }, function(val) {
            if (resolved) {
              return true;
            }
            resolved = true;
            reject(promise, val);
          }, 'derived from: ' + (promise._label || ' unknown promise'));
          return true;
        }
      }
    } catch (error) {
      if (resolved) {
        return true;
      }
      reject(promise, error);
      return true;
    }
    return false;
  }
  function resolve(promise, value) {
    if (promise === value) {
      fulfill(promise, value);
    } else if (!handleThenable(promise, value)) {
      fulfill(promise, value);
    }
  }
  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = SEALED;
    promise._detail = value;
    config.async(publishFulfillment, promise);
  }
  function reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = SEALED;
    promise._detail = reason;
    config.async(publishRejection, promise);
  }
  function publishFulfillment(promise) {
    publish(promise, promise._state = FULFILLED);
  }
  function publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._detail);
    }
    publish(promise, promise._state = REJECTED);
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__default = function all(array, label) {
    return Promise.all(array, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all_settled", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__11 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isArray = $__11.isArray,
      isNonThenable = $__11.isNonThenable;
  var $__default = function allSettled(entries, label) {
    return new Promise(function(resolve, reject) {
      if (!isArray(entries)) {
        throw new TypeError('You must pass an array to allSettled.');
      }
      var remaining = entries.length;
      var entry;
      if (remaining === 0) {
        resolve([]);
        return;
      }
      var results = new Array(remaining);
      function fulfilledResolver(index) {
        return function(value) {
          resolveAll(index, fulfilled(value));
        };
      }
      function rejectedResolver(index) {
        return function(reason) {
          resolveAll(index, rejected(reason));
        };
      }
      function resolveAll(index, value) {
        results[index] = value;
        if (--remaining === 0) {
          resolve(results);
        }
      }
      for (var index = 0; index < entries.length; index++) {
        entry = entries[index];
        if (isNonThenable(entry)) {
          resolveAll(index, fulfilled(entry));
        } else {
          Promise.cast(entry).then(fulfilledResolver(index), rejectedResolver(index));
        }
      }
    }, label);
  };
  function fulfilled(value) {
    return {
      state: 'fulfilled',
      value: value
    };
  }
  function rejected(reason) {
    return {
      state: 'rejected',
      reason: reason
    };
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/asap", function() {
  "use strict";
  var $__default = function asap(callback, arg) {
    var length = queue.push([callback, arg]);
    if (length === 1) {
      scheduleFlush();
    }
  };
  var browserGlobal = (typeof window !== 'undefined') ? window: {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = [];
  function flush() {
    for (var i = 0; i < queue.length; i++) {
      var tuple = queue[i];
      var callback = tuple[0],
          arg = tuple[1];
      callback(arg);
    }
    queue = [];
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/defer", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__default = function defer(label) {
    var deferred = {};
    deferred.promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    }, label);
    return deferred;
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/map", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var all = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all").default;
  var $__13 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isArray = $__13.isArray,
      isFunction = $__13.isFunction;
  var $__default = function map(promises, mapFn, label) {
    return all(promises, label).then(function(results) {
      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to map.');
      }
      if (!isFunction(mapFn)) {
        throw new TypeError("You must pass a function to map's second argument.");
      }
      var resultLen = results.length,
          mappedResults = [],
          i;
      for (i = 0; i < resultLen; i++) {
        mappedResults.push(mapFn(results[i]));
      }
      return all(mappedResults, label);
    });
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/filter", function() {
  "use strict";
  var all = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all").default;
  var map = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/map").default;
  var $__14 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isFunction = $__14.isFunction,
      isArray = $__14.isArray;
  function filter(promises, filterFn, label) {
    return all(promises, label).then(function(values) {
      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to filter.');
      }
      if (!isFunction(filterFn)) {
        throw new TypeError("You must pass a function to filter's second argument.");
      }
      return map(promises, filterFn, label).then(function(filterResults) {
        var i,
            valuesLen = values.length,
            filtered = [];
        for (i = 0; i < valuesLen; i++) {
          if (filterResults[i]) filtered.push(values[i]);
        }
        return filtered;
      });
    });
  }
  var $__default = filter;
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/hash", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__15 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/utils"),
      isNonThenable = $__15.isNonThenable,
      keysOf = $__15.keysOf;
  var $__default = function hash(object, label) {
    return new Promise(function(resolve, reject) {
      var results = {};
      var keys = keysOf(object);
      var remaining = keys.length;
      var entry,
          property;
      if (remaining === 0) {
        resolve(results);
        return;
      }
      function fulfilledTo(property) {
        return function(value) {
          results[property] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        };
      }
      function onRejection(reason) {
        remaining = 0;
        reject(reason);
      }
      for (var i = 0; i < keys.length; i++) {
        property = keys[i];
        entry = object[property];
        if (isNonThenable(entry)) {
          results[property] = entry;
          if (--remaining === 0) {
            resolve(results);
          }
        } else {
          Promise.cast(entry).then(fulfilledTo(property), onRejection);
        }
      }
    });
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/node", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var slice = Array.prototype.slice;
  function makeNodeCallbackFor(resolve, reject) {
    return function(error, value) {
      if (error) {
        reject(error);
      } else if (arguments.length > 2) {
        resolve(slice.call(arguments, 1));
      } else {
        resolve(value);
      }
    };
  }
  var $__default = function denodeify(nodeFunc, binding) {
    return function() {
      var nodeArgs = slice.call(arguments),
          resolve,
          reject;
      var thisArg = this || binding;
      return new Promise(function(resolve, reject) {
        Promise.all(nodeArgs).then(function(nodeArgs) {
          try {
            nodeArgs.push(makeNodeCallbackFor(resolve, reject));
            nodeFunc.apply(thisArg, nodeArgs);
          } catch (e) {
            reject(e);
          }
        });
      });
    };
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/race", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__default = function race(array, label) {
    return Promise.race(array, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/reject", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__default = function reject(reason, label) {
    return Promise.reject(reason, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/resolve", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var $__default = function resolve(value, label) {
    return Promise.resolve(value, label);
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/rethrow", function() {
  "use strict";
  var $__default = function rethrow(reason) {
    setTimeout(function() {
      throw reason;
    });
    throw reason;
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/node_modules/rsvp/lib/rsvp", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/promise").default;
  var EventTarget = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/events").default;
  var denodeify = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/node").default;
  var all = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all").default;
  var allSettled = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/all_settled").default;
  var race = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/race").default;
  var hash = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/hash").default;
  var rethrow = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/rethrow").default;
  var defer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/defer").default;
  var $__20 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/config"),
      config = $__20.config,
      configure = $__20.configure;
  var map = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/map").default;
  var resolve = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/resolve").default;
  var reject = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/reject").default;
  var filter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/filter").default;
  var asap = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp/asap").default;
  config.async = asap;
  function async(callback, arg) {
    config.async(callback, arg);
  }
  function on() {
    config.on.apply(config, arguments);
  }
  function off() {
    config.off.apply(config, arguments);
  }
  if (typeof window !== 'undefined' && typeof window.__PROMISE_INSTRUMENTATION__ === 'object') {
    var callbacks = window.__PROMISE_INSTRUMENTATION__;
    configure('instrument', true);
    for (var eventName in callbacks) {
      if (callbacks.hasOwnProperty(eventName)) {
        on(eventName, callbacks[eventName]);
      }
    }
  }
  ;
  return {
    get Promise() {
      return Promise;
    },
    get EventTarget() {
      return EventTarget;
    },
    get all() {
      return all;
    },
    get allSettled() {
      return allSettled;
    },
    get race() {
      return race;
    },
    get hash() {
      return hash;
    },
    get rethrow() {
      return rethrow;
    },
    get defer() {
      return defer;
    },
    get denodeify() {
      return denodeify;
    },
    get configure() {
      return configure;
    },
    get on() {
      return on;
    },
    get off() {
      return off;
    },
    get resolve() {
      return resolve;
    },
    get reject() {
      return reject;
    },
    get async() {
      return async;
    },
    get map() {
      return map;
    },
    get filter() {
      return filter;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/runtime/polyfills/Promise", function() {
  "use strict";
  var async = $traceurRuntime.getModuleImpl("traceur@0.0.Y/node_modules/rsvp/lib/rsvp").async;
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1]: (function(x) {
      return x;
    });
    var onReject = arguments[2] !== (void 0) ? arguments[2]: (function(e) {
      throw e;
    });
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 'pending':
        promise.onResolve_.push([deferred, onResolve]);
        promise.onReject_.push([deferred, onReject]);
        break;
      case 'resolved':
        promiseReact(deferred, onResolve, promise.value_);
        break;
      case 'rejected':
        promiseReact(deferred, onReject, promise.value_);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    var result = {};
    result.promise = new C((function(resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    }));
    return result;
  }
  var Promise = function(resolver) {
    var $__21 = this;
    this.status_ = 'pending';
    this.onResolve_ = [];
    this.onReject_ = [];
    resolver((function(x) {
      promiseResolve($__21, x);
    }), (function(r) {
      promiseReject($__21, r);
    }));
  };
  Promise = ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function() {
      var onResolve = arguments[0] !== (void 0) ? arguments[0]: (function(x) {
        return x;
      });
      var onReject = arguments[1];
      var $__21 = this;
      var constructor = this.constructor;
      return chain(this, (function(x) {
        x = promiseCoerce(constructor, x);
        return x === $__21 ? onReject(new TypeError): isPromise(x) ? x.then(onResolve, onReject): onResolve(x);
      }), onReject);
    }
  }, {
    resolve: function(x) {
      return new this((function(resolve, reject) {
        resolve(x);
      }));
    },
    reject: function(r) {
      return new this((function(resolve, reject) {
        reject(r);
      }));
    },
    cast: function(x) {
      if (x instanceof this) return x;
      if (isPromise(x)) {
        var result = getDeferred(this);
        chain(x, result.resolve, result.reject);
        return result.promise;
      }
      return this.resolve(x);
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var count = 0;
      var resolutions = [];
      try {
        for (var i = 0; i < values.length; i++) {
          ++count;
          this.cast(values[i]).then(function(i, x) {
            resolutions[i] = x;
            if (--count === 0) deferred.resolve(resolutions);
          }.bind(undefined, i), (function(r) {
            if (count > 0) count = 0;
            deferred.reject(r);
          }));
        }
        if (count === 0) deferred.resolve(resolutions);
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.cast(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  function promiseResolve(promise, x) {
    promiseDone(promise, 'resolved', x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, 'rejected', r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 'pending') return;
    for (var i = 0; i < reactions.length; i++) {
      promiseReact(reactions[i][0], reactions[i][1], value);
    }
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = promise.onReject_ = undefined;
  }
  function promiseReact(deferred, handler, x) {
    async((function() {
      try {
        var y = handler(x);
        if (y === deferred.promise) throw new TypeError; else if (isPromise(y)) chain(y, deferred.resolve, deferred.reject); else deferred.resolve(y);
      } catch (e) {
        deferred.reject(e);
      }
    }));
  }
  var thenableSymbol = '@@thenable';
  function promiseCoerce(constructor, x) {
    if (isPromise(x)) {
      return x;
    } else if (x && typeof x.then === 'function') {
      var p = x[thenableSymbol];
      if (p) {
        return p;
      } else {
        var deferred = getDeferred(constructor);
        x[thenableSymbol] = deferred.promise;
        try {
          x.then(deferred.resolve, deferred.reject);
        } catch (e) {
          deferred.reject(e);
        }
        return deferred.promise;
      }
    } else {
      return x;
    }
  }
  return {get Promise() {
      return Promise;
    }};
});
System.registerModule("traceur@0.0.Y/src/runtime/polyfills/String", function() {
  "use strict";
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1]: undefined;
    var pos = position ? Number(position): 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position): 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1]: undefined;
    var pos = position ? Number(position): 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != - 1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count): 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position): 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0) return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len) return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = - 1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/runtime/polyfills/polyfills", function() {
  "use strict";
  var Promise = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/polyfills/Promise").Promise;
  var $__24 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/polyfills/String"),
      codePointAt = $__24.codePointAt,
      contains = $__24.contains,
      endsWith = $__24.endsWith,
      fromCodePoint = $__24.fromCodePoint,
      repeat = $__24.repeat,
      raw = $__24.raw,
      startsWith = $__24.startsWith;
  var $__24 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/polyfills/ArrayIterator"),
      entries = $__24.entries,
      keys = $__24.keys,
      values = $__24.values;
  function maybeDefineMethod(object, name, value) {
    if (!(name in object)) {
      Object.defineProperty(object, name, {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function polyfillPromise(global) {
    if (!global.Promise) global.Promise = Promise;
  }
  function polyfillString(String) {
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
  }
  function polyfillArray(Array, Symbol) {
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values]);
    if (Symbol && Symbol.iterator) {
      Object.defineProperty(Array.prototype, Symbol.iterator, {
        value: values,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }
  function polyfill(global) {
    polyfillPromise(global);
    polyfillString(global.String);
    polyfillArray(global.Array, global.Symbol);
  }
  polyfill(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfill(global);
  };
  return {};
});
var $__26 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/polyfills/polyfills");
System.registerModule("traceur@0.0.Y/src/options", function() {
  "use strict";
  var parseOptions = Object.create(null);
  var transformOptions = Object.create(null);
  var defaultValues = Object.create(null);
  var experimentalOptions = Object.create(null);
  var options = {
    set experimental(v) {
      v = coerceOptionValue(v);
      Object.keys(experimentalOptions).forEach((function(name) {
        options[name] = v;
      }));
    },
    get experimental() {
      var value;
      Object.keys(experimentalOptions).every((function(name) {
        var currentValue = options[name];
        if (value === undefined) {
          value = currentValue;
          return true;
        }
        if (currentValue !== value) {
          value = null;
          return false;
        }
        return true;
      }));
      return value;
    }
  };
  var descriptions = {experimental: 'Turns on all experimental features'};
  function reset() {
    var allOff = arguments[0];
    var useDefault = allOff === undefined;
    Object.keys(options).forEach((function(name) {
      options[name] = useDefault && defaultValues[name];
    }));
  }
  function fromString(s) {
    fromArgv(s.split(/\s+/));
  }
  function fromArgv(args) {
    args.forEach(parseCommand);
  }
  function setFromObject(object) {
    Object.keys(object).forEach((function(name) {
      options[name] = object[name];
    }));
  }
  function coerceOptionValue(v) {
    switch (v) {
      case 'false':
        return false;
      case 'true':
      case true:
        return true;
      default:
        return !!v && String(v);
    }
  }
  function setOption(name, value) {
    name = toCamelCase(name);
    value = coerceOptionValue(value);
    if (name in options) {
      options[name] = value;
    } else {
      throw Error('Unknown option: ' + name);
    }
  }
  function addOptions(flags) {
    Object.keys(options).forEach(function(name) {
      var dashedName = toDashCase(name);
      if ((name in parseOptions) && (name in transformOptions)) {
        flags.option('--' + dashedName + ' [true|false|parse]', descriptions[name]);
        flags.on(dashedName, (function(value) {
          return setOption(dashedName, value);
        }));
      } else {
        flags.option('--' + dashedName, descriptions[name]);
        flags.on(dashedName, (function() {
          return setOption(dashedName, true);
        }));
      }
    });
    flags.option('--referrer <name>', 'Bracket output code with System.referrerName=<name>', (function(name) {
      setOption('referrer', name);
      return name;
    }));
  }
  function filterOption(dashedName) {
    var name = toCamelCase(dashedName);
    return name === 'experimental' || !(name in options);
  }
  Object.defineProperties(options, {
    reset: {value: reset},
    fromString: {value: fromString},
    fromArgv: {value: fromArgv},
    setFromObject: {value: setFromObject},
    addOptions: {value: addOptions},
    filterOption: {value: filterOption}
  });
  function parseCommand(s) {
    var re = /--([^=]+)(?:=(.+))?/;
    var m = re.exec(s);
    if (m) setOption(m[1], m[2] || true);
  }
  function toCamelCase(s) {
    return s.replace(/-\w/g, function(ch) {
      return ch[1].toUpperCase();
    });
  }
  function toDashCase(s) {
    return s.replace(/[A-W]/g, function(ch) {
      return '-' + ch.toLowerCase();
    });
  }
  var EXPERIMENTAL = 0;
  var ON_BY_DEFAULT = 1;
  function addFeatureOption(name, kind) {
    if (kind === EXPERIMENTAL) experimentalOptions[name] = true;
    Object.defineProperty(parseOptions, name, {
      get: function() {
        return !!options[name];
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(transformOptions, name, {
      get: function() {
        var v = options[name];
        if (v === 'parse') return false;
        return v;
      },
      enumerable: true,
      configurable: true
    });
    var defaultValue = kind === ON_BY_DEFAULT;
    options[name] = defaultValue;
    defaultValues[name] = defaultValue;
  }
  function addBoolOption(name) {
    defaultValues[name] = false;
    options[name] = false;
  }
  addFeatureOption('arrayComprehension', ON_BY_DEFAULT);
  addFeatureOption('arrowFunctions', ON_BY_DEFAULT);
  addFeatureOption('classes', ON_BY_DEFAULT);
  addFeatureOption('computedPropertyNames', ON_BY_DEFAULT);
  addFeatureOption('defaultParameters', ON_BY_DEFAULT);
  addFeatureOption('destructuring', ON_BY_DEFAULT);
  addFeatureOption('forOf', ON_BY_DEFAULT);
  addFeatureOption('generatorComprehension', ON_BY_DEFAULT);
  addFeatureOption('generators', ON_BY_DEFAULT);
  addFeatureOption('modules', ON_BY_DEFAULT);
  addFeatureOption('numericLiterals', ON_BY_DEFAULT);
  addFeatureOption('propertyMethods', ON_BY_DEFAULT);
  addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
  addFeatureOption('restParameters', ON_BY_DEFAULT);
  addFeatureOption('spread', ON_BY_DEFAULT);
  addFeatureOption('templateLiterals', ON_BY_DEFAULT);
  addFeatureOption('blockBinding', EXPERIMENTAL);
  addFeatureOption('symbols', EXPERIMENTAL);
  addFeatureOption('deferredFunctions', EXPERIMENTAL);
  addFeatureOption('types', EXPERIMENTAL);
  addBoolOption('debug');
  addBoolOption('sourceMaps');
  addBoolOption('freeVariableChecker');
  addBoolOption('validate');
  addBoolOption('unstarredGenerators');
  defaultValues.referrer = '';
  options.referrer = null;
  return {
    get parseOptions() {
      return parseOptions;
    },
    get transformOptions() {
      return transformOptions;
    },
    get options() {
      return options;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/TokenType", function() {
  "use strict";
  var AMPERSAND = '&';
  var AMPERSAND_EQUAL = '&=';
  var AND = '&&';
  var ARROW = '=>';
  var AWAIT = 'await';
  var BACK_QUOTE = '`';
  var BANG = '!';
  var BAR = '|';
  var BAR_EQUAL = '|=';
  var BREAK = 'break';
  var CARET = '^';
  var CARET_EQUAL = '^=';
  var CASE = 'case';
  var CATCH = 'catch';
  var CLASS = 'class';
  var CLOSE_ANGLE = '>';
  var CLOSE_CURLY = '}';
  var CLOSE_PAREN = ')';
  var CLOSE_SQUARE = ']';
  var COLON = ':';
  var COMMA = ',';
  var CONST = 'const';
  var CONTINUE = 'continue';
  var DEBUGGER = 'debugger';
  var DEFAULT = 'default';
  var DELETE = 'delete';
  var DO = 'do';
  var DOT_DOT_DOT = '...';
  var ELSE = 'else';
  var END_OF_FILE = 'End of File';
  var ENUM = 'enum';
  var EQUAL = '=';
  var EQUAL_EQUAL = '==';
  var EQUAL_EQUAL_EQUAL = '===';
  var ERROR = 'error';
  var EXPORT = 'export';
  var EXTENDS = 'extends';
  var FALSE = 'false';
  var FINALLY = 'finally';
  var FOR = 'for';
  var FUNCTION = 'function';
  var GREATER_EQUAL = '>=';
  var IDENTIFIER = 'identifier';
  var IF = 'if';
  var IMPLEMENTS = 'implements';
  var IMPORT = 'import';
  var IN = 'in';
  var INSTANCEOF = 'instanceof';
  var INTERFACE = 'interface';
  var LEFT_SHIFT = '<<';
  var LEFT_SHIFT_EQUAL = '<<=';
  var LESS_EQUAL = '<=';
  var LET = 'let';
  var MINUS = '-';
  var MINUS_EQUAL = '-=';
  var MINUS_MINUS = '--';
  var NEW = 'new';
  var NO_SUBSTITUTION_TEMPLATE = 'no substitution template';
  var NOT_EQUAL = '!=';
  var NOT_EQUAL_EQUAL = '!==';
  var NULL = 'null';
  var NUMBER = 'number literal';
  var OPEN_ANGLE = '<';
  var OPEN_CURLY = '{';
  var OPEN_PAREN = '(';
  var OPEN_SQUARE = '[';
  var OR = '||';
  var PACKAGE = 'package';
  var PERCENT = '%';
  var PERCENT_EQUAL = '%=';
  var PERIOD = '.';
  var PLUS = '+';
  var PLUS_EQUAL = '+=';
  var PLUS_PLUS = '++';
  var PRIVATE = 'private';
  var PROTECTED = 'protected';
  var PUBLIC = 'public';
  var QUESTION = '?';
  var REGULAR_EXPRESSION = 'regular expression literal';
  var RETURN = 'return';
  var RIGHT_SHIFT = '>>';
  var RIGHT_SHIFT_EQUAL = '>>=';
  var SEMI_COLON = ';';
  var SLASH = '/';
  var SLASH_EQUAL = '/=';
  var STAR = '*';
  var STAR_EQUAL = '*=';
  var STATIC = 'static';
  var STRING = 'string literal';
  var SUPER = 'super';
  var SWITCH = 'switch';
  var TEMPLATE_HEAD = 'template head';
  var TEMPLATE_MIDDLE = 'template middle';
  var TEMPLATE_TAIL = 'template tail';
  var THIS = 'this';
  var THROW = 'throw';
  var TILDE = '~';
  var TRUE = 'true';
  var TRY = 'try';
  var TYPEOF = 'typeof';
  var UNSIGNED_RIGHT_SHIFT = '>>>';
  var UNSIGNED_RIGHT_SHIFT_EQUAL = '>>>=';
  var VAR = 'var';
  var VOID = 'void';
  var WHILE = 'while';
  var WITH = 'with';
  var YIELD = 'yield';
  return {
    get AMPERSAND() {
      return AMPERSAND;
    },
    get AMPERSAND_EQUAL() {
      return AMPERSAND_EQUAL;
    },
    get AND() {
      return AND;
    },
    get ARROW() {
      return ARROW;
    },
    get AWAIT() {
      return AWAIT;
    },
    get BACK_QUOTE() {
      return BACK_QUOTE;
    },
    get BANG() {
      return BANG;
    },
    get BAR() {
      return BAR;
    },
    get BAR_EQUAL() {
      return BAR_EQUAL;
    },
    get BREAK() {
      return BREAK;
    },
    get CARET() {
      return CARET;
    },
    get CARET_EQUAL() {
      return CARET_EQUAL;
    },
    get CASE() {
      return CASE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS() {
      return CLASS;
    },
    get CLOSE_ANGLE() {
      return CLOSE_ANGLE;
    },
    get CLOSE_CURLY() {
      return CLOSE_CURLY;
    },
    get CLOSE_PAREN() {
      return CLOSE_PAREN;
    },
    get CLOSE_SQUARE() {
      return CLOSE_SQUARE;
    },
    get COLON() {
      return COLON;
    },
    get COMMA() {
      return COMMA;
    },
    get CONST() {
      return CONST;
    },
    get CONTINUE() {
      return CONTINUE;
    },
    get DEBUGGER() {
      return DEBUGGER;
    },
    get DEFAULT() {
      return DEFAULT;
    },
    get DELETE() {
      return DELETE;
    },
    get DO() {
      return DO;
    },
    get DOT_DOT_DOT() {
      return DOT_DOT_DOT;
    },
    get ELSE() {
      return ELSE;
    },
    get END_OF_FILE() {
      return END_OF_FILE;
    },
    get ENUM() {
      return ENUM;
    },
    get EQUAL() {
      return EQUAL;
    },
    get EQUAL_EQUAL() {
      return EQUAL_EQUAL;
    },
    get EQUAL_EQUAL_EQUAL() {
      return EQUAL_EQUAL_EQUAL;
    },
    get ERROR() {
      return ERROR;
    },
    get EXPORT() {
      return EXPORT;
    },
    get EXTENDS() {
      return EXTENDS;
    },
    get FALSE() {
      return FALSE;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR() {
      return FOR;
    },
    get FUNCTION() {
      return FUNCTION;
    },
    get GREATER_EQUAL() {
      return GREATER_EQUAL;
    },
    get IDENTIFIER() {
      return IDENTIFIER;
    },
    get IF() {
      return IF;
    },
    get IMPLEMENTS() {
      return IMPLEMENTS;
    },
    get IMPORT() {
      return IMPORT;
    },
    get IN() {
      return IN;
    },
    get INSTANCEOF() {
      return INSTANCEOF;
    },
    get INTERFACE() {
      return INTERFACE;
    },
    get LEFT_SHIFT() {
      return LEFT_SHIFT;
    },
    get LEFT_SHIFT_EQUAL() {
      return LEFT_SHIFT_EQUAL;
    },
    get LESS_EQUAL() {
      return LESS_EQUAL;
    },
    get LET() {
      return LET;
    },
    get MINUS() {
      return MINUS;
    },
    get MINUS_EQUAL() {
      return MINUS_EQUAL;
    },
    get MINUS_MINUS() {
      return MINUS_MINUS;
    },
    get NEW() {
      return NEW;
    },
    get NO_SUBSTITUTION_TEMPLATE() {
      return NO_SUBSTITUTION_TEMPLATE;
    },
    get NOT_EQUAL() {
      return NOT_EQUAL;
    },
    get NOT_EQUAL_EQUAL() {
      return NOT_EQUAL_EQUAL;
    },
    get NULL() {
      return NULL;
    },
    get NUMBER() {
      return NUMBER;
    },
    get OPEN_ANGLE() {
      return OPEN_ANGLE;
    },
    get OPEN_CURLY() {
      return OPEN_CURLY;
    },
    get OPEN_PAREN() {
      return OPEN_PAREN;
    },
    get OPEN_SQUARE() {
      return OPEN_SQUARE;
    },
    get OR() {
      return OR;
    },
    get PACKAGE() {
      return PACKAGE;
    },
    get PERCENT() {
      return PERCENT;
    },
    get PERCENT_EQUAL() {
      return PERCENT_EQUAL;
    },
    get PERIOD() {
      return PERIOD;
    },
    get PLUS() {
      return PLUS;
    },
    get PLUS_EQUAL() {
      return PLUS_EQUAL;
    },
    get PLUS_PLUS() {
      return PLUS_PLUS;
    },
    get PRIVATE() {
      return PRIVATE;
    },
    get PROTECTED() {
      return PROTECTED;
    },
    get PUBLIC() {
      return PUBLIC;
    },
    get QUESTION() {
      return QUESTION;
    },
    get REGULAR_EXPRESSION() {
      return REGULAR_EXPRESSION;
    },
    get RETURN() {
      return RETURN;
    },
    get RIGHT_SHIFT() {
      return RIGHT_SHIFT;
    },
    get RIGHT_SHIFT_EQUAL() {
      return RIGHT_SHIFT_EQUAL;
    },
    get SEMI_COLON() {
      return SEMI_COLON;
    },
    get SLASH() {
      return SLASH;
    },
    get SLASH_EQUAL() {
      return SLASH_EQUAL;
    },
    get STAR() {
      return STAR;
    },
    get STAR_EQUAL() {
      return STAR_EQUAL;
    },
    get STATIC() {
      return STATIC;
    },
    get STRING() {
      return STRING;
    },
    get SUPER() {
      return SUPER;
    },
    get SWITCH() {
      return SWITCH;
    },
    get TEMPLATE_HEAD() {
      return TEMPLATE_HEAD;
    },
    get TEMPLATE_MIDDLE() {
      return TEMPLATE_MIDDLE;
    },
    get TEMPLATE_TAIL() {
      return TEMPLATE_TAIL;
    },
    get THIS() {
      return THIS;
    },
    get THROW() {
      return THROW;
    },
    get TILDE() {
      return TILDE;
    },
    get TRUE() {
      return TRUE;
    },
    get TRY() {
      return TRY;
    },
    get TYPEOF() {
      return TYPEOF;
    },
    get UNSIGNED_RIGHT_SHIFT() {
      return UNSIGNED_RIGHT_SHIFT;
    },
    get UNSIGNED_RIGHT_SHIFT_EQUAL() {
      return UNSIGNED_RIGHT_SHIFT_EQUAL;
    },
    get VAR() {
      return VAR;
    },
    get VOID() {
      return VOID;
    },
    get WHILE() {
      return WHILE;
    },
    get WITH() {
      return WITH;
    },
    get YIELD() {
      return YIELD;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/Token", function() {
  "use strict";
  var $__28 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND_EQUAL = $__28.AMPERSAND_EQUAL,
      BAR_EQUAL = $__28.BAR_EQUAL,
      CARET_EQUAL = $__28.CARET_EQUAL,
      EQUAL = $__28.EQUAL,
      LEFT_SHIFT_EQUAL = $__28.LEFT_SHIFT_EQUAL,
      MINUS_EQUAL = $__28.MINUS_EQUAL,
      PERCENT_EQUAL = $__28.PERCENT_EQUAL,
      PLUS_EQUAL = $__28.PLUS_EQUAL,
      RIGHT_SHIFT_EQUAL = $__28.RIGHT_SHIFT_EQUAL,
      SLASH_EQUAL = $__28.SLASH_EQUAL,
      STAR_EQUAL = $__28.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__28.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var Token = function(type, location) {
    this.type = type;
    this.location = location;
  };
  Token = ($traceurRuntime.createClass)(Token, {
    toString: function() {
      return this.type;
    },
    isAssignmentOperator: function() {
      return isAssignmentOperator(this.type);
    },
    isKeyword: function() {
      return false;
    },
    isStrictKeyword: function() {
      return false;
    }
  }, {});
  function isAssignmentOperator(type) {
    switch (type) {
      case AMPERSAND_EQUAL:
      case BAR_EQUAL:
      case CARET_EQUAL:
      case EQUAL:
      case LEFT_SHIFT_EQUAL:
      case MINUS_EQUAL:
      case PERCENT_EQUAL:
      case PLUS_EQUAL:
      case RIGHT_SHIFT_EQUAL:
      case SLASH_EQUAL:
      case STAR_EQUAL:
      case UNSIGNED_RIGHT_SHIFT_EQUAL:
        return true;
    }
    return false;
  }
  return {
    get Token() {
      return Token;
    },
    get isAssignmentOperator() {
      return isAssignmentOperator;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/IdentifierToken", function() {
  "use strict";
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var IDENTIFIER = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").IDENTIFIER;
  var IdentifierToken = function(location, value) {
    this.location = location;
    this.value = value;
  };
  IdentifierToken = ($traceurRuntime.createClass)(IdentifierToken, {
    toString: function() {
      return this.value;
    },
    get type() {
      return IDENTIFIER;
    }
  }, {}, Token);
  return {get IdentifierToken() {
      return IdentifierToken;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/ParseTreeVisitor", function() {
  "use strict";
  var ParseTreeVisitor = function() {};
  ParseTreeVisitor = ($traceurRuntime.createClass)(ParseTreeVisitor, {
    visitAny: function(tree) {
      tree && tree.visit(this);
    },
    visit: function(tree) {
      this.visitAny(tree);
    },
    visitList: function(list) {
      if (list) {
        for (var i = 0; i < list.length; i++) {
          this.visitAny(list[i]);
        }
      }
    },
    visitStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
    },
    visitAnonBlock: function(tree) {
      this.visitList(tree.statements);
    },
    visitArgumentList: function(tree) {
      this.visitList(tree.args);
    },
    visitArrayComprehension: function(tree) {
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
    },
    visitArrayLiteralExpression: function(tree) {
      this.visitList(tree.elements);
    },
    visitArrayPattern: function(tree) {
      this.visitList(tree.elements);
    },
    visitArrowFunctionExpression: function(tree) {
      this.visitAny(tree.formalParameters);
      this.visitAny(tree.functionBody);
    },
    visitAwaitStatement: function(tree) {
      this.visitAny(tree.expression);
    },
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      this.visitAny(tree.binding);
      this.visitAny(tree.initialiser);
    },
    visitBindingIdentifier: function(tree) {},
    visitBlock: function(tree) {
      this.visitList(tree.statements);
    },
    visitBreakStatement: function(tree) {},
    visitCallExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.statements);
    },
    visitCatch: function(tree) {
      this.visitAny(tree.binding);
      this.visitAny(tree.catchBody);
    },
    visitClassDeclaration: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
    },
    visitClassExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
    },
    visitCommaExpression: function(tree) {
      this.visitList(tree.expressions);
    },
    visitComprehensionFor: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.iterator);
    },
    visitComprehensionIf: function(tree) {
      this.visitAny(tree.expression);
    },
    visitComputedPropertyName: function(tree) {
      this.visitAny(tree.expression);
    },
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitContinueStatement: function(tree) {},
    visitCoverFormals: function(tree) {
      this.visitList(tree.expressions);
    },
    visitCoverInitialisedName: function(tree) {
      this.visitAny(tree.initialiser);
    },
    visitDebuggerStatement: function(tree) {},
    visitDefaultClause: function(tree) {
      this.visitList(tree.statements);
    },
    visitDoWhileStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.condition);
    },
    visitEmptyStatement: function(tree) {},
    visitExportDeclaration: function(tree) {
      this.visitAny(tree.declaration);
    },
    visitExportDefault: function(tree) {
      this.visitAny(tree.expression);
    },
    visitExportSpecifier: function(tree) {},
    visitExportSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },
    visitExportStar: function(tree) {},
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
    },
    visitFinally: function(tree) {
      this.visitAny(tree.block);
    },
    visitForInStatement: function(tree) {
      this.visitAny(tree.initialiser);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },
    visitForOfStatement: function(tree) {
      this.visitAny(tree.initialiser);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },
    visitForStatement: function(tree) {
      this.visitAny(tree.initialiser);
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },
    visitFormalParameter: function(tree) {
      this.visitAny(tree.parameter);
      this.visitAny(tree.typeAnnotation);
    },
    visitFormalParameterList: function(tree) {
      this.visitList(tree.parameters);
    },
    visitFunctionBody: function(tree) {
      this.visitList(tree.statements);
    },
    visitFunctionDeclaration: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
    },
    visitGetAccessor: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.body);
    },
    visitIdentifierExpression: function(tree) {},
    visitIfStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.ifClause);
      this.visitAny(tree.elseClause);
    },
    visitImportedBinding: function(tree) {
      this.visitAny(tree.binding);
    },
    visitImportDeclaration: function(tree) {
      this.visitAny(tree.importClause);
      this.visitAny(tree.moduleSpecifier);
    },
    visitImportSpecifier: function(tree) {},
    visitImportSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },
    visitLabelledStatement: function(tree) {
      this.visitAny(tree.statement);
    },
    visitLiteralExpression: function(tree) {},
    visitLiteralPropertyName: function(tree) {},
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.memberExpression);
    },
    visitModule: function(tree) {
      this.visitList(tree.scriptItemList);
    },
    visitModuleDeclaration: function(tree) {
      this.visitAny(tree.expression);
    },
    visitModuleSpecifier: function(tree) {},
    visitNamedExport: function(tree) {
      this.visitAny(tree.moduleSpecifier);
      this.visitAny(tree.specifierSet);
    },
    visitNewExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      this.visitList(tree.propertyNameAndValues);
    },
    visitObjectPattern: function(tree) {
      this.visitList(tree.fields);
    },
    visitObjectPatternField: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.element);
    },
    visitParenExpression: function(tree) {
      this.visitAny(tree.expression);
    },
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitPredefinedType: function(tree) {},
    visitScript: function(tree) {
      this.visitList(tree.scriptItemList);
    },
    visitPropertyMethodAssignment: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.value);
    },
    visitPropertyNameShorthand: function(tree) {},
    visitRestParameter: function(tree) {
      this.visitAny(tree.identifier);
    },
    visitReturnStatement: function(tree) {
      this.visitAny(tree.expression);
    },
    visitSetAccessor: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.parameter);
      this.visitAny(tree.body);
    },
    visitSpreadExpression: function(tree) {
      this.visitAny(tree.expression);
    },
    visitSpreadPatternElement: function(tree) {
      this.visitAny(tree.lvalue);
    },
    visitSuperExpression: function(tree) {},
    visitSwitchStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.caseClauses);
    },
    visitSyntaxErrorTree: function(tree) {},
    visitTemplateLiteralExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitList(tree.elements);
    },
    visitTemplateLiteralPortion: function(tree) {},
    visitTemplateSubstitution: function(tree) {
      this.visitAny(tree.expression);
    },
    visitThisExpression: function(tree) {},
    visitThrowStatement: function(tree) {
      this.visitAny(tree.value);
    },
    visitTryStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },
    visitTypeName: function(tree) {
      this.visitAny(tree.moduleName);
    },
    visitUnaryExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.initialiser);
    },
    visitVariableDeclarationList: function(tree) {
      this.visitList(tree.declarations);
    },
    visitVariableStatement: function(tree) {
      this.visitAny(tree.declarations);
    },
    visitWhileStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.body);
    },
    visitWithStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitAny(tree.body);
    },
    visitYieldExpression: function(tree) {
      this.visitAny(tree.expression);
    }
  }, {});
  return {get ParseTreeVisitor() {
      return ParseTreeVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/PredefinedName", function() {
  "use strict";
  var ANY = 'any';
  var $ARGUMENTS = '$arguments';
  var $THAT = '$that';
  var $VALUE = '$value';
  var ADD_CONTINUATION = 'addContinuation';
  var APPLY = 'apply';
  var ARGUMENTS = 'arguments';
  var ARRAY = 'Array';
  var AS = 'as';
  var BIND = 'bind';
  var BOOL = 'bool';
  var CALL = 'call';
  var CAUGHT_EXCEPTION = '$caughtException';
  var CLOSE = 'close';
  var CONFIGURABLE = 'configurable';
  var CONSTRUCTOR = 'constructor';
  var CREATE = 'create';
  var CURRENT = 'current';
  var DEFINE_PROPERTIES = 'defineProperties';
  var DEFINE_PROPERTY = 'defineProperty';
  var ENUMERABLE = 'enumerable';
  var FINALLY_FALL_THROUGH = '$finallyFallThrough';
  var FREEZE = 'freeze';
  var FROM = 'from';
  var FUNCTION = 'Function';
  var GET = 'get';
  var HAS = 'has';
  var LENGTH = 'length';
  var MODULE = 'module';
  var NEW = 'new';
  var NUMBER = 'number';
  var OBJECT = 'Object';
  var OBJECT_NAME = 'Object';
  var OF = 'of';
  var PREVENT_EXTENSIONS = 'preventExtensions';
  var PROTOTYPE = 'prototype';
  var PUSH = 'push';
  var RAW = 'raw';
  var SET = 'set';
  var SLICE = 'slice';
  var STATE = '$state';
  var STORED_EXCEPTION = '$storedException';
  var STRING = 'string';
  var THEN = 'then';
  var THIS = 'this';
  var TRACEUR_RUNTIME = '$traceurRuntime';
  var UNDEFINED = 'undefined';
  var WRITABLE = 'writable';
  var YIELD_ACTION = '$yieldAction';
  var YIELD_RETURN = 'yieldReturn';
  var YIELD_SENT = '$yieldSent';
  function getParameterName(index) {
    return '$' + index;
  }
  ;
  var ACTION_SEND = 0;
  var ACTION_THROW = 1;
  return {
    get ANY() {
      return ANY;
    },
    get $ARGUMENTS() {
      return $ARGUMENTS;
    },
    get $THAT() {
      return $THAT;
    },
    get $VALUE() {
      return $VALUE;
    },
    get ADD_CONTINUATION() {
      return ADD_CONTINUATION;
    },
    get APPLY() {
      return APPLY;
    },
    get ARGUMENTS() {
      return ARGUMENTS;
    },
    get ARRAY() {
      return ARRAY;
    },
    get AS() {
      return AS;
    },
    get BIND() {
      return BIND;
    },
    get BOOL() {
      return BOOL;
    },
    get CALL() {
      return CALL;
    },
    get CAUGHT_EXCEPTION() {
      return CAUGHT_EXCEPTION;
    },
    get CLOSE() {
      return CLOSE;
    },
    get CONFIGURABLE() {
      return CONFIGURABLE;
    },
    get CONSTRUCTOR() {
      return CONSTRUCTOR;
    },
    get CREATE() {
      return CREATE;
    },
    get CURRENT() {
      return CURRENT;
    },
    get DEFINE_PROPERTIES() {
      return DEFINE_PROPERTIES;
    },
    get DEFINE_PROPERTY() {
      return DEFINE_PROPERTY;
    },
    get ENUMERABLE() {
      return ENUMERABLE;
    },
    get FINALLY_FALL_THROUGH() {
      return FINALLY_FALL_THROUGH;
    },
    get FREEZE() {
      return FREEZE;
    },
    get FROM() {
      return FROM;
    },
    get FUNCTION() {
      return FUNCTION;
    },
    get GET() {
      return GET;
    },
    get HAS() {
      return HAS;
    },
    get LENGTH() {
      return LENGTH;
    },
    get MODULE() {
      return MODULE;
    },
    get NEW() {
      return NEW;
    },
    get NUMBER() {
      return NUMBER;
    },
    get OBJECT() {
      return OBJECT;
    },
    get OBJECT_NAME() {
      return OBJECT_NAME;
    },
    get OF() {
      return OF;
    },
    get PREVENT_EXTENSIONS() {
      return PREVENT_EXTENSIONS;
    },
    get PROTOTYPE() {
      return PROTOTYPE;
    },
    get PUSH() {
      return PUSH;
    },
    get RAW() {
      return RAW;
    },
    get SET() {
      return SET;
    },
    get SLICE() {
      return SLICE;
    },
    get STATE() {
      return STATE;
    },
    get STORED_EXCEPTION() {
      return STORED_EXCEPTION;
    },
    get STRING() {
      return STRING;
    },
    get THEN() {
      return THEN;
    },
    get THIS() {
      return THIS;
    },
    get TRACEUR_RUNTIME() {
      return TRACEUR_RUNTIME;
    },
    get UNDEFINED() {
      return UNDEFINED;
    },
    get WRITABLE() {
      return WRITABLE;
    },
    get YIELD_ACTION() {
      return YIELD_ACTION;
    },
    get YIELD_RETURN() {
      return YIELD_RETURN;
    },
    get YIELD_SENT() {
      return YIELD_SENT;
    },
    get getParameterName() {
      return getParameterName;
    },
    get ACTION_SEND() {
      return ACTION_SEND;
    },
    get ACTION_THROW() {
      return ACTION_THROW;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/trees/ParseTreeType", function() {
  "use strict";
  var ANON_BLOCK = 'ANON_BLOCK';
  var ARGUMENT_LIST = 'ARGUMENT_LIST';
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION';
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION';
  var ARRAY_PATTERN = 'ARRAY_PATTERN';
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION';
  var AWAIT_STATEMENT = 'AWAIT_STATEMENT';
  var BINARY_OPERATOR = 'BINARY_OPERATOR';
  var BINDING_ELEMENT = 'BINDING_ELEMENT';
  var BINDING_IDENTIFIER = 'BINDING_IDENTIFIER';
  var BLOCK = 'BLOCK';
  var BREAK_STATEMENT = 'BREAK_STATEMENT';
  var CALL_EXPRESSION = 'CALL_EXPRESSION';
  var CASE_CLAUSE = 'CASE_CLAUSE';
  var CATCH = 'CATCH';
  var CLASS_DECLARATION = 'CLASS_DECLARATION';
  var CLASS_EXPRESSION = 'CLASS_EXPRESSION';
  var COMMA_EXPRESSION = 'COMMA_EXPRESSION';
  var COMPREHENSION_FOR = 'COMPREHENSION_FOR';
  var COMPREHENSION_IF = 'COMPREHENSION_IF';
  var COMPUTED_PROPERTY_NAME = 'COMPUTED_PROPERTY_NAME';
  var CONDITIONAL_EXPRESSION = 'CONDITIONAL_EXPRESSION';
  var CONTINUE_STATEMENT = 'CONTINUE_STATEMENT';
  var COVER_FORMALS = 'COVER_FORMALS';
  var COVER_INITIALISED_NAME = 'COVER_INITIALISED_NAME';
  var DEBUGGER_STATEMENT = 'DEBUGGER_STATEMENT';
  var DEFAULT_CLAUSE = 'DEFAULT_CLAUSE';
  var DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT';
  var EMPTY_STATEMENT = 'EMPTY_STATEMENT';
  var EXPORT_DECLARATION = 'EXPORT_DECLARATION';
  var EXPORT_DEFAULT = 'EXPORT_DEFAULT';
  var EXPORT_SPECIFIER = 'EXPORT_SPECIFIER';
  var EXPORT_SPECIFIER_SET = 'EXPORT_SPECIFIER_SET';
  var EXPORT_STAR = 'EXPORT_STAR';
  var EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT';
  var FINALLY = 'FINALLY';
  var FOR_IN_STATEMENT = 'FOR_IN_STATEMENT';
  var FOR_OF_STATEMENT = 'FOR_OF_STATEMENT';
  var FOR_STATEMENT = 'FOR_STATEMENT';
  var FORMAL_PARAMETER = 'FORMAL_PARAMETER';
  var FORMAL_PARAMETER_LIST = 'FORMAL_PARAMETER_LIST';
  var FUNCTION_BODY = 'FUNCTION_BODY';
  var FUNCTION_DECLARATION = 'FUNCTION_DECLARATION';
  var FUNCTION_EXPRESSION = 'FUNCTION_EXPRESSION';
  var GENERATOR_COMPREHENSION = 'GENERATOR_COMPREHENSION';
  var GET_ACCESSOR = 'GET_ACCESSOR';
  var IDENTIFIER_EXPRESSION = 'IDENTIFIER_EXPRESSION';
  var IF_STATEMENT = 'IF_STATEMENT';
  var IMPORT_DECLARATION = 'IMPORT_DECLARATION';
  var IMPORT_SPECIFIER = 'IMPORT_SPECIFIER';
  var IMPORT_SPECIFIER_SET = 'IMPORT_SPECIFIER_SET';
  var IMPORTED_BINDING = 'IMPORTED_BINDING';
  var LABELLED_STATEMENT = 'LABELLED_STATEMENT';
  var LITERAL_EXPRESSION = 'LITERAL_EXPRESSION';
  var LITERAL_PROPERTY_NAME = 'LITERAL_PROPERTY_NAME';
  var MEMBER_EXPRESSION = 'MEMBER_EXPRESSION';
  var MEMBER_LOOKUP_EXPRESSION = 'MEMBER_LOOKUP_EXPRESSION';
  var MODULE = 'MODULE';
  var MODULE_DECLARATION = 'MODULE_DECLARATION';
  var MODULE_SPECIFIER = 'MODULE_SPECIFIER';
  var NAMED_EXPORT = 'NAMED_EXPORT';
  var NEW_EXPRESSION = 'NEW_EXPRESSION';
  var OBJECT_LITERAL_EXPRESSION = 'OBJECT_LITERAL_EXPRESSION';
  var OBJECT_PATTERN = 'OBJECT_PATTERN';
  var OBJECT_PATTERN_FIELD = 'OBJECT_PATTERN_FIELD';
  var PAREN_EXPRESSION = 'PAREN_EXPRESSION';
  var POSTFIX_EXPRESSION = 'POSTFIX_EXPRESSION';
  var PREDEFINED_TYPE = 'PREDEFINED_TYPE';
  var PROPERTY_METHOD_ASSIGNMENT = 'PROPERTY_METHOD_ASSIGNMENT';
  var PROPERTY_NAME_ASSIGNMENT = 'PROPERTY_NAME_ASSIGNMENT';
  var PROPERTY_NAME_SHORTHAND = 'PROPERTY_NAME_SHORTHAND';
  var REST_PARAMETER = 'REST_PARAMETER';
  var RETURN_STATEMENT = 'RETURN_STATEMENT';
  var SCRIPT = 'SCRIPT';
  var SET_ACCESSOR = 'SET_ACCESSOR';
  var SPREAD_EXPRESSION = 'SPREAD_EXPRESSION';
  var SPREAD_PATTERN_ELEMENT = 'SPREAD_PATTERN_ELEMENT';
  var STATE_MACHINE = 'STATE_MACHINE';
  var SUPER_EXPRESSION = 'SUPER_EXPRESSION';
  var SWITCH_STATEMENT = 'SWITCH_STATEMENT';
  var SYNTAX_ERROR_TREE = 'SYNTAX_ERROR_TREE';
  var TEMPLATE_LITERAL_EXPRESSION = 'TEMPLATE_LITERAL_EXPRESSION';
  var TEMPLATE_LITERAL_PORTION = 'TEMPLATE_LITERAL_PORTION';
  var TEMPLATE_SUBSTITUTION = 'TEMPLATE_SUBSTITUTION';
  var THIS_EXPRESSION = 'THIS_EXPRESSION';
  var THROW_STATEMENT = 'THROW_STATEMENT';
  var TRY_STATEMENT = 'TRY_STATEMENT';
  var TYPE_NAME = 'TYPE_NAME';
  var UNARY_EXPRESSION = 'UNARY_EXPRESSION';
  var VARIABLE_DECLARATION = 'VARIABLE_DECLARATION';
  var VARIABLE_DECLARATION_LIST = 'VARIABLE_DECLARATION_LIST';
  var VARIABLE_STATEMENT = 'VARIABLE_STATEMENT';
  var WHILE_STATEMENT = 'WHILE_STATEMENT';
  var WITH_STATEMENT = 'WITH_STATEMENT';
  var YIELD_EXPRESSION = 'YIELD_EXPRESSION';
  return {
    get ANON_BLOCK() {
      return ANON_BLOCK;
    },
    get ARGUMENT_LIST() {
      return ARGUMENT_LIST;
    },
    get ARRAY_COMPREHENSION() {
      return ARRAY_COMPREHENSION;
    },
    get ARRAY_LITERAL_EXPRESSION() {
      return ARRAY_LITERAL_EXPRESSION;
    },
    get ARRAY_PATTERN() {
      return ARRAY_PATTERN;
    },
    get ARROW_FUNCTION_EXPRESSION() {
      return ARROW_FUNCTION_EXPRESSION;
    },
    get AWAIT_STATEMENT() {
      return AWAIT_STATEMENT;
    },
    get BINARY_OPERATOR() {
      return BINARY_OPERATOR;
    },
    get BINDING_ELEMENT() {
      return BINDING_ELEMENT;
    },
    get BINDING_IDENTIFIER() {
      return BINDING_IDENTIFIER;
    },
    get BLOCK() {
      return BLOCK;
    },
    get BREAK_STATEMENT() {
      return BREAK_STATEMENT;
    },
    get CALL_EXPRESSION() {
      return CALL_EXPRESSION;
    },
    get CASE_CLAUSE() {
      return CASE_CLAUSE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS_DECLARATION() {
      return CLASS_DECLARATION;
    },
    get CLASS_EXPRESSION() {
      return CLASS_EXPRESSION;
    },
    get COMMA_EXPRESSION() {
      return COMMA_EXPRESSION;
    },
    get COMPREHENSION_FOR() {
      return COMPREHENSION_FOR;
    },
    get COMPREHENSION_IF() {
      return COMPREHENSION_IF;
    },
    get COMPUTED_PROPERTY_NAME() {
      return COMPUTED_PROPERTY_NAME;
    },
    get CONDITIONAL_EXPRESSION() {
      return CONDITIONAL_EXPRESSION;
    },
    get CONTINUE_STATEMENT() {
      return CONTINUE_STATEMENT;
    },
    get COVER_FORMALS() {
      return COVER_FORMALS;
    },
    get COVER_INITIALISED_NAME() {
      return COVER_INITIALISED_NAME;
    },
    get DEBUGGER_STATEMENT() {
      return DEBUGGER_STATEMENT;
    },
    get DEFAULT_CLAUSE() {
      return DEFAULT_CLAUSE;
    },
    get DO_WHILE_STATEMENT() {
      return DO_WHILE_STATEMENT;
    },
    get EMPTY_STATEMENT() {
      return EMPTY_STATEMENT;
    },
    get EXPORT_DECLARATION() {
      return EXPORT_DECLARATION;
    },
    get EXPORT_DEFAULT() {
      return EXPORT_DEFAULT;
    },
    get EXPORT_SPECIFIER() {
      return EXPORT_SPECIFIER;
    },
    get EXPORT_SPECIFIER_SET() {
      return EXPORT_SPECIFIER_SET;
    },
    get EXPORT_STAR() {
      return EXPORT_STAR;
    },
    get EXPRESSION_STATEMENT() {
      return EXPRESSION_STATEMENT;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR_IN_STATEMENT() {
      return FOR_IN_STATEMENT;
    },
    get FOR_OF_STATEMENT() {
      return FOR_OF_STATEMENT;
    },
    get FOR_STATEMENT() {
      return FOR_STATEMENT;
    },
    get FORMAL_PARAMETER() {
      return FORMAL_PARAMETER;
    },
    get FORMAL_PARAMETER_LIST() {
      return FORMAL_PARAMETER_LIST;
    },
    get FUNCTION_BODY() {
      return FUNCTION_BODY;
    },
    get FUNCTION_DECLARATION() {
      return FUNCTION_DECLARATION;
    },
    get FUNCTION_EXPRESSION() {
      return FUNCTION_EXPRESSION;
    },
    get GENERATOR_COMPREHENSION() {
      return GENERATOR_COMPREHENSION;
    },
    get GET_ACCESSOR() {
      return GET_ACCESSOR;
    },
    get IDENTIFIER_EXPRESSION() {
      return IDENTIFIER_EXPRESSION;
    },
    get IF_STATEMENT() {
      return IF_STATEMENT;
    },
    get IMPORT_DECLARATION() {
      return IMPORT_DECLARATION;
    },
    get IMPORT_SPECIFIER() {
      return IMPORT_SPECIFIER;
    },
    get IMPORT_SPECIFIER_SET() {
      return IMPORT_SPECIFIER_SET;
    },
    get IMPORTED_BINDING() {
      return IMPORTED_BINDING;
    },
    get LABELLED_STATEMENT() {
      return LABELLED_STATEMENT;
    },
    get LITERAL_EXPRESSION() {
      return LITERAL_EXPRESSION;
    },
    get LITERAL_PROPERTY_NAME() {
      return LITERAL_PROPERTY_NAME;
    },
    get MEMBER_EXPRESSION() {
      return MEMBER_EXPRESSION;
    },
    get MEMBER_LOOKUP_EXPRESSION() {
      return MEMBER_LOOKUP_EXPRESSION;
    },
    get MODULE() {
      return MODULE;
    },
    get MODULE_DECLARATION() {
      return MODULE_DECLARATION;
    },
    get MODULE_SPECIFIER() {
      return MODULE_SPECIFIER;
    },
    get NAMED_EXPORT() {
      return NAMED_EXPORT;
    },
    get NEW_EXPRESSION() {
      return NEW_EXPRESSION;
    },
    get OBJECT_LITERAL_EXPRESSION() {
      return OBJECT_LITERAL_EXPRESSION;
    },
    get OBJECT_PATTERN() {
      return OBJECT_PATTERN;
    },
    get OBJECT_PATTERN_FIELD() {
      return OBJECT_PATTERN_FIELD;
    },
    get PAREN_EXPRESSION() {
      return PAREN_EXPRESSION;
    },
    get POSTFIX_EXPRESSION() {
      return POSTFIX_EXPRESSION;
    },
    get PREDEFINED_TYPE() {
      return PREDEFINED_TYPE;
    },
    get PROPERTY_METHOD_ASSIGNMENT() {
      return PROPERTY_METHOD_ASSIGNMENT;
    },
    get PROPERTY_NAME_ASSIGNMENT() {
      return PROPERTY_NAME_ASSIGNMENT;
    },
    get PROPERTY_NAME_SHORTHAND() {
      return PROPERTY_NAME_SHORTHAND;
    },
    get REST_PARAMETER() {
      return REST_PARAMETER;
    },
    get RETURN_STATEMENT() {
      return RETURN_STATEMENT;
    },
    get SCRIPT() {
      return SCRIPT;
    },
    get SET_ACCESSOR() {
      return SET_ACCESSOR;
    },
    get SPREAD_EXPRESSION() {
      return SPREAD_EXPRESSION;
    },
    get SPREAD_PATTERN_ELEMENT() {
      return SPREAD_PATTERN_ELEMENT;
    },
    get STATE_MACHINE() {
      return STATE_MACHINE;
    },
    get SUPER_EXPRESSION() {
      return SUPER_EXPRESSION;
    },
    get SWITCH_STATEMENT() {
      return SWITCH_STATEMENT;
    },
    get SYNTAX_ERROR_TREE() {
      return SYNTAX_ERROR_TREE;
    },
    get TEMPLATE_LITERAL_EXPRESSION() {
      return TEMPLATE_LITERAL_EXPRESSION;
    },
    get TEMPLATE_LITERAL_PORTION() {
      return TEMPLATE_LITERAL_PORTION;
    },
    get TEMPLATE_SUBSTITUTION() {
      return TEMPLATE_SUBSTITUTION;
    },
    get THIS_EXPRESSION() {
      return THIS_EXPRESSION;
    },
    get THROW_STATEMENT() {
      return THROW_STATEMENT;
    },
    get TRY_STATEMENT() {
      return TRY_STATEMENT;
    },
    get TYPE_NAME() {
      return TYPE_NAME;
    },
    get UNARY_EXPRESSION() {
      return UNARY_EXPRESSION;
    },
    get VARIABLE_DECLARATION() {
      return VARIABLE_DECLARATION;
    },
    get VARIABLE_DECLARATION_LIST() {
      return VARIABLE_DECLARATION_LIST;
    },
    get VARIABLE_STATEMENT() {
      return VARIABLE_STATEMENT;
    },
    get WHILE_STATEMENT() {
      return WHILE_STATEMENT;
    },
    get WITH_STATEMENT() {
      return WITH_STATEMENT;
    },
    get YIELD_EXPRESSION() {
      return YIELD_EXPRESSION;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/util/JSON", function() {
  "use strict";
  function transform(v) {
    var replacer = arguments[1] !== (void 0) ? arguments[1]: (function(k, v) {
      return v;
    });
    return transform_(replacer('', v), replacer);
  }
  function transform_(v, replacer) {
    var rv,
        tv;
    if (Array.isArray(v)) {
      var len = v.length;
      rv = Array(len);
      for (var i = 0; i < len; i++) {
        tv = transform_(replacer(String(i), v[i]), replacer);
        rv[i] = tv === undefined ? null: tv;
      }
      return rv;
    }
    if (v instanceof Object) {
      rv = {};
      Object.keys(v).forEach((function(k) {
        tv = transform_(replacer(k, v[k]), replacer);
        if (tv !== undefined) {
          rv[k] = tv;
        }
      }));
      return rv;
    }
    return v;
  }
  return {get transform() {
      return transform;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/trees/ParseTree", function() {
  "use strict";
  var ParseTreeType = System.get("traceur@0.0.Y/src/syntax/trees/ParseTreeType");
  var $__33 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      STRING = $__33.STRING,
      VAR = $__33.VAR;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var utilJSON = System.get("traceur@0.0.Y/src/util/JSON");
  var $__33 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARGUMENT_LIST = $__33.ARGUMENT_LIST,
      ARRAY_COMPREHENSION = $__33.ARRAY_COMPREHENSION,
      ARRAY_LITERAL_EXPRESSION = $__33.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__33.ARRAY_PATTERN,
      ARROW_FUNCTION_EXPRESSION = $__33.ARROW_FUNCTION_EXPRESSION,
      AWAIT_STATEMENT = $__33.AWAIT_STATEMENT,
      BINARY_OPERATOR = $__33.BINARY_OPERATOR,
      BINDING_ELEMENT = $__33.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__33.BINDING_IDENTIFIER,
      BLOCK = $__33.BLOCK,
      BREAK_STATEMENT = $__33.BREAK_STATEMENT,
      CALL_EXPRESSION = $__33.CALL_EXPRESSION,
      CASE_CLAUSE = $__33.CASE_CLAUSE,
      CATCH = $__33.CATCH,
      CLASS_DECLARATION = $__33.CLASS_DECLARATION,
      CLASS_EXPRESSION = $__33.CLASS_EXPRESSION,
      COMMA_EXPRESSION = $__33.COMMA_EXPRESSION,
      COMPREHENSION_FOR = $__33.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__33.COMPREHENSION_IF,
      COMPUTED_PROPERTY_NAME = $__33.COMPUTED_PROPERTY_NAME,
      CONDITIONAL_EXPRESSION = $__33.CONDITIONAL_EXPRESSION,
      CONTINUE_STATEMENT = $__33.CONTINUE_STATEMENT,
      COVER_FORMALS = $__33.COVER_FORMALS,
      COVER_INITIALISED_NAME = $__33.COVER_INITIALISED_NAME,
      DEBUGGER_STATEMENT = $__33.DEBUGGER_STATEMENT,
      DEFAULT_CLAUSE = $__33.DEFAULT_CLAUSE,
      DO_WHILE_STATEMENT = $__33.DO_WHILE_STATEMENT,
      EMPTY_STATEMENT = $__33.EMPTY_STATEMENT,
      EXPORT_DECLARATION = $__33.EXPORT_DECLARATION,
      EXPORT_SPECIFIER = $__33.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__33.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__33.EXPORT_STAR,
      EXPRESSION_STATEMENT = $__33.EXPRESSION_STATEMENT,
      FINALLY = $__33.FINALLY,
      FOR_IN_STATEMENT = $__33.FOR_IN_STATEMENT,
      FOR_OF_STATEMENT = $__33.FOR_OF_STATEMENT,
      FOR_STATEMENT = $__33.FOR_STATEMENT,
      FORMAL_PARAMETER = $__33.FORMAL_PARAMETER,
      FORMAL_PARAMETER_LIST = $__33.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__33.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__33.FUNCTION_DECLARATION,
      FUNCTION_EXPRESSION = $__33.FUNCTION_EXPRESSION,
      GENERATOR_COMPREHENSION = $__33.GENERATOR_COMPREHENSION,
      GET_ACCESSOR = $__33.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__33.IDENTIFIER_EXPRESSION,
      IF_STATEMENT = $__33.IF_STATEMENT,
      IMPORT_DECLARATION = $__33.IMPORT_DECLARATION,
      IMPORT_SPECIFIER = $__33.IMPORT_SPECIFIER,
      IMPORT_SPECIFIER_SET = $__33.IMPORT_SPECIFIER_SET,
      LABELLED_STATEMENT = $__33.LABELLED_STATEMENT,
      LITERAL_EXPRESSION = $__33.LITERAL_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__33.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__33.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__33.MEMBER_LOOKUP_EXPRESSION,
      MODULE = $__33.MODULE,
      MODULE_DECLARATION = $__33.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__33.MODULE_SPECIFIER,
      NAMED_EXPORT = $__33.NAMED_EXPORT,
      NEW_EXPRESSION = $__33.NEW_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__33.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__33.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__33.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__33.PAREN_EXPRESSION,
      POSTFIX_EXPRESSION = $__33.POSTFIX_EXPRESSION,
      PREDEFINED_TYPE = $__33.PREDEFINED_TYPE,
      PROPERTY_METHOD_ASSIGNMENT = $__33.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__33.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__33.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__33.REST_PARAMETER,
      RETURN_STATEMENT = $__33.RETURN_STATEMENT,
      SCRIPT = $__33.SCRIPT,
      SET_ACCESSOR = $__33.SET_ACCESSOR,
      SPREAD_EXPRESSION = $__33.SPREAD_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__33.SPREAD_PATTERN_ELEMENT,
      STATE_MACHINE = $__33.STATE_MACHINE,
      SUPER_EXPRESSION = $__33.SUPER_EXPRESSION,
      SWITCH_STATEMENT = $__33.SWITCH_STATEMENT,
      SYNTAX_ERROR_TREE = $__33.SYNTAX_ERROR_TREE,
      TEMPLATE_LITERAL_EXPRESSION = $__33.TEMPLATE_LITERAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__33.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__33.TEMPLATE_SUBSTITUTION,
      THIS_EXPRESSION = $__33.THIS_EXPRESSION,
      THROW_STATEMENT = $__33.THROW_STATEMENT,
      TRY_STATEMENT = $__33.TRY_STATEMENT,
      TYPE_NAME = $__33.TYPE_NAME,
      UNARY_EXPRESSION = $__33.UNARY_EXPRESSION,
      VARIABLE_DECLARATION = $__33.VARIABLE_DECLARATION,
      VARIABLE_DECLARATION_LIST = $__33.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__33.VARIABLE_STATEMENT,
      WHILE_STATEMENT = $__33.WHILE_STATEMENT,
      WITH_STATEMENT = $__33.WITH_STATEMENT,
      YIELD_EXPRESSION = $__33.YIELD_EXPRESSION;
  ;
  var ParseTree = function(type, location) {
    throw new Error("Don't use for now. 'super' is currently very slow.");
    this.type = type;
    this.location = location;
  };
  ParseTree = ($traceurRuntime.createClass)(ParseTree, {
    isPattern: function() {
      switch (this.type) {
        case ARRAY_PATTERN:
        case OBJECT_PATTERN:
          return true;
        case PAREN_EXPRESSION:
          return this.expression.isPattern();
        default:
          return false;
      }
    },
    isLeftHandSideExpression: function() {
      switch (this.type) {
        case THIS_EXPRESSION:
        case CLASS_EXPRESSION:
        case SUPER_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case NEW_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case CALL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
          return true;
        case PAREN_EXPRESSION:
          return this.expression.isLeftHandSideExpression();
        default:
          return false;
      }
    },
    isArrowFunctionExpression: function() {
      switch (this.type) {
        case ARRAY_COMPREHENSION:
        case ARRAY_LITERAL_EXPRESSION:
        case ARROW_FUNCTION_EXPRESSION:
        case BINARY_OPERATOR:
        case CALL_EXPRESSION:
        case CLASS_EXPRESSION:
        case CONDITIONAL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case GENERATOR_COMPREHENSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case NEW_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
        case POSTFIX_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
        case SUPER_EXPRESSION:
        case THIS_EXPRESSION:
        case UNARY_EXPRESSION:
        case YIELD_EXPRESSION:
          return true;
        default:
          return false;
      }
    },
    isMemberExpression: function() {
      switch (this.type) {
        case THIS_EXPRESSION:
        case CLASS_EXPRESSION:
        case SUPER_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case MEMBER_EXPRESSION:
        case CALL_EXPRESSION:
          return true;
        case NEW_EXPRESSION:
          return this.args != null;
      }
      return false;
    },
    isExpression: function() {
      return this.isArrowFunctionExpression() || this.type == COMMA_EXPRESSION;
    },
    isAssignmentOrSpread: function() {
      return this.isArrowFunctionExpression() || this.type == SPREAD_EXPRESSION;
    },
    isRestParameter: function() {
      return this.type == REST_PARAMETER || (this.type == FORMAL_PARAMETER && this.parameter.isRestParameter());
    },
    isSpreadPatternElement: function() {
      return this.type == SPREAD_PATTERN_ELEMENT;
    },
    isStatementListItem: function() {
      return this.isStatement() || this.isDeclaration();
    },
    isStatement: function() {
      switch (this.type) {
        case BLOCK:
        case VARIABLE_STATEMENT:
        case EMPTY_STATEMENT:
        case EXPRESSION_STATEMENT:
        case IF_STATEMENT:
        case CONTINUE_STATEMENT:
        case BREAK_STATEMENT:
        case RETURN_STATEMENT:
        case WITH_STATEMENT:
        case LABELLED_STATEMENT:
        case THROW_STATEMENT:
        case TRY_STATEMENT:
        case DEBUGGER_STATEMENT:
        case AWAIT_STATEMENT:
          return true;
      }
      return this.isBreakableStatement();
    },
    isDeclaration: function() {
      switch (this.type) {
        case FUNCTION_DECLARATION:
        case CLASS_DECLARATION:
          return true;
      }
      return this.isLexicalDeclaration();
    },
    isLexicalDeclaration: function() {
      switch (this.type) {
        case VARIABLE_STATEMENT:
          return this.declarations.declarationType !== VAR;
      }
      return false;
    },
    isBreakableStatement: function() {
      switch (this.type) {
        case SWITCH_STATEMENT:
          return true;
      }
      return this.isIterationStatement();
    },
    isIterationStatement: function() {
      switch (this.type) {
        case DO_WHILE_STATEMENT:
        case FOR_IN_STATEMENT:
        case FOR_OF_STATEMENT:
        case FOR_STATEMENT:
        case WHILE_STATEMENT:
          return true;
      }
      return false;
    },
    isScriptElement: function() {
      switch (this.type) {
        case CLASS_DECLARATION:
        case EXPORT_DECLARATION:
        case FUNCTION_DECLARATION:
        case IMPORT_DECLARATION:
        case MODULE_DECLARATION:
        case VARIABLE_DECLARATION:
          return true;
      }
      return this.isStatement();
    },
    getDirectivePrologueStringToken_: function() {
      var tree = this;
      if (tree.type !== EXPRESSION_STATEMENT || !(tree = tree.expression)) return null;
      if (tree.type !== LITERAL_EXPRESSION || !(tree = tree.literalToken)) return null;
      if (tree.type !== STRING) return null;
      return tree;
    },
    isDirectivePrologue: function() {
      return this.getDirectivePrologueStringToken_() !== null;
    },
    isUseStrictDirective: function() {
      var token = this.getDirectivePrologueStringToken_();
      if (!token) return false;
      var v = token.value;
      return v === '"use strict"' || v === "'use strict'";
    },
    toJSON: function() {
      return utilJSON.transform(this, ParseTree.replacer);
    },
    stringify: function() {
      var indent = arguments[0] !== (void 0) ? arguments[0]: 2;
      return JSON.stringify(this, ParseTree.replacer, indent);
    }
  }, {
    stripLocation: function(key, value) {
      if (key === 'location') {
        return undefined;
      }
      return value;
    },
    replacer: function(k, v) {
      if (v instanceof ParseTree || v instanceof Token) {
        var rv = {type: v.type};
        Object.keys(v).forEach(function(name) {
          if (name !== 'location') rv[name] = v[name];
        });
        return rv;
      }
      return v;
    }
  });
  return {
    get ParseTreeType() {
      return ParseTreeType;
    },
    get ParseTree() {
      return ParseTree;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/trees/ParseTrees", function() {
  "use strict";
  var ParseTree = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTree").ParseTree;
  var ParseTreeType = System.get("traceur@0.0.Y/src/syntax/trees/ParseTreeType");
  var ANON_BLOCK = ParseTreeType.ANON_BLOCK;
  var AnonBlock = function(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  AnonBlock = ($traceurRuntime.createClass)(AnonBlock, {
    transform: function(transformer) {
      return transformer.transformAnonBlock(this);
    },
    visit: function(visitor) {
      visitor.visitAnonBlock(this);
    },
    get type() {
      return ANON_BLOCK;
    }
  }, {}, ParseTree);
  var ARGUMENT_LIST = ParseTreeType.ARGUMENT_LIST;
  var ArgumentList = function(location, args) {
    this.location = location;
    this.args = args;
  };
  ArgumentList = ($traceurRuntime.createClass)(ArgumentList, {
    transform: function(transformer) {
      return transformer.transformArgumentList(this);
    },
    visit: function(visitor) {
      visitor.visitArgumentList(this);
    },
    get type() {
      return ARGUMENT_LIST;
    }
  }, {}, ParseTree);
  var ARRAY_COMPREHENSION = ParseTreeType.ARRAY_COMPREHENSION;
  var ArrayComprehension = function(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  };
  ArrayComprehension = ($traceurRuntime.createClass)(ArrayComprehension, {
    transform: function(transformer) {
      return transformer.transformArrayComprehension(this);
    },
    visit: function(visitor) {
      visitor.visitArrayComprehension(this);
    },
    get type() {
      return ARRAY_COMPREHENSION;
    }
  }, {}, ParseTree);
  var ARRAY_LITERAL_EXPRESSION = ParseTreeType.ARRAY_LITERAL_EXPRESSION;
  var ArrayLiteralExpression = function(location, elements) {
    this.location = location;
    this.elements = elements;
  };
  ArrayLiteralExpression = ($traceurRuntime.createClass)(ArrayLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformArrayLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitArrayLiteralExpression(this);
    },
    get type() {
      return ARRAY_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var ARRAY_PATTERN = ParseTreeType.ARRAY_PATTERN;
  var ArrayPattern = function(location, elements) {
    this.location = location;
    this.elements = elements;
  };
  ArrayPattern = ($traceurRuntime.createClass)(ArrayPattern, {
    transform: function(transformer) {
      return transformer.transformArrayPattern(this);
    },
    visit: function(visitor) {
      visitor.visitArrayPattern(this);
    },
    get type() {
      return ARRAY_PATTERN;
    }
  }, {}, ParseTree);
  var ARROW_FUNCTION_EXPRESSION = ParseTreeType.ARROW_FUNCTION_EXPRESSION;
  var ArrowFunctionExpression = function(location, formalParameters, functionBody) {
    this.location = location;
    this.formalParameters = formalParameters;
    this.functionBody = functionBody;
  };
  ArrowFunctionExpression = ($traceurRuntime.createClass)(ArrowFunctionExpression, {
    transform: function(transformer) {
      return transformer.transformArrowFunctionExpression(this);
    },
    visit: function(visitor) {
      visitor.visitArrowFunctionExpression(this);
    },
    get type() {
      return ARROW_FUNCTION_EXPRESSION;
    }
  }, {}, ParseTree);
  var AWAIT_STATEMENT = ParseTreeType.AWAIT_STATEMENT;
  var AwaitStatement = function(location, identifier, expression) {
    this.location = location;
    this.identifier = identifier;
    this.expression = expression;
  };
  AwaitStatement = ($traceurRuntime.createClass)(AwaitStatement, {
    transform: function(transformer) {
      return transformer.transformAwaitStatement(this);
    },
    visit: function(visitor) {
      visitor.visitAwaitStatement(this);
    },
    get type() {
      return AWAIT_STATEMENT;
    }
  }, {}, ParseTree);
  var BINARY_OPERATOR = ParseTreeType.BINARY_OPERATOR;
  var BinaryOperator = function(location, left, operator, right) {
    this.location = location;
    this.left = left;
    this.operator = operator;
    this.right = right;
  };
  BinaryOperator = ($traceurRuntime.createClass)(BinaryOperator, {
    transform: function(transformer) {
      return transformer.transformBinaryOperator(this);
    },
    visit: function(visitor) {
      visitor.visitBinaryOperator(this);
    },
    get type() {
      return BINARY_OPERATOR;
    }
  }, {}, ParseTree);
  var BINDING_ELEMENT = ParseTreeType.BINDING_ELEMENT;
  var BindingElement = function(location, binding, initialiser) {
    this.location = location;
    this.binding = binding;
    this.initialiser = initialiser;
  };
  BindingElement = ($traceurRuntime.createClass)(BindingElement, {
    transform: function(transformer) {
      return transformer.transformBindingElement(this);
    },
    visit: function(visitor) {
      visitor.visitBindingElement(this);
    },
    get type() {
      return BINDING_ELEMENT;
    }
  }, {}, ParseTree);
  var BINDING_IDENTIFIER = ParseTreeType.BINDING_IDENTIFIER;
  var BindingIdentifier = function(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  };
  BindingIdentifier = ($traceurRuntime.createClass)(BindingIdentifier, {
    transform: function(transformer) {
      return transformer.transformBindingIdentifier(this);
    },
    visit: function(visitor) {
      visitor.visitBindingIdentifier(this);
    },
    get type() {
      return BINDING_IDENTIFIER;
    }
  }, {}, ParseTree);
  var BLOCK = ParseTreeType.BLOCK;
  var Block = function(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  Block = ($traceurRuntime.createClass)(Block, {
    transform: function(transformer) {
      return transformer.transformBlock(this);
    },
    visit: function(visitor) {
      visitor.visitBlock(this);
    },
    get type() {
      return BLOCK;
    }
  }, {}, ParseTree);
  var BREAK_STATEMENT = ParseTreeType.BREAK_STATEMENT;
  var BreakStatement = function(location, name) {
    this.location = location;
    this.name = name;
  };
  BreakStatement = ($traceurRuntime.createClass)(BreakStatement, {
    transform: function(transformer) {
      return transformer.transformBreakStatement(this);
    },
    visit: function(visitor) {
      visitor.visitBreakStatement(this);
    },
    get type() {
      return BREAK_STATEMENT;
    }
  }, {}, ParseTree);
  var CALL_EXPRESSION = ParseTreeType.CALL_EXPRESSION;
  var CallExpression = function(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  };
  CallExpression = ($traceurRuntime.createClass)(CallExpression, {
    transform: function(transformer) {
      return transformer.transformCallExpression(this);
    },
    visit: function(visitor) {
      visitor.visitCallExpression(this);
    },
    get type() {
      return CALL_EXPRESSION;
    }
  }, {}, ParseTree);
  var CASE_CLAUSE = ParseTreeType.CASE_CLAUSE;
  var CaseClause = function(location, expression, statements) {
    this.location = location;
    this.expression = expression;
    this.statements = statements;
  };
  CaseClause = ($traceurRuntime.createClass)(CaseClause, {
    transform: function(transformer) {
      return transformer.transformCaseClause(this);
    },
    visit: function(visitor) {
      visitor.visitCaseClause(this);
    },
    get type() {
      return CASE_CLAUSE;
    }
  }, {}, ParseTree);
  var CATCH = ParseTreeType.CATCH;
  var Catch = function(location, binding, catchBody) {
    this.location = location;
    this.binding = binding;
    this.catchBody = catchBody;
  };
  Catch = ($traceurRuntime.createClass)(Catch, {
    transform: function(transformer) {
      return transformer.transformCatch(this);
    },
    visit: function(visitor) {
      visitor.visitCatch(this);
    },
    get type() {
      return CATCH;
    }
  }, {}, ParseTree);
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var ClassDeclaration = function(location, name, superClass, elements) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  };
  ClassDeclaration = ($traceurRuntime.createClass)(ClassDeclaration, {
    transform: function(transformer) {
      return transformer.transformClassDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitClassDeclaration(this);
    },
    get type() {
      return CLASS_DECLARATION;
    }
  }, {}, ParseTree);
  var CLASS_EXPRESSION = ParseTreeType.CLASS_EXPRESSION;
  var ClassExpression = function(location, name, superClass, elements) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  };
  ClassExpression = ($traceurRuntime.createClass)(ClassExpression, {
    transform: function(transformer) {
      return transformer.transformClassExpression(this);
    },
    visit: function(visitor) {
      visitor.visitClassExpression(this);
    },
    get type() {
      return CLASS_EXPRESSION;
    }
  }, {}, ParseTree);
  var COMMA_EXPRESSION = ParseTreeType.COMMA_EXPRESSION;
  var CommaExpression = function(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  };
  CommaExpression = ($traceurRuntime.createClass)(CommaExpression, {
    transform: function(transformer) {
      return transformer.transformCommaExpression(this);
    },
    visit: function(visitor) {
      visitor.visitCommaExpression(this);
    },
    get type() {
      return COMMA_EXPRESSION;
    }
  }, {}, ParseTree);
  var COMPREHENSION_FOR = ParseTreeType.COMPREHENSION_FOR;
  var ComprehensionFor = function(location, left, iterator) {
    this.location = location;
    this.left = left;
    this.iterator = iterator;
  };
  ComprehensionFor = ($traceurRuntime.createClass)(ComprehensionFor, {
    transform: function(transformer) {
      return transformer.transformComprehensionFor(this);
    },
    visit: function(visitor) {
      visitor.visitComprehensionFor(this);
    },
    get type() {
      return COMPREHENSION_FOR;
    }
  }, {}, ParseTree);
  var COMPREHENSION_IF = ParseTreeType.COMPREHENSION_IF;
  var ComprehensionIf = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ComprehensionIf = ($traceurRuntime.createClass)(ComprehensionIf, {
    transform: function(transformer) {
      return transformer.transformComprehensionIf(this);
    },
    visit: function(visitor) {
      visitor.visitComprehensionIf(this);
    },
    get type() {
      return COMPREHENSION_IF;
    }
  }, {}, ParseTree);
  var COMPUTED_PROPERTY_NAME = ParseTreeType.COMPUTED_PROPERTY_NAME;
  var ComputedPropertyName = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ComputedPropertyName = ($traceurRuntime.createClass)(ComputedPropertyName, {
    transform: function(transformer) {
      return transformer.transformComputedPropertyName(this);
    },
    visit: function(visitor) {
      visitor.visitComputedPropertyName(this);
    },
    get type() {
      return COMPUTED_PROPERTY_NAME;
    }
  }, {}, ParseTree);
  var CONDITIONAL_EXPRESSION = ParseTreeType.CONDITIONAL_EXPRESSION;
  var ConditionalExpression = function(location, condition, left, right) {
    this.location = location;
    this.condition = condition;
    this.left = left;
    this.right = right;
  };
  ConditionalExpression = ($traceurRuntime.createClass)(ConditionalExpression, {
    transform: function(transformer) {
      return transformer.transformConditionalExpression(this);
    },
    visit: function(visitor) {
      visitor.visitConditionalExpression(this);
    },
    get type() {
      return CONDITIONAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var CONTINUE_STATEMENT = ParseTreeType.CONTINUE_STATEMENT;
  var ContinueStatement = function(location, name) {
    this.location = location;
    this.name = name;
  };
  ContinueStatement = ($traceurRuntime.createClass)(ContinueStatement, {
    transform: function(transformer) {
      return transformer.transformContinueStatement(this);
    },
    visit: function(visitor) {
      visitor.visitContinueStatement(this);
    },
    get type() {
      return CONTINUE_STATEMENT;
    }
  }, {}, ParseTree);
  var COVER_FORMALS = ParseTreeType.COVER_FORMALS;
  var CoverFormals = function(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  };
  CoverFormals = ($traceurRuntime.createClass)(CoverFormals, {
    transform: function(transformer) {
      return transformer.transformCoverFormals(this);
    },
    visit: function(visitor) {
      visitor.visitCoverFormals(this);
    },
    get type() {
      return COVER_FORMALS;
    }
  }, {}, ParseTree);
  var COVER_INITIALISED_NAME = ParseTreeType.COVER_INITIALISED_NAME;
  var CoverInitialisedName = function(location, name, equalToken, initialiser) {
    this.location = location;
    this.name = name;
    this.equalToken = equalToken;
    this.initialiser = initialiser;
  };
  CoverInitialisedName = ($traceurRuntime.createClass)(CoverInitialisedName, {
    transform: function(transformer) {
      return transformer.transformCoverInitialisedName(this);
    },
    visit: function(visitor) {
      visitor.visitCoverInitialisedName(this);
    },
    get type() {
      return COVER_INITIALISED_NAME;
    }
  }, {}, ParseTree);
  var DEBUGGER_STATEMENT = ParseTreeType.DEBUGGER_STATEMENT;
  var DebuggerStatement = function(location) {
    this.location = location;
  };
  DebuggerStatement = ($traceurRuntime.createClass)(DebuggerStatement, {
    transform: function(transformer) {
      return transformer.transformDebuggerStatement(this);
    },
    visit: function(visitor) {
      visitor.visitDebuggerStatement(this);
    },
    get type() {
      return DEBUGGER_STATEMENT;
    }
  }, {}, ParseTree);
  var DEFAULT_CLAUSE = ParseTreeType.DEFAULT_CLAUSE;
  var DefaultClause = function(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  DefaultClause = ($traceurRuntime.createClass)(DefaultClause, {
    transform: function(transformer) {
      return transformer.transformDefaultClause(this);
    },
    visit: function(visitor) {
      visitor.visitDefaultClause(this);
    },
    get type() {
      return DEFAULT_CLAUSE;
    }
  }, {}, ParseTree);
  var DO_WHILE_STATEMENT = ParseTreeType.DO_WHILE_STATEMENT;
  var DoWhileStatement = function(location, body, condition) {
    this.location = location;
    this.body = body;
    this.condition = condition;
  };
  DoWhileStatement = ($traceurRuntime.createClass)(DoWhileStatement, {
    transform: function(transformer) {
      return transformer.transformDoWhileStatement(this);
    },
    visit: function(visitor) {
      visitor.visitDoWhileStatement(this);
    },
    get type() {
      return DO_WHILE_STATEMENT;
    }
  }, {}, ParseTree);
  var EMPTY_STATEMENT = ParseTreeType.EMPTY_STATEMENT;
  var EmptyStatement = function(location) {
    this.location = location;
  };
  EmptyStatement = ($traceurRuntime.createClass)(EmptyStatement, {
    transform: function(transformer) {
      return transformer.transformEmptyStatement(this);
    },
    visit: function(visitor) {
      visitor.visitEmptyStatement(this);
    },
    get type() {
      return EMPTY_STATEMENT;
    }
  }, {}, ParseTree);
  var EXPORT_DECLARATION = ParseTreeType.EXPORT_DECLARATION;
  var ExportDeclaration = function(location, declaration) {
    this.location = location;
    this.declaration = declaration;
  };
  ExportDeclaration = ($traceurRuntime.createClass)(ExportDeclaration, {
    transform: function(transformer) {
      return transformer.transformExportDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitExportDeclaration(this);
    },
    get type() {
      return EXPORT_DECLARATION;
    }
  }, {}, ParseTree);
  var EXPORT_DEFAULT = ParseTreeType.EXPORT_DEFAULT;
  var ExportDefault = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ExportDefault = ($traceurRuntime.createClass)(ExportDefault, {
    transform: function(transformer) {
      return transformer.transformExportDefault(this);
    },
    visit: function(visitor) {
      visitor.visitExportDefault(this);
    },
    get type() {
      return EXPORT_DEFAULT;
    }
  }, {}, ParseTree);
  var EXPORT_SPECIFIER = ParseTreeType.EXPORT_SPECIFIER;
  var ExportSpecifier = function(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  };
  ExportSpecifier = ($traceurRuntime.createClass)(ExportSpecifier, {
    transform: function(transformer) {
      return transformer.transformExportSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitExportSpecifier(this);
    },
    get type() {
      return EXPORT_SPECIFIER;
    }
  }, {}, ParseTree);
  var EXPORT_SPECIFIER_SET = ParseTreeType.EXPORT_SPECIFIER_SET;
  var ExportSpecifierSet = function(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  };
  ExportSpecifierSet = ($traceurRuntime.createClass)(ExportSpecifierSet, {
    transform: function(transformer) {
      return transformer.transformExportSpecifierSet(this);
    },
    visit: function(visitor) {
      visitor.visitExportSpecifierSet(this);
    },
    get type() {
      return EXPORT_SPECIFIER_SET;
    }
  }, {}, ParseTree);
  var EXPORT_STAR = ParseTreeType.EXPORT_STAR;
  var ExportStar = function(location) {
    this.location = location;
  };
  ExportStar = ($traceurRuntime.createClass)(ExportStar, {
    transform: function(transformer) {
      return transformer.transformExportStar(this);
    },
    visit: function(visitor) {
      visitor.visitExportStar(this);
    },
    get type() {
      return EXPORT_STAR;
    }
  }, {}, ParseTree);
  var EXPRESSION_STATEMENT = ParseTreeType.EXPRESSION_STATEMENT;
  var ExpressionStatement = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ExpressionStatement = ($traceurRuntime.createClass)(ExpressionStatement, {
    transform: function(transformer) {
      return transformer.transformExpressionStatement(this);
    },
    visit: function(visitor) {
      visitor.visitExpressionStatement(this);
    },
    get type() {
      return EXPRESSION_STATEMENT;
    }
  }, {}, ParseTree);
  var FINALLY = ParseTreeType.FINALLY;
  var Finally = function(location, block) {
    this.location = location;
    this.block = block;
  };
  Finally = ($traceurRuntime.createClass)(Finally, {
    transform: function(transformer) {
      return transformer.transformFinally(this);
    },
    visit: function(visitor) {
      visitor.visitFinally(this);
    },
    get type() {
      return FINALLY;
    }
  }, {}, ParseTree);
  var FOR_IN_STATEMENT = ParseTreeType.FOR_IN_STATEMENT;
  var ForInStatement = function(location, initialiser, collection, body) {
    this.location = location;
    this.initialiser = initialiser;
    this.collection = collection;
    this.body = body;
  };
  ForInStatement = ($traceurRuntime.createClass)(ForInStatement, {
    transform: function(transformer) {
      return transformer.transformForInStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForInStatement(this);
    },
    get type() {
      return FOR_IN_STATEMENT;
    }
  }, {}, ParseTree);
  var FOR_OF_STATEMENT = ParseTreeType.FOR_OF_STATEMENT;
  var ForOfStatement = function(location, initialiser, collection, body) {
    this.location = location;
    this.initialiser = initialiser;
    this.collection = collection;
    this.body = body;
  };
  ForOfStatement = ($traceurRuntime.createClass)(ForOfStatement, {
    transform: function(transformer) {
      return transformer.transformForOfStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForOfStatement(this);
    },
    get type() {
      return FOR_OF_STATEMENT;
    }
  }, {}, ParseTree);
  var FOR_STATEMENT = ParseTreeType.FOR_STATEMENT;
  var ForStatement = function(location, initialiser, condition, increment, body) {
    this.location = location;
    this.initialiser = initialiser;
    this.condition = condition;
    this.increment = increment;
    this.body = body;
  };
  ForStatement = ($traceurRuntime.createClass)(ForStatement, {
    transform: function(transformer) {
      return transformer.transformForStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForStatement(this);
    },
    get type() {
      return FOR_STATEMENT;
    }
  }, {}, ParseTree);
  var FORMAL_PARAMETER = ParseTreeType.FORMAL_PARAMETER;
  var FormalParameter = function(location, parameter, typeAnnotation) {
    this.location = location;
    this.parameter = parameter;
    this.typeAnnotation = typeAnnotation;
  };
  FormalParameter = ($traceurRuntime.createClass)(FormalParameter, {
    transform: function(transformer) {
      return transformer.transformFormalParameter(this);
    },
    visit: function(visitor) {
      visitor.visitFormalParameter(this);
    },
    get type() {
      return FORMAL_PARAMETER;
    }
  }, {}, ParseTree);
  var FORMAL_PARAMETER_LIST = ParseTreeType.FORMAL_PARAMETER_LIST;
  var FormalParameterList = function(location, parameters) {
    this.location = location;
    this.parameters = parameters;
  };
  FormalParameterList = ($traceurRuntime.createClass)(FormalParameterList, {
    transform: function(transformer) {
      return transformer.transformFormalParameterList(this);
    },
    visit: function(visitor) {
      visitor.visitFormalParameterList(this);
    },
    get type() {
      return FORMAL_PARAMETER_LIST;
    }
  }, {}, ParseTree);
  var FUNCTION_BODY = ParseTreeType.FUNCTION_BODY;
  var FunctionBody = function(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  FunctionBody = ($traceurRuntime.createClass)(FunctionBody, {
    transform: function(transformer) {
      return transformer.transformFunctionBody(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionBody(this);
    },
    get type() {
      return FUNCTION_BODY;
    }
  }, {}, ParseTree);
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var FunctionDeclaration = function(location, name, isGenerator, formalParameterList, typeAnnotation, functionBody) {
    this.location = location;
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.typeAnnotation = typeAnnotation;
    this.functionBody = functionBody;
  };
  FunctionDeclaration = ($traceurRuntime.createClass)(FunctionDeclaration, {
    transform: function(transformer) {
      return transformer.transformFunctionDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionDeclaration(this);
    },
    get type() {
      return FUNCTION_DECLARATION;
    }
  }, {}, ParseTree);
  var FUNCTION_EXPRESSION = ParseTreeType.FUNCTION_EXPRESSION;
  var FunctionExpression = function(location, name, isGenerator, formalParameterList, typeAnnotation, functionBody) {
    this.location = location;
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.typeAnnotation = typeAnnotation;
    this.functionBody = functionBody;
  };
  FunctionExpression = ($traceurRuntime.createClass)(FunctionExpression, {
    transform: function(transformer) {
      return transformer.transformFunctionExpression(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionExpression(this);
    },
    get type() {
      return FUNCTION_EXPRESSION;
    }
  }, {}, ParseTree);
  var GENERATOR_COMPREHENSION = ParseTreeType.GENERATOR_COMPREHENSION;
  var GeneratorComprehension = function(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  };
  GeneratorComprehension = ($traceurRuntime.createClass)(GeneratorComprehension, {
    transform: function(transformer) {
      return transformer.transformGeneratorComprehension(this);
    },
    visit: function(visitor) {
      visitor.visitGeneratorComprehension(this);
    },
    get type() {
      return GENERATOR_COMPREHENSION;
    }
  }, {}, ParseTree);
  var GET_ACCESSOR = ParseTreeType.GET_ACCESSOR;
  var GetAccessor = function(location, isStatic, name, typeAnnotation, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.body = body;
  };
  GetAccessor = ($traceurRuntime.createClass)(GetAccessor, {
    transform: function(transformer) {
      return transformer.transformGetAccessor(this);
    },
    visit: function(visitor) {
      visitor.visitGetAccessor(this);
    },
    get type() {
      return GET_ACCESSOR;
    }
  }, {}, ParseTree);
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;
  var IdentifierExpression = function(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  };
  IdentifierExpression = ($traceurRuntime.createClass)(IdentifierExpression, {
    transform: function(transformer) {
      return transformer.transformIdentifierExpression(this);
    },
    visit: function(visitor) {
      visitor.visitIdentifierExpression(this);
    },
    get type() {
      return IDENTIFIER_EXPRESSION;
    }
  }, {}, ParseTree);
  var IF_STATEMENT = ParseTreeType.IF_STATEMENT;
  var IfStatement = function(location, condition, ifClause, elseClause) {
    this.location = location;
    this.condition = condition;
    this.ifClause = ifClause;
    this.elseClause = elseClause;
  };
  IfStatement = ($traceurRuntime.createClass)(IfStatement, {
    transform: function(transformer) {
      return transformer.transformIfStatement(this);
    },
    visit: function(visitor) {
      visitor.visitIfStatement(this);
    },
    get type() {
      return IF_STATEMENT;
    }
  }, {}, ParseTree);
  var IMPORTED_BINDING = ParseTreeType.IMPORTED_BINDING;
  var ImportedBinding = function(location, binding) {
    this.location = location;
    this.binding = binding;
  };
  ImportedBinding = ($traceurRuntime.createClass)(ImportedBinding, {
    transform: function(transformer) {
      return transformer.transformImportedBinding(this);
    },
    visit: function(visitor) {
      visitor.visitImportedBinding(this);
    },
    get type() {
      return IMPORTED_BINDING;
    }
  }, {}, ParseTree);
  var IMPORT_DECLARATION = ParseTreeType.IMPORT_DECLARATION;
  var ImportDeclaration = function(location, importClause, moduleSpecifier) {
    this.location = location;
    this.importClause = importClause;
    this.moduleSpecifier = moduleSpecifier;
  };
  ImportDeclaration = ($traceurRuntime.createClass)(ImportDeclaration, {
    transform: function(transformer) {
      return transformer.transformImportDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitImportDeclaration(this);
    },
    get type() {
      return IMPORT_DECLARATION;
    }
  }, {}, ParseTree);
  var IMPORT_SPECIFIER = ParseTreeType.IMPORT_SPECIFIER;
  var ImportSpecifier = function(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  };
  ImportSpecifier = ($traceurRuntime.createClass)(ImportSpecifier, {
    transform: function(transformer) {
      return transformer.transformImportSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitImportSpecifier(this);
    },
    get type() {
      return IMPORT_SPECIFIER;
    }
  }, {}, ParseTree);
  var IMPORT_SPECIFIER_SET = ParseTreeType.IMPORT_SPECIFIER_SET;
  var ImportSpecifierSet = function(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  };
  ImportSpecifierSet = ($traceurRuntime.createClass)(ImportSpecifierSet, {
    transform: function(transformer) {
      return transformer.transformImportSpecifierSet(this);
    },
    visit: function(visitor) {
      visitor.visitImportSpecifierSet(this);
    },
    get type() {
      return IMPORT_SPECIFIER_SET;
    }
  }, {}, ParseTree);
  var LABELLED_STATEMENT = ParseTreeType.LABELLED_STATEMENT;
  var LabelledStatement = function(location, name, statement) {
    this.location = location;
    this.name = name;
    this.statement = statement;
  };
  LabelledStatement = ($traceurRuntime.createClass)(LabelledStatement, {
    transform: function(transformer) {
      return transformer.transformLabelledStatement(this);
    },
    visit: function(visitor) {
      visitor.visitLabelledStatement(this);
    },
    get type() {
      return LABELLED_STATEMENT;
    }
  }, {}, ParseTree);
  var LITERAL_EXPRESSION = ParseTreeType.LITERAL_EXPRESSION;
  var LiteralExpression = function(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  };
  LiteralExpression = ($traceurRuntime.createClass)(LiteralExpression, {
    transform: function(transformer) {
      return transformer.transformLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitLiteralExpression(this);
    },
    get type() {
      return LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var LITERAL_PROPERTY_NAME = ParseTreeType.LITERAL_PROPERTY_NAME;
  var LiteralPropertyName = function(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  };
  LiteralPropertyName = ($traceurRuntime.createClass)(LiteralPropertyName, {
    transform: function(transformer) {
      return transformer.transformLiteralPropertyName(this);
    },
    visit: function(visitor) {
      visitor.visitLiteralPropertyName(this);
    },
    get type() {
      return LITERAL_PROPERTY_NAME;
    }
  }, {}, ParseTree);
  var MEMBER_EXPRESSION = ParseTreeType.MEMBER_EXPRESSION;
  var MemberExpression = function(location, operand, memberName) {
    this.location = location;
    this.operand = operand;
    this.memberName = memberName;
  };
  MemberExpression = ($traceurRuntime.createClass)(MemberExpression, {
    transform: function(transformer) {
      return transformer.transformMemberExpression(this);
    },
    visit: function(visitor) {
      visitor.visitMemberExpression(this);
    },
    get type() {
      return MEMBER_EXPRESSION;
    }
  }, {}, ParseTree);
  var MEMBER_LOOKUP_EXPRESSION = ParseTreeType.MEMBER_LOOKUP_EXPRESSION;
  var MemberLookupExpression = function(location, operand, memberExpression) {
    this.location = location;
    this.operand = operand;
    this.memberExpression = memberExpression;
  };
  MemberLookupExpression = ($traceurRuntime.createClass)(MemberLookupExpression, {
    transform: function(transformer) {
      return transformer.transformMemberLookupExpression(this);
    },
    visit: function(visitor) {
      visitor.visitMemberLookupExpression(this);
    },
    get type() {
      return MEMBER_LOOKUP_EXPRESSION;
    }
  }, {}, ParseTree);
  var MODULE = ParseTreeType.MODULE;
  var Module = function(location, scriptItemList, moduleName) {
    this.location = location;
    this.scriptItemList = scriptItemList;
    this.moduleName = moduleName;
  };
  Module = ($traceurRuntime.createClass)(Module, {
    transform: function(transformer) {
      return transformer.transformModule(this);
    },
    visit: function(visitor) {
      visitor.visitModule(this);
    },
    get type() {
      return MODULE;
    }
  }, {}, ParseTree);
  var MODULE_DECLARATION = ParseTreeType.MODULE_DECLARATION;
  var ModuleDeclaration = function(location, identifier, expression) {
    this.location = location;
    this.identifier = identifier;
    this.expression = expression;
  };
  ModuleDeclaration = ($traceurRuntime.createClass)(ModuleDeclaration, {
    transform: function(transformer) {
      return transformer.transformModuleDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitModuleDeclaration(this);
    },
    get type() {
      return MODULE_DECLARATION;
    }
  }, {}, ParseTree);
  var MODULE_SPECIFIER = ParseTreeType.MODULE_SPECIFIER;
  var ModuleSpecifier = function(location, token) {
    this.location = location;
    this.token = token;
  };
  ModuleSpecifier = ($traceurRuntime.createClass)(ModuleSpecifier, {
    transform: function(transformer) {
      return transformer.transformModuleSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitModuleSpecifier(this);
    },
    get type() {
      return MODULE_SPECIFIER;
    }
  }, {}, ParseTree);
  var NAMED_EXPORT = ParseTreeType.NAMED_EXPORT;
  var NamedExport = function(location, moduleSpecifier, specifierSet) {
    this.location = location;
    this.moduleSpecifier = moduleSpecifier;
    this.specifierSet = specifierSet;
  };
  NamedExport = ($traceurRuntime.createClass)(NamedExport, {
    transform: function(transformer) {
      return transformer.transformNamedExport(this);
    },
    visit: function(visitor) {
      visitor.visitNamedExport(this);
    },
    get type() {
      return NAMED_EXPORT;
    }
  }, {}, ParseTree);
  var NEW_EXPRESSION = ParseTreeType.NEW_EXPRESSION;
  var NewExpression = function(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  };
  NewExpression = ($traceurRuntime.createClass)(NewExpression, {
    transform: function(transformer) {
      return transformer.transformNewExpression(this);
    },
    visit: function(visitor) {
      visitor.visitNewExpression(this);
    },
    get type() {
      return NEW_EXPRESSION;
    }
  }, {}, ParseTree);
  var OBJECT_LITERAL_EXPRESSION = ParseTreeType.OBJECT_LITERAL_EXPRESSION;
  var ObjectLiteralExpression = function(location, propertyNameAndValues) {
    this.location = location;
    this.propertyNameAndValues = propertyNameAndValues;
  };
  ObjectLiteralExpression = ($traceurRuntime.createClass)(ObjectLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformObjectLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitObjectLiteralExpression(this);
    },
    get type() {
      return OBJECT_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var OBJECT_PATTERN = ParseTreeType.OBJECT_PATTERN;
  var ObjectPattern = function(location, fields) {
    this.location = location;
    this.fields = fields;
  };
  ObjectPattern = ($traceurRuntime.createClass)(ObjectPattern, {
    transform: function(transformer) {
      return transformer.transformObjectPattern(this);
    },
    visit: function(visitor) {
      visitor.visitObjectPattern(this);
    },
    get type() {
      return OBJECT_PATTERN;
    }
  }, {}, ParseTree);
  var OBJECT_PATTERN_FIELD = ParseTreeType.OBJECT_PATTERN_FIELD;
  var ObjectPatternField = function(location, name, element) {
    this.location = location;
    this.name = name;
    this.element = element;
  };
  ObjectPatternField = ($traceurRuntime.createClass)(ObjectPatternField, {
    transform: function(transformer) {
      return transformer.transformObjectPatternField(this);
    },
    visit: function(visitor) {
      visitor.visitObjectPatternField(this);
    },
    get type() {
      return OBJECT_PATTERN_FIELD;
    }
  }, {}, ParseTree);
  var PAREN_EXPRESSION = ParseTreeType.PAREN_EXPRESSION;
  var ParenExpression = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ParenExpression = ($traceurRuntime.createClass)(ParenExpression, {
    transform: function(transformer) {
      return transformer.transformParenExpression(this);
    },
    visit: function(visitor) {
      visitor.visitParenExpression(this);
    },
    get type() {
      return PAREN_EXPRESSION;
    }
  }, {}, ParseTree);
  var POSTFIX_EXPRESSION = ParseTreeType.POSTFIX_EXPRESSION;
  var PostfixExpression = function(location, operand, operator) {
    this.location = location;
    this.operand = operand;
    this.operator = operator;
  };
  PostfixExpression = ($traceurRuntime.createClass)(PostfixExpression, {
    transform: function(transformer) {
      return transformer.transformPostfixExpression(this);
    },
    visit: function(visitor) {
      visitor.visitPostfixExpression(this);
    },
    get type() {
      return POSTFIX_EXPRESSION;
    }
  }, {}, ParseTree);
  var PREDEFINED_TYPE = ParseTreeType.PREDEFINED_TYPE;
  var PredefinedType = function(location, typeToken) {
    this.location = location;
    this.typeToken = typeToken;
  };
  PredefinedType = ($traceurRuntime.createClass)(PredefinedType, {
    transform: function(transformer) {
      return transformer.transformPredefinedType(this);
    },
    visit: function(visitor) {
      visitor.visitPredefinedType(this);
    },
    get type() {
      return PREDEFINED_TYPE;
    }
  }, {}, ParseTree);
  var SCRIPT = ParseTreeType.SCRIPT;
  var Script = function(location, scriptItemList, moduleName) {
    this.location = location;
    this.scriptItemList = scriptItemList;
    this.moduleName = moduleName;
  };
  Script = ($traceurRuntime.createClass)(Script, {
    transform: function(transformer) {
      return transformer.transformScript(this);
    },
    visit: function(visitor) {
      visitor.visitScript(this);
    },
    get type() {
      return SCRIPT;
    }
  }, {}, ParseTree);
  var PROPERTY_METHOD_ASSIGNMENT = ParseTreeType.PROPERTY_METHOD_ASSIGNMENT;
  var PropertyMethodAssignment = function(location, isStatic, isGenerator, name, formalParameterList, typeAnnotation, functionBody) {
    this.location = location;
    this.isStatic = isStatic;
    this.isGenerator = isGenerator;
    this.name = name;
    this.formalParameterList = formalParameterList;
    this.typeAnnotation = typeAnnotation;
    this.functionBody = functionBody;
  };
  PropertyMethodAssignment = ($traceurRuntime.createClass)(PropertyMethodAssignment, {
    transform: function(transformer) {
      return transformer.transformPropertyMethodAssignment(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyMethodAssignment(this);
    },
    get type() {
      return PROPERTY_METHOD_ASSIGNMENT;
    }
  }, {}, ParseTree);
  var PROPERTY_NAME_ASSIGNMENT = ParseTreeType.PROPERTY_NAME_ASSIGNMENT;
  var PropertyNameAssignment = function(location, name, value) {
    this.location = location;
    this.name = name;
    this.value = value;
  };
  PropertyNameAssignment = ($traceurRuntime.createClass)(PropertyNameAssignment, {
    transform: function(transformer) {
      return transformer.transformPropertyNameAssignment(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyNameAssignment(this);
    },
    get type() {
      return PROPERTY_NAME_ASSIGNMENT;
    }
  }, {}, ParseTree);
  var PROPERTY_NAME_SHORTHAND = ParseTreeType.PROPERTY_NAME_SHORTHAND;
  var PropertyNameShorthand = function(location, name) {
    this.location = location;
    this.name = name;
  };
  PropertyNameShorthand = ($traceurRuntime.createClass)(PropertyNameShorthand, {
    transform: function(transformer) {
      return transformer.transformPropertyNameShorthand(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyNameShorthand(this);
    },
    get type() {
      return PROPERTY_NAME_SHORTHAND;
    }
  }, {}, ParseTree);
  var REST_PARAMETER = ParseTreeType.REST_PARAMETER;
  var RestParameter = function(location, identifier) {
    this.location = location;
    this.identifier = identifier;
  };
  RestParameter = ($traceurRuntime.createClass)(RestParameter, {
    transform: function(transformer) {
      return transformer.transformRestParameter(this);
    },
    visit: function(visitor) {
      visitor.visitRestParameter(this);
    },
    get type() {
      return REST_PARAMETER;
    }
  }, {}, ParseTree);
  var RETURN_STATEMENT = ParseTreeType.RETURN_STATEMENT;
  var ReturnStatement = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ReturnStatement = ($traceurRuntime.createClass)(ReturnStatement, {
    transform: function(transformer) {
      return transformer.transformReturnStatement(this);
    },
    visit: function(visitor) {
      visitor.visitReturnStatement(this);
    },
    get type() {
      return RETURN_STATEMENT;
    }
  }, {}, ParseTree);
  var SET_ACCESSOR = ParseTreeType.SET_ACCESSOR;
  var SetAccessor = function(location, isStatic, name, parameter, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.parameter = parameter;
    this.body = body;
  };
  SetAccessor = ($traceurRuntime.createClass)(SetAccessor, {
    transform: function(transformer) {
      return transformer.transformSetAccessor(this);
    },
    visit: function(visitor) {
      visitor.visitSetAccessor(this);
    },
    get type() {
      return SET_ACCESSOR;
    }
  }, {}, ParseTree);
  var SPREAD_EXPRESSION = ParseTreeType.SPREAD_EXPRESSION;
  var SpreadExpression = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  SpreadExpression = ($traceurRuntime.createClass)(SpreadExpression, {
    transform: function(transformer) {
      return transformer.transformSpreadExpression(this);
    },
    visit: function(visitor) {
      visitor.visitSpreadExpression(this);
    },
    get type() {
      return SPREAD_EXPRESSION;
    }
  }, {}, ParseTree);
  var SPREAD_PATTERN_ELEMENT = ParseTreeType.SPREAD_PATTERN_ELEMENT;
  var SpreadPatternElement = function(location, lvalue) {
    this.location = location;
    this.lvalue = lvalue;
  };
  SpreadPatternElement = ($traceurRuntime.createClass)(SpreadPatternElement, {
    transform: function(transformer) {
      return transformer.transformSpreadPatternElement(this);
    },
    visit: function(visitor) {
      visitor.visitSpreadPatternElement(this);
    },
    get type() {
      return SPREAD_PATTERN_ELEMENT;
    }
  }, {}, ParseTree);
  var SUPER_EXPRESSION = ParseTreeType.SUPER_EXPRESSION;
  var SuperExpression = function(location) {
    this.location = location;
  };
  SuperExpression = ($traceurRuntime.createClass)(SuperExpression, {
    transform: function(transformer) {
      return transformer.transformSuperExpression(this);
    },
    visit: function(visitor) {
      visitor.visitSuperExpression(this);
    },
    get type() {
      return SUPER_EXPRESSION;
    }
  }, {}, ParseTree);
  var SWITCH_STATEMENT = ParseTreeType.SWITCH_STATEMENT;
  var SwitchStatement = function(location, expression, caseClauses) {
    this.location = location;
    this.expression = expression;
    this.caseClauses = caseClauses;
  };
  SwitchStatement = ($traceurRuntime.createClass)(SwitchStatement, {
    transform: function(transformer) {
      return transformer.transformSwitchStatement(this);
    },
    visit: function(visitor) {
      visitor.visitSwitchStatement(this);
    },
    get type() {
      return SWITCH_STATEMENT;
    }
  }, {}, ParseTree);
  var SYNTAX_ERROR_TREE = ParseTreeType.SYNTAX_ERROR_TREE;
  var SyntaxErrorTree = function(location, nextToken, message) {
    this.location = location;
    this.nextToken = nextToken;
    this.message = message;
  };
  SyntaxErrorTree = ($traceurRuntime.createClass)(SyntaxErrorTree, {
    transform: function(transformer) {
      return transformer.transformSyntaxErrorTree(this);
    },
    visit: function(visitor) {
      visitor.visitSyntaxErrorTree(this);
    },
    get type() {
      return SYNTAX_ERROR_TREE;
    }
  }, {}, ParseTree);
  var TEMPLATE_LITERAL_EXPRESSION = ParseTreeType.TEMPLATE_LITERAL_EXPRESSION;
  var TemplateLiteralExpression = function(location, operand, elements) {
    this.location = location;
    this.operand = operand;
    this.elements = elements;
  };
  TemplateLiteralExpression = ($traceurRuntime.createClass)(TemplateLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformTemplateLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateLiteralExpression(this);
    },
    get type() {
      return TEMPLATE_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var TEMPLATE_LITERAL_PORTION = ParseTreeType.TEMPLATE_LITERAL_PORTION;
  var TemplateLiteralPortion = function(location, value) {
    this.location = location;
    this.value = value;
  };
  TemplateLiteralPortion = ($traceurRuntime.createClass)(TemplateLiteralPortion, {
    transform: function(transformer) {
      return transformer.transformTemplateLiteralPortion(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateLiteralPortion(this);
    },
    get type() {
      return TEMPLATE_LITERAL_PORTION;
    }
  }, {}, ParseTree);
  var TEMPLATE_SUBSTITUTION = ParseTreeType.TEMPLATE_SUBSTITUTION;
  var TemplateSubstitution = function(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  TemplateSubstitution = ($traceurRuntime.createClass)(TemplateSubstitution, {
    transform: function(transformer) {
      return transformer.transformTemplateSubstitution(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateSubstitution(this);
    },
    get type() {
      return TEMPLATE_SUBSTITUTION;
    }
  }, {}, ParseTree);
  var THIS_EXPRESSION = ParseTreeType.THIS_EXPRESSION;
  var ThisExpression = function(location) {
    this.location = location;
  };
  ThisExpression = ($traceurRuntime.createClass)(ThisExpression, {
    transform: function(transformer) {
      return transformer.transformThisExpression(this);
    },
    visit: function(visitor) {
      visitor.visitThisExpression(this);
    },
    get type() {
      return THIS_EXPRESSION;
    }
  }, {}, ParseTree);
  var THROW_STATEMENT = ParseTreeType.THROW_STATEMENT;
  var ThrowStatement = function(location, value) {
    this.location = location;
    this.value = value;
  };
  ThrowStatement = ($traceurRuntime.createClass)(ThrowStatement, {
    transform: function(transformer) {
      return transformer.transformThrowStatement(this);
    },
    visit: function(visitor) {
      visitor.visitThrowStatement(this);
    },
    get type() {
      return THROW_STATEMENT;
    }
  }, {}, ParseTree);
  var TRY_STATEMENT = ParseTreeType.TRY_STATEMENT;
  var TryStatement = function(location, body, catchBlock, finallyBlock) {
    this.location = location;
    this.body = body;
    this.catchBlock = catchBlock;
    this.finallyBlock = finallyBlock;
  };
  TryStatement = ($traceurRuntime.createClass)(TryStatement, {
    transform: function(transformer) {
      return transformer.transformTryStatement(this);
    },
    visit: function(visitor) {
      visitor.visitTryStatement(this);
    },
    get type() {
      return TRY_STATEMENT;
    }
  }, {}, ParseTree);
  var TYPE_NAME = ParseTreeType.TYPE_NAME;
  var TypeName = function(location, moduleName, name) {
    this.location = location;
    this.moduleName = moduleName;
    this.name = name;
  };
  TypeName = ($traceurRuntime.createClass)(TypeName, {
    transform: function(transformer) {
      return transformer.transformTypeName(this);
    },
    visit: function(visitor) {
      visitor.visitTypeName(this);
    },
    get type() {
      return TYPE_NAME;
    }
  }, {}, ParseTree);
  var UNARY_EXPRESSION = ParseTreeType.UNARY_EXPRESSION;
  var UnaryExpression = function(location, operator, operand) {
    this.location = location;
    this.operator = operator;
    this.operand = operand;
  };
  UnaryExpression = ($traceurRuntime.createClass)(UnaryExpression, {
    transform: function(transformer) {
      return transformer.transformUnaryExpression(this);
    },
    visit: function(visitor) {
      visitor.visitUnaryExpression(this);
    },
    get type() {
      return UNARY_EXPRESSION;
    }
  }, {}, ParseTree);
  var VARIABLE_DECLARATION = ParseTreeType.VARIABLE_DECLARATION;
  var VariableDeclaration = function(location, lvalue, typeAnnotation, initialiser) {
    this.location = location;
    this.lvalue = lvalue;
    this.typeAnnotation = typeAnnotation;
    this.initialiser = initialiser;
  };
  VariableDeclaration = ($traceurRuntime.createClass)(VariableDeclaration, {
    transform: function(transformer) {
      return transformer.transformVariableDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitVariableDeclaration(this);
    },
    get type() {
      return VARIABLE_DECLARATION;
    }
  }, {}, ParseTree);
  var VARIABLE_DECLARATION_LIST = ParseTreeType.VARIABLE_DECLARATION_LIST;
  var VariableDeclarationList = function(location, declarationType, declarations) {
    this.location = location;
    this.declarationType = declarationType;
    this.declarations = declarations;
  };
  VariableDeclarationList = ($traceurRuntime.createClass)(VariableDeclarationList, {
    transform: function(transformer) {
      return transformer.transformVariableDeclarationList(this);
    },
    visit: function(visitor) {
      visitor.visitVariableDeclarationList(this);
    },
    get type() {
      return VARIABLE_DECLARATION_LIST;
    }
  }, {}, ParseTree);
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var VariableStatement = function(location, declarations) {
    this.location = location;
    this.declarations = declarations;
  };
  VariableStatement = ($traceurRuntime.createClass)(VariableStatement, {
    transform: function(transformer) {
      return transformer.transformVariableStatement(this);
    },
    visit: function(visitor) {
      visitor.visitVariableStatement(this);
    },
    get type() {
      return VARIABLE_STATEMENT;
    }
  }, {}, ParseTree);
  var WHILE_STATEMENT = ParseTreeType.WHILE_STATEMENT;
  var WhileStatement = function(location, condition, body) {
    this.location = location;
    this.condition = condition;
    this.body = body;
  };
  WhileStatement = ($traceurRuntime.createClass)(WhileStatement, {
    transform: function(transformer) {
      return transformer.transformWhileStatement(this);
    },
    visit: function(visitor) {
      visitor.visitWhileStatement(this);
    },
    get type() {
      return WHILE_STATEMENT;
    }
  }, {}, ParseTree);
  var WITH_STATEMENT = ParseTreeType.WITH_STATEMENT;
  var WithStatement = function(location, expression, body) {
    this.location = location;
    this.expression = expression;
    this.body = body;
  };
  WithStatement = ($traceurRuntime.createClass)(WithStatement, {
    transform: function(transformer) {
      return transformer.transformWithStatement(this);
    },
    visit: function(visitor) {
      visitor.visitWithStatement(this);
    },
    get type() {
      return WITH_STATEMENT;
    }
  }, {}, ParseTree);
  var YIELD_EXPRESSION = ParseTreeType.YIELD_EXPRESSION;
  var YieldExpression = function(location, expression, isYieldFor) {
    this.location = location;
    this.expression = expression;
    this.isYieldFor = isYieldFor;
  };
  YieldExpression = ($traceurRuntime.createClass)(YieldExpression, {
    transform: function(transformer) {
      return transformer.transformYieldExpression(this);
    },
    visit: function(visitor) {
      visitor.visitYieldExpression(this);
    },
    get type() {
      return YIELD_EXPRESSION;
    }
  }, {}, ParseTree);
  return {
    get AnonBlock() {
      return AnonBlock;
    },
    get ArgumentList() {
      return ArgumentList;
    },
    get ArrayComprehension() {
      return ArrayComprehension;
    },
    get ArrayLiteralExpression() {
      return ArrayLiteralExpression;
    },
    get ArrayPattern() {
      return ArrayPattern;
    },
    get ArrowFunctionExpression() {
      return ArrowFunctionExpression;
    },
    get AwaitStatement() {
      return AwaitStatement;
    },
    get BinaryOperator() {
      return BinaryOperator;
    },
    get BindingElement() {
      return BindingElement;
    },
    get BindingIdentifier() {
      return BindingIdentifier;
    },
    get Block() {
      return Block;
    },
    get BreakStatement() {
      return BreakStatement;
    },
    get CallExpression() {
      return CallExpression;
    },
    get CaseClause() {
      return CaseClause;
    },
    get Catch() {
      return Catch;
    },
    get ClassDeclaration() {
      return ClassDeclaration;
    },
    get ClassExpression() {
      return ClassExpression;
    },
    get CommaExpression() {
      return CommaExpression;
    },
    get ComprehensionFor() {
      return ComprehensionFor;
    },
    get ComprehensionIf() {
      return ComprehensionIf;
    },
    get ComputedPropertyName() {
      return ComputedPropertyName;
    },
    get ConditionalExpression() {
      return ConditionalExpression;
    },
    get ContinueStatement() {
      return ContinueStatement;
    },
    get CoverFormals() {
      return CoverFormals;
    },
    get CoverInitialisedName() {
      return CoverInitialisedName;
    },
    get DebuggerStatement() {
      return DebuggerStatement;
    },
    get DefaultClause() {
      return DefaultClause;
    },
    get DoWhileStatement() {
      return DoWhileStatement;
    },
    get EmptyStatement() {
      return EmptyStatement;
    },
    get ExportDeclaration() {
      return ExportDeclaration;
    },
    get ExportDefault() {
      return ExportDefault;
    },
    get ExportSpecifier() {
      return ExportSpecifier;
    },
    get ExportSpecifierSet() {
      return ExportSpecifierSet;
    },
    get ExportStar() {
      return ExportStar;
    },
    get ExpressionStatement() {
      return ExpressionStatement;
    },
    get Finally() {
      return Finally;
    },
    get ForInStatement() {
      return ForInStatement;
    },
    get ForOfStatement() {
      return ForOfStatement;
    },
    get ForStatement() {
      return ForStatement;
    },
    get FormalParameter() {
      return FormalParameter;
    },
    get FormalParameterList() {
      return FormalParameterList;
    },
    get FunctionBody() {
      return FunctionBody;
    },
    get FunctionDeclaration() {
      return FunctionDeclaration;
    },
    get FunctionExpression() {
      return FunctionExpression;
    },
    get GeneratorComprehension() {
      return GeneratorComprehension;
    },
    get GetAccessor() {
      return GetAccessor;
    },
    get IdentifierExpression() {
      return IdentifierExpression;
    },
    get IfStatement() {
      return IfStatement;
    },
    get ImportedBinding() {
      return ImportedBinding;
    },
    get ImportDeclaration() {
      return ImportDeclaration;
    },
    get ImportSpecifier() {
      return ImportSpecifier;
    },
    get ImportSpecifierSet() {
      return ImportSpecifierSet;
    },
    get LabelledStatement() {
      return LabelledStatement;
    },
    get LiteralExpression() {
      return LiteralExpression;
    },
    get LiteralPropertyName() {
      return LiteralPropertyName;
    },
    get MemberExpression() {
      return MemberExpression;
    },
    get MemberLookupExpression() {
      return MemberLookupExpression;
    },
    get Module() {
      return Module;
    },
    get ModuleDeclaration() {
      return ModuleDeclaration;
    },
    get ModuleSpecifier() {
      return ModuleSpecifier;
    },
    get NamedExport() {
      return NamedExport;
    },
    get NewExpression() {
      return NewExpression;
    },
    get ObjectLiteralExpression() {
      return ObjectLiteralExpression;
    },
    get ObjectPattern() {
      return ObjectPattern;
    },
    get ObjectPatternField() {
      return ObjectPatternField;
    },
    get ParenExpression() {
      return ParenExpression;
    },
    get PostfixExpression() {
      return PostfixExpression;
    },
    get PredefinedType() {
      return PredefinedType;
    },
    get Script() {
      return Script;
    },
    get PropertyMethodAssignment() {
      return PropertyMethodAssignment;
    },
    get PropertyNameAssignment() {
      return PropertyNameAssignment;
    },
    get PropertyNameShorthand() {
      return PropertyNameShorthand;
    },
    get RestParameter() {
      return RestParameter;
    },
    get ReturnStatement() {
      return ReturnStatement;
    },
    get SetAccessor() {
      return SetAccessor;
    },
    get SpreadExpression() {
      return SpreadExpression;
    },
    get SpreadPatternElement() {
      return SpreadPatternElement;
    },
    get SuperExpression() {
      return SuperExpression;
    },
    get SwitchStatement() {
      return SwitchStatement;
    },
    get SyntaxErrorTree() {
      return SyntaxErrorTree;
    },
    get TemplateLiteralExpression() {
      return TemplateLiteralExpression;
    },
    get TemplateLiteralPortion() {
      return TemplateLiteralPortion;
    },
    get TemplateSubstitution() {
      return TemplateSubstitution;
    },
    get ThisExpression() {
      return ThisExpression;
    },
    get ThrowStatement() {
      return ThrowStatement;
    },
    get TryStatement() {
      return TryStatement;
    },
    get TypeName() {
      return TypeName;
    },
    get UnaryExpression() {
      return UnaryExpression;
    },
    get VariableDeclaration() {
      return VariableDeclaration;
    },
    get VariableDeclarationList() {
      return VariableDeclarationList;
    },
    get VariableStatement() {
      return VariableStatement;
    },
    get WhileStatement() {
      return WhileStatement;
    },
    get WithStatement() {
      return WithStatement;
    },
    get YieldExpression() {
      return YieldExpression;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/semantics/FreeVariableChecker", function() {
  "use strict";
  var ARGUMENTS = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").ARGUMENTS;
  var $__39 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      BindingIdentifier = $__39.BindingIdentifier,
      IdentifierExpression = $__39.IdentifierExpression;
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var IDENTIFIER_EXPRESSION = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").IDENTIFIER_EXPRESSION;
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var TYPEOF = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").TYPEOF;
  var global = this;
  var Scope = function(parent) {
    this.parent = parent;
    this.references = Object.create(null);
    this.declarations = Object.create(null);
  };
  Scope = ($traceurRuntime.createClass)(Scope, {}, {});
  function getVariableName(name) {
    if (name instanceof IdentifierExpression) {
      name = name.identifierToken;
    } else if (name instanceof BindingIdentifier) {
      name = name.identifierToken;
    }
    if (name instanceof IdentifierToken) {
      name = name.value;
    }
    return name;
  }
  var FreeVariableChecker = function(reporter) {
    $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "constructor", []);
    this.reporter_ = reporter;
    this.scope_ = null;
    this.disableChecksLevel_ = 0;
  };
  var $FreeVariableChecker = ($traceurRuntime.createClass)(FreeVariableChecker, {
    pushScope_: function() {
      return this.scope_ = new Scope(this.scope_);
    },
    pop_: function(scope) {
      if (this.scope_ != scope) {
        throw new Error('FreeVariableChecker scope mismatch');
      }
      this.validateScope_();
      this.scope_ = scope.parent;
    },
    visitScript: function(tree, global) {
      var scope = this.pushScope_();
      var object = global;
      while (object) {
        Object.getOwnPropertyNames(object).forEach(this.declareVariable_, this);
        object = Object.getPrototypeOf(object);
      }
      this.visitList(tree.scriptItemList);
      this.pop_(scope);
    },
    visitFunction_: function(name, formalParameterList, body) {
      var scope = this.pushScope_();
      this.visitAny(name);
      this.declareVariable_(ARGUMENTS);
      this.visitAny(formalParameterList);
      this.visitAny(body);
      this.pop_(scope);
    },
    visitFunctionDeclaration: function(tree) {
      this.declareVariable_(tree.name);
      this.visitFunction_(null, tree.formalParameterList, tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitFunction_(tree.name, tree.formalParameterList, tree.functionBody);
    },
    visitArrowFunctionExpression: function(tree) {
      this.visitFunction_(null, tree.formalParameters, tree.functionBody);
    },
    visitGetAccessor: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitGetAccessor", [tree]);
      this.pop_(scope);
    },
    visitSetAccessor: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitSetAccessor", [tree]);
      this.pop_(scope);
    },
    visitCatch: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitCatch", [tree]);
      this.pop_(scope);
    },
    visitBindingIdentifier: function(tree) {
      this.declareVariable_(tree);
    },
    visitIdentifierExpression: function(tree) {
      if (this.disableChecksLevel_) return;
      var name = getVariableName(tree);
      var scope = this.scope_;
      if (!(name in scope.references)) {
        scope.references[name] = tree.location;
      }
    },
    visitUnaryExpression: function(tree) {
      if (tree.operator.type === TYPEOF && tree.operand.type === IDENTIFIER_EXPRESSION) {
        this.declareVariable_(tree.operand);
      } else {
        $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitUnaryExpression", [tree]);
      }
    },
    visitWithStatement: function(tree) {
      this.visitAny(tree.expression);
      this.disableChecksLevel_++;
      this.visitAny(tree.body);
      this.disableChecksLevel_--;
    },
    declareVariable_: function(tree) {
      var name = getVariableName(tree);
      if (name) {
        var scope = this.scope_;
        if (!(name in scope.declarations)) {
          scope.declarations[name] = tree.location;
        }
      }
    },
    validateScope_: function() {
      var $__36 = this;
      if (this.disableChecksLevel_) return;
      var scope = this.scope_;
      var errors = [];
      for (var name in scope.references) {
        if (!(name in scope.declarations)) {
          var location = scope.references[name];
          if (!scope.parent) {
            if (!location) {
              throw new Error(("generated variable " + name + " is not defined"));
            }
            errors.push([location.start, '%s is not defined', name]);
          } else if (!(name in scope.parent.references)) {
            scope.parent.references[name] = location;
          }
        }
      }
      if (errors.length) {
        errors.sort((function(x, y) {
          return x[0].offset - y[0].offset;
        }));
        errors.forEach((function(e) {
          var $__40;
          ($__40 = $__36).reportError_.apply($__40, $traceurRuntime.toObject(e));
        }));
      }
    },
    reportError_: function() {
      var $__40;
      for (var args = [],
          $__38 = 0; $__38 < arguments.length; $__38++) args[$__38] = arguments[$__38];
      ($__40 = this.reporter_).reportError.apply($__40, $traceurRuntime.toObject(args));
    }
  }, {checkScript: function(reporter, tree) {
      new FreeVariableChecker(reporter).visitScript(tree, global);
    }}, ParseTreeVisitor);
  return {
    get getVariableName() {
      return getVariableName;
    },
    get FreeVariableChecker() {
      return FreeVariableChecker;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/Keywords", function() {
  "use strict";
  var keywords = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'enum', 'extends', 'null', 'true', 'false', 'await'];
  var strictKeywords = ['implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield'];
  var keywordsByName = Object.create(null);
  var NORMAL_KEYWORD = 1;
  var STRICT_KEYWORD = 2;
  keywords.forEach((function(value) {
    keywordsByName[value] = NORMAL_KEYWORD;
  }));
  strictKeywords.forEach((function(value) {
    keywordsByName[value] = STRICT_KEYWORD;
  }));
  function getKeywordType(value) {
    return keywordsByName[value];
  }
  function isStrictKeyword(value) {
    return getKeywordType(value) === STRICT_KEYWORD;
  }
  return {
    get NORMAL_KEYWORD() {
      return NORMAL_KEYWORD;
    },
    get STRICT_KEYWORD() {
      return STRICT_KEYWORD;
    },
    get getKeywordType() {
      return getKeywordType;
    },
    get isStrictKeyword() {
      return isStrictKeyword;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/outputgeneration/ParseTreeWriter", function() {
  "use strict";
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var $__42 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      AS = $__42.AS,
      FROM = $__42.FROM,
      GET = $__42.GET,
      OF = $__42.OF,
      MODULE = $__42.MODULE,
      SET = $__42.SET;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var getKeywordType = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Keywords").getKeywordType;
  var $__42 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND = $__42.AMPERSAND,
      AMPERSAND_EQUAL = $__42.AMPERSAND_EQUAL,
      AND = $__42.AND,
      ARROW = $__42.ARROW,
      AWAIT = $__42.AWAIT,
      BACK_QUOTE = $__42.BACK_QUOTE,
      BANG = $__42.BANG,
      BAR = $__42.BAR,
      BAR_EQUAL = $__42.BAR_EQUAL,
      BREAK = $__42.BREAK,
      CARET = $__42.CARET,
      CARET_EQUAL = $__42.CARET_EQUAL,
      CASE = $__42.CASE,
      CATCH = $__42.CATCH,
      CLASS = $__42.CLASS,
      CLOSE_ANGLE = $__42.CLOSE_ANGLE,
      CLOSE_CURLY = $__42.CLOSE_CURLY,
      CLOSE_PAREN = $__42.CLOSE_PAREN,
      CLOSE_SQUARE = $__42.CLOSE_SQUARE,
      COLON = $__42.COLON,
      COMMA = $__42.COMMA,
      CONST = $__42.CONST,
      CONTINUE = $__42.CONTINUE,
      DEBUGGER = $__42.DEBUGGER,
      DEFAULT = $__42.DEFAULT,
      DELETE = $__42.DELETE,
      DO = $__42.DO,
      DOT_DOT_DOT = $__42.DOT_DOT_DOT,
      ELSE = $__42.ELSE,
      END_OF_FILE = $__42.END_OF_FILE,
      ENUM = $__42.ENUM,
      EQUAL = $__42.EQUAL,
      EQUAL_EQUAL = $__42.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__42.EQUAL_EQUAL_EQUAL,
      ERROR = $__42.ERROR,
      EXPORT = $__42.EXPORT,
      EXTENDS = $__42.EXTENDS,
      FALSE = $__42.FALSE,
      FINALLY = $__42.FINALLY,
      FOR = $__42.FOR,
      FUNCTION = $__42.FUNCTION,
      GREATER_EQUAL = $__42.GREATER_EQUAL,
      IDENTIFIER = $__42.IDENTIFIER,
      IF = $__42.IF,
      IMPLEMENTS = $__42.IMPLEMENTS,
      IMPORT = $__42.IMPORT,
      IN = $__42.IN,
      INSTANCEOF = $__42.INSTANCEOF,
      INTERFACE = $__42.INTERFACE,
      LEFT_SHIFT = $__42.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__42.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__42.LESS_EQUAL,
      LET = $__42.LET,
      MINUS = $__42.MINUS,
      MINUS_EQUAL = $__42.MINUS_EQUAL,
      MINUS_MINUS = $__42.MINUS_MINUS,
      NEW = $__42.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__42.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__42.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__42.NOT_EQUAL_EQUAL,
      NULL = $__42.NULL,
      NUMBER = $__42.NUMBER,
      OPEN_ANGLE = $__42.OPEN_ANGLE,
      OPEN_CURLY = $__42.OPEN_CURLY,
      OPEN_PAREN = $__42.OPEN_PAREN,
      OPEN_SQUARE = $__42.OPEN_SQUARE,
      OR = $__42.OR,
      PACKAGE = $__42.PACKAGE,
      PERCENT = $__42.PERCENT,
      PERCENT_EQUAL = $__42.PERCENT_EQUAL,
      PERIOD = $__42.PERIOD,
      PLUS = $__42.PLUS,
      PLUS_EQUAL = $__42.PLUS_EQUAL,
      PLUS_PLUS = $__42.PLUS_PLUS,
      PRIVATE = $__42.PRIVATE,
      PROTECTED = $__42.PROTECTED,
      PUBLIC = $__42.PUBLIC,
      QUESTION = $__42.QUESTION,
      REGULAR_EXPRESSION = $__42.REGULAR_EXPRESSION,
      RETURN = $__42.RETURN,
      RIGHT_SHIFT = $__42.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__42.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__42.SEMI_COLON,
      SLASH = $__42.SLASH,
      SLASH_EQUAL = $__42.SLASH_EQUAL,
      STAR = $__42.STAR,
      STAR_EQUAL = $__42.STAR_EQUAL,
      STATIC = $__42.STATIC,
      STRING = $__42.STRING,
      SUPER = $__42.SUPER,
      SWITCH = $__42.SWITCH,
      TEMPLATE_HEAD = $__42.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__42.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__42.TEMPLATE_TAIL,
      THIS = $__42.THIS,
      THROW = $__42.THROW,
      TILDE = $__42.TILDE,
      TRUE = $__42.TRUE,
      TRY = $__42.TRY,
      TYPEOF = $__42.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__42.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__42.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__42.VAR,
      VOID = $__42.VOID,
      WHILE = $__42.WHILE,
      WITH = $__42.WITH,
      YIELD = $__42.YIELD;
  var NEW_LINE = '\n';
  var PRETTY_PRINT = true;
  var ParseTreeWriter = function(highlighted, showLineNumbers) {
    $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "constructor", []);
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.result_ = '';
    this.currentLine_ = '';
    this.currentLineComment_ = null;
    this.indentDepth_ = 0;
    this.lastToken_ = null;
  };
  var $ParseTreeWriter = ($traceurRuntime.createClass)(ParseTreeWriter, {
    visitAny: function(tree) {
      if (!tree) {
        return;
      }
      if (tree === this.highlighted_) {
        this.write_('\x1B[41m');
      }
      if (tree.location !== null && tree.location.start !== null && this.showLineNumbers_) {
        var line = tree.location.start.line + 1;
        var column = tree.location.start.column;
        this.currentLineComment_ = ("Line: " + line + "." + column);
      }
      this.currentLocation = tree.location;
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitAny", [tree]);
      if (tree === this.highlighted_) {
        this.write_('\x1B[0m');
      }
    },
    visitArgumentList: function(tree) {
      this.write_(OPEN_PAREN);
      this.writeList_(tree.args, COMMA, false);
      this.write_(CLOSE_PAREN);
    },
    visitArrayComprehension: function(tree) {
      this.write_(OPEN_SQUARE);
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
      this.write_(CLOSE_SQUARE);
    },
    visitArrayLiteralExpression: function(tree) {
      this.write_(OPEN_SQUARE);
      this.writeList_(tree.elements, COMMA, false);
      this.write_(CLOSE_SQUARE);
    },
    visitArrayPattern: function(tree) {
      this.write_(OPEN_SQUARE);
      this.writeList_(tree.elements, COMMA, false);
      this.write_(CLOSE_SQUARE);
    },
    visitArrowFunctionExpression: function(tree) {
      this.write_(OPEN_PAREN);
      this.visitAny(tree.formalParameters);
      this.write_(CLOSE_PAREN);
      this.write_(ARROW);
      this.visitAny(tree.functionBody);
    },
    visitAwaitStatement: function(tree) {
      this.write_(AWAIT);
      if (tree.identifier !== null) {
        this.write_(tree.identifier);
        this.write_(EQUAL);
      }
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.write_(tree.operator);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      this.visitAny(tree.binding);
      if (tree.initialiser) {
        this.write_(EQUAL);
        this.visitAny(tree.initialiser);
      }
    },
    visitBindingIdentifier: function(tree) {
      this.write_(tree.identifierToken);
    },
    visitBlock: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(CLOSE_CURLY);
    },
    visitBreakStatement: function(tree) {
      this.write_(BREAK);
      if (tree.name !== null) {
        this.write_(tree.name);
      }
      this.write_(SEMI_COLON);
    },
    visitCallExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.write_(CASE);
      this.visitAny(tree.expression);
      this.write_(COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },
    visitCatch: function(tree) {
      this.write_(CATCH);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.binding);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.catchBody);
    },
    visitClassShared_: function(tree) {
      this.write_(CLASS);
      this.visitAny(tree.name);
      if (tree.superClass !== null) {
        this.write_(EXTENDS);
        this.visitAny(tree.superClass);
      }
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.elements);
      this.write_(CLOSE_CURLY);
    },
    visitClassDeclaration: function(tree) {
      this.visitClassShared_(tree);
    },
    visitClassExpression: function(tree) {
      this.visitClassShared_(tree);
    },
    visitCommaExpression: function(tree) {
      this.writeList_(tree.expressions, COMMA, false);
    },
    visitComprehensionFor: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.left);
      this.write_(OF);
      this.visitAny(tree.iterator);
      this.write_(CLOSE_PAREN);
    },
    visitComprehensionIf: function(tree) {
      this.write_(IF);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
    },
    visitComputedPropertyName: function(tree) {
      this.write_(OPEN_SQUARE);
      this.visitAny(tree.expression);
      this.write_(CLOSE_SQUARE);
    },
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.write_(QUESTION);
      this.visitAny(tree.left);
      this.write_(COLON);
      this.visitAny(tree.right);
    },
    visitContinueStatement: function(tree) {
      this.write_(CONTINUE);
      if (tree.name !== null) {
        this.write_(tree.name);
      }
      this.write_(SEMI_COLON);
    },
    visitDebuggerStatement: function(tree) {
      this.write_(DEBUGGER);
      this.write_(SEMI_COLON);
    },
    visitDefaultClause: function(tree) {
      this.write_(DEFAULT);
      this.write_(COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },
    visitDoWhileStatement: function(tree) {
      this.write_(DO);
      this.visitAny(tree.body);
      this.write_(WHILE);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.write_(SEMI_COLON);
    },
    visitEmptyStatement: function(tree) {
      this.write_(SEMI_COLON);
    },
    visitExportDeclaration: function(tree) {
      this.write_(EXPORT);
      this.visitAny(tree.declaration);
    },
    visitExportDefault: function(tree) {
      this.write_(DEFAULT);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNamedExport: function(tree) {
      this.visitAny(tree.specifierSet);
      if (tree.moduleSpecifier) {
        this.write_(FROM);
        this.visitAny(tree.moduleSpecifier);
      }
      this.write_(SEMI_COLON);
    },
    visitExportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs) {
        this.write_(AS);
        this.write_(tree.rhs);
      }
    },
    visitExportSpecifierSet: function(tree) {
      this.write_(OPEN_CURLY);
      this.writeList_(tree.specifiers, COMMA, false);
      this.write_(CLOSE_CURLY);
    },
    visitExportStar: function(tree) {
      this.write_(STAR);
    },
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitFinally: function(tree) {
      this.write_(FINALLY);
      this.visitAny(tree.block);
    },
    visitForOfStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initialiser);
      this.write_(OF);
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitForInStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initialiser);
      this.write_(IN);
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitForStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initialiser);
      this.write_(SEMI_COLON);
      this.visitAny(tree.condition);
      this.write_(SEMI_COLON);
      this.visitAny(tree.increment);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitFormalParameterList: function(tree) {
      var first = true;
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        if (first) {
          first = false;
        } else {
          this.write_(COMMA);
        }
        this.visitAny(parameter);
      }
    },
    visitFormalParameter: function(tree) {
      this.visitAny(tree.parameter);
      this.writeTypeAnnotation_(tree.typeAnnotation);
    },
    visitFunctionBody: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(CLOSE_CURLY);
    },
    visitFunctionDeclaration: function(tree) {
      this.visitFunction_(tree);
    },
    visitFunctionExpression: function(tree) {
      this.visitFunction_(tree);
    },
    visitFunction_: function(tree) {
      this.write_(FUNCTION);
      if (tree.isGenerator) {
        this.write_(STAR);
      }
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(CLOSE_PAREN);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.write_(OPEN_PAREN);
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
    },
    visitGetAccessor: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      this.write_(GET);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.write_(CLOSE_PAREN);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.visitAny(tree.body);
    },
    visitIdentifierExpression: function(tree) {
      this.write_(tree.identifierToken);
    },
    visitIfStatement: function(tree) {
      this.write_(IF);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.ifClause);
      if (tree.elseClause) {
        this.write_(ELSE);
        this.visitAny(tree.elseClause);
      }
    },
    visitImportDeclaration: function(tree) {
      this.write_(IMPORT);
      if (this.importClause) {
        this.visitAny(tree.importClause);
        this.write_(FROM);
      }
      this.visitAny(tree.moduleSpecifier);
      this.write_(SEMI_COLON);
    },
    visitImportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs !== null) {
        this.write_(AS);
        this.write_(tree.rhs);
      }
    },
    visitImportSpecifierSet: function(tree) {
      if (tree.specifiers.type == STAR) {
        this.write_(STAR);
      } else {
        this.write_(OPEN_CURLY);
        this.writelnList_(tree.specifiers, COMMA);
        this.write_(CLOSE_CURLY);
      }
    },
    visitLabelledStatement: function(tree) {
      this.write_(tree.name);
      this.write_(COLON);
      this.visitAny(tree.statement);
    },
    visitLiteralExpression: function(tree) {
      this.write_(tree.literalToken);
    },
    visitLiteralPropertyName: function(tree) {
      this.write_(tree.literalToken);
    },
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(PERIOD);
      this.write_(tree.memberName);
    },
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(OPEN_SQUARE);
      this.visitAny(tree.memberExpression);
      this.write_(CLOSE_SQUARE);
    },
    visitSyntaxErrorTree: function(tree) {
      this.write_('(function() {' + ("throw SyntaxError(" + JSON.stringify(tree.message) + ");") + '})()');
    },
    visitModule: function(tree) {
      this.writelnList_(tree.scriptItemList, null);
    },
    visitModuleSpecifier: function(tree) {
      this.write_(tree.token);
    },
    visitModuleDeclaration: function(tree) {
      this.write_(MODULE);
      this.write_(tree.identifier);
      this.write_(FROM);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNewExpression: function(tree) {
      this.write_(NEW);
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      this.write_(OPEN_CURLY);
      if (tree.propertyNameAndValues.length > 1) this.writeln_();
      this.writelnList_(tree.propertyNameAndValues, COMMA);
      if (tree.propertyNameAndValues.length > 1) this.writeln_();
      this.write_(CLOSE_CURLY);
    },
    visitObjectPattern: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.fields, COMMA);
      this.write_(CLOSE_CURLY);
    },
    visitObjectPatternField: function(tree) {
      this.visitAny(tree.name);
      if (tree.element !== null) {
        this.write_(COLON);
        this.visitAny(tree.element);
      }
    },
    visitParenExpression: function(tree) {
      this.write_(OPEN_PAREN);
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitParenExpression", [tree]);
      this.write_(CLOSE_PAREN);
    },
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(tree.operator);
    },
    visitPredefinedType: function(tree) {
      this.write_(tree.typeToken);
    },
    visitScript: function(tree) {
      this.writelnList_(tree.scriptItemList, null);
    },
    visitPropertyMethodAssignment: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      if (tree.isGenerator) this.write_(STAR);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(CLOSE_PAREN);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.name);
      this.write_(COLON);
      this.visitAny(tree.value);
    },
    visitPropertyNameShorthand: function(tree) {
      this.write_(tree.name);
    },
    visitTemplateLiteralExpression: function(tree) {
      this.visitAny(tree.operand);
      this.writeRaw_(BACK_QUOTE);
      this.visitList(tree.elements);
      this.writeRaw_(BACK_QUOTE);
    },
    visitTemplateLiteralPortion: function(tree) {
      this.writeRaw_(tree.value);
    },
    visitTemplateSubstitution: function(tree) {
      this.writeRaw_('$');
      this.writeRaw_(OPEN_CURLY);
      this.visitAny(tree.expression);
      this.writeRaw_(CLOSE_CURLY);
    },
    visitReturnStatement: function(tree) {
      this.write_(RETURN);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitRestParameter: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.write_(tree.identifier.identifierToken);
    },
    visitSetAccessor: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      this.write_(SET);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameter);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitSpreadExpression: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.visitAny(tree.expression);
    },
    visitSpreadPatternElement: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.visitAny(tree.lvalue);
    },
    visitStateMachine: function(tree) {
      throw new Error('State machines cannot be converted to source');
    },
    visitSuperExpression: function(tree) {
      this.write_(SUPER);
    },
    visitSwitchStatement: function(tree) {
      this.write_(SWITCH);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.caseClauses);
      this.write_(CLOSE_CURLY);
    },
    visitThisExpression: function(tree) {
      this.write_(THIS);
    },
    visitThrowStatement: function(tree) {
      this.write_(THROW);
      this.visitAny(tree.value);
      this.write_(SEMI_COLON);
    },
    visitTryStatement: function(tree) {
      this.write_(TRY);
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },
    visitTypeName: function(tree) {
      if (tree.moduleName) {
        this.visitAny(tree.moduleName);
        this.write_(PERIOD);
      }
      this.write_(tree.name);
    },
    visitUnaryExpression: function(tree) {
      this.write_(tree.operator);
      this.visitAny(tree.operand);
    },
    visitVariableDeclarationList: function(tree) {
      this.write_(tree.declarationType);
      this.writeList_(tree.declarations, COMMA, true, 2);
    },
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      if (tree.initialiser !== null) {
        this.write_(EQUAL);
        this.visitAny(tree.initialiser);
      }
    },
    visitVariableStatement: function(tree) {
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitVariableStatement", [tree]);
      this.write_(SEMI_COLON);
    },
    visitWhileStatement: function(tree) {
      this.write_(WHILE);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitWithStatement: function(tree) {
      this.write_(WITH);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitYieldExpression: function(tree) {
      this.write_(YIELD);
      if (tree.isYieldFor) {
        this.write_(STAR);
      }
      this.visitAny(tree.expression);
    },
    writeCurrentln_: function() {
      this.result_ += this.currentLine_ + NEW_LINE;
    },
    writeln_: function() {
      if (this.currentLineComment_) {
        while (this.currentLine_.length < 80) {
          this.currentLine_ += ' ';
        }
        this.currentLine_ += ' // ' + this.currentLineComment_;
        this.currentLineComment_ = null;
      }
      if (this.currentLine_) this.writeCurrentln_();
      this.currentLine_ = '';
    },
    writelnList_: function(list, delimiter) {
      if (delimiter) {
        this.writeList_(list, delimiter, true);
      } else {
        if (list.length > 0) this.writeln_();
        this.writeList_(list, null, true);
        if (list.length > 0) this.writeln_();
      }
    },
    writeList_: function(list, delimiter, writeNewLine) {
      var indent = arguments[3] !== (void 0) ? arguments[3]: 0;
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter !== null) {
            this.write_(delimiter);
          }
          if (writeNewLine) {
            if (i === 1) this.indentDepth_ += indent;
            this.writeln_();
          }
        }
        this.visitAny(element);
      }
      if (writeNewLine && list.length > 1) this.indentDepth_ -= indent;
    },
    writeRaw_: function(value) {
      if (value !== null) this.currentLine_ += value;
    },
    write_: function(value) {
      if (value === CLOSE_CURLY) {
        this.indentDepth_--;
      }
      if (value !== null) {
        if (PRETTY_PRINT) {
          if (!this.currentLine_) {
            this.lastToken_ = '';
            for (var i = 0,
                indent = this.indentDepth_; i < indent; i++) {
              this.currentLine_ += '  ';
            }
          }
        }
        if (this.needsSpace_(value)) this.currentLine_ += ' ';
        this.lastToken_ = value;
        this.currentLine_ += value;
      }
      if (value === OPEN_CURLY) {
        this.indentDepth_++;
      }
    },
    writeTypeAnnotation_: function(typeAnnotation) {
      if (typeAnnotation !== null) {
        this.write_(COLON);
        this.visitAny(typeAnnotation);
      }
    },
    isIdentifierNameOrNumber_: function(token) {
      if (token instanceof Token) {
        if (token.isKeyword()) return true;
        switch (token.type) {
          case IDENTIFIER:
          case NUMBER:
            return true;
        }
      }
      var value = token.toString();
      switch (value) {
        case AS:
        case FROM:
        case GET:
        case OF:
        case MODULE:
        case SET:
          return true;
      }
      return !!getKeywordType(value);
    },
    needsSpace_: function(token) {
      if (!this.lastToken_) return false;
      if (this.lastToken_.type === REGULAR_EXPRESSION && this.isIdentifierNameOrNumber_(token)) {
        return true;
      }
      var value = token.toString();
      var lastValue = this.lastToken_.toString();
      switch (value) {
        case CLOSE_CURLY:
        case CLOSE_PAREN:
        case CLOSE_SQUARE:
        case COLON:
        case COMMA:
        case PERIOD:
        case SEMI_COLON:
          return false;
        case CATCH:
        case ELSE:
        case FINALLY:
        case WHILE:
          return PRETTY_PRINT;
        case OPEN_CURLY:
          switch (lastValue) {
            case OPEN_CURLY:
            case OPEN_PAREN:
            case OPEN_SQUARE:
              return false;
          }
          return PRETTY_PRINT;
      }
      switch (lastValue) {
        case OPEN_CURLY:
        case OPEN_PAREN:
        case OPEN_SQUARE:
          return false;
        case CATCH:
        case COLON:
        case COMMA:
        case DO:
        case FINALLY:
        case FOR:
        case IF:
        case SEMI_COLON:
        case SWITCH:
        case TRY:
        case WHILE:
        case WITH:
          return PRETTY_PRINT;
        case CASE:
        case CLASS:
        case CONST:
        case DELETE:
        case ELSE:
        case ENUM:
        case EXPORT:
        case EXTENDS:
        case IMPLEMENTS:
        case IMPORT:
        case IN:
        case INSTANCEOF:
        case INTERFACE:
        case LET:
        case NEW:
        case PACKAGE:
        case PRIVATE:
        case PROTECTED:
        case PUBLIC:
        case RETURN:
        case STATIC:
        case THROW:
        case TYPEOF:
        case VAR:
        case VOID:
        case YIELD:
        case FROM:
        case OF:
        case MODULE:
          return PRETTY_PRINT || this.isIdentifierNameOrNumber_(token);
      }
      if ((lastValue == PLUS || lastValue == PLUS_PLUS) && (value == PLUS || value == PLUS_PLUS) || (lastValue == MINUS || lastValue == MINUS_MINUS) && (value == MINUS || value == MINUS_MINUS)) {
        return true;
      }
      if (this.spaceArround_(lastValue) || this.spaceArround_(value)) return true;
      if (this.isIdentifierNameOrNumber_(token)) {
        if (lastValue === CLOSE_PAREN) return PRETTY_PRINT;
        return this.isIdentifierNameOrNumber_(this.lastToken_);
      }
      return false;
    },
    spaceArround_: function(value) {
      switch (value) {
        case AMPERSAND:
        case AMPERSAND_EQUAL:
        case AND:
        case ARROW:
        case AWAIT:
        case BAR:
        case BAR_EQUAL:
        case CARET_EQUAL:
        case CLOSE_ANGLE:
        case EQUAL:
        case EQUAL_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case GREATER_EQUAL:
        case LEFT_SHIFT:
        case LEFT_SHIFT_EQUAL:
        case LESS_EQUAL:
        case MINUS:
        case MINUS_EQUAL:
        case NOT_EQUAL:
        case NOT_EQUAL_EQUAL:
        case OPEN_ANGLE:
        case OR:
        case PERCENT:
        case PERCENT_EQUAL:
        case PLUS:
        case PLUS_EQUAL:
        case QUESTION:
        case RIGHT_SHIFT:
        case RIGHT_SHIFT_EQUAL:
        case SLASH:
        case SLASH_EQUAL:
        case STAR:
        case STAR_EQUAL:
        case UNSIGNED_RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT_EQUAL:
          return PRETTY_PRINT;
      }
      return false;
    }
  }, {}, ParseTreeVisitor);
  return {get ParseTreeWriter() {
      return ParseTreeWriter;
    }};
});
System.registerModule("traceur@0.0.Y/src/outputgeneration/ParseTreeMapWriter", function() {
  "use strict";
  var ParseTreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/ParseTreeWriter").ParseTreeWriter;
  var ParseTreeMapWriter = function(highlighted, showLineNumbers, sourceMapGenerator) {
    $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "constructor", [highlighted, showLineNumbers]);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount_ = 1;
  };
  var $ParseTreeMapWriter = ($traceurRuntime.createClass)(ParseTreeMapWriter, {
    write_: function(value) {
      if (this.currentLocation) {
        this.addMapping();
      }
      $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "write_", [value]);
    },
    writeCurrentln_: function() {
      $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "writeCurrentln_", []);
      this.outputLineCount_++;
    },
    addMapping: function() {
      var start = this.currentLocation.start;
      var mapping = {
        generated: {
          line: this.outputLineCount_,
          column: this.currentLine_.length
        },
        original: {
          line: start.line + 1,
          column: start.column
        },
        source: start.source.name
      };
      this.sourceMapGenerator_.addMapping(mapping);
      this.sourceMapGenerator_.setSourceContent(start.source.name, start.source.contents);
    }
  }, {}, ParseTreeWriter);
  return {get ParseTreeMapWriter() {
      return ParseTreeMapWriter;
    }};
});
System.registerModule("traceur@0.0.Y/src/outputgeneration/TreeWriter", function() {
  "use strict";
  var ParseTreeMapWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/ParseTreeMapWriter").ParseTreeMapWriter;
  var ParseTreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/ParseTreeWriter").ParseTreeWriter;
  function write(tree) {
    var options = arguments[1];
    var showLineNumbers;
    var highlighted = null;
    var sourceMapGenerator;
    if (options) {
      showLineNumbers = options.showLineNumbers;
      highlighted = options.highlighted || null;
      sourceMapGenerator = options.sourceMapGenerator;
    }
    var writer;
    if (sourceMapGenerator) {
      writer = new ParseTreeMapWriter(highlighted, showLineNumbers, sourceMapGenerator);
    } else {
      writer = new ParseTreeWriter(highlighted, showLineNumbers);
    }
    writer.visitAny(tree);
    if (writer.currentLine_.length > 0) {
      writer.writeln_();
    }
    if (sourceMapGenerator) {
      options.sourceMap = sourceMapGenerator.toString();
    }
    return writer.result_.toString();
  }
  var TreeWriter = function() {};
  TreeWriter = ($traceurRuntime.createClass)(TreeWriter, {}, {});
  TreeWriter.write = write;
  return {
    get write() {
      return write;
    },
    get TreeWriter() {
      return TreeWriter;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/util/assert", function() {
  "use strict";
  var options = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").options;
  function assert(b) {
    if (!b && options.debug) throw Error('Assertion failed');
  }
  return {get assert() {
      return assert;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/ParseTreeValidator", function() {
  "use strict";
  var NewExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").NewExpression;
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var TreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/TreeWriter").TreeWriter;
  var $__48 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND = $__48.AMPERSAND,
      AMPERSAND_EQUAL = $__48.AMPERSAND_EQUAL,
      AND = $__48.AND,
      BAR = $__48.BAR,
      BAR_EQUAL = $__48.BAR_EQUAL,
      CARET = $__48.CARET,
      CARET_EQUAL = $__48.CARET_EQUAL,
      CLOSE_ANGLE = $__48.CLOSE_ANGLE,
      EQUAL = $__48.EQUAL,
      EQUAL_EQUAL = $__48.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__48.EQUAL_EQUAL_EQUAL,
      GREATER_EQUAL = $__48.GREATER_EQUAL,
      IDENTIFIER = $__48.IDENTIFIER,
      IN = $__48.IN,
      INSTANCEOF = $__48.INSTANCEOF,
      LEFT_SHIFT = $__48.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__48.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__48.LESS_EQUAL,
      MINUS = $__48.MINUS,
      MINUS_EQUAL = $__48.MINUS_EQUAL,
      NOT_EQUAL = $__48.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__48.NOT_EQUAL_EQUAL,
      NUMBER = $__48.NUMBER,
      OPEN_ANGLE = $__48.OPEN_ANGLE,
      OR = $__48.OR,
      PERCENT = $__48.PERCENT,
      PERCENT_EQUAL = $__48.PERCENT_EQUAL,
      PLUS = $__48.PLUS,
      PLUS_EQUAL = $__48.PLUS_EQUAL,
      RIGHT_SHIFT = $__48.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__48.RIGHT_SHIFT_EQUAL,
      SLASH = $__48.SLASH,
      SLASH_EQUAL = $__48.SLASH_EQUAL,
      STAR = $__48.STAR,
      STAR_EQUAL = $__48.STAR_EQUAL,
      STRING = $__48.STRING,
      UNSIGNED_RIGHT_SHIFT = $__48.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__48.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__48 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARRAY_PATTERN = $__48.ARRAY_PATTERN,
      BINDING_ELEMENT = $__48.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__48.BINDING_IDENTIFIER,
      BLOCK = $__48.BLOCK,
      CASE_CLAUSE = $__48.CASE_CLAUSE,
      CATCH = $__48.CATCH,
      CLASS_DECLARATION = $__48.CLASS_DECLARATION,
      COMPUTED_PROPERTY_NAME = $__48.COMPUTED_PROPERTY_NAME,
      DEFAULT_CLAUSE = $__48.DEFAULT_CLAUSE,
      EXPORT_DECLARATION = $__48.EXPORT_DECLARATION,
      EXPORT_DEFAULT = $__48.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__48.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__48.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__48.EXPORT_STAR,
      FINALLY = $__48.FINALLY,
      FORMAL_PARAMETER = $__48.FORMAL_PARAMETER,
      FORMAL_PARAMETER_LIST = $__48.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__48.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__48.FUNCTION_DECLARATION,
      GET_ACCESSOR = $__48.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__48.IDENTIFIER_EXPRESSION,
      IMPORT_DECLARATION = $__48.IMPORT_DECLARATION,
      LITERAL_PROPERTY_NAME = $__48.LITERAL_PROPERTY_NAME,
      MODULE_DECLARATION = $__48.MODULE_DECLARATION,
      MODULE_DECLARATION = $__48.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__48.MODULE_SPECIFIER,
      NAMED_EXPORT = $__48.NAMED_EXPORT,
      OBJECT_PATTERN = $__48.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__48.OBJECT_PATTERN_FIELD,
      PROPERTY_METHOD_ASSIGNMENT = $__48.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__48.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__48.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__48.REST_PARAMETER,
      SET_ACCESSOR = $__48.SET_ACCESSOR,
      TEMPLATE_LITERAL_PORTION = $__48.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__48.TEMPLATE_SUBSTITUTION,
      VARIABLE_DECLARATION_LIST = $__48.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__48.VARIABLE_STATEMENT;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var ValidationError = function(tree, message) {
    this.tree = tree;
    this.message = message;
  };
  ValidationError = ($traceurRuntime.createClass)(ValidationError, {}, {}, Error);
  var ParseTreeValidator = function() {
    $traceurRuntime.defaultSuperCall(this, $ParseTreeValidator.prototype, arguments);
  };
  var $ParseTreeValidator = ($traceurRuntime.createClass)(ParseTreeValidator, {
    fail_: function(tree, message) {
      throw new ValidationError(tree, message);
    },
    check_: function(condition, tree, message) {
      if (!condition) {
        this.fail_(tree, message);
      }
    },
    checkVisit_: function(condition, tree, message) {
      this.check_(condition, tree, message);
      this.visitAny(tree);
    },
    checkType_: function(type, tree, message) {
      this.checkVisit_(tree.type === type, tree, message);
    },
    visitArgumentList: function(tree) {
      for (var i = 0; i < tree.args.length; i++) {
        var argument = tree.args[i];
        this.checkVisit_(argument.isAssignmentOrSpread(), argument, 'assignment or spread expected');
      }
    },
    visitArrayLiteralExpression: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element === null || element.isAssignmentOrSpread(), element, 'assignment or spread expected');
      }
    },
    visitArrayPattern: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element === null || element.type === BINDING_ELEMENT || element.type == IDENTIFIER_EXPRESSION || element.isLeftHandSideExpression() || element.isPattern() || element.isSpreadPatternElement(), element, 'null, sub pattern, left hand side expression or spread expected');
        if (element && element.isSpreadPatternElement()) {
          this.check_(i === (tree.elements.length - 1), element, 'spread in array patterns must be the last element');
        }
      }
    },
    visitAwaitStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'await must be expression');
    },
    visitBinaryOperator: function(tree) {
      switch (tree.operator.type) {
        case EQUAL:
        case STAR_EQUAL:
        case SLASH_EQUAL:
        case PERCENT_EQUAL:
        case PLUS_EQUAL:
        case MINUS_EQUAL:
        case LEFT_SHIFT_EQUAL:
        case RIGHT_SHIFT_EQUAL:
        case UNSIGNED_RIGHT_SHIFT_EQUAL:
        case AMPERSAND_EQUAL:
        case CARET_EQUAL:
        case BAR_EQUAL:
          this.check_(tree.left.isLeftHandSideExpression() || tree.left.isPattern(), tree.left, 'left hand side expression or pattern expected');
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected');
          break;
        case AND:
        case OR:
        case BAR:
        case CARET:
        case AMPERSAND:
        case EQUAL_EQUAL:
        case NOT_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case NOT_EQUAL_EQUAL:
        case OPEN_ANGLE:
        case CLOSE_ANGLE:
        case GREATER_EQUAL:
        case LESS_EQUAL:
        case INSTANCEOF:
        case IN:
        case LEFT_SHIFT:
        case RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT:
        case PLUS:
        case MINUS:
        case STAR:
        case SLASH:
        case PERCENT:
          this.check_(tree.left.isArrowFunctionExpression(), tree.left, 'assignment expression expected');
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected');
          break;
        default:
          this.fail_(tree, 'unexpected binary operator');
      }
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      var binding = tree.binding;
      this.checkVisit_(binding.type == BINDING_IDENTIFIER || binding.type == OBJECT_PATTERN || binding.type == ARRAY_PATTERN, binding, 'expected valid binding element');
      this.visitAny(tree.initialiser);
    },
    visitBlock: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatementListItem(), statement, 'statement or function declaration expected');
      }
    },
    visitCallExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },
    visitCatch: function(tree) {
      this.checkVisit_(tree.binding.isPattern() || tree.binding.type == BINDING_IDENTIFIER, tree.binding, 'binding identifier expected');
      this.checkVisit_(tree.catchBody.type === BLOCK, tree.catchBody, 'block expected');
    },
    visitClassDeclaration: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case GET_ACCESSOR:
          case SET_ACCESSOR:
          case PROPERTY_METHOD_ASSIGNMENT:
            break;
          default:
            this.fail_(element, 'class element expected');
        }
        this.visitAny(element);
      }
    },
    visitCommaExpression: function(tree) {
      for (var i = 0; i < tree.expressions.length; i++) {
        var expression = tree.expressions[i];
        this.checkVisit_(expression.isArrowFunctionExpression(), expression, 'expression expected');
      }
    },
    visitConditionalExpression: function(tree) {
      this.checkVisit_(tree.condition.isArrowFunctionExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.left.isArrowFunctionExpression(), tree.left, 'expression expected');
      this.checkVisit_(tree.right.isArrowFunctionExpression(), tree.right, 'expression expected');
    },
    visitCoverFormals: function(tree) {
      this.fail_(tree, 'CoverFormals should have been removed');
    },
    visitCoverInitialisedName: function(tree) {
      this.fail_(tree, 'CoverInitialisedName should have been removed');
    },
    visitDefaultClause: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },
    visitDoWhileStatement: function(tree) {
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
    },
    visitExportDeclaration: function(tree) {
      var declType = tree.declaration.type;
      this.checkVisit_(declType == VARIABLE_STATEMENT || declType == FUNCTION_DECLARATION || declType == MODULE_DECLARATION || declType == CLASS_DECLARATION || declType == NAMED_EXPORT || declType == EXPORT_DEFAULT, tree.declaration, 'expected valid export tree');
    },
    visitNamedExport: function(tree) {
      if (tree.moduleSpecifier) {
        this.checkVisit_(tree.moduleSpecifier.type == MODULE_SPECIFIER, tree.moduleSpecifier, 'module expression expected');
      }
      var specifierType = tree.specifierSet.type;
      this.checkVisit_(specifierType == EXPORT_SPECIFIER_SET || specifierType == EXPORT_STAR, tree.specifierSet, 'specifier set or identifier expected');
    },
    visitExportSpecifierSet: function(tree) {
      this.check_(tree.specifiers.length > 0, tree, 'expected at least one identifier');
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        this.checkVisit_(specifier.type == EXPORT_SPECIFIER || specifier.type == IDENTIFIER_EXPRESSION, specifier, 'expected valid export specifier');
      }
    },
    visitExpressionStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
    },
    visitFinally: function(tree) {
      this.checkVisit_(tree.block.type === BLOCK, tree.block, 'block expected');
    },
    visitForOfStatement: function(tree) {
      this.checkVisit_(tree.initialiser.isPattern() || tree.initialiser.type === IDENTIFIER_EXPRESSION || tree.initialiser.type === VARIABLE_DECLARATION_LIST && tree.initialiser.declarations.length === 1, tree.initialiser, 'for-each statement may not have more than one variable declaration');
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitForInStatement: function(tree) {
      if (tree.initialiser.type === VARIABLE_DECLARATION_LIST) {
        this.checkVisit_(tree.initialiser.declarations.length <= 1, tree.initialiser, 'for-in statement may not have more than one variable declaration');
      } else {
        this.checkVisit_(tree.initialiser.isPattern() || tree.initialiser.isExpression(), tree.initialiser, 'variable declaration, expression or ' + 'pattern expected');
      }
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitFormalParameterList: function(tree) {
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        assert(parameter.type === FORMAL_PARAMETER);
        parameter = parameter.parameter;
        switch (parameter.type) {
          case BINDING_ELEMENT:
            break;
          case REST_PARAMETER:
            this.checkVisit_(i === tree.parameters.length - 1, parameter, 'rest parameters must be the last parameter in a parameter list');
            this.checkType_(BINDING_IDENTIFIER, parameter.identifier, 'binding identifier expected');
            break;
          default:
            this.fail_(parameter, 'parameters must be identifiers or rest' + (" parameters. Found: " + parameter.type));
            break;
        }
        this.visitAny(parameter);
      }
    },
    visitForStatement: function(tree) {
      if (tree.initialiser !== null) {
        this.checkVisit_(tree.initialiser.isExpression() || tree.initialiser.type === VARIABLE_DECLARATION_LIST, tree.initialiser, 'variable declaration list or expression expected');
      }
      if (tree.condition !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      }
      if (tree.increment !== null) {
        this.checkVisit_(tree.increment.isExpression(), tree.increment, 'expression expected');
      }
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitFunctionBody: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatementListItem(), statement, 'statement expected');
      }
    },
    visitFunctionDeclaration: function(tree) {
      this.checkType_(BINDING_IDENTIFIER, tree.name, 'binding identifier expected');
      this.visitFunction_(tree);
    },
    visitFunctionExpression: function(tree) {
      if (tree.name !== null) {
        this.checkType_(BINDING_IDENTIFIER, tree.name, 'binding identifier expected');
      }
      this.visitFunction_(tree);
    },
    visitFunction_: function(tree) {
      this.checkType_(FORMAL_PARAMETER_LIST, tree.formalParameterList, 'formal parameters expected');
      this.checkType_(FUNCTION_BODY, tree.functionBody, 'function body expected');
    },
    visitGetAccessor: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkType_(FUNCTION_BODY, tree.body, 'function body expected');
    },
    visitIfStatement: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.ifClause.isStatement(), tree.ifClause, 'statement expected');
      if (tree.elseClause !== null) {
        this.checkVisit_(tree.elseClause.isStatement(), tree.elseClause, 'statement expected');
      }
    },
    visitLabelledStatement: function(tree) {
      this.checkVisit_(tree.statement.isStatement(), tree.statement, 'statement expected');
    },
    visitMemberExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
    },
    visitMemberLookupExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
    },
    visitSyntaxErrorTree: function(tree) {
      this.fail_(tree, ("parse tree contains SyntaxError: " + tree.message));
    },
    visitModuleSpecifier: function(tree) {
      this.check_(tree.token.type == STRING || tree.moduleName, 'string or identifier expected');
    },
    visitModuleDeclaration: function(tree) {
      this.checkType_(MODULE_SPECIFIER, tree.expression, 'module expression expected');
    },
    visitNewExpression: function(tree) {
      this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      for (var i = 0; i < tree.propertyNameAndValues.length; i++) {
        var propertyNameAndValue = tree.propertyNameAndValues[i];
        switch (propertyNameAndValue.type) {
          case GET_ACCESSOR:
          case SET_ACCESSOR:
          case PROPERTY_METHOD_ASSIGNMENT:
            this.check_(!propertyNameAndValue.isStatic, propertyNameAndValue, 'static is not allowed in object literal expression');
          case PROPERTY_NAME_ASSIGNMENT:
          case PROPERTY_NAME_SHORTHAND:
            break;
          default:
            this.fail_(propertyNameAndValue, 'accessor, property name ' + 'assignment or property method assigment expected');
        }
        this.visitAny(propertyNameAndValue);
      }
    },
    visitObjectPattern: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        this.checkVisit_(field.type === OBJECT_PATTERN_FIELD || field.type === BINDING_ELEMENT || field.type === IDENTIFIER_EXPRESSION, field, 'object pattern field expected');
      }
    },
    visitObjectPatternField: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkVisit_(tree.element.type === BINDING_ELEMENT || tree.element.isPattern() || tree.element.isLeftHandSideExpression(), tree.element, 'binding element expected');
    },
    visitParenExpression: function(tree) {
      if (tree.expression.isPattern()) {
        this.visitAny(tree.expression);
      } else {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    },
    visitPostfixExpression: function(tree) {
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected');
    },
    visitPredefinedType: function(tree) {},
    visitScript: function(tree) {
      for (var i = 0; i < tree.scriptItemList.length; i++) {
        var scriptItemList = tree.scriptItemList[i];
        this.checkVisit_(scriptItemList.isScriptElement(), scriptItemList, 'global script item expected');
      }
    },
    checkPropertyName_: function(tree) {
      this.checkVisit_(tree.type === LITERAL_PROPERTY_NAME || tree.type === COMPUTED_PROPERTY_NAME, tree, 'property name expected');
    },
    visitPropertyNameAssignment: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkVisit_(tree.value.isArrowFunctionExpression(), tree.value, 'assignment expression expected');
    },
    visitPropertyNameShorthand: function(tree) {
      this.check_(tree.name.type === IDENTIFIER, tree, 'identifier token expected');
    },
    visitLiteralPropertyName: function(tree) {
      var type = tree.literalToken.type;
      this.check_(tree.literalToken.isKeyword() || type === IDENTIFIER || type === NUMBER || type === STRING, tree, 'Unexpected token in literal property name');
    },
    visitTemplateLiteralExpression: function(tree) {
      if (tree.operand) {
        this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member or call expression expected');
      }
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        if (i % 2) {
          this.checkType_(TEMPLATE_SUBSTITUTION, element, 'Template literal substitution expected');
        } else {
          this.checkType_(TEMPLATE_LITERAL_PORTION, element, 'Template literal portion expected');
        }
      }
    },
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    },
    visitSetAccessor: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkType_(FUNCTION_BODY, tree.body, 'function body expected');
    },
    visitSpreadExpression: function(tree) {
      this.checkVisit_(tree.expression.isArrowFunctionExpression(), tree.expression, 'assignment expression expected');
    },
    visitStateMachine: function(tree) {
      this.fail_(tree, 'State machines are never valid outside of the ' + 'GeneratorTransformer pass.');
    },
    visitSwitchStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      var defaultCount = 0;
      for (var i = 0; i < tree.caseClauses.length; i++) {
        var caseClause = tree.caseClauses[i];
        if (caseClause.type === DEFAULT_CLAUSE) {
          ++defaultCount;
          this.checkVisit_(defaultCount <= 1, caseClause, 'no more than one default clause allowed');
        } else {
          this.checkType_(CASE_CLAUSE, caseClause, 'case or default clause expected');
        }
      }
    },
    visitThrowStatement: function(tree) {
      if (tree.value === null) {
        return;
      }
      this.checkVisit_(tree.value.isExpression(), tree.value, 'expression expected');
    },
    visitTryStatement: function(tree) {
      this.checkType_(BLOCK, tree.body, 'block expected');
      if (tree.catchBlock !== null) {
        this.checkType_(CATCH, tree.catchBlock, 'catch block expected');
      }
      if (tree.finallyBlock !== null) {
        this.checkType_(FINALLY, tree.finallyBlock, 'finally block expected');
      }
      if (tree.catchBlock === null && tree.finallyBlock === null) {
        this.fail_(tree, 'either catch or finally must be present');
      }
    },
    visitTypeName: function(tree) {},
    visitUnaryExpression: function(tree) {
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected');
    },
    visitVariableDeclaration: function(tree) {
      this.checkVisit_(tree.lvalue.isPattern() || tree.lvalue.type == BINDING_IDENTIFIER, tree.lvalue, 'binding identifier expected, found: ' + tree.lvalue.type);
      if (tree.initialiser !== null) {
        this.checkVisit_(tree.initialiser.isArrowFunctionExpression(), tree.initialiser, 'assignment expression expected');
      }
    },
    visitWhileStatement: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitWithStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitYieldExpression: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    }
  }, {}, ParseTreeVisitor);
  ParseTreeValidator.validate = function(tree) {
    var validator = new ParseTreeValidator();
    try {
      validator.visitAny(tree);
    } catch (e) {
      if (!(e instanceof ValidationError)) {
        throw e;
      }
      var location = null;
      if (e.tree !== null) {
        location = e.tree.location;
      }
      if (location === null) {
        location = tree.location;
      }
      var locationString = location !== null ? location.start.toString(): '(unknown)';
      throw new Error(("Parse tree validation failure '" + e.message + "' at " + locationString + ":") + '\n\n' + TreeWriter.write(tree, {
        highlighted: e.tree,
        showLineNumbers: true
      }) + '\n');
    }
  };
  return {get ParseTreeValidator() {
      return ParseTreeValidator;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/ObjectMap", function() {
  "use strict";
  var ObjectMap = function() {
    this.keys_ = Object.create(null);
    this.values_ = Object.create(null);
  };
  ObjectMap = ($traceurRuntime.createClass)(ObjectMap, {
    set: function(key, value) {
      var uid = key.uid;
      this.keys_[uid] = key;
      this.values_[uid] = value;
    },
    get: function(key) {
      return this.values_[key.uid];
    },
    has: function(key) {
      return key.uid in this.keys_;
    },
    addAll: function(other) {
      for (var uid in other.keys_) {
        this.keys_[uid] = other.keys_[uid];
        this.values_[uid] = other.values_[uid];
      }
    },
    keys: function() {
      var $__49 = this;
      return Object.keys(this.keys_).map((function(uid) {
        return $__49.keys_[uid];
      }));
    },
    values: function() {
      var $__49 = this;
      return Object.keys(this.values_).map((function(uid) {
        return $__49.values_[uid];
      }));
    },
    remove: function(key) {
      var uid = key.uid;
      delete this.keys_[uid];
      delete this.values_[uid];
    }
  }, {});
  return {get ObjectMap() {
      return ObjectMap;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/LiteralToken", function() {
  "use strict";
  var $__52;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var $__55 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      NULL = $__55.NULL,
      NUMBER = $__55.NUMBER,
      STRING = $__55.STRING;
  var StringParser = function(value) {
    this.value = value;
    this.index = 0;
  };
  StringParser = ($traceurRuntime.createClass)(StringParser, ($__52 = {}, Object.defineProperty($__52, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__52, "next", {
    value: function() {
      if (++this.index >= this.value.length - 1) return {
        value: undefined,
        done: true
      };
      return {
        value: this.value[this.index],
        done: false
      };
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__52, "parse", {
    value: function() {
      if (this.value.indexOf('\\') === - 1) return this.value.slice(1, - 1);
      var result = '';
      for (var $__53 = this[Symbol.iterator](),
          $__54; !($__54 = $__53.next()).done;) {
        var ch = $__54.value;
        {
          result += ch === '\\' ? this.parseEscapeSequence(): ch;
        }
      }
      return result;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__52, "parseEscapeSequence", {
    value: function() {
      var ch = this.next();
      switch (ch) {
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          return '';
        case '0':
          return '\0';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 't':
          return '\t';
        case 'v':
          return '\v';
        case 'x':
          return String.fromCharCode(parseInt(this.next() + this.next(), 16));
        case 'u':
          return String.fromCharCode(parseInt(this.next() + this.next() + this.next() + this.next(), 16));
        default:
          if (Number(ch) < 8) throw new Error('Octal literals are not supported');
          return ch;
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__52), {});
  var LiteralToken = function(type, value, location) {
    this.type = type;
    this.location = location;
    this.value = value;
  };
  LiteralToken = ($traceurRuntime.createClass)(LiteralToken, {
    toString: function() {
      return this.value;
    },
    get processedValue() {
      switch (this.type) {
        case NULL:
          return null;
        case NUMBER:
          var value = this.value;
          if (value.charCodeAt(0) === 48) {
            switch (value.charCodeAt(1)) {
              case 66:
              case 98:
                return parseInt(this.value.slice(2), 2);
              case 79:
              case 111:
                return parseInt(this.value.slice(2), 8);
            }
          }
          return Number(this.value);
        case STRING:
          var parser = new StringParser(this.value);
          return parser.parse();
        default:
          throw new Error('Not implemented');
      }
    }
  }, {}, Token);
  return {get LiteralToken() {
      return LiteralToken;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ParseTreeFactory", function() {
  "use strict";
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var $__58 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTree"),
      ParseTree = $__58.ParseTree,
      ParseTreeType = $__58.ParseTreeType;
  var $__58 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      BIND = $__58.BIND,
      CALL = $__58.CALL,
      CREATE = $__58.CREATE,
      DEFINE_PROPERTY = $__58.DEFINE_PROPERTY,
      FREEZE = $__58.FREEZE,
      OBJECT = $__58.OBJECT,
      PREVENT_EXTENSIONS = $__58.PREVENT_EXTENSIONS,
      STATE = $__58.STATE,
      UNDEFINED = $__58.UNDEFINED,
      getParameterName = $__58.getParameterName;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var $__58 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      EQUAL = $__58.EQUAL,
      FALSE = $__58.FALSE,
      NULL = $__58.NULL,
      NUMBER = $__58.NUMBER,
      STRING = $__58.STRING,
      TRUE = $__58.TRUE,
      VOID = $__58.VOID;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var $__58 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      ArgumentList = $__58.ArgumentList,
      ArrayComprehension = $__58.ArrayComprehension,
      ArrayLiteralExpression = $__58.ArrayLiteralExpression,
      ArrayPattern = $__58.ArrayPattern,
      ArrowFunctionExpression = $__58.ArrowFunctionExpression,
      AwaitStatement = $__58.AwaitStatement,
      BinaryOperator = $__58.BinaryOperator,
      BindingElement = $__58.BindingElement,
      BindingIdentifier = $__58.BindingIdentifier,
      Block = $__58.Block,
      BreakStatement = $__58.BreakStatement,
      CallExpression = $__58.CallExpression,
      CaseClause = $__58.CaseClause,
      Catch = $__58.Catch,
      ClassDeclaration = $__58.ClassDeclaration,
      ClassExpression = $__58.ClassExpression,
      CommaExpression = $__58.CommaExpression,
      ComprehensionFor = $__58.ComprehensionFor,
      ComprehensionIf = $__58.ComprehensionIf,
      ComputedPropertyName = $__58.ComputedPropertyName,
      ConditionalExpression = $__58.ConditionalExpression,
      ContinueStatement = $__58.ContinueStatement,
      CoverFormals = $__58.CoverFormals,
      CoverInitialisedName = $__58.CoverInitialisedName,
      DebuggerStatement = $__58.DebuggerStatement,
      DefaultClause = $__58.DefaultClause,
      DoWhileStatement = $__58.DoWhileStatement,
      EmptyStatement = $__58.EmptyStatement,
      ExportDeclaration = $__58.ExportDeclaration,
      ExportSpecifier = $__58.ExportSpecifier,
      ExportSpecifierSet = $__58.ExportSpecifierSet,
      ExportStar = $__58.ExportStar,
      ExpressionStatement = $__58.ExpressionStatement,
      Finally = $__58.Finally,
      ForInStatement = $__58.ForInStatement,
      ForOfStatement = $__58.ForOfStatement,
      ForStatement = $__58.ForStatement,
      FormalParameter = $__58.FormalParameter,
      FormalParameterList = $__58.FormalParameterList,
      FunctionBody = $__58.FunctionBody,
      FunctionDeclaration = $__58.FunctionDeclaration,
      FunctionExpression = $__58.FunctionExpression,
      GeneratorComprehension = $__58.GeneratorComprehension,
      GetAccessor = $__58.GetAccessor,
      IdentifierExpression = $__58.IdentifierExpression,
      IfStatement = $__58.IfStatement,
      ImportDeclaration = $__58.ImportDeclaration,
      ImportSpecifier = $__58.ImportSpecifier,
      ImportSpecifierSet = $__58.ImportSpecifierSet,
      LabelledStatement = $__58.LabelledStatement,
      LiteralExpression = $__58.LiteralExpression,
      LiteralPropertyName = $__58.LiteralPropertyName,
      MemberExpression = $__58.MemberExpression,
      MemberLookupExpression = $__58.MemberLookupExpression,
      Module = $__58.Module,
      ModuleDeclaration = $__58.ModuleDeclaration,
      ModuleSpecifier = $__58.ModuleSpecifier,
      NamedExport = $__58.NamedExport,
      NewExpression = $__58.NewExpression,
      ObjectLiteralExpression = $__58.ObjectLiteralExpression,
      ObjectPattern = $__58.ObjectPattern,
      ObjectPatternField = $__58.ObjectPatternField,
      ParenExpression = $__58.ParenExpression,
      PostfixExpression = $__58.PostfixExpression,
      PredefinedType = $__58.PredefinedType,
      Script = $__58.Script,
      PropertyMethodAssignment = $__58.PropertyMethodAssignment,
      PropertyNameAssignment = $__58.PropertyNameAssignment,
      PropertyNameShorthand = $__58.PropertyNameShorthand,
      RestParameter = $__58.RestParameter,
      ReturnStatement = $__58.ReturnStatement,
      SetAccessor = $__58.SetAccessor,
      SpreadExpression = $__58.SpreadExpression,
      SpreadPatternElement = $__58.SpreadPatternElement,
      SuperExpression = $__58.SuperExpression,
      SwitchStatement = $__58.SwitchStatement,
      SyntaxErrorTree = $__58.SyntaxErrorTree,
      TemplateLiteralExpression = $__58.TemplateLiteralExpression,
      TemplateLiteralPortion = $__58.TemplateLiteralPortion,
      TemplateSubstitution = $__58.TemplateSubstitution,
      ThisExpression = $__58.ThisExpression,
      ThrowStatement = $__58.ThrowStatement,
      TryStatement = $__58.TryStatement,
      TypeName = $__58.TypeName,
      UnaryExpression = $__58.UnaryExpression,
      VariableDeclaration = $__58.VariableDeclaration,
      VariableDeclarationList = $__58.VariableDeclarationList,
      VariableStatement = $__58.VariableStatement,
      WhileStatement = $__58.WhileStatement,
      WithStatement = $__58.WithStatement,
      YieldExpression = $__58.YieldExpression;
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  function createOperatorToken(operator) {
    return new Token(operator, null);
  }
  function createIdentifierToken(identifier) {
    return new IdentifierToken(null, identifier);
  }
  function createPropertyNameToken(name) {
    return createIdentifierToken(name);
  }
  function createStringLiteralToken(value) {
    return new LiteralToken(STRING, JSON.stringify(value), null);
  }
  function createBooleanLiteralToken(value) {
    return new Token(value ? TRUE: FALSE, null);
  }
  function createNullLiteralToken() {
    return new LiteralToken(NULL, 'null', null);
  }
  function createNumberLiteralToken(value) {
    return new LiteralToken(NUMBER, String(value), null);
  }
  function createEmptyParameters() {
    return [];
  }
  function createStatementList(statementsOrHead) {
    for (var args = [],
        $__56 = 1; $__56 < arguments.length; $__56++) args[$__56 - 1] = arguments[$__56];
    if (statementsOrHead instanceof Array) return $traceurRuntime.spread(statementsOrHead, args);
    return slice(arguments);
  }
  function createBindingElement(arg) {
    var binding = createBindingIdentifier(arg);
    return new BindingElement(null, binding, null);
  }
  function createFormalParameter(arg) {
    return new FormalParameter(null, createBindingElement(arg), null);
  }
  function createParameterList(arg0, var_args) {
    if (typeof arg0 == 'string') {
      var parameterList = map(arguments, createFormalParameter);
      return new FormalParameterList(null, parameterList);
    }
    if (typeof arg0 == 'number') return createParameterListHelper(arg0, false);
    if (arg0 instanceof IdentifierToken) {
      return new FormalParameterList(null, [createFormalParameter(arg0)]);
    }
    var builder = arg0.map(createFormalParameter);
    return new FormalParameterList(null, builder);
  }
  function createParameterListHelper(numberOfParameters, hasRestParams) {
    var builder = [];
    for (var index = 0; index < numberOfParameters; index++) {
      var parameterName = getParameterName(index);
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
      builder.push(isRestParameter ? new FormalParameter(null, createRestParameter(parameterName), null): createFormalParameter(parameterName));
    }
    return new FormalParameterList(null, builder);
  }
  function createParameterListWithRestParams(numberOfParameters) {
    return createParameterListHelper(numberOfParameters, true);
  }
  function createParameterReference(index) {
    return createIdentifierExpression(getParameterName(index));
  }
  function createEmptyParameterList() {
    return new FormalParameterList(null, []);
  }
  function createEmptyList() {
    return [];
  }
  function createArgumentList(numberListOrFirst, var_args) {
    if (typeof numberListOrFirst == 'number') {
      return createArgumentListFromParameterList(createParameterList(numberListOrFirst));
    }
    var list;
    if (numberListOrFirst instanceof Array) list = numberListOrFirst; else list = slice(arguments);
    return new ArgumentList(null, list);
  }
  function createArgumentListFromParameterList(formalParameterList) {
    var builder = formalParameterList.parameters.map(function(parameter) {
      if (parameter.isRestParameter()) {
        return createSpreadExpression(createIdentifierExpression(parameter.identifier));
      } else {
        return parameter;
      }
    });
    return new ArgumentList(null, builder);
  }
  function createEmptyArgumentList() {
    return new ArgumentList(null, createEmptyList());
  }
  function createArrayLiteralExpression(list) {
    return new ArrayLiteralExpression(null, list);
  }
  function createEmptyArrayLiteralExpression() {
    return createArrayLiteralExpression(createEmptyList());
  }
  function createArrayPattern(list) {
    return new ArrayPattern(null, list);
  }
  function createAssignmentExpression(lhs, rhs) {
    return new BinaryOperator(null, lhs, createOperatorToken(EQUAL), rhs);
  }
  function createBinaryOperator(left, operator, right) {
    return new BinaryOperator(null, left, operator, right);
  }
  function createBindingIdentifier(identifier) {
    if (typeof identifier === 'string') identifier = createIdentifierToken(identifier); else if (identifier.type === ParseTreeType.BINDING_IDENTIFIER) return identifier; else if (identifier.type === ParseTreeType.IDENTIFIER_EXPRESSION) return new BindingIdentifier(identifier.location, identifier.identifierToken);
    return new BindingIdentifier(null, identifier);
  }
  function createEmptyStatement() {
    return new EmptyStatement(null);
  }
  function createEmptyBlock() {
    return createBlock(createEmptyList());
  }
  function createBlock(statements) {
    if (statements instanceof ParseTree) statements = slice(arguments);
    return new Block(null, statements);
  }
  function createFunctionBody(statements) {
    return new FunctionBody(null, statements);
  }
  function createScopedExpression(body) {
    assert(body.type === 'FUNCTION_BODY');
    return createCallCall(createParenExpression(createFunctionExpression(createEmptyParameterList(), body)), createThisExpression());
  }
  function createCallExpression(operand) {
    var args = arguments[1] !== (void 0) ? arguments[1]: createEmptyArgumentList();
    return new CallExpression(null, operand, args);
  }
  function createBoundCall(func, thisTree) {
    return createCallExpression(createMemberExpression(func.type == ParseTreeType.FUNCTION_EXPRESSION ? createParenExpression(func): func, BIND), createArgumentList(thisTree));
  }
  function createBreakStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0]: null;
    return new BreakStatement(null, name);
  }
  function createCallCall(func, thisExpression, args, var_args) {
    var $__59;
    if (args instanceof ParseTree) args = slice(arguments, 2);
    var builder = [thisExpression];
    if (args)($__59 = builder).push.apply($__59, $traceurRuntime.toObject(args));
    return createCallExpression(createMemberExpression(func, CALL), createArgumentList(builder));
  }
  function createCallCallStatement(func, thisExpression) {
    for (var args = [],
        $__57 = 2; $__57 < arguments.length; $__57++) args[$__57 - 2] = arguments[$__57];
    return createExpressionStatement(createCallCall(func, thisExpression, args));
  }
  function createCaseClause(expression, statements) {
    return new CaseClause(null, expression, statements);
  }
  function createCatch(identifier, catchBody) {
    identifier = createBindingIdentifier(identifier);
    return new Catch(null, identifier, catchBody);
  }
  function createClassDeclaration(name, superClass, elements) {
    return new ClassDeclaration(null, name, superClass, elements);
  }
  function createCommaExpression(expressions) {
    return new CommaExpression(null, expressions);
  }
  function createConditionalExpression(condition, left, right) {
    return new ConditionalExpression(null, condition, left, right);
  }
  function createContinueStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0]: null;
    return new ContinueStatement(null, name);
  }
  function createDefaultClause(statements) {
    return new DefaultClause(null, statements);
  }
  function createDoWhileStatement(body, condition) {
    return new DoWhileStatement(null, body, condition);
  }
  function createAssignmentStatement(lhs, rhs) {
    return createExpressionStatement(createAssignmentExpression(lhs, rhs));
  }
  function createCallStatement(operand) {
    var args = arguments[1];
    return createExpressionStatement(createCallExpression(operand, args));
  }
  function createExpressionStatement(expression) {
    return new ExpressionStatement(null, expression);
  }
  function createFinally(block) {
    return new Finally(null, block);
  }
  function createForOfStatement(initialiser, collection, body) {
    return new ForOfStatement(null, initialiser, collection, body);
  }
  function createForInStatement(initialiser, collection, body) {
    return new ForInStatement(null, initialiser, collection, body);
  }
  function createForStatement(variables, condition, increment, body) {
    return new ForStatement(null, variables, condition, increment, body);
  }
  function createFunctionExpression(formalParameterList, body) {
    assert(body.type === 'FUNCTION_BODY');
    return new FunctionExpression(null, null, false, formalParameterList, null, body);
  }
  function createGetAccessor(name, body) {
    if (typeof name == 'string') name = createPropertyNameToken(name);
    var isStatic = false;
    return new GetAccessor(null, isStatic, name, null, body);
  }
  function createIdentifierExpression(identifier) {
    if (typeof identifier == 'string') identifier = createIdentifierToken(identifier); else if (identifier instanceof BindingIdentifier) identifier = identifier.identifierToken;
    return new IdentifierExpression(null, identifier);
  }
  function createUndefinedExpression() {
    return createIdentifierExpression(UNDEFINED);
  }
  function createIfStatement(condition, ifClause) {
    var elseClause = arguments[2] !== (void 0) ? arguments[2]: null;
    return new IfStatement(null, condition, ifClause, elseClause);
  }
  function createLabelledStatement(name, statement) {
    return new LabelledStatement(null, name, statement);
  }
  function createStringLiteral(value) {
    return new LiteralExpression(null, createStringLiteralToken(value));
  }
  function createBooleanLiteral(value) {
    return new LiteralExpression(null, createBooleanLiteralToken(value));
  }
  function createTrueLiteral() {
    return createBooleanLiteral(true);
  }
  function createFalseLiteral() {
    return createBooleanLiteral(false);
  }
  function createNullLiteral() {
    return new LiteralExpression(null, createNullLiteralToken());
  }
  function createNumberLiteral(value) {
    return new LiteralExpression(null, createNumberLiteralToken(value));
  }
  function createMemberExpression(operand, memberName, memberNames) {
    if (typeof operand == 'string' || operand instanceof IdentifierToken) operand = createIdentifierExpression(operand);
    if (typeof memberName == 'string') memberName = createIdentifierToken(memberName);
    var tree = new MemberExpression(null, operand, memberName);
    for (var i = 2; i < arguments.length; i++) {
      tree = createMemberExpression(tree, arguments[i]);
    }
    return tree;
  }
  function createMemberLookupExpression(operand, memberExpression) {
    return new MemberLookupExpression(null, operand, memberExpression);
  }
  function createThisExpression() {
    var memberName = arguments[0];
    var result = new ThisExpression(null);
    if (memberName) {
      result = createMemberExpression(result, memberName);
    }
    return result;
  }
  function createNewExpression(operand, args) {
    return new NewExpression(null, operand, args);
  }
  function createObjectFreeze(value) {
    return createCallExpression(createMemberExpression(OBJECT, FREEZE), createArgumentList(value));
  }
  function createObjectPreventExtensions(value) {
    return createCallExpression(createMemberExpression(OBJECT, PREVENT_EXTENSIONS), createArgumentList(value));
  }
  function createObjectCreate(protoExpression, descriptors) {
    var argumentList = [protoExpression];
    if (descriptors) argumentList.push(descriptors);
    return createCallExpression(createMemberExpression(OBJECT, CREATE), createArgumentList(argumentList));
  }
  function createPropertyDescriptor(descr) {
    var propertyNameAndValues = Object.keys(descr).map(function(name) {
      var value = descr[name];
      if (!(value instanceof ParseTree)) value = createBooleanLiteral(!!value);
      return createPropertyNameAssignment(name, value);
    });
    return createObjectLiteralExpression(propertyNameAndValues);
  }
  function createDefineProperty(tree, name, descr) {
    if (typeof name === 'string') name = createStringLiteral(name);
    return createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTY), createArgumentList(tree, name, createPropertyDescriptor(descr)));
  }
  function createObjectLiteralExpression(propertyNameAndValues) {
    if (propertyNameAndValues instanceof ParseTree) propertyNameAndValues = slice(arguments);
    return new ObjectLiteralExpression(null, propertyNameAndValues);
  }
  function createObjectPattern(list) {
    return new ObjectPattern(null, list);
  }
  function createObjectPatternField(identifier, element) {
    identifier = createBindingIdentifier(identifier);
    return new ObjectPatternField(null, identifier, element);
  }
  function createParenExpression(expression) {
    return new ParenExpression(null, expression);
  }
  function createPostfixExpression(operand, operator) {
    return new PostfixExpression(null, operand, operator);
  }
  function createScript(scriptItemList) {
    return new Script(null, scriptItemList);
  }
  function createPropertyNameAssignment(identifier, value) {
    if (typeof identifier == 'string') identifier = createLiteralPropertyName(identifier);
    return new PropertyNameAssignment(null, identifier, value);
  }
  function createLiteralPropertyName(name) {
    return new LiteralPropertyName(null, createIdentifierToken(name));
  }
  function createRestParameter(identifier) {
    return new RestParameter(null, createBindingIdentifier(identifier));
  }
  function createReturnStatement(expression) {
    return new ReturnStatement(null, expression);
  }
  function createYieldStatement(expression, isYieldFor) {
    return createExpressionStatement(new YieldExpression(null, expression, isYieldFor));
  }
  function createSetAccessor(name, parameter, body) {
    if (typeof name == 'string') name = createPropertyNameToken(name);
    if (typeof parameter == 'string') parameter = createIdentifierToken(parameter);
    var isStatic = false;
    return new SetAccessor(null, isStatic, name, parameter, body);
  }
  function createSpreadExpression(expression) {
    return new SpreadExpression(null, expression);
  }
  function createSpreadPatternElement(lvalue) {
    return new SpreadPatternElement(null, lvalue);
  }
  function createSwitchStatement(expression, caseClauses) {
    return new SwitchStatement(null, expression, caseClauses);
  }
  function createThrowStatement(value) {
    return new ThrowStatement(null, value);
  }
  function createTryStatement(body, catchBlock) {
    var finallyBlock = arguments[2] !== (void 0) ? arguments[2]: null;
    return new TryStatement(null, body, catchBlock, finallyBlock);
  }
  function createUnaryExpression(operator, operand) {
    return new UnaryExpression(null, operator, operand);
  }
  function createUseStrictDirective() {
    return createExpressionStatement(createStringLiteral('use strict'));
  }
  function createVariableDeclarationList(binding, identifierOrDeclarations, initialiser) {
    if (identifierOrDeclarations instanceof Array) {
      var declarations = identifierOrDeclarations;
      return new VariableDeclarationList(null, binding, declarations);
    }
    var identifier = identifierOrDeclarations;
    return createVariableDeclarationList(binding, [createVariableDeclaration(identifier, initialiser)]);
  }
  function createVariableDeclaration(identifier, initialiser) {
    if (!(identifier instanceof ParseTree) || identifier.type !== ParseTreeType.BINDING_IDENTIFIER && identifier.type !== ParseTreeType.OBJECT_PATTERN && identifier.type !== ParseTreeType.ARRAY_PATTERN) {
      identifier = createBindingIdentifier(identifier);
    }
    return new VariableDeclaration(null, identifier, null, initialiser);
  }
  function createVariableStatement(listOrBinding, identifier, initialiser) {
    if (listOrBinding instanceof VariableDeclarationList) return new VariableStatement(null, listOrBinding);
    var binding = listOrBinding;
    var list = createVariableDeclarationList(binding, identifier, initialiser);
    return createVariableStatement(list);
  }
  function createVoid0() {
    return createParenExpression(createUnaryExpression(createOperatorToken(VOID), createNumberLiteral(0)));
  }
  function createWhileStatement(condition, body) {
    return new WhileStatement(null, condition, body);
  }
  function createWithStatement(expression, body) {
    return new WithStatement(null, expression, body);
  }
  function createAssignStateStatement(state) {
    return createAssignmentStatement(createIdentifierExpression(STATE), createNumberLiteral(state));
  }
  return {
    get createOperatorToken() {
      return createOperatorToken;
    },
    get createIdentifierToken() {
      return createIdentifierToken;
    },
    get createPropertyNameToken() {
      return createPropertyNameToken;
    },
    get createStringLiteralToken() {
      return createStringLiteralToken;
    },
    get createBooleanLiteralToken() {
      return createBooleanLiteralToken;
    },
    get createNullLiteralToken() {
      return createNullLiteralToken;
    },
    get createNumberLiteralToken() {
      return createNumberLiteralToken;
    },
    get createEmptyParameters() {
      return createEmptyParameters;
    },
    get createStatementList() {
      return createStatementList;
    },
    get createBindingElement() {
      return createBindingElement;
    },
    get createFormalParameter() {
      return createFormalParameter;
    },
    get createParameterList() {
      return createParameterList;
    },
    get createParameterListWithRestParams() {
      return createParameterListWithRestParams;
    },
    get createParameterReference() {
      return createParameterReference;
    },
    get createEmptyParameterList() {
      return createEmptyParameterList;
    },
    get createEmptyList() {
      return createEmptyList;
    },
    get createArgumentList() {
      return createArgumentList;
    },
    get createArgumentListFromParameterList() {
      return createArgumentListFromParameterList;
    },
    get createEmptyArgumentList() {
      return createEmptyArgumentList;
    },
    get createArrayLiteralExpression() {
      return createArrayLiteralExpression;
    },
    get createEmptyArrayLiteralExpression() {
      return createEmptyArrayLiteralExpression;
    },
    get createArrayPattern() {
      return createArrayPattern;
    },
    get createAssignmentExpression() {
      return createAssignmentExpression;
    },
    get createBinaryOperator() {
      return createBinaryOperator;
    },
    get createBindingIdentifier() {
      return createBindingIdentifier;
    },
    get createEmptyStatement() {
      return createEmptyStatement;
    },
    get createEmptyBlock() {
      return createEmptyBlock;
    },
    get createBlock() {
      return createBlock;
    },
    get createFunctionBody() {
      return createFunctionBody;
    },
    get createScopedExpression() {
      return createScopedExpression;
    },
    get createCallExpression() {
      return createCallExpression;
    },
    get createBoundCall() {
      return createBoundCall;
    },
    get createBreakStatement() {
      return createBreakStatement;
    },
    get createCallCall() {
      return createCallCall;
    },
    get createCallCallStatement() {
      return createCallCallStatement;
    },
    get createCaseClause() {
      return createCaseClause;
    },
    get createCatch() {
      return createCatch;
    },
    get createClassDeclaration() {
      return createClassDeclaration;
    },
    get createCommaExpression() {
      return createCommaExpression;
    },
    get createConditionalExpression() {
      return createConditionalExpression;
    },
    get createContinueStatement() {
      return createContinueStatement;
    },
    get createDefaultClause() {
      return createDefaultClause;
    },
    get createDoWhileStatement() {
      return createDoWhileStatement;
    },
    get createAssignmentStatement() {
      return createAssignmentStatement;
    },
    get createCallStatement() {
      return createCallStatement;
    },
    get createExpressionStatement() {
      return createExpressionStatement;
    },
    get createFinally() {
      return createFinally;
    },
    get createForOfStatement() {
      return createForOfStatement;
    },
    get createForInStatement() {
      return createForInStatement;
    },
    get createForStatement() {
      return createForStatement;
    },
    get createFunctionExpression() {
      return createFunctionExpression;
    },
    get createGetAccessor() {
      return createGetAccessor;
    },
    get createIdentifierExpression() {
      return createIdentifierExpression;
    },
    get createUndefinedExpression() {
      return createUndefinedExpression;
    },
    get createIfStatement() {
      return createIfStatement;
    },
    get createLabelledStatement() {
      return createLabelledStatement;
    },
    get createStringLiteral() {
      return createStringLiteral;
    },
    get createBooleanLiteral() {
      return createBooleanLiteral;
    },
    get createTrueLiteral() {
      return createTrueLiteral;
    },
    get createFalseLiteral() {
      return createFalseLiteral;
    },
    get createNullLiteral() {
      return createNullLiteral;
    },
    get createNumberLiteral() {
      return createNumberLiteral;
    },
    get createMemberExpression() {
      return createMemberExpression;
    },
    get createMemberLookupExpression() {
      return createMemberLookupExpression;
    },
    get createThisExpression() {
      return createThisExpression;
    },
    get createNewExpression() {
      return createNewExpression;
    },
    get createObjectFreeze() {
      return createObjectFreeze;
    },
    get createObjectPreventExtensions() {
      return createObjectPreventExtensions;
    },
    get createObjectCreate() {
      return createObjectCreate;
    },
    get createPropertyDescriptor() {
      return createPropertyDescriptor;
    },
    get createDefineProperty() {
      return createDefineProperty;
    },
    get createObjectLiteralExpression() {
      return createObjectLiteralExpression;
    },
    get createObjectPattern() {
      return createObjectPattern;
    },
    get createObjectPatternField() {
      return createObjectPatternField;
    },
    get createParenExpression() {
      return createParenExpression;
    },
    get createPostfixExpression() {
      return createPostfixExpression;
    },
    get createScript() {
      return createScript;
    },
    get createPropertyNameAssignment() {
      return createPropertyNameAssignment;
    },
    get createLiteralPropertyName() {
      return createLiteralPropertyName;
    },
    get createRestParameter() {
      return createRestParameter;
    },
    get createReturnStatement() {
      return createReturnStatement;
    },
    get createYieldStatement() {
      return createYieldStatement;
    },
    get createSetAccessor() {
      return createSetAccessor;
    },
    get createSpreadExpression() {
      return createSpreadExpression;
    },
    get createSpreadPatternElement() {
      return createSpreadPatternElement;
    },
    get createSwitchStatement() {
      return createSwitchStatement;
    },
    get createThrowStatement() {
      return createThrowStatement;
    },
    get createTryStatement() {
      return createTryStatement;
    },
    get createUnaryExpression() {
      return createUnaryExpression;
    },
    get createUseStrictDirective() {
      return createUseStrictDirective;
    },
    get createVariableDeclarationList() {
      return createVariableDeclarationList;
    },
    get createVariableDeclaration() {
      return createVariableDeclaration;
    },
    get createVariableStatement() {
      return createVariableStatement;
    },
    get createVoid0() {
      return createVoid0;
    },
    get createWhileStatement() {
      return createWhileStatement;
    },
    get createWithStatement() {
      return createWithStatement;
    },
    get createAssignStateStatement() {
      return createAssignStateStatement;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer", function() {
  "use strict";
  var $__61 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      AnonBlock = $__61.AnonBlock,
      ArgumentList = $__61.ArgumentList,
      ArrayComprehension = $__61.ArrayComprehension,
      ArrayLiteralExpression = $__61.ArrayLiteralExpression,
      ArrayPattern = $__61.ArrayPattern,
      ArrowFunctionExpression = $__61.ArrowFunctionExpression,
      AwaitStatement = $__61.AwaitStatement,
      BinaryOperator = $__61.BinaryOperator,
      BindingElement = $__61.BindingElement,
      BindingIdentifier = $__61.BindingIdentifier,
      Block = $__61.Block,
      BreakStatement = $__61.BreakStatement,
      CallExpression = $__61.CallExpression,
      CaseClause = $__61.CaseClause,
      Catch = $__61.Catch,
      ClassDeclaration = $__61.ClassDeclaration,
      ClassExpression = $__61.ClassExpression,
      CommaExpression = $__61.CommaExpression,
      ComprehensionFor = $__61.ComprehensionFor,
      ComprehensionIf = $__61.ComprehensionIf,
      ComputedPropertyName = $__61.ComputedPropertyName,
      ConditionalExpression = $__61.ConditionalExpression,
      ContinueStatement = $__61.ContinueStatement,
      CoverFormals = $__61.CoverFormals,
      CoverInitialisedName = $__61.CoverInitialisedName,
      DebuggerStatement = $__61.DebuggerStatement,
      DefaultClause = $__61.DefaultClause,
      DoWhileStatement = $__61.DoWhileStatement,
      EmptyStatement = $__61.EmptyStatement,
      ExportDeclaration = $__61.ExportDeclaration,
      ExportDefault = $__61.ExportDefault,
      ExportSpecifier = $__61.ExportSpecifier,
      ExportSpecifierSet = $__61.ExportSpecifierSet,
      ExportStar = $__61.ExportStar,
      ExpressionStatement = $__61.ExpressionStatement,
      Finally = $__61.Finally,
      ForInStatement = $__61.ForInStatement,
      ForOfStatement = $__61.ForOfStatement,
      ForStatement = $__61.ForStatement,
      FormalParameter = $__61.FormalParameter,
      FormalParameterList = $__61.FormalParameterList,
      FunctionBody = $__61.FunctionBody,
      FunctionDeclaration = $__61.FunctionDeclaration,
      FunctionExpression = $__61.FunctionExpression,
      GeneratorComprehension = $__61.GeneratorComprehension,
      GetAccessor = $__61.GetAccessor,
      IdentifierExpression = $__61.IdentifierExpression,
      IfStatement = $__61.IfStatement,
      ImportedBinding = $__61.ImportedBinding,
      ImportDeclaration = $__61.ImportDeclaration,
      ImportSpecifier = $__61.ImportSpecifier,
      ImportSpecifierSet = $__61.ImportSpecifierSet,
      LabelledStatement = $__61.LabelledStatement,
      LiteralExpression = $__61.LiteralExpression,
      LiteralPropertyName = $__61.LiteralPropertyName,
      MemberExpression = $__61.MemberExpression,
      MemberLookupExpression = $__61.MemberLookupExpression,
      Module = $__61.Module,
      ModuleDeclaration = $__61.ModuleDeclaration,
      ModuleSpecifier = $__61.ModuleSpecifier,
      NamedExport = $__61.NamedExport,
      NewExpression = $__61.NewExpression,
      ObjectLiteralExpression = $__61.ObjectLiteralExpression,
      ObjectPattern = $__61.ObjectPattern,
      ObjectPatternField = $__61.ObjectPatternField,
      ParenExpression = $__61.ParenExpression,
      PostfixExpression = $__61.PostfixExpression,
      PredefinedType = $__61.PredefinedType,
      Script = $__61.Script,
      PropertyMethodAssignment = $__61.PropertyMethodAssignment,
      PropertyNameAssignment = $__61.PropertyNameAssignment,
      PropertyNameShorthand = $__61.PropertyNameShorthand,
      RestParameter = $__61.RestParameter,
      ReturnStatement = $__61.ReturnStatement,
      SetAccessor = $__61.SetAccessor,
      SpreadExpression = $__61.SpreadExpression,
      SpreadPatternElement = $__61.SpreadPatternElement,
      SuperExpression = $__61.SuperExpression,
      SwitchStatement = $__61.SwitchStatement,
      SyntaxErrorTree = $__61.SyntaxErrorTree,
      TemplateLiteralExpression = $__61.TemplateLiteralExpression,
      TemplateLiteralPortion = $__61.TemplateLiteralPortion,
      TemplateSubstitution = $__61.TemplateSubstitution,
      ThisExpression = $__61.ThisExpression,
      ThrowStatement = $__61.ThrowStatement,
      TryStatement = $__61.TryStatement,
      TypeName = $__61.TypeName,
      UnaryExpression = $__61.UnaryExpression,
      VariableDeclaration = $__61.VariableDeclaration,
      VariableDeclarationList = $__61.VariableDeclarationList,
      VariableStatement = $__61.VariableStatement,
      WhileStatement = $__61.WhileStatement,
      WithStatement = $__61.WithStatement,
      YieldExpression = $__61.YieldExpression;
  var ParseTreeTransformer = function() {};
  ParseTreeTransformer = ($traceurRuntime.createClass)(ParseTreeTransformer, {
    transformAny: function(tree) {
      return tree && tree.transform(this);
    },
    transformList: function(list) {
      var $__62;
      var builder = null;
      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.transformAny(element);
        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          if (transformed instanceof AnonBlock)($__62 = builder).push.apply($__62, $traceurRuntime.toObject(transformed.statements)); else builder.push(transformed);
        }
      }
      return builder || list;
    },
    transformStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
    },
    transformAnonBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new AnonBlock(tree.location, statements);
    },
    transformArgumentList: function(tree) {
      var args = this.transformList(tree.args);
      if (args === tree.args) {
        return tree;
      }
      return new ArgumentList(tree.location, args);
    },
    transformArrayComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new ArrayComprehension(tree.location, comprehensionList, expression);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayLiteralExpression(tree.location, elements);
    },
    transformArrayPattern: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayPattern(tree.location, elements);
    },
    transformArrowFunctionExpression: function(tree) {
      var formalParameters = this.transformAny(tree.formalParameters);
      var functionBody = this.transformAny(tree.functionBody);
      if (formalParameters === tree.formalParameters && functionBody === tree.functionBody) {
        return tree;
      }
      return new ArrowFunctionExpression(tree.location, formalParameters, functionBody);
    },
    transformAwaitStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new AwaitStatement(tree.location, tree.identifier, expression);
    },
    transformBinaryOperator: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left === tree.left && right === tree.right) {
        return tree;
      }
      return new BinaryOperator(tree.location, left, tree.operator, right);
    },
    transformBindingElement: function(tree) {
      var binding = this.transformAny(tree.binding);
      var initialiser = this.transformAny(tree.initialiser);
      if (binding === tree.binding && initialiser === tree.initialiser) {
        return tree;
      }
      return new BindingElement(tree.location, binding, initialiser);
    },
    transformBindingIdentifier: function(tree) {
      return tree;
    },
    transformBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new Block(tree.location, statements);
    },
    transformBreakStatement: function(tree) {
      return tree;
    },
    transformCallExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new CallExpression(tree.location, operand, args);
    },
    transformCaseClause: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression === tree.expression && statements === tree.statements) {
        return tree;
      }
      return new CaseClause(tree.location, expression, statements);
    },
    transformCatch: function(tree) {
      var binding = this.transformAny(tree.binding);
      var catchBody = this.transformAny(tree.catchBody);
      if (binding === tree.binding && catchBody === tree.catchBody) {
        return tree;
      }
      return new Catch(tree.location, binding, catchBody);
    },
    transformClassDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassDeclaration(tree.location, name, superClass, elements);
    },
    transformClassExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassExpression(tree.location, name, superClass, elements);
    },
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CommaExpression(tree.location, expressions);
    },
    transformComprehensionFor: function(tree) {
      var left = this.transformAny(tree.left);
      var iterator = this.transformAny(tree.iterator);
      if (left === tree.left && iterator === tree.iterator) {
        return tree;
      }
      return new ComprehensionFor(tree.location, left, iterator);
    },
    transformComprehensionIf: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComprehensionIf(tree.location, expression);
    },
    transformComputedPropertyName: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComputedPropertyName(tree.location, expression);
    },
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition === tree.condition && left === tree.left && right === tree.right) {
        return tree;
      }
      return new ConditionalExpression(tree.location, condition, left, right);
    },
    transformContinueStatement: function(tree) {
      return tree;
    },
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CoverFormals(tree.location, expressions);
    },
    transformCoverInitialisedName: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      if (initialiser === tree.initialiser) {
        return tree;
      }
      return new CoverInitialisedName(tree.location, tree.name, tree.equalToken, initialiser);
    },
    transformDebuggerStatement: function(tree) {
      return tree;
    },
    transformDefaultClause: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new DefaultClause(tree.location, statements);
    },
    transformDoWhileStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body === tree.body && condition === tree.condition) {
        return tree;
      }
      return new DoWhileStatement(tree.location, body, condition);
    },
    transformEmptyStatement: function(tree) {
      return tree;
    },
    transformExportDeclaration: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      if (declaration === tree.declaration) {
        return tree;
      }
      return new ExportDeclaration(tree.location, declaration);
    },
    transformExportDefault: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExportDefault(tree.location, expression);
    },
    transformExportSpecifier: function(tree) {
      return tree;
    },
    transformExportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ExportSpecifierSet(tree.location, specifiers);
    },
    transformExportStar: function(tree) {
      return tree;
    },
    transformExpressionStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExpressionStatement(tree.location, expression);
    },
    transformFinally: function(tree) {
      var block = this.transformAny(tree.block);
      if (block === tree.block) {
        return tree;
      }
      return new Finally(tree.location, block);
    },
    transformForInStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForInStatement(tree.location, initialiser, collection, body);
    },
    transformForOfStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForOfStatement(tree.location, initialiser, collection, body);
    },
    transformForStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && condition === tree.condition && increment === tree.increment && body === tree.body) {
        return tree;
      }
      return new ForStatement(tree.location, initialiser, condition, increment, body);
    },
    transformFormalParameter: function(tree) {
      var parameter = this.transformAny(tree.parameter);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      if (parameter === tree.parameter && typeAnnotation === tree.typeAnnotation) {
        return tree;
      }
      return new FormalParameter(tree.location, parameter, typeAnnotation);
    },
    transformFormalParameterList: function(tree) {
      var parameters = this.transformList(tree.parameters);
      if (parameters === tree.parameters) {
        return tree;
      }
      return new FormalParameterList(tree.location, parameters);
    },
    transformFunctionBody: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new FunctionBody(tree.location, statements);
    },
    transformFunctionDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, name, tree.isGenerator, formalParameterList, typeAnnotation, functionBody);
    },
    transformFunctionExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionExpression(tree.location, name, tree.isGenerator, formalParameterList, typeAnnotation, functionBody);
    },
    transformGeneratorComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new GeneratorComprehension(tree.location, comprehensionList, expression);
    },
    transformGetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var body = this.transformAny(tree.body);
      if (name === tree.name && typeAnnotation === tree.typeAnnotation && body === tree.body) {
        return tree;
      }
      return new GetAccessor(tree.location, tree.isStatic, name, typeAnnotation, body);
    },
    transformIdentifierExpression: function(tree) {
      return tree;
    },
    transformIfStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition === tree.condition && ifClause === tree.ifClause && elseClause === tree.elseClause) {
        return tree;
      }
      return new IfStatement(tree.location, condition, ifClause, elseClause);
    },
    transformImportedBinding: function(tree) {
      var binding = this.transformAny(tree.binding);
      if (binding === tree.binding) {
        return tree;
      }
      return new ImportedBinding(tree.location, binding);
    },
    transformImportDeclaration: function(tree) {
      var importClause = this.transformAny(tree.importClause);
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      if (importClause === tree.importClause && moduleSpecifier === tree.moduleSpecifier) {
        return tree;
      }
      return new ImportDeclaration(tree.location, importClause, moduleSpecifier);
    },
    transformImportSpecifier: function(tree) {
      return tree;
    },
    transformImportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ImportSpecifierSet(tree.location, specifiers);
    },
    transformLabelledStatement: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement === tree.statement) {
        return tree;
      }
      return new LabelledStatement(tree.location, tree.name, statement);
    },
    transformLiteralExpression: function(tree) {
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      return tree;
    },
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new MemberExpression(tree.location, operand, tree.memberName);
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand === tree.operand && memberExpression === tree.memberExpression) {
        return tree;
      }
      return new MemberLookupExpression(tree.location, operand, memberExpression);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList, tree.moduleName);
    },
    transformModuleDeclaration: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ModuleDeclaration(tree.location, tree.identifier, expression);
    },
    transformModuleSpecifier: function(tree) {
      return tree;
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      var specifierSet = this.transformAny(tree.specifierSet);
      if (moduleSpecifier === tree.moduleSpecifier && specifierSet === tree.specifierSet) {
        return tree;
      }
      return new NamedExport(tree.location, moduleSpecifier, specifierSet);
    },
    transformNewExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new NewExpression(tree.location, operand, args);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues === tree.propertyNameAndValues) {
        return tree;
      }
      return new ObjectLiteralExpression(tree.location, propertyNameAndValues);
    },
    transformObjectPattern: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields === tree.fields) {
        return tree;
      }
      return new ObjectPattern(tree.location, fields);
    },
    transformObjectPatternField: function(tree) {
      var name = this.transformAny(tree.name);
      var element = this.transformAny(tree.element);
      if (name === tree.name && element === tree.element) {
        return tree;
      }
      return new ObjectPatternField(tree.location, name, element);
    },
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ParenExpression(tree.location, expression);
    },
    transformPostfixExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new PostfixExpression(tree.location, operand, tree.operator);
    },
    transformPredefinedType: function(tree) {
      return tree;
    },
    transformScript: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Script(tree.location, scriptItemList, tree.moduleName);
    },
    transformPropertyMethodAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, name, formalParameterList, typeAnnotation, functionBody);
    },
    transformPropertyNameAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var value = this.transformAny(tree.value);
      if (name === tree.name && value === tree.value) {
        return tree;
      }
      return new PropertyNameAssignment(tree.location, name, value);
    },
    transformPropertyNameShorthand: function(tree) {
      return tree;
    },
    transformRestParameter: function(tree) {
      var identifier = this.transformAny(tree.identifier);
      if (identifier === tree.identifier) {
        return tree;
      }
      return new RestParameter(tree.location, identifier);
    },
    transformReturnStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ReturnStatement(tree.location, expression);
    },
    transformSetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformAny(tree.body);
      if (name === tree.name && parameter === tree.parameter && body === tree.body) {
        return tree;
      }
      return new SetAccessor(tree.location, tree.isStatic, name, parameter, body);
    },
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new SpreadExpression(tree.location, expression);
    },
    transformSpreadPatternElement: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      if (lvalue === tree.lvalue) {
        return tree;
      }
      return new SpreadPatternElement(tree.location, lvalue);
    },
    transformSuperExpression: function(tree) {
      return tree;
    },
    transformSwitchStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression === tree.expression && caseClauses === tree.caseClauses) {
        return tree;
      }
      return new SwitchStatement(tree.location, expression, caseClauses);
    },
    transformSyntaxErrorTree: function(tree) {
      return tree;
    },
    transformTemplateLiteralExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var elements = this.transformList(tree.elements);
      if (operand === tree.operand && elements === tree.elements) {
        return tree;
      }
      return new TemplateLiteralExpression(tree.location, operand, elements);
    },
    transformTemplateLiteralPortion: function(tree) {
      return tree;
    },
    transformTemplateSubstitution: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new TemplateSubstitution(tree.location, expression);
    },
    transformThisExpression: function(tree) {
      return tree;
    },
    transformThrowStatement: function(tree) {
      var value = this.transformAny(tree.value);
      if (value === tree.value) {
        return tree;
      }
      return new ThrowStatement(tree.location, value);
    },
    transformTryStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var catchBlock = this.transformAny(tree.catchBlock);
      var finallyBlock = this.transformAny(tree.finallyBlock);
      if (body === tree.body && catchBlock === tree.catchBlock && finallyBlock === tree.finallyBlock) {
        return tree;
      }
      return new TryStatement(tree.location, body, catchBlock, finallyBlock);
    },
    transformTypeName: function(tree) {
      var moduleName = this.transformAny(tree.moduleName);
      if (moduleName === tree.moduleName) {
        return tree;
      }
      return new TypeName(tree.location, moduleName, tree.name);
    },
    transformUnaryExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new UnaryExpression(tree.location, tree.operator, operand);
    },
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var initialiser = this.transformAny(tree.initialiser);
      if (lvalue === tree.lvalue && typeAnnotation === tree.typeAnnotation && initialiser === tree.initialiser) {
        return tree;
      }
      return new VariableDeclaration(tree.location, lvalue, typeAnnotation, initialiser);
    },
    transformVariableDeclarationList: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableDeclarationList(tree.location, tree.declarationType, declarations);
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableStatement(tree.location, declarations);
    },
    transformWhileStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition === tree.condition && body === tree.body) {
        return tree;
      }
      return new WhileStatement(tree.location, condition, body);
    },
    transformWithStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression === tree.expression && body === tree.body) {
        return tree;
      }
      return new WithStatement(tree.location, expression, body);
    },
    transformYieldExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new YieldExpression(tree.location, expression, tree.isYieldFor);
    }
  }, {});
  return {get ParseTreeTransformer() {
      return ParseTreeTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/AssignmentPatternTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__64 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      ArrayPattern = $__64.ArrayPattern,
      BindingElement = $__64.BindingElement,
      BindingIdentifier = $__64.BindingIdentifier,
      IdentifierExpression = $__64.IdentifierExpression,
      ObjectPattern = $__64.ObjectPattern,
      ObjectPatternField = $__64.ObjectPatternField,
      SpreadPatternElement = $__64.SpreadPatternElement;
  var EQUAL = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").EQUAL;
  var AssignmentPatternTransformerError = function() {
    $traceurRuntime.defaultSuperCall(this, $AssignmentPatternTransformerError.prototype, arguments);
  };
  var $AssignmentPatternTransformerError = ($traceurRuntime.createClass)(AssignmentPatternTransformerError, {}, {}, Error);
  var AssignmentPatternTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $AssignmentPatternTransformer.prototype, arguments);
  };
  var $AssignmentPatternTransformer = ($traceurRuntime.createClass)(AssignmentPatternTransformer, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL) throw new AssignmentPatternTransformerError();
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement) bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      return new ArrayPattern(tree.location, elements);
    },
    transformCoverInitialisedName: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.name.location, tree.name), this.transformAny(tree.initialiser));
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      return new ObjectPattern(tree.location, propertyNameAndValues);
    },
    transformPropertyNameAssignment: function(tree) {
      return new ObjectPatternField(tree.location, tree.name, this.transformAny(tree.value));
    },
    transformPropertyNameShorthand: function(tree) {
      return new IdentifierExpression(tree.location, tree.name);
    },
    transformSpreadExpression: function(tree) {
      return new SpreadPatternElement(tree.location, tree.expression);
    },
    transformSyntaxErrorTree: function(tree) {
      throw new AssignmentPatternTransformerError();
    }
  }, {}, ParseTreeTransformer);
  return {
    get AssignmentPatternTransformerError() {
      return AssignmentPatternTransformerError;
    },
    get AssignmentPatternTransformer() {
      return AssignmentPatternTransformer;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/CoverFormalsTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__66 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      ArrayPattern = $__66.ArrayPattern,
      BindingElement = $__66.BindingElement,
      BindingIdentifier = $__66.BindingIdentifier,
      CommaExpression = $__66.CommaExpression,
      FormalParameter = $__66.FormalParameter,
      FormalParameterList = $__66.FormalParameterList,
      ObjectPattern = $__66.ObjectPattern,
      ObjectPatternField = $__66.ObjectPatternField,
      ParenExpression = $__66.ParenExpression,
      RestParameter = $__66.RestParameter,
      SpreadPatternElement = $__66.SpreadPatternElement;
  var EQUAL = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").EQUAL;
  var IDENTIFIER_EXPRESSION = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").IDENTIFIER_EXPRESSION;
  var AssignmentPatternTransformerError = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AssignmentPatternTransformer").AssignmentPatternTransformerError;
  var CoverFormalsTransformerError = function(location, message) {
    this.location = location;
    this.message = message;
  };
  CoverFormalsTransformerError = ($traceurRuntime.createClass)(CoverFormalsTransformerError, {}, {}, Error);
  var ToFormalParametersTransformer = function() {
    this.isValid = true;
    this.inArrayPattern_ = false;
  };
  ToFormalParametersTransformer = ($traceurRuntime.createClass)(ToFormalParametersTransformer, {
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions).map((function(expression) {
        return new FormalParameter(expression.location, expression, null);
      }));
      return new FormalParameterList(tree.location, expressions);
    },
    transformIdentifierExpression: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.identifierToken), null);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL) throw new CoverFormalsTransformerError(tree.operator, ("Unexpected token " + tree.operator));
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement) bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var wasInArrayPattern = this.inArrayPattern_;
      this.inArrayPattern_ = true;
      var elements = this.transformList(tree.elements);
      this.inArrayPattern_ = wasInArrayPattern;
      var okIndex = elements.length - 1;
      for (var i = 0; i < okIndex; i++) {
        if (elements[i]instanceof SpreadPatternElement) throw new CoverFormalsTransformerError(elements[i].location, 'Unexpected token ...');
      }
      return new BindingElement(tree.location, new ArrayPattern(tree.location, elements), null);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      return new BindingElement(tree.location, new ObjectPattern(tree.location, propertyNameAndValues), null);
    },
    transformCoverInitialisedName: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.name), tree.initialiser);
    },
    transformPropertyNameAssignment: function(tree) {
      return new ObjectPatternField(tree.location, tree.name, this.transformAny(tree.value));
    },
    transformPropertyNameShorthand: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.name), null);
    },
    transformSpreadExpression: function(tree) {
      if (tree.expression.type !== IDENTIFIER_EXPRESSION) throw new CoverFormalsTransformerError(tree.expression.location, 'identifier expected');
      var bindingIdentifier = new BindingIdentifier(tree.expression.location, tree.expression.identifierToken);
      if (this.inArrayPattern_) return new SpreadPatternElement(tree.location, bindingIdentifier);
      return new RestParameter(tree.location, bindingIdentifier);
    },
    transformSyntaxErrorTree: function(tree) {
      throw new AssignmentPatternTransformerError();
    }
  }, {}, ParseTreeTransformer);
  function toParenExpression(tree) {
    var expressions = tree.expressions;
    var length = expressions.length;
    if (length === 0) throw new CoverFormalsTransformerError(tree.location, 'Unexpected token )');
    for (var i = 0; i < length; i++) {
      if (expressions[i].isRestParameter()) throw new CoverFormalsTransformerError(expressions[i].location, 'Unexpected token ...');
    }
    var expression;
    if (expressions.length > 1) {
      expression = new CommaExpression(expressions[0].location, expressions);
    } else {
      expression = expressions[0];
    }
    return new ParenExpression(tree.location, expression);
  }
  function toFormalParameters(tree) {
    var transformer = new ToFormalParametersTransformer();
    return transformer.transformAny(tree);
  }
  return {
    get CoverFormalsTransformerError() {
      return CoverFormalsTransformerError;
    },
    get toParenExpression() {
      return toParenExpression;
    },
    get toFormalParameters() {
      return toFormalParameters;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/staticsemantics/StrictParams", function() {
  "use strict";
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var isStrictKeyword = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Keywords").isStrictKeyword;
  var StrictParams = function(errorReporter) {
    $traceurRuntime.superCall(this, $StrictParams.prototype, "constructor", []);
    this.errorReporter = errorReporter;
  };
  var $StrictParams = ($traceurRuntime.createClass)(StrictParams, {visitBindingIdentifier: function(tree) {
      var name = tree.identifierToken.toString();
      if (isStrictKeyword(name)) {
        this.errorReporter.reportError(tree.location.start, (name + " is a reserved identifier"));
      }
    }}, {visit: function(tree, errorReporter) {
      new StrictParams(errorReporter).visitAny(tree);
    }}, ParseTreeVisitor);
  return {get StrictParams() {
      return StrictParams;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/SourceRange", function() {
  "use strict";
  var SourceRange = function(start, end) {
    this.start = start;
    this.end = end;
  };
  SourceRange = ($traceurRuntime.createClass)(SourceRange, {}, {});
  return {get SourceRange() {
      return SourceRange;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/KeywordToken", function() {
  "use strict";
  var STRICT_KEYWORD = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Keywords").STRICT_KEYWORD;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var KeywordToken = function(type, keywordType, location) {
    this.type = type;
    this.location = location;
    this.isStrictKeyword_ = keywordType === STRICT_KEYWORD;
  };
  KeywordToken = ($traceurRuntime.createClass)(KeywordToken, {
    isKeyword: function() {
      return true;
    },
    isStrictKeyword: function() {
      return this.isStrictKeyword_;
    }
  }, {}, Token);
  return {get KeywordToken() {
      return KeywordToken;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/unicode-tables", function() {
  "use strict";
  var idStartTable = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 442, 443, 443, 444, 447, 448, 451, 452, 659, 660, 660, 661, 687, 688, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 883, 884, 884, 886, 887, 890, 890, 891, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1599, 1600, 1600, 1601, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2208, 2208, 2210, 2220, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2417, 2418, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3653, 3654, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3807, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4295, 4295, 4301, 4301, 4304, 4346, 4348, 4348, 4349, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6210, 6211, 6211, 6212, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7098, 7141, 7168, 7203, 7245, 7247, 7258, 7287, 7288, 7293, 7401, 7404, 7406, 7409, 7413, 7414, 7424, 7467, 7468, 7530, 7531, 7543, 7544, 7544, 7545, 7578, 7579, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8472, 8472, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8494, 8494, 8495, 8500, 8501, 8504, 8505, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8578, 8579, 8580, 8581, 8584, 11264, 11310, 11312, 11358, 11360, 11387, 11388, 11389, 11390, 11492, 11499, 11502, 11506, 11507, 11520, 11557, 11559, 11559, 11565, 11565, 11568, 11623, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 12293, 12293, 12294, 12294, 12295, 12295, 12321, 12329, 12337, 12341, 12344, 12346, 12347, 12347, 12348, 12348, 12353, 12438, 12443, 12444, 12445, 12446, 12447, 12447, 12449, 12538, 12540, 12542, 12543, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 19893, 19968, 40908, 40960, 40980, 40981, 40981, 40982, 42124, 42192, 42231, 42232, 42237, 42240, 42507, 42508, 42508, 42512, 42527, 42538, 42539, 42560, 42605, 42606, 42606, 42623, 42623, 42624, 42647, 42656, 42725, 42726, 42735, 42775, 42783, 42786, 42863, 42864, 42864, 42865, 42887, 42888, 42888, 42891, 42894, 42896, 42899, 42912, 42922, 43000, 43001, 43002, 43002, 43003, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43631, 43632, 43632, 43633, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43740, 43741, 43741, 43744, 43754, 43762, 43762, 43763, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 55203, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65391, 65392, 65392, 65393, 65437, 65438, 65439, 65440, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334, 66352, 66368, 66369, 66369, 66370, 66377, 66378, 66378, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66639, 66640, 66717, 67584, 67589, 67592, 67592, 67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669, 67840, 67861, 67872, 67897, 67968, 68023, 68030, 68031, 68096, 68096, 68112, 68115, 68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405, 68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687, 69763, 69807, 69840, 69864, 69891, 69926, 70019, 70066, 70081, 70084, 71296, 71338, 73728, 74606, 74752, 74850, 77824, 78894, 92160, 92728, 93952, 94020, 94032, 94032, 94099, 94111, 110592, 110593, 119808, 119892, 119894, 119964, 119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980, 119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 126464, 126467, 126469, 126495, 126497, 126498, 126500, 126500, 126503, 126503, 126505, 126514, 126516, 126519, 126521, 126521, 126523, 126523, 126530, 126530, 126535, 126535, 126537, 126537, 126539, 126539, 126541, 126543, 126545, 126546, 126548, 126548, 126551, 126551, 126553, 126553, 126555, 126555, 126557, 126557, 126559, 126559, 126561, 126562, 126564, 126564, 126567, 126570, 126572, 126578, 126580, 126583, 126585, 126588, 126590, 126590, 126592, 126601, 126603, 126619, 126625, 126627, 126629, 126633, 126635, 126651, 131072, 173782, 173824, 177972, 177984, 178205, 194560, 195101];
  var idContinueTable = [183, 183, 768, 879, 903, 903, 1155, 1159, 1425, 1469, 1471, 1471, 1473, 1474, 1476, 1477, 1479, 1479, 1552, 1562, 1611, 1631, 1632, 1641, 1648, 1648, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 1776, 1785, 1809, 1809, 1840, 1866, 1958, 1968, 1984, 1993, 2027, 2035, 2070, 2073, 2075, 2083, 2085, 2087, 2089, 2093, 2137, 2139, 2276, 2302, 2304, 2306, 2307, 2307, 2362, 2362, 2363, 2363, 2364, 2364, 2366, 2368, 2369, 2376, 2377, 2380, 2381, 2381, 2382, 2383, 2385, 2391, 2402, 2403, 2406, 2415, 2433, 2433, 2434, 2435, 2492, 2492, 2494, 2496, 2497, 2500, 2503, 2504, 2507, 2508, 2509, 2509, 2519, 2519, 2530, 2531, 2534, 2543, 2561, 2562, 2563, 2563, 2620, 2620, 2622, 2624, 2625, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2662, 2671, 2672, 2673, 2677, 2677, 2689, 2690, 2691, 2691, 2748, 2748, 2750, 2752, 2753, 2757, 2759, 2760, 2761, 2761, 2763, 2764, 2765, 2765, 2786, 2787, 2790, 2799, 2817, 2817, 2818, 2819, 2876, 2876, 2878, 2878, 2879, 2879, 2880, 2880, 2881, 2884, 2887, 2888, 2891, 2892, 2893, 2893, 2902, 2902, 2903, 2903, 2914, 2915, 2918, 2927, 2946, 2946, 3006, 3007, 3008, 3008, 3009, 3010, 3014, 3016, 3018, 3020, 3021, 3021, 3031, 3031, 3046, 3055, 3073, 3075, 3134, 3136, 3137, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3174, 3183, 3202, 3203, 3260, 3260, 3262, 3262, 3263, 3263, 3264, 3268, 3270, 3270, 3271, 3272, 3274, 3275, 3276, 3277, 3285, 3286, 3298, 3299, 3302, 3311, 3330, 3331, 3390, 3392, 3393, 3396, 3398, 3400, 3402, 3404, 3405, 3405, 3415, 3415, 3426, 3427, 3430, 3439, 3458, 3459, 3530, 3530, 3535, 3537, 3538, 3540, 3542, 3542, 3544, 3551, 3570, 3571, 3633, 3633, 3636, 3642, 3655, 3662, 3664, 3673, 3761, 3761, 3764, 3769, 3771, 3772, 3784, 3789, 3792, 3801, 3864, 3865, 3872, 3881, 3893, 3893, 3895, 3895, 3897, 3897, 3902, 3903, 3953, 3966, 3967, 3967, 3968, 3972, 3974, 3975, 3981, 3991, 3993, 4028, 4038, 4038, 4139, 4140, 4141, 4144, 4145, 4145, 4146, 4151, 4152, 4152, 4153, 4154, 4155, 4156, 4157, 4158, 4160, 4169, 4182, 4183, 4184, 4185, 4190, 4192, 4194, 4196, 4199, 4205, 4209, 4212, 4226, 4226, 4227, 4228, 4229, 4230, 4231, 4236, 4237, 4237, 4239, 4239, 4240, 4249, 4250, 4252, 4253, 4253, 4957, 4959, 4969, 4977, 5906, 5908, 5938, 5940, 5970, 5971, 6002, 6003, 6068, 6069, 6070, 6070, 6071, 6077, 6078, 6085, 6086, 6086, 6087, 6088, 6089, 6099, 6109, 6109, 6112, 6121, 6155, 6157, 6160, 6169, 6313, 6313, 6432, 6434, 6435, 6438, 6439, 6440, 6441, 6443, 6448, 6449, 6450, 6450, 6451, 6456, 6457, 6459, 6470, 6479, 6576, 6592, 6600, 6601, 6608, 6617, 6618, 6618, 6679, 6680, 6681, 6683, 6741, 6741, 6742, 6742, 6743, 6743, 6744, 6750, 6752, 6752, 6753, 6753, 6754, 6754, 6755, 6756, 6757, 6764, 6765, 6770, 6771, 6780, 6783, 6783, 6784, 6793, 6800, 6809, 6912, 6915, 6916, 6916, 6964, 6964, 6965, 6965, 6966, 6970, 6971, 6971, 6972, 6972, 6973, 6977, 6978, 6978, 6979, 6980, 6992, 7001, 7019, 7027, 7040, 7041, 7042, 7042, 7073, 7073, 7074, 7077, 7078, 7079, 7080, 7081, 7082, 7082, 7083, 7083, 7084, 7085, 7088, 7097, 7142, 7142, 7143, 7143, 7144, 7145, 7146, 7148, 7149, 7149, 7150, 7150, 7151, 7153, 7154, 7155, 7204, 7211, 7212, 7219, 7220, 7221, 7222, 7223, 7232, 7241, 7248, 7257, 7376, 7378, 7380, 7392, 7393, 7393, 7394, 7400, 7405, 7405, 7410, 7411, 7412, 7412, 7616, 7654, 7676, 7679, 8255, 8256, 8276, 8276, 8400, 8412, 8417, 8417, 8421, 8432, 11503, 11505, 11647, 11647, 11744, 11775, 12330, 12333, 12334, 12335, 12441, 12442, 42528, 42537, 42607, 42607, 42612, 42621, 42655, 42655, 42736, 42737, 43010, 43010, 43014, 43014, 43019, 43019, 43043, 43044, 43045, 43046, 43047, 43047, 43136, 43137, 43188, 43203, 43204, 43204, 43216, 43225, 43232, 43249, 43264, 43273, 43302, 43309, 43335, 43345, 43346, 43347, 43392, 43394, 43395, 43395, 43443, 43443, 43444, 43445, 43446, 43449, 43450, 43451, 43452, 43452, 43453, 43456, 43472, 43481, 43561, 43566, 43567, 43568, 43569, 43570, 43571, 43572, 43573, 43574, 43587, 43587, 43596, 43596, 43597, 43597, 43600, 43609, 43643, 43643, 43696, 43696, 43698, 43700, 43703, 43704, 43710, 43711, 43713, 43713, 43755, 43755, 43756, 43757, 43758, 43759, 43765, 43765, 43766, 43766, 44003, 44004, 44005, 44005, 44006, 44007, 44008, 44008, 44009, 44010, 44012, 44012, 44013, 44013, 44016, 44025, 64286, 64286, 65024, 65039, 65056, 65062, 65075, 65076, 65101, 65103, 65296, 65305, 65343, 65343, 66045, 66045, 66720, 66729, 68097, 68099, 68101, 68102, 68108, 68111, 68152, 68154, 68159, 68159, 69632, 69632, 69633, 69633, 69634, 69634, 69688, 69702, 69734, 69743, 69760, 69761, 69762, 69762, 69808, 69810, 69811, 69814, 69815, 69816, 69817, 69818, 69872, 69881, 69888, 69890, 69927, 69931, 69932, 69932, 69933, 69940, 69942, 69951, 70016, 70017, 70018, 70018, 70067, 70069, 70070, 70078, 70079, 70080, 70096, 70105, 71339, 71339, 71340, 71340, 71341, 71341, 71342, 71343, 71344, 71349, 71350, 71350, 71351, 71351, 71360, 71369, 94033, 94078, 94095, 94098, 119141, 119142, 119143, 119145, 119149, 119154, 119163, 119170, 119173, 119179, 119210, 119213, 119362, 119364, 120782, 120831, 917760, 917999];
  return {
    get idStartTable() {
      return idStartTable;
    },
    get idContinueTable() {
      return idContinueTable;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/Scanner", function() {
  "use strict";
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var KeywordToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/KeywordToken").KeywordToken;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var getKeywordType = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Keywords").getKeywordType;
  var $__73 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/unicode-tables"),
      idContinueTable = $__73.idContinueTable,
      idStartTable = $__73.idStartTable;
  var parseOptions = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").parseOptions;
  var $__73 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND = $__73.AMPERSAND,
      AMPERSAND_EQUAL = $__73.AMPERSAND_EQUAL,
      AND = $__73.AND,
      ARROW = $__73.ARROW,
      AWAIT = $__73.AWAIT,
      BACK_QUOTE = $__73.BACK_QUOTE,
      BANG = $__73.BANG,
      BAR = $__73.BAR,
      BAR_EQUAL = $__73.BAR_EQUAL,
      BREAK = $__73.BREAK,
      CARET = $__73.CARET,
      CARET_EQUAL = $__73.CARET_EQUAL,
      CASE = $__73.CASE,
      CATCH = $__73.CATCH,
      CLASS = $__73.CLASS,
      CLOSE_ANGLE = $__73.CLOSE_ANGLE,
      CLOSE_CURLY = $__73.CLOSE_CURLY,
      CLOSE_PAREN = $__73.CLOSE_PAREN,
      CLOSE_SQUARE = $__73.CLOSE_SQUARE,
      COLON = $__73.COLON,
      COMMA = $__73.COMMA,
      CONST = $__73.CONST,
      CONTINUE = $__73.CONTINUE,
      DEBUGGER = $__73.DEBUGGER,
      DEFAULT = $__73.DEFAULT,
      DELETE = $__73.DELETE,
      DO = $__73.DO,
      DOT_DOT_DOT = $__73.DOT_DOT_DOT,
      ELSE = $__73.ELSE,
      END_OF_FILE = $__73.END_OF_FILE,
      ENUM = $__73.ENUM,
      EQUAL = $__73.EQUAL,
      EQUAL_EQUAL = $__73.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__73.EQUAL_EQUAL_EQUAL,
      ERROR = $__73.ERROR,
      EXPORT = $__73.EXPORT,
      EXTENDS = $__73.EXTENDS,
      FALSE = $__73.FALSE,
      FINALLY = $__73.FINALLY,
      FOR = $__73.FOR,
      FUNCTION = $__73.FUNCTION,
      GREATER_EQUAL = $__73.GREATER_EQUAL,
      IDENTIFIER = $__73.IDENTIFIER,
      IF = $__73.IF,
      IMPLEMENTS = $__73.IMPLEMENTS,
      IMPORT = $__73.IMPORT,
      IN = $__73.IN,
      INSTANCEOF = $__73.INSTANCEOF,
      INTERFACE = $__73.INTERFACE,
      LEFT_SHIFT = $__73.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__73.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__73.LESS_EQUAL,
      LET = $__73.LET,
      MINUS = $__73.MINUS,
      MINUS_EQUAL = $__73.MINUS_EQUAL,
      MINUS_MINUS = $__73.MINUS_MINUS,
      NEW = $__73.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__73.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__73.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__73.NOT_EQUAL_EQUAL,
      NULL = $__73.NULL,
      NUMBER = $__73.NUMBER,
      OPEN_ANGLE = $__73.OPEN_ANGLE,
      OPEN_CURLY = $__73.OPEN_CURLY,
      OPEN_PAREN = $__73.OPEN_PAREN,
      OPEN_SQUARE = $__73.OPEN_SQUARE,
      OR = $__73.OR,
      PACKAGE = $__73.PACKAGE,
      PERCENT = $__73.PERCENT,
      PERCENT_EQUAL = $__73.PERCENT_EQUAL,
      PERIOD = $__73.PERIOD,
      PLUS = $__73.PLUS,
      PLUS_EQUAL = $__73.PLUS_EQUAL,
      PLUS_PLUS = $__73.PLUS_PLUS,
      PRIVATE = $__73.PRIVATE,
      PROTECTED = $__73.PROTECTED,
      PUBLIC = $__73.PUBLIC,
      QUESTION = $__73.QUESTION,
      REGULAR_EXPRESSION = $__73.REGULAR_EXPRESSION,
      RETURN = $__73.RETURN,
      RIGHT_SHIFT = $__73.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__73.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__73.SEMI_COLON,
      SLASH = $__73.SLASH,
      SLASH_EQUAL = $__73.SLASH_EQUAL,
      STAR = $__73.STAR,
      STAR_EQUAL = $__73.STAR_EQUAL,
      STATIC = $__73.STATIC,
      STRING = $__73.STRING,
      SUPER = $__73.SUPER,
      SWITCH = $__73.SWITCH,
      TEMPLATE_HEAD = $__73.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__73.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__73.TEMPLATE_TAIL,
      THIS = $__73.THIS,
      THROW = $__73.THROW,
      TILDE = $__73.TILDE,
      TRUE = $__73.TRUE,
      TRY = $__73.TRY,
      TYPEOF = $__73.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__73.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__73.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__73.VAR,
      VOID = $__73.VOID,
      WHILE = $__73.WHILE,
      WITH = $__73.WITH,
      YIELD = $__73.YIELD;
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  function isWhitespace(code) {
    if (code < 128) return isWhitespaceArray[code];
    switch (code) {
      case 0xA0:
      case 0xFEFF:
      case 0x2028:
      case 0x2029:
        return true;
    }
    return false;
  }
  function isLineTerminator(code) {
    switch (code) {
      case 10:
      case 13:
      case 0x2028:
      case 0x2029:
        return true;
    }
    return false;
  }
  function isDecimalDigit(code) {
    return code >= 48 && code <= 57;
  }
  var isHexDigitArray = [];
  for (var i = 0; i < 128; i++) {
    isHexDigitArray[i] = i >= 48 && i <= 57 || i >= 65 && i <= 70 || i >= 97 && i <= 102;
  }
  function isHexDigit(code) {
    return code < 128 && isHexDigitArray[code];
  }
  function isBinaryDigit(code) {
    return code === 48 || code === 49;
  }
  function isOctalDigit(code) {
    return code >= 48 && code <= 55;
  }
  var isIdentifierStartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierStartArray[i] = i === 36 || i >= 65 && i <= 90 || i === 95 || i >= 97 && i <= 122;
  }
  function isIdentifierStart(code) {
    return code < 128 ? isIdentifierStartArray[code]: inTable(idStartTable, code);
  }
  var isIdentifierPartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
  }
  function isIdentifierPart(code) {
    return code < 128 ? isIdentifierPartArray[code]: inTable(idStartTable, code) || inTable(idContinueTable, code) || code === 8204 || code === 8205;
  }
  function inTable(table, code) {
    for (var i = 0; i < table.length;) {
      if (code < table[i++]) return false;
      if (code <= table[i++]) return true;
    }
    return false;
  }
  function isRegularExpressionChar(code) {
    switch (code) {
      case 47:
        return false;
      case 91:
      case 92:
        return true;
    }
    return !isLineTerminator(code);
  }
  function isRegularExpressionFirstChar(code) {
    return isRegularExpressionChar(code) && code !== 42;
  }
  var index,
      input,
      length,
      token,
      lastToken,
      lookaheadToken,
      currentCharCode,
      lineNumberTable,
      errorReporter,
      currentParser;
  var Scanner = function(reporter, file, parser) {
    errorReporter = reporter;
    lineNumberTable = file.lineNumberTable;
    input = file.contents;
    length = file.contents.length;
    index = 0;
    lastToken = null;
    token = null;
    lookaheadToken = null;
    updateCurrentCharCode();
    currentParser = parser;
  };
  Scanner = ($traceurRuntime.createClass)(Scanner, {
    get lastToken() {
      return lastToken;
    },
    getPosition: function() {
      return getPosition(getOffset());
    },
    nextRegularExpressionLiteralToken: function() {
      lastToken = nextRegularExpressionLiteralToken();
      token = scanToken();
      return lastToken;
    },
    nextTemplateLiteralToken: function() {
      var t = nextTemplateLiteralToken();
      token = scanToken();
      return t;
    },
    nextToken: function() {
      return nextToken();
    },
    peekToken: function(opt_index) {
      return opt_index ? peekTokenLookahead(): peekToken();
    },
    peekTokenNoLineTerminator: function() {
      return peekTokenNoLineTerminator();
    },
    isAtEnd: function() {
      return isAtEnd();
    }
  }, {});
  function getPosition(offset) {
    return lineNumberTable.getSourcePosition(offset);
  }
  function getTokenRange(startOffset) {
    return lineNumberTable.getSourceRange(startOffset, index);
  }
  function getOffset() {
    return token ? token.location.start.offset: index;
  }
  function nextRegularExpressionLiteralToken() {
    var beginIndex = index - token.toString().length;
    if (!skipRegularExpressionBody()) {
      return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
    }
    if (currentCharCode !== 47) {
      reportError('Expected \'/\' in regular expression literal');
      return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
    }
    next();
    while (isIdentifierPart(currentCharCode)) {
      next();
    }
    return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function skipRegularExpressionBody() {
    if (!isRegularExpressionFirstChar(currentCharCode)) {
      reportError('Expected regular expression first char');
      return false;
    }
    while (!isAtEnd() && isRegularExpressionChar(currentCharCode)) {
      if (!skipRegularExpressionChar()) return false;
    }
    return true;
  }
  function skipRegularExpressionChar() {
    switch (currentCharCode) {
      case 92:
        return skipRegularExpressionBackslashSequence();
      case 91:
        return skipRegularExpressionClass();
      default:
        next();
        return true;
    }
  }
  function skipRegularExpressionBackslashSequence() {
    next();
    if (isLineTerminator(currentCharCode)) {
      reportError('New line not allowed in regular expression literal');
      return false;
    }
    next();
    return true;
  }
  function skipRegularExpressionClass() {
    next();
    while (!isAtEnd() && peekRegularExpressionClassChar()) {
      if (!skipRegularExpressionClassChar()) {
        return false;
      }
    }
    if (currentCharCode !== 93) {
      reportError('\']\' expected');
      return false;
    }
    next();
    return true;
  }
  function peekRegularExpressionClassChar() {
    return currentCharCode !== 93 && !isLineTerminator(currentCharCode);
  }
  function skipRegularExpressionClassChar() {
    if (currentCharCode === 92) {
      return skipRegularExpressionBackslashSequence();
    }
    next();
    return true;
  }
  function skipTemplateCharacter() {
    while (!isAtEnd()) {
      switch (currentCharCode) {
        case 96:
          return;
        case 92:
          skipStringLiteralEscapeSequence();
          break;
        case 36:
          var code = input.charCodeAt(index + 1);
          if (code === 123) return;
        default:
          next();
      }
    }
  }
  function scanTemplateStart(beginIndex) {
    if (isAtEnd()) {
      reportError('Unterminated template literal');
      return lastToken = createToken(END_OF_FILE, beginIndex);
    }
    return nextTemplateLiteralTokenShared(NO_SUBSTITUTION_TEMPLATE, TEMPLATE_HEAD);
  }
  function nextTemplateLiteralToken() {
    if (isAtEnd()) {
      reportError('Expected \'}\' after expression in template literal');
      return createToken(END_OF_FILE, index);
    }
    if (token.type !== CLOSE_CURLY) {
      reportError('Expected \'}\' after expression in template literal');
      return createToken(ERROR, index);
    }
    return nextTemplateLiteralTokenShared(TEMPLATE_TAIL, TEMPLATE_MIDDLE);
  }
  function nextTemplateLiteralTokenShared(endType, middleType) {
    var beginIndex = index;
    skipTemplateCharacter();
    if (isAtEnd()) {
      reportError('Unterminated template literal');
      return createToken(ERROR, beginIndex);
    }
    var value = getTokenString(beginIndex);
    switch (currentCharCode) {
      case 96:
        next();
        return lastToken = new LiteralToken(endType, value, getTokenRange(beginIndex - 1));
      case 36:
        next();
        next();
        return lastToken = new LiteralToken(middleType, value, getTokenRange(beginIndex - 1));
    }
  }
  function nextToken() {
    var t = peekToken();
    token = lookaheadToken || scanToken();
    lookaheadToken = null;
    lastToken = t;
    return t;
  }
  function peekTokenNoLineTerminator() {
    var t = peekToken();
    var start = lastToken.location.end.offset;
    var end = t.location.start.offset;
    for (var i = start; i < end; i++) {
      var code = input.charCodeAt(i);
      if (isLineTerminator(code)) return null;
      if (code === 47) {
        code = input.charCodeAt(++i);
        if (code === 47) return null;
        i = input.indexOf('*/', i) + 2;
      }
    }
    return t;
  }
  function peekToken() {
    return token || (token = scanToken());
  }
  function peekTokenLookahead() {
    if (!token) token = scanToken();
    if (!lookaheadToken) lookaheadToken = scanToken();
    return lookaheadToken;
  }
  function skipWhitespace() {
    while (!isAtEnd() && peekWhitespace()) {
      next();
    }
  }
  function peekWhitespace() {
    return isWhitespace(currentCharCode);
  }
  function skipComments() {
    while (skipComment()) {}
  }
  function skipComment() {
    skipWhitespace();
    var code = currentCharCode;
    if (code === 47) {
      code = input.charCodeAt(index + 1);
      switch (code) {
        case 47:
          skipSingleLineComment();
          return true;
        case 42:
          skipMultiLineComment();
          return true;
      }
    }
    return false;
  }
  function skipSingleLineComment() {
    index += 2;
    while (!isAtEnd() && !isLineTerminator(input.charCodeAt(index++))) {}
    updateCurrentCharCode();
  }
  function skipMultiLineComment() {
    var i = input.indexOf('*/', index + 2);
    if (i !== - 1) index = i + 2; else index = length;
    updateCurrentCharCode();
  }
  function scanToken() {
    skipComments();
    var beginIndex = index;
    if (isAtEnd()) return createToken(END_OF_FILE, beginIndex);
    var code = currentCharCode;
    next();
    switch (code) {
      case 123:
        return createToken(OPEN_CURLY, beginIndex);
      case 125:
        return createToken(CLOSE_CURLY, beginIndex);
      case 40:
        return createToken(OPEN_PAREN, beginIndex);
      case 41:
        return createToken(CLOSE_PAREN, beginIndex);
      case 91:
        return createToken(OPEN_SQUARE, beginIndex);
      case 93:
        return createToken(CLOSE_SQUARE, beginIndex);
      case 46:
        switch (currentCharCode) {
          case 46:
            if (input.charCodeAt(index + 1) === 46) {
              next();
              next();
              return createToken(DOT_DOT_DOT, beginIndex);
            }
            break;
          default:
            if (isDecimalDigit(currentCharCode)) return scanNumberPostPeriod(beginIndex);
        }
        return createToken(PERIOD, beginIndex);
      case 59:
        return createToken(SEMI_COLON, beginIndex);
      case 44:
        return createToken(COMMA, beginIndex);
      case 126:
        return createToken(TILDE, beginIndex);
      case 63:
        return createToken(QUESTION, beginIndex);
      case 58:
        return createToken(COLON, beginIndex);
      case 60:
        switch (currentCharCode) {
          case 60:
            next();
            if (currentCharCode === 61) {
              next();
              return createToken(LEFT_SHIFT_EQUAL, beginIndex);
            }
            return createToken(LEFT_SHIFT, beginIndex);
          case 61:
            next();
            return createToken(LESS_EQUAL, beginIndex);
          default:
            return createToken(OPEN_ANGLE, beginIndex);
        }
      case 62:
        switch (currentCharCode) {
          case 62:
            next();
            switch (currentCharCode) {
              case 61:
                next();
                return createToken(RIGHT_SHIFT_EQUAL, beginIndex);
              case 62:
                next();
                if (currentCharCode === 61) {
                  next();
                  return createToken(UNSIGNED_RIGHT_SHIFT_EQUAL, beginIndex);
                }
                return createToken(UNSIGNED_RIGHT_SHIFT, beginIndex);
              default:
                return createToken(RIGHT_SHIFT, beginIndex);
            }
          case 61:
            next();
            return createToken(GREATER_EQUAL, beginIndex);
          default:
            return createToken(CLOSE_ANGLE, beginIndex);
        }
      case 61:
        if (currentCharCode === 61) {
          next();
          if (currentCharCode === 61) {
            next();
            return createToken(EQUAL_EQUAL_EQUAL, beginIndex);
          }
          return createToken(EQUAL_EQUAL, beginIndex);
        }
        if (currentCharCode === 62) {
          next();
          return createToken(ARROW, beginIndex);
        }
        return createToken(EQUAL, beginIndex);
      case 33:
        if (currentCharCode === 61) {
          next();
          if (currentCharCode === 61) {
            next();
            return createToken(NOT_EQUAL_EQUAL, beginIndex);
          }
          return createToken(NOT_EQUAL, beginIndex);
        }
        return createToken(BANG, beginIndex);
      case 42:
        if (currentCharCode === 61) {
          next();
          return createToken(STAR_EQUAL, beginIndex);
        }
        return createToken(STAR, beginIndex);
      case 37:
        if (currentCharCode === 61) {
          next();
          return createToken(PERCENT_EQUAL, beginIndex);
        }
        return createToken(PERCENT, beginIndex);
      case 94:
        if (currentCharCode === 61) {
          next();
          return createToken(CARET_EQUAL, beginIndex);
        }
        return createToken(CARET, beginIndex);
      case 47:
        if (currentCharCode === 61) {
          next();
          return createToken(SLASH_EQUAL, beginIndex);
        }
        return createToken(SLASH, beginIndex);
      case 43:
        switch (currentCharCode) {
          case 43:
            next();
            return createToken(PLUS_PLUS, beginIndex);
          case 61:
            next();
            return createToken(PLUS_EQUAL, beginIndex);
          default:
            return createToken(PLUS, beginIndex);
        }
      case 45:
        switch (currentCharCode) {
          case 45:
            next();
            return createToken(MINUS_MINUS, beginIndex);
          case 61:
            next();
            return createToken(MINUS_EQUAL, beginIndex);
          default:
            return createToken(MINUS, beginIndex);
        }
      case 38:
        switch (currentCharCode) {
          case 38:
            next();
            return createToken(AND, beginIndex);
          case 61:
            next();
            return createToken(AMPERSAND_EQUAL, beginIndex);
          default:
            return createToken(AMPERSAND, beginIndex);
        }
      case 124:
        switch (currentCharCode) {
          case 124:
            next();
            return createToken(OR, beginIndex);
          case 61:
            next();
            return createToken(BAR_EQUAL, beginIndex);
          default:
            return createToken(BAR, beginIndex);
        }
      case 96:
        return scanTemplateStart(beginIndex);
      case 48:
        return scanPostZero(beginIndex);
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return scanPostDigit(beginIndex);
      case 34:
      case 39:
        return scanStringLiteral(beginIndex, code);
      default:
        return scanIdentifierOrKeyword(beginIndex, code);
    }
  }
  function scanNumberPostPeriod(beginIndex) {
    skipDecimalDigits();
    return scanExponentOfNumericLiteral(beginIndex);
  }
  function scanPostDigit(beginIndex) {
    skipDecimalDigits();
    return scanFractionalNumericLiteral(beginIndex);
  }
  function scanPostZero(beginIndex) {
    switch (currentCharCode) {
      case 46:
        return scanFractionalNumericLiteral(beginIndex);
      case 88:
      case 120:
        next();
        if (!isHexDigit(currentCharCode)) {
          reportError('Hex Integer Literal must contain at least one digit');
        }
        skipHexDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 66:
      case 98:
        if (!parseOptions.numericLiterals) break;
        next();
        if (!isBinaryDigit(currentCharCode)) {
          reportError('Binary Integer Literal must contain at least one digit');
        }
        skipBinaryDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 79:
      case 111:
        if (!parseOptions.numericLiterals) break;
        next();
        if (!isOctalDigit(currentCharCode)) {
          reportError('Octal Integer Literal must contain at least one digit');
        }
        skipOctalDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return scanPostDigit(beginIndex);
    }
    return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function createToken(type, beginIndex) {
    return new Token(type, getTokenRange(beginIndex));
  }
  function readUnicodeEscapeSequence() {
    var beginIndex = index;
    if (currentCharCode === 117) {
      next();
      if (skipHexDigit() && skipHexDigit() && skipHexDigit() && skipHexDigit()) {
        return parseInt(getTokenString(beginIndex + 1), 16);
      }
    }
    reportError('Invalid unicode escape sequence in identifier', beginIndex - 1);
    return 0;
  }
  function scanIdentifierOrKeyword(beginIndex, code) {
    var escapedCharCodes;
    if (code === 92) {
      code = readUnicodeEscapeSequence();
      escapedCharCodes = [code];
    }
    if (!isIdentifierStart(code)) {
      reportError(("Character code '" + code + "' is not a valid identifier start char"), beginIndex);
      return createToken(ERROR, beginIndex);
    }
    for (;;) {
      code = currentCharCode;
      if (isIdentifierPart(code)) {
        next();
      } else if (code === 92) {
        next();
        code = readUnicodeEscapeSequence();
        if (!escapedCharCodes) escapedCharCodes = [];
        escapedCharCodes.push(code);
        if (!isIdentifierPart(code)) return createToken(ERROR, beginIndex);
      } else {
        break;
      }
    }
    var value = input.slice(beginIndex, index);
    var keywordType = getKeywordType(value);
    if (keywordType) return new KeywordToken(value, keywordType, getTokenRange(beginIndex));
    if (escapedCharCodes) {
      var i = 0;
      value = value.replace(/\\u..../g, function(s) {
        return String.fromCharCode(escapedCharCodes[i++]);
      });
    }
    return new IdentifierToken(getTokenRange(beginIndex), value);
  }
  function scanStringLiteral(beginIndex, terminator) {
    while (peekStringLiteralChar(terminator)) {
      if (!skipStringLiteralChar()) {
        return new LiteralToken(STRING, getTokenString(beginIndex), getTokenRange(beginIndex));
      }
    }
    if (currentCharCode !== terminator) {
      reportError('Unterminated String Literal', beginIndex);
    } else {
      next();
    }
    return new LiteralToken(STRING, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function getTokenString(beginIndex) {
    return input.substring(beginIndex, index);
  }
  function peekStringLiteralChar(terminator) {
    return !isAtEnd() && currentCharCode !== terminator && !isLineTerminator(currentCharCode);
  }
  function skipStringLiteralChar() {
    if (currentCharCode === 92) {
      return skipStringLiteralEscapeSequence();
    }
    next();
    return true;
  }
  function skipStringLiteralEscapeSequence() {
    next();
    if (isAtEnd()) {
      reportError('Unterminated string literal escape sequence');
      return false;
    }
    if (isLineTerminator(currentCharCode)) {
      skipLineTerminator();
      return true;
    }
    var code = currentCharCode;
    next();
    switch (code) {
      case 39:
      case 34:
      case 92:
      case 98:
      case 102:
      case 110:
      case 114:
      case 116:
      case 118:
      case 48:
        return true;
      case 120:
        return skipHexDigit() && skipHexDigit();
      case 117:
        return skipHexDigit() && skipHexDigit() && skipHexDigit() && skipHexDigit();
      default:
        return true;
    }
  }
  function skipHexDigit() {
    if (!isHexDigit(currentCharCode)) {
      reportError('Hex digit expected');
      return false;
    }
    next();
    return true;
  }
  function skipLineTerminator() {
    var first = currentCharCode;
    next();
    if (first === 13 && currentCharCode === 10) {
      next();
    }
  }
  function scanFractionalNumericLiteral(beginIndex) {
    if (currentCharCode === 46) {
      next();
      skipDecimalDigits();
    }
    return scanExponentOfNumericLiteral(beginIndex);
  }
  function scanExponentOfNumericLiteral(beginIndex) {
    switch (currentCharCode) {
      case 101:
      case 69:
        next();
        switch (currentCharCode) {
          case 43:
          case 45:
            next();
            break;
        }
        if (!isDecimalDigit(currentCharCode)) {
          reportError('Exponent part must contain at least one digit');
        }
        skipDecimalDigits();
        break;
      default:
        break;
    }
    return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function skipDecimalDigits() {
    while (isDecimalDigit(currentCharCode)) {
      next();
    }
  }
  function skipHexDigits() {
    while (isHexDigit(currentCharCode)) {
      next();
    }
  }
  function skipBinaryDigits() {
    while (isBinaryDigit(currentCharCode)) {
      next();
    }
  }
  function skipOctalDigits() {
    while (isOctalDigit(currentCharCode)) {
      next();
    }
  }
  function isAtEnd() {
    return index === length;
  }
  function next() {
    index++;
    updateCurrentCharCode();
  }
  function updateCurrentCharCode() {
    currentCharCode = input.charCodeAt(index);
  }
  function reportError(message) {
    var indexArg = arguments[1] !== (void 0) ? arguments[1]: index;
    var position = getPosition(indexArg);
    errorReporter.reportError(position, message);
  }
  return {
    get isLineTerminator() {
      return isLineTerminator;
    },
    get Scanner() {
      return Scanner;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/Parser", function() {
  "use strict";
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AssignmentPatternTransformer"),
      AssignmentPatternTransformer = $__76.AssignmentPatternTransformer,
      AssignmentPatternTransformerError = $__76.AssignmentPatternTransformerError;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/CoverFormalsTransformer"),
      toFormalParameters = $__76.toFormalParameters,
      toParenExpression = $__76.toParenExpression,
      CoverFormalsTransformerError = $__76.CoverFormalsTransformerError;
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARRAY_LITERAL_EXPRESSION = $__76.ARRAY_LITERAL_EXPRESSION,
      BINARY_OPERATOR = $__76.BINARY_OPERATOR,
      CALL_EXPRESSION = $__76.CALL_EXPRESSION,
      COMMA_EXPRESSION = $__76.COMMA_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__76.COMPUTED_PROPERTY_NAME,
      COVER_FORMALS = $__76.COVER_FORMALS,
      FORMAL_PARAMETER_LIST = $__76.FORMAL_PARAMETER_LIST,
      IDENTIFIER_EXPRESSION = $__76.IDENTIFIER_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__76.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__76.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__76.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__76.OBJECT_LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__76.PAREN_EXPRESSION,
      PROPERTY_NAME_ASSIGNMENT = $__76.PROPERTY_NAME_ASSIGNMENT,
      REST_PARAMETER = $__76.REST_PARAMETER,
      SYNTAX_ERROR_TREE = $__76.SYNTAX_ERROR_TREE;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      ANY = $__76.ANY,
      AS = $__76.AS,
      BOOL = $__76.BOOL,
      FROM = $__76.FROM,
      GET = $__76.GET,
      MODULE = $__76.MODULE,
      NUMBER = $__76.NUMBER,
      OF = $__76.OF,
      SET = $__76.SET,
      STRING = $__76.STRING;
  var Scanner = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Scanner").Scanner;
  var SourceRange = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/SourceRange").SourceRange;
  var StrictParams = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/staticsemantics/StrictParams").StrictParams;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token"),
      Token = $__76.Token,
      isAssignmentOperator = $__76.isAssignmentOperator;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options"),
      parseOptions = $__76.parseOptions,
      options = $__76.options;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND = $__76.AMPERSAND,
      AMPERSAND_EQUAL = $__76.AMPERSAND_EQUAL,
      AND = $__76.AND,
      ARROW = $__76.ARROW,
      AWAIT = $__76.AWAIT,
      BACK_QUOTE = $__76.BACK_QUOTE,
      BANG = $__76.BANG,
      BAR = $__76.BAR,
      BAR_EQUAL = $__76.BAR_EQUAL,
      BREAK = $__76.BREAK,
      CARET = $__76.CARET,
      CARET_EQUAL = $__76.CARET_EQUAL,
      CASE = $__76.CASE,
      CATCH = $__76.CATCH,
      CLASS = $__76.CLASS,
      CLOSE_ANGLE = $__76.CLOSE_ANGLE,
      CLOSE_CURLY = $__76.CLOSE_CURLY,
      CLOSE_PAREN = $__76.CLOSE_PAREN,
      CLOSE_SQUARE = $__76.CLOSE_SQUARE,
      COLON = $__76.COLON,
      COMMA = $__76.COMMA,
      CONST = $__76.CONST,
      CONTINUE = $__76.CONTINUE,
      DEBUGGER = $__76.DEBUGGER,
      DEFAULT = $__76.DEFAULT,
      DELETE = $__76.DELETE,
      DO = $__76.DO,
      DOT_DOT_DOT = $__76.DOT_DOT_DOT,
      ELSE = $__76.ELSE,
      END_OF_FILE = $__76.END_OF_FILE,
      ENUM = $__76.ENUM,
      EQUAL = $__76.EQUAL,
      EQUAL_EQUAL = $__76.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__76.EQUAL_EQUAL_EQUAL,
      ERROR = $__76.ERROR,
      EXPORT = $__76.EXPORT,
      EXTENDS = $__76.EXTENDS,
      FALSE = $__76.FALSE,
      FINALLY = $__76.FINALLY,
      FOR = $__76.FOR,
      FUNCTION = $__76.FUNCTION,
      GREATER_EQUAL = $__76.GREATER_EQUAL,
      IDENTIFIER = $__76.IDENTIFIER,
      IF = $__76.IF,
      IMPLEMENTS = $__76.IMPLEMENTS,
      IMPORT = $__76.IMPORT,
      IN = $__76.IN,
      INSTANCEOF = $__76.INSTANCEOF,
      INTERFACE = $__76.INTERFACE,
      LEFT_SHIFT = $__76.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__76.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__76.LESS_EQUAL,
      LET = $__76.LET,
      MINUS = $__76.MINUS,
      MINUS_EQUAL = $__76.MINUS_EQUAL,
      MINUS_MINUS = $__76.MINUS_MINUS,
      NEW = $__76.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__76.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__76.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__76.NOT_EQUAL_EQUAL,
      NULL = $__76.NULL,
      NUMBER = $__76.NUMBER,
      OPEN_ANGLE = $__76.OPEN_ANGLE,
      OPEN_CURLY = $__76.OPEN_CURLY,
      OPEN_PAREN = $__76.OPEN_PAREN,
      OPEN_SQUARE = $__76.OPEN_SQUARE,
      OR = $__76.OR,
      PACKAGE = $__76.PACKAGE,
      PERCENT = $__76.PERCENT,
      PERCENT_EQUAL = $__76.PERCENT_EQUAL,
      PERIOD = $__76.PERIOD,
      PLUS = $__76.PLUS,
      PLUS_EQUAL = $__76.PLUS_EQUAL,
      PLUS_PLUS = $__76.PLUS_PLUS,
      PRIVATE = $__76.PRIVATE,
      PROTECTED = $__76.PROTECTED,
      PUBLIC = $__76.PUBLIC,
      QUESTION = $__76.QUESTION,
      REGULAR_EXPRESSION = $__76.REGULAR_EXPRESSION,
      RETURN = $__76.RETURN,
      RIGHT_SHIFT = $__76.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__76.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__76.SEMI_COLON,
      SLASH = $__76.SLASH,
      SLASH_EQUAL = $__76.SLASH_EQUAL,
      STAR = $__76.STAR,
      STAR_EQUAL = $__76.STAR_EQUAL,
      STATIC = $__76.STATIC,
      STRING = $__76.STRING,
      SUPER = $__76.SUPER,
      SWITCH = $__76.SWITCH,
      TEMPLATE_HEAD = $__76.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__76.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__76.TEMPLATE_TAIL,
      THIS = $__76.THIS,
      THROW = $__76.THROW,
      TILDE = $__76.TILDE,
      TRUE = $__76.TRUE,
      TRY = $__76.TRY,
      TYPEOF = $__76.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__76.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__76.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__76.VAR,
      VOID = $__76.VOID,
      WHILE = $__76.WHILE,
      WITH = $__76.WITH,
      YIELD = $__76.YIELD;
  var $__76 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      ArgumentList = $__76.ArgumentList,
      ArrayComprehension = $__76.ArrayComprehension,
      ArrayLiteralExpression = $__76.ArrayLiteralExpression,
      ArrayPattern = $__76.ArrayPattern,
      ArrowFunctionExpression = $__76.ArrowFunctionExpression,
      AwaitStatement = $__76.AwaitStatement,
      BinaryOperator = $__76.BinaryOperator,
      BindingElement = $__76.BindingElement,
      BindingIdentifier = $__76.BindingIdentifier,
      Block = $__76.Block,
      BreakStatement = $__76.BreakStatement,
      CallExpression = $__76.CallExpression,
      CaseClause = $__76.CaseClause,
      Catch = $__76.Catch,
      ClassDeclaration = $__76.ClassDeclaration,
      ClassExpression = $__76.ClassExpression,
      CommaExpression = $__76.CommaExpression,
      ComprehensionFor = $__76.ComprehensionFor,
      ComprehensionIf = $__76.ComprehensionIf,
      ComputedPropertyName = $__76.ComputedPropertyName,
      ConditionalExpression = $__76.ConditionalExpression,
      ContinueStatement = $__76.ContinueStatement,
      CoverFormals = $__76.CoverFormals,
      CoverInitialisedName = $__76.CoverInitialisedName,
      DebuggerStatement = $__76.DebuggerStatement,
      DefaultClause = $__76.DefaultClause,
      DoWhileStatement = $__76.DoWhileStatement,
      EmptyStatement = $__76.EmptyStatement,
      ExportDeclaration = $__76.ExportDeclaration,
      ExportDefault = $__76.ExportDefault,
      ExportSpecifier = $__76.ExportSpecifier,
      ExportSpecifierSet = $__76.ExportSpecifierSet,
      ExportStar = $__76.ExportStar,
      ExpressionStatement = $__76.ExpressionStatement,
      Finally = $__76.Finally,
      ForInStatement = $__76.ForInStatement,
      ForOfStatement = $__76.ForOfStatement,
      ForStatement = $__76.ForStatement,
      FormalParameter = $__76.FormalParameter,
      FormalParameterList = $__76.FormalParameterList,
      FunctionBody = $__76.FunctionBody,
      FunctionDeclaration = $__76.FunctionDeclaration,
      FunctionExpression = $__76.FunctionExpression,
      GeneratorComprehension = $__76.GeneratorComprehension,
      GetAccessor = $__76.GetAccessor,
      IdentifierExpression = $__76.IdentifierExpression,
      IfStatement = $__76.IfStatement,
      ImportDeclaration = $__76.ImportDeclaration,
      ImportSpecifier = $__76.ImportSpecifier,
      ImportSpecifierSet = $__76.ImportSpecifierSet,
      ImportedBinding = $__76.ImportedBinding,
      LabelledStatement = $__76.LabelledStatement,
      LiteralExpression = $__76.LiteralExpression,
      LiteralPropertyName = $__76.LiteralPropertyName,
      MemberExpression = $__76.MemberExpression,
      MemberLookupExpression = $__76.MemberLookupExpression,
      Module = $__76.Module,
      ModuleDeclaration = $__76.ModuleDeclaration,
      ModuleSpecifier = $__76.ModuleSpecifier,
      NamedExport = $__76.NamedExport,
      NewExpression = $__76.NewExpression,
      ObjectLiteralExpression = $__76.ObjectLiteralExpression,
      ObjectPattern = $__76.ObjectPattern,
      ObjectPatternField = $__76.ObjectPatternField,
      ParenExpression = $__76.ParenExpression,
      PostfixExpression = $__76.PostfixExpression,
      PredefinedType = $__76.PredefinedType,
      Script = $__76.Script,
      PropertyMethodAssignment = $__76.PropertyMethodAssignment,
      PropertyNameAssignment = $__76.PropertyNameAssignment,
      PropertyNameShorthand = $__76.PropertyNameShorthand,
      RestParameter = $__76.RestParameter,
      ReturnStatement = $__76.ReturnStatement,
      SetAccessor = $__76.SetAccessor,
      SpreadExpression = $__76.SpreadExpression,
      SpreadPatternElement = $__76.SpreadPatternElement,
      SuperExpression = $__76.SuperExpression,
      SwitchStatement = $__76.SwitchStatement,
      SyntaxErrorTree = $__76.SyntaxErrorTree,
      TemplateLiteralExpression = $__76.TemplateLiteralExpression,
      TemplateLiteralPortion = $__76.TemplateLiteralPortion,
      TemplateSubstitution = $__76.TemplateSubstitution,
      ThisExpression = $__76.ThisExpression,
      ThrowStatement = $__76.ThrowStatement,
      TryStatement = $__76.TryStatement,
      TypeName = $__76.TypeName,
      UnaryExpression = $__76.UnaryExpression,
      VariableDeclaration = $__76.VariableDeclaration,
      VariableDeclarationList = $__76.VariableDeclarationList,
      VariableStatement = $__76.VariableStatement,
      WhileStatement = $__76.WhileStatement,
      WithStatement = $__76.WithStatement,
      YieldExpression = $__76.YieldExpression;
  var Expression = {
    NO_IN: 'NO_IN',
    NORMAL: 'NORMAL'
  };
  var DestructuringInitialiser = {
    REQUIRED: 'REQUIRED',
    OPTIONAL: 'OPTIONAL'
  };
  var Initialiser = {
    ALLOWED: 'ALLOWED',
    REQUIRED: 'REQUIRED'
  };
  var Parser = function(errorReporter, file) {
    this.errorReporter_ = errorReporter;
    this.scanner_ = new Scanner(errorReporter, file, this);
    this.allowYield_ = options.unstarredGenerators;
    this.strictMode_ = false;
    this.coverInitialisedName_ = null;
  };
  Parser = ($traceurRuntime.createClass)(Parser, {
    parseScript: function() {
      this.strictMode_ = false;
      var start = this.getTreeStartLocation_();
      var scriptItemList = this.parseScriptItemList_();
      this.eat_(END_OF_FILE);
      return new Script(this.getTreeLocation_(start), scriptItemList);
    },
    parseScriptItemList_: function() {
      var result = [];
      var type;
      var checkUseStrictDirective = true;
      while ((type = this.peekType_()) !== END_OF_FILE) {
        var scriptItem = this.parseScriptItem_(type, false);
        if (checkUseStrictDirective) {
          if (!scriptItem.isDirectivePrologue()) {
            checkUseStrictDirective = false;
          } else if (scriptItem.isUseStrictDirective()) {
            this.strictMode_ = true;
            checkUseStrictDirective = false;
          }
        }
        result.push(scriptItem);
      }
      return result;
    },
    parseScriptItem_: function(type, allowModuleItem) {
      return this.parseStatement_(type, allowModuleItem, true);
    },
    parseModule: function() {
      var start = this.getTreeStartLocation_();
      var scriptItemList = this.parseModuleItemList_();
      this.eat_(END_OF_FILE);
      return new Module(this.getTreeLocation_(start), scriptItemList);
    },
    parseModuleItemList_: function() {
      this.strictMode_ = true;
      var result = [];
      var type;
      while ((type = this.peekType_()) !== END_OF_FILE) {
        var scriptItem = this.parseScriptItem_(type, true);
        result.push(scriptItem);
      }
      return result;
    },
    parseModuleSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.eat_(STRING);
      return new ModuleSpecifier(this.getTreeLocation_(start), token);
    },
    parseImportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IMPORT);
      var importClause = null;
      if (this.peekImportClause_(this.peekType_())) {
        importClause = this.parseImportClause_();
        this.eatId_(FROM);
      }
      var moduleSpecifier = this.parseModuleSpecifier_();
      this.eatPossibleImplicitSemiColon_();
      return new ImportDeclaration(this.getTreeLocation_(start), importClause, moduleSpecifier);
    },
    peekImportClause_: function(type) {
      return type === OPEN_CURLY || this.peekBindingIdentifier_(type);
    },
    parseImportClause_: function() {
      var start = this.getTreeStartLocation_();
      if (this.eatIf_(OPEN_CURLY)) {
        var specifiers = [];
        while (!this.peek_(CLOSE_CURLY) && !this.isAtEnd()) {
          specifiers.push(this.parseImportSpecifier_());
          if (!this.eatIf_(COMMA)) break;
        }
        this.eat_(CLOSE_CURLY);
        return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
      }
      var binding = this.parseBindingIdentifier_();
      return new ImportedBinding(this.getTreeLocation_(start), binding);
    },
    parseImportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.peekToken_();
      var isKeyword = token.isKeyword();
      var lhs = this.eatIdName_();
      var rhs = null;
      if (isKeyword || this.peekPredefinedString_(AS)) {
        this.eatId_(AS);
        rhs = this.eatId_();
      }
      return new ImportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },
    parseExportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(EXPORT);
      var exportTree;
      var type = this.peekType_();
      switch (type) {
        case CONST:
        case LET:
        case VAR:
          exportTree = this.parseVariableStatement_();
          break;
        case FUNCTION:
          exportTree = this.parseFunctionDeclaration_();
          break;
        case CLASS:
          exportTree = this.parseClassDeclaration_();
          break;
        case DEFAULT:
          exportTree = this.parseExportDefault_();
          break;
        case OPEN_CURLY:
        case STAR:
          exportTree = this.parseNamedExport_();
          break;
        default:
          return this.parseUnexpectedToken_(type);
      }
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
    },
    parseExportDefault_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DEFAULT);
      var expression = this.parseAssignmentExpression();
      this.eatPossibleImplicitSemiColon_();
      return new ExportDefault(this.getTreeLocation_(start), expression);
    },
    parseNamedExport_: function() {
      var start = this.getTreeStartLocation_();
      var specifierSet,
          expression;
      if (this.peek_(OPEN_CURLY)) {
        specifierSet = this.parseExportSpecifierSet_();
        expression = this.parseFromModuleSpecifierOpt_(false);
      } else {
        this.eat_(STAR);
        specifierSet = new ExportStar(this.getTreeLocation_(start));
        expression = this.parseFromModuleSpecifierOpt_(true);
      }
      this.eatPossibleImplicitSemiColon_();
      return new NamedExport(this.getTreeLocation_(start), expression, specifierSet);
    },
    parseFromModuleSpecifierOpt_: function(required) {
      if (required || this.peekPredefinedString_(FROM)) {
        this.eatId_(FROM);
        return this.parseModuleSpecifier_();
      }
      return null;
    },
    parseExportSpecifierSet_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var specifiers = [this.parseExportSpecifier_()];
      while (this.eatIf_(COMMA)) {
        if (this.peek_(CLOSE_CURLY)) break;
        specifiers.push(this.parseExportSpecifier_());
      }
      this.eat_(CLOSE_CURLY);
      return new ExportSpecifierSet(this.getTreeLocation_(start), specifiers);
    },
    parseExportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var lhs = this.eatId_();
      var rhs = null;
      if (this.peekPredefinedString_(AS)) {
        this.eatId_(AS);
        rhs = this.eatIdName_();
      }
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },
    peekId_: function(type) {
      if (type === IDENTIFIER) return true;
      if (this.strictMode_) return false;
      return this.peekToken_().isStrictKeyword();
    },
    peekIdName_: function(token) {
      return token.type === IDENTIFIER || token.isKeyword();
    },
    parseClassShared_: function(constr) {
      var start = this.getTreeStartLocation_();
      var strictMode = this.strictMode_;
      this.strictMode_ = true;
      this.eat_(CLASS);
      var name = null;
      if (constr == ClassDeclaration || !this.peek_(EXTENDS) && !this.peek_(OPEN_CURLY)) {
        name = this.parseBindingIdentifier_();
      }
      var superClass = null;
      if (this.eatIf_(EXTENDS)) {
        superClass = this.parseAssignmentExpression();
      }
      this.eat_(OPEN_CURLY);
      var elements = this.parseClassElements_();
      this.eat_(CLOSE_CURLY);
      this.strictMode_ = strictMode;
      return new constr(this.getTreeLocation_(start), name, superClass, elements);
    },
    parseClassDeclaration_: function() {
      return this.parseClassShared_(ClassDeclaration);
    },
    parseClassExpression_: function() {
      return this.parseClassShared_(ClassExpression);
    },
    parseClassElements_: function() {
      var result = [];
      while (true) {
        var type = this.peekType_();
        if (type === SEMI_COLON) {
          this.nextToken_();
        } else if (this.peekClassElement_(this.peekType_())) {
          result.push(this.parseClassElement_());
        } else {
          break;
        }
      }
      return result;
    },
    peekClassElement_: function(type) {
      return this.peekPropertyName_(type) || type === STAR && parseOptions.generators;
    },
    parsePropertyName_: function() {
      if (this.peek_(OPEN_SQUARE)) return this.parseComputedPropertyName_();
      return this.parseLiteralPropertyName_();
    },
    parseLiteralPropertyName_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.nextToken_();
      return new LiteralPropertyName(this.getTreeLocation_(start), token);
    },
    parseComputedPropertyName_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_SQUARE);
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_SQUARE);
      return new ComputedPropertyName(this.getTreeLocation_(start), expression);
    },
    parseStatement: function() {
      return this.parseStatement_(this.peekType_(), false, false);
    },
    parseStatement_: function(type, allowModuleItem, allowScriptItem) {
      switch (type) {
        case RETURN:
          return this.parseReturnStatement_();
        case CONST:
        case LET:
          if (!parseOptions.blockBinding) break;
        case VAR:
          return this.parseVariableStatement_();
        case IF:
          return this.parseIfStatement_();
        case FOR:
          return this.parseForStatement_();
        case BREAK:
          return this.parseBreakStatement_();
        case SWITCH:
          return this.parseSwitchStatement_();
        case THROW:
          return this.parseThrowStatement_();
        case WHILE:
          return this.parseWhileStatement_();
        case FUNCTION:
          return this.parseFunctionDeclaration_();
        case AWAIT:
          if (parseOptions.deferredFunctions) return this.parseAwaitStatement_();
          break;
        case CLASS:
          if (parseOptions.classes) return this.parseClassDeclaration_();
          break;
        case CONTINUE:
          return this.parseContinueStatement_();
        case DEBUGGER:
          return this.parseDebuggerStatement_();
        case DO:
          return this.parseDoWhileStatement_();
        case EXPORT:
          if (allowModuleItem && parseOptions.modules) return this.parseExportDeclaration_();
          break;
        case IMPORT:
          if (allowScriptItem && parseOptions.modules) return this.parseImportDeclaration_();
          break;
        case OPEN_CURLY:
          return this.parseBlock_();
        case SEMI_COLON:
          return this.parseEmptyStatement_();
        case TRY:
          return this.parseTryStatement_();
        case WITH:
          return this.parseWithStatement_();
      }
      return this.parseFallThroughStatement_(allowScriptItem);
    },
    parseFunctionDeclaration_: function() {
      return this.parseFunction_(FunctionDeclaration);
    },
    parseFunctionExpression_: function() {
      return this.parseFunction_(FunctionExpression);
    },
    parseFunction_: function(ctor) {
      var start = this.getTreeStartLocation_();
      this.eat_(FUNCTION);
      var isGenerator = parseOptions.generators && this.eatIf_(STAR);
      var name = null;
      if (ctor === FunctionDeclaration || this.peekBindingIdentifier_(this.peekType_())) {
        name = this.parseBindingIdentifier_();
      }
      this.eat_(OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var functionBody = this.parseFunctionBody_(isGenerator, formalParameterList);
      return new ctor(this.getTreeLocation_(start), name, isGenerator, formalParameterList, typeAnnotation, functionBody);
    },
    peekRest_: function(type) {
      return type === DOT_DOT_DOT && parseOptions.restParameters;
    },
    parseFormalParameterList_: function() {
      var start = this.getTreeStartLocation_();
      var formals = [];
      var type = this.peekType_();
      if (this.peekRest_(type)) {
        formals.push(this.parseFormalRestParameter_());
      } else {
        if (this.peekFormalParameter_(this.peekType_())) formals.push(this.parseFormalParameter_());
        while (this.eatIf_(COMMA)) {
          if (this.peekRest_(this.peekType_())) {
            formals.push(this.parseFormalRestParameter_());
            break;
          }
          formals.push(this.parseFormalParameter_());
        }
      }
      return new FormalParameterList(this.getTreeLocation_(start), formals);
    },
    peekFormalParameter_: function(type) {
      return this.peekBindingElement_(type);
    },
    parseFormalParameter_: function() {
      var initialiserAllowed = arguments[0];
      var start = this.getTreeStartLocation_();
      var binding = this.parseBindingElementBinding_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var initialiser = this.parseBindingElementInitialiser_(initialiserAllowed);
      return new FormalParameter(this.getTreeLocation_(start), new BindingElement(this.getTreeLocation_(start), binding, initialiser), typeAnnotation);
    },
    parseFormalRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      var restParameter = this.parseRestParameter_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      return new FormalParameter(this.getTreeLocation_(start), restParameter, typeAnnotation);
    },
    parseRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var id = this.parseBindingIdentifier_();
      return new RestParameter(this.getTreeLocation_(start), id);
    },
    parseFunctionBody_: function(isGenerator, params) {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var allowYield = this.allowYield_;
      var strictMode = this.strictMode_;
      this.allowYield_ = isGenerator || options.unstarredGenerators;
      var result = this.parseStatementList_(!strictMode);
      if (!strictMode && this.strictMode_ && params) StrictParams.visit(params, this.errorReporter_);
      this.strictMode_ = strictMode;
      this.allowYield_ = allowYield;
      this.eat_(CLOSE_CURLY);
      return new FunctionBody(this.getTreeLocation_(start), result);
    },
    parseStatements: function() {
      return this.parseStatementList_(false);
    },
    parseStatementList_: function(checkUseStrictDirective) {
      var result = [];
      var type;
      while ((type = this.peekType_()) !== CLOSE_CURLY && type !== END_OF_FILE) {
        var statement = this.parseStatement_(type, false, false);
        if (checkUseStrictDirective) {
          if (!statement.isDirectivePrologue()) {
            checkUseStrictDirective = false;
          } else if (statement.isUseStrictDirective()) {
            this.strictMode_ = true;
            checkUseStrictDirective = false;
          }
        }
        result.push(statement);
      }
      return result;
    },
    parseSpreadExpression_: function() {
      if (!parseOptions.spread) return this.parseUnexpectedToken_(DOT_DOT_DOT);
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var operand = this.parseAssignmentExpression();
      return new SpreadExpression(this.getTreeLocation_(start), operand);
    },
    parseBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var result = this.parseStatementList_(false);
      this.eat_(CLOSE_CURLY);
      return new Block(this.getTreeLocation_(start), result);
    },
    parseVariableStatement_: function() {
      var start = this.getTreeStartLocation_();
      var declarations = this.parseVariableDeclarationList_();
      this.checkInitialisers_(declarations);
      this.eatPossibleImplicitSemiColon_();
      return new VariableStatement(this.getTreeLocation_(start), declarations);
    },
    parseVariableDeclarationList_: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.NORMAL;
      var initialiser = arguments[1] !== (void 0) ? arguments[1]: DestructuringInitialiser.REQUIRED;
      var type = this.peekType_();
      switch (type) {
        case CONST:
        case LET:
          if (!parseOptions.blockBinding) debugger;
        case VAR:
          this.nextToken_();
          break;
        default:
          throw Error('unreachable');
      }
      var start = this.getTreeStartLocation_();
      var declarations = [];
      declarations.push(this.parseVariableDeclaration_(type, expressionIn, initialiser));
      while (this.eatIf_(COMMA)) {
        declarations.push(this.parseVariableDeclaration_(type, expressionIn, initialiser));
      }
      return new VariableDeclarationList(this.getTreeLocation_(start), type, declarations);
    },
    parseVariableDeclaration_: function(binding, expressionIn) {
      var initialiser = arguments[2] !== (void 0) ? arguments[2]: DestructuringInitialiser.REQUIRED;
      var initRequired = initialiser !== DestructuringInitialiser.OPTIONAL;
      var start = this.getTreeStartLocation_();
      var lvalue;
      var typeAnnotation;
      if (this.peekPattern_(this.peekType_())) {
        lvalue = this.parseBindingPattern_();
        typeAnnotation = null;
      } else {
        lvalue = this.parseBindingIdentifier_();
        typeAnnotation = this.parseTypeAnnotationOpt_();
      }
      var initialiser = null;
      if (this.peek_(EQUAL)) initialiser = this.parseInitialiser_(expressionIn); else if (lvalue.isPattern() && initRequired) this.reportError_('destructuring must have an initialiser');
      return new VariableDeclaration(this.getTreeLocation_(start), lvalue, typeAnnotation, initialiser);
    },
    parseInitialiser_: function(expressionIn) {
      this.eat_(EQUAL);
      return this.parseAssignmentExpression(expressionIn);
    },
    parseEmptyStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SEMI_COLON);
      return new EmptyStatement(this.getTreeLocation_(start));
    },
    parseFallThroughStatement_: function(allowScriptItem) {
      var start = this.getTreeStartLocation_();
      var expression = this.parseExpression();
      if (expression.type === IDENTIFIER_EXPRESSION) {
        var nameToken = expression.identifierToken;
        if (this.eatIf_(COLON)) {
          var statement = this.parseStatement();
          return new LabelledStatement(this.getTreeLocation_(start), nameToken, statement);
        }
        if (allowScriptItem && nameToken.value === MODULE && parseOptions.modules) {
          var token = this.peekTokenNoLineTerminator_();
          if (token !== null && token.type === IDENTIFIER) {
            var name = this.eatId_();
            this.eatId_(FROM);
            var moduleSpecifier = this.parseModuleSpecifier_();
            this.eatPossibleImplicitSemiColon_();
            return new ModuleDeclaration(this.getTreeLocation_(start), name, moduleSpecifier);
          }
        }
      }
      this.eatPossibleImplicitSemiColon_();
      return new ExpressionStatement(this.getTreeLocation_(start), expression);
    },
    parseIfStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IF);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var ifClause = this.parseStatement();
      var elseClause = null;
      if (this.eatIf_(ELSE)) {
        elseClause = this.parseStatement();
      }
      return new IfStatement(this.getTreeLocation_(start), condition, ifClause, elseClause);
    },
    parseDoWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DO);
      var body = this.parseStatement();
      this.eat_(WHILE);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      this.eatPossibleImplicitSemiColon_();
      return new DoWhileStatement(this.getTreeLocation_(start), body, condition);
    },
    parseWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(WHILE);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new WhileStatement(this.getTreeLocation_(start), condition, body);
    },
    parseForStatement_: function() {
      var $__74 = this;
      var start = this.getTreeStartLocation_();
      this.eat_(FOR);
      this.eat_(OPEN_PAREN);
      var validate = (function(variables, kind) {
        if (variables.declarations.length > 1) {
          $__74.reportError_(kind + ' statement may not have more than one variable declaration');
        }
        var declaration = variables.declarations[0];
        if (declaration.lvalue.isPattern() && declaration.initialiser) {
          $__74.reportError_(declaration.initialiser.location, ("initialiser is not allowed in " + kind + " loop with pattern"));
        }
      });
      var type = this.peekType_();
      if (this.peekVariableDeclarationList_(type)) {
        var variables = this.parseVariableDeclarationList_(Expression.NO_IN, DestructuringInitialiser.OPTIONAL);
        type = this.peekType_();
        if (type === IN) {
          validate(variables, 'for-in');
          var declaration = variables.declarations[0];
          if (parseOptions.blockBinding && (variables.declarationType == LET || variables.declarationType == CONST)) {
            if (declaration.initialiser != null) {
              this.reportError_('let/const in for-in statement may not have initialiser');
            }
          }
          return this.parseForInStatement_(start, variables);
        } else if (this.peekOf_(type)) {
          validate(variables, 'for-of');
          var declaration = variables.declarations[0];
          if (declaration.initialiser != null) {
            this.reportError_('for-of statement may not have initialiser');
          }
          return this.parseForOfStatement_(start, variables);
        } else {
          this.checkInitialisers_(variables);
          return this.parseForStatement2_(start, variables);
        }
      }
      if (type === SEMI_COLON) {
        return this.parseForStatement2_(start, null);
      }
      var initialiser = this.parseExpression(Expression.NO_IN);
      type = this.peekType_();
      if (initialiser.isLeftHandSideExpression() && (type === IN || this.peekOf_(type))) {
        initialiser = this.transformLeftHandSideExpression_(initialiser);
        if (this.peekOf_(type)) return this.parseForOfStatement_(start, initialiser);
        return this.parseForInStatement_(start, initialiser);
      }
      return this.parseForStatement2_(start, initialiser);
    },
    peekOf_: function(type) {
      return type === IDENTIFIER && parseOptions.forOf && this.peekToken_().value === OF;
    },
    parseForOfStatement_: function(start, initialiser) {
      this.eatId_();
      var collection = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForOfStatement(this.getTreeLocation_(start), initialiser, collection, body);
    },
    checkInitialisers_: function(variables) {
      if (parseOptions.blockBinding && variables.declarationType == CONST) {
        var type = variables.declarationType;
        for (var i = 0; i < variables.declarations.length; i++) {
          if (!this.checkInitialiser_(type, variables.declarations[i])) {
            break;
          }
        }
      }
    },
    checkInitialiser_: function(type, declaration) {
      if (parseOptions.blockBinding && type == CONST && declaration.initialiser == null) {
        this.reportError_('const variables must have an initialiser');
        return false;
      }
      return true;
    },
    peekVariableDeclarationList_: function(type) {
      switch (type) {
        case VAR:
          return true;
        case CONST:
        case LET:
          return parseOptions.blockBinding;
        default:
          return false;
      }
    },
    parseForStatement2_: function(start, initialiser) {
      this.eat_(SEMI_COLON);
      var condition = null;
      if (!this.peek_(SEMI_COLON)) {
        condition = this.parseExpression();
      }
      this.eat_(SEMI_COLON);
      var increment = null;
      if (!this.peek_(CLOSE_PAREN)) {
        increment = this.parseExpression();
      }
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForStatement(this.getTreeLocation_(start), initialiser, condition, increment, body);
    },
    parseForInStatement_: function(start, initialiser) {
      this.eat_(IN);
      var collection = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForInStatement(this.getTreeLocation_(start), initialiser, collection, body);
    },
    parseContinueStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(CONTINUE);
      var name = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ContinueStatement(this.getTreeLocation_(start), name);
    },
    parseBreakStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(BREAK);
      var name = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new BreakStatement(this.getTreeLocation_(start), name);
    },
    parseReturnStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(RETURN);
      var expression = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        expression = this.parseExpression();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ReturnStatement(this.getTreeLocation_(start), expression);
    },
    parseYieldExpression_: function() {
      if (!this.allowYield_) {
        return this.parseSyntaxError_("'yield' expressions are only allowed inside 'function*'");
      }
      var start = this.getTreeStartLocation_();
      this.eat_(YIELD);
      var expression = null;
      var isYieldFor = this.eatIf_(STAR);
      if (isYieldFor || !this.peekImplicitSemiColon_(this.peekType_())) {
        expression = this.parseAssignmentExpression();
      }
      return new YieldExpression(this.getTreeLocation_(start), expression, isYieldFor);
    },
    parseAwaitStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(AWAIT);
      var identifier = null;
      if (this.peek_(IDENTIFIER) && this.peek_(EQUAL, 1)) {
        identifier = this.eatId_();
        this.eat_(EQUAL);
      }
      var expression = this.parseExpression();
      this.eatPossibleImplicitSemiColon_();
      return new AwaitStatement(this.getTreeLocation_(start), identifier, expression);
    },
    parseWithStatement_: function() {
      if (this.strictMode_) this.reportError_('Strict mode code may not include a with statement');
      var start = this.getTreeStartLocation_();
      this.eat_(WITH);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new WithStatement(this.getTreeLocation_(start), expression, body);
    },
    parseSwitchStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SWITCH);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      this.eat_(OPEN_CURLY);
      var caseClauses = this.parseCaseClauses_();
      this.eat_(CLOSE_CURLY);
      return new SwitchStatement(this.getTreeLocation_(start), expression, caseClauses);
    },
    parseCaseClauses_: function() {
      var foundDefaultClause = false;
      var result = [];
      while (true) {
        var start = this.getTreeStartLocation_();
        switch (this.peekType_()) {
          case CASE:
            this.nextToken_();
            var expression = this.parseExpression();
            this.eat_(COLON);
            var statements = this.parseCaseStatementsOpt_();
            result.push(new CaseClause(this.getTreeLocation_(start), expression, statements));
            break;
          case DEFAULT:
            if (foundDefaultClause) {
              this.reportError_('Switch statements may have at most one default clause');
            } else {
              foundDefaultClause = true;
            }
            this.nextToken_();
            this.eat_(COLON);
            result.push(new DefaultClause(this.getTreeLocation_(start), this.parseCaseStatementsOpt_()));
            break;
          default:
            return result;
        }
      }
    },
    parseCaseStatementsOpt_: function() {
      var result = [];
      var type;
      while (true) {
        switch (type = this.peekType_()) {
          case CASE:
          case DEFAULT:
          case CLOSE_CURLY:
          case END_OF_FILE:
            return result;
        }
        result.push(this.parseStatement_(type, false, false));
      }
    },
    parseThrowStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(THROW);
      var value = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        value = this.parseExpression();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ThrowStatement(this.getTreeLocation_(start), value);
    },
    parseTryStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TRY);
      var body = this.parseBlock_();
      var catchBlock = null;
      if (this.peek_(CATCH)) {
        catchBlock = this.parseCatch_();
      }
      var finallyBlock = null;
      if (this.peek_(FINALLY)) {
        finallyBlock = this.parseFinallyBlock_();
      }
      if (catchBlock == null && finallyBlock == null) {
        this.reportError_("'catch' or 'finally' expected.");
      }
      return new TryStatement(this.getTreeLocation_(start), body, catchBlock, finallyBlock);
    },
    parseCatch_: function() {
      var start = this.getTreeStartLocation_();
      var catchBlock;
      this.eat_(CATCH);
      this.eat_(OPEN_PAREN);
      var binding;
      if (this.peekPattern_(this.peekType_())) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_();
      this.eat_(CLOSE_PAREN);
      var catchBody = this.parseBlock_();
      catchBlock = new Catch(this.getTreeLocation_(start), binding, catchBody);
      return catchBlock;
    },
    parseFinallyBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(FINALLY);
      var finallyBlock = this.parseBlock_();
      return new Finally(this.getTreeLocation_(start), finallyBlock);
    },
    parseDebuggerStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DEBUGGER);
      this.eatPossibleImplicitSemiColon_();
      return new DebuggerStatement(this.getTreeLocation_(start));
    },
    parsePrimaryExpression_: function() {
      switch (this.peekType_()) {
        case CLASS:
          return parseOptions.classes ? this.parseClassExpression_(): this.parseSyntaxError_('Unexpected reserved word');
        case SUPER:
          return this.parseSuperExpression_();
        case THIS:
          return this.parseThisExpression_();
        case IDENTIFIER:
          return this.parseIdentifierExpression_();
        case NUMBER:
        case STRING:
        case TRUE:
        case FALSE:
        case NULL:
          return this.parseLiteralExpression_();
        case OPEN_SQUARE:
          return this.parseArrayLiteral_();
        case OPEN_CURLY:
          return this.parseObjectLiteral_();
        case OPEN_PAREN:
          return this.parsePrimaryExpressionStartingWithParen_();
        case SLASH:
        case SLASH_EQUAL:
          return this.parseRegularExpressionLiteral_();
        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          return this.parseTemplateLiteral_(null);
        case IMPLEMENTS:
        case INTERFACE:
        case PACKAGE:
        case PRIVATE:
        case PROTECTED:
        case PUBLIC:
        case STATIC:
        case YIELD:
          if (!this.strictMode_) return this.parseIdentifierExpression_();
          this.reportReservedIdentifier_(this.nextToken_());
        case END_OF_FILE:
          return this.parseSyntaxError_('Unexpected end of input');
        default:
          return this.parseUnexpectedToken_(this.peekToken_());
      }
    },
    parseSuperExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SUPER);
      return new SuperExpression(this.getTreeLocation_(start));
    },
    parseThisExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(THIS);
      return new ThisExpression(this.getTreeLocation_(start));
    },
    peekBindingIdentifier_: function(type) {
      return this.peekId_(type);
    },
    parseBindingIdentifier_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new BindingIdentifier(this.getTreeLocation_(start), identifier);
    },
    parseIdentifierExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },
    parseIdentifierNameExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatIdName_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },
    parseLiteralExpression_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },
    nextLiteralToken_: function() {
      return this.nextToken_();
    },
    parseRegularExpressionLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextRegularExpressionLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },
    peekSpread_: function(type) {
      return type === DOT_DOT_DOT && parseOptions.spread;
    },
    parseArrayLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var expression;
      var elements = [];
      this.eat_(OPEN_SQUARE);
      var type = this.peekType_();
      if (type === FOR && parseOptions.arrayComprehension) return this.parseArrayComprehension_(start);
      while (true) {
        type = this.peekType_();
        if (type === COMMA) {
          expression = null;
        } else if (this.peekSpread_(type)) {
          expression = this.parseSpreadExpression_();
        } else if (this.peekAssignmentExpression_(type)) {
          expression = this.parseAssignmentExpression();
        } else {
          break;
        }
        elements.push(expression);
        type = this.peekType_();
        if (type !== CLOSE_SQUARE) this.eat_(COMMA);
      }
      this.eat_(CLOSE_SQUARE);
      return new ArrayLiteralExpression(this.getTreeLocation_(start), elements);
    },
    parseArrayComprehension_: function(start) {
      var list = this.parseComprehensionList_();
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_SQUARE);
      return new ArrayComprehension(this.getTreeLocation_(start), list, expression);
    },
    parseComprehensionList_: function() {
      var list = [this.parseComprehensionFor_()];
      while (true) {
        var type = this.peekType_();
        switch (type) {
          case FOR:
            list.push(this.parseComprehensionFor_());
            break;
          case IF:
            list.push(this.parseComprehensionIf_());
            break;
          default:
            return list;
        }
      }
    },
    parseComprehensionFor_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(FOR);
      this.eat_(OPEN_PAREN);
      var left = this.parseForBinding_();
      this.eatId_(OF);
      var iterator = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      return new ComprehensionFor(this.getTreeLocation_(start), left, iterator);
    },
    parseComprehensionIf_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IF);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      return new ComprehensionIf(this.getTreeLocation_(start), expression);
    },
    parseObjectLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var result = [];
      this.eat_(OPEN_CURLY);
      while (this.peekPropertyDefinition_(this.peekType_())) {
        var propertyDefinition = this.parsePropertyDefinition();
        result.push(propertyDefinition);
        if (!this.eatIf_(COMMA)) break;
      }
      this.eat_(CLOSE_CURLY);
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
    },
    parsePropertyDefinition: function() {
      var start = this.getTreeStartLocation_();
      var isGenerator = false;
      var isStatic = false;
      if (parseOptions.generators && parseOptions.propertyMethods && this.peek_(STAR)) {
        return this.parseGeneratorMethod_(start, isStatic);
      }
      var token = this.peekToken_();
      var name = this.parsePropertyName_();
      if (parseOptions.propertyMethods && this.peek_(OPEN_PAREN)) return this.parseMethod_(start, isStatic, isGenerator, name);
      if (this.eatIf_(COLON)) {
        var value = this.parseAssignmentExpression();
        return new PropertyNameAssignment(this.getTreeLocation_(start), name, value);
      }
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME) {
        var nameLiteral = name.literalToken;
        if (nameLiteral.value === GET && this.peekPropertyName_(type)) {
          return this.parseGetAccessor_(start, isStatic);
        }
        if (nameLiteral.value === SET && this.peekPropertyName_(type)) {
          return this.parseSetAccessor_(start, isStatic);
        }
        if (parseOptions.propertyNameShorthand && nameLiteral.type === IDENTIFIER) {
          if (this.peek_(EQUAL)) {
            token = this.nextToken_();
            var expr = this.parseAssignmentExpression();
            return this.coverInitialisedName_ = new CoverInitialisedName(this.getTreeLocation_(start), nameLiteral, token, expr);
          }
          return new PropertyNameShorthand(this.getTreeLocation_(start), nameLiteral);
        }
      }
      if (name.type === COMPUTED_PROPERTY_NAME) token = this.peekToken_();
      return this.parseUnexpectedToken_(token);
    },
    parseClassElement_: function() {
      var start = this.getTreeStartLocation_();
      var type = this.peekType_();
      var isStatic = false,
          isGenerator = false;
      switch (type) {
        case STATIC:
          var staticToken = this.nextToken_();
          type = this.peekType_();
          switch (type) {
            case OPEN_PAREN:
              var name = new LiteralPropertyName(start, staticToken);
              return this.parseMethod_(start, isStatic, isGenerator, name);
            default:
              isStatic = true;
              if (type === STAR && parseOptions.generators) return this.parseGeneratorMethod_(start, true);
              return this.parseGetSetOrMethod_(start, isStatic);
          }
          break;
        case STAR:
          return this.parseGeneratorMethod_(start, isStatic);
        default:
          return this.parseGetSetOrMethod_(start, isStatic);
      }
    },
    parseGeneratorMethod_: function(start, isStatic) {
      var isGenerator = true;
      this.eat_(STAR);
      var name = this.parsePropertyName_();
      return this.parseMethod_(start, isStatic, isGenerator, name);
    },
    parseMethod_: function(start, isStatic, isGenerator, name) {
      this.eat_(OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var functionBody = this.parseFunctionBody_(isGenerator, formalParameterList);
      return new PropertyMethodAssignment(this.getTreeLocation_(start), isStatic, isGenerator, name, formalParameterList, typeAnnotation, functionBody);
    },
    parseGetSetOrMethod_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === GET && this.peekPropertyName_(type)) {
        return this.parseGetAccessor_(start, isStatic);
      }
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === SET && this.peekPropertyName_(type)) {
        return this.parseSetAccessor_(start, isStatic);
      }
      return this.parseMethod_(start, isStatic, isGenerator, name);
    },
    parseGetAccessor_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var body = this.parseFunctionBody_(isGenerator, null);
      return new GetAccessor(this.getTreeLocation_(start), isStatic, name, typeAnnotation, body);
    },
    parseSetAccessor_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      var parameter = this.parsePropertySetParameterList_();
      this.eat_(CLOSE_PAREN);
      var body = this.parseFunctionBody_(isGenerator, parameter);
      return new SetAccessor(this.getTreeLocation_(start), isStatic, name, parameter, body);
    },
    peekPropertyDefinition_: function(type) {
      return this.peekPropertyName_(type) || type == STAR && parseOptions.propertyMethods && parseOptions.generators;
    },
    peekPropertyName_: function(type) {
      switch (type) {
        case IDENTIFIER:
        case STRING:
        case NUMBER:
          return true;
        case OPEN_SQUARE:
          return parseOptions.computedPropertyNames;
        default:
          return this.peekToken_().isKeyword();
      }
    },
    peekPredefinedString_: function(string) {
      var token = this.peekToken_();
      return token.type === IDENTIFIER && token.value === string;
    },
    parsePropertySetParameterList_: function() {
      var start = this.getTreeStartLocation_();
      var binding;
      if (this.peekPattern_(this.peekType_())) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      return new FormalParameter(this.getTreeLocation_(start), new BindingElement(this.getTreeLocation_(start), binding, null), typeAnnotation);
    },
    parsePrimaryExpressionStartingWithParen_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_PAREN);
      if (this.peek_(FOR) && parseOptions.generatorComprehension) return this.parseGeneratorComprehension_(start);
      return this.parseCoverFormals_(start);
    },
    parseSyntaxError_: function(message) {
      var start = this.getTreeStartLocation_();
      this.reportError_(message);
      var token = this.nextToken_();
      return new SyntaxErrorTree(this.getTreeLocation_(start), token, message);
    },
    parseUnexpectedToken_: function(name) {
      return this.parseSyntaxError_(("Unexpected token " + name));
    },
    peekExpression_: function(type) {
      switch (type) {
        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          return parseOptions.templateLiterals;
        case BANG:
        case CLASS:
        case DELETE:
        case FALSE:
        case FUNCTION:
        case IDENTIFIER:
        case MINUS:
        case MINUS_MINUS:
        case NEW:
        case NULL:
        case NUMBER:
        case OPEN_CURLY:
        case OPEN_PAREN:
        case OPEN_SQUARE:
        case PLUS:
        case PLUS_PLUS:
        case SLASH:
        case SLASH_EQUAL:
        case STRING:
        case SUPER:
        case THIS:
        case TILDE:
        case TRUE:
        case TYPEOF:
        case VOID:
        case YIELD:
          return true;
        default:
          return false;
      }
    },
    parseExpression: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.IN;
      var start = this.getTreeStartLocation_();
      var result = this.parseAssignmentExpression(expressionIn);
      if (this.peek_(COMMA)) {
        var exprs = [result];
        while (this.eatIf_(COMMA)) {
          exprs.push(this.parseAssignmentExpression(expressionIn));
        }
        return new CommaExpression(this.getTreeLocation_(start), exprs);
      }
      return result;
    },
    peekAssignmentExpression_: function(type) {
      return this.peekExpression_(type);
    },
    parseAssignmentExpression: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.NORMAL;
      var allowCoverGrammar = arguments[1];
      if (this.allowYield_ && this.peek_(YIELD)) return this.parseYieldExpression_();
      var start = this.getTreeStartLocation_();
      var left = this.parseConditional_(expressionIn);
      var type = this.peekType_();
      if (type === ARROW && (left.type === COVER_FORMALS || left.type === IDENTIFIER_EXPRESSION)) {
        return this.parseArrowFunction_(start, left);
      }
      if (this.peekAssignmentOperator_(type)) {
        if (type === EQUAL) left = this.transformLeftHandSideExpression_(left); else left = this.toParenExpression_(left);
        if (!allowCoverGrammar) this.ensureAssignmenExpression_();
        if (!left.isLeftHandSideExpression() && !left.isPattern()) {
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
        }
        var operator = this.nextToken_();
        var right = this.parseAssignmentExpression(expressionIn);
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      left = this.toParenExpression_(left);
      if (!allowCoverGrammar) this.ensureAssignmenExpression_();
      return left;
    },
    ensureAssignmenExpression_: function() {
      if (this.coverInitialisedName_) {
        var token = this.coverInitialisedName_.equalToken;
        this.reportError_(token.location, ("Unexpected token '" + token + "'"));
        this.coverInitialisedName_ = null;
      }
    },
    transformLeftHandSideExpression_: function(tree) {
      switch (tree.type) {
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
          var transformer = new AssignmentPatternTransformer();
          var transformedTree;
          try {
            transformedTree = transformer.transformAny(tree);
          } catch (ex) {
            if (!(ex instanceof AssignmentPatternTransformerError)) throw ex;
          }
          if (transformedTree) {
            this.coverInitialisedName_ = null;
            return transformedTree;
          }
          break;
        case PAREN_EXPRESSION:
          var expression = this.transformLeftHandSideExpression_(tree.expression);
          if (expression !== tree.expression) return new ParenExpression(tree.location, expression);
      }
      return tree;
    },
    peekAssignmentOperator_: function(type) {
      return isAssignmentOperator(type);
    },
    parseConditional_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var condition = this.parseLogicalOR_(expressionIn);
      if (this.eatIf_(QUESTION)) {
        condition = this.toParenExpression_(condition);
        var left = this.parseAssignmentExpression();
        this.eat_(COLON);
        var right = this.parseAssignmentExpression(expressionIn);
        return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right);
      }
      return condition;
    },
    newBinaryOperator_: function(start, left, operator, right) {
      left = this.toParenExpression_(left);
      right = this.toParenExpression_(right);
      return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    },
    parseLogicalOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseLogicalAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(OR)) {
        var right = this.parseLogicalAND_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseLogicalAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AND)) {
        var right = this.parseBitwiseOR_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseXOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(BAR)) {
        var right = this.parseBitwiseXOR_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseXOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(CARET)) {
        var right = this.parseBitwiseAND_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseEquality_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AMPERSAND)) {
        var right = this.parseEquality_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseEquality_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseRelational_(expressionIn);
      while (this.peekEqualityOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseRelational_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekEqualityOperator_: function(type) {
      switch (type) {
        case EQUAL_EQUAL:
        case NOT_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case NOT_EQUAL_EQUAL:
          return true;
      }
      return false;
    },
    parseRelational_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseShiftExpression_();
      while (this.peekRelationalOperator_(expressionIn)) {
        var operator = this.nextToken_();
        var right = this.parseShiftExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekRelationalOperator_: function(expressionIn) {
      switch (this.peekType_()) {
        case OPEN_ANGLE:
        case CLOSE_ANGLE:
        case GREATER_EQUAL:
        case LESS_EQUAL:
        case INSTANCEOF:
          return true;
        case IN:
          return expressionIn == Expression.NORMAL;
        default:
          return false;
      }
    },
    parseShiftExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseAdditiveExpression_();
      while (this.peekShiftOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseAdditiveExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekShiftOperator_: function(type) {
      switch (type) {
        case LEFT_SHIFT:
        case RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT:
          return true;
        default:
          return false;
      }
    },
    parseAdditiveExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseMultiplicativeExpression_();
      while (this.peekAdditiveOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseMultiplicativeExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekAdditiveOperator_: function(type) {
      switch (type) {
        case PLUS:
        case MINUS:
          return true;
        default:
          return false;
      }
    },
    parseMultiplicativeExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseUnaryExpression_();
      while (this.peekMultiplicativeOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseUnaryExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekMultiplicativeOperator_: function(type) {
      switch (type) {
        case STAR:
        case SLASH:
        case PERCENT:
          return true;
        default:
          return false;
      }
    },
    parseUnaryExpression_: function() {
      var start = this.getTreeStartLocation_();
      if (this.peekUnaryOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var operand = this.parseUnaryExpression_();
        operand = this.toParenExpression_(operand);
        return new UnaryExpression(this.getTreeLocation_(start), operator, operand);
      }
      return this.parsePostfixExpression_();
    },
    peekUnaryOperator_: function(type) {
      switch (type) {
        case DELETE:
        case VOID:
        case TYPEOF:
        case PLUS_PLUS:
        case MINUS_MINUS:
        case PLUS:
        case MINUS:
        case TILDE:
        case BANG:
          return true;
        default:
          return false;
      }
    },
    parsePostfixExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseLeftHandSideExpression_();
      while (this.peekPostfixOperator_(this.peekType_())) {
        operand = this.toParenExpression_(operand);
        var operator = this.nextToken_();
        operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator);
      }
      return operand;
    },
    peekPostfixOperator_: function(type) {
      switch (type) {
        case PLUS_PLUS:
        case MINUS_MINUS:
          var token = this.peekTokenNoLineTerminator_();
          return token !== null;
      }
      return false;
    },
    parseLeftHandSideExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseNewExpression_();
      if (!(operand instanceof NewExpression) || operand.args != null) {
        loop: while (true) {
          switch (this.peekType_()) {
            case OPEN_PAREN:
              operand = this.toParenExpression_(operand);
              var args = this.parseArguments_();
              operand = new CallExpression(this.getTreeLocation_(start), operand, args);
              break;
            case OPEN_SQUARE:
              operand = this.toParenExpression_(operand);
              this.nextToken_();
              var member = this.parseExpression();
              this.eat_(CLOSE_SQUARE);
              operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
              break;
            case PERIOD:
              operand = this.toParenExpression_(operand);
              this.nextToken_();
              var memberName = this.eatIdName_();
              operand = new MemberExpression(this.getTreeLocation_(start), operand, memberName);
              break;
            case NO_SUBSTITUTION_TEMPLATE:
            case TEMPLATE_HEAD:
              if (!parseOptions.templateLiterals) break loop;
              operand = this.toParenExpression_(operand);
              operand = this.parseTemplateLiteral_(operand);
              break;
            default:
              break loop;
          }
        }
      }
      return operand;
    },
    parseMemberExpressionNoNew_: function() {
      var start = this.getTreeStartLocation_();
      var operand;
      if (this.peekType_() === FUNCTION) {
        operand = this.parseFunctionExpression_();
      } else {
        operand = this.parsePrimaryExpression_();
      }
      loop: while (true) {
        switch (this.peekType_()) {
          case OPEN_SQUARE:
            operand = this.toParenExpression_(operand);
            this.nextToken_();
            var member = this.parseExpression();
            this.eat_(CLOSE_SQUARE);
            operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
            break;
          case PERIOD:
            operand = this.toParenExpression_(operand);
            this.nextToken_();
            var name;
            name = this.eatIdName_();
            operand = new MemberExpression(this.getTreeLocation_(start), operand, name);
            break;
          case NO_SUBSTITUTION_TEMPLATE:
          case TEMPLATE_HEAD:
            if (!parseOptions.templateLiterals) break loop;
            operand = this.toParenExpression_(operand);
            operand = this.parseTemplateLiteral_(operand);
            break;
          default:
            break loop;
        }
      }
      return operand;
    },
    parseNewExpression_: function() {
      if (this.peek_(NEW)) {
        var start = this.getTreeStartLocation_();
        this.eat_(NEW);
        var operand = this.parseNewExpression_();
        operand = this.toParenExpression_(operand);
        var args = null;
        if (this.peek_(OPEN_PAREN)) {
          args = this.parseArguments_();
        }
        return new NewExpression(this.getTreeLocation_(start), operand, args);
      } else {
        return this.parseMemberExpressionNoNew_();
      }
    },
    parseArguments_: function() {
      var start = this.getTreeStartLocation_();
      var args = [];
      this.eat_(OPEN_PAREN);
      if (!this.peek_(CLOSE_PAREN)) {
        args.push(this.parseArgument_());
        while (this.eatIf_(COMMA)) {
          args.push(this.parseArgument_());
        }
      }
      this.eat_(CLOSE_PAREN);
      return new ArgumentList(this.getTreeLocation_(start), args);
    },
    parseArgument_: function() {
      if (this.peekSpread_(this.peekType_())) return this.parseSpreadExpression_();
      return this.parseAssignmentExpression();
    },
    parseArrowFunction_: function(start, tree) {
      var formals;
      if (tree.type === IDENTIFIER_EXPRESSION) {
        var id = new BindingIdentifier(tree.location, tree.identifierToken);
        var formals = new FormalParameterList(this.getTreeLocation_(start), [new FormalParameter(id.location, new BindingElement(id.location, id, null), null)]);
      } else {
        formals = this.toFormalParameters_(tree);
      }
      this.eat_(ARROW);
      var body = this.parseConciseBody_();
      return new ArrowFunctionExpression(this.getTreeLocation_(start), formals, body);
    },
    parseCoverFormals_: function(start) {
      var expressions = [];
      if (!this.peek_(CLOSE_PAREN)) {
        do {
          var type = this.peekType_();
          if (this.peekRest_(type)) {
            expressions.push(this.parseRestParameter_());
            break;
          } else {
            expressions.push(this.parseAssignmentExpression(Expression.NORMAL, true));
          }
          if (this.eatIf_(COMMA)) continue;
        } while (!this.peek_(CLOSE_PAREN) && !this.isAtEnd());
      }
      this.eat_(CLOSE_PAREN);
      return new CoverFormals(this.getTreeLocation_(start), expressions);
    },
    transformCoverFormals_: function(f, tree) {
      try {
        return f(tree);
      } catch (ex) {
        if (!(ex instanceof CoverFormalsTransformerError)) throw ex;
        this.reportError_(ex.location, ex.message);
        return new SyntaxErrorTree(ex.location, null, ex.message);
      }
    },
    toParenExpression_: function(tree) {
      if (tree.type !== COVER_FORMALS) return tree;
      return this.transformCoverFormals_(toParenExpression, tree);
    },
    toFormalParameters_: function(tree) {
      if (tree.type !== COVER_FORMALS) return tree;
      var transformed = this.transformCoverFormals_(toFormalParameters, tree);
      this.coverInitialisedName_ = null;
      return transformed;
    },
    transformCoverFormalsToArrowFormals_: function(coverFormals) {
      var formals = null;
      try {
        formals = toFormalParameters(coverFormals);
      } catch (ex) {
        if (!(ex instanceof CoverFormalsTransformerError)) throw ex;
      }
      return formals;
    },
    peekArrow_: function(type) {
      return type === ARROW && parseOptions.arrowFunctions;
    },
    parseConciseBody_: function() {
      if (this.peek_(OPEN_CURLY)) return this.parseFunctionBody_();
      return this.parseAssignmentExpression();
    },
    parseGeneratorComprehension_: function(start) {
      var comprehensionList = this.parseComprehensionList_();
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_PAREN);
      return new GeneratorComprehension(this.getTreeLocation_(start), comprehensionList, expression);
    },
    parseForBinding_: function() {
      if (this.peekPattern_(this.peekType_())) return this.parseBindingPattern_();
      return this.parseBindingIdentifier_();
    },
    peekPattern_: function(type) {
      return parseOptions.destructuring && (this.peekObjectPattern_(type) || this.peekArrayPattern_(type));
    },
    peekArrayPattern_: function(type) {
      return type === OPEN_SQUARE;
    },
    peekObjectPattern_: function(type) {
      return type === OPEN_CURLY;
    },
    parseBindingPattern_: function() {
      if (this.peekArrayPattern_(this.peekType_())) return this.parseArrayBindingPattern_();
      return this.parseObjectBindingPattern_();
    },
    parseArrayBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(OPEN_SQUARE);
      var type;
      while ((type = this.peekType_()) === COMMA || this.peekBindingElement_(type) || this.peekRest_(type)) {
        this.parseElisionOpt_(elements);
        if (this.peekRest_(this.peekType_())) {
          elements.push(this.parseBindingRestElement_());
          break;
        } else {
          elements.push(this.parseBindingElement_());
          if (this.peek_(COMMA) && !this.peek_(CLOSE_SQUARE, 1)) {
            this.nextToken_();
          }
        }
      }
      this.eat_(CLOSE_SQUARE);
      return new ArrayPattern(this.getTreeLocation_(start), elements);
    },
    parseBindingElementList_: function(elements) {
      this.parseElisionOpt_(elements);
      elements.push(this.parseBindingElement_());
      while (this.eatIf_(COMMA)) {
        this.parseElisionOpt_(elements);
        elements.push(this.parseBindingElement_());
      }
    },
    parseElisionOpt_: function(elements) {
      while (this.eatIf_(COMMA)) {
        elements.push(null);
      }
    },
    peekBindingElement_: function(type) {
      return this.peekBindingIdentifier_(type) || this.peekPattern_(type);
    },
    parseBindingElement_: function() {
      var initialiser = arguments[0] !== (void 0) ? arguments[0]: Initialiser.OPTIONAL;
      var start = this.getTreeStartLocation_();
      var binding = this.parseBindingElementBinding_();
      var initialiser = this.parseBindingElementInitialiser_(initialiser);
      return new BindingElement(this.getTreeLocation_(start), binding, initialiser);
    },
    parseBindingElementBinding_: function() {
      if (this.peekPattern_(this.peekType_())) return this.parseBindingPattern_();
      return this.parseBindingIdentifier_();
    },
    parseBindingElementInitialiser_: function() {
      var initialiser = arguments[0] !== (void 0) ? arguments[0]: Initialiser.OPTIONAL;
      if (this.peek_(EQUAL) || initialiser === Initialiser.REQUIRED) {
        return this.parseInitialiser_();
      }
      return null;
    },
    parseBindingRestElement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var identifier = this.parseBindingIdentifier_();
      return new SpreadPatternElement(this.getTreeLocation_(start), identifier);
    },
    parseObjectBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(OPEN_CURLY);
      while (this.peekBindingProperty_(this.peekType_())) {
        elements.push(this.parseBindingProperty_());
        if (!this.eatIf_(COMMA)) break;
      }
      this.eat_(CLOSE_CURLY);
      return new ObjectPattern(this.getTreeLocation_(start), elements);
    },
    peekBindingProperty_: function(type) {
      return this.peekBindingIdentifier_(type) || this.peekPropertyName_(type);
    },
    parseBindingProperty_: function() {
      var start = this.getTreeStartLocation_();
      var name = this.parsePropertyName_();
      var requireColon = name.type !== LITERAL_PROPERTY_NAME || !name.literalToken.isStrictKeyword() && name.literalToken.type !== IDENTIFIER;
      if (requireColon || this.peek_(COLON)) {
        this.eat_(COLON);
        var binding = this.parseBindingElement_();
        return new ObjectPatternField(this.getTreeLocation_(start), name, binding);
      }
      var token = name.literalToken;
      if (this.strictMode_ && token.isStrictKeyword()) this.reportReservedIdentifier_(token);
      var binding = new BindingIdentifier(name.location, token);
      var initialiser = null;
      if (this.peek_(EQUAL)) initialiser = this.parseInitialiser_();
      return new BindingElement(this.getTreeLocation_(start), binding, initialiser);
    },
    parseTemplateLiteral_: function(operand) {
      if (!parseOptions.templateLiterals) return this.parseUnexpectedToken_('`');
      var start = operand ? operand.location.start: this.getTreeStartLocation_();
      var token = this.nextToken_();
      var elements = [new TemplateLiteralPortion(token.location, token)];
      if (token.type === NO_SUBSTITUTION_TEMPLATE) {
        return new TemplateLiteralExpression(this.getTreeLocation_(start), operand, elements);
      }
      var expression = this.parseExpression();
      elements.push(new TemplateSubstitution(expression.location, expression));
      while (expression.type !== SYNTAX_ERROR_TREE) {
        token = this.nextTemplateLiteralToken_();
        if (token.type === ERROR || token.type === END_OF_FILE) break;
        elements.push(new TemplateLiteralPortion(token.location, token));
        if (token.type === TEMPLATE_TAIL) break;
        expression = this.parseExpression();
        elements.push(new TemplateSubstitution(expression.location, expression));
      }
      return new TemplateLiteralExpression(this.getTreeLocation_(start), operand, elements);
    },
    parseTypeAnnotationOpt_: function() {
      if (parseOptions.types && this.eatOpt_(COLON)) {
        return this.parseType_();
      }
      return null;
    },
    parseType_: function() {
      var start = this.getTreeStartLocation_();
      var elementType;
      switch (this.peekType_()) {
        case IDENTIFIER:
          elementType = this.parseNamedOrPredefinedType_();
          break;
        case NEW:
          elementType = this.parseConstructorType_();
          break;
        case OPEN_CURLY:
          elementType = this.parseObjectType_();
          break;
        case OPEN_PAREN:
          elementType = this.parseFunctionType_();
          break;
        case VOID:
          var token = this.nextToken_();
          return new PredefinedType(this.getTreeLocation_(start), token);
        default:
          return this.parseUnexpectedToken_(this.peekToken_());
      }
      return this.parseArrayTypeSuffix_(start, elementType);
    },
    parseArrayTypeSuffix_: function(start, elementType) {
      return elementType;
    },
    parseConstructorType_: function() {
      throw 'NYI';
    },
    parseObjectType_: function() {
      throw 'NYI';
    },
    parseFunctionType_: function() {
      throw 'NYI';
    },
    parseNamedOrPredefinedType_: function() {
      var start = this.getTreeStartLocation_();
      switch (this.peekToken_().value) {
        case ANY:
        case NUMBER:
        case BOOL:
        case STRING:
          var token = this.nextToken_();
          return new PredefinedType(this.getTreeLocation_(start), token);
        default:
          return this.parseTypeName_();
      }
    },
    parseTypeName_: function() {
      var start = this.getTreeStartLocation_();
      var typeName = new TypeName(this.getTreeLocation_(start), null, this.eatId_());
      while (this.eatIf_(PERIOD)) {
        var memberName = this.eatIdName_();
        typeName = new TypeName(this.getTreeLocation_(start), typeName, memberName);
      }
      return typeName;
    },
    eatPossibleImplicitSemiColon_: function() {
      var token = this.peekTokenNoLineTerminator_();
      if (!token) return;
      switch (token.type) {
        case SEMI_COLON:
          this.nextToken_();
          return;
        case END_OF_FILE:
        case CLOSE_CURLY:
          return;
      }
      this.reportError_('Semi-colon expected');
    },
    peekImplicitSemiColon_: function() {
      switch (this.peekType_()) {
        case SEMI_COLON:
        case CLOSE_CURLY:
        case END_OF_FILE:
          return true;
      }
      var token = this.peekTokenNoLineTerminator_();
      return token === null;
    },
    eatOpt_: function(expectedTokenType) {
      if (this.peek_(expectedTokenType)) return this.nextToken_();
      return null;
    },
    eatIdOpt_: function() {
      return this.peek_(IDENTIFIER) ? this.eatId_(): null;
    },
    eatId_: function() {
      var expected = arguments[0];
      var token = this.nextToken_();
      if (!token) {
        if (expected) this.reportError_(this.peekToken_(), ("expected '" + expected + "'"));
        return null;
      }
      if (token.type === IDENTIFIER) return token;
      if (token.isStrictKeyword()) {
        if (this.strictMode_) {
          this.reportReservedIdentifier_(token);
        } else {
          return new IdentifierToken(token.location, token.type);
        }
      } else {
        this.reportExpectedError_(token, expected || 'identifier');
      }
      return token;
    },
    eatIdName_: function() {
      var t = this.nextToken_();
      if (t.type != IDENTIFIER) {
        if (!t.isKeyword()) {
          this.reportExpectedError_(t, 'identifier');
          return null;
        }
        return new IdentifierToken(t.location, t.type);
      }
      return t;
    },
    eat_: function(expectedTokenType) {
      var token = this.nextToken_();
      if (token.type != expectedTokenType) {
        this.reportExpectedError_(token, expectedTokenType);
        return null;
      }
      return token;
    },
    eatIf_: function(expectedTokenType) {
      if (this.peek_(expectedTokenType)) {
        this.nextToken_();
        return true;
      }
      return false;
    },
    reportExpectedError_: function(token, expected) {
      this.reportError_(token, "'" + expected + "' expected");
    },
    getTreeStartLocation_: function() {
      return this.peekToken_().location.start;
    },
    getTreeEndLocation_: function() {
      return this.scanner_.lastToken.location.end;
    },
    getTreeLocation_: function(start) {
      return new SourceRange(start, this.getTreeEndLocation_());
    },
    nextToken_: function() {
      return this.scanner_.nextToken();
    },
    nextRegularExpressionLiteralToken_: function() {
      return this.scanner_.nextRegularExpressionLiteralToken();
    },
    nextTemplateLiteralToken_: function() {
      return this.scanner_.nextTemplateLiteralToken();
    },
    isAtEnd: function() {
      return this.scanner_.isAtEnd();
    },
    peek_: function(expectedType, opt_index) {
      return this.peekToken_(opt_index).type === expectedType;
    },
    peekType_: function() {
      return this.peekToken_().type;
    },
    peekToken_: function(opt_index) {
      return this.scanner_.peekToken(opt_index);
    },
    peekTokenNoLineTerminator_: function() {
      return this.scanner_.peekTokenNoLineTerminator();
    },
    reportError_: function(var_args) {
      if (arguments.length == 1) {
        this.errorReporter_.reportError(this.scanner_.getPosition(), arguments[0]);
      } else {
        var location = arguments[0];
        if (location instanceof Token) {
          location = location.location;
        }
        this.errorReporter_.reportError(location.start, arguments[1]);
      }
    },
    reportReservedIdentifier_: function(token) {
      this.reportError_(token, (token.type + " is a reserved identifier"));
    }
  }, {});
  return {get Parser() {
      return Parser;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/uid", function() {
  "use strict";
  var uidCounter = 0;
  function getUid() {
    return uidCounter++;
  }
  return {get getUid() {
      return getUid;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/SourcePosition", function() {
  "use strict";
  var SourcePosition = function(source, offset) {
    this.source = source;
    this.offset = offset;
    this.line_ = - 1;
    this.column_ = - 1;
  };
  SourcePosition = ($traceurRuntime.createClass)(SourcePosition, {
    get line() {
      if (this.line_ === - 1) this.line_ = this.source.lineNumberTable.getLine(this.offset);
      return this.line_;
    },
    get column() {
      if (this.column_ === - 1) this.column_ = this.source.lineNumberTable.getColumn(this.offset);
      return this.column_;
    },
    toString: function() {
      var name = this.source ? this.source.name: '';
      return (name + ":" + (this.line + 1) + ":" + (this.column + 1));
    }
  }, {});
  return {get SourcePosition() {
      return SourcePosition;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/LineNumberTable", function() {
  "use strict";
  var SourcePosition = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/SourcePosition").SourcePosition;
  var SourceRange = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/SourceRange").SourceRange;
  var isLineTerminator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Scanner").isLineTerminator;
  var MAX_INT_REPRESENTATION = 9007199254740992;
  function computeLineStartOffsets(source) {
    var lineStartOffsets = [0];
    var k = 1;
    for (var index = 0; index < source.length; index++) {
      var code = source.charCodeAt(index);
      if (isLineTerminator(code)) {
        if (code === 13 && source.charCodeAt(index + 1) === 10) {
          index++;
        }
        lineStartOffsets[k++] = index + 1;
      }
    }
    lineStartOffsets[k++] = MAX_INT_REPRESENTATION;
    return lineStartOffsets;
  }
  var LineNumberTable = function(sourceFile) {
    this.sourceFile_ = sourceFile;
    this.lineStartOffsets_ = null;
    this.lastLine_ = 0;
    this.lastOffset_ = - 1;
  };
  LineNumberTable = ($traceurRuntime.createClass)(LineNumberTable, {
    ensureLineStartOffsets_: function() {
      if (!this.lineStartOffsets_) {
        this.lineStartOffsets_ = computeLineStartOffsets(this.sourceFile_.contents);
      }
    },
    getSourcePosition: function(offset) {
      return new SourcePosition(this.sourceFile_, offset);
    },
    getLine: function(offset) {
      if (offset === this.lastOffset_) return this.lastLine_;
      this.ensureLineStartOffsets_();
      if (offset < 0) return 0;
      var line;
      if (offset < this.lastOffset_) {
        for (var i = this.lastLine_; i >= 0; i--) {
          if (this.lineStartOffsets_[i] <= offset) {
            line = i;
            break;
          }
        }
      } else {
        for (var i = this.lastLine_; true; i++) {
          if (this.lineStartOffsets_[i] > offset) {
            line = i - 1;
            break;
          }
        }
      }
      this.lastLine_ = line;
      this.lastOffset_ = offset;
      return line;
    },
    offsetOfLine: function(line) {
      this.ensureLineStartOffsets_();
      return this.lineStartOffsets_[line];
    },
    getColumn: function(offset) {
      var line = this.getLine(offset);
      return offset - this.lineStartOffsets_[line];
    },
    getSourceRange: function(startOffset, endOffset) {
      return new SourceRange(this.getSourcePosition(startOffset), this.getSourcePosition(endOffset));
    }
  }, {});
  return {get LineNumberTable() {
      return LineNumberTable;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/SourceFile", function() {
  "use strict";
  var LineNumberTable = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LineNumberTable").LineNumberTable;
  var getUid = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/uid").getUid;
  var SourceFile = function(name, contents) {
    this.name = name;
    this.contents = contents;
    this.lineNumberTable = new LineNumberTable(this);
    this.uid = getUid();
  };
  SourceFile = ($traceurRuntime.createClass)(SourceFile, {}, {});
  return {get SourceFile() {
      return SourceFile;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/ArrayMap", function() {
  "use strict";
  var ArrayMap = function() {
    this.values_ = [];
    this.keys_ = [];
  };
  ArrayMap = ($traceurRuntime.createClass)(ArrayMap, {
    has: function(key) {
      return this.keys_.indexOf(key) != - 1;
    },
    get: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == - 1) {
        return undefined;
      }
      return this.values_[index];
    },
    set: function(key, value) {
      var index = this.keys_.indexOf(key);
      if (index == - 1) {
        this.keys_.push(key);
        this.values_.push(value);
      } else {
        this.values_[index] = value;
      }
    },
    addAll: function(other) {
      var keys = other.keys();
      var values = other.values();
      for (var i = 0; i < keys.length; i++) {
        this.set(keys[i], values[i]);
      }
    },
    remove: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == - 1) {
        return;
      }
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
    },
    keys: function() {
      return this.keys_.concat();
    },
    values: function() {
      return this.values_.concat();
    }
  }, {});
  return {get ArrayMap() {
      return ArrayMap;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/ErrorReporter", function() {
  "use strict";
  var ErrorReporter = function() {
    this.hadError_ = false;
  };
  ErrorReporter = ($traceurRuntime.createClass)(ErrorReporter, {
    reportError: function(location, format) {
      for (var args = [],
          $__84 = 2; $__84 < arguments.length; $__84++) args[$__84 - 2] = arguments[$__84];
      this.hadError_ = true;
      this.reportMessageInternal(location, format, args);
    },
    reportMessageInternal: function(location, format, args) {
      var $__85;
      if (location) format = (location + ": " + format);
      ($__85 = console).error.apply($__85, $traceurRuntime.spread([format], args));
    },
    hadError: function() {
      return this.hadError_;
    },
    clearError: function() {
      this.hadError_ = false;
    }
  }, {});
  ErrorReporter.format = function(location, text) {
    var args = arguments[2];
    var i = 0;
    text = text.replace(/%./g, function(s) {
      switch (s) {
        case '%s':
          return args && args[i++];
        case '%%':
          return '%';
      }
      return s;
    });
    if (location) text = (location + ": " + text);
    return text;
  };
  return {get ErrorReporter() {
      return ErrorReporter;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/MutedErrorReporter", function() {
  "use strict";
  var ErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ErrorReporter").ErrorReporter;
  var MutedErrorReporter = function() {
    $traceurRuntime.defaultSuperCall(this, $MutedErrorReporter.prototype, arguments);
  };
  var $MutedErrorReporter = ($traceurRuntime.createClass)(MutedErrorReporter, {reportMessageInternal: function(location, format, args) {}}, {}, ErrorReporter);
  return {get MutedErrorReporter() {
      return MutedErrorReporter;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/PlaceholderParser", function() {
  "use strict";
  var ArrayMap = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ArrayMap").ArrayMap;
  var $__93 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARGUMENT_LIST = $__93.ARGUMENT_LIST,
      BLOCK = $__93.BLOCK,
      EXPRESSION_STATEMENT = $__93.EXPRESSION_STATEMENT,
      IDENTIFIER_EXPRESSION = $__93.IDENTIFIER_EXPRESSION;
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var MutedErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/MutedErrorReporter").MutedErrorReporter;
  var ParseTree = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTree").ParseTree;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var Parser = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Parser").Parser;
  var $__93 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      LiteralExpression = $__93.LiteralExpression,
      LiteralPropertyName = $__93.LiteralPropertyName,
      PropertyMethodAssignment = $__93.PropertyMethodAssignment,
      PropertyNameAssignment = $__93.PropertyNameAssignment,
      PropertyNameShorthand = $__93.PropertyNameShorthand;
  var SourceFile = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/SourceFile").SourceFile;
  var IDENTIFIER = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").IDENTIFIER;
  var $__93 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArrayLiteralExpression = $__93.createArrayLiteralExpression,
      createBindingIdentifier = $__93.createBindingIdentifier,
      createBlock = $__93.createBlock,
      createBooleanLiteral = $__93.createBooleanLiteral,
      createCommaExpression = $__93.createCommaExpression,
      createExpressionStatement = $__93.createExpressionStatement,
      createFunctionBody = $__93.createFunctionBody,
      createGetAccessor = $__93.createGetAccessor,
      createIdentifierExpression = $__93.createIdentifierExpression,
      createIdentifierToken = $__93.createIdentifierToken,
      createMemberExpression = $__93.createMemberExpression,
      createNullLiteral = $__93.createNullLiteral,
      createNumberLiteral = $__93.createNumberLiteral,
      createParenExpression = $__93.createParenExpression,
      createSetAccessor = $__93.createSetAccessor,
      createStringLiteral = $__93.createStringLiteral,
      createVoid0 = $__93.createVoid0;
  var NOT_FOUND = {};
  var PREFIX = '$__placeholder__';
  var cache = new ArrayMap();
  function parseExpression(sourceLiterals) {
    for (var values = [],
        $__89 = 1; $__89 < arguments.length; $__89++) values[$__89 - 1] = arguments[$__89];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseExpression(sourceLiterals);
    }));
  }
  function parseStatement(sourceLiterals) {
    for (var values = [],
        $__90 = 1; $__90 < arguments.length; $__90++) values[$__90 - 1] = arguments[$__90];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatement(sourceLiterals);
    }));
  }
  function parseStatements(sourceLiterals) {
    for (var values = [],
        $__91 = 1; $__91 < arguments.length; $__91++) values[$__91 - 1] = arguments[$__91];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatements(sourceLiterals);
    }));
  }
  function parsePropertyDefinition(sourceLiterals) {
    for (var values = [],
        $__92 = 1; $__92 < arguments.length; $__92++) values[$__92 - 1] = arguments[$__92];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parsePropertyDefinition(sourceLiterals);
    }));
  }
  function parse(sourceLiterals, values, doParse) {
    var tree = cache.get(sourceLiterals);
    if (!tree) {
      tree = doParse();
      cache.set(sourceLiterals, tree);
    }
    if (!values.length) return tree;
    if (tree instanceof ParseTree) return new PlaceholderTransformer(values).transformAny(tree);
    return new PlaceholderTransformer(values).transformList(tree);
  }
  var counter = 0;
  var PlaceholderParser = function() {};
  PlaceholderParser = ($traceurRuntime.createClass)(PlaceholderParser, {
    parseExpression: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseExpression();
      }));
    },
    parseStatement: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseStatement();
      }));
    },
    parseStatements: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseStatements();
      }));
    },
    parsePropertyDefinition: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parsePropertyDefinition();
      }));
    },
    parse_: function(sourceLiterals, doParse) {
      var source = sourceLiterals[0];
      for (var i = 1; i < sourceLiterals.length; i++) {
        source += PREFIX + (i - 1) + sourceLiterals[i];
      }
      var file = new SourceFile('@traceur/generated/TemplateParser/' + counter++, source);
      var errorReporter = new MutedErrorReporter();
      var parser = new Parser(errorReporter, file);
      var tree = doParse(parser);
      if (errorReporter.hadError() || !tree || !parser.isAtEnd()) throw new Error(("Internal error trying to parse:\n\n" + source));
      return tree;
    }
  }, {});
  function convertValueToExpression(value) {
    if (value instanceof ParseTree) return value;
    if (value instanceof IdentifierToken) return createIdentifierExpression(value);
    if (value instanceof LiteralToken) return new LiteralExpression(value.location, value);
    if (Array.isArray(value)) {
      if (value[0]instanceof ParseTree) {
        if (value.length === 1) return value[0];
        if (value[0].isStatement()) return createBlock(value); else return createParenExpression(createCommaExpression(value));
      }
      return createArrayLiteralExpression(value.map(convertValueToExpression));
    }
    if (value === null) return createNullLiteral();
    if (value === undefined) return createVoid0();
    switch (typeof value) {
      case 'string':
        return createStringLiteral(value);
      case 'boolean':
        return createBooleanLiteral(value);
      case 'number':
        return createNumberLiteral(value);
    }
    throw new Error('Not implemented');
  }
  function convertValueToIdentifierToken(value) {
    if (value instanceof IdentifierToken) return value;
    return createIdentifierToken(value);
  }
  var PlaceholderTransformer = function(values) {
    $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "constructor", []);
    this.values = values;
  };
  var $PlaceholderTransformer = ($traceurRuntime.createClass)(PlaceholderTransformer, {
    getValueAt: function(index) {
      return this.values[index];
    },
    getValue_: function(str) {
      if (str.indexOf(PREFIX) !== 0) return NOT_FOUND;
      return this.getValueAt(Number(str.slice(PREFIX.length)));
    },
    transformIdentifierExpression: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND) return tree;
      return convertValueToExpression(value);
    },
    transformBindingIdentifier: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND) return tree;
      return createBindingIdentifier(value);
    },
    transformExpressionStatement: function(tree) {
      if (tree.expression.type === IDENTIFIER_EXPRESSION) {
        var transformedExpression = this.transformIdentifierExpression(tree.expression);
        if (transformedExpression === tree.expression) return tree;
        if (transformedExpression.isStatement()) return transformedExpression;
        return createExpressionStatement(transformedExpression);
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformExpressionStatement", [tree]);
    },
    transformBlock: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0]) return tree;
        if (transformedStatement.type === BLOCK) return transformedStatement;
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformBlock", [tree]);
    },
    transformFunctionBody: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0]) return tree;
        if (transformedStatement.type === BLOCK) return createFunctionBody(transformedStatement.statements);
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformFunctionBody", [tree]);
    },
    transformMemberExpression: function(tree) {
      var value = this.getValue_(tree.memberName.value);
      if (value === NOT_FOUND) return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformMemberExpression", [tree]);
      var operand = this.transformAny(tree.operand);
      return createMemberExpression(operand, value);
    },
    transformLiteralPropertyName: function(tree) {
      if (tree.literalToken.type === IDENTIFIER) {
        var value = this.getValue_(tree.literalToken.value);
        if (value !== NOT_FOUND) {
          return new LiteralPropertyName(null, convertValueToIdentifierToken(value));
        }
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformLiteralPropertyName", [tree]);
    },
    transformArgumentList: function(tree) {
      if (tree.args.length === 1 && tree.args[0].type === IDENTIFIER_EXPRESSION) {
        var arg0 = this.transformAny(tree.args[0]);
        if (arg0 === tree.args[0]) return tree;
        if (arg0.type === ARGUMENT_LIST) return arg0;
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformArgumentList", [tree]);
    }
  }, {}, ParseTreeTransformer);
  return {
    get parseExpression() {
      return parseExpression;
    },
    get parseStatement() {
      return parseStatement;
    },
    get parseStatements() {
      return parseStatements;
    },
    get parsePropertyDefinition() {
      return parsePropertyDefinition;
    },
    get PlaceholderParser() {
      return PlaceholderParser;
    },
    get PlaceholderTransformer() {
      return PlaceholderTransformer;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/PrependStatements", function() {
  "use strict";
  var $__95 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      EXPRESSION_STATEMENT = $__95.EXPRESSION_STATEMENT,
      LITERAL_EXPRESSION = $__95.LITERAL_EXPRESSION;
  var STRING = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").STRING;
  function isStringExpressionStatement(tree) {
    return tree.type === EXPRESSION_STATEMENT && tree.expression.type === LITERAL_EXPRESSION && tree.expression.literalToken.type === STRING;
  }
  function prependStatements(statements) {
    for (var statementsToPrepend = [],
        $__94 = 1; $__94 < arguments.length; $__94++) statementsToPrepend[$__94 - 1] = arguments[$__94];
    if (!statements.length) return statementsToPrepend;
    if (!statementsToPrepend.length) return statements;
    var transformed = [];
    var inProlog = true;
    statements.forEach((function(statement) {
      var $__96;
      if (inProlog && !isStringExpressionStatement(statement)) {
        ($__96 = transformed).push.apply($__96, $traceurRuntime.toObject(statementsToPrepend));
        inProlog = false;
      }
      transformed.push(statement);
    }));
    return transformed;
  }
  return {get prependStatements() {
      return prependStatements;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/TempVarTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__98 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      Module = $__98.Module,
      Script = $__98.Script;
  var ARGUMENTS = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").ARGUMENTS;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var $__98 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createFunctionBody = $__98.createFunctionBody,
      createThisExpression = $__98.createThisExpression,
      createIdentifierExpression = $__98.createIdentifierExpression,
      createVariableDeclaration = $__98.createVariableDeclaration,
      createVariableDeclarationList = $__98.createVariableDeclarationList,
      createVariableStatement = $__98.createVariableStatement;
  var prependStatements = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PrependStatements").prependStatements;
  function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars) throw new Error('Invalid use of addTempVar');
    return vars;
  }
  var TempVarStatement = function(name, initialiser) {
    this.name = name;
    this.initialiser = initialiser;
  };
  TempVarStatement = ($traceurRuntime.createClass)(TempVarStatement, {}, {});
  var TempScope = function() {
    this.thisName = null;
    this.argumentName = null;
    this.identifiers = [];
  };
  TempScope = ($traceurRuntime.createClass)(TempScope, {
    push: function(identifier) {
      this.identifiers.push(identifier);
    },
    pop: function() {
      return this.identifiers.pop();
    },
    release: function(obj) {
      for (var i = this.identifiers.length - 1; i >= 0; i--) {
        obj.release_(this.identifiers[i]);
      }
    }
  }, {});
  var TempVarTransformer = function(identifierGenerator) {
    $traceurRuntime.superCall(this, $TempVarTransformer.prototype, "constructor", []);
    this.identifierGenerator = identifierGenerator;
    this.tempVarStack_ = [[]];
    this.tempScopeStack_ = [new TempScope()];
    this.namePool_ = [];
  };
  var $TempVarTransformer = ($traceurRuntime.createClass)(TempVarTransformer, {
    transformStatements_: function(statements) {
      this.tempVarStack_.push([]);
      var transformedStatements = this.transformList(statements);
      var vars = this.tempVarStack_.pop();
      if (!vars.length) return transformedStatements;
      var seenNames = Object.create(null);
      vars = vars.filter((function(tempVarStatement) {
        var $__98 = tempVarStatement,
            name = $__98.name,
            initialiser = $__98.initialiser;
        if (name in seenNames) {
          if (seenNames[name].initialiser || initialiser) throw new Error('Invalid use of TempVarTransformer');
          return false;
        }
        seenNames[name] = tempVarStatement;
        return true;
      }));
      var variableStatement = createVariableStatement(createVariableDeclarationList(VAR, vars.map((function($__98) {
        var name = $__98.name,
            initialiser = $__98.initialiser;
        return createVariableDeclaration(name, initialiser);
      }))));
      return prependStatements(transformedStatements, variableStatement);
    },
    transformScript: function(tree) {
      var scriptItemList = this.transformStatements_(tree.scriptItemList);
      if (scriptItemList == tree.scriptItemList) {
        return tree;
      }
      return new Script(tree.location, scriptItemList, tree.moduleName);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformStatements_(tree.scriptItemList);
      if (scriptItemList == tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList, tree.moduleName);
    },
    transformFunctionBody: function(tree) {
      this.pushTempVarState();
      var statements = this.transformStatements_(tree.statements);
      this.popTempVarState();
      if (statements == tree.statements) return tree;
      return createFunctionBody(statements);
    },
    getTempIdentifier: function() {
      var name = this.namePool_.length ? this.namePool_.pop(): this.identifierGenerator.generateUniqueIdentifier();
      this.tempScopeStack_[this.tempScopeStack_.length - 1].push(name);
      return name;
    },
    addTempVar: function() {
      var initialiser = arguments[0] !== (void 0) ? arguments[0]: null;
      var vars = getVars(this);
      var uid = this.getTempIdentifier();
      vars.push(new TempVarStatement(uid, initialiser));
      return uid;
    },
    addTempVarForThis: function() {
      var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
      return tempScope.thisName || (tempScope.thisName = this.addTempVar(createThisExpression()));
    },
    addTempVarForArguments: function() {
      var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
      return tempScope.argumentName || (tempScope.argumentName = this.addTempVar(createIdentifierExpression(ARGUMENTS)));
    },
    pushTempVarState: function() {
      this.tempScopeStack_.push(new TempScope());
    },
    popTempVarState: function() {
      this.tempScopeStack_.pop().release(this);
    },
    release_: function(name) {
      this.namePool_.push(name);
    }
  }, {}, ParseTreeTransformer);
  return {get TempVarTransformer() {
      return TempVarTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/symbols/Symbol", function() {
  "use strict";
  var Symbol = function(type, tree) {
    this.type = type;
    this.tree = tree;
  };
  Symbol = ($traceurRuntime.createClass)(Symbol, {}, {});
  return {get Symbol() {
      return Symbol;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/symbols/SymbolType", function() {
  "use strict";
  var EXPORT = 'EXPORT';
  var MODULE = 'MODULE';
  return {
    get EXPORT() {
      return EXPORT;
    },
    get MODULE() {
      return MODULE;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/semantics/symbols/ExportSymbol", function() {
  "use strict";
  var Symbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/Symbol").Symbol;
  var EXPORT = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/SymbolType").EXPORT;
  var ExportSymbol = function(name, tree) {
    $traceurRuntime.superCall(this, $ExportSymbol.prototype, "constructor", [EXPORT, tree]);
    this.name = name;
  };
  var $ExportSymbol = ($traceurRuntime.createClass)(ExportSymbol, {}, {}, Symbol);
  return {get ExportSymbol() {
      return ExportSymbol;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/ModuleVisitor", function() {
  "use strict";
  var ParseTree = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTree").ParseTree;
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var $__104 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      MODULE_DECLARATION = $__104.MODULE_DECLARATION,
      EXPORT_DECLARATION = $__104.EXPORT_DECLARATION,
      IMPORT_DECLARATION = $__104.IMPORT_DECLARATION;
  var Symbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/Symbol").Symbol;
  var ModuleVisitor = function(reporter, loader, moduleSymbol) {
    this.reporter = reporter;
    this.loader_ = loader;
    this.moduleSymbol = moduleSymbol;
  };
  ModuleVisitor = ($traceurRuntime.createClass)(ModuleVisitor, {
    getModuleSymbolForModuleSpecifier: function(tree) {
      var name = tree.token.processedValue;
      var referrer = this.moduleSymbol.normalizedName;
      var codeUnit = this.loader_.getCodeUnitForModuleSpecifier(name, referrer);
      var moduleSymbol = codeUnit.data.moduleSymbol;
      if (!moduleSymbol) {
        var msg = (name + " is not a module, required by " + referrer);
        this.reportError(tree, msg);
        return null;
      }
      return moduleSymbol;
    },
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitFunctionBody: function(tree) {},
    visitBlock: function(tree) {},
    visitClassDeclaration: function(tree) {},
    visitClassExpression: function(tree) {},
    visitModuleElement_: function(element) {
      switch (element.type) {
        case MODULE_DECLARATION:
        case EXPORT_DECLARATION:
        case IMPORT_DECLARATION:
          this.visitAny(element);
      }
    },
    visitScript: function(tree) {
      tree.scriptItemList.forEach(this.visitModuleElement_, this);
    },
    visitModule: function(tree) {
      tree.scriptItemList.forEach(this.visitModuleElement_, this);
    },
    reportError: function(tree, format) {
      var $__105;
      for (var args = [],
          $__103 = 2; $__103 < arguments.length; $__103++) args[$__103 - 2] = arguments[$__103];
      ($__105 = this.reporter).reportError.apply($__105, $traceurRuntime.spread([tree.location.start, format], args));
    }
  }, {}, ParseTreeVisitor);
  return {get ModuleVisitor() {
      return ModuleVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/ExportVisitor", function() {
  "use strict";
  var ExportSymbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/ExportSymbol").ExportSymbol;
  var ModuleVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ModuleVisitor").ModuleVisitor;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var ExportVisitor = function(reporter, loaderHooks, moduleSymbol) {
    $traceurRuntime.superCall(this, $ExportVisitor.prototype, "constructor", [reporter, loaderHooks, moduleSymbol]);
    this.inExport_ = false;
    this.moduleSpecifier = null;
  };
  var $ExportVisitor = ($traceurRuntime.createClass)(ExportVisitor, {
    addExport_: function(name, tree) {
      assert(typeof name == 'string');
      if (this.inExport_) this.addExport(name, tree);
    },
    addExport: function(name, tree) {
      var moduleSymbol = this.moduleSymbol;
      if (moduleSymbol.hasExport(name)) {
        var previousExport = moduleSymbol.getExport(name).tree;
        this.reportError(tree, ("Duplicate export of '" + name + "'"));
        this.reportError(previousExport, ("'" + name + "' was previously exported here"));
        return;
      }
      moduleSymbol.addExport(new ExportSymbol(name, tree));
    },
    visitClassDeclaration: function(tree) {
      this.addExport_(tree.name.identifierToken.value, tree);
    },
    visitExportDeclaration: function(tree) {
      this.inExport_ = true;
      this.visitAny(tree.declaration);
      this.inExport_ = false;
    },
    visitNamedExport: function(tree) {
      this.moduleSpecifier = tree.moduleSpecifier;
      this.visitAny(tree.specifierSet);
      this.moduleSpecifier = null;
    },
    visitExportDefault: function(tree) {
      this.addExport_('default', tree);
    },
    visitExportSpecifier: function(tree) {
      this.addExport_((tree.rhs || tree.lhs).value, tree);
    },
    visitExportStar: function(tree) {
      var $__106 = this;
      var moduleSymbol = this.getModuleSymbolForModuleSpecifier(this.moduleSpecifier);
      moduleSymbol.getExports().forEach((function($__108) {
        var name = $__108.name;
        $__106.addExport(name, tree);
      }));
    },
    visitFunctionDeclaration: function(tree) {
      this.addExport_(tree.name.identifierToken.value, tree);
    },
    visitModuleDeclaration: function(tree) {
      this.addExport_(tree.identifier.value, tree);
    },
    visitVariableDeclaration: function(tree) {
      this.addExport_(tree.lvalue.identifierToken.value, tree);
    }
  }, {}, ModuleVisitor);
  return {get ExportVisitor() {
      return ExportVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/DirectExportVisitor", function() {
  "use strict";
  var ExportSymbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/ExportSymbol").ExportSymbol;
  var ExportVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ExportVisitor").ExportVisitor;
  var DirectExportVisitor = function() {
    $traceurRuntime.superCall(this, $DirectExportVisitor.prototype, "constructor", [null, null, null]);
    this.namedExports = [];
    this.starExports = [];
  };
  var $DirectExportVisitor = ($traceurRuntime.createClass)(DirectExportVisitor, {
    addExport: function(name, tree) {
      this.namedExports.push({
        name: name,
        tree: tree,
        moduleSpecifier: this.moduleSpecifier
      });
    },
    visitExportStar: function(tree) {
      this.starExports.push(this.moduleSpecifier);
    },
    hasExports: function() {
      return this.namedExports.length != 0 || this.starExports.length != 0;
    }
  }, {}, ExportVisitor);
  return {get DirectExportVisitor() {
      return DirectExportVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ModuleTransformer", function() {
  "use strict";
  var $__111 = Object.freeze(Object.defineProperties(["System.registerModule(", ",\n            function() {\n              ", "\n            }\n        );"], {raw: {value: Object.freeze(["System.registerModule(", ",\n            function() {\n              ", "\n            }\n        );"])}})),
      $__112 = Object.freeze(Object.defineProperties(["get ", "() { return ", "; }"], {raw: {value: Object.freeze(["get ", "() { return ", "; }"])}})),
      $__113 = Object.freeze(Object.defineProperties(["return $traceurRuntime.exportStar(", ")"], {raw: {value: Object.freeze(["return $traceurRuntime.exportStar(", ")"])}})),
      $__114 = Object.freeze(Object.defineProperties(["return ", ""], {raw: {value: Object.freeze(["return ", ""])}})),
      $__115 = Object.freeze(Object.defineProperties(["var $__default = ", ""], {raw: {value: Object.freeze(["var $__default = ", ""])}})),
      $__116 = Object.freeze(Object.defineProperties(["System.get(", ")"], {raw: {value: Object.freeze(["System.get(", ")"])}})),
      $__117 = Object.freeze(Object.defineProperties(["$traceurRuntime.getModuleImpl(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.getModuleImpl(", ")"])}}));
  var $__120 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      BindingElement = $__120.BindingElement,
      BindingIdentifier = $__120.BindingIdentifier,
      EmptyStatement = $__120.EmptyStatement,
      LiteralPropertyName = $__120.LiteralPropertyName,
      ObjectPattern = $__120.ObjectPattern,
      ObjectPatternField = $__120.ObjectPatternField,
      Script = $__120.Script;
  var DirectExportVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/DirectExportVisitor").DirectExportVisitor;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__120 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      EXPORT_DEFAULT = $__120.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__120.EXPORT_SPECIFIER;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var $__120 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__120.createArgumentList,
      createBindingIdentifier = $__120.createBindingIdentifier,
      createExpressionStatement = $__120.createExpressionStatement,
      createIdentifierExpression = $__120.createIdentifierExpression,
      createIdentifierToken = $__120.createIdentifierToken,
      createMemberExpression = $__120.createMemberExpression,
      createObjectLiteralExpression = $__120.createObjectLiteralExpression,
      createUseStrictDirective = $__120.createUseStrictDirective,
      createVariableStatement = $__120.createVariableStatement;
  var $__120 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseExpression = $__120.parseExpression,
      parsePropertyDefinition = $__120.parsePropertyDefinition,
      parseStatement = $__120.parseStatement,
      parseStatements = $__120.parseStatements;
  var ModuleTransformer = function(identifierGenerator) {
    $traceurRuntime.superCall(this, $ModuleTransformer.prototype, "constructor", [identifierGenerator]);
    this.exportVisitor_ = new DirectExportVisitor();
    this.moduleSpecifierKind_ = null;
    this.moduleName = null;
  };
  var $ModuleTransformer = ($traceurRuntime.createClass)(ModuleTransformer, {
    getTempVarNameForModuleSpecifier: function(moduleSpecifier) {
      var moduleName = moduleSpecifier.token.processedValue;
      return '$__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
        return '_' + c.charCodeAt(0) + '_';
      }) + '__';
    },
    transformScript: function(tree) {
      this.moduleName = tree.moduleName;
      return $traceurRuntime.superCall(this, $ModuleTransformer.prototype, "transformScript", [tree]);
    },
    transformModule: function(tree) {
      this.moduleName = tree.moduleName;
      this.pushTempVarState();
      var statements = $traceurRuntime.spread([createUseStrictDirective()], this.transformList(tree.scriptItemList), [this.createExportStatement()]);
      this.popTempVarState();
      statements = this.wrapModule(statements);
      return new Script(tree.location, statements);
    },
    wrapModule: function(statements) {
      return parseStatements($__111, this.moduleName, statements);
    },
    getGetterExport: function($__120) {
      var name = $__120.name,
          tree = $__120.tree,
          moduleSpecifier = $__120.moduleSpecifier;
      var returnExpression;
      switch (tree.type) {
        case EXPORT_DEFAULT:
          returnExpression = createIdentifierExpression('$__default');
          break;
        case EXPORT_SPECIFIER:
          if (moduleSpecifier) {
            var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
            returnExpression = createMemberExpression(idName, tree.lhs);
          } else {
            returnExpression = createIdentifierExpression(tree.lhs);
          }
          break;
        default:
          returnExpression = createIdentifierExpression(name);
          break;
      }
      return parsePropertyDefinition($__112, name, returnExpression);
    },
    createExportStatement: function() {
      var $__118 = this;
      var properties = this.exportVisitor_.namedExports.map((function(exp) {
        return $__118.getGetterExport(exp);
      }));
      var object = createObjectLiteralExpression(properties);
      var starExports = this.exportVisitor_.starExports;
      if (starExports.length) {
        var starIdents = starExports.map((function(moduleSpecifier) {
          return createIdentifierExpression($__118.getTempVarNameForModuleSpecifier(moduleSpecifier));
        }));
        var args = createArgumentList.apply(null, $traceurRuntime.spread([object], starIdents));
        return parseStatement($__113, args);
      }
      return parseStatement($__114, object);
    },
    hasExports: function() {
      return this.exportVisitor_.hasExports();
    },
    transformExportDeclaration: function(tree) {
      this.exportVisitor_.visitAny(tree);
      return this.transformAny(tree.declaration);
    },
    transformExportDefault: function(tree) {
      return parseStatement($__115, tree.expression);
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = tree.moduleSpecifier;
      if (moduleSpecifier) {
        var expression = this.transformAny(moduleSpecifier);
        var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
        return createVariableStatement(VAR, idName, expression);
      }
      return new EmptyStatement(null);
    },
    transformModuleSpecifier: function(tree) {
      assert(this.moduleName);
      var name = tree.token.processedValue;
      var normalizedName = System.normalize(name, this.moduleName);
      if (this.moduleSpecifierKind_ === 'module') return parseExpression($__116, normalizedName);
      return parseExpression($__117, normalizedName);
    },
    transformModuleDeclaration: function(tree) {
      this.moduleSpecifierKind_ = 'module';
      var initialiser = this.transformAny(tree.expression);
      return createVariableStatement(VAR, tree.identifier, initialiser);
    },
    transformImportedBinding: function(tree) {
      var bindingElement = new BindingElement(tree.location, tree.binding, null);
      var name = new LiteralPropertyName(null, createIdentifierToken('default'));
      return new ObjectPattern(null, [new ObjectPatternField(null, name, bindingElement)]);
    },
    transformImportDeclaration: function(tree) {
      this.moduleSpecifierKind_ = 'import';
      if (!tree.importClause) return createExpressionStatement(this.transformAny(tree.moduleSpecifier));
      var binding = this.transformAny(tree.importClause);
      var initialiser = this.transformAny(tree.moduleSpecifier);
      return createVariableStatement(VAR, binding, initialiser);
    },
    transformImportSpecifierSet: function(tree) {
      var fields = this.transformList(tree.specifiers);
      return new ObjectPattern(null, fields);
    },
    transformImportSpecifier: function(tree) {
      if (tree.rhs) {
        var binding = new BindingIdentifier(tree.location, tree.rhs);
        var bindingElement = new BindingElement(tree.location, binding, null);
        var name = new LiteralPropertyName(tree.lhs.location, tree.lhs);
        return new ObjectPatternField(tree.location, name, bindingElement);
      }
      return new BindingElement(tree.location, createBindingIdentifier(tree.lhs), null);
    }
  }, {}, TempVarTransformer);
  return {get ModuleTransformer() {
      return ModuleTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/globalThis", function() {
  "use strict";
  var $__121 = Object.freeze(Object.defineProperties(["typeof global !== 'undefined' ? global : this"], {raw: {value: Object.freeze(["typeof global !== 'undefined' ? global : this"])}}));
  var parseExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseExpression;
  var expr;
  function globalThis() {
    if (!expr) expr = parseExpression($__121);
    return expr;
  }
  var $__default = globalThis;
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/FindVisitor", function() {
  "use strict";
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var foundSentinel = {};
  var FindVisitor = function(tree) {
    var keepOnGoing = arguments[1];
    this.found_ = false;
    this.keepOnGoing_ = keepOnGoing;
    try {
      this.visitAny(tree);
    } catch (ex) {
      if (ex !== foundSentinel) throw ex;
    }
  };
  FindVisitor = ($traceurRuntime.createClass)(FindVisitor, {
    get found() {
      return this.found_;
    },
    set found(v) {
      if (v) {
        this.found_ = true;
        if (!this.keepOnGoing_) throw foundSentinel;
      }
    }
  }, {}, ParseTreeVisitor);
  return {get FindVisitor() {
      return FindVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/FindInFunctionScope", function() {
  "use strict";
  var FindVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FindVisitor").FindVisitor;
  var FindInFunctionScope = function() {
    $traceurRuntime.defaultSuperCall(this, $FindInFunctionScope.prototype, arguments);
  };
  var $FindInFunctionScope = ($traceurRuntime.createClass)(FindInFunctionScope, {
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},
    visitPropertyMethodAssignment: function(tree) {}
  }, {}, FindVisitor);
  return {get FindInFunctionScope() {
      return FindInFunctionScope;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/scopeContainsThis", function() {
  "use strict";
  var FindInFunctionScope = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FindInFunctionScope").FindInFunctionScope;
  var FindThis = function() {
    $traceurRuntime.defaultSuperCall(this, $FindThis.prototype, arguments);
  };
  var $FindThis = ($traceurRuntime.createClass)(FindThis, {visitThisExpression: function(tree) {
      this.found = true;
    }}, {}, FindInFunctionScope);
  function scopeContainsThis(tree) {
    var visitor = new FindThis(tree);
    return visitor.found;
  }
  var $__default = scopeContainsThis;
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/AmdTransformer", function() {
  "use strict";
  var $__129 = Object.freeze(Object.defineProperties(["function(", ") {\n      ", "\n    }"], {raw: {value: Object.freeze(["function(", ") {\n      ", "\n    }"])}})),
      $__130 = Object.freeze(Object.defineProperties(["", ".bind(", ")"], {raw: {value: Object.freeze(["", ".bind(", ")"])}})),
      $__131 = Object.freeze(Object.defineProperties(["define(", ", ", ");"], {raw: {value: Object.freeze(["define(", ", ", ");"])}}));
  var ModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ModuleTransformer").ModuleTransformer;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var createBindingIdentifier = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createBindingIdentifier;
  var globalThis = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/globalThis").default;
  var $__133 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseExpression = $__133.parseExpression,
      parseStatements = $__133.parseStatements;
  var scopeContainsThis = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/scopeContainsThis").default;
  var AmdTransformer = function(identifierGenerator) {
    $traceurRuntime.superCall(this, $AmdTransformer.prototype, "constructor", [identifierGenerator]);
    this.dependencies = [];
  };
  var $AmdTransformer = ($traceurRuntime.createClass)(AmdTransformer, {
    wrapModule: function(statements) {
      var depPaths = this.dependencies.map((function(dep) {
        return dep.path;
      }));
      var depLocals = this.dependencies.map((function(dep) {
        return dep.local;
      }));
      var hasTopLevelThis = statements.some(scopeContainsThis);
      var func = parseExpression($__129, depLocals, statements);
      if (hasTopLevelThis) func = parseExpression($__130, func, globalThis());
      return parseStatements($__131, depPaths, func);
    },
    transformModuleSpecifier: function(tree) {
      var localName = this.getTempIdentifier();
      this.dependencies.push({
        path: tree.token,
        local: localName
      });
      return createBindingIdentifier(localName);
    }
  }, {}, ModuleTransformer);
  return {get AmdTransformer() {
      return AmdTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/VariableBinder", function() {
  "use strict";
  var $__135 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARRAY_PATTERN = $__135.ARRAY_PATTERN,
      BINDING_IDENTIFIER = $__135.BINDING_IDENTIFIER,
      FORMAL_PARAMETER = $__135.FORMAL_PARAMETER,
      OBJECT_PATTERN = $__135.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__135.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__135.PAREN_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__135.SPREAD_PATTERN_ELEMENT;
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  function variablesInBlock(tree, includeFunctionScope) {
    var binder = new VariableBinder(includeFunctionScope, tree);
    binder.visitAny(tree);
    return binder.identifiers_;
  }
  ;
  function variablesInFunction(tree) {
    var binder = new VariableBinder(true, tree.functionBody);
    binder.bindVariablesInFunction_(tree);
    return binder.identifiers_;
  }
  ;
  var VariableBinder = function(includeFunctionScope, scope) {
    $traceurRuntime.superCall(this, $VariableBinder.prototype, "constructor", []);
    this.includeFunctionScope_ = includeFunctionScope;
    this.scope_ = scope || null;
    this.block_ = null;
    this.identifiers_ = Object.create(null);
  };
  var $VariableBinder = ($traceurRuntime.createClass)(VariableBinder, {
    bindVariablesInFunction_: function(tree) {
      var parameters = tree.formalParameterList.parameters;
      for (var i = 0; i < parameters.length; i++) {
        this.bindParameter_(parameters[i]);
      }
      this.visitAny(tree.functionBody);
    },
    visitBlock: function(tree) {
      var parentBlock = this.block_;
      this.block_ = tree;
      this.visitList(tree.statements);
      this.block_ = parentBlock;
    },
    visitFunctionDeclaration: function(tree) {
      if (this.block_ == this.scope_) this.bind_(tree.name.identifierToken);
    },
    visitFunctionExpression: function(tree) {},
    visitVariableDeclarationList: function(tree) {
      if ((tree.declarationType == VAR && this.includeFunctionScope_) || (tree.declarationType != VAR && this.block_ == this.scope_)) {
        $traceurRuntime.superCall(this, $VariableBinder.prototype, "visitVariableDeclarationList", [tree]);
      } else {
        var decls = tree.declarations;
        for (var i = 0; i < decls.length; i++) {
          this.visitAny(decls[i].initialiser);
        }
      }
    },
    visitVariableDeclaration: function(tree) {
      this.bindVariableDeclaration_(tree.lvalue);
      $traceurRuntime.superCall(this, $VariableBinder.prototype, "visitVariableDeclaration", [tree]);
    },
    bind_: function(identifier) {
      assert(typeof identifier.value == 'string');
      this.identifiers_[identifier.value] = true;
    },
    bindParameter_: function(parameter) {
      if (parameter.type === FORMAL_PARAMETER) parameter = parameter.parameter;
      if (parameter.isRestParameter()) {
        this.bind_(parameter.identifier);
      } else {
        this.bindVariableDeclaration_(parameter.binding);
      }
    },
    bindVariableDeclaration_: function(tree) {
      switch (tree.type) {
        case BINDING_IDENTIFIER:
          this.bind_(tree.identifierToken);
          break;
        case ARRAY_PATTERN:
          var elements = tree.elements;
          for (var i = 0; i < elements.length; i++) {
            this.bindVariableDeclaration_(elements[i]);
          }
          break;
        case SPREAD_PATTERN_ELEMENT:
          this.bindVariableDeclaration_(tree.lvalue);
          break;
        case OBJECT_PATTERN:
          var fields = tree.fields;
          for (var i = 0; i < fields.length; i++) {
            this.bindVariableDeclaration_(fields[i]);
          }
          break;
        case OBJECT_PATTERN_FIELD:
          var field = tree;
          if (field.element == null) {
            this.bind_(field.name);
          } else {
            this.bindVariableDeclaration_(field.element);
          }
          break;
        case PAREN_EXPRESSION:
          this.bindVariableDeclaration_(tree.expression);
          break;
        default:
          throw new Error('unreachable');
      }
    }
  }, {}, ParseTreeVisitor);
  return {
    get variablesInBlock() {
      return variablesInBlock;
    },
    get variablesInFunction() {
      return variablesInFunction;
    },
    get VariableBinder() {
      return VariableBinder;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/AlphaRenamer", function() {
  "use strict";
  var $__137 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FunctionDeclaration = $__137.FunctionDeclaration,
      FunctionExpression = $__137.FunctionExpression;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__137 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      ARGUMENTS = $__137.ARGUMENTS,
      THIS = $__137.THIS;
  var createIdentifierExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createIdentifierExpression;
  var $__137 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/VariableBinder"),
      variablesInBlock = $__137.variablesInBlock,
      variablesInFunction = $__137.variablesInFunction;
  var AlphaRenamer = function(oldName, newName) {
    $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "constructor", []);
    this.oldName_ = oldName;
    this.newName_ = newName;
  };
  var $AlphaRenamer = ($traceurRuntime.createClass)(AlphaRenamer, {
    transformBlock: function(tree) {
      if (this.oldName_ in variablesInBlock(tree)) {
        return tree;
      } else {
        return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformBlock", [tree]);
      }
    },
    transformIdentifierExpression: function(tree) {
      if (this.oldName_ == tree.identifierToken.value) {
        return createIdentifierExpression(this.newName_);
      } else {
        return tree;
      }
    },
    transformThisExpression: function(tree) {
      if (this.oldName_ !== THIS) return tree;
      return createIdentifierExpression(this.newName_);
    },
    transformFunctionDeclaration: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionDeclaration(tree.location, this.newName_, tree.isGenerator, tree.formalParameterList, tree.typeAnnotation, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree)) return tree;
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionExpression(tree.location, this.newName_, tree.isGenerator, tree.formalParameterList, tree.typeAnnotation, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree)) return tree;
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformFunctionExpression", [tree]);
    },
    getDoNotRecurse: function(tree) {
      return this.oldName_ === ARGUMENTS || this.oldName_ === THIS || this.oldName_ in variablesInFunction(tree);
    },
    transformCatch: function(tree) {
      if (!tree.binding.isPattern() && this.oldName_ === tree.binding.identifierToken.value) {
        return tree;
      }
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformCatch", [tree]);
    }
  }, {rename: function(tree, oldName, newName) {
      return new AlphaRenamer(oldName, newName).transformAny(tree);
    }}, ParseTreeTransformer);
  return {get AlphaRenamer() {
      return AlphaRenamer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/alphaRenameThisAndArguments", function() {
  "use strict";
  var $__139 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      ARGUMENTS = $__139.ARGUMENTS,
      THIS = $__139.THIS;
  var AlphaRenamer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AlphaRenamer").AlphaRenamer;
  var FindInFunctionScope = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FindInFunctionScope").FindInFunctionScope;
  var FindThisOrArguments = function(tree) {
    this.foundThis = false;
    this.foundArguments = false;
    $traceurRuntime.superCall(this, $FindThisOrArguments.prototype, "constructor", [tree]);
  };
  var $FindThisOrArguments = ($traceurRuntime.createClass)(FindThisOrArguments, {
    visitThisExpression: function(tree) {
      this.foundThis = true;
      this.found = this.foundArguments;
    },
    visitIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === ARGUMENTS) {
        this.foundArguments = true;
        this.found = this.foundThis;
      }
    }
  }, {}, FindInFunctionScope);
  var $__default = function alphaRenameThisAndArguments(tempVarTransformer, tree) {
    var finder = new FindThisOrArguments(tree);
    if (finder.foundArguments) {
      var argumentsTempName = tempVarTransformer.addTempVarForArguments();
      tree = AlphaRenamer.rename(tree, ARGUMENTS, argumentsTempName);
    }
    if (finder.foundThis) {
      var thisTempName = tempVarTransformer.addTempVarForThis();
      tree = AlphaRenamer.rename(tree, THIS, thisTempName);
    }
    return tree;
  };
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ComprehensionTransformer", function() {
  "use strict";
  var alphaRenameThisAndArguments = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/alphaRenameThisAndArguments").default;
  var FunctionExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").FunctionExpression;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__141 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      LET = $__141.LET,
      VAR = $__141.VAR;
  var $__141 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      COMPREHENSION_FOR = $__141.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__141.COMPREHENSION_IF;
  var $__141 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createCallExpression = $__141.createCallExpression,
      createEmptyParameterList = $__141.createEmptyParameterList,
      createForOfStatement = $__141.createForOfStatement,
      createFunctionBody = $__141.createFunctionBody,
      createIfStatement = $__141.createIfStatement,
      createParenExpression = $__141.createParenExpression,
      createVariableDeclarationList = $__141.createVariableDeclarationList;
  var options = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").options;
  var ComprehensionTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $ComprehensionTransformer.prototype, arguments);
  };
  var $ComprehensionTransformer = ($traceurRuntime.createClass)(ComprehensionTransformer, {transformComprehension: function(tree, statement, isGenerator) {
      var prefix = arguments[3];
      var suffix = arguments[4];
      var bindingKind = isGenerator || !options.blockBinding ? VAR: LET;
      var statements = prefix ? [prefix]: [];
      for (var i = tree.comprehensionList.length - 1; i >= 0; i--) {
        var item = tree.comprehensionList[i];
        switch (item.type) {
          case COMPREHENSION_IF:
            var expression = this.transformAny(item.expression);
            statement = createIfStatement(expression, statement);
            break;
          case COMPREHENSION_FOR:
            var left = this.transformAny(item.left);
            var iterator = this.transformAny(item.iterator);
            var initialiser = createVariableDeclarationList(bindingKind, left, null);
            statement = createForOfStatement(initialiser, iterator, statement);
            break;
          default:
            throw new Error('Unreachable.');
        }
      }
      statement = alphaRenameThisAndArguments(this, statement);
      statements.push(statement);
      if (suffix) statements.push(suffix);
      var func = new FunctionExpression(null, null, isGenerator, createEmptyParameterList(), null, createFunctionBody(statements));
      return createParenExpression(createCallExpression(func));
    }}, {}, TempVarTransformer);
  return {get ComprehensionTransformer() {
      return ComprehensionTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ArrayComprehensionTransformer", function() {
  "use strict";
  var $__142 = Object.freeze(Object.defineProperties(["var ", " = 0, ", " = [];"], {raw: {value: Object.freeze(["var ", " = 0, ", " = [];"])}})),
      $__143 = Object.freeze(Object.defineProperties(["", "[", "++] = ", ";"], {raw: {value: Object.freeze(["", "[", "++] = ", ";"])}})),
      $__144 = Object.freeze(Object.defineProperties(["return ", ";"], {raw: {value: Object.freeze(["return ", ";"])}}));
  var ComprehensionTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ComprehensionTransformer").ComprehensionTransformer;
  var createIdentifierExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createIdentifierExpression;
  var parseStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseStatement;
  var ArrayComprehensionTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $ArrayComprehensionTransformer.prototype, arguments);
  };
  var $ArrayComprehensionTransformer = ($traceurRuntime.createClass)(ArrayComprehensionTransformer, {transformArrayComprehension: function(tree) {
      this.pushTempVarState();
      var expression = this.transformAny(tree.expression);
      var index = createIdentifierExpression(this.getTempIdentifier());
      var result = createIdentifierExpression(this.getTempIdentifier());
      var tempVarsStatatement = parseStatement($__142, index, result);
      var statement = parseStatement($__143, result, index, expression);
      var returnStatement = parseStatement($__144, result);
      var isGenerator = false;
      var result = this.transformComprehension(tree, statement, isGenerator, tempVarsStatatement, returnStatement);
      this.popTempVarState();
      return result;
    }}, {}, ComprehensionTransformer);
  return {get ArrayComprehensionTransformer() {
      return ArrayComprehensionTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ArrowFunctionTransformer", function() {
  "use strict";
  var FormalParameterList = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").FormalParameterList;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__148 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      FUNCTION_BODY = $__148.FUNCTION_BODY,
      FUNCTION_EXPRESSION = $__148.FUNCTION_EXPRESSION;
  var alphaRenameThisAndArguments = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/alphaRenameThisAndArguments").default;
  var $__148 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createFunctionBody = $__148.createFunctionBody,
      createFunctionExpression = $__148.createFunctionExpression,
      createParenExpression = $__148.createParenExpression,
      createReturnStatement = $__148.createReturnStatement;
  var ArrowFunctionTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $ArrowFunctionTransformer.prototype, arguments);
  };
  var $ArrowFunctionTransformer = ($traceurRuntime.createClass)(ArrowFunctionTransformer, {transformArrowFunctionExpression: function(tree) {
      var parameters;
      if (tree.formalParameters) {
        parameters = this.transformAny(tree.formalParameters).parameters;
      } else {
        parameters = [];
      }
      var alphaRenamed = alphaRenameThisAndArguments(this, tree);
      var functionBody = this.transformAny(alphaRenamed.functionBody);
      if (functionBody.type != FUNCTION_BODY) {
        functionBody = createFunctionBody([createReturnStatement(functionBody)]);
      }
      return createParenExpression(createFunctionExpression(new FormalParameterList(null, parameters), functionBody));
    }}, {}, TempVarTransformer);
  return {get ArrowFunctionTransformer() {
      return ArrowFunctionTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/BlockBindingTransformer", function() {
  "use strict";
  var AlphaRenamer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AlphaRenamer").AlphaRenamer;
  var $__151 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      BINDING_IDENTIFIER = $__151.BINDING_IDENTIFIER,
      BLOCK = $__151.BLOCK,
      VARIABLE_DECLARATION_LIST = $__151.VARIABLE_DECLARATION_LIST;
  var $__151 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FunctionDeclaration = $__151.FunctionDeclaration,
      FunctionExpression = $__151.FunctionExpression;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__151 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      CONST = $__151.CONST,
      LET = $__151.LET,
      VAR = $__151.VAR;
  var $__151 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentExpression = $__151.createAssignmentExpression,
      createBindingIdentifier = $__151.createBindingIdentifier,
      createBlock = $__151.createBlock,
      createCatch = $__151.createCatch,
      createEmptyStatement = $__151.createEmptyStatement,
      createExpressionStatement = $__151.createExpressionStatement,
      createFinally = $__151.createFinally,
      createForInStatement = $__151.createForInStatement,
      createForStatement = $__151.createForStatement,
      createFunctionBody = $__151.createFunctionBody,
      createIdentifierExpression = $__151.createIdentifierExpression,
      createIdentifierToken = $__151.createIdentifierToken,
      createThrowStatement = $__151.createThrowStatement,
      createTryStatement = $__151.createTryStatement,
      createUndefinedExpression = $__151.createUndefinedExpression,
      createVariableDeclaration = $__151.createVariableDeclaration,
      createVariableDeclarationList = $__151.createVariableDeclarationList,
      createVariableStatement = $__151.createVariableStatement;
  var ScopeType = {
    SCRIPT: 'SCRIPT',
    FUNCTION: 'FUNCTION',
    BLOCK: 'BLOCK'
  };
  var Scope = function(parent, type) {
    this.parent = parent;
    this.type = type;
    this.blockVariables = null;
  };
  Scope = ($traceurRuntime.createClass)(Scope, {addBlockScopedVariable: function(value) {
      if (!this.blockVariables) {
        this.blockVariables = Object.create(null);
      }
      this.blockVariables[value] = true;
    }}, {});
  ;
  var Rename = function(oldName, newName) {
    this.oldName = oldName;
    this.newName = newName;
  };
  Rename = ($traceurRuntime.createClass)(Rename, {}, {});
  function renameAll(renames, tree) {
    renames.forEach((function(rename) {
      tree = AlphaRenamer.rename(tree, rename.oldName, rename.newName);
    }));
    return tree;
  }
  function toBlock(statement) {
    return statement.type == BLOCK ? statement: createBlock(statement);
  }
  var BlockBindingTransformer = function(stateAllocator) {
    $traceurRuntime.superCall(this, $BlockBindingTransformer.prototype, "constructor", []);
    this.scope_ = null;
  };
  var $BlockBindingTransformer = ($traceurRuntime.createClass)(BlockBindingTransformer, {
    createScriptScope_: function() {
      return new Scope(this.scope_, ScopeType.SCRIPT);
    },
    createFunctionScope_: function() {
      if (this.scope_ == null) {
        throw new Error('Top level function scope found.');
      }
      return new Scope(this.scope_, ScopeType.FUNCTION);
    },
    createBlockScope_: function() {
      if (this.scope_ == null) {
        throw new Error('Top level block scope found.');
      }
      return new Scope(this.scope_, ScopeType.BLOCK);
    },
    push_: function(scope) {
      this.scope_ = scope;
      return scope;
    },
    pop_: function(scope) {
      if (this.scope_ != scope) {
        throw new Error('BlockBindingTransformer scope mismatch');
      }
      this.scope_ = scope.parent;
    },
    transformBlock: function(tree) {
      var scope = this.push_(this.createBlockScope_());
      var statements = this.transformList(tree.statements);
      if (scope.blockVariables != null) {
        tree = toBlock(this.rewriteAsCatch_(scope.blockVariables, createBlock(statements)));
      } else if (statements != tree.statements) {
        tree = createBlock(statements);
      }
      this.pop_(scope);
      return tree;
    },
    rewriteAsCatch_: function(blockVariables, statement) {
      for (var variable in blockVariables) {
        statement = createTryStatement(createBlock(createThrowStatement(createUndefinedExpression())), createCatch(createBindingIdentifier(variable), toBlock(statement)), null);
      }
      return statement;
    },
    transformClassDeclaration: function(tree) {
      throw new Error('ClassDeclaration should be transformed away.');
    },
    transformForInStatement: function(tree) {
      var treeBody = tree.body;
      var initialiser;
      if (tree.initialiser != null && tree.initialiser.type == VARIABLE_DECLARATION_LIST) {
        var variables = tree.initialiser;
        if (variables.declarations.length != 1) {
          throw new Error('for .. in has != 1 variables');
        }
        var variable = variables.declarations[0];
        var variableName = this.getVariableName_(variable);
        switch (variables.declarationType) {
          case LET:
          case CONST:
            {
              if (variable.initialiser != null) {
                throw new Error('const/let in for-in may not have an initialiser');
              }
              initialiser = createVariableDeclarationList(VAR, ("$" + variableName), null);
              treeBody = this.prependToBlock_(createVariableStatement(LET, variableName, createIdentifierExpression(("$" + variableName))), treeBody);
              break;
            }
          case VAR:
            initialiser = this.transformVariables_(variables);
            break;
          default:
            throw new Error('Unreachable.');
        }
      } else {
        initialiser = this.transformAny(tree.initialiser);
      }
      var result = tree;
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(treeBody);
      if (initialiser != tree.initialiser || collection != tree.collection || body != tree.body) {
        result = createForInStatement(initialiser, collection, body);
      }
      return result;
    },
    prependToBlock_: function(statement, body) {
      if (body.type == BLOCK) {
        var block = body;
        var list = $traceurRuntime.spread([statement], block.statements);
        return createBlock(list);
      } else {
        return createBlock(statement, body);
      }
    },
    transformForStatement: function(tree) {
      var initialiser;
      if (tree.initialiser != null && tree.initialiser.type == VARIABLE_DECLARATION_LIST) {
        var variables = tree.initialiser;
        switch (variables.declarationType) {
          case LET:
          case CONST:
            return this.transformForLet_(tree, variables);
          case VAR:
            initialiser = this.transformVariables_(variables);
            break;
          default:
            throw new Error('Reached unreachable.');
        }
      } else {
        initialiser = this.transformAny(tree.initialiser);
      }
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      var result = tree;
      if (initialiser != tree.initialiser || condition != tree.condition || increment != tree.increment || body != tree.body) {
        result = createForStatement(initialiser, condition, increment, body);
      }
      return result;
    },
    transformForLet_: function(tree, variables) {
      var $__149 = this;
      var copyFwd = [];
      var copyBak = [];
      var hoisted = [];
      var renames = [];
      variables.declarations.forEach((function(variable) {
        var variableName = $__149.getVariableName_(variable);
        var hoistedName = ("$" + variableName);
        var initialiser = renameAll(renames, variable.initialiser);
        hoisted.push(createVariableDeclaration(hoistedName, initialiser));
        copyFwd.push(createVariableDeclaration(variableName, createIdentifierExpression(hoistedName)));
        copyBak.push(createExpressionStatement(createAssignmentExpression(createIdentifierExpression(hoistedName), createIdentifierExpression(variableName))));
        renames.push(new Rename(variableName, hoistedName));
      }));
      var condition = renameAll(renames, tree.condition);
      var increment = renameAll(renames, tree.increment);
      var transformedForLoop = createBlock(createVariableStatement(createVariableDeclarationList(LET, hoisted)), createForStatement(null, condition, increment, createBlock(createVariableStatement(createVariableDeclarationList(LET, copyFwd)), createTryStatement(toBlock(tree.body), null, createFinally(createBlock(copyBak))))));
      return this.transformAny(transformedForLoop);
    },
    transformFunctionDeclaration: function(tree) {
      var body = this.transformFunctionBody(tree.functionBody);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      if (this.scope_.type === ScopeType.BLOCK) {
        this.scope_.addBlockScopedVariable(tree.name.identifierToken.value);
        return createExpressionStatement(createAssignmentExpression(createIdentifierExpression(tree.name.identifierToken), new FunctionExpression(tree.location, null, tree.isGenerator, formalParameterList, tree.typeAnnotation, body)));
      }
      if (body === tree.functionBody && formalParameterList === tree.formalParameterList) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name, tree.isGenerator, formalParameterList, tree.typeAnnotation, body);
    },
    transformScript: function(tree) {
      var scope = this.push_(this.createScriptScope_());
      var result = $traceurRuntime.superCall(this, $BlockBindingTransformer.prototype, "transformScript", [tree]);
      this.pop_(scope);
      return result;
    },
    transformVariableDeclaration: function(tree) {
      throw new Error('Should never see variable declaration tree.');
    },
    transformVariableDeclarationList: function(tree) {
      throw new Error('Should never see variable declaration list.');
    },
    transformVariableStatement: function(tree) {
      if (this.scope_.type == ScopeType.BLOCK) {
        switch (tree.declarations.declarationType) {
          case CONST:
          case LET:
            return this.transformBlockVariables_(tree.declarations);
          default:
            break;
        }
      }
      var variables = this.transformVariables_(tree.declarations);
      if (variables != tree.declarations) {
        tree = createVariableStatement(variables);
      }
      return tree;
    },
    transformBlockVariables_: function(tree) {
      var $__149 = this;
      var variables = tree.declarations;
      var comma = [];
      variables.forEach((function(variable) {
        switch (tree.declarationType) {
          case LET:
          case CONST:
            break;
          default:
            throw new Error('Only let/const allowed here.');
        }
        var variableName = $__149.getVariableName_(variable);
        $__149.scope_.addBlockScopedVariable(variableName);
        var initialiser = $__149.transformAny(variable.initialiser);
        if (initialiser != null) {
          comma.push(createAssignmentExpression(createIdentifierExpression(variableName), initialiser));
        }
      }));
      switch (comma.length) {
        case 0:
          return createEmptyStatement();
        case 1:
          return createExpressionStatement(comma[0]);
        default:
          for (var i = 0; i < comma.length; i++) {
            comma[i] = createExpressionStatement(comma[i]);
          }
          return createBlock(comma);
      }
    },
    transformVariables_: function(tree) {
      var variables = tree.declarations;
      var transformed = null;
      for (var index = 0; index < variables.length; index++) {
        var variable = variables[index];
        var variableName = this.getVariableName_(variable);
        var initialiser = this.transformAny(variable.initialiser);
        if (transformed != null || initialiser != variable.initialiser) {
          if (transformed == null) {
            transformed = variables.slice(0, index);
          }
          transformed.push(createVariableDeclaration(createIdentifierToken(variableName), initialiser));
        }
      }
      if (transformed != null || tree.declarationType != VAR) {
        var declarations = transformed != null ? transformed: tree.declarations;
        var declarationType = tree.declarationType != VAR ? VAR: tree.declarationType;
        tree = createVariableDeclarationList(declarationType, declarations);
      }
      return tree;
    },
    transformFunctionBody: function(body) {
      var scope = this.push_(this.createFunctionScope_());
      body = this.transformFunctionBodyStatements_(body);
      this.pop_(scope);
      return body;
    },
    transformFunctionBodyStatements_: function(tree) {
      var statements = this.transformList(tree.statements);
      if (this.scope_.blockVariables != null) {
        tree = this.rewriteAsCatch_(this.scope_.blockVariables, createBlock(statements));
      } else if (statements != tree.statements) {
        tree = createFunctionBody(statements);
      }
      return tree;
    },
    getVariableName_: function(variable) {
      var lvalue = variable.lvalue;
      if (lvalue.type == BINDING_IDENTIFIER) {
        return lvalue.identifierToken.value;
      }
      throw new Error('Unexpected destructuring declaration found.');
    }
  }, {}, ParseTreeTransformer);
  return {get BlockBindingTransformer() {
      return BlockBindingTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/util.js", function() {
  "use strict";
  var $__152 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      IDENTIFIER_EXPRESSION = $__152.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__152.LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__152.PAREN_EXPRESSION,
      UNARY_EXPRESSION = $__152.UNARY_EXPRESSION;
  var UNDEFINED = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").UNDEFINED;
  var VOID = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VOID;
  function hasUseStrict(list) {
    for (var i = 0; i < list.length; i++) {
      if (!list[i].isDirectivePrologue()) return false;
      if (list[i].isUseStrictDirective()) return true;
    }
    return false;
  }
  function isUndefined(tree) {
    if (tree.type === PAREN_EXPRESSION) return isUndefined(tree.expression);
    return tree.type === IDENTIFIER_EXPRESSION && tree.identifierToken.value === UNDEFINED;
  }
  function isVoidExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isVoidExpression(tree.expression);
    return tree.type === UNARY_EXPRESSION && tree.operator.type === VOID && isLiteralExpression(tree.operand);
  }
  function isLiteralExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isLiteralExpression(tree.expression);
    return tree.type === LITERAL_EXPRESSION;
  }
  return {
    get hasUseStrict() {
      return hasUseStrict;
    },
    get isUndefined() {
      return isUndefined;
    },
    get isVoidExpression() {
      return isVoidExpression;
    },
    get isLiteralExpression() {
      return isLiteralExpression;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/staticsemantics/PropName", function() {
  "use strict";
  var $__153 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      COMPUTED_PROPERTY_NAME = $__153.COMPUTED_PROPERTY_NAME,
      GET_ACCESSOR = $__153.GET_ACCESSOR,
      LITERAL_PROPERTY_NAME = $__153.LITERAL_PROPERTY_NAME,
      PROPERTY_METHOD_ASSIGNMENT = $__153.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__153.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__153.PROPERTY_NAME_SHORTHAND,
      SET_ACCESSOR = $__153.SET_ACCESSOR;
  var IDENTIFIER = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").IDENTIFIER;
  function propName(tree) {
    switch (tree.type) {
      case LITERAL_PROPERTY_NAME:
        var token = tree.literalToken;
        if (token.isKeyword() || token.type === IDENTIFIER) return token.toString();
        return String(tree.literalToken.processedValue);
      case COMPUTED_PROPERTY_NAME:
        return '';
      case PROPERTY_NAME_SHORTHAND:
        return tree.name.toString();
      case PROPERTY_METHOD_ASSIGNMENT:
      case PROPERTY_NAME_ASSIGNMENT:
      case GET_ACCESSOR:
      case SET_ACCESSOR:
        return propName(tree.name);
    }
  }
  return {get propName() {
      return propName;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/util", function() {
  "use strict";
  var $__154 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      IDENTIFIER_EXPRESSION = $__154.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__154.LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__154.PAREN_EXPRESSION,
      UNARY_EXPRESSION = $__154.UNARY_EXPRESSION;
  var UNDEFINED = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").UNDEFINED;
  var VOID = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VOID;
  function hasUseStrict(list) {
    for (var i = 0; i < list.length; i++) {
      if (!list[i].isDirectivePrologue()) return false;
      if (list[i].isUseStrictDirective()) return true;
    }
    return false;
  }
  function isUndefined(tree) {
    if (tree.type === PAREN_EXPRESSION) return isUndefined(tree.expression);
    return tree.type === IDENTIFIER_EXPRESSION && tree.identifierToken.value === UNDEFINED;
  }
  function isVoidExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isVoidExpression(tree.expression);
    return tree.type === UNARY_EXPRESSION && tree.operator.type === VOID && isLiteralExpression(tree.operand);
  }
  function isLiteralExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isLiteralExpression(tree.expression);
    return tree.type === LITERAL_EXPRESSION;
  }
  return {
    get hasUseStrict() {
      return hasUseStrict;
    },
    get isUndefined() {
      return isUndefined;
    },
    get isVoidExpression() {
      return isVoidExpression;
    },
    get isLiteralExpression() {
      return isLiteralExpression;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/MakeStrictTransformer", function() {
  "use strict";
  var $__156 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FunctionBody = $__156.FunctionBody,
      Script = $__156.Script;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var createUseStrictDirective = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createUseStrictDirective;
  var hasUseStrict = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/util").hasUseStrict;
  function prepend(statements) {
    return $traceurRuntime.spread([createUseStrictDirective()], statements);
  }
  var MakeStrictTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $MakeStrictTransformer.prototype, arguments);
  };
  var $MakeStrictTransformer = ($traceurRuntime.createClass)(MakeStrictTransformer, {
    transformScript: function(tree) {
      if (hasUseStrict(tree.scriptItemList)) return tree;
      return new Script(tree.location, prepend(tree.scriptItemList));
    },
    transformFunctionBody: function(tree) {
      if (hasUseStrict(tree.statements)) return tree;
      return new FunctionBody(tree.location, prepend(tree.statements));
    }
  }, {transformTree: function(tree) {
      return new MakeStrictTransformer().transformAny(tree);
    }}, ParseTreeTransformer);
  return {get MakeStrictTransformer() {
      return MakeStrictTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/OperatorExpander", function() {
  "use strict";
  var $__157 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      IDENTIFIER_EXPRESSION = $__157.IDENTIFIER_EXPRESSION,
      SUPER_EXPRESSION = $__157.SUPER_EXPRESSION;
  var $__157 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      AMPERSAND = $__157.AMPERSAND,
      AMPERSAND_EQUAL = $__157.AMPERSAND_EQUAL,
      BAR = $__157.BAR,
      BAR_EQUAL = $__157.BAR_EQUAL,
      CARET = $__157.CARET,
      CARET_EQUAL = $__157.CARET_EQUAL,
      LEFT_SHIFT = $__157.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__157.LEFT_SHIFT_EQUAL,
      MINUS = $__157.MINUS,
      MINUS_EQUAL = $__157.MINUS_EQUAL,
      PERCENT = $__157.PERCENT,
      PERCENT_EQUAL = $__157.PERCENT_EQUAL,
      PLUS = $__157.PLUS,
      PLUS_EQUAL = $__157.PLUS_EQUAL,
      RIGHT_SHIFT = $__157.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__157.RIGHT_SHIFT_EQUAL,
      SLASH = $__157.SLASH,
      SLASH_EQUAL = $__157.SLASH_EQUAL,
      STAR = $__157.STAR,
      STAR_EQUAL = $__157.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT = $__157.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__157.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__157 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentExpression = $__157.createAssignmentExpression,
      createBinaryOperator = $__157.createBinaryOperator,
      createCommaExpression = $__157.createCommaExpression,
      createIdentifierExpression = $__157.createIdentifierExpression,
      createMemberExpression = $__157.createMemberExpression,
      createMemberLookupExpression = $__157.createMemberLookupExpression,
      createOperatorToken = $__157.createOperatorToken,
      createParenExpression = $__157.createParenExpression;
  function getBinaryOperator(type) {
    switch (type) {
      case STAR_EQUAL:
        return STAR;
      case SLASH_EQUAL:
        return SLASH;
      case PERCENT_EQUAL:
        return PERCENT;
      case PLUS_EQUAL:
        return PLUS;
      case MINUS_EQUAL:
        return MINUS;
      case LEFT_SHIFT_EQUAL:
        return LEFT_SHIFT;
      case RIGHT_SHIFT_EQUAL:
        return RIGHT_SHIFT;
      case UNSIGNED_RIGHT_SHIFT_EQUAL:
        return UNSIGNED_RIGHT_SHIFT;
      case AMPERSAND_EQUAL:
        return AMPERSAND;
      case CARET_EQUAL:
        return CARET;
      case BAR_EQUAL:
        return BAR;
      default:
        throw Error('unreachable');
    }
  }
  function expandMemberLookupExpression(tree, tempVarTransformer) {
    var tmp1;
    var expressions = [];
    if (tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) {
      tmp1 = tree.left.operand;
    } else {
      tmp1 = createIdentifierExpression(tempVarTransformer.addTempVar());
      expressions.push(createAssignmentExpression(tmp1, tree.left.operand));
    }
    var tmp2 = createIdentifierExpression(tempVarTransformer.addTempVar());
    expressions.push(createAssignmentExpression(tmp2, tree.left.memberExpression), createAssignmentExpression(createMemberLookupExpression(tmp1, tmp2), createBinaryOperator(createMemberLookupExpression(tmp1, tmp2), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right)));
    return createParenExpression(createCommaExpression(expressions));
  }
  function expandMemberExpression(tree, tempVarTransformer) {
    var tmp;
    var expressions = [];
    if (tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) {
      tmp = tree.left.operand;
    } else {
      tmp = createIdentifierExpression(tempVarTransformer.addTempVar());
      expressions.push(createAssignmentExpression(tmp, tree.left.operand));
    }
    expressions.push(createAssignmentExpression(createMemberExpression(tmp, tree.left.memberName), createBinaryOperator(createMemberExpression(tmp, tree.left.memberName), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right)));
    return createParenExpression(createCommaExpression(expressions));
  }
  return {
    get expandMemberLookupExpression() {
      return expandMemberLookupExpression;
    },
    get expandMemberExpression() {
      return expandMemberExpression;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/SuperTransformer", function() {
  "use strict";
  var $__158 = Object.freeze(Object.defineProperties(["$traceurRuntime.superCall(", ",\n                                                      ", ",\n                                                      ", ",\n                                                      ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superCall(", ",\n                                                      ", ",\n                                                      ", ",\n                                                      ", ")"])}})),
      $__159 = Object.freeze(Object.defineProperties(["$traceurRuntime.superGet(", ",\n                                                     ", ",\n                                                     ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superGet(", ",\n                                                     ", ",\n                                                     ", ")"])}})),
      $__160 = Object.freeze(Object.defineProperties(["$traceurRuntime.superSet(", ",\n                                                       ", ",\n                                                       ", ",\n                                                       ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superSet(", ",\n                                                       ", ",\n                                                       ", ",\n                                                       ", ")"])}}));
  var $__163 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FunctionDeclaration = $__163.FunctionDeclaration,
      FunctionExpression = $__163.FunctionExpression;
  var $__163 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      LITERAL_PROPERTY_NAME = $__163.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__163.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__163.MEMBER_LOOKUP_EXPRESSION,
      SUPER_EXPRESSION = $__163.SUPER_EXPRESSION;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var EQUAL = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").EQUAL;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var $__163 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArrayLiteralExpression = $__163.createArrayLiteralExpression,
      createIdentifierExpression = $__163.createIdentifierExpression,
      createStringLiteral = $__163.createStringLiteral,
      createThisExpression = $__163.createThisExpression;
  var $__163 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/OperatorExpander"),
      expandMemberExpression = $__163.expandMemberExpression,
      expandMemberLookupExpression = $__163.expandMemberLookupExpression;
  var parseExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseExpression;
  var SuperTransformer = function(tempVarTransformer, reporter, protoName, methodTree, thisName) {
    this.tempVarTransformer_ = tempVarTransformer;
    this.reporter_ = reporter;
    this.protoName_ = protoName;
    this.method_ = methodTree;
    this.superCount_ = 0;
    this.thisVar_ = createIdentifierExpression(thisName);
    this.inNestedFunc_ = 0;
    this.nestedSuperCount_ = 0;
  };
  var $SuperTransformer = ($traceurRuntime.createClass)(SuperTransformer, {
    get hasSuper() {
      return this.superCount_ > 0;
    },
    get nestedSuper() {
      return this.nestedSuperCount_ > 0;
    },
    transformFunctionDeclaration: function(tree) {
      return this.transformFunction_(tree, FunctionDeclaration);
    },
    transformFunctionExpression: function(tree) {
      return this.transformFunction_(tree, FunctionExpression);
    },
    transformFunction_: function(tree, constructor) {
      var oldSuperCount = this.superCount_;
      this.inNestedFunc_++;
      var transformedTree = constructor === FunctionExpression ? $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformFunctionExpression", [tree]): $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformFunctionDeclaration", [tree]);
      this.inNestedFunc_--;
      if (oldSuperCount !== this.superCount_) this.nestedSuperCount_ += this.superCount_ - oldSuperCount;
      return transformedTree;
    },
    transformGetAccessor: function(tree) {
      return tree;
    },
    transformSetAccessor: function(tree) {
      return tree;
    },
    transformPropertyMethodAssignMent: function(tree) {
      return tree;
    },
    transformCallExpression: function(tree) {
      if (this.method_ && tree.operand.type == SUPER_EXPRESSION) {
        this.superCount_++;
        assert(this.method_.name.type === LITERAL_PROPERTY_NAME);
        var methodName = this.method_.name.literalToken.value;
        return this.createSuperCallExpression_(methodName, tree);
      }
      if ((tree.operand.type == MEMBER_EXPRESSION || tree.operand.type == MEMBER_LOOKUP_EXPRESSION) && tree.operand.operand.type == SUPER_EXPRESSION) {
        this.superCount_++;
        var name;
        if (tree.operand.type == MEMBER_EXPRESSION) name = tree.operand.memberName.value; else name = tree.operand.memberExpression;
        return this.createSuperCallExpression_(name, tree);
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformCallExpression", [tree]);
    },
    createSuperCallExpression_: function(methodName, tree) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
      var args = createArrayLiteralExpression(tree.args.args);
      return this.createSuperCallExpression(thisExpr, this.protoName_, methodName, args);
    },
    createSuperCallExpression: function(thisExpr, protoName, methodName, args) {
      return parseExpression($__158, thisExpr, protoName, methodName, args);
    },
    transformMemberShared_: function(tree, name) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
      return parseExpression($__159, thisExpr, this.protoName_, name);
    },
    transformMemberExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION) {
        this.superCount_++;
        return this.transformMemberShared_(tree, createStringLiteral(tree.memberName.value));
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformMemberExpression", [tree]);
    },
    transformMemberLookupExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION) return this.transformMemberShared_(tree, tree.memberExpression);
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformMemberLookupExpression", [tree]);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.isAssignmentOperator() && (tree.left.type === MEMBER_EXPRESSION || tree.left.type === MEMBER_LOOKUP_EXPRESSION) && tree.left.operand.type === SUPER_EXPRESSION) {
        if (tree.operator.type !== EQUAL) {
          if (tree.left.type === MEMBER_LOOKUP_EXPRESSION) {
            tree = expandMemberLookupExpression(tree, this.tempVarTransformer_);
          } else {
            tree = expandMemberExpression(tree, this.tempVarTransformer_);
          }
          return this.transformAny(tree);
        }
        this.superCount_++;
        var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ? tree.left.memberExpression: createStringLiteral(tree.left.memberName.value);
        var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
        var right = this.transformAny(tree.right);
        return parseExpression($__160, thisExpr, this.protoName_, name, right);
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformBinaryOperator", [tree]);
    },
    transformSuperExpression: function(tree) {
      this.reportError_(tree, '"super" may only be used on the LHS of a member ' + 'access expression before a call (TODO wording)');
      return tree;
    },
    reportError_: function(tree) {
      var $__164;
      for (var args = [],
          $__162 = 1; $__162 < arguments.length; $__162++) args[$__162 - 1] = arguments[$__162];
      ($__164 = this.reporter_).reportError.apply($__164, $traceurRuntime.spread([tree.location.start], args));
    }
  }, {}, ParseTreeTransformer);
  return {get SuperTransformer() {
      return SuperTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ClassTransformer", function() {
  "use strict";
  var $__165 = Object.freeze(Object.defineProperties(["($traceurRuntime.createClass)(", ", ", ", ", ",\n                                       ", ")"], {raw: {value: Object.freeze(["($traceurRuntime.createClass)(", ", ", ", ", ",\n                                       ", ")"])}})),
      $__166 = Object.freeze(Object.defineProperties(["($traceurRuntime.createClass)(", ", ", ", ", ")"], {raw: {value: Object.freeze(["($traceurRuntime.createClass)(", ", ", ", ", ")"])}})),
      $__167 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__168 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__169 = Object.freeze(Object.defineProperties(["", " = ", ""], {raw: {value: Object.freeze(["", " = ", ""])}})),
      $__170 = Object.freeze(Object.defineProperties(["function($__super) {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ", $__super);\n      }(", ")"], {raw: {value: Object.freeze(["function($__super) {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ", $__super);\n      }(", ")"])}})),
      $__171 = Object.freeze(Object.defineProperties(["function() {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ");\n      }()"], {raw: {value: Object.freeze(["function() {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ");\n      }()"])}})),
      $__172 = Object.freeze(Object.defineProperties(["$traceurRuntime.defaultSuperCall(this, ", ".prototype,\n                                            arguments)"], {raw: {value: Object.freeze(["$traceurRuntime.defaultSuperCall(this, ", ".prototype,\n                                            arguments)"])}}));
  var CONSTRUCTOR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").CONSTRUCTOR;
  var $__175 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      AnonBlock = $__175.AnonBlock,
      ExportDeclaration = $__175.ExportDeclaration,
      FunctionExpression = $__175.FunctionExpression,
      GetAccessor = $__175.GetAccessor,
      PropertyMethodAssignment = $__175.PropertyMethodAssignment,
      SetAccessor = $__175.SetAccessor;
  var $__175 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      GET_ACCESSOR = $__175.GET_ACCESSOR,
      PROPERTY_METHOD_ASSIGNMENT = $__175.PROPERTY_METHOD_ASSIGNMENT,
      SET_ACCESSOR = $__175.SET_ACCESSOR;
  var SuperTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/SuperTransformer").SuperTransformer;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var MakeStrictTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/MakeStrictTransformer").MakeStrictTransformer;
  var $__175 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createEmptyParameterList = $__175.createEmptyParameterList,
      createFunctionBody = $__175.createFunctionBody,
      id = $__175.createIdentifierExpression,
      createMemberExpression = $__175.createMemberExpression,
      createObjectLiteralExpression = $__175.createObjectLiteralExpression,
      createParenExpression = $__175.createParenExpression,
      createThisExpression = $__175.createThisExpression,
      createVariableStatement = $__175.createVariableStatement;
  var hasUseStrict = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/util.js").hasUseStrict;
  var parseOptions = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").parseOptions;
  var $__175 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseExpression = $__175.parseExpression,
      parseStatement = $__175.parseStatement;
  var propName = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/staticsemantics/PropName").propName;
  function classCall(func, object, staticObject, superClass) {
    if (superClass) {
      return parseExpression($__165, func, object, staticObject, superClass);
    }
    return parseExpression($__166, func, object, staticObject);
  }
  var ClassTransformer = function(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $ClassTransformer.prototype, "constructor", [identifierGenerator]);
    this.reporter_ = reporter;
    this.strictCount_ = 0;
    this.state_ = null;
  };
  var $ClassTransformer = ($traceurRuntime.createClass)(ClassTransformer, {
    transformExportDeclaration: function(tree) {
      var transformed = $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformExportDeclaration", [tree]);
      if (transformed === tree) return tree;
      var declaration = transformed.declaration;
      if (declaration instanceof AnonBlock) {
        var statements = $traceurRuntime.spread([new ExportDeclaration(null, declaration.statements[0])], declaration.statements.slice(1));
        return new AnonBlock(null, statements);
      }
      return transformed;
    },
    transformModule: function(tree) {
      this.strictCount_ = 1;
      return $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformModule", [tree]);
    },
    transformScript: function(tree) {
      this.strictCount_ = + hasUseStrict(tree.scriptItemList);
      return $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformScript", [tree]);
    },
    transformFunctionBody: function(tree) {
      var useStrict = + hasUseStrict(tree.statements);
      this.strictCount_ += useStrict;
      var result = $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformFunctionBody", [tree]);
      this.strictCount_ -= useStrict;
      return result;
    },
    makeStrict_: function(tree) {
      if (this.strictCount_) return tree;
      return MakeStrictTransformer.transformTree(tree);
    },
    transformClassElements_: function(tree, internalName) {
      var $__173 = this;
      var oldState = this.state_;
      this.state_ = {hasSuper: false};
      var superClass = this.transformAny(tree.superClass);
      var hasConstructor = false;
      var protoElements = [],
          staticElements = [];
      var constructorBody,
          constructorParams;
      tree.elements.forEach((function(tree) {
        var elements,
            homeObject;
        if (tree.isStatic) {
          elements = staticElements;
          homeObject = internalName;
        } else {
          elements = protoElements;
          homeObject = createMemberExpression(internalName, 'prototype');
        }
        switch (tree.type) {
          case GET_ACCESSOR:
            elements.push($__173.transformGetAccessor_(tree, homeObject));
            break;
          case SET_ACCESSOR:
            elements.push($__173.transformSetAccessor_(tree, homeObject));
            break;
          case PROPERTY_METHOD_ASSIGNMENT:
            var transformed = $__173.transformPropertyMethodAssignment_(tree, homeObject);
            if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
              hasConstructor = true;
              constructorParams = transformed.formalParameterList;
              constructorBody = transformed.functionBody;
            } else {
              elements.push(transformed);
            }
            break;
          default:
            throw new Error(("Unexpected class element: " + tree.type));
        }
      }));
      var object = createObjectLiteralExpression(protoElements);
      var staticObject = createObjectLiteralExpression(staticElements);
      var func;
      if (!hasConstructor) {
        func = this.getDefaultConstructor_(tree, internalName);
      } else {
        func = new FunctionExpression(tree.location, null, false, constructorParams, null, constructorBody);
      }
      var state = this.state_;
      this.state_ = oldState;
      return {
        func: func,
        superClass: superClass,
        object: object,
        staticObject: staticObject,
        hasSuper: state.hasSuper
      };
    },
    transformClassDeclaration: function(tree) {
      var name = tree.name.identifierToken;
      var internalName = id(("$" + name));
      var $__175 = this.transformClassElements_(tree, internalName),
          func = $__175.func,
          hasSuper = $__175.hasSuper,
          object = $__175.object,
          staticObject = $__175.staticObject,
          superClass = $__175.superClass;
      var statements = [parseStatement($__167, name, func)];
      var expr = classCall(name, object, staticObject, superClass);
      if (hasSuper) {
        statements.push(parseStatement($__168, internalName, expr));
      } else {
        statements.push(parseStatement($__169, name, expr));
      }
      var anonBlock = new AnonBlock(null, statements);
      return this.makeStrict_(anonBlock);
    },
    transformClassExpression: function(tree) {
      this.pushTempVarState();
      var name;
      if (tree.name) name = tree.name.identifierToken; else name = id(this.getTempIdentifier());
      var $__175 = this.transformClassElements_(tree, name),
          func = $__175.func,
          hasSuper = $__175.hasSuper,
          object = $__175.object,
          staticObject = $__175.staticObject,
          superClass = $__175.superClass;
      var expression;
      if (hasSuper) {
        expression = parseExpression($__170, name, func, name, object, staticObject, superClass);
      } else if (tree.name) {
        expression = parseExpression($__171, name, func, name, object, staticObject);
      } else {
        expression = classCall(func, object, staticObject, superClass);
      }
      this.popTempVarState();
      return createParenExpression(this.makeStrict_(expression));
    },
    transformPropertyMethodAssignment_: function(tree, internalName) {
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformSuperInFunctionBody_(tree, tree.functionBody, internalName);
      if (!tree.isStatic && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
        return tree;
      }
      var isStatic = false;
      return new PropertyMethodAssignment(tree.location, isStatic, tree.isGenerator, tree.name, formalParameterList, tree.typeAnnotation, functionBody);
    },
    transformGetAccessor_: function(tree, internalName) {
      var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
      if (!tree.isStatic && body === tree.body) return tree;
      return new GetAccessor(tree.location, false, tree.name, tree.typeAnnotation, body);
    },
    transformSetAccessor_: function(tree, internalName) {
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
      if (!tree.isStatic && body === tree.body) return tree;
      return new SetAccessor(tree.location, false, tree.name, parameter, body);
    },
    transformSuperInFunctionBody_: function(methodTree, tree, internalName) {
      this.pushTempVarState();
      var thisName = this.getTempIdentifier();
      var thisDecl = createVariableStatement(VAR, thisName, createThisExpression());
      var superTransformer = new SuperTransformer(this, this.reporter_, internalName, methodTree, thisName);
      var transformedTree = superTransformer.transformFunctionBody(this.transformFunctionBody(tree));
      if (superTransformer.hasSuper) this.state_.hasSuper = true;
      this.popTempVarState();
      if (superTransformer.nestedSuper) return createFunctionBody([thisDecl].concat(transformedTree.statements));
      return transformedTree;
    },
    getDefaultConstructor_: function(tree, internalName) {
      var constructorParams = createEmptyParameterList();
      var constructorBody;
      if (tree.superClass) {
        var statement = parseStatement($__172, internalName);
        constructorBody = createFunctionBody([statement]);
        this.state_.hasSuper = true;
      } else {
        constructorBody = createFunctionBody([]);
      }
      return new FunctionExpression(tree.location, null, false, constructorParams, null, constructorBody);
    }
  }, {}, TempVarTransformer);
  return {get ClassTransformer() {
      return ClassTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/CommonJsModuleTransformer", function() {
  "use strict";
  var $__176 = Object.freeze(Object.defineProperties(["module.exports = function() {\n            ", "\n          }.call(", ");"], {raw: {value: Object.freeze(["module.exports = function() {\n            ", "\n          }.call(", ");"])}})),
      $__177 = Object.freeze(Object.defineProperties(["module.exports = ", ";"], {raw: {value: Object.freeze(["module.exports = ", ";"])}})),
      $__178 = Object.freeze(Object.defineProperties(["require(", ")"], {raw: {value: Object.freeze(["require(", ")"])}}));
  var ModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ModuleTransformer").ModuleTransformer;
  var RETURN_STATEMENT = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").RETURN_STATEMENT;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var globalThis = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/globalThis").default;
  var $__180 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseExpression = $__180.parseExpression,
      parseStatement = $__180.parseStatement,
      parseStatements = $__180.parseStatements;
  var scopeContainsThis = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/scopeContainsThis").default;
  var CommonJsModuleTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $CommonJsModuleTransformer.prototype, arguments);
  };
  var $CommonJsModuleTransformer = ($traceurRuntime.createClass)(CommonJsModuleTransformer, {
    wrapModule: function(statements) {
      var needsIife = statements.some(scopeContainsThis);
      if (needsIife) {
        return parseStatements($__176, statements, globalThis());
      }
      var last = statements[statements.length - 1];
      statements = statements.slice(0, - 1);
      assert(last.type === RETURN_STATEMENT);
      var exportObject = last.expression;
      if (this.hasExports()) {
        statements.push(parseStatement($__177, exportObject));
      }
      return statements;
    },
    transformModuleSpecifier: function(tree) {
      return parseExpression($__178, tree.token);
    }
  }, {}, ModuleTransformer);
  return {get CommonJsModuleTransformer() {
      return CommonJsModuleTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ParameterTransformer", function() {
  "use strict";
  var FunctionBody = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").FunctionBody;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var prependStatements = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PrependStatements").prependStatements;
  var stack = [];
  var ParameterTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $ParameterTransformer.prototype, arguments);
  };
  var $ParameterTransformer = ($traceurRuntime.createClass)(ParameterTransformer, {
    transformFunctionDeclaration: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionExpression", [tree]);
    },
    transformGetAccessor: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformGetAccessor", [tree]);
    },
    transformSetAccessor: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformSetAccessor", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
    },
    transformFunctionBody: function(tree) {
      var transformedTree = $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionBody", [tree]);
      var statements = stack.pop();
      if (!statements.length) return transformedTree;
      statements = prependStatements.apply(null, $traceurRuntime.spread([transformedTree.statements], statements));
      return new FunctionBody(transformedTree.location, statements);
    },
    get parameterStatements() {
      return stack[stack.length - 1];
    }
  }, {}, TempVarTransformer);
  return {get ParameterTransformer() {
      return ParameterTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/DefaultParametersTransformer", function() {
  "use strict";
  var $__184 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/util"),
      isUndefined = $__184.isUndefined,
      isVoidExpression = $__184.isVoidExpression;
  var FormalParameterList = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").FormalParameterList;
  var ParameterTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParameterTransformer").ParameterTransformer;
  var ARGUMENTS = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").ARGUMENTS;
  var $__184 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      FORMAL_PARAMETER = $__184.FORMAL_PARAMETER,
      REST_PARAMETER = $__184.REST_PARAMETER;
  var $__184 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      NOT_EQUAL_EQUAL = $__184.NOT_EQUAL_EQUAL,
      VAR = $__184.VAR;
  var $__184 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createBinaryOperator = $__184.createBinaryOperator,
      createConditionalExpression = $__184.createConditionalExpression,
      createIdentifierExpression = $__184.createIdentifierExpression,
      createMemberLookupExpression = $__184.createMemberLookupExpression,
      createNumberLiteral = $__184.createNumberLiteral,
      createOperatorToken = $__184.createOperatorToken,
      createVariableStatement = $__184.createVariableStatement,
      createVoid0 = $__184.createVoid0;
  var prependStatements = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PrependStatements").prependStatements;
  function createDefaultAssignment(index, binding, initialiser) {
    var argumentsExpression = createMemberLookupExpression(createIdentifierExpression(ARGUMENTS), createNumberLiteral(index));
    var assignmentExpression;
    if (initialiser === null || isUndefined(initialiser) || isVoidExpression(initialiser)) {
      assignmentExpression = argumentsExpression;
    } else {
      assignmentExpression = createConditionalExpression(createBinaryOperator(argumentsExpression, createOperatorToken(NOT_EQUAL_EQUAL), createVoid0()), argumentsExpression, initialiser);
    }
    return createVariableStatement(VAR, binding, assignmentExpression);
  }
  var DefaultParametersTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $DefaultParametersTransformer.prototype, arguments);
  };
  var $DefaultParametersTransformer = ($traceurRuntime.createClass)(DefaultParametersTransformer, {transformFormalParameterList: function(tree) {
      var parameters = [];
      var changed = false;
      var defaultToUndefined = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var param = this.transformAny(tree.parameters[i]);
        if (param !== tree.parameters[i]) changed = true;
        if (param.isRestParameter() || !param.parameter.initialiser && !defaultToUndefined) {
          parameters.push(param);
        } else {
          defaultToUndefined = true;
          changed = true;
          this.parameterStatements.push(createDefaultAssignment(i, param.parameter.binding, param.parameter.initialiser));
        }
      }
      if (!changed) return tree;
      return new FormalParameterList(tree.location, parameters);
    }}, {}, ParameterTransformer);
  return {get DefaultParametersTransformer() {
      return DefaultParametersTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/DestructuringTransformer", function() {
  "use strict";
  var $__187 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      ARRAY = $__187.ARRAY,
      CALL = $__187.CALL,
      PROTOTYPE = $__187.PROTOTYPE,
      SLICE = $__187.SLICE;
  var $__187 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      ARRAY_LITERAL_EXPRESSION = $__187.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__187.ARRAY_PATTERN,
      BINDING_ELEMENT = $__187.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__187.BINDING_IDENTIFIER,
      BLOCK = $__187.BLOCK,
      CALL_EXPRESSION = $__187.CALL_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__187.COMPUTED_PROPERTY_NAME,
      IDENTIFIER_EXPRESSION = $__187.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__187.LITERAL_EXPRESSION,
      MEMBER_EXPRESSION = $__187.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__187.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__187.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__187.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__187.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__187.PAREN_EXPRESSION,
      VARIABLE_DECLARATION_LIST = $__187.VARIABLE_DECLARATION_LIST;
  var $__187 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      BindingElement = $__187.BindingElement,
      Catch = $__187.Catch,
      ForInStatement = $__187.ForInStatement,
      ForOfStatement = $__187.ForOfStatement,
      LiteralExpression = $__187.LiteralExpression;
  var ParameterTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParameterTransformer").ParameterTransformer;
  var $__187 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      EQUAL = $__187.EQUAL,
      IDENTIFIER = $__187.IDENTIFIER,
      IN = $__187.IN,
      LET = $__187.LET,
      VAR = $__187.VAR;
  var $__187 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__187.createArgumentList,
      createAssignmentExpression = $__187.createAssignmentExpression,
      createBinaryOperator = $__187.createBinaryOperator,
      createBindingIdentifier = $__187.createBindingIdentifier,
      createBlock = $__187.createBlock,
      createCallExpression = $__187.createCallExpression,
      createCommaExpression = $__187.createCommaExpression,
      createConditionalExpression = $__187.createConditionalExpression,
      createExpressionStatement = $__187.createExpressionStatement,
      createIdentifierExpression = $__187.createIdentifierExpression,
      createMemberExpression = $__187.createMemberExpression,
      createMemberLookupExpression = $__187.createMemberLookupExpression,
      createNumberLiteral = $__187.createNumberLiteral,
      createOperatorToken = $__187.createOperatorToken,
      createParenExpression = $__187.createParenExpression,
      createStringLiteral = $__187.createStringLiteral,
      createVariableDeclaration = $__187.createVariableDeclaration,
      createVariableDeclarationList = $__187.createVariableDeclarationList,
      createVariableStatement = $__187.createVariableStatement;
  var options = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").options;
  var Desugaring = function(rvalue) {
    this.rvalue = rvalue;
  };
  Desugaring = ($traceurRuntime.createClass)(Desugaring, {}, {});
  var AssignmentExpressionDesugaring = function(rvalue) {
    $traceurRuntime.superCall(this, $AssignmentExpressionDesugaring.prototype, "constructor", [rvalue]);
    this.expressions = [];
  };
  var $AssignmentExpressionDesugaring = ($traceurRuntime.createClass)(AssignmentExpressionDesugaring, {assign: function(lvalue, rvalue) {
      lvalue = lvalue instanceof BindingElement ? lvalue.binding: lvalue;
      this.expressions.push(createAssignmentExpression(lvalue, rvalue));
    }}, {}, Desugaring);
  var VariableDeclarationDesugaring = function(rvalue) {
    $traceurRuntime.superCall(this, $VariableDeclarationDesugaring.prototype, "constructor", [rvalue]);
    this.declarations = [];
  };
  var $VariableDeclarationDesugaring = ($traceurRuntime.createClass)(VariableDeclarationDesugaring, {assign: function(lvalue, rvalue) {
      if (lvalue instanceof BindingElement) {
        this.declarations.push(createVariableDeclaration(lvalue.binding, rvalue));
        return;
      }
      if (lvalue.type == IDENTIFIER_EXPRESSION) lvalue = createBindingIdentifier(lvalue);
      this.declarations.push(createVariableDeclaration(lvalue, rvalue));
    }}, {}, Desugaring);
  function createConditionalMemberExpression(rvalue, name, initialiser) {
    if (name.type === COMPUTED_PROPERTY_NAME) {
      return createConditionalMemberLookupExpression(rvalue, name.expression, initialiser);
    }
    var token;
    if (name.type == BINDING_IDENTIFIER) {
      token = name.identifierToken;
    } else {
      token = name.literalToken;
      if (!token.isKeyword() && token.type !== IDENTIFIER) {
        return createConditionalMemberLookupExpression(rvalue, new LiteralExpression(null, token), initialiser);
      }
    }
    if (!initialiser) return createMemberExpression(rvalue, token);
    return createConditionalExpression(createBinaryOperator(createStringLiteral(token.toString()), createOperatorToken(IN), rvalue), createMemberExpression(rvalue, token), initialiser);
  }
  function createConditionalMemberLookupExpression(rvalue, index, initialiser) {
    if (!initialiser) return createMemberLookupExpression(rvalue, index);
    return createConditionalExpression(createBinaryOperator(index, createOperatorToken(IN), rvalue), createMemberLookupExpression(rvalue, index), initialiser);
  }
  var DestructuringTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $DestructuringTransformer.prototype, arguments);
  };
  var $DestructuringTransformer = ($traceurRuntime.createClass)(DestructuringTransformer, {
    transformArrayPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformObjectPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type == EQUAL && tree.left.isPattern()) {
        return this.transformAny(this.desugarAssignment_(tree.left, tree.right));
      } else {
        return $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformBinaryOperator", [tree]);
      }
    },
    desugarAssignment_: function(lvalue, rvalue) {
      var tempIdent = createIdentifierExpression(this.addTempVar());
      var desugaring = new AssignmentExpressionDesugaring(tempIdent);
      this.desugarPattern_(desugaring, lvalue);
      desugaring.expressions.unshift(createAssignmentExpression(tempIdent, rvalue));
      desugaring.expressions.push(tempIdent);
      return createParenExpression(createCommaExpression(desugaring.expressions));
    },
    transformVariableDeclarationList: function(tree) {
      var $__185 = this;
      if (!this.destructuringInDeclaration_(tree)) {
        return $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformVariableDeclarationList", [tree]);
      }
      this.pushTempVarState();
      var desugaredDeclarations = [];
      tree.declarations.forEach((function(declaration) {
        var $__188;
        if (declaration.lvalue.isPattern()) {
          ($__188 = desugaredDeclarations).push.apply($__188, $traceurRuntime.toObject($__185.desugarVariableDeclaration_(declaration)));
        } else {
          desugaredDeclarations.push(declaration);
        }
      }));
      var transformedTree = this.transformVariableDeclarationList(createVariableDeclarationList(tree.declarationType, desugaredDeclarations));
      this.popTempVarState();
      return transformedTree;
    },
    transformForInStatement: function(tree) {
      return this.transformForInOrOf_(tree, $traceurRuntime.superGet(this, $DestructuringTransformer.prototype, "transformForInStatement"), ForInStatement);
    },
    transformForOfStatement: function(tree) {
      return this.transformForInOrOf_(tree, $traceurRuntime.superGet(this, $DestructuringTransformer.prototype, "transformForOfStatement"), ForOfStatement);
    },
    transformForInOrOf_: function(tree, superMethod, constr) {
      var $__188;
      if (!tree.initialiser.isPattern() && (tree.initialiser.type !== VARIABLE_DECLARATION_LIST || !this.destructuringInDeclaration_(tree.initialiser))) {
        return superMethod.call(this, tree);
      }
      this.pushTempVarState();
      var declarationType,
          lvalue;
      if (tree.initialiser.isPattern()) {
        declarationType = null;
        lvalue = tree.initialiser;
      } else {
        declarationType = tree.initialiser.declarationType;
        lvalue = tree.initialiser.declarations[0].lvalue;
      }
      var statements = [];
      var binding = this.desugarBinding_(lvalue, statements, declarationType);
      var initialiser = createVariableDeclarationList(VAR, binding, null);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (body.type !== BLOCK) body = createBlock(body);
      ($__188 = statements).push.apply($__188, $traceurRuntime.toObject(body.statements));
      body = createBlock(statements);
      this.popTempVarState();
      return new constr(tree.location, initialiser, collection, body);
    },
    transformBindingElement: function(tree) {
      if (!tree.binding.isPattern() || tree.initialiser) return tree;
      var statements = this.parameterStatements;
      var binding = this.desugarBinding_(tree.binding, statements, VAR);
      return new BindingElement(null, binding, null);
    },
    transformCatch: function(tree) {
      var $__188;
      if (!tree.binding.isPattern()) return $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformCatch", [tree]);
      var body = this.transformAny(tree.catchBody);
      var statements = [];
      var kind = options.blockBinding ? LET: VAR;
      var binding = this.desugarBinding_(tree.binding, statements, kind);
      ($__188 = statements).push.apply($__188, $traceurRuntime.toObject(body.statements));
      return new Catch(tree.location, binding, createBlock(statements));
    },
    desugarBinding_: function(bindingTree, statements, declarationType) {
      var varName = this.getTempIdentifier();
      var binding = createBindingIdentifier(varName);
      var idExpr = createIdentifierExpression(varName);
      var desugaring;
      if (declarationType === null) desugaring = new AssignmentExpressionDesugaring(idExpr); else desugaring = new VariableDeclarationDesugaring(idExpr);
      this.desugarPattern_(desugaring, bindingTree);
      if (declarationType === null) {
        statements.push(createExpressionStatement(createCommaExpression(desugaring.expressions)));
      } else {
        statements.push(createVariableStatement(this.transformVariableDeclarationList(createVariableDeclarationList(declarationType, desugaring.declarations))));
      }
      return binding;
    },
    destructuringInDeclaration_: function(tree) {
      return tree.declarations.some((function(declaration) {
        return declaration.lvalue.isPattern();
      }));
    },
    desugarVariableDeclaration_: function(tree) {
      var tempRValueName = this.getTempIdentifier();
      var tempRValueIdent = createIdentifierExpression(tempRValueName);
      var desugaring;
      var initialiser;
      switch (tree.initialiser.type) {
        case ARRAY_LITERAL_EXPRESSION:
        case CALL_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
          initialiser = tree.initialiser;
        default:
          desugaring = new VariableDeclarationDesugaring(tempRValueIdent);
          desugaring.assign(desugaring.rvalue, tree.initialiser);
          var initialiserFound = this.desugarPattern_(desugaring, tree.lvalue);
          if (initialiserFound || desugaring.declarations.length > 2) return desugaring.declarations;
          initialiser = initialiser || createParenExpression(tree.initialiser);
          desugaring = new VariableDeclarationDesugaring(initialiser);
          this.desugarPattern_(desugaring, tree.lvalue);
          return desugaring.declarations;
      }
    },
    desugarPattern_: function(desugaring, tree) {
      var initialiserFound = false;
      switch (tree.type) {
        case ARRAY_PATTERN:
          {
            var pattern = tree;
            for (var i = 0; i < pattern.elements.length; i++) {
              var lvalue = pattern.elements[i];
              if (lvalue === null) {
                continue;
              } else if (lvalue.isSpreadPatternElement()) {
                desugaring.assign(lvalue.lvalue, createCallExpression(createMemberExpression(ARRAY, PROTOTYPE, SLICE, CALL), createArgumentList(desugaring.rvalue, createNumberLiteral(i))));
              } else {
                if (lvalue.initialiser) initialiserFound = true;
                desugaring.assign(lvalue, createConditionalMemberLookupExpression(desugaring.rvalue, createNumberLiteral(i), lvalue.initialiser));
              }
            }
            break;
          }
        case OBJECT_PATTERN:
          {
            var pattern = tree;
            pattern.fields.forEach((function(field) {
              var lookup;
              switch (field.type) {
                case BINDING_ELEMENT:
                  if (field.initialiser) initialiserFound = true;
                  lookup = createConditionalMemberExpression(desugaring.rvalue, field.binding, field.initialiser);
                  desugaring.assign(createIdentifierExpression(field.binding), lookup);
                  break;
                case OBJECT_PATTERN_FIELD:
                  if (field.element.initialiser) initialiserFound = true;
                  var name = field.name;
                  lookup = createConditionalMemberExpression(desugaring.rvalue, name, field.element.initialiser);
                  desugaring.assign(field.element, lookup);
                  break;
                case IDENTIFIER_EXPRESSION:
                  lookup = createMemberExpression(desugaring.rvalue, field.identifierToken);
                  desugaring.assign(field, lookup);
                  break;
                default:
                  throw Error('unreachable');
              }
            }));
            break;
          }
        case PAREN_EXPRESSION:
          return this.desugarPattern_(desugaring, tree.expression);
        default:
          throw new Error('unreachable');
      }
      if (desugaring instanceof VariableDeclarationDesugaring && desugaring.declarations.length === 0) {
        desugaring.assign(createBindingIdentifier(this.getTempIdentifier()), desugaring.rvalue);
      }
      return initialiserFound;
    }
  }, {}, ParameterTransformer);
  return {get DestructuringTransformer() {
      return DestructuringTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ForOfTransformer", function() {
  "use strict";
  var $__189 = Object.freeze(Object.defineProperties(["", " = ", ".value;"], {raw: {value: Object.freeze(["", " = ", ".value;"])}})),
      $__190 = Object.freeze(Object.defineProperties(["\n        for (var ", " =\n                 ", "[Symbol.iterator](),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"], {raw: {value: Object.freeze(["\n        for (var ", " =\n                 ", "[Symbol.iterator](),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"])}}));
  var VARIABLE_DECLARATION_LIST = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").VARIABLE_DECLARATION_LIST;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__192 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      id = $__192.createIdentifierExpression,
      createMemberExpression = $__192.createMemberExpression,
      createVariableStatement = $__192.createVariableStatement;
  var parseStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseStatement;
  var ForOfTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $ForOfTransformer.prototype, arguments);
  };
  var $ForOfTransformer = ($traceurRuntime.createClass)(ForOfTransformer, {transformForOfStatement: function(original) {
      var tree = $traceurRuntime.superCall(this, $ForOfTransformer.prototype, "transformForOfStatement", [original]);
      var iter = id(this.getTempIdentifier());
      var result = id(this.getTempIdentifier());
      var assignment;
      if (tree.initialiser.type === VARIABLE_DECLARATION_LIST) {
        assignment = createVariableStatement(tree.initialiser.declarationType, tree.initialiser.declarations[0].lvalue, createMemberExpression(result, 'value'));
      } else {
        assignment = parseStatement($__189, tree.initialiser, result);
      }
      return parseStatement($__190, iter, tree.collection, result, result, iter, assignment, tree.body);
    }}, {}, TempVarTransformer);
  return {get ForOfTransformer() {
      return ForOfTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/GeneratorComprehensionTransformer", function() {
  "use strict";
  var ComprehensionTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ComprehensionTransformer").ComprehensionTransformer;
  var createYieldStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createYieldStatement;
  var GeneratorComprehensionTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $GeneratorComprehensionTransformer.prototype, arguments);
  };
  var $GeneratorComprehensionTransformer = ($traceurRuntime.createClass)(GeneratorComprehensionTransformer, {transformGeneratorComprehension: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statement = createYieldStatement(expression);
      var isGenerator = true;
      return this.transformComprehension(tree, statement, isGenerator);
    }}, {}, ComprehensionTransformer);
  return {get GeneratorComprehensionTransformer() {
      return GeneratorComprehensionTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/State", function() {
  "use strict";
  var FINALLY_FALL_THROUGH = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").FINALLY_FALL_THROUGH;
  var $__196 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignStateStatement = $__196.createAssignStateStatement,
      createAssignmentStatement = $__196.createAssignmentStatement,
      createBreakStatement = $__196.createBreakStatement,
      createCaseClause = $__196.createCaseClause,
      createIdentifierExpression = $__196.createIdentifierExpression,
      createNumberLiteral = $__196.createNumberLiteral,
      createStatementList = $__196.createStatementList;
  var State = function(id) {
    this.id = id;
  };
  State = ($traceurRuntime.createClass)(State, {
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return createCaseClause(createNumberLiteral(this.id), this.transform(enclosingFinally, machineEndState, reporter));
    },
    transformBreak: function(labelSet, breakState) {
      return this;
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      return this;
    }
  }, {});
  ;
  State.INVALID_STATE = - 1;
  State.END_STATE = - 2;
  State.RETHROW_STATE = - 3;
  State.generateJump = function(enclosingFinally, fallThroughState) {
    return createStatementList(State.generateAssignState(enclosingFinally, fallThroughState), createBreakStatement());
  };
  State.generateJumpThroughFinally = function(finallyState, destination) {
    return createStatementList(State.generateAssignStateOutOfFinally_(destination, finallyState), createBreakStatement());
  };
  State.generateAssignState = function(enclosingFinally, fallThroughState) {
    var assignState;
    if (isFinallyExit(enclosingFinally, fallThroughState)) {
      assignState = State.generateAssignStateOutOfFinally(enclosingFinally, fallThroughState);
    } else {
      assignState = createStatementList(createAssignStateStatement(fallThroughState));
    }
    return assignState;
  };
  function isFinallyExit(enclosingFinally, destination) {
    return enclosingFinally != null && enclosingFinally.tryStates.indexOf(destination) < 0;
  }
  State.generateAssignStateOutOfFinally = function(enclosingFinally, destination) {
    return State.generateAssignStateOutOfFinally_(destination, enclosingFinally.finallyState);
  };
  State.generateAssignStateOutOfFinally_ = function(destination, finallyState) {
    return createStatementList(createAssignStateStatement(finallyState), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(destination)));
  };
  State.replaceStateList = function(oldStates, oldState, newState) {
    var states = [];
    for (var i = 0; i < oldStates.length; i++) {
      states.push(State.replaceStateId(oldStates[i], oldState, newState));
    }
    return states;
  };
  State.replaceStateId = function(current, oldState, newState) {
    return current == oldState ? newState: current;
  };
  State.replaceAllStates = function(exceptionBlocks, oldState, newState) {
    var result = [];
    for (var i = 0; i < exceptionBlocks.length; i++) {
      result.push(exceptionBlocks[i].replaceState(oldState, newState));
    }
    return result;
  };
  return {get State() {
      return State;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/TryState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var Kind = {
    CATCH: 'catch',
    FINALLY: 'finally'
  };
  var TryState = function(kind, tryStates, nestedTrys) {
    this.kind = kind;
    this.tryStates = tryStates;
    this.nestedTrys = nestedTrys;
  };
  TryState = ($traceurRuntime.createClass)(TryState, {
    replaceAllStates: function(oldState, newState) {
      return State.replaceStateList(this.tryStates, oldState, newState);
    },
    replaceNestedTrys: function(oldState, newState) {
      var states = [];
      for (var i = 0; i < this.nestedTrys.length; i++) {
        states.push(this.nestedTrys[i].replaceState(oldState, newState));
      }
      return states;
    }
  }, {});
  TryState.Kind = Kind;
  return {get TryState() {
      return TryState;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/trees/StateMachine", function() {
  "use strict";
  var ParseTree = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTree").ParseTree;
  var STATE_MACHINE = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").STATE_MACHINE;
  var TryState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/TryState").TryState;
  function addCatchOrFinallyStates(kind, enclosingMap, tryStates) {
    for (var i = 0; i < tryStates.length; i++) {
      var tryState = tryStates[i];
      if (tryState.kind == kind) {
        for (var j = 0; j < tryState.tryStates.length; j++) {
          var id = tryState.tryStates[j];
          enclosingMap[id] = tryState;
        }
      }
      addCatchOrFinallyStates(kind, enclosingMap, tryState.nestedTrys);
    }
  }
  function addAllCatchStates(tryStates, catches) {
    for (var i = 0; i < tryStates.length; i++) {
      var tryState = tryStates[i];
      if (tryState.kind == TryState.Kind.CATCH) {
        catches.push(tryState);
      }
      addAllCatchStates(tryState.nestedTrys, catches);
    }
  }
  var StateMachine = function(startState, fallThroughState, states, exceptionBlocks) {
    this.location = null;
    this.startState = startState;
    this.fallThroughState = fallThroughState;
    this.states = states;
    this.exceptionBlocks = exceptionBlocks;
  };
  StateMachine = ($traceurRuntime.createClass)(StateMachine, {
    get type() {
      return STATE_MACHINE;
    },
    transform: function(transformer) {
      return transformer.transformStateMachine(this);
    },
    visit: function(visitor) {
      visitor.visitStateMachine(this);
    },
    hasExceptionBlocks: function() {
      return this.exceptionBlocks.length > 0;
    },
    getAllStateIDs: function() {
      var result = [];
      for (var i = 0; i < this.states.length; i++) {
        result.push(this.states[i].id);
      }
      return result;
    },
    getEnclosingFinallyMap: function() {
      var enclosingMap = Object.create(null);
      addCatchOrFinallyStates(TryState.Kind.FINALLY, enclosingMap, this.exceptionBlocks);
      return enclosingMap;
    },
    getEnclosingCatchMap: function() {
      var enclosingMap = Object.create(null);
      addCatchOrFinallyStates(TryState.Kind.CATCH, enclosingMap, this.exceptionBlocks);
      return enclosingMap;
    },
    allCatchStates: function() {
      var catches = [];
      addAllCatchStates(this.exceptionBlocks, catches);
      return catches;
    }
  }, {}, ParseTree);
  return {get StateMachine() {
      return StateMachine;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/FallThroughState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var FallThroughState = function(id, fallThroughState, statements) {
    $traceurRuntime.superCall(this, $FallThroughState.prototype, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.statements = statements;
  };
  var $FallThroughState = ($traceurRuntime.createClass)(FallThroughState, {
    replaceState: function(oldState, newState) {
      return new FallThroughState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.statements);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $traceurRuntime.spread(this.statements, State.generateJump(enclosingFinally, this.fallThroughState));
    }
  }, {}, State);
  return {get FallThroughState() {
      return FallThroughState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/BreakState", function() {
  "use strict";
  var FallThroughState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FallThroughState").FallThroughState;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var createStatementList = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createStatementList;
  var BreakState = function(id, label) {
    $traceurRuntime.superCall(this, $BreakState.prototype, "constructor", [id]);
    this.label = label;
  };
  var $BreakState = ($traceurRuntime.createClass)(BreakState, {
    replaceState: function(oldState, newState) {
      return new BreakState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreak: function(labelSet, breakState) {
      if (this.label == null || this.label in labelSet) {
        return new FallThroughState(this.id, breakState, createStatementList());
      }
      return this;
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      return this.transformBreak(labelSet, breakState);
    }
  }, {}, State);
  return {get BreakState() {
      return BreakState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/ContinueState", function() {
  "use strict";
  var FallThroughState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FallThroughState").FallThroughState;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var createStatementList = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createStatementList;
  var ContinueState = function(id, label) {
    $traceurRuntime.superCall(this, $ContinueState.prototype, "constructor", [id]);
    this.label = label;
  };
  var $ContinueState = ($traceurRuntime.createClass)(ContinueState, {
    replaceState: function(oldState, newState) {
      return new ContinueState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      if (this.label == null || this.label in labelSet) {
        return new FallThroughState(this.id, continueState, createStatementList());
      }
      return this;
    }
  }, {}, State);
  return {get ContinueState() {
      return ContinueState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/BreakContinueTransformer", function() {
  "use strict";
  var BreakState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/BreakState").BreakState;
  var ContinueState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/ContinueState").ContinueState;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var StateMachine = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/StateMachine").StateMachine;
  function safeGetLabel(tree) {
    return tree.name ? tree.name.value: null;
  }
  var BreakContinueTransformer = function(stateAllocator) {
    $traceurRuntime.superCall(this, $BreakContinueTransformer.prototype, "constructor", []);
    this.transformBreaks_ = true;
    this.stateAllocator_ = stateAllocator;
  };
  var $BreakContinueTransformer = ($traceurRuntime.createClass)(BreakContinueTransformer, {
    allocateState_: function() {
      return this.stateAllocator_.allocateState();
    },
    stateToStateMachine_: function(newState) {
      var fallThroughState = this.allocateState_();
      return new StateMachine(newState.id, fallThroughState, [newState], []);
    },
    transformBreakStatement: function(tree) {
      return this.transformBreaks_ || tree.name ? this.stateToStateMachine_(new BreakState(this.allocateState_(), safeGetLabel(tree))): tree;
    },
    transformContinueStatement: function(tree) {
      return this.stateToStateMachine_(new ContinueState(this.allocateState_(), safeGetLabel(tree)));
    },
    transformDoWhileStatement: function(tree) {
      return tree;
    },
    transformForOfStatement: function(tree) {
      return tree;
    },
    transformForStatement: function(tree) {
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      return tree;
    },
    transformFunctionExpression: function(tree) {
      return tree;
    },
    transformStateMachine: function(tree) {
      return tree;
    },
    transformSwitchStatement: function(tree) {
      var oldState = this.transformBreaks_;
      this.transformBreaks_ = false;
      var result = $traceurRuntime.superCall(this, $BreakContinueTransformer.prototype, "transformSwitchStatement", [tree]);
      this.transformBreaks_ = oldState;
      return result;
    },
    transformWhileStatement: function(tree) {
      return tree;
    }
  }, {}, ParseTreeTransformer);
  return {get BreakContinueTransformer() {
      return BreakContinueTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/CatchState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var TryState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/TryState").TryState;
  var CatchState = function(identifier, catchState, fallThroughState, allStates, nestedTrys) {
    $traceurRuntime.superCall(this, $CatchState.prototype, "constructor", [TryState.Kind.CATCH, allStates, nestedTrys]);
    this.identifier = identifier;
    this.catchState = catchState;
    this.fallThroughState = fallThroughState;
  };
  var $CatchState = ($traceurRuntime.createClass)(CatchState, {replaceState: function(oldState, newState) {
      return new CatchState(this.identifier, State.replaceStateId(this.catchState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, TryState);
  return {get CatchState() {
      return CatchState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/ConditionalState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var $__212 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createBlock = $__212.createBlock,
      createIfStatement = $__212.createIfStatement;
  var ConditionalState = function(id, ifState, elseState, condition) {
    $traceurRuntime.superCall(this, $ConditionalState.prototype, "constructor", [id]);
    this.ifState = ifState;
    this.elseState = elseState;
    this.condition = condition;
  };
  var $ConditionalState = ($traceurRuntime.createClass)(ConditionalState, {
    replaceState: function(oldState, newState) {
      return new ConditionalState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.ifState, oldState, newState), State.replaceStateId(this.elseState, oldState, newState), this.condition);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return [createIfStatement(this.condition, createBlock(State.generateJump(enclosingFinally, this.ifState)), createBlock(State.generateJump(enclosingFinally, this.elseState)))];
    }
  }, {}, State);
  return {get ConditionalState() {
      return ConditionalState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/FinallyFallThroughState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var FinallyFallThroughState = function() {
    $traceurRuntime.defaultSuperCall(this, $FinallyFallThroughState.prototype, arguments);
  };
  var $FinallyFallThroughState = ($traceurRuntime.createClass)(FinallyFallThroughState, {
    replaceState: function(oldState, newState) {
      return new FinallyFallThroughState(State.replaceStateId(this.id, oldState, newState));
    },
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return null;
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('these are generated in addFinallyFallThroughDispatches');
    }
  }, {}, State);
  return {get FinallyFallThroughState() {
      return FinallyFallThroughState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/FinallyState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var TryState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/TryState").TryState;
  var FinallyState = function(finallyState, fallThroughState, allStates, nestedTrys) {
    $traceurRuntime.superCall(this, $FinallyState.prototype, "constructor", [TryState.Kind.FINALLY, allStates, nestedTrys]);
    this.finallyState = finallyState;
    this.fallThroughState = fallThroughState;
  };
  var $FinallyState = ($traceurRuntime.createClass)(FinallyState, {replaceState: function(oldState, newState) {
      return new FinallyState(State.replaceStateId(this.finallyState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, TryState);
  return {get FinallyState() {
      return FinallyState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/StateAllocator", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var StateAllocator = function() {
    this.nextState_ = State.INVALID_STATE + 1;
  };
  StateAllocator = ($traceurRuntime.createClass)(StateAllocator, {allocateState: function() {
      return this.nextState_++;
    }}, {});
  return {get StateAllocator() {
      return StateAllocator;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/SwitchState", function() {
  "use strict";
  var $__220 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      CaseClause = $__220.CaseClause,
      DefaultClause = $__220.DefaultClause,
      SwitchStatement = $__220.SwitchStatement;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var $__220 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createBreakStatement = $__220.createBreakStatement,
      createStatementList = $__220.createStatementList;
  var SwitchClause = function(first, second) {
    this.first = first;
    this.second = second;
  };
  SwitchClause = ($traceurRuntime.createClass)(SwitchClause, {}, {});
  var SwitchState = function(id, expression, clauses) {
    $traceurRuntime.superCall(this, $SwitchState.prototype, "constructor", [id]);
    this.expression = expression;
    this.clauses = clauses;
  };
  var $SwitchState = ($traceurRuntime.createClass)(SwitchState, {
    replaceState: function(oldState, newState) {
      var clauses = this.clauses.map((function(clause) {
        return new SwitchClause(clause.first, State.replaceStateId(clause.second, oldState, newState));
      }));
      return new SwitchState(State.replaceStateId(this.id, oldState, newState), this.expression, clauses);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      var clauses = [];
      for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i];
        if (clause.first == null) {
          clauses.push(new DefaultClause(null, State.generateJump(enclosingFinally, clause.second)));
        } else {
          clauses.push(new CaseClause(null, clause.first, State.generateJump(enclosingFinally, clause.second)));
        }
      }
      return createStatementList(new SwitchStatement(null, this.expression, clauses), createBreakStatement());
    }
  }, {}, State);
  return {
    get SwitchClause() {
      return SwitchClause;
    },
    get SwitchState() {
      return SwitchState;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/CPSTransformer", function() {
  "use strict";
  var $__221 = Object.freeze(Object.defineProperties(["\n        return this.innerFunction($yieldSent, $yieldAction);"], {raw: {value: Object.freeze(["\n        return this.innerFunction($yieldSent, $yieldAction);"])}}));
  var BreakContinueTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/BreakContinueTransformer").BreakContinueTransformer;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      CASE_CLAUSE = $__223.CASE_CLAUSE,
      STATE_MACHINE = $__223.STATE_MACHINE,
      VARIABLE_DECLARATION_LIST = $__223.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__223.VARIABLE_STATEMENT;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      CaseClause = $__223.CaseClause,
      IdentifierExpression = $__223.IdentifierExpression,
      SwitchStatement = $__223.SwitchStatement;
  var CatchState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/CatchState").CatchState;
  var ConditionalState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/ConditionalState").ConditionalState;
  var FallThroughState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FallThroughState").FallThroughState;
  var FinallyFallThroughState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FinallyFallThroughState").FinallyFallThroughState;
  var FinallyState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FinallyState").FinallyState;
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var parseStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseStatement;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      $ARGUMENTS = $__223.$ARGUMENTS,
      $THAT = $__223.$THAT,
      ARGUMENTS = $__223.ARGUMENTS,
      CAUGHT_EXCEPTION = $__223.CAUGHT_EXCEPTION,
      FINALLY_FALL_THROUGH = $__223.FINALLY_FALL_THROUGH,
      STATE = $__223.STATE,
      STORED_EXCEPTION = $__223.STORED_EXCEPTION,
      YIELD_ACTION = $__223.YIELD_ACTION,
      YIELD_SENT = $__223.YIELD_SENT;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var StateAllocator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/StateAllocator").StateAllocator;
  var StateMachine = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/StateMachine").StateMachine;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/SwitchState"),
      SwitchClause = $__223.SwitchClause,
      SwitchState = $__223.SwitchState;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      PLUS = $__223.PLUS,
      VAR = $__223.VAR;
  var TryState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/TryState").TryState;
  var $__223 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignStateStatement = $__223.createAssignStateStatement,
      createAssignmentExpression = $__223.createAssignmentExpression,
      createAssignmentStatement = $__223.createAssignmentStatement,
      createBinaryOperator = $__223.createBinaryOperator,
      createBindingIdentifier = $__223.createBindingIdentifier,
      createBlock = $__223.createBlock,
      createBreakStatement = $__223.createBreakStatement,
      createCaseClause = $__223.createCaseClause,
      createCatch = $__223.createCatch,
      createCommaExpression = $__223.createCommaExpression,
      createDefaultClause = $__223.createDefaultClause,
      createEmptyStatement = $__223.createEmptyStatement,
      createFunctionBody = $__223.createFunctionBody,
      createExpressionStatement = $__223.createExpressionStatement,
      createFunctionExpression = $__223.createFunctionExpression,
      createIdentifierExpression = $__223.createIdentifierExpression,
      createNumberLiteral = $__223.createNumberLiteral,
      createOperatorToken = $__223.createOperatorToken,
      createParameterList = $__223.createParameterList,
      createStatementList = $__223.createStatementList,
      createStringLiteral = $__223.createStringLiteral,
      createSwitchStatement = $__223.createSwitchStatement,
      createThrowStatement = $__223.createThrowStatement,
      createTrueLiteral = $__223.createTrueLiteral,
      createTryStatement = $__223.createTryStatement,
      createVariableStatement = $__223.createVariableStatement,
      createWhileStatement = $__223.createWhileStatement;
  var variablesInBlock = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/VariableBinder").variablesInBlock;
  var CPSTransformer = function(reporter) {
    $traceurRuntime.superCall(this, $CPSTransformer.prototype, "constructor", []);
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
  };
  var $CPSTransformer = ($traceurRuntime.createClass)(CPSTransformer, {
    allocateState: function() {
      return this.stateAllocator_.allocateState();
    },
    transformBlock: function(tree) {
      this.clearLabels_();
      var transformedTree = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformBlock", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      return machine == null ? transformedTree: machine;
    },
    transformFunctionBody: function(tree) {
      this.clearLabels_();
      var transformedTree = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformFunctionBody", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      return machine == null ? transformedTree: machine;
    },
    transformStatementList_: function(someTransformed) {
      if (!this.containsStateMachine_(someTransformed)) {
        return null;
      }
      var currentMachine = this.ensureTransformed_(someTransformed[0]);
      for (var index = 1; index < someTransformed.length; index++) {
        currentMachine = this.createSequence_(currentMachine, this.ensureTransformed_(someTransformed[index]));
      }
      return currentMachine;
    },
    containsStateMachine_: function(statements) {
      if (statements instanceof Array) {
        for (var i = 0; i < statements.length; i++) {
          if (statements[i].type == STATE_MACHINE) {
            return true;
          }
        }
        return false;
      }
      assert(statements instanceof SwitchStatement);
      for (var i = 0; i < statements.caseClauses.length; i++) {
        var clause = statements.caseClauses[i];
        if (clause.type == CASE_CLAUSE) {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        } else {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        }
      }
      return false;
    },
    transformCaseClause: function(tree) {
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformCaseClause", [tree]);
      var machine = this.transformStatementList_(result.statements);
      return machine == null ? result: new CaseClause(null, result.expression, createStatementList(machine));
    },
    transformDoWhileStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformDoWhileStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.startState;
      var conditionState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState, labels, states);
      states.push(new ConditionalState(conditionState, startState, fallThroughState, result.condition));
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    addLoopBodyStates_: function(loopBodyMachine, continueState, breakState, labels, states) {
      for (var i = 0; i < loopBodyMachine.states.length; i++) {
        var state = loopBodyMachine.states[i];
        states.push(state.transformBreakOrContinue(labels, breakState, continueState));
      }
    },
    transformForStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformForStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var incrementState = loopBodyMachine.fallThroughState;
      var conditionState = result.increment == null && result.condition != null ? incrementState: this.allocateState();
      var startState = result.initialiser == null ? (result.condition == null ? loopBodyMachine.startState: conditionState): this.allocateState();
      var fallThroughState = this.allocateState();
      var states = [];
      if (result.initialiser != null) {
        states.push(new FallThroughState(startState, conditionState, createStatementList(createExpressionStatement(result.initialiser))));
      }
      if (result.condition != null) {
        states.push(new ConditionalState(conditionState, loopBodyMachine.startState, fallThroughState, result.condition));
      } else {
        states.push(new FallThroughState(conditionState, loopBodyMachine.startState, createStatementList()));
      }
      if (result.increment != null) {
        states.push(new FallThroughState(incrementState, conditionState, createStatementList(createExpressionStatement(result.increment))));
      }
      this.addLoopBodyStates_(loopBodyMachine, incrementState, fallThroughState, labels, states);
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    transformForInStatement: function(tree) {
      return tree;
    },
    transformForOfStatement: function(tree) {
      throw new Error('for of statements should be transformed before this pass');
    },
    transformIfStatement: function(tree) {
      var $__224;
      this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformIfStatement", [tree]);
      if (result.ifClause.type != STATE_MACHINE && (result.elseClause == null || result.elseClause.type != STATE_MACHINE)) {
        return result;
      }
      var ifClause = this.ensureTransformed_(result.ifClause);
      var elseClause = this.ensureTransformed_(result.elseClause);
      var startState = this.allocateState();
      var fallThroughState = ifClause.fallThroughState;
      var ifState = ifClause.startState;
      var elseState = elseClause == null ? fallThroughState: elseClause.startState;
      var states = [];
      var exceptionBlocks = [];
      states.push(new ConditionalState(startState, ifState, elseState, result.condition));
      ($__224 = states).push.apply($__224, $traceurRuntime.toObject(ifClause.states));
      ($__224 = exceptionBlocks).push.apply($__224, $traceurRuntime.toObject(ifClause.exceptionBlocks));
      if (elseClause != null) {
        this.replaceAndAddStates_(elseClause.states, elseClause.fallThroughState, fallThroughState, states);
        ($__224 = exceptionBlocks).push.apply($__224, $traceurRuntime.toObject(State.replaceAllStates(elseClause.exceptionBlocks, elseClause.fallThroughState, fallThroughState)));
      }
      return new StateMachine(startState, fallThroughState, states, exceptionBlocks);
    },
    removeEmptyStates: function(oldStates) {
      var emptyStates = [],
          newStates = [];
      for (var i = 0; i < oldStates.length; i++) {
        if (oldStates[i]instanceof FallThroughState && oldStates[i].statements.length === 0) {
          emptyStates.push(oldStates[i]);
        } else {
          newStates.push(oldStates[i]);
        }
      }
      for (i = 0; i < newStates.length; i++) {
        newStates[i] = emptyStates.reduce((function(state, $__223) {
          var id = $__223.id,
              fallThroughState = $__223.fallThroughState;
          return state.replaceState(id, fallThroughState);
        }), newStates[i]);
      }
      return newStates;
    },
    replaceAndAddStates_: function(oldStates, oldState, newState, newStates) {
      for (var i = 0; i < oldStates.length; i++) {
        newStates.push(oldStates[i].replaceState(oldState, newState));
      }
    },
    transformLabelledStatement: function(tree) {
      var oldLabels = this.addLabel_(tree.name.value);
      var result = this.transformAny(tree.statement);
      this.restoreLabels_(oldLabels);
      return result;
    },
    clearLabels_: function() {
      var result = this.labelSet_;
      this.labelSet_ = Object.create(null);
      return result;
    },
    restoreLabels_: function(oldLabels) {
      this.labelSet_ = oldLabels;
    },
    addLabel_: function(label) {
      var oldLabels = this.labelSet_;
      var labelSet = Object.create(null);
      for (var k in this.labelSet_) {
        labelSet[k] = k;
      }
      labelSet[label] = label;
      this.labelSet_ = labelSet;
      return oldLabels;
    },
    transformSwitchStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformSwitchStatement", [tree]);
      if (!this.containsStateMachine_(result)) {
        return result;
      }
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      var nextState = fallThroughState;
      var states = [];
      var clauses = [];
      var tryStates = [];
      var hasDefault = false;
      for (var index = result.caseClauses.length - 1; index >= 0; index--) {
        var clause = result.caseClauses[index];
        if (clause.type == CASE_CLAUSE) {
          var caseClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, caseClause.statements, states, tryStates);
          clauses.push(new SwitchClause(caseClause.expression, nextState));
        } else {
          hasDefault = true;
          var defaultClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, defaultClause.statements, states, tryStates);
          clauses.push(new SwitchClause(null, nextState));
        }
      }
      if (!hasDefault) {
        clauses.push(new SwitchClause(null, fallThroughState));
      }
      states.push(new SwitchState(startState, result.expression, clauses.reverse()));
      return new StateMachine(startState, fallThroughState, states.reverse(), tryStates);
    },
    addSwitchClauseStates_: function(nextState, fallThroughState, labels, statements, states, tryStates) {
      var $__224;
      var machine = this.ensureTransformedList_(statements);
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var transformedState = state.transformBreak(labels, fallThroughState);
        states.push(transformedState.replaceState(machine.fallThroughState, nextState));
      }
      ($__224 = tryStates).push.apply($__224, $traceurRuntime.toObject(machine.exceptionBlocks));
      return machine.startState;
    },
    transformTryStatement: function(tree) {
      this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformTryStatement", [tree]);
      if (result.body.type != STATE_MACHINE && (result.catchBlock == null || result.catchBlock.catchBody.type != STATE_MACHINE)) {
        return result;
      }
      var tryMachine = this.ensureTransformed_(result.body);
      if (result.catchBlock != null) {
        var catchBlock = result.catchBlock;
        var exceptionName = catchBlock.binding.identifierToken.value;
        var catchMachine = this.ensureTransformed_(catchBlock.catchBody);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;
        var catchStart = this.allocateState();
        var states = $traceurRuntime.spread(tryMachine.states);
        states.push(new FallThroughState(catchStart, catchMachine.startState, createStatementList(createAssignmentStatement(createIdentifierExpression(exceptionName), createIdentifierExpression(STORED_EXCEPTION)))));
        this.replaceAndAddStates_(catchMachine.states, catchMachine.fallThroughState, fallThroughState, states);
        tryMachine = new StateMachine(startState, fallThroughState, states, [new CatchState(exceptionName, catchStart, fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
      }
      if (result.finallyBlock != null) {
        var finallyBlock = result.finallyBlock;
        var finallyMachine = this.ensureTransformed_(finallyBlock.block);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;
        var states = $traceurRuntime.spread(tryMachine.states, finallyMachine.states, [new FinallyFallThroughState(finallyMachine.fallThroughState)]);
        tryMachine = new StateMachine(startState, fallThroughState, states, [new FinallyState(finallyMachine.startState, finallyMachine.fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
      }
      return tryMachine;
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformVariableDeclarationList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      if (declarations == null) {
        return createEmptyStatement();
      }
      if (declarations.type == VARIABLE_DECLARATION_LIST) {
        return createVariableStatement(declarations);
      }
      return createExpressionStatement(declarations);
    },
    transformVariableDeclarationList: function(tree) {
      if (tree.declarationType == VAR) {
        var expressions = [];
        for (var i = 0; i < tree.declarations.length; i++) {
          var declaration = tree.declarations[i];
          if (declaration.initialiser != null) {
            expressions.push(createAssignmentExpression(createIdentifierExpression(this.transformAny(declaration.lvalue)), this.transformAny(declaration.initialiser)));
          }
        }
        var list = expressions;
        if (list.length == 0) {
          return null;
        } else if (list.length == 1) {
          return list[0];
        } else {
          return createCommaExpression(expressions);
        }
      }
      return $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformVariableDeclarationList", [tree]);
    },
    transformWhileStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformWhileStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      states.push(new ConditionalState(startState, loopBodyMachine.startState, fallThroughState, result.condition));
      this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState, labels, states);
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    transformWithStatement: function(tree) {
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformWithStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      throw new Error('Unreachable - with statement not allowed in strict mode/harmony');
    },
    transformThisExpression: function(tree) {
      return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $THAT));
    },
    transformIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === ARGUMENTS) {
        return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $ARGUMENTS));
      }
      return tree;
    },
    generateMachineMethod: function(machine) {
      return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createFunctionBody([createWhileStatement(createTrueLiteral(), this.generateMachine(machine))]));
    },
    generateMachineInnerFunction: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();
      var rethrowState = this.allocateState();
      var machineEndState = this.allocateState();
      var body = createWhileStatement(createTrueLiteral(), createSwitchStatement(createIdentifierExpression(STATE), this.transformMachineStates(machine, State.END_STATE, State.RETHROW_STATE, enclosingFinallyState)));
      return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createFunctionBody([body]));
    },
    generateMachine: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();
      var body = parseStatement($__221);
      var caseClauses = [];
      this.addExceptionCases_(State.RETHROW_STATE, enclosingFinallyState, enclosingCatchState, machine.states, caseClauses);
      caseClauses.push(createDefaultClause(this.machineUncaughtExceptionStatements(State.RETHROW_STATE, State.END_STATE)));
      body = createTryStatement(createBlock(body), createCatch(createBindingIdentifier(CAUGHT_EXCEPTION), createBlock(createAssignmentStatement(createIdentifierExpression(STORED_EXCEPTION), createIdentifierExpression(CAUGHT_EXCEPTION)), createSwitchStatement(createIdentifierExpression(STATE), caseClauses))), null);
      return body;
    },
    getMachineVariables: function(tree, machine) {
      var statements = [];
      statements.push(createVariableStatement(VAR, STATE, createNumberLiteral(machine.startState)));
      statements.push(createVariableStatement(VAR, STORED_EXCEPTION, null));
      statements.push(createVariableStatement(VAR, FINALLY_FALL_THROUGH, null));
      var liftedIdentifiers = variablesInBlock(tree, true);
      var allCatchStates = machine.allCatchStates();
      for (var i = 0; i < allCatchStates.length; i++) {
        liftedIdentifiers[allCatchStates[i].identifier] = true;
      }
      var liftedIdentifierList = Object.keys(liftedIdentifiers).sort();
      for (var i = 0; i < liftedIdentifierList.length; i++) {
        var liftedIdentifier = liftedIdentifierList[i];
        statements.push(createVariableStatement(VAR, liftedIdentifier, null));
      }
      return statements;
    },
    addExceptionCases_: function(rethrowState, enclosingFinallyState, enclosingCatchState, allStates, caseClauses) {
      for (var i = 0; i < allStates.length; i++) {
        var state = allStates[i].id;
        var statements = allStates[i].statements;
        var finallyState = enclosingFinallyState[state];
        var catchState = enclosingCatchState[state];
        if (!statements || statements.length === 0) continue;
        if (catchState != null && finallyState != null && catchState.tryStates.indexOf(finallyState.finallyState) >= 0) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, catchState.catchState)));
        } else if (catchState != null) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), createStatementList(createAssignStateStatement(catchState.catchState), createBreakStatement())));
        } else if (finallyState != null) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, rethrowState)));
        } else {}
      }
    },
    transformFunctionDeclaration: function(tree) {
      this.clearLabels_();
      return tree;
    },
    transformFunctionExpression: function(tree) {
      this.clearLabels_();
      return tree;
    },
    transformGetAccessor: function(tree) {
      return tree;
    },
    transformSetAccessor: function(tree) {
      return tree;
    },
    transformStateMachine: function(tree) {
      return tree;
    },
    statementToStateMachine_: function(statement) {
      return this.statementsToStateMachine_([statement]);
    },
    statementsToStateMachine_: function(statements) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new FallThroughState(startState, fallThroughState, statements), fallThroughState);
    },
    stateToStateMachine_: function(newState, fallThroughState) {
      return new StateMachine(newState.id, fallThroughState, [newState], []);
    },
    transformMachineStates: function(machine, machineEndState, rethrowState, enclosingFinallyState) {
      var cases = [];
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var stateCase = state.transformMachineState(enclosingFinallyState[state.id], machineEndState, this.reporter);
        if (stateCase != null) {
          cases.push(stateCase);
        }
      }
      this.addFinallyFallThroughDispatches(null, machine.exceptionBlocks, cases);
      cases.push(createCaseClause(createNumberLiteral(machine.fallThroughState), this.machineFallThroughStatements(machineEndState)));
      cases.push(createCaseClause(createNumberLiteral(machineEndState), this.machineEndStatements()));
      cases.push(createCaseClause(createNumberLiteral(rethrowState), this.machineRethrowStatements(machineEndState)));
      cases.push(createDefaultClause([createThrowStatement(createBinaryOperator(createStringLiteral('traceur compiler bug: invalid state in state machine: '), createOperatorToken(PLUS), createIdentifierExpression(STATE)))]));
      return cases;
    },
    addFinallyFallThroughDispatches: function(enclosingFinallyState, tryStates, cases) {
      for (var i = 0; i < tryStates.length; i++) {
        var tryState = tryStates[i];
        if (tryState.kind == TryState.Kind.FINALLY) {
          var finallyState = tryState;
          if (enclosingFinallyState != null) {
            var caseClauses = [];
            var index = 0;
            for (var j = 0; j < enclosingFinallyState.tryStates.length; j++) {
              var destination = enclosingFinallyState.tryStates[j];
              index++;
              var statements;
              if (index < enclosingFinallyState.tryStates.length) {
                statements = createStatementList();
              } else {
                statements = createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(State.INVALID_STATE)), createBreakStatement());
              }
              caseClauses.push(createCaseClause(createNumberLiteral(destination), statements));
            }
            caseClauses.push(createDefaultClause(createStatementList(createAssignStateStatement(enclosingFinallyState.finallyState), createBreakStatement())));
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createSwitchStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), caseClauses), createBreakStatement())));
          } else {
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createBreakStatement())));
          }
          this.addFinallyFallThroughDispatches(finallyState, finallyState.nestedTrys, cases);
        } else {
          this.addFinallyFallThroughDispatches(enclosingFinallyState, tryState.nestedTrys, cases);
        }
      }
    },
    createSequence_: function(head, tail) {
      var states = $traceurRuntime.spread(head.states);
      for (var i = 0; i < tail.states.length; i++) {
        var tailState = tail.states[i];
        states.push(tailState.replaceState(tail.startState, head.fallThroughState));
      }
      var exceptionBlocks = $traceurRuntime.spread(head.exceptionBlocks);
      for (var i = 0; i < tail.exceptionBlocks.length; i++) {
        var tryState = tail.exceptionBlocks[i];
        exceptionBlocks.push(tryState.replaceState(tail.startState, head.fallThroughState));
      }
      return new StateMachine(head.startState, tail.fallThroughState, states, exceptionBlocks);
    },
    maybeTransformStatement_: function(maybeTransformedStatement) {
      if (maybeTransformedStatement.type == VARIABLE_STATEMENT && maybeTransformedStatement.declarations.declarationType != VAR) {
        this.reporter.reportError(maybeTransformedStatement.location != null ? maybeTransformedStatement.location.start: null, 'traceur: const/let declaration may not be ' + 'in a block containing a yield.');
      }
      var breakContinueTransformed = new BreakContinueTransformer(this.stateAllocator_).transformAny(maybeTransformedStatement);
      if (breakContinueTransformed != maybeTransformedStatement) {
        breakContinueTransformed = this.transformAny(breakContinueTransformed);
      }
      return breakContinueTransformed;
    },
    ensureTransformed_: function(statement) {
      if (statement == null) {
        return null;
      }
      var maybeTransformed = this.maybeTransformStatement_(statement);
      return maybeTransformed.type == STATE_MACHINE ? maybeTransformed: this.statementToStateMachine_(maybeTransformed);
    },
    ensureTransformedList_: function(statements) {
      var maybeTransformedStatements = [];
      var foundMachine = false;
      for (var i = 0; i < statements.length; i++) {
        var statement = statements[i];
        var maybeTransformedStatement = this.maybeTransformStatement_(statement);
        maybeTransformedStatements.push(maybeTransformedStatement);
        if (maybeTransformedStatement.type == STATE_MACHINE) {
          foundMachine = true;
        }
      }
      if (!foundMachine) {
        return this.statementsToStateMachine_(statements);
      }
      return this.transformStatementList_(maybeTransformedStatements);
    }
  }, {}, ParseTreeTransformer);
  return {get CPSTransformer() {
      return CPSTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/EndState", function() {
  "use strict";
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var EndState = function() {
    $traceurRuntime.defaultSuperCall(this, $EndState.prototype, arguments);
  };
  var $EndState = ($traceurRuntime.createClass)(EndState, {
    replaceState: function(oldState, newState) {
      return new EndState(State.replaceStateId(this.id, oldState, newState));
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return State.generateJump(enclosingFinally, machineEndState);
    }
  }, {}, State);
  return {get EndState() {
      return EndState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/AsyncTransformer", function() {
  "use strict";
  var $__227 = Object.freeze(Object.defineProperties(["$waitTask = ", ";\n            $waitTask.then($createCallback(", "),\n                           $createErrback(", "));\n            return"], {raw: {value: Object.freeze(["$waitTask = ", ";\n            $waitTask.then($createCallback(", "),\n                           $createErrback(", "));\n            return"])}})),
      $__228 = Object.freeze(Object.defineProperties(["", " = $value"], {raw: {value: Object.freeze(["", " = $value"])}})),
      $__229 = Object.freeze(Object.defineProperties(["throw $err"], {raw: {value: Object.freeze(["throw $err"])}})),
      $__230 = Object.freeze(Object.defineProperties(["$resolve(", ")"], {raw: {value: Object.freeze(["$resolve(", ")"])}})),
      $__231 = Object.freeze(Object.defineProperties(["var $that = this, $arguments = arguments,\n              $value, $err, $waitTask, $resolve,\n              $reject,\n              $result = new Promise(function(resolve, reject) {\n                $resolve = resolve;\n                $reject = reject;\n              }),\n              $G = {\n                GState: 0,\n                current: undefined,\n                yieldReturn: undefined,\n                innerFunction: ", ",\n                moveNext: ", "\n              },\n              $continuation = $G.moveNext.bind($G),\n              $createCallback = function(newState) {\n                return function (value) {\n                  $state = newState;\n                  $value = value;\n                  $continuation();\n                };\n              },\n              $createErrback = function(newState) {\n                return function (err) {\n                  $state = newState;\n                  $err = err;\n                  $continuation();\n                };\n              };\n              $continuation();\n              return $result"], {raw: {value: Object.freeze(["var $that = this, $arguments = arguments,\n              $value, $err, $waitTask, $resolve,\n              $reject,\n              $result = new Promise(function(resolve, reject) {\n                $resolve = resolve;\n                $reject = reject;\n              }),\n              $G = {\n                GState: 0,\n                current: undefined,\n                yieldReturn: undefined,\n                innerFunction: ", ",\n                moveNext: ", "\n              },\n              $continuation = $G.moveNext.bind($G),\n              $createCallback = function(newState) {\n                return function (value) {\n                  $state = newState;\n                  $value = value;\n                  $continuation();\n                };\n              },\n              $createErrback = function(newState) {\n                return function (err) {\n                  $state = newState;\n                  $err = err;\n                  $continuation();\n                };\n              };\n              $continuation();\n              return $result"])}})),
      $__232 = Object.freeze(Object.defineProperties(["$reject($storedException)"], {raw: {value: Object.freeze(["$reject($storedException)"])}}));
  var CPSTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/CPSTransformer").CPSTransformer;
  var EndState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/EndState").EndState;
  var FallThroughState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/FallThroughState").FallThroughState;
  var STATE_MACHINE = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").STATE_MACHINE;
  var $__234 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseStatement = $__234.parseStatement,
      parseStatements = $__234.parseStatements;
  var StateMachine = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/StateMachine").StateMachine;
  var VAR = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").VAR;
  var $__234 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignStateStatement = $__234.createAssignStateStatement,
      createBreakStatement = $__234.createBreakStatement,
      createFunctionBody = $__234.createFunctionBody,
      createReturnStatement = $__234.createReturnStatement,
      createStatementList = $__234.createStatementList,
      createUndefinedExpression = $__234.createUndefinedExpression;
  var AsyncTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $AsyncTransformer.prototype, arguments);
  };
  var $AsyncTransformer = ($traceurRuntime.createClass)(AsyncTransformer, {
    transformYieldExpression: function(tree) {
      this.reporter.reportError(tree.location.start, 'Async function may not have a yield expression.');
      return tree;
    },
    transformAwaitStatement: function(tree) {
      var createTaskState = this.allocateState();
      var callbackState = this.allocateState();
      var errbackState = this.allocateState();
      var fallThroughState = this.allocateState();
      var states = [];
      var expression = this.transformAny(tree.expression);
      states.push(new FallThroughState(createTaskState, callbackState, parseStatements($__227, expression, callbackState, errbackState)));
      var assignment;
      if (tree.identifier != null) {
        assignment = createStatementList(parseStatement($__228, tree.identifier));
      } else {
        assignment = createStatementList();
      }
      states.push(new FallThroughState(callbackState, fallThroughState, assignment));
      states.push(new FallThroughState(errbackState, fallThroughState, createStatementList(parseStatement($__229))));
      return new StateMachine(createTaskState, fallThroughState, states, []);
    },
    transformFinally: function(tree) {
      var result = $traceurRuntime.superCall(this, $AsyncTransformer.prototype, "transformFinally", [tree]);
      if (result.block.type != STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'await not permitted within a finally block.');
      return result;
    },
    transformReturnStatement: function(tree) {
      var result = tree.expression;
      if (result == null) {
        result = createUndefinedExpression();
      }
      var startState = this.allocateState();
      var endState = this.allocateState();
      var completeState = new FallThroughState(startState, endState, createStatementList(this.createCompleteTask_(result)));
      var end = new EndState(endState);
      return new StateMachine(startState, this.allocateState(), [completeState, end], []);
    },
    createCompleteTask_: function(result) {
      return parseStatement($__230, result);
    },
    transformAsyncBody: function(tree) {
      var transformedTree = this.transformAny(tree);
      if (this.reporter.hadError()) {
        return tree;
      }
      var machine = transformedTree;
      var statements = $traceurRuntime.spread(this.getMachineVariables(tree, machine), parseStatements($__231, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
      return createFunctionBody(statements);
    },
    machineUncaughtExceptionStatements: function(rethrowState, machineEndState) {
      return createStatementList(createAssignStateStatement(rethrowState), createBreakStatement());
    },
    machineEndStatements: function() {
      return createStatementList(createReturnStatement(null));
    },
    machineFallThroughStatements: function(machineEndState) {
      return createStatementList(this.createCompleteTask_(createUndefinedExpression()), createAssignStateStatement(machineEndState), createBreakStatement());
    },
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(parseStatement($__232), createAssignStateStatement(machineEndState), createBreakStatement());
    }
  }, {}, CPSTransformer);
  AsyncTransformer.transformAsyncBody = function(reporter, body) {
    return new AsyncTransformer(reporter).transformAsyncBody(body);
  };
  return {get AsyncTransformer() {
      return AsyncTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/ForInTransformPass", function() {
  "use strict";
  var $__236 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      BLOCK = $__236.BLOCK,
      VARIABLE_DECLARATION_LIST = $__236.VARIABLE_DECLARATION_LIST,
      IDENTIFIER_EXPRESSION = $__236.IDENTIFIER_EXPRESSION;
  var $__236 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      LENGTH = $__236.LENGTH,
      PUSH = $__236.PUSH;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__236 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      BANG = $__236.BANG,
      IN = $__236.IN,
      OPEN_ANGLE = $__236.OPEN_ANGLE,
      PLUS_PLUS = $__236.PLUS_PLUS,
      VAR = $__236.VAR;
  var $__236 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__236.createArgumentList,
      createAssignmentStatement = $__236.createAssignmentStatement,
      createBinaryOperator = $__236.createBinaryOperator,
      createBlock = $__236.createBlock,
      createCallStatement = $__236.createCallStatement,
      createContinueStatement = $__236.createContinueStatement,
      createEmptyArrayLiteralExpression = $__236.createEmptyArrayLiteralExpression,
      createForInStatement = $__236.createForInStatement,
      createForStatement = $__236.createForStatement,
      createIdentifierExpression = $__236.createIdentifierExpression,
      createIfStatement = $__236.createIfStatement,
      createMemberExpression = $__236.createMemberExpression,
      createMemberLookupExpression = $__236.createMemberLookupExpression,
      createNumberLiteral = $__236.createNumberLiteral,
      createOperatorToken = $__236.createOperatorToken,
      createParenExpression = $__236.createParenExpression,
      createPostfixExpression = $__236.createPostfixExpression,
      createUnaryExpression = $__236.createUnaryExpression,
      createVariableDeclarationList = $__236.createVariableDeclarationList,
      createVariableStatement = $__236.createVariableStatement;
  var ForInTransformPass = function() {
    $traceurRuntime.defaultSuperCall(this, $ForInTransformPass.prototype, arguments);
  };
  var $ForInTransformPass = ($traceurRuntime.createClass)(ForInTransformPass, {transformForInStatement: function(original) {
      var $__237;
      var tree = original;
      var bodyStatements = [];
      var body = this.transformAny(tree.body);
      if (body.type == BLOCK) {
        ($__237 = bodyStatements).push.apply($__237, $traceurRuntime.toObject(body.statements));
      } else {
        bodyStatements.push(body);
      }
      var elements = [];
      var keys = this.getTempIdentifier();
      elements.push(createVariableStatement(VAR, keys, createEmptyArrayLiteralExpression()));
      var collection = this.getTempIdentifier();
      elements.push(createVariableStatement(VAR, collection, tree.collection));
      var p = this.getTempIdentifier();
      elements.push(createForInStatement(createVariableDeclarationList(VAR, p, null), createIdentifierExpression(collection), createCallStatement(createMemberExpression(keys, PUSH), createArgumentList(createIdentifierExpression(p)))));
      var i = this.getTempIdentifier();
      var lookup = createMemberLookupExpression(createIdentifierExpression(keys), createIdentifierExpression(i));
      var originalKey,
          assignOriginalKey;
      if (tree.initialiser.type == VARIABLE_DECLARATION_LIST) {
        var decList = tree.initialiser;
        originalKey = createIdentifierExpression(decList.declarations[0].lvalue);
        assignOriginalKey = createVariableStatement(decList.declarationType, originalKey.identifierToken, lookup);
      } else if (tree.initialiser.type == IDENTIFIER_EXPRESSION) {
        originalKey = tree.initialiser;
        assignOriginalKey = createAssignmentStatement(tree.initialiser, lookup);
      } else {
        throw new Error('Invalid left hand side of for in loop');
      }
      var innerBlock = [];
      innerBlock.push(assignOriginalKey);
      innerBlock.push(createIfStatement(createUnaryExpression(createOperatorToken(BANG), createParenExpression(createBinaryOperator(originalKey, createOperatorToken(IN), createIdentifierExpression(collection)))), createContinueStatement(), null));
      ($__237 = innerBlock).push.apply($__237, $traceurRuntime.toObject(bodyStatements));
      elements.push(createForStatement(createVariableDeclarationList(VAR, i, createNumberLiteral(0)), createBinaryOperator(createIdentifierExpression(i), createOperatorToken(OPEN_ANGLE), createMemberExpression(keys, LENGTH)), createPostfixExpression(createIdentifierExpression(i), createOperatorToken(PLUS_PLUS)), createBlock(innerBlock)));
      return createBlock(elements);
    }}, {}, TempVarTransformer);
  return {get ForInTransformPass() {
      return ForInTransformPass;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/YieldState", function() {
  "use strict";
  var CURRENT = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").CURRENT;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var $__239 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentStatement = $__239.createAssignmentStatement,
      createIdentifierExpression = $__239.createIdentifierExpression,
      createMemberExpression = $__239.createMemberExpression,
      createReturnStatement = $__239.createReturnStatement,
      createThisExpression = $__239.createThisExpression,
      createTrueLiteral = $__239.createTrueLiteral;
  var YieldState = function(id, fallThroughState, expression) {
    $traceurRuntime.superCall(this, $YieldState.prototype, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.expression = expression;
  };
  var $YieldState = ($traceurRuntime.createClass)(YieldState, {
    replaceState: function(oldState, newState) {
      return new this.constructor(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.expression);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $traceurRuntime.spread([createAssignmentStatement(createMemberExpression(createThisExpression(), CURRENT), this.expression)], State.generateAssignState(enclosingFinally, this.fallThroughState), [createReturnStatement(createTrueLiteral())]);
    }
  }, {}, State);
  return {get YieldState() {
      return YieldState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/ReturnState", function() {
  "use strict";
  var $__241 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/util"),
      isUndefined = $__241.isUndefined,
      isVoidExpression = $__241.isVoidExpression;
  var YIELD_RETURN = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").YIELD_RETURN;
  var YieldState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/YieldState").YieldState;
  var State = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/State").State;
  var $__241 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentStatement = $__241.createAssignmentStatement,
      createMemberExpression = $__241.createMemberExpression,
      createThisExpression = $__241.createThisExpression;
  var ReturnState = function() {
    $traceurRuntime.defaultSuperCall(this, $ReturnState.prototype, arguments);
  };
  var $ReturnState = ($traceurRuntime.createClass)(ReturnState, {transform: function(enclosingFinally, machineEndState, reporter) {
      var e = this.expression;
      if (e && !isUndefined(e) && !isVoidExpression(e)) {
        return $traceurRuntime.spread([createAssignmentStatement(createMemberExpression(createThisExpression(), YIELD_RETURN), this.expression)], State.generateJump(enclosingFinally, machineEndState));
      } else {
        return State.generateJump(enclosingFinally, machineEndState);
      }
    }}, {}, YieldState);
  return {get ReturnState() {
      return ReturnState;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/generator/GeneratorTransformer", function() {
  "use strict";
  var $__242 = Object.freeze(Object.defineProperties(["var $that = this, $arguments = arguments,\n              $G = {\n                GState: ", ",\n                current: undefined,\n                yieldReturn: undefined,\n                innerFunction: ", ",\n                moveNext: ", "\n              };\n          return $traceurRuntime.generatorWrap($G);"], {raw: {value: Object.freeze(["var $that = this, $arguments = arguments,\n              $G = {\n                GState: ", ",\n                current: undefined,\n                yieldReturn: undefined,\n                innerFunction: ", ",\n                moveNext: ", "\n              };\n          return $traceurRuntime.generatorWrap($G);"])}}));
  var CPSTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/CPSTransformer").CPSTransformer;
  var STORED_EXCEPTION = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName").STORED_EXCEPTION;
  var $__244 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      STATE_MACHINE = $__244.STATE_MACHINE,
      YIELD_EXPRESSION = $__244.YIELD_EXPRESSION;
  var $__244 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser"),
      parseStatement = $__244.parseStatement,
      parseStatements = $__244.parseStatements;
  var StateMachine = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/StateMachine").StateMachine;
  var YieldState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/YieldState").YieldState;
  var ReturnState = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/ReturnState").ReturnState;
  var $__244 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignStateStatement = $__244.createAssignStateStatement,
      createAssignmentStatement = $__244.createAssignmentStatement,
      createFalseLiteral = $__244.createFalseLiteral,
      createFunctionBody = $__244.createFunctionBody,
      id = $__244.createIdentifierExpression,
      createMemberExpression = $__244.createMemberExpression,
      createNumberLiteral = $__244.createNumberLiteral,
      createReturnStatement = $__244.createReturnStatement,
      createStatementList = $__244.createStatementList,
      createThisExpression = $__244.createThisExpression,
      createThrowStatement = $__244.createThrowStatement,
      createUndefinedExpression = $__244.createUndefinedExpression;
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var GSTATE = 'GState';
  var GeneratorTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $GeneratorTransformer.prototype, arguments);
  };
  var $GeneratorTransformer = ($traceurRuntime.createClass)(GeneratorTransformer, {
    transformYieldExpression_: function(tree) {
      var e = tree.expression || createUndefinedExpression();
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new YieldState(startState, fallThroughState, this.transformAny(e)), fallThroughState);
    },
    transformYieldExpression: function(tree) {
      this.reporter.reportError(tree.location.start, 'Only \'a = yield b\' and \'var a = yield b\' currently supported.');
      return tree;
    },
    transformExpressionStatement: function(tree) {
      var e = tree.expression;
      if (e.type === YIELD_EXPRESSION) return this.transformYieldExpression_(e);
      return $traceurRuntime.superCall(this, $GeneratorTransformer.prototype, "transformExpressionStatement", [tree]);
    },
    transformAwaitStatement: function(tree) {
      this.reporter.reportError(tree.location.start, 'Generator function may not have an await statement.');
      return tree;
    },
    transformFinally: function(tree) {
      var result = $traceurRuntime.superCall(this, $GeneratorTransformer.prototype, "transformFinally", [tree]);
      if (result.block.type != STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'yield or return not permitted from within a finally block.');
      return result;
    },
    transformReturnStatement: function(tree) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new ReturnState(startState, fallThroughState, this.transformAny(tree.expression)), fallThroughState);
    },
    transformGeneratorBody: function(tree) {
      var transformedTree = this.transformAny(tree);
      if (this.reporter.hadError()) {
        return tree;
      }
      var machine = transformedTree;
      machine = new StateMachine(machine.startState, machine.fallThroughState, this.removeEmptyStates(machine.states), machine.exceptionBlocks);
      var statements = $traceurRuntime.spread(this.getMachineVariables(tree, machine), parseStatements($__242, ST_NEWBORN, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
      return createFunctionBody(statements);
    },
    machineUncaughtExceptionStatements: function(rethrowState, machineEndState) {
      return createStatementList(createAssignmentStatement(createMemberExpression(createThisExpression(), GSTATE), createNumberLiteral(ST_CLOSED)), createAssignStateStatement(machineEndState), createThrowStatement(id(STORED_EXCEPTION)));
    },
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(createThrowStatement(id(STORED_EXCEPTION)));
    },
    machineFallThroughStatements: function(machineEndState) {
      return createStatementList(createAssignStateStatement(machineEndState));
    },
    machineEndStatements: function() {
      return [createReturnStatement(createFalseLiteral())];
    }
  }, {transformGeneratorBody: function(reporter, body) {
      return new GeneratorTransformer(reporter).transformGeneratorBody(body);
    }}, CPSTransformer);
  ;
  return {get GeneratorTransformer() {
      return GeneratorTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/GeneratorTransformPass", function() {
  "use strict";
  var $__245 = Object.freeze(Object.defineProperties(["\n          if (", " == ", ") {\n            ", " = ", ";\n            throw ", ";\n          }"], {raw: {value: Object.freeze(["\n          if (", " == ", ") {\n            ", " = ", ";\n            throw ", ";\n          }"])}})),
      $__246 = Object.freeze(Object.defineProperties(["\n        {\n          var ", " = ", "[Symbol.iterator]();\n          var ", ";\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n\n          while (true) {\n            if (", " == ", ") {\n              ", " = ", ".next(", ");\n            } else {\n              ", " = ", ".throw(", ");\n            }\n            if (", ".done) {\n              ", " = ", ".value;\n              break;\n            }\n            // Normally, this would go through transformYieldForExpression_\n            // which would rethrow and we would catch it and set up the states\n            // again.\n            ", ";\n          }\n        }"], {raw: {value: Object.freeze(["\n        {\n          var ", " = ", "[Symbol.iterator]();\n          var ", ";\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n\n          while (true) {\n            if (", " == ", ") {\n              ", " = ", ".next(", ");\n            } else {\n              ", " = ", ".throw(", ");\n            }\n            if (", ".done) {\n              ", " = ", ".value;\n              break;\n            }\n            // Normally, this would go through transformYieldForExpression_\n            // which would rethrow and we would catch it and set up the states\n            // again.\n            ", ";\n          }\n        }"])}}));
  var AsyncTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/AsyncTransformer").AsyncTransformer;
  var ForInTransformPass = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/ForInTransformPass").ForInTransformPass;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      GetAccessor = $__248.GetAccessor,
      SetAccessor = $__248.SetAccessor;
  var GeneratorTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/generator/GeneratorTransformer").GeneratorTransformer;
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var parseStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseStatement;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var EQUAL = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").EQUAL;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      BINARY_OPERATOR = $__248.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__248.COMMA_EXPRESSION,
      PAREN_EXPRESSION = $__248.PAREN_EXPRESSION,
      YIELD_EXPRESSION = $__248.YIELD_EXPRESSION;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FunctionDeclaration = $__248.FunctionDeclaration,
      FunctionExpression = $__248.FunctionExpression;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentExpression = $__248.createAssignmentExpression,
      createAssignmentStatement = $__248.createAssignmentStatement,
      createBlock = $__248.createBlock,
      createCommaExpression = $__248.createCommaExpression,
      createExpressionStatement = $__248.createExpressionStatement,
      createIdentifierExpression = $__248.createIdentifierExpression,
      createReturnStatement = $__248.createReturnStatement,
      createMemberExpression = $__248.createMemberExpression,
      createVariableDeclaration = $__248.createVariableDeclaration,
      createVariableDeclarationList = $__248.createVariableDeclarationList,
      createVariableStatement = $__248.createVariableStatement,
      createYieldStatement = $__248.createYieldStatement;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      ACTION_SEND = $__248.ACTION_SEND,
      ACTION_THROW = $__248.ACTION_THROW,
      YIELD_ACTION = $__248.YIELD_ACTION,
      YIELD_SENT = $__248.YIELD_SENT;
  var $__248 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options"),
      transformOptions = $__248.transformOptions,
      options = $__248.options;
  function isYieldAssign(tree) {
    return tree.operator.type === EQUAL && tree.right.type === YIELD_EXPRESSION && tree.left.isLeftHandSideExpression();
  }
  var id = createIdentifierExpression;
  var YieldFinder = function(tree) {
    this.hasYield = false;
    this.hasYieldFor = false;
    this.hasForIn = false;
    this.hasAwait = false;
    this.visitAny(tree);
  };
  var $YieldFinder = ($traceurRuntime.createClass)(YieldFinder, {
    hasAnyGenerator: function() {
      return this.hasYield || this.hasAwait;
    },
    visitYieldExpression: function(tree) {
      this.hasYield = true;
      this.hasYieldFor = tree.isYieldFor;
    },
    visitAwaitStatement: function(tree) {
      this.hasAwait = true;
    },
    visitForInStatement: function(tree) {
      this.hasForIn = true;
      $traceurRuntime.superCall(this, $YieldFinder.prototype, "visitForInStatement", [tree]);
    },
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {}
  }, {}, ParseTreeVisitor);
  var throwClose;
  var YieldExpressionTransformer = function(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $YieldExpressionTransformer.prototype, "constructor", [identifierGenerator]);
    if (!throwClose) {
      throwClose = parseStatement($__245, id(YIELD_ACTION), ACTION_THROW, id(YIELD_ACTION), ACTION_SEND, id(YIELD_SENT));
    }
  };
  var $YieldExpressionTransformer = ($traceurRuntime.createClass)(YieldExpressionTransformer, {
    transformExpressionStatement: function(tree) {
      var e = tree.expression,
          ex;
      while (e.type === PAREN_EXPRESSION) {
        e = e.expression;
      }
      function commaWrap(lhs, rhs) {
        return createExpressionStatement(createCommaExpression($traceurRuntime.spread([createAssignmentExpression(lhs, rhs)], ex.slice(1))));
      }
      switch (e.type) {
        case BINARY_OPERATOR:
          if (isYieldAssign(e)) return this.factorAssign_(e.left, e.right, createAssignmentStatement);
          break;
        case COMMA_EXPRESSION:
          ex = e.expressions;
          if (ex[0].type === BINARY_OPERATOR && isYieldAssign(ex[0])) return this.factorAssign_(ex[0].left, ex[0].right, commaWrap);
        case YIELD_EXPRESSION:
          if (e.isYieldFor) return this.transformYieldForExpression_(e);
          return createBlock(tree, throwClose);
      }
      return tree;
    },
    transformVariableStatement: function(tree) {
      var tdd = tree.declarations.declarations;
      function isYieldVarAssign(tree) {
        return tree.initialiser && tree.initialiser.type === YIELD_EXPRESSION;
      }
      function varWrap(lhs, rhs) {
        return createVariableStatement(createVariableDeclarationList(tree.declarations.declarationType, $traceurRuntime.spread([createVariableDeclaration(lhs, rhs)], tdd.slice(1))));
      }
      if (isYieldVarAssign(tdd[0])) return this.factorAssign_(tdd[0].lvalue, tdd[0].initialiser, varWrap);
      return tree;
    },
    transformReturnStatement: function(tree) {
      if (tree.expression && tree.expression.type === YIELD_EXPRESSION) return this.factor_(tree.expression, createReturnStatement);
      return tree;
    },
    factorAssign_: function(lhs, rhs, wrap) {
      return this.factor_(rhs, (function(ident) {
        return wrap(lhs, ident);
      }));
    },
    factor_: function(expression, wrap) {
      if (expression.isYieldFor) return createBlock(this.transformYieldForExpression_(expression), wrap(id(YIELD_SENT)));
      return createBlock([createExpressionStatement(expression), throwClose, wrap(id(YIELD_SENT))]);
    },
    transformYieldForExpression_: function(tree) {
      var g = id(this.getTempIdentifier());
      var next = id(this.getTempIdentifier());
      return parseStatement($__246, g, tree.expression, next, id(YIELD_SENT), id(YIELD_ACTION), ACTION_SEND, id(YIELD_ACTION), ACTION_SEND, next, g, id(YIELD_SENT), next, g, id(YIELD_SENT), next, id(YIELD_SENT), next, createYieldStatement(createMemberExpression(next, 'value')));
    }
  }, {}, TempVarTransformer);
  var GeneratorTransformPass = function(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "constructor", [identifierGenerator]);
    this.reporter_ = reporter;
  };
  var $GeneratorTransformPass = ($traceurRuntime.createClass)(GeneratorTransformPass, {
    transformFunctionDeclaration: function(tree) {
      return this.transformFunction_(tree, FunctionDeclaration);
    },
    transformFunctionExpression: function(tree) {
      return this.transformFunction_(tree, FunctionExpression);
    },
    transformFunction_: function(tree, constructor) {
      var body = this.transformBody_(tree.functionBody, tree.isGenerator);
      if (body === tree.functionBody) return tree;
      var isGenerator = false;
      return new constructor(null, tree.name, isGenerator, tree.formalParameterList, tree.typeAnnotation, body);
    },
    transformBody_: function(tree, isGenerator) {
      var finder;
      var body = $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "transformFunctionBody", [tree]);
      if (isGenerator || (options.unstarredGenerators || transformOptions.deferredFunctions)) {
        finder = new YieldFinder(tree);
        if (!(finder.hasYield || isGenerator || finder.hasAwait)) return body;
      } else if (!isGenerator) {
        return body;
      }
      if (finder.hasForIn && (transformOptions.generators || transformOptions.deferredFunctions)) {
        body = new ForInTransformPass(this.identifierGenerator).transformAny(body);
      }
      if (finder.hasYield || isGenerator) {
        if (transformOptions.generators) {
          body = new YieldExpressionTransformer(this.identifierGenerator, this.reporter_).transformAny(body);
          body = GeneratorTransformer.transformGeneratorBody(this.reporter_, body);
        }
      } else if (transformOptions.deferredFunctions) {
        body = AsyncTransformer.transformAsyncBody(this.reporter_, body);
      }
      return body;
    },
    transformGetAccessor: function(tree) {
      var body = this.transformBody_(tree.body);
      if (body === tree.body) return tree;
      return new GetAccessor(tree.location, tree.isStatic, tree.name, tree.typeAnnotation, body);
    },
    transformSetAccessor: function(tree) {
      var body = this.transformBody_(tree.body);
      if (body === tree.body) return tree;
      return new SetAccessor(tree.location, tree.isStatic, tree.name, tree.parameter, body);
    }
  }, {}, TempVarTransformer);
  return {get GeneratorTransformPass() {
      return GeneratorTransformPass;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/MultiTransformer", function() {
  "use strict";
  var ParseTreeValidator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeValidator").ParseTreeValidator;
  var MultiTransformer = function(reporter, validate) {
    this.reporter_ = reporter;
    this.validate_ = validate;
    this.treeTransformers_ = [];
  };
  MultiTransformer = ($traceurRuntime.createClass)(MultiTransformer, {
    append: function(treeTransformer) {
      this.treeTransformers_.push(treeTransformer);
    },
    transform: function(tree) {
      var reporter = this.reporter_;
      var validate = this.validate_;
      this.treeTransformers_.every((function(transformTree) {
        tree = transformTree(tree);
        if (reporter.hadError()) return false;
        if (validate) ParseTreeValidator.validate(tree);
        return true;
      }));
      return tree;
    }
  }, {});
  return {get MultiTransformer() {
      return MultiTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/NumericLiteralTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__252 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      LiteralExpression = $__252.LiteralExpression,
      LiteralPropertyName = $__252.LiteralPropertyName;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var NUMBER = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").NUMBER;
  function needsTransform(token) {
    return token.type === NUMBER && /^0[bBoO]/.test(token.value);
  }
  function transformToken(token) {
    return new LiteralToken(NUMBER, String(token.processedValue), token.location);
  }
  var NumericLiteralTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $NumericLiteralTransformer.prototype, arguments);
  };
  var $NumericLiteralTransformer = ($traceurRuntime.createClass)(NumericLiteralTransformer, {
    transformLiteralExpression: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token)) return new LiteralExpression(tree.location, transformToken(token));
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token)) return new LiteralPropertyName(tree.location, transformToken(token));
      return tree;
    }
  }, {}, ParseTreeTransformer);
  return {get NumericLiteralTransformer() {
      return NumericLiteralTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ObjectLiteralTransformer", function() {
  "use strict";
  var FindVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FindVisitor").FindVisitor;
  var $__254 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FormalParameterList = $__254.FormalParameterList,
      FunctionExpression = $__254.FunctionExpression,
      IdentifierExpression = $__254.IdentifierExpression,
      LiteralExpression = $__254.LiteralExpression;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__254 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      IDENTIFIER = $__254.IDENTIFIER,
      STRING = $__254.STRING;
  var $__254 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      COMPUTED_PROPERTY_NAME = $__254.COMPUTED_PROPERTY_NAME,
      LITERAL_PROPERTY_NAME = $__254.LITERAL_PROPERTY_NAME;
  var $__254 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createAssignmentExpression = $__254.createAssignmentExpression,
      createCommaExpression = $__254.createCommaExpression,
      createDefineProperty = $__254.createDefineProperty,
      createEmptyParameterList = $__254.createEmptyParameterList,
      createFunctionExpression = $__254.createFunctionExpression,
      createIdentifierExpression = $__254.createIdentifierExpression,
      createObjectCreate = $__254.createObjectCreate,
      createObjectLiteralExpression = $__254.createObjectLiteralExpression,
      createParenExpression = $__254.createParenExpression,
      createPropertyNameAssignment = $__254.createPropertyNameAssignment,
      createStringLiteral = $__254.createStringLiteral;
  var propName = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/staticsemantics/PropName").propName;
  var transformOptions = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").transformOptions;
  var FindAdvancedProperty = function(tree) {
    this.protoExpression = null;
    $traceurRuntime.superCall(this, $FindAdvancedProperty.prototype, "constructor", [tree, true]);
  };
  var $FindAdvancedProperty = ($traceurRuntime.createClass)(FindAdvancedProperty, {
    visitPropertyNameAssignment: function(tree) {
      if (isProtoName(tree.name)) this.protoExpression = tree.value; else $traceurRuntime.superCall(this, $FindAdvancedProperty.prototype, "visitPropertyNameAssignment", [tree]);
    },
    visitComputedPropertyName: function(tree) {
      if (transformOptions.computedPropertyNames) this.found = true;
    }
  }, {}, FindVisitor);
  function isProtoName(tree) {
    return propName(tree) === '__proto__';
  }
  var ObjectLiteralTransformer = function(identifierGenerator) {
    $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "constructor", [identifierGenerator]);
    this.protoExpression = null;
    this.needsAdvancedTransform = false;
    this.seenAccessors = null;
  };
  var $ObjectLiteralTransformer = ($traceurRuntime.createClass)(ObjectLiteralTransformer, {
    findSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME) return null;
      var s = propName(name);
      return this.seenAccessors[s];
    },
    removeSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME) return;
      var s = propName(name);
      delete this.seenAccessors[s];
    },
    addSeenAccessor_: function(name, descr) {
      if (name.type === COMPUTED_PROPERTY_NAME) return;
      var s = propName(name);
      this.seenAccessors[s] = descr;
    },
    createProperty_: function(name, descr) {
      var expression;
      if (name.type === LITERAL_PROPERTY_NAME) {
        if (this.needsAdvancedTransform) expression = this.getPropertyName_(name); else expression = name;
      } else {
        expression = name.expression;
      }
      if (descr.get || descr.set) {
        var oldAccessor = this.findSeenAccessor_(name);
        if (oldAccessor) {
          oldAccessor.get = descr.get || oldAccessor.get;
          oldAccessor.set = descr.set || oldAccessor.set;
          this.removeSeenAccessor_(name);
          return null;
        } else {
          this.addSeenAccessor_(name, descr);
        }
      }
      return [expression, descr];
    },
    getPropertyName_: function(nameTree) {
      var token = nameTree.literalToken;
      switch (token.type) {
        case IDENTIFIER:
          return createStringLiteral(token.value);
        default:
          if (token.isKeyword()) return createStringLiteral(token.type);
          return new LiteralExpression(token.location, token);
      }
    },
    transformObjectLiteralExpression: function(tree) {
      var oldNeedsTransform = this.needsAdvancedTransform;
      var oldSeenAccessors = this.seenAccessors;
      try {
        var finder = new FindAdvancedProperty(tree);
        if (!finder.found) {
          this.needsAdvancedTransform = false;
          return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformObjectLiteralExpression", [tree]);
        }
        this.needsAdvancedTransform = true;
        this.seenAccessors = Object.create(null);
        var properties = this.transformList(tree.propertyNameAndValues);
        properties = properties.filter((function(tree) {
          return tree;
        }));
        var tempVar = this.addTempVar();
        var tempVarIdentifierExpression = createIdentifierExpression(tempVar);
        var expressions = properties.map((function(property) {
          var expression = property[0];
          var descr = property[1];
          return createDefineProperty(tempVarIdentifierExpression, expression, descr);
        }));
        var protoExpression = this.transformAny(finder.protoExpression);
        var objectExpression;
        if (protoExpression) objectExpression = createObjectCreate(protoExpression); else objectExpression = createObjectLiteralExpression([]);
        expressions.unshift(createAssignmentExpression(tempVarIdentifierExpression, objectExpression));
        expressions.push(tempVarIdentifierExpression);
        return createParenExpression(createCommaExpression(expressions));
      } finally {
        this.needsAdvancedTransform = oldNeedsTransform;
        this.seenAccessors = oldSeenAccessors;
      }
    },
    transformPropertyNameAssignment: function(tree) {
      if (!this.needsAdvancedTransform) return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformPropertyNameAssignment", [tree]);
      if (isProtoName(tree.name)) return null;
      return this.createProperty_(tree.name, {
        value: this.transformAny(tree.value),
        configurable: true,
        enumerable: true,
        writable: true
      });
    },
    transformGetAccessor: function(tree) {
      if (!this.needsAdvancedTransform) return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformGetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var func = createFunctionExpression(createEmptyParameterList(), body);
      return this.createProperty_(tree.name, {
        get: func,
        configurable: true,
        enumerable: true
      });
    },
    transformSetAccessor: function(tree) {
      if (!this.needsAdvancedTransform) return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformSetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var parameter = this.transformAny(tree.parameter);
      var parameterList = new FormalParameterList(parameter.location, [parameter]);
      var func = createFunctionExpression(parameterList, body);
      return this.createProperty_(tree.name, {
        set: func,
        configurable: true,
        enumerable: true
      });
    },
    transformPropertyMethodAssignment: function(tree) {
      var func = new FunctionExpression(tree.location, null, tree.isGenerator, this.transformAny(tree.formalParameterList), tree.typeAnnotation, this.transformAny(tree.functionBody));
      if (!this.needsAdvancedTransform) {
        return createPropertyNameAssignment(tree.name, func);
      }
      var expression = this.transformAny(tree.name);
      return this.createProperty_(tree.name, {
        value: func,
        configurable: true,
        enumerable: true,
        writable: true
      });
    },
    transformPropertyNameShorthand: function(tree) {
      if (!this.needsAdvancedTransform) return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformPropertyNameShorthand", [tree]);
      var expression = this.transformAny(tree.name);
      return this.createProperty_(tree.name, {
        value: new IdentifierExpression(tree.location, tree.name.identifierToken),
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }, {}, TempVarTransformer);
  return {get ObjectLiteralTransformer() {
      return ObjectLiteralTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/PropertyNameShorthandTransformer", function() {
  "use strict";
  var $__256 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      IdentifierExpression = $__256.IdentifierExpression,
      LiteralPropertyName = $__256.LiteralPropertyName,
      PropertyNameAssignment = $__256.PropertyNameAssignment;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var PropertyNameShorthandTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $PropertyNameShorthandTransformer.prototype, arguments);
  };
  var $PropertyNameShorthandTransformer = ($traceurRuntime.createClass)(PropertyNameShorthandTransformer, {transformPropertyNameShorthand: function(tree) {
      return new PropertyNameAssignment(tree.location, new LiteralPropertyName(tree.location, tree.name), new IdentifierExpression(tree.location, tree.name));
    }}, {}, ParseTreeTransformer);
  return {get PropertyNameShorthandTransformer() {
      return PropertyNameShorthandTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/RestParameterTransformer", function() {
  "use strict";
  var $__257 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"])}})),
      $__258 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"])}}));
  var FormalParameterList = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees").FormalParameterList;
  var ParameterTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParameterTransformer").ParameterTransformer;
  var createIdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory").createIdentifierToken;
  var parseStatement = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseStatement;
  function hasRestParameter(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters.length > 0 && parameters[parameters.length - 1].isRestParameter();
  }
  function getRestParameterLiteralToken(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters[parameters.length - 1].parameter.identifier.identifierToken;
  }
  var RestParameterTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $RestParameterTransformer.prototype, arguments);
  };
  var $RestParameterTransformer = ($traceurRuntime.createClass)(RestParameterTransformer, {transformFormalParameterList: function(tree) {
      var transformed = $traceurRuntime.superCall(this, $RestParameterTransformer.prototype, "transformFormalParameterList", [tree]);
      if (hasRestParameter(transformed)) {
        var parametersWithoutRestParam = new FormalParameterList(transformed.location, transformed.parameters.slice(0, - 1));
        var startIndex = transformed.parameters.length - 1;
        var i = createIdentifierToken(this.getTempIdentifier());
        var name = getRestParameterLiteralToken(transformed);
        var loop;
        if (startIndex) {
          loop = parseStatement($__257, name, i, startIndex, i, i, name, i, startIndex, i);
        } else {
          loop = parseStatement($__258, name, i, i, i, name, i, i);
        }
        this.parameterStatements.push(loop);
        return parametersWithoutRestParam;
      }
      return transformed;
    }}, {}, ParameterTransformer);
  return {get RestParameterTransformer() {
      return RestParameterTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/SpreadTransformer", function() {
  "use strict";
  var $__261 = Object.freeze(Object.defineProperties(["$traceurRuntime.toObject(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.toObject(", ")"])}})),
      $__262 = Object.freeze(Object.defineProperties(["$traceurRuntime.spread(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.spread(", ")"])}}));
  var $__264 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      APPLY = $__264.APPLY,
      BIND = $__264.BIND,
      FUNCTION = $__264.FUNCTION,
      PROTOTYPE = $__264.PROTOTYPE;
  var $__264 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      MEMBER_EXPRESSION = $__264.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__264.MEMBER_LOOKUP_EXPRESSION,
      SPREAD_EXPRESSION = $__264.SPREAD_EXPRESSION;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__264 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__264.createArgumentList,
      createArrayLiteralExpression = $__264.createArrayLiteralExpression,
      createAssignmentExpression = $__264.createAssignmentExpression,
      createCallExpression = $__264.createCallExpression,
      createEmptyArgumentList = $__264.createEmptyArgumentList,
      createIdentifierExpression = $__264.createIdentifierExpression,
      createMemberExpression = $__264.createMemberExpression,
      createMemberLookupExpression = $__264.createMemberLookupExpression,
      createNewExpression = $__264.createNewExpression,
      createNullLiteral = $__264.createNullLiteral,
      createParenExpression = $__264.createParenExpression;
  var parseExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseExpression;
  function hasSpreadMember(trees) {
    return trees.some((function(tree) {
      return tree && tree.type == SPREAD_EXPRESSION;
    }));
  }
  var SpreadTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $SpreadTransformer.prototype, arguments);
  };
  var $SpreadTransformer = ($traceurRuntime.createClass)(SpreadTransformer, {
    createArrayFromElements_: function(elements, needsNewArray) {
      var length = elements.length;
      if (length === 1 && !needsNewArray) {
        var args = createArgumentList(this.transformAny(elements[0].expression));
        return parseExpression($__261, args);
      }
      var args = [];
      var lastArray;
      for (var i = 0; i < length; i++) {
        if (elements[i] && elements[i].type === SPREAD_EXPRESSION) {
          if (lastArray) {
            args.push(createArrayLiteralExpression(lastArray));
            lastArray = null;
          }
          args.push(this.transformAny(elements[i].expression));
        } else {
          if (!lastArray) lastArray = [];
          lastArray.push(this.transformAny(elements[i]));
        }
      }
      if (lastArray) args.push(createArrayLiteralExpression(lastArray));
      return parseExpression($__262, createArgumentList(args));
    },
    desugarCallSpread_: function(tree) {
      var operand = this.transformAny(tree.operand);
      var functionObject,
          contextObject;
      this.pushTempVarState();
      if (operand.type == MEMBER_EXPRESSION) {
        var tempIdent = createIdentifierExpression(this.addTempVar());
        var parenExpression = createParenExpression(createAssignmentExpression(tempIdent, operand.operand));
        var memberName = operand.memberName;
        contextObject = tempIdent;
        functionObject = createMemberExpression(parenExpression, memberName);
      } else if (tree.operand.type == MEMBER_LOOKUP_EXPRESSION) {
        var tempIdent = createIdentifierExpression(this.addTempVar());
        var parenExpression = createParenExpression(createAssignmentExpression(tempIdent, operand.operand));
        var memberExpression = this.transformAny(operand.memberExpression);
        contextObject = tempIdent;
        functionObject = createMemberLookupExpression(parenExpression, memberExpression);
      } else {
        contextObject = createNullLiteral();
        functionObject = operand;
      }
      this.popTempVarState();
      var arrayExpression = this.createArrayFromElements_(tree.args.args, false);
      return createCallExpression(createMemberExpression(functionObject, APPLY), createArgumentList(contextObject, arrayExpression));
    },
    desugarNewSpread_: function(tree) {
      var arrayExpression = $traceurRuntime.spread([createNullLiteral()], tree.args.args);
      arrayExpression = this.createArrayFromElements_(arrayExpression, false);
      return createNewExpression(createParenExpression(createCallExpression(createMemberExpression(FUNCTION, PROTOTYPE, BIND, APPLY), createArgumentList(this.transformAny(tree.operand), arrayExpression))), createEmptyArgumentList());
    },
    transformArrayLiteralExpression: function(tree) {
      if (hasSpreadMember(tree.elements)) {
        return this.createArrayFromElements_(tree.elements, true);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformArrayLiteralExpression", [tree]);
    },
    transformCallExpression: function(tree) {
      if (hasSpreadMember(tree.args.args)) {
        return this.desugarCallSpread_(tree);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformCallExpression", [tree]);
    },
    transformNewExpression: function(tree) {
      if (tree.args != null && hasSpreadMember(tree.args.args)) {
        return this.desugarNewSpread_(tree);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformNewExpression", [tree]);
    }
  }, {}, TempVarTransformer);
  return {get SpreadTransformer() {
      return SpreadTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/SymbolTransformer", function() {
  "use strict";
  var $__265 = Object.freeze(Object.defineProperties(["$traceurRuntime.toProperty(", ") in ", ""], {raw: {value: Object.freeze(["$traceurRuntime.toProperty(", ") in ", ""])}})),
      $__266 = Object.freeze(Object.defineProperties(["$traceurRuntime.setProperty(", ",\n          ", ", ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.setProperty(", ",\n          ", ", ", ")"])}})),
      $__267 = Object.freeze(Object.defineProperties(["", "[$traceurRuntime.toProperty(", ")]"], {raw: {value: Object.freeze(["", "[$traceurRuntime.toProperty(", ")]"])}}));
  var MEMBER_LOOKUP_EXPRESSION = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType").MEMBER_LOOKUP_EXPRESSION;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__269 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      DELETE = $__269.DELETE,
      EQUAL = $__269.EQUAL,
      IN = $__269.IN;
  var $__269 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__269.createArgumentList,
      createIdentifierExpression = $__269.createIdentifierExpression;
  var expandMemberLookupExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/OperatorExpander").expandMemberLookupExpression;
  var parseExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseExpression;
  var SymbolTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $SymbolTransformer.prototype, arguments);
  };
  var $SymbolTransformer = ($traceurRuntime.createClass)(SymbolTransformer, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type === IN) {
        var name = this.transformAny(tree.left);
        var object = this.transformAny(tree.right);
        return parseExpression($__265, name, object);
      }
      if (tree.left.type === MEMBER_LOOKUP_EXPRESSION && tree.operator.isAssignmentOperator()) {
        if (tree.operator.type !== EQUAL) {
          tree = expandMemberLookupExpression(tree, this);
          return this.transformAny(tree);
        }
        var operand = this.transformAny(tree.left.operand);
        var memberExpression = this.transformAny(tree.left.memberExpression);
        var value = this.transformAny(tree.right);
        return parseExpression($__266, operand, memberExpression, value);
      }
      return $traceurRuntime.superCall(this, $SymbolTransformer.prototype, "transformBinaryOperator", [tree]);
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      return parseExpression($__267, operand, memberExpression);
    }
  }, {}, TempVarTransformer);
  return {get SymbolTransformer() {
      return SymbolTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/TemplateLiteralTransformer", function() {
  "use strict";
  var $__271 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType"),
      BINARY_OPERATOR = $__271.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__271.COMMA_EXPRESSION,
      CONDITIONAL_EXPRESSION = $__271.CONDITIONAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__271.TEMPLATE_LITERAL_PORTION;
  var $__271 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      LiteralExpression = $__271.LiteralExpression,
      ParenExpression = $__271.ParenExpression;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var $__271 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/PredefinedName"),
      DEFINE_PROPERTIES = $__271.DEFINE_PROPERTIES,
      OBJECT = $__271.OBJECT,
      RAW = $__271.RAW;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var TempVarTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TempVarTransformer").TempVarTransformer;
  var $__271 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType"),
      PERCENT = $__271.PERCENT,
      PLUS = $__271.PLUS,
      SLASH = $__271.SLASH,
      STAR = $__271.STAR,
      STRING = $__271.STRING;
  var $__271 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeFactory"),
      createArgumentList = $__271.createArgumentList,
      createArrayLiteralExpression = $__271.createArrayLiteralExpression,
      createBinaryOperator = $__271.createBinaryOperator,
      createCallExpression = $__271.createCallExpression,
      createIdentifierExpression = $__271.createIdentifierExpression,
      createMemberExpression = $__271.createMemberExpression,
      createObjectFreeze = $__271.createObjectFreeze,
      createObjectLiteralExpression = $__271.createObjectLiteralExpression,
      createOperatorToken = $__271.createOperatorToken,
      createPropertyDescriptor = $__271.createPropertyDescriptor,
      createPropertyNameAssignment = $__271.createPropertyNameAssignment,
      createStringLiteral = $__271.createStringLiteral;
  function createCallSiteIdObject(tree) {
    var elements = tree.elements;
    return createObjectFreeze(createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTIES), createArgumentList(createCookedStringArray(elements), createObjectLiteralExpression(createPropertyNameAssignment(RAW, createPropertyDescriptor({value: createObjectFreeze(createRawStringArray(elements))}))))));
  }
  function maybeAddEmptyStringAtEnd(elements, items) {
    var length = elements.length;
    if (!length || elements[length - 1].type !== TEMPLATE_LITERAL_PORTION) items.push(createStringLiteral(''));
  }
  function createRawStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      var str = replaceRaw(JSON.stringify(elements[i].value.value));
      var loc = elements[i].location;
      var expr = new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
      items.push(expr);
    }
    maybeAddEmptyStringAtEnd(elements, items);
    return createArrayLiteralExpression(items);
  }
  function createCookedStringLiteralExpression(tree) {
    var str = cookString(tree.value.value);
    var loc = tree.location;
    return new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
  }
  function createCookedStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      items.push(createCookedStringLiteralExpression(elements[i]));
    }
    maybeAddEmptyStringAtEnd(elements, items);
    return createArrayLiteralExpression(items);
  }
  function replaceRaw(s) {
    return s.replace(/\u2028|\u2029/g, function(c) {
      switch (c) {
        case '\u2028':
          return '\\u2028';
        case '\u2029':
          return '\\u2029';
        default:
          throw Error('Not reachable');
      }
    });
  }
  function cookString(s) {
    var sb = ['"'];
    var i = 0,
        k = 1,
        c,
        c2;
    while (i < s.length) {
      c = s[i++];
      switch (c) {
        case '\\':
          c2 = s[i++];
          switch (c2) {
            case '\n':
            case '\u2028':
            case '\u2029':
              break;
            case '\r':
              if (s[i + 1] === '\n') {
                i++;
              }
              break;
            default:
              sb[k++] = c;
              sb[k++] = c2;
          }
          break;
        case '"':
          sb[k++] = '\\"';
          break;
        case '\n':
          sb[k++] = '\\n';
          break;
        case '\r':
          sb[k++] = '\\r';
          break;
        case '\t':
          sb[k++] = '\\t';
          break;
        case '\f':
          sb[k++] = '\\f';
          break;
        case '\b':
          sb[k++] = '\\b';
          break;
        case '\u2028':
          sb[k++] = '\\u2028';
          break;
        case '\u2029':
          sb[k++] = '\\u2029';
          break;
        default:
          sb[k++] = c;
      }
    }
    sb[k++] = '"';
    return sb.join('');
  }
  var TemplateLiteralTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $TemplateLiteralTransformer.prototype, arguments);
  };
  var $TemplateLiteralTransformer = ($traceurRuntime.createClass)(TemplateLiteralTransformer, {
    transformFunctionBody: function(tree) {
      return ParseTreeTransformer.prototype.transformFunctionBody.call(this, tree);
    },
    transformTemplateLiteralExpression: function(tree) {
      if (!tree.operand) return this.createDefaultTemplateLiteral(tree);
      var operand = this.transformAny(tree.operand);
      var elements = tree.elements;
      var callsiteIdObject = createCallSiteIdObject(tree);
      var idName = this.addTempVar(callsiteIdObject);
      var args = [createIdentifierExpression(idName)];
      for (var i = 1; i < elements.length; i += 2) {
        args.push(this.transformAny(elements[i]));
      }
      return createCallExpression(operand, createArgumentList(args));
    },
    transformTemplateSubstitution: function(tree) {
      var transformedTree = this.transformAny(tree.expression);
      switch (transformedTree.type) {
        case BINARY_OPERATOR:
          switch (transformedTree.operator.type) {
            case STAR:
            case PERCENT:
            case SLASH:
              return transformedTree;
          }
        case COMMA_EXPRESSION:
        case CONDITIONAL_EXPRESSION:
          return new ParenExpression(null, transformedTree);
      }
      return transformedTree;
    },
    transformTemplateLiteralPortion: function(tree) {
      return createCookedStringLiteralExpression(tree);
    },
    createDefaultTemplateLiteral: function(tree) {
      var length = tree.elements.length;
      if (length === 0) {
        var loc = tree.location;
        return new LiteralExpression(loc, new LiteralToken(STRING, '""', loc));
      }
      var firstNonEmpty = tree.elements[0].value.value === '' ? - 1: 0;
      var binaryExpression = this.transformAny(tree.elements[0]);
      if (length == 1) return binaryExpression;
      var plusToken = createOperatorToken(PLUS);
      for (var i = 1; i < length; i++) {
        var element = tree.elements[i];
        if (element.type === TEMPLATE_LITERAL_PORTION) {
          if (element.value.value === '') continue; else if (firstNonEmpty < 0 && i === 2) binaryExpression = binaryExpression.right;
        }
        var transformedTree = this.transformAny(tree.elements[i]);
        binaryExpression = createBinaryOperator(binaryExpression, plusToken, transformedTree);
      }
      return new ParenExpression(null, binaryExpression);
    }
  }, {}, TempVarTransformer);
  return {get TemplateLiteralTransformer() {
      return TemplateLiteralTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/TypeTransformer", function() {
  "use strict";
  var $__273 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      FormalParameter = $__273.FormalParameter,
      FunctionDeclaration = $__273.FunctionDeclaration,
      FunctionExpression = $__273.FunctionExpression,
      GetAccessor = $__273.GetAccessor,
      PropertyMethodAssignment = $__273.PropertyMethodAssignment,
      VariableDeclaration = $__273.VariableDeclaration;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var TypeTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $TypeTransformer.prototype, arguments);
  };
  var $TypeTransformer = ($traceurRuntime.createClass)(TypeTransformer, {
    transformVariableDeclaration: function(tree) {
      if (tree.typeAnnotation) {
        tree = new VariableDeclaration(tree.location, tree.lvalue, null, tree.initialiser);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformVariableDeclaration", [tree]);
    },
    transformFormalParameter: function(tree) {
      if (tree.typeAnnotation !== null) return new FormalParameter(tree.location, tree.parameter, null);
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      if (tree.typeAnnotation) tree = new FunctionDeclaration(tree.location, tree.name, tree.isGenerator, tree.formalParameterList, null, tree.functionBody);
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      if (tree.typeAnnotation) tree = new FunctionExpression(tree.location, tree.name, tree.isGenerator, tree.formalParameterList, null, tree.functionBody);
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformFunctionExpression", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      if (tree.typeAnnotation) tree = new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, tree.name, tree.formalParameterList, null, tree.functionBody);
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
    },
    transformGetAccessor: function(tree) {
      if (tree.typeAnnotation) tree = new GetAccessor(tree.location, tree.isStatic, tree.name, null, tree.body);
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformGetAccessor", [tree]);
    }
  }, {}, ParseTreeTransformer);
  return {get TypeTransformer() {
      return TypeTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/syntax/TokenType.js", function() {
  "use strict";
  var AMPERSAND = '&';
  var AMPERSAND_EQUAL = '&=';
  var AND = '&&';
  var ARROW = '=>';
  var AWAIT = 'await';
  var BACK_QUOTE = '`';
  var BANG = '!';
  var BAR = '|';
  var BAR_EQUAL = '|=';
  var BREAK = 'break';
  var CARET = '^';
  var CARET_EQUAL = '^=';
  var CASE = 'case';
  var CATCH = 'catch';
  var CLASS = 'class';
  var CLOSE_ANGLE = '>';
  var CLOSE_CURLY = '}';
  var CLOSE_PAREN = ')';
  var CLOSE_SQUARE = ']';
  var COLON = ':';
  var COMMA = ',';
  var CONST = 'const';
  var CONTINUE = 'continue';
  var DEBUGGER = 'debugger';
  var DEFAULT = 'default';
  var DELETE = 'delete';
  var DO = 'do';
  var DOT_DOT_DOT = '...';
  var ELSE = 'else';
  var END_OF_FILE = 'End of File';
  var ENUM = 'enum';
  var EQUAL = '=';
  var EQUAL_EQUAL = '==';
  var EQUAL_EQUAL_EQUAL = '===';
  var ERROR = 'error';
  var EXPORT = 'export';
  var EXTENDS = 'extends';
  var FALSE = 'false';
  var FINALLY = 'finally';
  var FOR = 'for';
  var FUNCTION = 'function';
  var GREATER_EQUAL = '>=';
  var IDENTIFIER = 'identifier';
  var IF = 'if';
  var IMPLEMENTS = 'implements';
  var IMPORT = 'import';
  var IN = 'in';
  var INSTANCEOF = 'instanceof';
  var INTERFACE = 'interface';
  var LEFT_SHIFT = '<<';
  var LEFT_SHIFT_EQUAL = '<<=';
  var LESS_EQUAL = '<=';
  var LET = 'let';
  var MINUS = '-';
  var MINUS_EQUAL = '-=';
  var MINUS_MINUS = '--';
  var NEW = 'new';
  var NO_SUBSTITUTION_TEMPLATE = 'no substitution template';
  var NOT_EQUAL = '!=';
  var NOT_EQUAL_EQUAL = '!==';
  var NULL = 'null';
  var NUMBER = 'number literal';
  var OPEN_ANGLE = '<';
  var OPEN_CURLY = '{';
  var OPEN_PAREN = '(';
  var OPEN_SQUARE = '[';
  var OR = '||';
  var PACKAGE = 'package';
  var PERCENT = '%';
  var PERCENT_EQUAL = '%=';
  var PERIOD = '.';
  var PLUS = '+';
  var PLUS_EQUAL = '+=';
  var PLUS_PLUS = '++';
  var PRIVATE = 'private';
  var PROTECTED = 'protected';
  var PUBLIC = 'public';
  var QUESTION = '?';
  var REGULAR_EXPRESSION = 'regular expression literal';
  var RETURN = 'return';
  var RIGHT_SHIFT = '>>';
  var RIGHT_SHIFT_EQUAL = '>>=';
  var SEMI_COLON = ';';
  var SLASH = '/';
  var SLASH_EQUAL = '/=';
  var STAR = '*';
  var STAR_EQUAL = '*=';
  var STATIC = 'static';
  var STRING = 'string literal';
  var SUPER = 'super';
  var SWITCH = 'switch';
  var TEMPLATE_HEAD = 'template head';
  var TEMPLATE_MIDDLE = 'template middle';
  var TEMPLATE_TAIL = 'template tail';
  var THIS = 'this';
  var THROW = 'throw';
  var TILDE = '~';
  var TRUE = 'true';
  var TRY = 'try';
  var TYPEOF = 'typeof';
  var UNSIGNED_RIGHT_SHIFT = '>>>';
  var UNSIGNED_RIGHT_SHIFT_EQUAL = '>>>=';
  var VAR = 'var';
  var VOID = 'void';
  var WHILE = 'while';
  var WITH = 'with';
  var YIELD = 'yield';
  return {
    get AMPERSAND() {
      return AMPERSAND;
    },
    get AMPERSAND_EQUAL() {
      return AMPERSAND_EQUAL;
    },
    get AND() {
      return AND;
    },
    get ARROW() {
      return ARROW;
    },
    get AWAIT() {
      return AWAIT;
    },
    get BACK_QUOTE() {
      return BACK_QUOTE;
    },
    get BANG() {
      return BANG;
    },
    get BAR() {
      return BAR;
    },
    get BAR_EQUAL() {
      return BAR_EQUAL;
    },
    get BREAK() {
      return BREAK;
    },
    get CARET() {
      return CARET;
    },
    get CARET_EQUAL() {
      return CARET_EQUAL;
    },
    get CASE() {
      return CASE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS() {
      return CLASS;
    },
    get CLOSE_ANGLE() {
      return CLOSE_ANGLE;
    },
    get CLOSE_CURLY() {
      return CLOSE_CURLY;
    },
    get CLOSE_PAREN() {
      return CLOSE_PAREN;
    },
    get CLOSE_SQUARE() {
      return CLOSE_SQUARE;
    },
    get COLON() {
      return COLON;
    },
    get COMMA() {
      return COMMA;
    },
    get CONST() {
      return CONST;
    },
    get CONTINUE() {
      return CONTINUE;
    },
    get DEBUGGER() {
      return DEBUGGER;
    },
    get DEFAULT() {
      return DEFAULT;
    },
    get DELETE() {
      return DELETE;
    },
    get DO() {
      return DO;
    },
    get DOT_DOT_DOT() {
      return DOT_DOT_DOT;
    },
    get ELSE() {
      return ELSE;
    },
    get END_OF_FILE() {
      return END_OF_FILE;
    },
    get ENUM() {
      return ENUM;
    },
    get EQUAL() {
      return EQUAL;
    },
    get EQUAL_EQUAL() {
      return EQUAL_EQUAL;
    },
    get EQUAL_EQUAL_EQUAL() {
      return EQUAL_EQUAL_EQUAL;
    },
    get ERROR() {
      return ERROR;
    },
    get EXPORT() {
      return EXPORT;
    },
    get EXTENDS() {
      return EXTENDS;
    },
    get FALSE() {
      return FALSE;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR() {
      return FOR;
    },
    get FUNCTION() {
      return FUNCTION;
    },
    get GREATER_EQUAL() {
      return GREATER_EQUAL;
    },
    get IDENTIFIER() {
      return IDENTIFIER;
    },
    get IF() {
      return IF;
    },
    get IMPLEMENTS() {
      return IMPLEMENTS;
    },
    get IMPORT() {
      return IMPORT;
    },
    get IN() {
      return IN;
    },
    get INSTANCEOF() {
      return INSTANCEOF;
    },
    get INTERFACE() {
      return INTERFACE;
    },
    get LEFT_SHIFT() {
      return LEFT_SHIFT;
    },
    get LEFT_SHIFT_EQUAL() {
      return LEFT_SHIFT_EQUAL;
    },
    get LESS_EQUAL() {
      return LESS_EQUAL;
    },
    get LET() {
      return LET;
    },
    get MINUS() {
      return MINUS;
    },
    get MINUS_EQUAL() {
      return MINUS_EQUAL;
    },
    get MINUS_MINUS() {
      return MINUS_MINUS;
    },
    get NEW() {
      return NEW;
    },
    get NO_SUBSTITUTION_TEMPLATE() {
      return NO_SUBSTITUTION_TEMPLATE;
    },
    get NOT_EQUAL() {
      return NOT_EQUAL;
    },
    get NOT_EQUAL_EQUAL() {
      return NOT_EQUAL_EQUAL;
    },
    get NULL() {
      return NULL;
    },
    get NUMBER() {
      return NUMBER;
    },
    get OPEN_ANGLE() {
      return OPEN_ANGLE;
    },
    get OPEN_CURLY() {
      return OPEN_CURLY;
    },
    get OPEN_PAREN() {
      return OPEN_PAREN;
    },
    get OPEN_SQUARE() {
      return OPEN_SQUARE;
    },
    get OR() {
      return OR;
    },
    get PACKAGE() {
      return PACKAGE;
    },
    get PERCENT() {
      return PERCENT;
    },
    get PERCENT_EQUAL() {
      return PERCENT_EQUAL;
    },
    get PERIOD() {
      return PERIOD;
    },
    get PLUS() {
      return PLUS;
    },
    get PLUS_EQUAL() {
      return PLUS_EQUAL;
    },
    get PLUS_PLUS() {
      return PLUS_PLUS;
    },
    get PRIVATE() {
      return PRIVATE;
    },
    get PROTECTED() {
      return PROTECTED;
    },
    get PUBLIC() {
      return PUBLIC;
    },
    get QUESTION() {
      return QUESTION;
    },
    get REGULAR_EXPRESSION() {
      return REGULAR_EXPRESSION;
    },
    get RETURN() {
      return RETURN;
    },
    get RIGHT_SHIFT() {
      return RIGHT_SHIFT;
    },
    get RIGHT_SHIFT_EQUAL() {
      return RIGHT_SHIFT_EQUAL;
    },
    get SEMI_COLON() {
      return SEMI_COLON;
    },
    get SLASH() {
      return SLASH;
    },
    get SLASH_EQUAL() {
      return SLASH_EQUAL;
    },
    get STAR() {
      return STAR;
    },
    get STAR_EQUAL() {
      return STAR_EQUAL;
    },
    get STATIC() {
      return STATIC;
    },
    get STRING() {
      return STRING;
    },
    get SUPER() {
      return SUPER;
    },
    get SWITCH() {
      return SWITCH;
    },
    get TEMPLATE_HEAD() {
      return TEMPLATE_HEAD;
    },
    get TEMPLATE_MIDDLE() {
      return TEMPLATE_MIDDLE;
    },
    get TEMPLATE_TAIL() {
      return TEMPLATE_TAIL;
    },
    get THIS() {
      return THIS;
    },
    get THROW() {
      return THROW;
    },
    get TILDE() {
      return TILDE;
    },
    get TRUE() {
      return TRUE;
    },
    get TRY() {
      return TRY;
    },
    get TYPEOF() {
      return TYPEOF;
    },
    get UNSIGNED_RIGHT_SHIFT() {
      return UNSIGNED_RIGHT_SHIFT;
    },
    get UNSIGNED_RIGHT_SHIFT_EQUAL() {
      return UNSIGNED_RIGHT_SHIFT_EQUAL;
    },
    get VAR() {
      return VAR;
    },
    get VOID() {
      return VOID;
    },
    get WHILE() {
      return WHILE;
    },
    get WITH() {
      return WITH;
    },
    get YIELD() {
      return YIELD;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/syntax/trees/ParseTreeType.js", function() {
  "use strict";
  var ANON_BLOCK = 'ANON_BLOCK';
  var ARGUMENT_LIST = 'ARGUMENT_LIST';
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION';
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION';
  var ARRAY_PATTERN = 'ARRAY_PATTERN';
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION';
  var AWAIT_STATEMENT = 'AWAIT_STATEMENT';
  var BINARY_OPERATOR = 'BINARY_OPERATOR';
  var BINDING_ELEMENT = 'BINDING_ELEMENT';
  var BINDING_IDENTIFIER = 'BINDING_IDENTIFIER';
  var BLOCK = 'BLOCK';
  var BREAK_STATEMENT = 'BREAK_STATEMENT';
  var CALL_EXPRESSION = 'CALL_EXPRESSION';
  var CASE_CLAUSE = 'CASE_CLAUSE';
  var CATCH = 'CATCH';
  var CLASS_DECLARATION = 'CLASS_DECLARATION';
  var CLASS_EXPRESSION = 'CLASS_EXPRESSION';
  var COMMA_EXPRESSION = 'COMMA_EXPRESSION';
  var COMPREHENSION_FOR = 'COMPREHENSION_FOR';
  var COMPREHENSION_IF = 'COMPREHENSION_IF';
  var COMPUTED_PROPERTY_NAME = 'COMPUTED_PROPERTY_NAME';
  var CONDITIONAL_EXPRESSION = 'CONDITIONAL_EXPRESSION';
  var CONTINUE_STATEMENT = 'CONTINUE_STATEMENT';
  var COVER_FORMALS = 'COVER_FORMALS';
  var COVER_INITIALISED_NAME = 'COVER_INITIALISED_NAME';
  var DEBUGGER_STATEMENT = 'DEBUGGER_STATEMENT';
  var DEFAULT_CLAUSE = 'DEFAULT_CLAUSE';
  var DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT';
  var EMPTY_STATEMENT = 'EMPTY_STATEMENT';
  var EXPORT_DECLARATION = 'EXPORT_DECLARATION';
  var EXPORT_DEFAULT = 'EXPORT_DEFAULT';
  var EXPORT_SPECIFIER = 'EXPORT_SPECIFIER';
  var EXPORT_SPECIFIER_SET = 'EXPORT_SPECIFIER_SET';
  var EXPORT_STAR = 'EXPORT_STAR';
  var EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT';
  var FINALLY = 'FINALLY';
  var FOR_IN_STATEMENT = 'FOR_IN_STATEMENT';
  var FOR_OF_STATEMENT = 'FOR_OF_STATEMENT';
  var FOR_STATEMENT = 'FOR_STATEMENT';
  var FORMAL_PARAMETER = 'FORMAL_PARAMETER';
  var FORMAL_PARAMETER_LIST = 'FORMAL_PARAMETER_LIST';
  var FUNCTION_BODY = 'FUNCTION_BODY';
  var FUNCTION_DECLARATION = 'FUNCTION_DECLARATION';
  var FUNCTION_EXPRESSION = 'FUNCTION_EXPRESSION';
  var GENERATOR_COMPREHENSION = 'GENERATOR_COMPREHENSION';
  var GET_ACCESSOR = 'GET_ACCESSOR';
  var IDENTIFIER_EXPRESSION = 'IDENTIFIER_EXPRESSION';
  var IF_STATEMENT = 'IF_STATEMENT';
  var IMPORT_DECLARATION = 'IMPORT_DECLARATION';
  var IMPORT_SPECIFIER = 'IMPORT_SPECIFIER';
  var IMPORT_SPECIFIER_SET = 'IMPORT_SPECIFIER_SET';
  var IMPORTED_BINDING = 'IMPORTED_BINDING';
  var LABELLED_STATEMENT = 'LABELLED_STATEMENT';
  var LITERAL_EXPRESSION = 'LITERAL_EXPRESSION';
  var LITERAL_PROPERTY_NAME = 'LITERAL_PROPERTY_NAME';
  var MEMBER_EXPRESSION = 'MEMBER_EXPRESSION';
  var MEMBER_LOOKUP_EXPRESSION = 'MEMBER_LOOKUP_EXPRESSION';
  var MODULE = 'MODULE';
  var MODULE_DECLARATION = 'MODULE_DECLARATION';
  var MODULE_SPECIFIER = 'MODULE_SPECIFIER';
  var NAMED_EXPORT = 'NAMED_EXPORT';
  var NEW_EXPRESSION = 'NEW_EXPRESSION';
  var OBJECT_LITERAL_EXPRESSION = 'OBJECT_LITERAL_EXPRESSION';
  var OBJECT_PATTERN = 'OBJECT_PATTERN';
  var OBJECT_PATTERN_FIELD = 'OBJECT_PATTERN_FIELD';
  var PAREN_EXPRESSION = 'PAREN_EXPRESSION';
  var POSTFIX_EXPRESSION = 'POSTFIX_EXPRESSION';
  var PREDEFINED_TYPE = 'PREDEFINED_TYPE';
  var PROPERTY_METHOD_ASSIGNMENT = 'PROPERTY_METHOD_ASSIGNMENT';
  var PROPERTY_NAME_ASSIGNMENT = 'PROPERTY_NAME_ASSIGNMENT';
  var PROPERTY_NAME_SHORTHAND = 'PROPERTY_NAME_SHORTHAND';
  var REST_PARAMETER = 'REST_PARAMETER';
  var RETURN_STATEMENT = 'RETURN_STATEMENT';
  var SCRIPT = 'SCRIPT';
  var SET_ACCESSOR = 'SET_ACCESSOR';
  var SPREAD_EXPRESSION = 'SPREAD_EXPRESSION';
  var SPREAD_PATTERN_ELEMENT = 'SPREAD_PATTERN_ELEMENT';
  var STATE_MACHINE = 'STATE_MACHINE';
  var SUPER_EXPRESSION = 'SUPER_EXPRESSION';
  var SWITCH_STATEMENT = 'SWITCH_STATEMENT';
  var SYNTAX_ERROR_TREE = 'SYNTAX_ERROR_TREE';
  var TEMPLATE_LITERAL_EXPRESSION = 'TEMPLATE_LITERAL_EXPRESSION';
  var TEMPLATE_LITERAL_PORTION = 'TEMPLATE_LITERAL_PORTION';
  var TEMPLATE_SUBSTITUTION = 'TEMPLATE_SUBSTITUTION';
  var THIS_EXPRESSION = 'THIS_EXPRESSION';
  var THROW_STATEMENT = 'THROW_STATEMENT';
  var TRY_STATEMENT = 'TRY_STATEMENT';
  var TYPE_NAME = 'TYPE_NAME';
  var UNARY_EXPRESSION = 'UNARY_EXPRESSION';
  var VARIABLE_DECLARATION = 'VARIABLE_DECLARATION';
  var VARIABLE_DECLARATION_LIST = 'VARIABLE_DECLARATION_LIST';
  var VARIABLE_STATEMENT = 'VARIABLE_STATEMENT';
  var WHILE_STATEMENT = 'WHILE_STATEMENT';
  var WITH_STATEMENT = 'WITH_STATEMENT';
  var YIELD_EXPRESSION = 'YIELD_EXPRESSION';
  return {
    get ANON_BLOCK() {
      return ANON_BLOCK;
    },
    get ARGUMENT_LIST() {
      return ARGUMENT_LIST;
    },
    get ARRAY_COMPREHENSION() {
      return ARRAY_COMPREHENSION;
    },
    get ARRAY_LITERAL_EXPRESSION() {
      return ARRAY_LITERAL_EXPRESSION;
    },
    get ARRAY_PATTERN() {
      return ARRAY_PATTERN;
    },
    get ARROW_FUNCTION_EXPRESSION() {
      return ARROW_FUNCTION_EXPRESSION;
    },
    get AWAIT_STATEMENT() {
      return AWAIT_STATEMENT;
    },
    get BINARY_OPERATOR() {
      return BINARY_OPERATOR;
    },
    get BINDING_ELEMENT() {
      return BINDING_ELEMENT;
    },
    get BINDING_IDENTIFIER() {
      return BINDING_IDENTIFIER;
    },
    get BLOCK() {
      return BLOCK;
    },
    get BREAK_STATEMENT() {
      return BREAK_STATEMENT;
    },
    get CALL_EXPRESSION() {
      return CALL_EXPRESSION;
    },
    get CASE_CLAUSE() {
      return CASE_CLAUSE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS_DECLARATION() {
      return CLASS_DECLARATION;
    },
    get CLASS_EXPRESSION() {
      return CLASS_EXPRESSION;
    },
    get COMMA_EXPRESSION() {
      return COMMA_EXPRESSION;
    },
    get COMPREHENSION_FOR() {
      return COMPREHENSION_FOR;
    },
    get COMPREHENSION_IF() {
      return COMPREHENSION_IF;
    },
    get COMPUTED_PROPERTY_NAME() {
      return COMPUTED_PROPERTY_NAME;
    },
    get CONDITIONAL_EXPRESSION() {
      return CONDITIONAL_EXPRESSION;
    },
    get CONTINUE_STATEMENT() {
      return CONTINUE_STATEMENT;
    },
    get COVER_FORMALS() {
      return COVER_FORMALS;
    },
    get COVER_INITIALISED_NAME() {
      return COVER_INITIALISED_NAME;
    },
    get DEBUGGER_STATEMENT() {
      return DEBUGGER_STATEMENT;
    },
    get DEFAULT_CLAUSE() {
      return DEFAULT_CLAUSE;
    },
    get DO_WHILE_STATEMENT() {
      return DO_WHILE_STATEMENT;
    },
    get EMPTY_STATEMENT() {
      return EMPTY_STATEMENT;
    },
    get EXPORT_DECLARATION() {
      return EXPORT_DECLARATION;
    },
    get EXPORT_DEFAULT() {
      return EXPORT_DEFAULT;
    },
    get EXPORT_SPECIFIER() {
      return EXPORT_SPECIFIER;
    },
    get EXPORT_SPECIFIER_SET() {
      return EXPORT_SPECIFIER_SET;
    },
    get EXPORT_STAR() {
      return EXPORT_STAR;
    },
    get EXPRESSION_STATEMENT() {
      return EXPRESSION_STATEMENT;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR_IN_STATEMENT() {
      return FOR_IN_STATEMENT;
    },
    get FOR_OF_STATEMENT() {
      return FOR_OF_STATEMENT;
    },
    get FOR_STATEMENT() {
      return FOR_STATEMENT;
    },
    get FORMAL_PARAMETER() {
      return FORMAL_PARAMETER;
    },
    get FORMAL_PARAMETER_LIST() {
      return FORMAL_PARAMETER_LIST;
    },
    get FUNCTION_BODY() {
      return FUNCTION_BODY;
    },
    get FUNCTION_DECLARATION() {
      return FUNCTION_DECLARATION;
    },
    get FUNCTION_EXPRESSION() {
      return FUNCTION_EXPRESSION;
    },
    get GENERATOR_COMPREHENSION() {
      return GENERATOR_COMPREHENSION;
    },
    get GET_ACCESSOR() {
      return GET_ACCESSOR;
    },
    get IDENTIFIER_EXPRESSION() {
      return IDENTIFIER_EXPRESSION;
    },
    get IF_STATEMENT() {
      return IF_STATEMENT;
    },
    get IMPORT_DECLARATION() {
      return IMPORT_DECLARATION;
    },
    get IMPORT_SPECIFIER() {
      return IMPORT_SPECIFIER;
    },
    get IMPORT_SPECIFIER_SET() {
      return IMPORT_SPECIFIER_SET;
    },
    get IMPORTED_BINDING() {
      return IMPORTED_BINDING;
    },
    get LABELLED_STATEMENT() {
      return LABELLED_STATEMENT;
    },
    get LITERAL_EXPRESSION() {
      return LITERAL_EXPRESSION;
    },
    get LITERAL_PROPERTY_NAME() {
      return LITERAL_PROPERTY_NAME;
    },
    get MEMBER_EXPRESSION() {
      return MEMBER_EXPRESSION;
    },
    get MEMBER_LOOKUP_EXPRESSION() {
      return MEMBER_LOOKUP_EXPRESSION;
    },
    get MODULE() {
      return MODULE;
    },
    get MODULE_DECLARATION() {
      return MODULE_DECLARATION;
    },
    get MODULE_SPECIFIER() {
      return MODULE_SPECIFIER;
    },
    get NAMED_EXPORT() {
      return NAMED_EXPORT;
    },
    get NEW_EXPRESSION() {
      return NEW_EXPRESSION;
    },
    get OBJECT_LITERAL_EXPRESSION() {
      return OBJECT_LITERAL_EXPRESSION;
    },
    get OBJECT_PATTERN() {
      return OBJECT_PATTERN;
    },
    get OBJECT_PATTERN_FIELD() {
      return OBJECT_PATTERN_FIELD;
    },
    get PAREN_EXPRESSION() {
      return PAREN_EXPRESSION;
    },
    get POSTFIX_EXPRESSION() {
      return POSTFIX_EXPRESSION;
    },
    get PREDEFINED_TYPE() {
      return PREDEFINED_TYPE;
    },
    get PROPERTY_METHOD_ASSIGNMENT() {
      return PROPERTY_METHOD_ASSIGNMENT;
    },
    get PROPERTY_NAME_ASSIGNMENT() {
      return PROPERTY_NAME_ASSIGNMENT;
    },
    get PROPERTY_NAME_SHORTHAND() {
      return PROPERTY_NAME_SHORTHAND;
    },
    get REST_PARAMETER() {
      return REST_PARAMETER;
    },
    get RETURN_STATEMENT() {
      return RETURN_STATEMENT;
    },
    get SCRIPT() {
      return SCRIPT;
    },
    get SET_ACCESSOR() {
      return SET_ACCESSOR;
    },
    get SPREAD_EXPRESSION() {
      return SPREAD_EXPRESSION;
    },
    get SPREAD_PATTERN_ELEMENT() {
      return SPREAD_PATTERN_ELEMENT;
    },
    get STATE_MACHINE() {
      return STATE_MACHINE;
    },
    get SUPER_EXPRESSION() {
      return SUPER_EXPRESSION;
    },
    get SWITCH_STATEMENT() {
      return SWITCH_STATEMENT;
    },
    get SYNTAX_ERROR_TREE() {
      return SYNTAX_ERROR_TREE;
    },
    get TEMPLATE_LITERAL_EXPRESSION() {
      return TEMPLATE_LITERAL_EXPRESSION;
    },
    get TEMPLATE_LITERAL_PORTION() {
      return TEMPLATE_LITERAL_PORTION;
    },
    get TEMPLATE_SUBSTITUTION() {
      return TEMPLATE_SUBSTITUTION;
    },
    get THIS_EXPRESSION() {
      return THIS_EXPRESSION;
    },
    get THROW_STATEMENT() {
      return THROW_STATEMENT;
    },
    get TRY_STATEMENT() {
      return TRY_STATEMENT;
    },
    get TYPE_NAME() {
      return TYPE_NAME;
    },
    get UNARY_EXPRESSION() {
      return UNARY_EXPRESSION;
    },
    get VARIABLE_DECLARATION() {
      return VARIABLE_DECLARATION;
    },
    get VARIABLE_DECLARATION_LIST() {
      return VARIABLE_DECLARATION_LIST;
    },
    get VARIABLE_STATEMENT() {
      return VARIABLE_STATEMENT;
    },
    get WHILE_STATEMENT() {
      return WHILE_STATEMENT;
    },
    get WITH_STATEMENT() {
      return WITH_STATEMENT;
    },
    get YIELD_EXPRESSION() {
      return YIELD_EXPRESSION;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer.js", function() {
  "use strict";
  var $__275 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      AnonBlock = $__275.AnonBlock,
      ArgumentList = $__275.ArgumentList,
      ArrayComprehension = $__275.ArrayComprehension,
      ArrayLiteralExpression = $__275.ArrayLiteralExpression,
      ArrayPattern = $__275.ArrayPattern,
      ArrowFunctionExpression = $__275.ArrowFunctionExpression,
      AwaitStatement = $__275.AwaitStatement,
      BinaryOperator = $__275.BinaryOperator,
      BindingElement = $__275.BindingElement,
      BindingIdentifier = $__275.BindingIdentifier,
      Block = $__275.Block,
      BreakStatement = $__275.BreakStatement,
      CallExpression = $__275.CallExpression,
      CaseClause = $__275.CaseClause,
      Catch = $__275.Catch,
      ClassDeclaration = $__275.ClassDeclaration,
      ClassExpression = $__275.ClassExpression,
      CommaExpression = $__275.CommaExpression,
      ComprehensionFor = $__275.ComprehensionFor,
      ComprehensionIf = $__275.ComprehensionIf,
      ComputedPropertyName = $__275.ComputedPropertyName,
      ConditionalExpression = $__275.ConditionalExpression,
      ContinueStatement = $__275.ContinueStatement,
      CoverFormals = $__275.CoverFormals,
      CoverInitialisedName = $__275.CoverInitialisedName,
      DebuggerStatement = $__275.DebuggerStatement,
      DefaultClause = $__275.DefaultClause,
      DoWhileStatement = $__275.DoWhileStatement,
      EmptyStatement = $__275.EmptyStatement,
      ExportDeclaration = $__275.ExportDeclaration,
      ExportDefault = $__275.ExportDefault,
      ExportSpecifier = $__275.ExportSpecifier,
      ExportSpecifierSet = $__275.ExportSpecifierSet,
      ExportStar = $__275.ExportStar,
      ExpressionStatement = $__275.ExpressionStatement,
      Finally = $__275.Finally,
      ForInStatement = $__275.ForInStatement,
      ForOfStatement = $__275.ForOfStatement,
      ForStatement = $__275.ForStatement,
      FormalParameter = $__275.FormalParameter,
      FormalParameterList = $__275.FormalParameterList,
      FunctionBody = $__275.FunctionBody,
      FunctionDeclaration = $__275.FunctionDeclaration,
      FunctionExpression = $__275.FunctionExpression,
      GeneratorComprehension = $__275.GeneratorComprehension,
      GetAccessor = $__275.GetAccessor,
      IdentifierExpression = $__275.IdentifierExpression,
      IfStatement = $__275.IfStatement,
      ImportedBinding = $__275.ImportedBinding,
      ImportDeclaration = $__275.ImportDeclaration,
      ImportSpecifier = $__275.ImportSpecifier,
      ImportSpecifierSet = $__275.ImportSpecifierSet,
      LabelledStatement = $__275.LabelledStatement,
      LiteralExpression = $__275.LiteralExpression,
      LiteralPropertyName = $__275.LiteralPropertyName,
      MemberExpression = $__275.MemberExpression,
      MemberLookupExpression = $__275.MemberLookupExpression,
      Module = $__275.Module,
      ModuleDeclaration = $__275.ModuleDeclaration,
      ModuleSpecifier = $__275.ModuleSpecifier,
      NamedExport = $__275.NamedExport,
      NewExpression = $__275.NewExpression,
      ObjectLiteralExpression = $__275.ObjectLiteralExpression,
      ObjectPattern = $__275.ObjectPattern,
      ObjectPatternField = $__275.ObjectPatternField,
      ParenExpression = $__275.ParenExpression,
      PostfixExpression = $__275.PostfixExpression,
      PredefinedType = $__275.PredefinedType,
      Script = $__275.Script,
      PropertyMethodAssignment = $__275.PropertyMethodAssignment,
      PropertyNameAssignment = $__275.PropertyNameAssignment,
      PropertyNameShorthand = $__275.PropertyNameShorthand,
      RestParameter = $__275.RestParameter,
      ReturnStatement = $__275.ReturnStatement,
      SetAccessor = $__275.SetAccessor,
      SpreadExpression = $__275.SpreadExpression,
      SpreadPatternElement = $__275.SpreadPatternElement,
      SuperExpression = $__275.SuperExpression,
      SwitchStatement = $__275.SwitchStatement,
      SyntaxErrorTree = $__275.SyntaxErrorTree,
      TemplateLiteralExpression = $__275.TemplateLiteralExpression,
      TemplateLiteralPortion = $__275.TemplateLiteralPortion,
      TemplateSubstitution = $__275.TemplateSubstitution,
      ThisExpression = $__275.ThisExpression,
      ThrowStatement = $__275.ThrowStatement,
      TryStatement = $__275.TryStatement,
      TypeName = $__275.TypeName,
      UnaryExpression = $__275.UnaryExpression,
      VariableDeclaration = $__275.VariableDeclaration,
      VariableDeclarationList = $__275.VariableDeclarationList,
      VariableStatement = $__275.VariableStatement,
      WhileStatement = $__275.WhileStatement,
      WithStatement = $__275.WithStatement,
      YieldExpression = $__275.YieldExpression;
  var ParseTreeTransformer = function() {};
  ParseTreeTransformer = ($traceurRuntime.createClass)(ParseTreeTransformer, {
    transformAny: function(tree) {
      return tree && tree.transform(this);
    },
    transformList: function(list) {
      var $__276;
      var builder = null;
      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.transformAny(element);
        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          if (transformed instanceof AnonBlock)($__276 = builder).push.apply($__276, $traceurRuntime.toObject(transformed.statements)); else builder.push(transformed);
        }
      }
      return builder || list;
    },
    transformStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
    },
    transformAnonBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new AnonBlock(tree.location, statements);
    },
    transformArgumentList: function(tree) {
      var args = this.transformList(tree.args);
      if (args === tree.args) {
        return tree;
      }
      return new ArgumentList(tree.location, args);
    },
    transformArrayComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new ArrayComprehension(tree.location, comprehensionList, expression);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayLiteralExpression(tree.location, elements);
    },
    transformArrayPattern: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayPattern(tree.location, elements);
    },
    transformArrowFunctionExpression: function(tree) {
      var formalParameters = this.transformAny(tree.formalParameters);
      var functionBody = this.transformAny(tree.functionBody);
      if (formalParameters === tree.formalParameters && functionBody === tree.functionBody) {
        return tree;
      }
      return new ArrowFunctionExpression(tree.location, formalParameters, functionBody);
    },
    transformAwaitStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new AwaitStatement(tree.location, tree.identifier, expression);
    },
    transformBinaryOperator: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left === tree.left && right === tree.right) {
        return tree;
      }
      return new BinaryOperator(tree.location, left, tree.operator, right);
    },
    transformBindingElement: function(tree) {
      var binding = this.transformAny(tree.binding);
      var initialiser = this.transformAny(tree.initialiser);
      if (binding === tree.binding && initialiser === tree.initialiser) {
        return tree;
      }
      return new BindingElement(tree.location, binding, initialiser);
    },
    transformBindingIdentifier: function(tree) {
      return tree;
    },
    transformBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new Block(tree.location, statements);
    },
    transformBreakStatement: function(tree) {
      return tree;
    },
    transformCallExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new CallExpression(tree.location, operand, args);
    },
    transformCaseClause: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression === tree.expression && statements === tree.statements) {
        return tree;
      }
      return new CaseClause(tree.location, expression, statements);
    },
    transformCatch: function(tree) {
      var binding = this.transformAny(tree.binding);
      var catchBody = this.transformAny(tree.catchBody);
      if (binding === tree.binding && catchBody === tree.catchBody) {
        return tree;
      }
      return new Catch(tree.location, binding, catchBody);
    },
    transformClassDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassDeclaration(tree.location, name, superClass, elements);
    },
    transformClassExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassExpression(tree.location, name, superClass, elements);
    },
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CommaExpression(tree.location, expressions);
    },
    transformComprehensionFor: function(tree) {
      var left = this.transformAny(tree.left);
      var iterator = this.transformAny(tree.iterator);
      if (left === tree.left && iterator === tree.iterator) {
        return tree;
      }
      return new ComprehensionFor(tree.location, left, iterator);
    },
    transformComprehensionIf: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComprehensionIf(tree.location, expression);
    },
    transformComputedPropertyName: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComputedPropertyName(tree.location, expression);
    },
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition === tree.condition && left === tree.left && right === tree.right) {
        return tree;
      }
      return new ConditionalExpression(tree.location, condition, left, right);
    },
    transformContinueStatement: function(tree) {
      return tree;
    },
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CoverFormals(tree.location, expressions);
    },
    transformCoverInitialisedName: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      if (initialiser === tree.initialiser) {
        return tree;
      }
      return new CoverInitialisedName(tree.location, tree.name, tree.equalToken, initialiser);
    },
    transformDebuggerStatement: function(tree) {
      return tree;
    },
    transformDefaultClause: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new DefaultClause(tree.location, statements);
    },
    transformDoWhileStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body === tree.body && condition === tree.condition) {
        return tree;
      }
      return new DoWhileStatement(tree.location, body, condition);
    },
    transformEmptyStatement: function(tree) {
      return tree;
    },
    transformExportDeclaration: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      if (declaration === tree.declaration) {
        return tree;
      }
      return new ExportDeclaration(tree.location, declaration);
    },
    transformExportDefault: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExportDefault(tree.location, expression);
    },
    transformExportSpecifier: function(tree) {
      return tree;
    },
    transformExportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ExportSpecifierSet(tree.location, specifiers);
    },
    transformExportStar: function(tree) {
      return tree;
    },
    transformExpressionStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExpressionStatement(tree.location, expression);
    },
    transformFinally: function(tree) {
      var block = this.transformAny(tree.block);
      if (block === tree.block) {
        return tree;
      }
      return new Finally(tree.location, block);
    },
    transformForInStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForInStatement(tree.location, initialiser, collection, body);
    },
    transformForOfStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForOfStatement(tree.location, initialiser, collection, body);
    },
    transformForStatement: function(tree) {
      var initialiser = this.transformAny(tree.initialiser);
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      if (initialiser === tree.initialiser && condition === tree.condition && increment === tree.increment && body === tree.body) {
        return tree;
      }
      return new ForStatement(tree.location, initialiser, condition, increment, body);
    },
    transformFormalParameter: function(tree) {
      var parameter = this.transformAny(tree.parameter);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      if (parameter === tree.parameter && typeAnnotation === tree.typeAnnotation) {
        return tree;
      }
      return new FormalParameter(tree.location, parameter, typeAnnotation);
    },
    transformFormalParameterList: function(tree) {
      var parameters = this.transformList(tree.parameters);
      if (parameters === tree.parameters) {
        return tree;
      }
      return new FormalParameterList(tree.location, parameters);
    },
    transformFunctionBody: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new FunctionBody(tree.location, statements);
    },
    transformFunctionDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, name, tree.isGenerator, formalParameterList, typeAnnotation, functionBody);
    },
    transformFunctionExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionExpression(tree.location, name, tree.isGenerator, formalParameterList, typeAnnotation, functionBody);
    },
    transformGeneratorComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new GeneratorComprehension(tree.location, comprehensionList, expression);
    },
    transformGetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var body = this.transformAny(tree.body);
      if (name === tree.name && typeAnnotation === tree.typeAnnotation && body === tree.body) {
        return tree;
      }
      return new GetAccessor(tree.location, tree.isStatic, name, typeAnnotation, body);
    },
    transformIdentifierExpression: function(tree) {
      return tree;
    },
    transformIfStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition === tree.condition && ifClause === tree.ifClause && elseClause === tree.elseClause) {
        return tree;
      }
      return new IfStatement(tree.location, condition, ifClause, elseClause);
    },
    transformImportedBinding: function(tree) {
      var binding = this.transformAny(tree.binding);
      if (binding === tree.binding) {
        return tree;
      }
      return new ImportedBinding(tree.location, binding);
    },
    transformImportDeclaration: function(tree) {
      var importClause = this.transformAny(tree.importClause);
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      if (importClause === tree.importClause && moduleSpecifier === tree.moduleSpecifier) {
        return tree;
      }
      return new ImportDeclaration(tree.location, importClause, moduleSpecifier);
    },
    transformImportSpecifier: function(tree) {
      return tree;
    },
    transformImportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ImportSpecifierSet(tree.location, specifiers);
    },
    transformLabelledStatement: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement === tree.statement) {
        return tree;
      }
      return new LabelledStatement(tree.location, tree.name, statement);
    },
    transformLiteralExpression: function(tree) {
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      return tree;
    },
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new MemberExpression(tree.location, operand, tree.memberName);
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand === tree.operand && memberExpression === tree.memberExpression) {
        return tree;
      }
      return new MemberLookupExpression(tree.location, operand, memberExpression);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList, tree.moduleName);
    },
    transformModuleDeclaration: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ModuleDeclaration(tree.location, tree.identifier, expression);
    },
    transformModuleSpecifier: function(tree) {
      return tree;
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      var specifierSet = this.transformAny(tree.specifierSet);
      if (moduleSpecifier === tree.moduleSpecifier && specifierSet === tree.specifierSet) {
        return tree;
      }
      return new NamedExport(tree.location, moduleSpecifier, specifierSet);
    },
    transformNewExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new NewExpression(tree.location, operand, args);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues === tree.propertyNameAndValues) {
        return tree;
      }
      return new ObjectLiteralExpression(tree.location, propertyNameAndValues);
    },
    transformObjectPattern: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields === tree.fields) {
        return tree;
      }
      return new ObjectPattern(tree.location, fields);
    },
    transformObjectPatternField: function(tree) {
      var name = this.transformAny(tree.name);
      var element = this.transformAny(tree.element);
      if (name === tree.name && element === tree.element) {
        return tree;
      }
      return new ObjectPatternField(tree.location, name, element);
    },
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ParenExpression(tree.location, expression);
    },
    transformPostfixExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new PostfixExpression(tree.location, operand, tree.operator);
    },
    transformPredefinedType: function(tree) {
      return tree;
    },
    transformScript: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Script(tree.location, scriptItemList, tree.moduleName);
    },
    transformPropertyMethodAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && typeAnnotation === tree.typeAnnotation && functionBody === tree.functionBody) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, name, formalParameterList, typeAnnotation, functionBody);
    },
    transformPropertyNameAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var value = this.transformAny(tree.value);
      if (name === tree.name && value === tree.value) {
        return tree;
      }
      return new PropertyNameAssignment(tree.location, name, value);
    },
    transformPropertyNameShorthand: function(tree) {
      return tree;
    },
    transformRestParameter: function(tree) {
      var identifier = this.transformAny(tree.identifier);
      if (identifier === tree.identifier) {
        return tree;
      }
      return new RestParameter(tree.location, identifier);
    },
    transformReturnStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ReturnStatement(tree.location, expression);
    },
    transformSetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformAny(tree.body);
      if (name === tree.name && parameter === tree.parameter && body === tree.body) {
        return tree;
      }
      return new SetAccessor(tree.location, tree.isStatic, name, parameter, body);
    },
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new SpreadExpression(tree.location, expression);
    },
    transformSpreadPatternElement: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      if (lvalue === tree.lvalue) {
        return tree;
      }
      return new SpreadPatternElement(tree.location, lvalue);
    },
    transformSuperExpression: function(tree) {
      return tree;
    },
    transformSwitchStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression === tree.expression && caseClauses === tree.caseClauses) {
        return tree;
      }
      return new SwitchStatement(tree.location, expression, caseClauses);
    },
    transformSyntaxErrorTree: function(tree) {
      return tree;
    },
    transformTemplateLiteralExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var elements = this.transformList(tree.elements);
      if (operand === tree.operand && elements === tree.elements) {
        return tree;
      }
      return new TemplateLiteralExpression(tree.location, operand, elements);
    },
    transformTemplateLiteralPortion: function(tree) {
      return tree;
    },
    transformTemplateSubstitution: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new TemplateSubstitution(tree.location, expression);
    },
    transformThisExpression: function(tree) {
      return tree;
    },
    transformThrowStatement: function(tree) {
      var value = this.transformAny(tree.value);
      if (value === tree.value) {
        return tree;
      }
      return new ThrowStatement(tree.location, value);
    },
    transformTryStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var catchBlock = this.transformAny(tree.catchBlock);
      var finallyBlock = this.transformAny(tree.finallyBlock);
      if (body === tree.body && catchBlock === tree.catchBlock && finallyBlock === tree.finallyBlock) {
        return tree;
      }
      return new TryStatement(tree.location, body, catchBlock, finallyBlock);
    },
    transformTypeName: function(tree) {
      var moduleName = this.transformAny(tree.moduleName);
      if (moduleName === tree.moduleName) {
        return tree;
      }
      return new TypeName(tree.location, moduleName, tree.name);
    },
    transformUnaryExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new UnaryExpression(tree.location, tree.operator, operand);
    },
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var initialiser = this.transformAny(tree.initialiser);
      if (lvalue === tree.lvalue && typeAnnotation === tree.typeAnnotation && initialiser === tree.initialiser) {
        return tree;
      }
      return new VariableDeclaration(tree.location, lvalue, typeAnnotation, initialiser);
    },
    transformVariableDeclarationList: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableDeclarationList(tree.location, tree.declarationType, declarations);
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableStatement(tree.location, declarations);
    },
    transformWhileStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition === tree.condition && body === tree.body) {
        return tree;
      }
      return new WhileStatement(tree.location, condition, body);
    },
    transformWithStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression === tree.expression && body === tree.body) {
        return tree;
      }
      return new WithStatement(tree.location, expression, body);
    },
    transformYieldExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new YieldExpression(tree.location, expression, tree.isYieldFor);
    }
  }, {});
  return {get ParseTreeTransformer() {
      return ParseTreeTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/TypeofTransformer", function() {
  "use strict";
  var $__277 = Object.freeze(Object.defineProperties(["$traceurRuntime.typeof(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.typeof(", ")"])}})),
      $__278 = Object.freeze(Object.defineProperties(["(typeof ", " === 'undefined' ?\n          'undefined' : ", ")"], {raw: {value: Object.freeze(["(typeof ", " === 'undefined' ?\n          'undefined' : ", ")"])}}));
  var IDENTIFIER_EXPRESSION = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTreeType.js").IDENTIFIER_EXPRESSION;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var TYPEOF = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType.js").TYPEOF;
  var parseExpression = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PlaceholderParser").parseExpression;
  var TypeofTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $TypeofTransformer.prototype, arguments);
  };
  var $TypeofTransformer = ($traceurRuntime.createClass)(TypeofTransformer, {transformUnaryExpression: function(tree) {
      if (tree.operator.type !== TYPEOF) return $traceurRuntime.superCall(this, $TypeofTransformer.prototype, "transformUnaryExpression", [tree]);
      var operand = this.transformAny(tree.operand);
      var expression = parseExpression($__277, operand);
      if (operand.type === IDENTIFIER_EXPRESSION) {
        return parseExpression($__278, operand, expression);
      }
      return expression;
    }}, {}, ParseTreeTransformer);
  return {get TypeofTransformer() {
      return TypeofTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/UniqueIdentifierGenerator", function() {
  "use strict";
  var UniqueIdentifierGenerator = function() {
    this.identifierIndex = 0;
  };
  UniqueIdentifierGenerator = ($traceurRuntime.createClass)(UniqueIdentifierGenerator, {generateUniqueIdentifier: function() {
      return ("$__" + this.identifierIndex++);
    }}, {});
  return {get UniqueIdentifierGenerator() {
      return UniqueIdentifierGenerator;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/FromOptionsTransformer", function() {
  "use strict";
  var AmdTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AmdTransformer").AmdTransformer;
  var ArrayComprehensionTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ArrayComprehensionTransformer").ArrayComprehensionTransformer;
  var ArrowFunctionTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ArrowFunctionTransformer").ArrowFunctionTransformer;
  var BlockBindingTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/BlockBindingTransformer").BlockBindingTransformer;
  var ClassTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ClassTransformer").ClassTransformer;
  var CommonJsModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/CommonJsModuleTransformer").CommonJsModuleTransformer;
  var DefaultParametersTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/DefaultParametersTransformer").DefaultParametersTransformer;
  var DestructuringTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/DestructuringTransformer").DestructuringTransformer;
  var ForOfTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ForOfTransformer").ForOfTransformer;
  var FreeVariableChecker = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/FreeVariableChecker").FreeVariableChecker;
  var GeneratorComprehensionTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/GeneratorComprehensionTransformer").GeneratorComprehensionTransformer;
  var GeneratorTransformPass = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/GeneratorTransformPass").GeneratorTransformPass;
  var ModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ModuleTransformer").ModuleTransformer;
  var MultiTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/MultiTransformer").MultiTransformer;
  var NumericLiteralTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/NumericLiteralTransformer").NumericLiteralTransformer;
  var ObjectLiteralTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ObjectLiteralTransformer").ObjectLiteralTransformer;
  var ObjectMap = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ObjectMap").ObjectMap;
  var ParseTreeValidator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeValidator").ParseTreeValidator;
  var PropertyNameShorthandTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/PropertyNameShorthandTransformer").PropertyNameShorthandTransformer;
  var RestParameterTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/RestParameterTransformer").RestParameterTransformer;
  var SpreadTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/SpreadTransformer").SpreadTransformer;
  var SymbolTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/SymbolTransformer").SymbolTransformer;
  var TemplateLiteralTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TemplateLiteralTransformer").TemplateLiteralTransformer;
  var TypeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TypeTransformer").TypeTransformer;
  var TypeofTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/TypeofTransformer").TypeofTransformer;
  var UniqueIdentifierGenerator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/UniqueIdentifierGenerator").UniqueIdentifierGenerator;
  var $__284 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options"),
      options = $__284.options,
      transformOptions = $__284.transformOptions;
  var FromOptionsTransformer = function(reporter) {
    var idGenerator = arguments[1] !== (void 0) ? arguments[1]: new UniqueIdentifierGenerator();
    var $__282 = this;
    $traceurRuntime.superCall(this, $FromOptionsTransformer.prototype, "constructor", [reporter, options.validate]);
    var append = (function(transformer) {
      $__282.append((function(tree) {
        return new transformer(idGenerator, reporter).transformAny(tree);
      }));
    });
    if (transformOptions.types) append(TypeTransformer);
    if (transformOptions.numericLiterals) append(NumericLiteralTransformer);
    if (transformOptions.templateLiterals) append(TemplateLiteralTransformer);
    if (transformOptions.modules) {
      switch (transformOptions.modules) {
        case 'commonjs':
          append(CommonJsModuleTransformer);
          break;
        case 'amd':
          append(AmdTransformer);
          break;
        default:
          append(ModuleTransformer);
      }
    }
    if (transformOptions.arrowFunctions) append(ArrowFunctionTransformer);
    if (transformOptions.classes) append(ClassTransformer);
    if (transformOptions.propertyNameShorthand) append(PropertyNameShorthandTransformer);
    if (transformOptions.propertyMethods || transformOptions.computedPropertyNames) {
      append(ObjectLiteralTransformer);
    }
    if (transformOptions.generatorComprehension) append(GeneratorComprehensionTransformer);
    if (transformOptions.arrayComprehension) append(ArrayComprehensionTransformer);
    if (transformOptions.forOf) append(ForOfTransformer);
    if (transformOptions.restParameters) append(RestParameterTransformer);
    if (transformOptions.defaultParameters) append(DefaultParametersTransformer);
    if (transformOptions.destructuring) append(DestructuringTransformer);
    if (transformOptions.generators || transformOptions.deferredFunctions) append(GeneratorTransformPass);
    if (transformOptions.spread) append(SpreadTransformer);
    if (transformOptions.blockBinding) append(BlockBindingTransformer);
    if (transformOptions.symbols) {
      append(SymbolTransformer);
      append(TypeofTransformer);
    }
    if (options.freeVariableChecker) {
      this.append((function(tree) {
        FreeVariableChecker.checkScript(reporter, tree);
        return tree;
      }));
    }
  };
  var $FromOptionsTransformer = ($traceurRuntime.createClass)(FromOptionsTransformer, {}, {}, MultiTransformer);
  return {get FromOptionsTransformer() {
      return FromOptionsTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/AttachModuleNameTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__286 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      Module = $__286.Module,
      Script = $__286.Script;
  var AttachModuleNameTransformer = function(moduleName) {
    this.moduleName_ = moduleName;
  };
  AttachModuleNameTransformer = ($traceurRuntime.createClass)(AttachModuleNameTransformer, {
    transformModule: function(tree) {
      return new Module(tree.location, tree.scriptItemList, this.moduleName_);
    },
    transformScript: function(tree) {
      return new Script(tree.location, tree.scriptItemList, this.moduleName_);
    }
  }, {}, ParseTreeTransformer);
  return {get AttachModuleNameTransformer() {
      return AttachModuleNameTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/util/url", function() {
  "use strict";
  var canonicalizeUrl = $traceurRuntime.canonicalizeUrl;
  var isAbsolute = $traceurRuntime.isAbsolute;
  var removeDotSegments = $traceurRuntime.removeDotSegments;
  var resolveUrl = $traceurRuntime.resolveUrl;
  return {
    get canonicalizeUrl() {
      return canonicalizeUrl;
    },
    get isAbsolute() {
      return isAbsolute;
    },
    get removeDotSegments() {
      return removeDotSegments;
    },
    get resolveUrl() {
      return resolveUrl;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/ModuleSpecifierVisitor", function() {
  "use strict";
  var ParseTreeVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/ParseTreeVisitor").ParseTreeVisitor;
  var STRING = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/TokenType").STRING;
  var canonicalizeUrl = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/url").canonicalizeUrl;
  var ModuleSpecifierVisitor = function(reporter) {
    $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "constructor", []);
    this.moduleSpecifiers_ = Object.create(null);
  };
  var $ModuleSpecifierVisitor = ($traceurRuntime.createClass)(ModuleSpecifierVisitor, {
    get moduleSpecifiers() {
      return Object.keys(this.moduleSpecifiers_);
    },
    visitModuleSpecifier: function(tree) {
      this.moduleSpecifiers_[tree.token.processedValue] = true;
    }
  }, {}, ParseTreeVisitor);
  return {get ModuleSpecifierVisitor() {
      return ModuleSpecifierVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/module/ValidationVisitor", function() {
  "use strict";
  var ModuleVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ModuleVisitor").ModuleVisitor;
  var ValidationVisitor = function() {
    $traceurRuntime.defaultSuperCall(this, $ValidationVisitor.prototype, arguments);
  };
  var $ValidationVisitor = ($traceurRuntime.createClass)(ValidationVisitor, {
    checkExport_: function(tree, name) {
      var moduleSymbol = this.validatingModule_;
      if (moduleSymbol && !moduleSymbol.hasExport(name)) {
        var moduleName = moduleSymbol.normalizedName;
        this.reportError(tree, ("'" + name + "' is not exported by '" + moduleName + "'"));
      }
    },
    visitAndValidate_: function(moduleSymbol, tree) {
      var validatingModule = this.validatingModule_;
      this.validatingModule_ = moduleSymbol;
      this.visitAny(tree);
      this.validatingModule_ = validatingModule;
    },
    visitNamedExport: function(tree) {
      if (tree.moduleSpecifier) {
        var moduleSymbol = this.getModuleSymbolForModuleSpecifier(tree.moduleSpecifier);
        this.visitAndValidate_(moduleSymbol, tree.specifierSet);
      }
    },
    visitExportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },
    visitModuleSpecifier: function(tree) {
      this.getModuleSymbolForModuleSpecifier(tree);
    },
    visitImportDeclaration: function(tree) {
      var moduleSymbol = this.getModuleSymbolForModuleSpecifier(tree.moduleSpecifier);
      this.visitAndValidate_(moduleSymbol, tree.importClause);
    },
    visitImportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },
    visitImportedBinding: function(tree) {
      this.checkExport_(tree, 'default');
    }
  }, {}, ModuleVisitor);
  return {get ValidationVisitor() {
      return ValidationVisitor;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/ModuleAnalyzer", function() {
  "use strict";
  var ExportVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ExportVisitor").ExportVisitor;
  var ValidationVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ValidationVisitor").ValidationVisitor;
  var transformOptions = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").transformOptions;
  var ModuleAnalyzer = function(reporter) {
    this.reporter_ = reporter;
  };
  ModuleAnalyzer = ($traceurRuntime.createClass)(ModuleAnalyzer, {analyzeTrees: function(trees, moduleSymbols, loader) {
      if (!transformOptions.modules) return;
      var reporter = this.reporter_;
      function getModuleSymbol(i) {
        return moduleSymbols.length ? moduleSymbols[i]: moduleSymbols;
      }
      function doVisit(ctor) {
        for (var i = 0; i < trees.length; i++) {
          var visitor = new ctor(reporter, loader, getModuleSymbol(i));
          visitor.visitAny(trees[i]);
        }
      }
      function reverseVisit(ctor) {
        for (var i = trees.length - 1; i >= 0; i--) {
          var visitor = new ctor(reporter, loader, getModuleSymbol(i));
          visitor.visitAny(trees[i]);
        }
      }
      reverseVisit(ExportVisitor);
      doVisit(ValidationVisitor);
    }}, {});
  return {get ModuleAnalyzer() {
      return ModuleAnalyzer;
    }};
});
System.registerModule("traceur@0.0.Y/src/semantics/symbols/ModuleSymbol", function() {
  "use strict";
  var Symbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/Symbol").Symbol;
  var MODULE = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/SymbolType").MODULE;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var ModuleSymbol = function(tree, normalizedName) {
    $traceurRuntime.superCall(this, $ModuleSymbol.prototype, "constructor", [MODULE, tree]);
    this.exports_ = Object.create(null);
    assert(normalizedName);
    this.normalizedName = normalizedName.replace(/\\/g, '/');
  };
  var $ModuleSymbol = ($traceurRuntime.createClass)(ModuleSymbol, {
    hasExport: function(name) {
      return name in this.exports_;
    },
    getExport: function(name) {
      return this.exports_[name];
    },
    addExport: function(exp) {
      this.exports_[exp.name] = exp;
    },
    getExports: function() {
      var exports = this.exports_;
      return Object.keys(exports).map((function(key) {
        return exports[key];
      }));
    }
  }, {}, Symbol);
  return {get ModuleSymbol() {
      return ModuleSymbol;
    }};
});
System.registerModule("traceur@0.0.Y/src/runtime/webLoader", function() {
  "use strict";
  var webLoader = {
    load: function(url, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if (xhr.status == 200 || xhr.status == 0) {
          callback(xhr.responseText);
        } else {
          errback();
        }
        xhr = null;
      };
      xhr.onerror = function() {
        errback();
      };
      xhr.open('GET', url, true);
      xhr.send();
      return (function() {
        return xhr && xhr.abort();
      });
    },
    loadSync: function(url) {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function(e) {
        throw new Error(xhr.statusText);
      };
      xhr.open('GET', url, false);
      xhr.send();
      if (xhr.status == 200 || xhr.status == 0) return xhr.responseText;
    }
  };
  return {get webLoader() {
      return webLoader;
    }};
});
System.registerModule("traceur@0.0.Y/src/runtime/LoaderHooks", function() {
  "use strict";
  var AttachModuleNameTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/AttachModuleNameTransformer").AttachModuleNameTransformer;
  var FromOptionsTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FromOptionsTransformer").FromOptionsTransformer;
  var ModuleAnalyzer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/ModuleAnalyzer").ModuleAnalyzer;
  var ModuleSpecifierVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ModuleSpecifierVisitor").ModuleSpecifierVisitor;
  var ModuleSymbol = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/symbols/ModuleSymbol").ModuleSymbol;
  var Parser = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Parser").Parser;
  var options = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options").options;
  var SourceFile = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/SourceFile").SourceFile;
  var TreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/TreeWriter").TreeWriter;
  var UniqueIdentifierGenerator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/UniqueIdentifierGenerator").UniqueIdentifierGenerator;
  var $__296 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/url"),
      isAbsolute = $__296.isAbsolute,
      resolveUrl = $__296.resolveUrl;
  var webLoader = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/webLoader").webLoader;
  var assert = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/assert").assert;
  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMED = 4;
  var COMPLETE = 5;
  var ERROR = 6;
  var identifierGenerator = new UniqueIdentifierGenerator();
  var LoaderHooks = function(reporter, rootUrl, outputOptions) {
    var fileLoader = arguments[3] !== (void 0) ? arguments[3]: webLoader;
    this.reporter = reporter;
    this.rootUrl_ = rootUrl;
    this.outputOptions_ = outputOptions;
    this.fileLoader = fileLoader;
    this.analyzer_ = new ModuleAnalyzer(this.reporter);
  };
  LoaderHooks = ($traceurRuntime.createClass)(LoaderHooks, {
    rootUrl: function() {
      return this.rootUrl_;
    },
    getModuleSpecifiers: function(codeUnit) {
      if (!this.parse(codeUnit)) return;
      codeUnit.state = PARSED;
      var moduleSpecifierVisitor = new ModuleSpecifierVisitor(this.reporter);
      moduleSpecifierVisitor.visit(codeUnit.data.tree);
      return moduleSpecifierVisitor.moduleSpecifiers;
    },
    parse: function(codeUnit) {
      assert(!codeUnit.data.tree);
      var reporter = this.reporter;
      var normalizedName = codeUnit.name;
      var program = codeUnit.text;
      var url = codeUnit.url || normalizedName;
      var file = new SourceFile(url, program);
      var parser = new Parser(reporter, file);
      if (codeUnit.type == 'module') codeUnit.data.tree = parser.parseModule(); else codeUnit.data.tree = parser.parseScript();
      codeUnit.data.moduleSymbol = new ModuleSymbol(codeUnit.data.tree, normalizedName);
      return !reporter.hadError();
    },
    transform: function(codeUnit) {
      var transformer = new AttachModuleNameTransformer(codeUnit.name);
      var transformedTree = transformer.transformAny(codeUnit.data.tree);
      transformer = new FromOptionsTransformer(this.reporter, identifierGenerator);
      return transformer.transform(transformedTree);
    },
    fetch: function($__296, callback, errback) {
      var address = $__296.address;
      this.fileLoader.load(address, callback, errback);
    },
    instantiate: function($__297) {
      var name = $__297.name,
          metadata = $__297.metadata,
          address = $__297.address,
          source = $__297.source,
          sourceMap = $__297.sourceMap;
      return undefined;
    },
    locate: function(load) {
      load.url = this.locate_(load);
      return load.url;
    },
    locate_: function(load) {
      var normalizedModuleName = load.name;
      var asJS = normalizedModuleName + '.js';
      if (/\.js$/.test(normalizedModuleName)) asJS = normalizedModuleName;
      if (options.referrer) {
        if (asJS.indexOf(options.referrer) === 0) asJS = asJS.slice(options.referrer.length);
      }
      if (isAbsolute(asJS)) return asJS;
      var baseURL = load.metadata && load.metadata.baseURL;
      baseURL = baseURL || this.rootUrl();
      if (baseURL) return resolveUrl(baseURL, asJS);
      return asJS;
    },
    evaluateCodeUnit: function(codeUnit) {
      var result = ('global', eval)(codeUnit.data.transcoded);
      codeUnit.data.transformedTree = null;
      return result;
    },
    analyzeDependencies: function(dependencies, loader) {
      var trees = [];
      var moduleSymbols = [];
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        assert(codeUnit.state >= PARSED);
        if (codeUnit.state == PARSED) {
          trees.push(codeUnit.data.tree);
          moduleSymbols.push(codeUnit.data.moduleSymbol);
        }
      }
      this.analyzer_.analyzeTrees(trees, moduleSymbols, loader);
      this.checkForErrors(dependencies, 'analyze');
    },
    transformDependencies: function(dependencies) {
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= TRANSFORMED) {
          continue;
        }
        this.transformCodeUnit(codeUnit);
        this.instantiate(codeUnit);
      }
      this.checkForErrors(dependencies, 'transform');
    },
    transformCodeUnit: function(codeUnit) {
      this.transformDependencies(codeUnit.dependencies);
      codeUnit.data.transformedTree = codeUnit.transform();
      codeUnit.state = TRANSFORMED;
      codeUnit.data.transcoded = TreeWriter.write(codeUnit.data.transformedTree, this.outputOptions_);
      if (codeUnit.url && codeUnit.data.transcoded) codeUnit.data.transcoded += '//# sourceURL=' + codeUnit.url;
      codeUnit.sourceMap = this.outputOptions_ && this.outputOptions_.sourceMap;
    },
    checkForErrors: function(dependencies, phase) {
      if (this.reporter.hadError()) {
        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state >= COMPLETE) {
            continue;
          }
          codeUnit.state = ERROR;
        }
        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state == ERROR) {
            codeUnit.dispatchError(phase);
          }
        }
      }
    }
  }, {});
  return {get LoaderHooks() {
      return LoaderHooks;
    }};
});
System.registerModule("traceur@0.0.Y/src/runtime/InterceptOutputLoaderHooks", function() {
  "use strict";
  var LoaderHooks = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/LoaderHooks").LoaderHooks;
  var InterceptOutputLoaderHooks = function() {
    for (var args = [],
        $__299 = 0; $__299 < arguments.length; $__299++) args[$__299] = arguments[$__299];
    $traceurRuntime.superCall(this, $InterceptOutputLoaderHooks.prototype, "constructor", $traceurRuntime.spread(args));
    this.sourceMap = null;
    this.transcoded = null;
  };
  var $InterceptOutputLoaderHooks = ($traceurRuntime.createClass)(InterceptOutputLoaderHooks, {instantiate: function($__300) {
      var data = $__300.data;
      this.sourceMap = data.sourceMap;
      this.transcoded = data.transcoded;
      return undefined;
    }}, {}, LoaderHooks);
  return {get InterceptOutputLoaderHooks() {
      return InterceptOutputLoaderHooks;
    }};
});
System.registerModule("traceur@0.0.Y/src/runtime/Loader", function() {
  "use strict";
  var ArrayMap = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ArrayMap").ArrayMap;
  var LoaderHooks = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/LoaderHooks").LoaderHooks;
  var ObjectMap = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ObjectMap").ObjectMap;
  var getUid = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/uid").getUid;
  var base = Object.freeze(Object.create(null, {
    Array: {value: Array},
    Boolean: {value: Boolean},
    Date: {value: Date},
    Error: {value: Error},
    EvalError: {value: EvalError},
    Function: {value: Function},
    JSON: {value: JSON},
    Math: {value: Math},
    Number: {value: Number},
    Object: {value: Object},
    RangeError: {value: RangeError},
    ReferenceError: {value: ReferenceError},
    RegExp: {value: RegExp},
    String: {value: String},
    SyntaxError: {value: SyntaxError},
    TypeError: {value: TypeError},
    URIError: {value: URIError},
    undefined: {value: void 0}
  }));
  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMED = 4;
  var COMPLETE = 5;
  var ERROR = 6;
  var CodeUnit = function(loaderHooks, name, type, state) {
    this.loaderHooks = loaderHooks;
    this.name = name;
    this.type = type;
    this.state = state;
    this.uid = getUid();
    this.state_ = NOT_STARTED;
    this.error = null;
    this.result = null;
    this.data_ = {};
  };
  CodeUnit = ($traceurRuntime.createClass)(CodeUnit, {
    get state() {
      return this.state_;
    },
    set state(state) {
      if (state < this.state_) {
        throw new Error('Invalid state change');
      }
      this.state_ = state;
    },
    get data() {
      return this.data_;
    },
    addListener: function(callback, errback) {
      if (this.state >= COMPLETE) throw Error((this.name + " is already loaded"));
      if (!this.listeners) {
        this.listeners = [];
      }
      this.listeners.push(callback, errback);
    },
    dispatchError: function(value) {
      this.dispatch_(value, 1);
    },
    dispatchComplete: function(value) {
      this.dispatch_(value, 0);
    },
    dispatch_: function(value, error) {
      var listeners = this.listeners;
      if (!listeners) {
        return;
      }
      listeners = listeners.concat();
      this.listeners = [];
      for (var i = error; i < listeners.length; i += 2) {
        var f = listeners[i];
        if (f) {
          f(value);
        }
      }
    },
    transform: function() {
      return this.loaderHooks.transform(this);
    },
    instantiate: function() {
      if (this.loaderHooks.instantiate(this)) throw new Error('instantiate() with factory return not implemented.');
    }
  }, {});
  var LoadCodeUnit = function(loaderHooks, name) {
    $traceurRuntime.superCall(this, $LoadCodeUnit.prototype, "constructor", [loaderHooks, name, 'module', NOT_STARTED]);
  };
  var $LoadCodeUnit = ($traceurRuntime.createClass)(LoadCodeUnit, {}, {}, CodeUnit);
  var EvalCodeUnit = function(loaderHooks, code) {
    var name = arguments[2] !== (void 0) ? arguments[2]: loaderHooks.rootUrl();
    $traceurRuntime.superCall(this, $EvalCodeUnit.prototype, "constructor", [loaderHooks, name, LOADED]);
    this.text = code;
  };
  var $EvalCodeUnit = ($traceurRuntime.createClass)(EvalCodeUnit, {}, {}, CodeUnit);
  var InternalLoader = function(loaderHooks) {
    this.loaderHooks = loaderHooks;
    this.reporter = loaderHooks.reporter;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
    this.translateHook = loaderHooks.translate || defaultTranslate;
  };
  InternalLoader = ($traceurRuntime.createClass)(InternalLoader, {
    loadTextFile: function(url, callback, errback) {
      return this.loaderHooks.fetch({address: url}, callback, errback);
    },
    loadUnnormalized: function(name) {
      var referrerName = arguments[1] !== (void 0) ? arguments[1]: this.loaderHooks.rootUrl();
      var address = arguments[2];
      var type = arguments[3] !== (void 0) ? arguments[3]: 'script';
      var normalizedName = System.normalize(name, referrerName, address);
      return this.load(normalizedName, type);
    },
    load: function(normalizedName, type) {
      var codeUnit = this.getCodeUnit(normalizedName, type);
      if (codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) {
        return codeUnit;
      }
      codeUnit.state = LOADING;
      var loader = this;
      var translate = this.translateHook;
      var url = this.loaderHooks.locate(codeUnit);
      codeUnit.abort = this.loadTextFile(url, function(text) {
        codeUnit.text = translate(text);
        codeUnit.state = LOADED;
        loader.handleCodeUnitLoaded(codeUnit);
      }, function() {
        codeUnit.state = ERROR;
        loader.handleCodeUnitLoadError(codeUnit);
      });
      return codeUnit;
    },
    module: function(code, name, referrerName, address) {
      var normalizedName = System.normalize(name, referrerName, address);
      var codeUnit = new EvalCodeUnit(this.loaderHooks, code, normalizedName);
      this.cache.set({}, codeUnit);
      return codeUnit;
    },
    script: function(code) {
      var name = arguments[1] !== (void 0) ? arguments[1]: this.loaderHooks.rootUrl();
      var referrerName = arguments[2];
      var address = arguments[3];
      var normalizedName = System.normalize(name, referrerName, address);
      var codeUnit = new EvalCodeUnit(this.loaderHooks, code, normalizedName);
      this.cache.set({}, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit;
    },
    getKey: function(url, type) {
      var combined = type + ':' + url;
      if (combined in this.urlToKey) {
        return this.urlToKey[combined];
      }
      return this.urlToKey[combined] = {};
    },
    getCodeUnit: function(name, type) {
      var key = this.getKey(name, type);
      var cacheObject = this.cache.get(key);
      if (!cacheObject) {
        cacheObject = new LoadCodeUnit(this.loaderHooks, name);
        cacheObject.type = type;
        this.cache.set(key, cacheObject);
      }
      return cacheObject;
    },
    areAll: function(state) {
      return this.cache.values().every((function(codeUnit) {
        return codeUnit.state >= state;
      }));
    },
    getCodeUnitForModuleSpecifier: function(name, referrerName) {
      var name = System.normalize(name, referrerName);
      return this.getCodeUnit(name, 'module');
    },
    handleCodeUnitLoaded: function(codeUnit) {
      var $__301 = this;
      var referrerName = codeUnit.name;
      var moduleSpecifiers = this.loaderHooks.getModuleSpecifiers(codeUnit);
      if (!moduleSpecifiers) {
        this.abortAll();
        return;
      }
      codeUnit.dependencies = moduleSpecifiers.sort().map((function(name) {
        name = System.normalize(name, referrerName);
        return $__301.getCodeUnit(name, 'module');
      }));
      codeUnit.dependencies.forEach((function(dependency) {
        $__301.load(dependency.name, 'module');
      }));
      if (this.areAll(PARSED)) {
        this.analyze();
        this.transform();
        this.evaluate();
      }
    },
    handleCodeUnitLoadError: function(codeUnit) {
      codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
      this.reporter.reportError(null, codeUnit.error);
      this.abortAll();
      codeUnit.dispatchError(codeUnit.error);
    },
    abortAll: function() {
      this.cache.values().forEach((function(codeUnit) {
        if (codeUnit.abort) {
          codeUnit.abort();
          codeUnit.state = ERROR;
        }
      }));
      this.cache.values().forEach((function(codeUnit) {
        codeUnit.dispatchError(codeUnit.error);
      }));
    },
    analyze: function() {
      this.loaderHooks.analyzeDependencies(this.cache.values(), this);
    },
    transform: function() {
      this.loaderHooks.transformDependencies(this.cache.values());
    },
    orderDependencies: function(codeUnit) {
      var visited = new ObjectMap();
      var ordered = [];
      function orderCodeUnits(codeUnit) {
        if (visited.has(codeUnit)) {
          return;
        }
        visited.set(codeUnit, true);
        codeUnit.dependencies.forEach(orderCodeUnits);
        ordered.push(codeUnit);
      }
      this.cache.values().forEach(orderCodeUnits);
      return ordered;
    },
    evaluate: function() {
      var dependencies = this.orderDependencies(codeUnit);
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        var result;
        try {
          result = this.loaderHooks.evaluateCodeUnit(codeUnit);
        } catch (ex) {
          codeUnit.error = ex;
          this.reporter.reportError(null, String(ex));
          this.abortAll();
          codeUnit.dispatchError(codeUnit.error);
          return;
        }
        codeUnit.result = result;
        codeUnit.text = null;
      }
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        codeUnit.state = COMPLETE;
        codeUnit.dispatchComplete(codeUnit.result);
      }
    }
  }, {});
  function defaultTranslate(source) {
    return source;
  }
  var SystemLoaderHooks = LoaderHooks;
  var Loader = function(loaderHooks) {
    this.internalLoader_ = new InternalLoader(loaderHooks);
  };
  Loader = ($traceurRuntime.createClass)(Loader, {
    import: function(name) {
      var $__303 = arguments[1] !== (void 0) ? arguments[1]: {},
          referrerName = $__303.referrerName,
          address = $__303.address;
      var callback = arguments[2] !== (void 0) ? arguments[2]: (function(module) {});
      var errback = arguments[3] !== (void 0) ? arguments[3]: (function(ex) {
        throw ex;
      });
      var codeUnit = this.internalLoader_.loadUnnormalized(name, referrerName, address, 'module');
      codeUnit.addListener(function() {
        callback(System.get(codeUnit.name));
      }, errback);
    },
    module: function(source, name) {
      var $__303 = arguments[2] !== (void 0) ? arguments[2]: {},
          referrerName = $__303.referrerName,
          address = $__303.address;
      var callback = arguments[3] !== (void 0) ? arguments[3]: (function(module) {});
      var errback = arguments[4] !== (void 0) ? arguments[4]: (function(ex) {
        throw ex;
      });
      var codeUnit = this.internalLoader_.module (source, name, referrerName, address);
      codeUnit.addListener(callback, errback);
      this.internalLoader_.handleCodeUnitLoaded(codeUnit);
    },
    loadAsScript: function(name) {
      var $__303 = arguments[1] !== (void 0) ? arguments[1]: {},
          referrerName = $__303.referrerName,
          address = $__303.address;
      var callback = arguments[2] !== (void 0) ? arguments[2]: (function(result) {});
      var errback = arguments[3] !== (void 0) ? arguments[3]: (function(ex) {
        throw ex;
      });
      var codeUnit = this.internalLoader_.loadUnnormalized(name, referrerName, address, 'script');
      codeUnit.addListener(function(result) {
        callback(result);
      }, errback);
    },
    script: function(source, name) {
      var $__303 = arguments[2] !== (void 0) ? arguments[2]: {},
          referrerName = $__303.referrerName,
          address = $__303.address;
      var callback = arguments[3] !== (void 0) ? arguments[3]: (function(result) {});
      var errback = arguments[4] !== (void 0) ? arguments[4]: (function(ex) {
        throw ex;
      });
      try {
        var codeUnit = this.internalLoader_.script(source, name, referrerName, address);
        callback(codeUnit.result);
      } catch (ex) {
        errback(ex);
      }
    }
  }, {});
  ;
  var internals = {
    CodeUnit: CodeUnit,
    EvalCodeUnit: EvalCodeUnit,
    Loader: Loader,
    LoadCodeUnit: LoadCodeUnit,
    LoaderHooks: LoaderHooks
  };
  return {
    get Loader() {
      return Loader;
    },
    get LoaderHooks() {
      return LoaderHooks;
    },
    get internals() {
      return internals;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/WebPageTranscoder", function() {
  "use strict";
  var Loader = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/Loader").Loader;
  var ErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ErrorReporter").ErrorReporter;
  var InterceptOutputLoaderHooks = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/InterceptOutputLoaderHooks").InterceptOutputLoaderHooks;
  var webLoader = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/webLoader").webLoader;
  var WebPageTranscoder = function(url) {
    this.url = url;
    this.numPending_ = 0;
    this.numberInlined_ = 0;
  };
  WebPageTranscoder = ($traceurRuntime.createClass)(WebPageTranscoder, {
    asyncLoad_: function(url, fncOfContent, onScriptsReady) {
      var $__304 = this;
      this.numPending_++;
      webLoader.load(url, (function(content) {
        if (content) fncOfContent(content); else console.warn('Failed to load', url);
        if (--$__304.numPending_ <= 0) onScriptsReady();
      }), (function(error) {
        console.error('WebPageTranscoder FAILED to load ' + url, error);
      }));
    },
    addFileFromScriptElement: function(scriptElement, name, content) {
      this.loader.module (content, name);
    },
    nextInlineScriptName_: function() {
      this.numberInlined_ += 1;
      if (!this.inlineScriptNameBase_) {
        var segments = this.url.split('.');
        segments.pop();
        this.inlineScriptNameBase_ = segments.join('.');
      }
      return this.inlineScriptNameBase_ + '_' + this.numberInlined_ + '.js';
    },
    addFilesFromScriptElements: function(scriptElements, onScriptsReady) {
      for (var i = 0,
          length = scriptElements.length; i < length; i++) {
        var scriptElement = scriptElements[i];
        if (!scriptElement.src) {
          var name = this.nextInlineScriptName_();
          var content = scriptElement.textContent;
          this.addFileFromScriptElement(scriptElement, name, content);
        } else {
          var name = scriptElement.src;
          this.asyncLoad_(name, this.addFileFromScriptElement.bind(this, scriptElement, name), onScriptsReady);
        }
      }
      if (this.numPending_ <= 0) onScriptsReady();
    },
    get reporter() {
      if (!this.reporter_) {
        this.reporter_ = new ErrorReporter();
      }
      return this.reporter_;
    },
    get loader() {
      if (!this.loader_) {
        var loaderHooks = new InterceptOutputLoaderHooks(this.reporter, this.url);
        this.loader_ = new Loader(loaderHooks);
      }
      return this.loader_;
    },
    putFile: function(file) {
      var scriptElement = document.createElement('script');
      scriptElement.setAttribute('data-traceur-src-url', file.name);
      scriptElement.textContent = file.generatedSource;
      var parent = file.scriptElement.parentNode;
      parent.insertBefore(scriptElement, file.scriptElement || null);
    },
    selectAndProcessScripts: function(done) {
      var selector = 'script[type="module"]';
      var scripts = document.querySelectorAll(selector);
      if (!scripts.length) {
        done();
        return;
      }
      this.addFilesFromScriptElements(scripts, (function() {
        done();
      }));
    },
    run: function() {
      var done = arguments[0] !== (void 0) ? arguments[0]: (function() {});
      var $__304 = this;
      var ready = document.readyState;
      if (ready === 'complete' || ready === 'loaded') {
        this.selectAndProcessScripts(done);
      } else {
        document.addEventListener('DOMContentLoaded', (function() {
          return $__304.selectAndProcessScripts(done);
        }), false);
      }
    }
  }, {});
  return {get WebPageTranscoder() {
      return WebPageTranscoder;
    }};
});
System.registerModule("traceur@0.0.Y/src/codegeneration/CloneTreeTransformer", function() {
  "use strict";
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var $__308 = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/trees/ParseTrees"),
      BindingIdentifier = $__308.BindingIdentifier,
      BreakStatement = $__308.BreakStatement,
      ContinueStatement = $__308.ContinueStatement,
      DebuggerStatement = $__308.DebuggerStatement,
      EmptyStatement = $__308.EmptyStatement,
      ExportSpecifier = $__308.ExportSpecifier,
      ExportStar = $__308.ExportStar,
      IdentifierExpression = $__308.IdentifierExpression,
      ImportSpecifier = $__308.ImportSpecifier,
      LiteralExpression = $__308.LiteralExpression,
      ModuleSpecifier = $__308.ModuleSpecifier,
      PredefinedType = $__308.PredefinedType,
      PropertyNameShorthand = $__308.PropertyNameShorthand,
      TemplateLiteralPortion = $__308.TemplateLiteralPortion,
      RestParameter = $__308.RestParameter,
      SuperExpression = $__308.SuperExpression,
      ThisExpression = $__308.ThisExpression;
  var CloneTreeTransformer = function() {
    $traceurRuntime.defaultSuperCall(this, $CloneTreeTransformer.prototype, arguments);
  };
  var $CloneTreeTransformer = ($traceurRuntime.createClass)(CloneTreeTransformer, {
    transformBindingIdentifier: function(tree) {
      return new BindingIdentifier(tree.location, tree.identifierToken);
    },
    transformBreakStatement: function(tree) {
      return new BreakStatement(tree.location, tree.name);
    },
    transformContinueStatement: function(tree) {
      return new ContinueStatement(tree.location, tree.name);
    },
    transformDebuggerStatement: function(tree) {
      return new DebuggerStatement(tree.location);
    },
    transformEmptyStatement: function(tree) {
      return new EmptyStatement(tree.location);
    },
    transformExportSpecifier: function(tree) {
      return new ExportSpecifier(tree.location, tree.lhs, tree.rhs);
    },
    transformExportStar: function(tree) {
      return new ExportStar(tree.location);
    },
    transformIdentifierExpression: function(tree) {
      return new IdentifierExpression(tree.location, tree.identifierToken);
    },
    transformImportSpecifier: function(tree) {
      return new ImportSpecifier(tree.location, tree.lhs, tree.rhs);
    },
    transformList: function(list) {
      if (!list) {
        return null;
      } else if (list.length == 0) {
        return [];
      } else {
        return $traceurRuntime.superCall(this, $CloneTreeTransformer.prototype, "transformList", [list]);
      }
    },
    transformLiteralExpression: function(tree) {
      return new LiteralExpression(tree.location, tree.literalToken);
    },
    transformModuleSpecifier: function(tree) {
      return new ModuleSpecifier(tree.location, tree.token);
    },
    transformPredefinedType: function(tree) {
      return new PredefinedType(tree.location, tree.typeToken);
    },
    transformPropertyNameShorthand: function(tree) {
      return new PropertyNameShorthand(tree.location, tree.name);
    },
    transformTemplateLiteralPortion: function(tree) {
      return new TemplateLiteralPortion(tree.location, tree.value);
    },
    transformSuperExpression: function(tree) {
      return new SuperExpression(tree.location);
    },
    transformThisExpression: function(tree) {
      return new ThisExpression(tree.location);
    }
  }, {}, ParseTreeTransformer);
  CloneTreeTransformer.cloneTree = function(tree) {
    return new CloneTreeTransformer().transformAny(tree);
  };
  return {get CloneTreeTransformer() {
      return CloneTreeTransformer;
    }};
});
System.registerModule("traceur@0.0.Y/src/outputgeneration/SourceMapIntegration", function() {
  "use strict";
  function makeDefine(mapping, id) {
    var require = function(id) {
      return mapping[id];
    };
    var exports = mapping[id] = {};
    var module = null;
    return function(factory) {
      factory(require, exports, module);
    };
  }
  var define,
      m = {};
  define = makeDefine(m, './util');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      } else {
        throw new Error('"' + aName + '" is a required argument.');
      }
    }
    exports.getArg = getArg;
    var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
    var dataUrlRegexp = /^data:.+\,.+/;
    function urlParse(aUrl) {
      var match = aUrl.match(urlRegexp);
      if (!match) {
        return null;
      }
      return {
        scheme: match[1],
        auth: match[3],
        host: match[4],
        port: match[6],
        path: match[7]
      };
    }
    exports.urlParse = urlParse;
    function urlGenerate(aParsedUrl) {
      var url = aParsedUrl.scheme + "://";
      if (aParsedUrl.auth) {
        url += aParsedUrl.auth + "@";
      }
      if (aParsedUrl.host) {
        url += aParsedUrl.host;
      }
      if (aParsedUrl.port) {
        url += ":" + aParsedUrl.port;
      }
      if (aParsedUrl.path) {
        url += aParsedUrl.path;
      }
      return url;
    }
    exports.urlGenerate = urlGenerate;
    function join(aRoot, aPath) {
      var url;
      if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
        return aPath;
      }
      if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
        url.path = aPath;
        return urlGenerate(url);
      }
      return aRoot.replace(/\/$/, '') + '/' + aPath;
    }
    exports.join = join;
    function toSetString(aStr) {
      return '$' + aStr;
    }
    exports.toSetString = toSetString;
    function fromSetString(aStr) {
      return aStr.substr(1);
    }
    exports.fromSetString = fromSetString;
    function relative(aRoot, aPath) {
      aRoot = aRoot.replace(/\/$/, '');
      var url = urlParse(aRoot);
      if (aPath.charAt(0) == "/" && url && url.path == "/") {
        return aPath.slice(1);
      }
      return aPath.indexOf(aRoot + '/') === 0 ? aPath.substr(aRoot.length + 1): aPath;
    }
    exports.relative = relative;
    function strcmp(aStr1, aStr2) {
      var s1 = aStr1 || "";
      var s2 = aStr2 || "";
      return (s1 > s2) - (s1 < s2);
    }
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
      var cmp;
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp || onlyCompareOriginal) {
        return cmp;
      }
      cmp = strcmp(mappingA.name, mappingB.name);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp) {
        return cmp;
      }
      return mappingA.generatedColumn - mappingB.generatedColumn;
    }
    ;
    exports.compareByOriginalPositions = compareByOriginalPositions;
    function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
      var cmp;
      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp || onlyCompareGenerated) {
        return cmp;
      }
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp) {
        return cmp;
      }
      return strcmp(mappingA.name, mappingB.name);
    }
    ;
    exports.compareByGeneratedPositions = compareByGeneratedPositions;
  });
  define = makeDefine(m, './array-set');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var util = require('./util');
    function ArraySet() {
      this._array = [];
      this._set = {};
    }
    ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet();
      for (var i = 0,
          len = aArray.length; i < len; i++) {
        set.add(aArray[i], aAllowDuplicates);
      }
      return set;
    };
    ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var isDuplicate = this.has(aStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        this._set[util.toSetString(aStr)] = idx;
      }
    };
    ArraySet.prototype.has = function ArraySet_has(aStr) {
      return Object.prototype.hasOwnProperty.call(this._set, util.toSetString(aStr));
    };
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
      if (this.has(aStr)) {
        return this._set[util.toSetString(aStr)];
      }
      throw new Error('"' + aStr + '" is not in the set.');
    };
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error('No element indexed by ' + aIdx);
    };
    ArraySet.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };
    exports.ArraySet = ArraySet;
  });
  define = makeDefine(m, './base64');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var charToIntMap = {};
    var intToCharMap = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach(function(ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });
    exports.encode = function base64_encode(aNumber) {
      if (aNumber in intToCharMap) {
        return intToCharMap[aNumber];
      }
      throw new TypeError("Must be between 0 and 63: " + aNumber);
    };
    exports.decode = function base64_decode(aChar) {
      if (aChar in charToIntMap) {
        return charToIntMap[aChar];
      }
      throw new TypeError("Not a valid base 64 digit: " + aChar);
    };
  });
  define = makeDefine(m, './base64-vlq');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var base64 = require('./base64');
    var VLQ_BASE_SHIFT = 5;
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    var VLQ_BASE_MASK = VLQ_BASE - 1;
    var VLQ_CONTINUATION_BIT = VLQ_BASE;
    function toVLQSigned(aValue) {
      return aValue < 0 ? ((- aValue) << 1) + 1: (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative ? - shifted: shifted;
    }
    exports.encode = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;
      var vlq = toVLQSigned(aValue);
      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base64.encode(digit);
      } while (vlq > 0);
      return encoded;
    };
    exports.decode = function base64VLQ_decode(aStr) {
      var i = 0;
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation,
          digit;
      do {
        if (i >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }
        digit = base64.decode(aStr.charAt(i++));
        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);
      return {
        value: fromVLQSigned(result),
        rest: aStr.slice(i)
      };
    };
  });
  define = makeDefine(m, './binary-search');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
      var mid = Math.floor((aHigh - aLow) / 2) + aLow;
      var cmp = aCompare(aNeedle, aHaystack[mid], true);
      if (cmp === 0) {
        return aHaystack[mid];
      } else if (cmp > 0) {
        if (aHigh - mid > 1) {
          return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
        }
        return aHaystack[mid];
      } else {
        if (mid - aLow > 1) {
          return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
        }
        return aLow < 0 ? null: aHaystack[aLow];
      }
    }
    exports.search = function search(aNeedle, aHaystack, aCompare) {
      return aHaystack.length > 0 ? recursiveSearch(- 1, aHaystack.length, aNeedle, aHaystack, aCompare): null;
    };
  });
  define = makeDefine(m, './source-map-generator');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var base64VLQ = require('./base64-vlq');
    var util = require('./util');
    var ArraySet = require('./array-set').ArraySet;
    function SourceMapGenerator(aArgs) {
      this._file = util.getArg(aArgs, 'file');
      this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
      this._sources = new ArraySet();
      this._names = new ArraySet();
      this._mappings = [];
      this._sourcesContents = null;
    }
    SourceMapGenerator.prototype._version = 3;
    SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function(mapping) {
        var newMapping = {generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }};
        if (mapping.source) {
          newMapping.source = mapping.source;
          if (sourceRoot) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }
          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };
          if (mapping.name) {
            newMapping.name = mapping.name;
          }
        }
        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };
    SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);
      this._validateMapping(generated, original, source, name);
      if (source && !this._sources.has(source)) {
        this._sources.add(source);
      }
      if (name && !this._names.has(name)) {
        this._names.add(name);
      }
      this._mappings.push({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };
    SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot) {
        source = util.relative(this._sourceRoot, source);
      }
      if (aSourceContent !== null) {
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else {
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };
    SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
      if (!aSourceFile) {
        aSourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      if (sourceRoot) {
        aSourceFile = util.relative(sourceRoot, aSourceFile);
      }
      var newSources = new ArraySet();
      var newNames = new ArraySet();
      this._mappings.forEach(function(mapping) {
        if (mapping.source === aSourceFile && mapping.originalLine) {
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source !== null) {
            if (sourceRoot) {
              mapping.source = util.relative(sourceRoot, original.source);
            } else {
              mapping.source = original.source;
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name !== null && mapping.name !== null) {
              mapping.name = original.name;
            }
          }
        }
        var source = mapping.source;
        if (source && !newSources.has(source)) {
          newSources.add(source);
        }
        var name = mapping.name;
        if (name && !newNames.has(name)) {
          newNames.add(name);
        }
      }, this);
      this._sources = newSources;
      this._names = newNames;
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          if (sourceRoot) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };
    SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
      if (aGenerated && 'line'in aGenerated && 'column'in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
        return;
      } else if (aGenerated && 'line'in aGenerated && 'column'in aGenerated && aOriginal && 'line'in aOriginal && 'column'in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
        return;
      } else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          orginal: aOriginal,
          name: aName
        }));
      }
    };
    SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;
      this._mappings.sort(util.compareByGeneratedPositions);
      for (var i = 0,
          len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];
        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        } else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }
        result += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;
        if (mapping.source) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source) - previousSource);
          previousSource = this._sources.indexOf(mapping.source);
          result += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;
          result += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;
          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name) - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }
      return result;
    };
    SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function(source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key]: null;
      }, this);
    };
    SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        file: this._file,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._sourceRoot) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }
      return map;
    };
    SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };
    exports.SourceMapGenerator = SourceMapGenerator;
  });
  define = makeDefine(m, './source-map-consumer');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var util = require('./util');
    var binarySearch = require('./binary-search');
    var ArraySet = require('./array-set').ArraySet;
    var base64VLQ = require('./base64-vlq');
    function SourceMapConsumer(aSourceMap) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === 'string') {
        sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
      }
      var version = util.getArg(sourceMap, 'version');
      var sources = util.getArg(sourceMap, 'sources');
      var names = util.getArg(sourceMap, 'names');
      var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
      var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
      var mappings = util.getArg(sourceMap, 'mappings');
      var file = util.getArg(sourceMap, 'file', null);
      if (version !== this._version) {
        throw new Error('Unsupported version: ' + version);
      }
      this._names = ArraySet.fromArray(names, true);
      this._sources = ArraySet.fromArray(sources, true);
      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this.file = file;
      this._generatedMappings = [];
      this._originalMappings = [];
      this._parseMappings(mappings, sourceRoot);
    }
    SourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);
      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
      smc.file = aSourceMap._file;
      smc._generatedMappings = aSourceMap._mappings.slice().sort(util.compareByGeneratedPositions);
      smc._originalMappings = aSourceMap._mappings.slice().sort(util.compareByOriginalPositions);
      return smc;
    };
    SourceMapConsumer.prototype._version = 3;
    Object.defineProperty(SourceMapConsumer.prototype, 'sources', {get: function() {
        return this._sources.toArray().map(function(s) {
          return this.sourceRoot ? util.join(this.sourceRoot, s): s;
        }, this);
      }});
    SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;
      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        } else if (str.charAt(0) === ',') {
          str = str.slice(1);
        } else {
          mapping = {};
          mapping.generatedLine = generatedLine;
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;
          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            temp = base64VLQ.decode(str);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;
            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }
          this._generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this._originalMappings.push(mapping);
          }
        }
      }
      this._originalMappings.sort(util.compareByOriginalPositions);
    };
    SourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator) {
      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got ' + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got ' + aNeedle[aColumnName]);
      }
      return binarySearch.search(aNeedle, aMappings, aComparator);
    };
    SourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };
      var mapping = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositions);
      if (mapping) {
        var source = util.getArg(mapping, 'source', null);
        if (source && this.sourceRoot) {
          source = util.join(this.sourceRoot, source);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };
    SourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }
      if (this.sourceRoot) {
        aSource = util.relative(this.sourceRoot, aSource);
      }
      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }
      var url;
      if (this.sourceRoot && (url = util.urlParse(this.sourceRoot))) {
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
        }
        if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };
    SourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };
      if (this.sourceRoot) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }
      var mapping = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions);
      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }
      return {
        line: null,
        column: null
      };
    };
    SourceMapConsumer.GENERATED_ORDER = 1;
    SourceMapConsumer.ORIGINAL_ORDER = 2;
    SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
      var mappings;
      switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error("Unknown order of iteration.");
      }
      var sourceRoot = this.sourceRoot;
      mappings.map(function(mapping) {
        var source = mapping.source;
        if (source && sourceRoot) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };
    exports.SourceMapConsumer = SourceMapConsumer;
  });
  define = makeDefine(m, './source-node');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
    var util = require('./util');
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
      this.children = [];
      this.sourceContents = {};
      this.line = aLine === undefined ? null: aLine;
      this.column = aColumn === undefined ? null: aColumn;
      this.source = aSource === undefined ? null: aSource;
      this.name = aName === undefined ? null: aName;
      if (aChunks != null) this.add(aChunks);
    }
    SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
      var node = new SourceNode();
      var remainingLines = aGeneratedCode.split('\n');
      var lastGeneratedLine = 1,
          lastGeneratedColumn = 0;
      var lastMapping = null;
      aSourceMapConsumer.eachMapping(function(mapping) {
        if (lastMapping === null) {
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(remainingLines.shift() + "\n");
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[0];
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
        } else {
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            do {
              code += remainingLines.shift() + "\n";
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } while (lastGeneratedLine < mapping.generatedLine);
            if (lastGeneratedColumn < mapping.generatedColumn) {
              var nextLine = remainingLines[0];
              code += nextLine.substr(0, mapping.generatedColumn);
              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            addMappingWithCode(lastMapping, code);
          } else {
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
          }
        }
        lastMapping = mapping;
      }, this);
      addMappingWithCode(lastMapping, remainingLines.join("\n"));
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          node.setSourceContent(sourceFile, content);
        }
      });
      return node;
      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, mapping.source, code, mapping.name));
        }
      }
    };
    SourceNode.prototype.add = function SourceNode_add(aChunk) {
      if (Array.isArray(aChunk)) {
        aChunk.forEach(function(chunk) {
          this.add(chunk);
        }, this);
      } else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
        if (aChunk) {
          this.children.push(aChunk);
        }
      } else {
        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
      }
      return this;
    };
    SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
      if (Array.isArray(aChunk)) {
        for (var i = aChunk.length - 1; i >= 0; i--) {
          this.prepend(aChunk[i]);
        }
      } else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
        this.children.unshift(aChunk);
      } else {
        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
      }
      return this;
    };
    SourceNode.prototype.walk = function SourceNode_walk(aFn) {
      var chunk;
      for (var i = 0,
          len = this.children.length; i < len; i++) {
        chunk = this.children[i];
        if (chunk instanceof SourceNode) {
          chunk.walk(aFn);
        } else {
          if (chunk !== '') {
            aFn(chunk, {
              source: this.source,
              line: this.line,
              column: this.column,
              name: this.name
            });
          }
        }
      }
    };
    SourceNode.prototype.join = function SourceNode_join(aSep) {
      var newChildren;
      var i;
      var len = this.children.length;
      if (len > 0) {
        newChildren = [];
        for (i = 0; i < len - 1; i++) {
          newChildren.push(this.children[i]);
          newChildren.push(aSep);
        }
        newChildren.push(this.children[i]);
        this.children = newChildren;
      }
      return this;
    };
    SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
      var lastChild = this.children[this.children.length - 1];
      if (lastChild instanceof SourceNode) {
        lastChild.replaceRight(aPattern, aReplacement);
      } else if (typeof lastChild === 'string') {
        this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
      } else {
        this.children.push(''.replace(aPattern, aReplacement));
      }
      return this;
    };
    SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };
    SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
      for (var i = 0,
          len = this.children.length; i < len; i++) {
        if (this.children[i]instanceof SourceNode) {
          this.children[i].walkSourceContents(aFn);
        }
      }
      var sources = Object.keys(this.sourceContents);
      for (var i = 0,
          len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };
    SourceNode.prototype.toString = function SourceNode_toString() {
      var str = "";
      this.walk(function(chunk) {
        str += chunk;
      });
      return str;
    };
    SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
      var generated = {
        code: "",
        line: 1,
        column: 0
      };
      var map = new SourceMapGenerator(aArgs);
      var sourceMappingActive = false;
      var lastOriginalSource = null;
      var lastOriginalLine = null;
      var lastOriginalColumn = null;
      var lastOriginalName = null;
      this.walk(function(chunk, original) {
        generated.code += chunk;
        if (original.source !== null && original.line !== null && original.column !== null) {
          if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
          lastOriginalSource = original.source;
          lastOriginalLine = original.line;
          lastOriginalColumn = original.column;
          lastOriginalName = original.name;
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({generated: {
              line: generated.line,
              column: generated.column
            }});
          lastOriginalSource = null;
          sourceMappingActive = false;
        }
        chunk.split('').forEach(function(ch) {
          if (ch === '\n') {
            generated.line++;
            generated.column = 0;
          } else {
            generated.column++;
          }
        });
      });
      this.walkSourceContents(function(sourceFile, sourceContent) {
        map.setSourceContent(sourceFile, sourceContent);
      });
      return {
        code: generated.code,
        map: map
      };
    };
    exports.SourceNode = SourceNode;
  });
  var SourceMapGenerator = m['./source-map-generator'].SourceMapGenerator;
  var SourceMapConsumer = m['./source-map-consumer'].SourceMapConsumer;
  var SourceNode = m['./source-node'].SourceNode;
  return {
    get SourceMapGenerator() {
      return SourceMapGenerator;
    },
    get SourceMapConsumer() {
      return SourceMapConsumer;
    },
    get SourceNode() {
      return SourceNode;
    }
  };
});
System.registerModule("traceur@0.0.Y/src/util/TestErrorReporter", function() {
  "use strict";
  var ErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ErrorReporter").ErrorReporter;
  var TestErrorReporter = function() {
    this.errors = [];
  };
  TestErrorReporter = ($traceurRuntime.createClass)(TestErrorReporter, {
    reportMessageInternal: function(location, format, args) {
      this.errors.push(ErrorReporter.format(location, format, args));
    },
    hasMatchingError: function(expected) {
      return this.errors.some((function(error) {
        return error.indexOf(expected) !== - 1;
      }));
    }
  }, {}, ErrorReporter);
  return {get TestErrorReporter() {
      return TestErrorReporter;
    }};
});
System.registerModule("traceur@0.0.Y/src/traceur", function() {
  "use strict";
  var $___46__47_options__ = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/options");
  var $___46__47_WebPageTranscoder__ = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/WebPageTranscoder");
  var ModuleAnalyzer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/semantics/ModuleAnalyzer").ModuleAnalyzer;
  var semantics = {ModuleAnalyzer: ModuleAnalyzer};
  var ErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/ErrorReporter").ErrorReporter;
  var SourcePosition = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/SourcePosition").SourcePosition;
  var TestErrorReporter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/TestErrorReporter").TestErrorReporter;
  var resolveUrl = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/util/url").resolveUrl;
  var util = {
    ErrorReporter: ErrorReporter,
    SourcePosition: SourcePosition,
    TestErrorReporter: TestErrorReporter,
    resolveUrl: resolveUrl
  };
  var IdentifierToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/IdentifierToken").IdentifierToken;
  var LiteralToken = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/LiteralToken").LiteralToken;
  var Parser = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Parser").Parser;
  var Scanner = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Scanner").Scanner;
  var SourceFile = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/SourceFile").SourceFile;
  var Token = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/syntax/Token").Token;
  var TokenType = System.get("traceur@0.0.Y/src/syntax/TokenType");
  var trees = System.get("traceur@0.0.Y/src/syntax/trees/ParseTrees");
  var syntax = {
    IdentifierToken: IdentifierToken,
    LiteralToken: LiteralToken,
    Parser: Parser,
    Scanner: Scanner,
    SourceFile: SourceFile,
    Token: Token,
    TokenType: TokenType,
    trees: trees
  };
  var ParseTreeMapWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/ParseTreeMapWriter").ParseTreeMapWriter;
  var ParseTreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/ParseTreeWriter").ParseTreeWriter;
  var SourceMapConsumer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/SourceMapIntegration").SourceMapConsumer;
  var SourceMapGenerator = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/SourceMapIntegration").SourceMapGenerator;
  var TreeWriter = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/outputgeneration/TreeWriter").TreeWriter;
  var outputgeneration = {
    ParseTreeMapWriter: ParseTreeMapWriter,
    ParseTreeWriter: ParseTreeWriter,
    SourceMapConsumer: SourceMapConsumer,
    SourceMapGenerator: SourceMapGenerator,
    TreeWriter: TreeWriter
  };
  var AmdTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/AmdTransformer").AmdTransformer;
  var CloneTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/CloneTreeTransformer").CloneTreeTransformer;
  var CommonJsModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/CommonJsModuleTransformer").CommonJsModuleTransformer;
  var FromOptionsTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/FromOptionsTransformer").FromOptionsTransformer;
  var ModuleSpecifierVisitor = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/module/ModuleSpecifierVisitor").ModuleSpecifierVisitor;
  var ModuleTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ModuleTransformer").ModuleTransformer;
  var ParseTreeTransformer = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/codegeneration/ParseTreeTransformer").ParseTreeTransformer;
  var ParseTreeFactory = System.get("traceur@0.0.Y/src/codegeneration/ParseTreeFactory");
  var codegeneration = {
    AmdTransformer: AmdTransformer,
    CloneTreeTransformer: CloneTreeTransformer,
    CommonJsModuleTransformer: CommonJsModuleTransformer,
    FromOptionsTransformer: FromOptionsTransformer,
    ModuleTransformer: ModuleTransformer,
    ParseTreeFactory: ParseTreeFactory,
    ParseTreeTransformer: ParseTreeTransformer,
    module: {ModuleSpecifierVisitor: ModuleSpecifierVisitor}
  };
  var modules = System.get("traceur@0.0.Y/src/runtime/Loader");
  ;
  var InterceptOutputLoaderHooks = $traceurRuntime.getModuleImpl("traceur@0.0.Y/src/runtime/InterceptOutputLoaderHooks").InterceptOutputLoaderHooks;
  var runtime = {InterceptOutputLoaderHooks: InterceptOutputLoaderHooks};
  return {
    get options() {
      return $___46__47_options__.options;
    },
    get WebPageTranscoder() {
      return $___46__47_WebPageTranscoder__.WebPageTranscoder;
    },
    get semantics() {
      return semantics;
    },
    get util() {
      return util;
    },
    get syntax() {
      return syntax;
    },
    get outputgeneration() {
      return outputgeneration;
    },
    get codegeneration() {
      return codegeneration;
    },
    get modules() {
      return modules;
    },
    get runtime() {
      return runtime;
    }
  };
});
var traceur = System.get("traceur@0.0.Y/src/traceur");
