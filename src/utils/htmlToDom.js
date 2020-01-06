export default function htmlToDom(html) {
  const container = document.createElement('div');

  container.innerHTML = html.trim();

  return Array.from(container.childNodes)[0];
}
