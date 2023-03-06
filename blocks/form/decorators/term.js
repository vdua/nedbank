import { nameToId } from '../form.js';
import formatFns from '../formatting.js';
import { createRange } from './range.js';

export default function decorateTermField(termField) {
  const input = termField.querySelector('input');
  const label = termField.querySelector('.field-label');
  const values = Array(6).fill(1).map((x, i) => formatFns.year(i + 1));
  if (input) {
    const hiddenInput = input.cloneNode();
    hiddenInput.type = 'hidden';
    input.id = nameToId(input.name);
    label.for = input.id;
    input.min = 0;
    input.max = 6;
    input.step = 1;
    input.name += '-proxy';
    const rangeDiv = createRange(input, ['6 Months'].concat(values));
    rangeDiv.querySelector('input').addEventListener('input', (e) => {
      if (e.target.value === '0') hiddenInput.value = 0.5;
      else hiddenInput.value = e.target.value;
      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });
      hiddenInput.dispatchEvent(event);
    });
    rangeDiv.append(hiddenInput);
    input.replaceWith(rangeDiv);
  }
}
