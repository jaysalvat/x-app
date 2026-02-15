/**!
* x-app — Smart in-place JS templating engine for micro-apps.
* https://github.com/jaysalvat/x-app
* @version 0.0.6 built 2020-01-22 18:25:27.921 
* @license MIT
* @author Jay Salvat http://jaysalvat.com
*/
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self, 
  global.Xapp = factory());
})(this, (function() {
  "use strict";
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function each(item, callback) {
    var isArray;
    if (item.forEach) {
      item = Array.from(item);
      isArray = true;
    }
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        var returned = callback.apply(this, [ item[key], isArray ? parseInt(key) : key ]);
        if (returned === false) {
          break;
        }
      }
    }
  }
  function extend() {
    return Object.assign.apply(this, arguments);
  }
  var RE_TAG = /\{\{\s?(.*?)\s?\}\}/g;
  var RE_EVAL = /((^|[^\\.\w])([a-zA-Z_$][0-9a-zA-Z_$]*))(?=(?:[^'"]|['"][^'"]*['"])*$)/g;
  var RE_PIPE = /( ?\| ?\w+(\(.*\))?)/g;
  var NS_SVG = "http://www.w3.org/2000/svg";
  var tagCount;
  var mixins;
  var includes;
  function createVDomMap(node) {
    tagCount = 1;
    mixins = {};
    includes = {};
    var map = createVDomMapElement(node);
    return {
      map: map,
      mixins: mixins,
      includes: includes
    };
  }
  function createVDomMapElement(node, verbatim) {
    if (verbatim === void 0) {
      verbatim = false;
    }
    var vDom = {};
    if (node.nodeType === 1) {
      var attrs = {};
      var x = {};
      var doBreak;
      each(node.attributes, (function(attr) {
        if (attr.name === "x-verbatim") {
          verbatim = attr.value.toLowerCase() !== "off";
          node.removeAttribute(attr.name);
        }
      }));
      each(node.attributes, (function(attr) {
        var name = attr.name, value = attr.value;
        if (!verbatim && name.indexOf("x-") === 0) {
          switch (name) {
           case "x-for":
            x.for = value.split(/\s*in\s*/);
            break;

           case "x-use":
            x.use = value.split(/\s*with\s*/);
            break;

           case "x-include":
            node.removeAttribute(name);
            x.use = value.split(/\s*with\s*/);
            mixins[x.use[0]] = createVDomMapElement(node);
            includes[x.use[0]] = false;
            break;

           case "x-mixin":
            node.removeAttribute(name);
            mixins[value] = createVDomMapElement(node);
            node.remove();
            doBreak = true;
            break;

           default:
            x[name.replace("x-", "")] = value;
          }
        } else {
          attrs[name] = createMeta(value, verbatim);
        }
      }));
      if (doBreak) {
        return;
      }
      vDom.tagName = node.tagName;
      vDom.attrs = attrs;
      vDom.svg = node.ownerSVGElement !== undefined;
      vDom.x = x;
      vDom.children = createVDomMapChildren(node, verbatim);
      return vDom;
    }
    if (node.nodeType === 3) {
      var text = node.nodeValue.replace(/^\s{1,}|\s{1,}$/g, " ");
      if (text) {
        extend(vDom, createMeta(text, verbatim));
      }
      return vDom;
    }
  }
  function createVDomMapChildren(element, verbatim) {
    if (verbatim === void 0) {
      verbatim = false;
    }
    var children = [];
    each(element.childNodes, (function(node) {
      var vDom = createVDomMapElement(node, verbatim);
      if (vDom) {
        children.push(vDom);
      }
    }));
    return children;
  }
  function createMeta(text, verbatim) {
    var x = {};
    if (!verbatim) {
      text = text.replace(RE_TAG, (function(all, tag) {
        var id = "x" + tagCount++;
        var _parsePipes = parsePipes(tag), value = _parsePipes.value, pipes = _parsePipes.pipes;
        x[id] = {
          value: value || tag,
          pipes: pipes || []
        };
        return "{{ " + id + " }}";
      }));
    }
    return {
      x: x,
      text: text
    };
  }
  function parsePipes(string) {
    var pipes = string.match(RE_PIPE);
    if (!pipes) {
      return {};
    }
    string = string.replace(pipes.join(""), "").trim();
    pipes = pipes.map((function(pipe) {
      pipe = pipe.replace(/^( ?\| ?)/, "");
      var match = pipe.match(/(\w+)(\((.+)\))?/);
      return {
        name: match[1],
        args: "[" + (match[3] || "") + "]" || "[]"
      };
    }));
    return {
      value: string,
      pipes: pipes
    };
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isString(value) {
    return typeof value === "string";
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isUndefined(value) {
    return typeof value === "undefined";
  }
  function isHTMLElement(value) {
    return value instanceof HTMLElement;
  }
  function render(vNode) {
    if (!isString(vNode)) {
      var tagName = vNode.tagName, attrs = vNode.attrs, children = vNode.children, svg = vNode.svg;
      var $el;
      if (svg) {
        $el = document.createElementNS(NS_SVG, tagName);
      } else {
        $el = document.createElement(tagName);
      }
      each(attrs, (function(value, key) {
        $el.setAttribute(key, value);
      }));
      each(children, (function(child) {
        $el.appendChild(render(child));
      }));
      return $el;
    } else {
      return document.createTextNode(vNode);
    }
  }
  function diffAttrs(oldAttrs, newAttrs) {
    var patches = [];
    each(newAttrs, (function(value, key) {
      patches.push((function($node) {
        if (key === "innerHTML") {
          $node.innerHTML = value;
        } else {
          $node.setAttribute(key, value);
        }
        return $node;
      }));
    }));
    each(oldAttrs, (function(_, key) {
      if (!(key in newAttrs)) {
        patches.push((function($node) {
          $node.removeAttribute(key);
          return $node;
        }));
      }
    }));
    return function($node) {
      each(patches, (function(patch) {
        if (patch) {
          patch($node);
        }
      }));
    };
  }
  function diffChildren(oldVChildren, newVChildren) {
    var childPatches = [];
    var addPatches = [];
    each(oldVChildren, (function(oldVChild, i) {
      childPatches.push(diff(oldVChild, newVChildren[i]));
    }));
    each(newVChildren.slice(oldVChildren.length), (function(addVChild) {
      addPatches.push((function($node) {
        $node.appendChild(render(addVChild));
        return $node;
      }));
    }));
    return function($parent) {
      each($parent.childNodes, (function($child, i) {
        if (childPatches[i]) {
          childPatches[i]($child);
        }
      }));
      each(addPatches, (function(patch) {
        if (patch) {
          patch($parent);
        }
      }));
      return $parent;
    };
  }
  function diff(vOldNode, vNewNode) {
    if (!vNewNode) {
      return function($node) {
        $node.remove();
      };
    }
    if (isString(vOldNode) || isString(vNewNode)) {
      if (vOldNode !== vNewNode) {
        return function($node) {
          var $newNode = render(vNewNode);
          $node.replaceWith($newNode);
          return $newNode;
        };
      } else {
        return function() {};
      }
    }
    if (vOldNode.tagName !== vNewNode.tagName) {
      return function($node) {
        var $newNode = render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    }
    var patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
    var patchChildren = diffChildren(vOldNode.children, vNewNode.children);
    return function($node) {
      patchAttrs($node);
      patchChildren($node);
      return $node;
    };
  }
  function firstcapMixin(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function jsonMixin(string, indent) {
    if (indent === void 0) {
      indent = 4;
    }
    return JSON.stringify(string, null, indent);
  }
  function lowerMixin(string) {
    return string.toLowerCase();
  }
  function titleMixin(string) {
    var words = string.split(" ");
    return words.map((function(word) {
      return firstcapMixin(word);
    })).join(" ");
  }
  function truncateMixin(string, nb, separator) {
    if (string.length > nb) {
      return string.substr(0, nb) + (separator || "…");
    }
    return string;
  }
  function upperMixin(string) {
    return string.toUpperCase();
  }
  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }
  function evalInContext(string) {
    var varNames = Object.keys(this);
    string = string.replace(RE_EVAL, (function(all, _, before, varName) {
      if (varNames.includes(varName)) {
        return before + "this." + varName;
      }
      return all;
    }));
    if (isHTMLElement(window[string])) {
      return false;
    }
    if (!isUndefined(window[string])) {
      throw Error(string + " is not defined");
    }
    return eval("(" + string + ")");
  }
  function htmlToDom(html) {
    var container = document.createElement("div");
    container.innerHTML = html.trim();
    return Array.from(container.childNodes)[0];
  }
  function sanitize(data) {
    each(data, (function(value) {
      if (value && typeof value === "object") {
        return sanitize(value);
      }
      if (typeof value === "string") {
        value = value.replace(RE_TAG, (function(tag, inside) {
          return inside;
        }));
      }
    }));
    return data;
  }
  var browserStyles = [].slice.call(window.getComputedStyle(document.body));
  var browserPrefix = getCssVendorPrefix();
  function getCssVendorPrefix() {
    return (browserStyles.join("|").match(/[|\b]-(moz|webkit|ms)/) || [])[1];
  }
  function stylize(prop, prefix) {
    var dashed = prop.replace(/[A-Z]/g, (function(cap) {
      return "-" + cap.toLowerCase();
    })).trim();
    var prefixed = "-" + browserPrefix + "-" + dashed;
    if (prefix && browserStyles.includes(prefixed)) {
      dashed = prefixed;
    }
    return dashed;
  }
  var Xapp = function() {
    function Xapp(selector, settings) {
      if (selector === void 0) {
        selector = document.body;
      }
      this._settings = extend({}, Xapp._settings, settings);
      this._pipes = extend({}, Xapp._pipes);
      this._mixins = clone(Xapp._mixins);
      this._connectors = [];
      this.$el = this.setDOMObject(selector);
      var _vMap = createVDomMap(this.$el), map = _vMap.map, mixins = _vMap.mixins, includes = _vMap.includes;
      this._mixins = extend({}, this._mixins, mixins);
      this.includes = includes;
      this.loadIncludes();
      this.vMap = map;
      this.vDom = this.createVDomFromMap(this.vMap);
      this.data = {};
    }
    Xapp.settings = function settings(_settings) {
      if (_settings) {
        extend(Xapp._settings, _settings);
      }
      return Xapp._settings;
    };
    Xapp.mixins = function mixins(_mixins) {
      if (_mixins) {
        extend(Xapp._mixins, _mixins);
      }
      return Xapp._mixins;
    };
    Xapp.pipes = function pipes(_pipes) {
      if (_pipes) {
        extend(Xapp._pipes, _pipes);
      }
      return Xapp._pipes;
    };
    var _proto = Xapp.prototype;
    _proto.loadIncludes = function loadIncludes(files) {
      var _this = this;
      var i = 0;
      files = files || this.includes;
      each(files, (function(_, fileName) {
        if (_this.includes[fileName]) {
          return;
        } else {
          _this.includes[fileName] = true;
        }
        var xhr = new XMLHttpRequest;
        xhr.open("GET", fileName, true);
        xhr.send();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var _vMap2 = createVDomMap(htmlToDom(xhr.responseText)), map = _vMap2.map, mixins = _vMap2.mixins, includes = _vMap2.includes;
              _this.loadIncludes(includes);
              _this._mixins = extend({}, _this._mixins, mixins);
              _this._mixins[fileName] = map;
            }
            if (++i === Object.keys(files).length) {
              _this.render();
            }
          }
        };
      }));
    };
    _proto.settings = function settings(_settings2) {
      if (_settings2) {
        extend(this._settings, _settings2);
      }
      return this._settings;
    };
    _proto.mixins = function mixins(_mixins2) {
      var _this2 = this;
      if (_mixins2) {
        each(_mixins2, (function(mixin, key) {
          if (mixin.nodeType) {
            _this2._mixins[key] = createVDomMap(mixin).map;
            mixin.remove();
          } else if (isString(mixin)) {
            _this2._mixins[key] = createVDomMap(htmlToDom(mixin)).map;
          }
        }));
      }
      return this._mixins;
    };
    _proto.pipes = function pipes(_pipes) {
      if (_pipes) {
        extend(this._pipes, _pipes);
      }
      return this._pipes;
    };
    _proto.setDOMObject = function setDOMObject(selector) {
      var $el;
      if (isString(selector)) {
        if (selector.match(/^\s*<(\w+|!)[^>]*>/)) {
          $el = htmlToDom(selector);
        } else {
          $el = document.querySelector(selector);
        }
      } else {
        $el = selector;
      }
      if (!$el) {
        this.warn("Element “" + selector + "“ does not exist.");
        $el = document.createElement("div");
      }
      if ($el.getAttribute("type") === "text/template") {
        $el = htmlToDom($el.innerHTML);
        this.isContainer = true;
      }
      this.$el = $el;
      return $el;
    };
    _proto.getDOMObject = function getDOMObject() {
      return this.$el;
    };
    _proto.getHTML = function getHTML() {
      return this.$el.outerHTML;
    };
    _proto.getVDom = function getVDom() {
      return this.vDom;
    };
    _proto.getVMap = function getVMap() {
      return this.vMap;
    };
    _proto.setData = function setData(data) {
      this.data = sanitize(data || this.data || {});
    };
    _proto.connect = function connect($el) {
      if (isString($el)) {
        $el = document.querySelector($el);
      }
      if (!$el) {
        return this.warn("Connector “" + $el + "“ does not exist.");
      }
      if (!this.isContainer) {
        return this.warn("Template must be type=“text/template“ to be connected.");
      }
      this._connectors.push($el);
    };
    _proto.render = function render(data, callback) {
      var _this3 = this;
      if (isFunction(data) && !callback) {
        callback = data;
        data = null;
      }
      this.setData(data);
      this.triggerEvent("before");
      delete this.vMap.attrs.hidden;
      var newVDom = this.createVDomFromMap(this.vMap, this.data);
      var patch = diff(this.vDom, newVDom);
      this.vDom = clone(newVDom);
      this.$el = patch(this.$el);
      this.applyData(this.$el, newVDom);
      this.triggerEvent("after");
      each(this._connectors, (function(connector) {
        connector.innerHTML = _this3.getHTML();
      }));
      if (isFunction(callback)) {
        callback.call(this.$el, this.$el);
      }
      return this.getHTML();
    };
    _proto.applyData = function applyData($el, vDom) {
      var _this4 = this;
      $el["x-data"] = vDom && vDom.data ? vDom.data() : this.data;
      each($el.childNodes, (function($child, i) {
        _this4.applyData($child, vDom && vDom.children[i]);
      }));
    };
    _proto.createVDomFromMap = function createVDomFromMap(map, _data) {
      var _this5 = this;
      var vDom = {
        data: function data() {
          return _data;
        }
      };
      map = clone(map);
      if (_data) {
        if (map.x.for) {
          var items = [];
          var _map$x$for = map.x.for, alias = _map$x$for[0], value = _map$x$for[1];
          var array = this.eval(value, _data) || [];
          delete map.x.for;
          if (!isArray(array)) {
            array = Object.keys(array);
          }
          each(array, (function(row, i) {
            var _extend;
            var newData = extend({}, _data, (_extend = {
              $first: i === 0,
              $index: i,
              $last: i === array.length - 1
            }, _extend[alias] = row, _extend));
            items.push(_this5.createVDomFromMap(clone(map), newData));
          }));
          return items;
        }
        if (map.x.use) {
          var _map$x$use = map.x.use, mixId = _map$x$use[0], aliases = _map$x$use[1];
          var mixin = this._mixins[mixId];
          if (!mixin) {
            return this.warn("Template “" + mixId + "“ does not exist.");
          }
          delete map.x.use;
          var newData = extend(_data, this.eval("(" + aliases + ")", _data));
          var newMap = clone(mixin);
          newMap.x = Object.assign({}, mixin.x, map.x);
          return this.createVDomFromMap(newMap, newData);
        }
        if (map.x.if) {
          if (!this.eval(map.x.if, _data)) {
            return;
          }
        }
        if (map.attrs) {
          var attrs = {};
          each(map.attrs, (function(attr, key) {
            var text = attr.text, x = attr.x;
            attrs[key] = _this5.replaceTags(text, _data, x);
          }));
          map.attrs = attrs;
        }
        if (map.x.html) {
          map.attrs.innerHTML = this.eval(map.x.html, _data);
        }
        each([ "src", "srcset", "href" ], (function(type) {
          if (map.x[type]) {
            map.attrs[type] = _this5.eval(map.x[type], _data);
          }
        }));
        if (map.x.attr) {
          var _attrs = this.eval(map.x.attr, _data) || [];
          each(_attrs, (function(attr, key) {
            if (attr === false || attr === undefined || attr === null) {
              delete map.attrs[key];
            } else if (attr === true) {
              map.attrs[key] = key;
            } else {
              map.attrs[key] = attr;
            }
          }));
        }
        if (map.x.class) {
          var classes = [];
          var xClasses = this.eval(map.x.class, _data);
          var oClasses = (map.attrs.class || "").split(" ");
          each(xClasses, (function(value, className) {
            if (value === true) {
              classes.push(className);
            }
          }));
          each(oClasses, (function(className) {
            if (xClasses[className] !== false) {
              classes.push(className);
            }
          }));
          map.attrs.class = classes.join(" ").trim();
        }
        if (map.x.style) {
          var styles = [];
          var prefix = this._settings.cssPrefix;
          var xStyles = this.eval(map.x.style, _data);
          var oStyles = map.attrs.style ? map.attrs.style.split(/ ?; ?/) : [];
          each(oStyles, (function(style) {
            var _style$split = style.split(/ ?: ?/), property = _style$split[0], value = _style$split[1];
            styles.push(stylize(property, prefix) + ": " + value);
          }));
          each(xStyles, (function(value, property) {
            styles.push(stylize(property, prefix) + ": " + value);
          }));
          map.attrs.style = styles.join("; ").trim();
        }
      }
      if (map.text) {
        vDom = this.replaceTags(map.text, _data, map.x);
      } else if (map.tagName) {
        vDom.tagName = map.tagName;
        vDom.svg = map.svg;
        vDom.attrs = map.attrs || {};
        vDom.children = [];
        if (!_data && vDom.attrs) {
          each(map.x, (function(_, key) {
            vDom.attrs["x-" + key] = true;
          }));
        }
      }
      if (map.children) {
        each(map.children, (function(nodeMap) {
          var childMap = _this5.createVDomFromMap(nodeMap, _data);
          if (isArray(childMap)) {
            each(childMap, (function(child) {
              if (child) {
                vDom.children.push(child);
              }
            }));
          } else if (childMap) {
            vDom.children.push(childMap);
          }
        }));
      }
      return vDom;
    };
    _proto.replaceTags = function replaceTags(string, data, x) {
      var _this6 = this;
      if (!data) {
        return string;
      }
      return string.replace(RE_TAG, (function(_, tag) {
        if (!x[tag]) {
          return string;
        }
        var value = x[tag].value;
        var evalValue = _this6.eval(value, data);
        var piped = _this6.applyPipes(evalValue, x[tag].pipes, data);
        return typeof piped === "undefined" ? "" : piped;
      }));
    };
    _proto.applyPipes = function applyPipes(value, pipes, data) {
      var _this7 = this;
      each(pipes, (function(_ref) {
        var name = _ref.name, args = _ref.args;
        var fn = _this7._pipes[name];
        if (fn) {
          args = _this7.eval(args, data);
          value = fn.apply(data, [ value ].concat(args));
        } else {
          _this7.warn("”" + name + "” pipe does not exist.");
        }
      }));
      return value;
    };
    _proto.triggerEvent = function triggerEvent(type) {
      var event = new CustomEvent("x-" + type, {
        detail: {
          template: this.$el,
          data: this.data
        }
      });
      document.dispatchEvent(event);
      this._settings[type + "Render"].call(this.$el, this.$el, this.data);
    };
    _proto.eval = function _eval(string, data) {
      if (!data) {
        return string;
      }
      try {
        return evalInContext.call(data, string);
      } catch (e) {
        this.warn("”" + string + "”:", e.message);
      }
    };
    _proto.warn = function warn() {
      var args = Array.from(arguments);
      var message = "Xapp — " + args.join(" ");
      if (this._settings.warningLevel === 1) {
        console.warn(message);
      } else if (this._settings.warningLevel === 2) {
        throw Error(message);
      }
    };
    return Xapp;
  }();
  _defineProperty(Xapp, "_mixins", {});
  _defineProperty(Xapp, "_settings", {
    cssPrefix: true,
    warningLevel: 1,
    beforeRender: function beforeRender() {},
    afterRender: function afterRender() {}
  });
  _defineProperty(Xapp, "_pipes", {
    firstcap: firstcapMixin,
    json: jsonMixin,
    lower: lowerMixin,
    title: titleMixin,
    truncate: truncateMixin,
    upper: upperMixin
  });
  return Xapp;
}));
