export default function jsonMixin(string, indent = 4) {
  return JSON.stringify(string, null, indent);
}
