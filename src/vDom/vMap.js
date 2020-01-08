import each from '../utils/each';
import extend from '../utils/extend';
import { RE_TAG, RE_PIPE } from '../utils/constants';

let tagCount;
let mixins;
let includes;

function createVDomMap(node) {
  tagCount = 1;
  mixins = {};
  includes = {};

  const map = createVDomMapElement(node);

  return { map, mixins, includes };
}

function createVDomMapElement(node, verbatim = false) {
  const vDom = {};

  if (node.nodeType === 1) {
    const attrs = {};
    const x = {};
    let doBreak;

    each(node.attributes, (attr) => {
      if (attr.name === 'x-verbatim') {
        verbatim = attr.value.toLowerCase() !== 'off';
        node.removeAttribute(attr.name);
      }
    });

    each(node.attributes, (attr) => {
      const { name, value } = attr;

      if (!verbatim && name.indexOf('x-') === 0) {
        switch (name) {
          case 'x-for':
            x.for = value.split(/\s*in\s*/);
            break;

          case 'x-use':
            x.use = value.split(/\s*with\s*/);
            break;

          case 'x-include':
            node.removeAttribute(name);
            x.use = value.split(/\s*with\s*/);
            mixins[x.use[0]] = createVDomMapElement(node);
            includes[x.use[0]] = false;
            break;

          case 'x-mixin':
            node.removeAttribute(name);
            mixins[value] = createVDomMapElement(node);
            node.remove();
            doBreak = true;
            break;

          default:
            x[name.replace('x-', '')] = value;
        }
      } else {
        attrs[name] = createMeta(value, verbatim);
      }
    });

    if (doBreak) return;

    vDom.tagName = node.tagName;
    vDom.attrs = attrs;
    vDom.svg = node.ownerSVGElement !== undefined;
    vDom.x = x;

    vDom.children = createVDomMapChildren(node, verbatim);

    return vDom;
  }

  if (node.nodeType === 3) {
    const text = node.nodeValue.replace(/^\s{1,}|\s{1,}$/g, ' ');

    if (text) {
      extend(vDom, createMeta(text, verbatim));
    }

    return vDom;
  }
}

function createVDomMapChildren(element, verbatim = false) {
  const children = [];

  each(element.childNodes, (node) => {
    const vDom = createVDomMapElement(node, verbatim);

    if (vDom) {
      children.push(vDom);
    }
  });

  return children;
}

function createMeta(text, verbatim) {
  const x = {};

  if (!verbatim) {
    text = text.replace(RE_TAG, (all, tag) => {
      const id = 'x' + tagCount++;
      const { value, pipes } = parsePipes(tag);

      x[id] = {
        value: value || tag,
        pipes: pipes || []
      };

      return `{{ ${id} }}`;
    });
  }

  return { x, text };
}

function parsePipes(string) {
  let pipes = string.match(RE_PIPE);

  if (!pipes) return {};

  string = string.replace(pipes.join(''), '').trim();

  pipes = pipes.map((pipe) => {
    pipe = pipe.replace(/^( ?\| ?)/, '');

    const match = pipe.match(/(\w+)(\((.+)\))?/);

    return {
      name: match[1],
      args: '[' + (match[3] || '') + ']' || '[]'
    };
  });

  return { value: string, pipes };
}

export default createVDomMap;
