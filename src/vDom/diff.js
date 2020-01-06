import each from '../utils/each';
import render from './render';
import { isString } from '../utils/types';

function diffAttrs(oldAttrs, newAttrs) {
  const patches = [];

  each(newAttrs, (value, key) => {
    patches.push(($node) => {
      if (key === 'innerHTML') {
        $node.innerHTML = value;
      } else {
        $node.setAttribute(key, value);
      }
      return $node;
    });
  });

  each(oldAttrs, (_, key) => {
    if (!(key in newAttrs)) {
      patches.push(($node) => {
        $node.removeAttribute(key);

        return $node;
      });
    }
  });

  return ($node) => {
    each(patches, (patch) => {
      if (patch) patch($node);
    });
  };
}

function diffChildren(oldVChildren, newVChildren) {
  const childPatches = [];
  const addPatches = [];

  each(oldVChildren, (oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  each(newVChildren.slice(oldVChildren.length), (addVChild) => {
    addPatches.push(($node) => {
      $node.appendChild(render(addVChild));

      return $node;
    });
  });

  return ($parent) => {
    each($parent.childNodes, ($child, i) => {
      if (childPatches[i]) childPatches[i]($child);
    });

    each(addPatches, (patch) => {
      if (patch) patch($parent);
    });

    return $parent;
  };
}

function diff(vOldNode, vNewNode) {
  if (!vNewNode) {
    return ($node) => {
      $node.remove();
    };
  }

  if (isString(vOldNode) || isString(vNewNode)) {
    if (vOldNode !== vNewNode) {
      return ($node) => {
        const $newNode = render(vNewNode);

        $node.replaceWith($newNode);

        return $newNode;
      };
    } else {
      return () => {};
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return ($node) => {
      const $newNode = render(vNewNode);

      $node.replaceWith($newNode);

      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return ($node) => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
}

export default diff;
