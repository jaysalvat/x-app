export function isArray(value) {
  return Array.isArray(value);
}

export function isObject(value) {
  return typeof value === 'object';
}

export function isString(value) {
  return typeof value === 'string';
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isUndefined(value) {
  return typeof value === 'undefined';
}

export function isHTMLElement(value) {
  return value instanceof HTMLElement;
}
