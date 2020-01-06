import { RE_TAG } from './constants';
import each from './each';

export default function sanitize(data) {
  each(data, (value) => {
    if (value && typeof value === 'object') {
      return sanitize(value);
    }

    if (typeof value === 'string') {
      value = value.replace(RE_TAG, (tag, inside) => inside);
    }
  });

  return data;
}
