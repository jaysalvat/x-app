import each from '../utils/each';
import { isString } from '../utils/types';

import { NS_SVG } from '../utils/constants';

function render(vNode) {
  if (!isString(vNode)) {
    const { tagName, attrs, children, svg } = vNode;
    let $el;

    if (svg) {
      $el = document.createElementNS(NS_SVG, tagName);
    } else {
      $el = document.createElement(tagName);
    }

    each(attrs, (value, key) => {
      $el.setAttribute(key, value);
    });

    each(children, (child) => {
      $el.appendChild(render(child));
    });

    return $el;
  } else {
    return document.createTextNode(vNode);
  }
}

export default render;
