import decorateRange from './range.js';
import createQuestionMark from './tooltip.js';

export default async function decorateCustom(form) {
  /** add custom tooltips */
  form.querySelectorAll('.field-label[title]').forEach((label) => {
    label.append(createQuestionMark(label.title));
  });

  form.querySelectorAll('.form-range-wrapper').forEach((block) => {
    decorateRange(block);
  });
}
