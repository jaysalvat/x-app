/* eslint-disable no-eval */

import { RE_EVAL } from './constants';
import { isUndefined, isHTMLElement } from './types';

export default function evalInContext(string) {
  const varNames = Object.keys(this);

  string = string.replace(RE_EVAL, (all, _, before, varName) => {
    if (varNames.includes(varName)) {
      return before + 'this.' + varName;
    }
    return all;
  });

  if (isHTMLElement(window[string])) {
    return false;
  }

  if (!isUndefined(window[string])) {
    throw Error(`${string} is not defined`);
  }

  return eval(`(${string})`);
}
