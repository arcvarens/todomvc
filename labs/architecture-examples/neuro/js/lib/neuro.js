(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["Neuro"] = require("0");
})({
    "0": function(require, module, exports, global) {
        var Neuro = require("1");
        Neuro.Model = require("2").Model;
        Neuro.Collection = require("b").Collection;
        Neuro.View = require("d").View;
        Neuro.Is = require("4").Is;
        Neuro.Mixins = {
            Butler: require("8").Butler,
            Connector: require("6").Connector,
            Silence: require("5").Silence,
            Snitch: require("f").Snitch
        };
        exports = module.exports = Neuro;
    },
    "1": function(require, module, exports, global) {
        var Neuro = {
            version: "0.2.3"
        };
        exports = module.exports = Neuro;
    },
    "2": function(require, module, exports, global) {
        var Model = require("3").Model, Butler = require("8").Butler, Snitch = require("a").Snitch, signalFactory = require("9");
        var curryGetter = function(type) {
            return function(prop) {
                var accessor = this.getAccessor(prop, type), accessorName = this._accessorName;
                if (accessor && accessorName != prop) {
                    return accessor();
                }
                return this.parent(prop);
            }.overloadGetter();
        };
        Model.implement(new Butler);
        Model.implement(new Snitch);
        Model.implement(signalFactory([ "error" ], {
            signalErrorProperty: function(prop, val) {
                !this.isSilent() && this.fireEvent("error:" + prop, [ this, prop, val ]);
            }
        }));
        exports.Model = new Class({
            Extends: Model,
            _errored: false,
            _erroredProperties: {},
            setup: function(data, options) {
                this.setupAccessors();
                this.setupValidators();
                this.parent(data, options);
                return this;
            },
            __set: function(prop, val) {
                var accessor = this.getAccessor(prop, "set");
                if (accessor && this._accessorName != prop) {
                    return accessor.apply(this, arguments);
                }
                if (!this.validate(prop, val)) {
                    this._errored = true;
                    this._erroredProperties[prop] = val;
                    return this;
                }
                return this.parent(prop, val);
            }.overloadSetter(),
            set: function(prop, val) {
                this.parent(prop, val);
                if (!this.isSetting() && this._errored) {
                    this._onErrorProperty(this._erroredProperties);
                    this.signalError();
                    this._resetErrored();
                }
                return this;
            },
            get: curryGetter("get"),
            getPrevious: curryGetter("getPrevious"),
            _resetErrored: function() {
                if (this._errored) {
                    this._errored = false;
                    this._erroredProperties = {};
                }
                return this;
            },
            _onErrorProperty: function(prop, val) {
                this.signalErrorProperty(prop, val);
                return this;
            }.overloadSetter(),
            setAccessor: function(name, val) {
                if (name && val) {
                    if (val.get && !val.getPrevious) {
                        val.getPrevious = val.get;
                    }
                    this.parent(name, val);
                }
                return this;
            }.overloadSetter(),
            proof: function() {
                return this.parent(this.getData());
            }
        });
    },
    "3": function(require, module, exports, global) {
        var Is = require("4").Is, Silence = require("5").Silence, Connector = require("6").Connector, Butler = require("8").Butler, signalFactory = require("9");
        var cloneVal = function(val) {
            switch (typeOf(val)) {
              case "array":
                val = val.slice();
                break;
              case "object":
                if (!val.$constructor || val.$constructor && !instanceOf(val.$constructor, Class)) {
                    val = Object.clone(val);
                }
                break;
            }
            return val;
        };
        var curryGetter = function(type) {
            return function(prop) {
                return this[type][prop];
            }.overloadGetter();
        };
        var curryGetData = function(type) {
            return function() {
                var props = this.keys(), obj = {};
                props.each(function(prop) {
                    obj[prop] = cloneVal(this[type](prop));
                }.bind(this));
                return obj;
            };
        };
        var Model = new Class({
            Implements: [ Connector, Butler, Events, Options, Silence ],
            primaryKey: undefined,
            _data: {},
            _changed: false,
            _changedProperties: {},
            _previousData: {},
            _setting: 0,
            options: {
                primaryKey: undefined,
                defaults: {}
            },
            initialize: function(data, options) {
                if (instanceOf(data, this.constructor)) {
                    return data;
                }
                this.setOptions(options);
                this.setup(data, options);
            },
            setup: function(data, options) {
                this.primaryKey = this.options.primaryKey;
                this.silence(function() {
                    this.set(this.options.defaults);
                }.bind(this));
                if (data) {
                    this.set(data);
                }
                return this;
            },
            __set: function(prop, val) {
                var old = this.get(prop);
                if (!Is.Equal(old, val)) {
                    this._changed = true;
                    this._data[prop] = this._changedProperties[prop] = cloneVal(val);
                }
                return this;
            }.overloadSetter(),
            _set: function(prop, val) {
                this._setting++;
                this.__set(prop, val);
                this._setting--;
                return this;
            },
            set: function(prop, val) {
                var isSetting;
                if (prop) {
                    isSetting = this.isSetting();
                    !isSetting && this._setPrevious(this.getData());
                    prop = instanceOf(prop, Model) ? prop.getData() : prop;
                    this._set(prop, val);
                    if (!isSetting && this._changed) {
                        this._onChangeProperty(this._changedProperties);
                        this.signalChange();
                        this._resetChanged();
                    }
                }
                return this;
            },
            isSetting: function() {
                return !!this._setting;
            },
            unset: function(prop) {
                var props = {}, len, i = 0, item;
                prop = Array.from(prop);
                len = prop.length;
                while (len--) {
                    props[prop[i++]] = void 0;
                }
                this.set(props);
                return this;
            },
            reset: function(prop) {
                var props = {}, defaults = this.options.defaults, len, i = 0, item;
                if (prop) {
                    prop = Array.from(prop);
                    len = prop.length;
                    while (len--) {
                        item = prop[i++];
                        props[item] = defaults[item];
                    }
                } else {
                    props = defaults;
                }
                this.set(props);
                this.signalReset();
                return this;
            },
            get: curryGetter("_data"),
            getData: curryGetData("get"),
            _setPrevious: function(prop, val) {
                this._previousData[prop] = val;
                return this;
            }.overloadSetter(),
            getPrevious: curryGetter("_previousData"),
            getPreviousData: curryGetData("getPrevious"),
            _resetChanged: function() {
                if (this._changed) {
                    this._changed = false;
                    this._changedProperties = {};
                }
                return this;
            },
            _onChangeProperty: function(prop, val) {
                if (this._changed) {
                    this.signalChangeProperty(prop, val, this.getPrevious(prop));
                }
                return this;
            }.overloadSetter(),
            destroy: function() {
                this.signalDestroy();
                return this;
            },
            toJSON: function() {
                return this.getData();
            },
            spy: function(prop, callback) {
                if (Type.isString(prop) && prop in this._data && Type.isFunction(callback)) {
                    this.addEvent("change:" + prop, callback);
                }
                return this;
            }.overloadSetter(),
            unspy: function(prop, callback) {
                if (Type.isString(prop) && prop in this._data) {
                    this.removeEvents("change:" + prop, callback);
                }
                return this;
            }.overloadSetter()
        });
        Model.implement(signalFactory([ "change", "destroy", "reset" ], {
            signalChangeProperty: function(prop, newVal, oldVal) {
                !this.isSilent() && this.fireEvent("change:" + prop, [ this, prop, newVal, oldVal ]);
                return this;
            }
        }));
        [ "each", "subset", "map", "filter", "every", "some", "keys", "values", "getLength", "keyOf", "contains", "toQueryString" ].each(function(method) {
            Model.implement(method, function() {
                return Object[method].apply(Object, [ this._data ].append(Array.from(arguments)));
            });
        });
        exports.Model = Model;
    },
    "4": function(require, module, exports, global) {
        (function(context) {
            var toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, oldType = window.Type, Is = context.Is = {};
            var Type = window.Type = function(name, object) {
                var obj = new oldType(name, object), str;
                if (!obj) {
                    return obj;
                }
                str = "is" + name, Is[name] = Is.not[name] = Type[str] = oldType[str];
                return obj;
            }.extend(oldType);
            Type.prototype = oldType.prototype;
            for (var i in oldType) {
                if (Type.hasOwnProperty(i) && i.test("is")) {
                    i = i.replace("is", "");
                    Is[i] = Type["is" + i];
                }
            }
            Is["NaN"] = function(a) {
                return a !== a;
            };
            Is["Null"] = function(a) {
                return a === null;
            };
            Is["Undefined"] = function(a) {
                return a === void 0;
            };
            var matchMap = {
                string: function(a, b) {
                    return a == String(b);
                },
                number: function(a, b) {
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                },
                date: function(a, b) {
                    return +a == +b;
                },
                "boolean": function(a, b) {
                    return this.date(a, b);
                },
                regexp: function(a, b) {
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
            };
            var has = function(obj, key) {
                return obj.hasOwnProperty(key);
            };
            var eq = function(a, b, stack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a.isEqual && Is.Function(a.isEqual)) return a.isEqual(b);
                if (b.isEqual && Is.Function(b.isEqual)) return b.isEqual(a);
                var typeA = typeOf(a), typeB = typeOf(b);
                if (typeA != typeB) {
                    return false;
                }
                if (matchMap[typeA]) {
                    return matchMap[typeA](a, b);
                }
                if (typeA != "object" || typeB != "object") return false;
                var length = stack.length;
                while (length--) {
                    if (stack[length] == a) return true;
                }
                stack.push(a);
                var size = 0, result = true;
                if (typeA == "array") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                        }
                    }
                } else {
                    if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return false;
                    for (var key in a) {
                        if (has(a, key)) {
                            size++;
                            if (!(result = has(b, key) && eq(a[key], b[key], stack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                stack.pop();
                return result;
            };
            Is.Equal = function(a, b) {
                return eq(a, b, []);
            };
            (function(obj) {
                var not = {};
                for (var key in obj) {
                    if (has(obj, key)) {
                        not[key] = function(name) {
                            return function(a, b) {
                                return !obj[name].call(obj, a, b);
                            };
                        }(key);
                    }
                }
                obj.not = not;
            })(Is);
        })(typeof exports != "undefined" ? exports : window);
    },
    "5": function(require, module, exports, global) {
        var Silence = new Class({
            _silent: 0,
            silence: function(fnc) {
                this._silent++;
                fnc && fnc.call(this);
                this._silent--;
                return this;
            },
            isSilent: function() {
                return !!this._silent;
            }
        });
        exports.Silence = Silence;
    },
    "6": function(require, module, exports, global) {
        require("7");
        var processFn = function(type, evt, fn, obj) {
            if (type == "string") {
                fn = obj && obj[fn] ? obj.bound(fn) : undefined;
            }
            return fn;
        };
        var mapSubEvents = function(obj, baseEvt) {
            var map = {};
            Object.each(obj, function(val, key) {
                key = key == "*" ? baseEvt : baseEvt + ":" + key;
                map[key] = val;
            });
            return map;
        };
        var process = function(methodStr, map, obj) {
            Object.each(map, function(methods, evt) {
                methods = Array.from(methods);
                methods.each(function(method) {
                    var type = typeOf(method);
                    switch (type) {
                      case "object":
                        if (!instanceOf(method, Class)) {
                            process.call(this, methodStr, mapSubEvents(method, evt), obj);
                        }
                        break;
                      case "string":
                      case "function":
                        method = processFn.call(this, type, evt, method, obj);
                        method && this[methodStr](evt, method);
                        break;
                    }
                }, this);
            }, this);
        };
        var curryConnection = function(str) {
            var methodStr = str == "connect" ? "addEvent" : "removeEvent";
            return function(obj, key, twoWay) {
                var map = this.options.connector;
                if (Type.isBoolean(key)) {
                    twoWay = key;
                    key = undefined;
                }
                if (key) {
                    map = map[key];
                }
                process.call(this, methodStr, map, obj);
                twoWay && obj && obj[str](this, key, false);
                return this;
            };
        };
        var Connector = new Class({
            Implements: [ Class.Binds ],
            options: {
                connector: {}
            },
            connect: curryConnection("connect"),
            disconnect: curryConnection("disconnect")
        });
        exports.Connector = Connector;
    },
    "7": function(require, module, exports, global) {
        Class.Binds = new Class({
            $bound: {},
            bound: function(name) {
                return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
            }
        });
    },
    "8": function(require, module, exports, global) {
        var Butler = new Class({
            _accessors: {},
            _accessorName: undefined,
            options: {
                accessors: {}
            },
            setupAccessors: function() {
                var accessors = this._accessors;
                this._accessors = {};
                this.setAccessor(Object.merge({}, accessors, this.options.accessors));
                return this;
            },
            isAccessing: function() {
                return !!this._accessorName;
            },
            _processAccess: function(name, fnc) {
                var value;
                if (name) {
                    this._accessorName = name;
                    value = fnc();
                    this._accessorName = void 0;
                }
                return value;
            },
            setAccessor: function(name, obj) {
                var accessors = {};
                if (!!name && Type.isObject(obj)) {
                    Object.each(obj, function(fnc, type) {
                        var orig = fnc;
                        if (!fnc._orig) {
                            fnc = function() {
                                return this._processAccess(name, orig.pass(arguments, this));
                            }.bind(this);
                            fnc._orig = orig;
                        }
                        accessors[type] = fnc;
                    }, this);
                    this._accessors[name] = accessors;
                }
                return this;
            }.overloadSetter(),
            getAccessor: function(name, type) {
                var accessors = this._accessors[name];
                if (type) {
                    return accessors && accessors[type];
                }
                return accessors;
            },
            unsetAccessor: function(name, type) {
                if (name) {
                    if (type) {
                        this._accessors[name][type] = void 0;
                    } else {
                        this._accessors[name] = void 0;
                    }
                }
                return this;
            }
        });
        exports.Butler = Butler;
    },
    "9": function(require, module, exports, global) {
        var prefix = "signal", hyphen = "-", colon = ":";
        exports = module.exports = function(names, curryFnc, stack) {
            if (!Type.isFunction(curryFnc)) {
                stack = curryFnc;
                curryFnc = undefined;
            }
            stack = stack || {};
            Array.from(names).each(function(name) {
                var property = (prefix + hyphen + name.replace(colon, hyphen)).camelCase();
                stack[property] = curryFnc ? curryFnc(name) : function() {
                    Array.prototype.unshift.call(arguments, this);
                    !this.isSilent() && this.fireEvent(name, arguments);
                    return this;
                };
            });
            return stack;
        };
    },
    a: function(require, module, exports, global) {
        var Snitch = new Class({
            _validators: {},
            options: {
                validators: {}
            },
            setupValidators: function() {
                var validators = this._validators;
                this._validators = {};
                this.setValidator(Object.merge({}, validators, this.options.validators));
                return this;
            },
            setValidator: function(prop, fnc) {
                var orig = fnc;
                if (!fnc._orig) {
                    fnc = fnc.bind(this);
                    fnc._orig = orig;
                }
                this._validators[prop] = fnc;
                return this;
            }.overloadSetter(),
            getValidator: function(prop) {
                return this._validators[prop];
            }.overloadGetter(),
            validate: function(prop, val) {
                var validator = this.getValidator(prop), pass = true;
                if (validator) {
                    pass = validator(val);
                }
                return pass;
            },
            proof: function(obj) {
                return Snitch.proof(obj, this._validators, this);
            }
        });
        Snitch.proof = function(obj, validators) {
            return Object.every(validators, function(fnc, prop) {
                return prop in obj && fnc(obj[prop]);
            });
        };
        exports.Snitch = Snitch;
    },
    b: function(require, module, exports, global) {
        var Collection = require("c").Collection, Model = require("2").Model, Snitch = require("a").Snitch;
        var validateFnc = function(val, prop) {
            return this.parent(prop, val);
        };
        Collection.implement(new Snitch);
        exports.Collection = new Class({
            Extends: Collection,
            setup: function(models, options) {
                this.setupValidators();
                this.parent(models, options);
                return this;
            },
            _add: function(model, at) {
                if (!this.validate(instanceOf(model, Model) ? model.getData() : model)) {
                    this.signalError(model, at);
                } else {
                    this.parent(model, at);
                }
                return this;
            },
            validate: function(models) {
                models = Array.from(models);
                return models.every(function(model) {
                    return instanceOf(model, Model) ? model.every(validateFnc, this) : Object.every(model, validateFnc, this);
                }, this);
            },
            proofModel: function(models) {
                models = Array.from(models);
                return models.every(function(model) {
                    return Snitch.proof(instanceOf(model, Model) ? model.getData() : model, this._validators, this);
                }, this);
            },
            proof: function() {
                return this.proofModel(this._models);
            },
            signalError: function(model, at) {
                !this.isSilent() && this.fireEvent("error", [ this, model, at ]);
            }
        });
    },
    c: function(require, module, exports, global) {
        var Model = require("2").Model, Silence = require("5").Silence, Connector = require("6").Connector, signalFactory = require("9");
        var Collection = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            _models: [],
            _Model: Model,
            _active: 0,
            _changed: false,
            length: 0,
            primaryKey: undefined,
            options: {
                primaryKey: undefined,
                Model: undefined,
                modelOptions: undefined
            },
            initialize: function(models, options) {
                this.setOptions(options);
                this.setup(models, options);
            },
            setup: function(models, options) {
                this.primaryKey = this.options.primaryKey;
                if (this.options.Model) {
                    this._Model = this.options.Model;
                }
                if (models) {
                    this.add(models);
                }
                return this;
            },
            hasModel: function(model) {
                var pk = this.primaryKey, has, modelId;
                has = this._models.contains(model);
                if (pk && !has) {
                    modelId = instanceOf(model, Model) ? model.get(pk) : model[pk];
                    has = this.some(function(item) {
                        return modelId === item.get(pk);
                    });
                }
                return !!has;
            },
            resetChange: function() {
                this._changed = false;
            },
            attachModelEvents: function(model) {
                model.addEvents({
                    destroy: this.bound("remove"),
                    change: this.bound("signalChangeModel")
                });
                return this;
            },
            detachModelEvents: function(model) {
                model.removeEvents({
                    destroy: this.bound("remove"),
                    change: this.bound("signalChangeModel")
                });
                return this;
            },
            act: function(fnc) {
                this._active++;
                fnc.call(this);
                this._active--;
                return this;
            },
            isActive: function() {
                return !!this._active;
            },
            _add: function(model, at) {
                model = new this._Model(model, this.options.modelOptions);
                if (!this.hasModel(model)) {
                    this.attachModelEvents(model);
                    at = this.length == 0 ? void 0 : at;
                    if (at != void 0) {
                        this._models.splice(at, 0, model);
                    } else {
                        this._models.push(model);
                    }
                    this.length = this._models.length;
                    this._changed = true;
                    this.signalAdd(model, at != void 0 ? at : this.length - 1);
                }
                return this;
            },
            add: function(models, at) {
                var currentLen = this.length;
                models = Array.from(models);
                this.act(function() {
                    var len = models.length, i = 0;
                    while (len--) {
                        this._add(models[i++], at);
                    }
                });
                if (!this.isActive() && this._changed) {
                    this.signalChange();
                    this.resetChange();
                }
                return this;
            },
            get: function(index) {
                var len = arguments.length, i = 0, results;
                if (len > 1) {
                    results = [];
                    while (len--) {
                        results.push(this.get(arguments[i++]));
                    }
                    return results;
                }
                return this._models[index];
            },
            _remove: function(model) {
                if (this.hasModel(model)) {
                    this.detachModelEvents(model);
                    this._models.erase(model);
                    this.length = this._models.length;
                    this._changed = true;
                    this.signalRemove(model);
                }
                return this;
            },
            remove: function(models) {
                var currentLen = this.length;
                models = Array.from(models).slice();
                this.act(function() {
                    var l = models.length, i = 0;
                    while (l--) {
                        this._remove(models[i++]);
                    }
                });
                if (!this.isActive() && this._changed) {
                    this.signalChange();
                    this.resetChange();
                }
                return this;
            },
            replace: function(oldModel, newModel) {
                var index;
                if (oldModel && newModel && this.hasModel(oldModel) && !this.hasModel(newModel)) {
                    index = this.indexOf(oldModel);
                    if (index > -1) {
                        this.act(function() {
                            this.add(newModel, index);
                            this.remove(oldModel);
                        });
                        !this.isActive() && this.signalChange() && this.resetChange();
                    }
                }
                return this;
            },
            sort: function(fnc) {
                this._models.sort(fnc);
                this.signalSort();
                return this;
            },
            reverse: function() {
                this._models.reverse();
                this.signalSort();
                return this;
            },
            empty: function() {
                this.remove(this._models);
                this.signalEmpty();
                return this;
            },
            toJSON: function() {
                return this.map(function(model) {
                    return model.toJSON();
                });
            }
        });
        Collection.implement(signalFactory([ "empty", "sort", "change", "add", "remove", "change:model" ]));
        [ "forEach", "each", "invoke", "every", "filter", "clean", "indexOf", "map", "some", "associate", "link", "contains", "getLast", "getRandom", "flatten", "pick" ].each(function(method) {
            Collection.implement(method, function() {
                return Array.prototype[method].apply(this._models, arguments);
            });
        });
        exports.Collection = Collection;
    },
    d: function(require, module, exports, global) {
        var View = require("e").View;
        exports.View = View;
    },
    e: function(require, module, exports, global) {
        var Connector = require("6").Connector, Silence = require("5").Silence, signalFactory = require("9");
        var eventHandler = function(handler) {
            return function() {
                var events = this.options.events, element = this.element;
                if (element && events) {
                    Object.each(events, function(val, key) {
                        var methods = Array.from(val), len = methods.length, i = 0, method;
                        while (len--) {
                            method = methods[i++];
                            this.element[handler](key, typeOf(method) == "function" ? method : this.bound(method));
                        }
                    }, this);
                }
                return this;
            };
        };
        var View = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            options: {
                element: undefined,
                events: {}
            },
            initialize: function(options) {
                this.setOptions(options);
                this.setup(options);
                this.signalReady();
            },
            setup: function(options) {
                if (this.options.element) {
                    this.setElement(this.options.element);
                }
                return this;
            },
            toElement: function() {
                return this.element;
            },
            setElement: function(element) {
                if (element) {
                    this.element && this.destroy();
                    element = this.element = document.id(element);
                    if (element) {
                        this.attachEvents();
                    }
                }
                return this;
            },
            attachEvents: eventHandler("addEvent"),
            detachEvents: eventHandler("removeEvent"),
            create: function() {
                return this;
            },
            render: function(data) {
                this.signalRender.apply(this, arguments);
                return this;
            },
            inject: function(reference, where) {
                if (this.element) {
                    reference = document.id(reference);
                    where = where || "bottom";
                    this.element.inject(reference, where);
                    this.signalInject(reference, where);
                }
                return this;
            },
            dispose: function() {
                if (this.element) {
                    this.element.dispose();
                    this.signalDispose();
                }
                return this;
            },
            destroy: function() {
                var element = this.element;
                if (element) {
                    element && (this.detachEvents(), element.destroy(), this.element = undefined);
                    this.signalDestroy();
                }
                return this;
            }
        });
        View.implement(signalFactory([ "ready", "render", "dispose", "destroy", "inject" ]));
        exports.View = View;
    },
    f: function(require, module, exports, global) {
        var Snitch = new Class({
            _validators: {},
            options: {
                validators: {}
            },
            setupValidators: function() {
                var validators = this._validators;
                this._validators = {};
                this.setValidator(Object.merge({}, validators, this.options.validators));
                return this;
            },
            setValidator: function(prop, fnc) {
                var orig = fnc;
                if (!fnc._orig) {
                    fnc = fnc.bind(this);
                    fnc._orig = orig;
                }
                this._validators[prop] = fnc;
                return this;
            }.overloadSetter(),
            getValidator: function(prop) {
                return this._validators[prop];
            }.overloadGetter(),
            validate: function(prop, val) {
                var validator = this.getValidator(prop), pass = true;
                if (validator) {
                    pass = validator(val);
                }
                return pass;
            },
            proof: function(obj) {
                return Snitch.proof(obj, this._validators, this);
            }
        });
        Snitch.proof = function(obj, validators) {
            return Object.every(validators, function(fnc, prop) {
                return prop in obj && fnc(obj[prop]);
            });
        };
        exports.Snitch = Snitch;
    }
});