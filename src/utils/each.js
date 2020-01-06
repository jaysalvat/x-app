/* eslint-disable no-prototype-builtins */
export default function each(item, callback) {
  let isArray;

  if (item.forEach) {
    item = Array.from(item);
    isArray = true;
  }

  for (const key in item) {
    if (item.hasOwnProperty(key)) {
      const returned = callback.apply(this, [ item[key], isArray ? parseInt(key) : key ]);

      if (returned === false) break;
    }
  }
}
