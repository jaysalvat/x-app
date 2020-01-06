export default function truncateMixin(string, nb, separator) {
  if (string.length > nb) {
    return string.substr(0, nb) + (separator || '…');
  }
  return string;
}
