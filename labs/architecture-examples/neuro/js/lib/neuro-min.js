(function(a){var b={},c=function(d){var e=b[d];if(!e){e=b[d]={};var f=e.exports={};a[d].call(f,c,e,f,window)}return e.exports};window.Neuro=c("0")})({0:function(a,b,c,d){var e=a("1");e.Model=a("2").Model,e.Collection=a("b").Collection,e.View=a("d").View,e.Is=a("4").Is,e.Mixins={Butler:a("8").Butler,Connector:a("6").Connector,Silence:a("5").Silence,Snitch:a("f").Snitch},c=b.exports=e},1:function(a,b,c,d){var e={version:"0.2.2"};c=b.exports=e},2:function(a,b,c,d){var e=a("3").Model,f=a("8").Butler,g=a("a").Snitch,h=a("9"),i=function(a){return function(b){var c=this.getAccessor(b,a),d=this._accessorName;return c&&d!=b?c():this.parent(b)}.overloadGetter()};e.implement(new f),e.implement(new g),e.implement(h(["error"],{signalErrorProperty:function(a,b){!this.isSilent()&&this.fireEvent("error:"+a,[this,a,b])}})),c.Model=new Class({Extends:e,_errored:!1,_erroredProperties:{},setup:function(a,b){return this.setupAccessors(),this.setupValidators(),this.parent(a,b),this},__set:function(a,b){var c=this.getAccessor(a,"set");return c&&this._accessorName!=a?c.apply(this,arguments):this.validate(a,b)?this.parent(a,b):(this._errored=!0,this._erroredProperties[a]=b,this)}.overloadSetter(),set:function(a,b){return this.parent(a,b),!this.isSetting()&&this._errored&&(this._onErrorProperty(this._erroredProperties),this.signalError(),this._resetErrored()),this},get:i("get"),getPrevious:i("getPrevious"),_resetErrored:function(){return this._errored&&(this._errored=!1,this._erroredProperties={}),this},_onErrorProperty:function(a,b){return this.signalErrorProperty(a,b),this}.overloadSetter(),setAccessor:function(a,b){return a&&b&&(b.get&&!b.getPrevious&&(b.getPrevious=b.get),this.parent(a,b)),this}.overloadSetter(),proof:function(){return this.parent(this.getData())}})},3:function(a,b,c,d){var e=a("4").Is,f=a("5").Silence,g=a("6").Connector,h=a("8").Butler,i=a("9"),j=function(a){switch(typeOf(a)){case"array":a=a.slice();break;case"object":if(!a.$constructor||a.$constructor&&!instanceOf(a.$constructor,Class))a=Object.clone(a)}return a},k=function(a){return function(b){return this[a][b]}.overloadGetter()},l=function(a){return function(){var b=this.keys(),c={};return b.each(function(b){c[b]=j(this[a](b))}.bind(this)),c}},m=new Class({Implements:[g,h,Events,Options,f],primaryKey:undefined,_data:{},_changed:!1,_changedProperties:{},_previousData:{},_setting:0,options:{primaryKey:undefined,defaults:{}},initialize:function(a,b){if(instanceOf(a,this.constructor))return a;this.setOptions(b),this.setup(a,b)},setup:function(a,b){return this.primaryKey=this.options.primaryKey,this.silence(function(){this.set(this.options.defaults)}.bind(this)),a&&this.set(a),this},__set:function(a,b){var c=this.get(a);return e.Equal(c,b)||(this._changed=!0,this._data[a]=this._changedProperties[a]=j(b)),this}.overloadSetter(),_set:function(a,b){return this._setting++,this.__set(a,b),this._setting--,this},set:function(a,b){var c;return a&&(c=this.isSetting(),!c&&this._setPrevious(this.getData()),a=instanceOf(a,m)?a.getData():a,this._set(a,b),!c&&this._changed&&(this._onChangeProperty(this._changedProperties),this.signalChange(),this._resetChanged())),this},isSetting:function(){return!!this._setting},unset:function(a){var b={},c,d=0,e;a=Array.from(a),c=a.length;while(c--)b[a[d++]]=void 0;return this.set(b),this},reset:function(a){var b={},c=this.options.defaults,d,e=0,f;if(a){a=Array.from(a),d=a.length;while(d--)f=a[e++],b[f]=c[f]}else b=c;return this.set(b),this.signalReset(),this},get:k("_data"),getData:l("get"),_setPrevious:function(a,b){return this._previousData[a]=b,this}.overloadSetter(),getPrevious:k("_previousData"),getPreviousData:l("getPrevious"),_resetChanged:function(){return this._changed&&(this._changed=!1,this._changedProperties={}),this},_onChangeProperty:function(a,b){return this._changed&&this.signalChangeProperty(a,b,this.getPrevious(a)),this}.overloadSetter(),destroy:function(){return this.signalDestroy(),this},toJSON:function(){return this.getData()},spy:function(a,b){return Type.isString(a)&&a in this._data&&Type.isFunction(b)&&this.addEvent("change:"+a,b),this}.overloadSetter(),unspy:function(a,b){return Type.isString(a)&&a in this._data&&this.removeEvents("change:"+a,b),this}.overloadSetter()});m.implement(i(["change","destroy","reset"],{signalChangeProperty:function(a,b,c){return!this.isSilent()&&this.fireEvent("change:"+a,[this,a,b,c]),this}})),["each","subset","map","filter","every","some","keys","values","getLength","keyOf","contains","toQueryString"].each(function(a){m.implement(a,function(){return Object[a].apply(Object,[this._data].append(Array.from(arguments)))})}),c.Model=m},4:function(a,b,c,d){(function(a){var b=Object.prototype.toString,c=Object.prototype.hasOwnProperty,d=window.Type,e=a.Is={},f=window.Type=function(a,b){var c=new d(a,b),g;return c?(g="is"+a,e[a]=e.not[a]=f[g]=d[g],c):c}.extend(d);f.prototype=d.prototype;for(var g in d)f.hasOwnProperty(g)&&g.test("is")&&(g=g.replace("is",""),e[g]=f["is"+g]);e.NaN=function(a){return a!==a},e.Null=function(a){return a===null},e.Undefined=function(a){return a===void 0};var h={string:function(a,b){return a==String(b)},number:function(a,b){return a!=+a?b!=+b:a==0?1/a==1/b:a==+b},date:function(a,b){return+a==+b},"boolean":function(a,b){return this.date(a,b)},regexp:function(a,b){return a.source==b.source&&a.global==b.global&&a.multiline==b.multiline&&a.ignoreCase==b.ignoreCase}},i=function(a,b){return a.hasOwnProperty(b)},j=function(a,b,c){if(a===b)return a!==0||1/a==1/b;if(a==null||b==null)return a===b;if(a.isEqual&&e.Function(a.isEqual))return a.isEqual(b);if(b.isEqual&&e.Function(b.isEqual))return b.isEqual(a);var d=typeOf(a),f=typeOf(b);if(d!=f)return!1;if(h[d])return h[d](a,b);if(d!="object"||f!="object")return!1;var g=c.length;while(g--)if(c[g]==a)return!0;c.push(a);var k=0,l=!0;if(d=="array"){k=a.length,l=k==b.length;if(l)while(k--)if(!(l=k in a==k in b&&j(a[k],b[k],c)))break}else{if("constructor"in a!="constructor"in b||a.constructor!=b.constructor)return!1;for(var m in a)if(i(a,m)){k++;if(!(l=i(b,m)&&j(a[m],b[m],c)))break}if(l){for(m in b)if(i(b,m)&&!(k--))break;l=!k}}return c.pop(),l};e.Equal=function(a,b){return j(a,b,[])},function(a){var b={};for(var c in a)i(a,c)&&(b[c]=function(b){return function(c,d){return!a[b].call(a,c,d)}}(c));a.not=b}(e)})(typeof c!="undefined"?c:window)},5:function(a,b,c,d){var e=new Class({_silent:0,silence:function(a){return this._silent++,a&&a.call(this),this._silent--,this},isSilent:function(){return!!this._silent}});c.Silence=e},6:function(a,b,c,d){a("7");var e=function(a,b,c,d){return a=="string"&&(c=d&&d[c]?d.bound(c):undefined),c},f=function(a,b){var c={};return Object.each(a,function(a,d){d=d=="*"?b:b+":"+d,c[d]=a}),c},g=function(a,b,c){Object.each(b,function(b,d){b=Array.from(b),b.each(function(b){var h=typeOf(b);switch(h){case"object":instanceOf(b,Class)||g.call(this,a,f(b,d),c);break;case"string":case"function":b=e.call(this,h,d,b,c),b&&this[a](d,b)}},this)},this)},h=function(a){var b=a=="connect"?"addEvent":"removeEvent";return function(c,d,e){var f=this.options.connector;return Type.isBoolean(d)&&(e=d,d=undefined),d&&(f=f[d]),g.call(this,b,f,c),e&&c&&c[a](this,d,!1),this}},i=new Class({Implements:[Class.Binds],options:{connector:{}},connect:h("connect"),disconnect:h("disconnect")});c.Connector=i},7:function(a,b,c,d){Class.Binds=new Class({$bound:{},bound:function(a){return this.$bound[a]?this.$bound[a]:this.$bound[a]=this[a].bind(this)}})},8:function(a,b,c,d){var e=new Class({_accessors:{},_accessorName:undefined,options:{accessors:{}},setupAccessors:function(){var a=this._accessors;return this._accessors={},this.setAccessor(Object.merge({},a,this.options.accessors)),this},isAccessing:function(){return!!this._accessorName},_processAccess:function(a,b){var c;return a&&(this._accessorName=a,c=b(),this._accessorName=void 0),c},setAccessor:function(a,b){var c={};return!!a&&Type.isObject(b)&&(Object.each(b,function(b,d){var e=b;b._orig||(b=function(){return this._processAccess(a,e.pass(arguments,this))}.bind(this),b._orig=e),c[d]=b},this),this._accessors[a]=c),this}.overloadSetter(),getAccessor:function(a,b){var c=this._accessors[a];return b?c&&c[b]:c},unsetAccessor:function(a,b){return a&&(b?this._accessors[a][b]=void 0:this._accessors[a]=void 0),this}});c.Butler=e},9:function(a,b,c,d){var e="signal",f="-",g=":";c=b.exports=function(a,b,c){return Type.isFunction(b)||(c=b,b=undefined),c=c||{},Array.from(a).each(function(a){var d=(e+f+a.replace(g,f)).camelCase();c[d]=b?b(a):function(){return!this.isSilent()&&this.fireEvent(a,[this]),this}}),c}},a:function(a,b,c,d){var e=new Class({_validators:{},options:{validators:{}},setupValidators:function(){var a=this._validators;return this._validators={},this.setValidator(Object.merge({},a,this.options.validators)),this},setValidator:function(a,b){var c=b;return b._orig||(b=b.bind(this),b._orig=c),this._validators[a]=b,this}.overloadSetter(),getValidator:function(a){return this._validators[a]}.overloadGetter(),validate:function(a,b){var c=this.getValidator(a),d=!0;return c&&(d=c(b)),d},proof:function(a){return e.proof(a,this._validators,this)}});e.proof=function(a,b){return Object.every(b,function(b,c){return c in a&&b(a[c])})},c.Snitch=e},b:function(a,b,c,d){var e=a("c").Collection,f=a("2").Model,g=a("a").Snitch,h=function(a,b){return this.parent(b,a)};e.implement(new g),c.Collection=new Class({Extends:e,setup:function(a,b){return this.setupValidators(),this.parent(a,b),this},_add:function(a,b){return this.validate(instanceOf(a,f)?a.getData():a)?this.parent(a,b):this.signalError(a,b),this},validate:function(a){return a=Array.from(a),a.every(function(a){return instanceOf(a,f)?a.every(h,this):Object.every(a,h,this)},this)},proofModel:function(a){return a=Array.from(a),a.every(function(a){return g.proof(instanceOf(a,f)?a.getData():a,this._validators,this)},this)},proof:function(){return this.proofModel(this._models)},signalError:function(a,b){!this.isSilent()&&this.fireEvent("error",[this,a,b])}})},c:function(a,b,c,d){var e=a("2").Model,f=a("5").Silence,g=a("6").Connector,h=a("9"),i=new Class({Implements:[g,Events,Options,f],_models:[],_Model:e,_active:0,_changed:!1,length:0,primaryKey:undefined,options:{primaryKey:undefined,Model:undefined,modelOptions:undefined},initialize:function(a,b){this.setOptions(b),this.setup(a,b)},setup:function(a,b){return this.primaryKey=this.options.primaryKey,this.options.Model&&(this._Model=this.options.Model),a&&this.add(a),this},hasModel:function(a){var b=this.primaryKey,c,d;return c=this._models.contains(a),b&&!c&&(d=instanceOf(a,e)?a.get(b):a[b],c=this.some(function(a){return d===a.get(b)})),!!c},resetChange:function(){this._changed=!1},attachModelEvents:function(a){return a.addEvents({destroy:this.bound("remove"),change:this.bound("signalChangeModel")}),this},detachModelEvents:function(a){return a.removeEvents({destroy:this.bound("remove"),change:this.bound("signalChangeModel")}),this},act:function(a){return this._active++,a.call(this),this._active--,this},isActive:function(){return!!this._active},_add:function(a,b){return a=new this._Model(a,this.options.modelOptions),this.hasModel(a)||(this.attachModelEvents(a),b=this.length==0?void 0:b,b!=void 0?this._models.splice(b,0,a):this._models.push(a),this.length=this._models.length,this._changed=!0,this.signalAdd(a)),this},add:function(a,b){var c=this.length;return a=Array.from(a),this.act(function(){var c=a.length,d=0;while(c--)this._add(a[d++],b)}),!this.isActive()&&this._changed&&(this.signalChange(),this.resetChange()),this},get:function(a){var b=arguments.length,c=0,d;if(b>1){d=[];while(b--)d.push(this.get(arguments[c++]));return d}return this._models[a]},_remove:function(a){return this.hasModel(a)&&(this.detachModelEvents(a),this._models.erase(a),this.length=this._models.length,this._changed=!0,this.signalRemove(a)),this},remove:function(a){var b=this.length;return a=Array.from(a).slice(),this.act(function(){var b=a.length,c=0;while(b--)this._remove(a[c++])}),!this.isActive()&&this._changed&&(this.signalChange(),this.resetChange()),this},replace:function(a,b){var c;return a&&b&&this.hasModel(a)&&!this.hasModel(b)&&(c=this.indexOf(a),c>-1&&(this.act(function(){this.add(b,c),this.remove(a)}),!this.isActive()&&this.signalChange()&&this.resetChange())),this},sort:function(a){return this._models.sort(a),this.signalSort(),this},reverse:function(){return this._models.reverse(),this.signalSort(),this},empty:function(){return this.remove(this._models),this.signalEmpty(),this},toJSON:function(){return this.map(function(a){return a.toJSON()})}});i.implement(h(["empty","sort","change"],h(["add","remove","change:model"],function(a){return function(b){return!this.isSilent()&&this.fireEvent(a,[this,b]),this}}))),["forEach","each","invoke","every","filter","clean","indexOf","map","some","associate","link","contains","getLast","getRandom","flatten","pick"].each(function(a){i.implement(a,function(){return Array.prototype[a].apply(this._models,arguments)})}),c.Collection=i},d:function(a,b,c,d){var e=a("e").View;c.View=e},e:function(a,b,c,d){var e=a("6").Connector,f=a("5").Silence,g=a("9"),h=function(a){return function(){var b=this.options.events,c=this.element;return c&&b&&Object.each(b,function(b,c){var d=Array.from(b),e=d.length,f=0,g;while(e--)g=d[f++],this.element[a](c,typeOf(g)=="function"?g:this.bound(g))},this),this}},i=new Class(g(["ready","render","dispose","destroy"],{signalInject:function(a,b){return!this.isSilent()&&this.fireEvent("inject",[this,a,b]),this}})),j=new Class({Implements:[e,Events,Options,f,i],options:{element:undefined,events:{}},initialize:function(a){this.setOptions(a),this.setup(a),this.signalReady()},setup:function(a){return this.options.element&&this.setElement(this.options.element),this},toElement:function(){return this.element},setElement:function(a){return a&&(this.element&&this.destroy(),a=this.element=document.id(a),a&&this.attachEvents()),this},attachEvents:h("addEvent"),detachEvents:h("removeEvent"),create:function(){return this},render:function(a){return this.signalRender(),this},inject:function(a,b){return this.element&&(a=document.id(a),b=b||"bottom",this.element.inject(a,b),this.signalInject(a,b)),this},dispose:function(){return this.element&&(this.element.dispose(),this.signalDispose()),this},destroy:function(){var a=this.element;return a&&(a&&(this.detachEvents(),a.destroy(),this.element=undefined),this.signalDestroy()),this}});c.View=j},f:function(a,b,c,d){var e=new Class({_validators:{},options:{validators:{}},setupValidators:function(){var a=this._validators;return this._validators={},this.setValidator(Object.merge({},a,this.options.validators)),this},setValidator:function(a,b){var c=b;return b._orig||(b=b.bind(this),b._orig=c),this._validators[a]=b,this}.overloadSetter(),getValidator:function(a){return this._validators[a]}.overloadGetter(),validate:function(a,b){var c=this.getValidator(a),d=!0;return c&&(d=c(b)),d},proof:function(a){return e.proof(a,this._validators,this)}});e.proof=function(a,b){return Object.every(b,function(b,c){return c in a&&b(a[c])})},c.Snitch=e}})