export const RE_TAG = /\{\{\s?(.*?)\s?\}\}/g;
export const RE_EVAL = /((^|[^\\.\w])([a-zA-Z_$][0-9a-zA-Z_$]*))(?=(?:[^'"]|['"][^'"]*['"])*$)/g;
export const RE_PIPE = /( ?\| ?\w+(\(.*\))?)/g;
export const NS_SVG = 'http://www.w3.org/2000/svg';
