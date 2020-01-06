import firstcapMixin from './firstcapMixin';

export default function titleMixin(string) {
  const words = string.split(' ');
  return words.map((word) => firstcapMixin(word)).join(' ');
}
