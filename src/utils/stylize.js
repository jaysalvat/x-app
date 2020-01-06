const browserStyles = [].slice.call(window.getComputedStyle(document.body));
const browserPrefix = getCssVendorPrefix();

function getCssVendorPrefix() {
  return (browserStyles.join('|').match(/[|\b]-(moz|webkit|ms)/) || [])[1];
}

function stylize(prop, prefix) {
  let dashed = prop.replace(/[A-Z]/g, (cap) => '-' + cap.toLowerCase()).trim();
  const prefixed = `-${browserPrefix}-${dashed}`;

  if (prefix && browserStyles.includes(prefixed)) {
    dashed = prefixed;
  }

  return dashed;
}

export default stylize;
