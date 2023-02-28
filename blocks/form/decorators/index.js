import decorateRange, { createRange } from './range.js';
import formatFns from '../formatting.js';
import createQuestionMark from './tooltip.js';

function decorateTermField(input) {
  const values = Array(6).fill(1).map((x, i) => formatFns.year(i + 1));
  if (input) {
    const clonedInput = input.cloneNode();
    clonedInput.type = 'hidden';
    input.min = 0;
    input.max = 6;
    input.step = 1;
    input.name += '-proxy';
    const rangeDiv = createRange(input, ['6 Months'].concat(values));
    rangeDiv.querySelector('input').addEventListener('input', (e) => {
      if (e.target.value === '0') clonedInput.value = 0.5;
      else clonedInput.value = e.target.value;
      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });
      clonedInput.dispatchEvent(event);
    });
    rangeDiv.append(clonedInput);
    input.replaceWith(rangeDiv);
  }
}

export default async function decorateCustom(form) {
  /** add custom tooltips */
  form.querySelectorAll('.field-label[title]').forEach((label) => {
    label.append(createQuestionMark(label.title));
  });

  form.querySelectorAll('.form-range-wrapper').forEach((block) => {
    decorateRange(block);
  });

  const termField = form.querySelector('.form-term input');
  decorateTermField(termField);
}
