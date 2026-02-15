import vMap from './vDom/vMap';
import diff from './vDom/diff';

import firstcapMixin from './mixins/firstcapMixin';
import jsonMixin from './mixins/jsonMixin';
import lowerMixin from './mixins/lowerMixin';
import titleMixin from './mixins/titleMixin';
import truncateMixin from './mixins/truncateMixin';
import upperMixin from './mixins/upperMixin';

import clone from './utils/clone';
import each from './utils/each';
import evalInContext from './utils/evalInContext';
import extend from './utils/extend';
import htmlToDom from './utils/htmlToDom';
import sanitize from './utils/sanitize';
import stylize from './utils/stylize';

import { isString, isArray, isFunction } from './utils/types';
import { RE_TAG } from './utils/constants';

export default class Xapp {
  static _mixins = {};

  static _settings = {
    cssPrefix: true,
    warningLevel: 1,
    beforeRender: () => {},
    afterRender: () => {}
  };

  static _pipes = {
    firstcap: firstcapMixin,
    json: jsonMixin,
    lower: lowerMixin,
    title: titleMixin,
    truncate: truncateMixin,
    upper: upperMixin
  }

  constructor(selector = document.body, settings) {
    this._settings = extend({}, Xapp._settings, settings);
    this._pipes = extend({}, Xapp._pipes);
    this._mixins = clone(Xapp._mixins);
    this._connectors = [];

    this.$el = this.setDOMObject(selector);

    const { map, mixins, includes } = vMap(this.$el);
    this._mixins = extend({}, this._mixins, mixins);
    this.includes = includes;

    this.vMap = map;
    this.data = {};

    // Initialize vDom immediately or after includes load
    if (Object.keys(includes).length === 0) {
      this.vDom = this.createVDomFromMap(this.vMap);
    } else {
      this.vDom = { children: [] };
      this.loadIncludes();
    }
  }

  static settings(settings) {
    if (settings) {
      extend(Xapp._settings, settings);
    }
    return Xapp._settings;
  }

  static mixins(mixins) {
    if (mixins) {
      extend(Xapp._mixins, mixins);
    }
    return Xapp._mixins;
  }

  static pipes(_pipes) {
    if (_pipes) {
      extend(Xapp._pipes, _pipes);
    }
    return Xapp._pipes;
  }

