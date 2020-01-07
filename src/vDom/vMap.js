import each from '../utils/each';
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

function createVDomMapElement(node) {
  const vdom = {};

  if (node.nodeType === 1) {
    const attrs = {};
    const x = {};
    let doBreak;

    each(node.attributes, (attr) => {
      if (attr.name.indexOf('x-') === 0) {
        switch (attr.name) {
          case 'x-verbatim':
            x.verbatim = true;
            break;

          case 'x-for':
            x.for = attr.value.split(/\s*in\s*/);
            break;

          case 'x-use':
            x.use = attr.value.split(/\s*with\s*/);
            break;

          case 'x-include':
            node.removeAttribute(attr.name);
            x.use = attr.value.split(/\s*with\s*/);
            mixins[x.use[0]] = createVDomMapElement(node);
            includes[x.use[0]] = false;
            break;

          case 'x-mixin':
            node.removeAttribute(attr.name);
            mixins[attr.value] = createVDomMapElement(node);
            node.remove();
            doBreak = true;
            break;

          default:
            x[attr.name.replace('x-', '')] = attr.value;
        }
      } else {
        const meta = createMeta(attr.value);

        attrs[attr.name] = {
          text: meta.text,
          x: meta.x
        };
      }
    });

    if (doBreak) return;

    vdom.tagName = node.tagName;
    vdom.attrs = attrs;
    vdom.svg = node.ownerSVGElement !== undefined;
    vdom.x = x;

    vdom.children = createVDomMapChildren(node);

    return vdom;
  }

  if (node.nodeType === 3) {
    const text = node.nodeValue.replace(/^\s{1,}|\s{1,}$/g, ' ');

    if (text) {
      const meta = createMeta(text);

      vdom.text = meta.text;
      vdom.x = meta.x;
    }

    return vdom;
  }
}

function createVDomMapChildren(element) {
  const children = [];

  each(element.childNodes, (node) => {
    const vdom = createVDomMapElement(node);

    if (vdom) {
      children.push(vdom);
    }
  });

  return children;
}

function createMeta(text) {
  const x = {};

  text = text.replace(RE_TAG, (all, tag) => {
    const id = 'x' + tagCount++;
    const { value, pipes } = parsePipes(tag);

    x[id] = {
      value: value || tag,
      pipes: pipes || []
    };

    return `{{ ${id} }}`;
  });

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