  loadIncludes(files) {
    files = files || this.includes;

    const fileNames = Object.keys(files).filter((fileName) => !this.includes[fileName]);

    if (fileNames.length === 0) {
      return Promise.resolve();
    }

    const promises = fileNames.map((fileName) => {
      this.includes[fileName] = true;

      return fetch(fileName)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${fileName}: ${response.status}`);
          }
          return response.text();
        })
        .then((html) => {
          const { map, mixins, includes } = vMap(htmlToDom(html));
          this._mixins = { ...this._mixins, ...mixins };
          this._mixins[fileName] = map;
          return this.loadIncludes(includes);
        })
        .catch((err) => {
          this.warn(`Unable to load "${fileName}"`, err.message);
        });
    });

    return Promise.all(promises).then(() => this.render());
  }

  settings(settings) {
    if (settings) {
      extend(this._settings, settings);
    }
    return this._settings;
  }

  mixins(mixins) {
    if (mixins) {
      each(mixins, (mixin, key) => {
        if (mixin.nodeType) {
          this._mixins[key] = vMap(mixin).map;
          mixin.remove();
        } else if (isString(mixin)) {
          this._mixins[key] = vMap(htmlToDom(mixin)).map;
        }
      });
    }

    return this._mixins;
  }

  pipes(_pipes) {
    if (_pipes) {
      extend(this._pipes, _pipes);
    }
    return this._pipes;
  }

  setDOMObject(selector) {
    let $el;

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
      this.warn(`Element “${selector}“ does not exist.`);
      $el = document.createElement('div');
    }

    if ($el.getAttribute('type') === 'text/template') {
      $el = htmlToDom($el.innerHTML);
      this.isContainer = true;
    }

    this.$el = $el;

    return $el;
  }

  getDOMObject() {
    return this.$el;
  }

  getHTML() {
    return this.$el.outerHTML;
  }

  getVDom() {
    return this.vDom;
  }

  getVMap() {
    return this.vMap;
  }

  setData(data) {
    this.data = sanitize(data || this.data || {});
  }

  connect($el) {
    if (isString($el)) {
      $el = document.querySelector($el);
    }

    if (!$el) {
      return this.warn(`Connector “${$el}“ does not exist.`);
    }

    if (!this.isContainer) {
      return this.warn('Template must be type=“text/template“ to be connected.');
    }

    this._connectors.push($el);
  }

  render(data, callback) {
    if (isFunction(data) && !callback) {
      callback = data;
      data = null;
    }

    this.setData(data);
    this.triggerEvent('before');

    delete this.vMap.attrs.hidden;

    const newVDom = this.createVDomFromMap(this.vMap, this.data);
    const patch = diff(this.vDom, newVDom);

    this.vDom = clone(newVDom);
    this.$el = patch(this.$el);

    this.applyData(this.$el, newVDom);
    this.triggerEvent('after');

    each(this._connectors, (connector) => {
      connector.innerHTML = this.getHTML();
    });

    if (isFunction(callback)) {
      callback.call(this.$el, this.$el);
    }

    return this.getHTML();
  }

  applyData($el, vDom) {
    $el['x-data'] = (vDom && vDom.data) ? vDom.data() : this.data;

    each($el.childNodes, ($child, i) => {
      this.applyData($child, vDom && vDom.children[i]);
    });
  }

  createVDomFromMap(map, data) {
    let vDom = {
      data: function() { return data; }
    };

    map = clone(map);

    if (data) {

      // X-FOR

      if (map.x.for) {
        const items = [];
        const [ alias, value ] = map.x.for;
        let array = this.eval(value, data) || [];

        delete map.x.for;

        if (!isArray(array)) {
          array = Object.keys(array);
        }

        each(array, (row, i) => {
          const newData = extend({}, data, {
            $first: i === 0,
            $index: i,
            $last: i === array.length - 1,
            [alias]: row
          });

          items.push(this.createVDomFromMap(clone(map), newData));
        });

        return items;
      }

      // X-USE

      if (map.x.use) {
        const [ mixId, aliases ] = map.x.use;
        const mixin = this._mixins[mixId];

        if (!mixin) {
          return this.warn(`Template “${mixId}“ does not exist.`);
        }

        delete map.x.use;

        const newData = extend(data, this.eval(`(${aliases})`, data));
        const newMap = clone(mixin);

        newMap.x = Object.assign({}, mixin.x, map.x);

        return this.createVDomFromMap(newMap, newData);
      }

      // X-IF

      if (map.x.if) {
        if (!this.eval(map.x.if, data)) {
          return;
        }
      }

      // Replace tags in attributes used
      // by following X-attributes

      if (map.attrs) {
        const attrs = {};

        each(map.attrs, (attr, key) => {
          const { text, x } = attr;

          attrs[key] = this.replaceTags(text, data, x);
        });

        map.attrs = attrs;
      }

      // X-HTML

      if (map.x.html) {
        map.attrs.innerHTML = this.eval(map.x.html, data);
      }

      // X-SRC, X-SRCSET, X-HREF

      each([ 'src', 'srcset', 'href' ], (type) => {
        if (map.x[type]) {
          map.attrs[type] = this.eval(map.x[type], data);
        }
      });

      // X-ATTR

      if (map.x.attr) {
        const attrs = this.eval(map.x.attr, data) || [];

        each(attrs, (attr, key) => {
          if (attr === false || attr === undefined || attr === null) {
            delete map.attrs[key];
          } else if (attr === true) {
            map.attrs[key] = key;
          } else {
            map.attrs[key] = attr;
          }
        });
      }

      // X-CLASS

      if (map.x.class) {
        const classes = [];
        const xClasses = this.eval(map.x.class, data);
        const oClasses = (map.attrs.class || '').split(' ');

        each(xClasses, (value, className) => {
          if (value === true) classes.push(className);
        });

        each(oClasses, (className) => {
          if (xClasses[className] !== false) classes.push(className);
        });

        map.attrs.class = classes.join(' ').trim();
      }

      // X-STYLE

      if (map.x.style) {
        const styles = [];
        const prefix = this._settings.cssPrefix;
        const xStyles = this.eval(map.x.style, data);
        const oStyles = map.attrs.style ? map.attrs.style.split(/ ?; ?/) : [];

        each(oStyles, (style) => {
          const [ property, value ] = style.split(/ ?: ?/);

          styles.push(stylize(property, prefix) + ': ' + value);
        });

        each(xStyles, (value, property) => {
          styles.push(stylize(property, prefix) + ': ' + value);
        });

        map.attrs.style = styles.join('; ').trim();
      }
    }

    // NODE

    if (map.text) {
      vDom = this.replaceTags(map.text, data, map.x);

    } else if (map.tagName) {
      vDom.tagName = map.tagName;
      vDom.svg = map.svg;
      vDom.attrs = map.attrs || {};
      vDom.children = [];

      // First Vdom with no data needs these attributes
      // so they will be removed from the original DOM
      // on the first rendering

      if (!data && vDom.attrs) {
        each(map.x, (_, key) => {
          vDom.attrs[`x-${key}`] = true;
        });
      }
    }

    // CHILDREN

    if (map.children) {
      each(map.children, (nodeMap) => {
        const childMap = this.createVDomFromMap(nodeMap, data);

        if (isArray(childMap)) {
          each(childMap, (child) => {
            if (child) {
              vDom.children.push(child);
            }
          });
        } else if (childMap) {
          vDom.children.push(childMap);
        }
      });
    }

    return vDom;
  }

  replaceTags(string, data, x) {
    if (!data) return string;

    return string.replace(RE_TAG, (_, tag) => {
      if (!x[tag]) return string;

      const value = x[tag].value;
      const evalValue = this.eval(value, data);
      const piped = this.applyPipes(evalValue, x[tag].pipes, data);

      return typeof piped === 'undefined' ? '' : piped;
    });
  }

  applyPipes(value, pipes, data) {
    each(pipes, ({ name, args }) => {
      const fn = this._pipes[name];

      if (fn) {
        args = this.eval(args, data);
        value = fn.apply(data, [ value ].concat(args));
      } else {
        this.warn(`”${name}” pipe does not exist.`);
      }
    });

    return value;
  }

  triggerEvent(type) {
    const event = new CustomEvent(`x-${type}`, {
      detail: {
        template: this.$el,
        data: this.data
      }
    });

    document.dispatchEvent(event);

    this._settings[`${type}Render`].call(this.$el, this.$el, this.data);
  }

  eval(string, data) {
    if (!data) return string;

    try {
      return evalInContext.call(data, string);
    } catch (e) {
      this.warn(`”${string}”:`, e.message);
    }
  }

  warn() {
    const args = Array.from(arguments);
    const message = 'Xapp — ' + args.join(' ');

    if (this._settings.warningLevel === 1) {
      console.warn(message);
    } else if (this._settings.warningLevel === 2) {
      throw Error(message);
    }
  }
}
