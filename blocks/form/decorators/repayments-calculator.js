import decorateRange from './range.js';
import decorateTooltips from './tooltip.js';
import decorateLayout from './layout.js';
import decorateFieldsets from './fieldsets.js';
import { applyRuleEngine } from '../rules/index.js';

function getSelector(fieldName) {
  let selector = fieldName;
  if (!fieldName.startsWith('.')) {
    selector = `.form-${fieldName}`;
  }
  return selector;
}

const groups = {
  Input: ['totalLoanAmount', 'term', 'insuranceOptionFieldSet'].map(getSelector).join(','),
  Output: ['.form-output-wrapper', 'exploreRate', 'rate'].map(getSelector).join(','),
  buttons: '.form-button-wrapper',
};

const fieldsets = {
  insuranceOptionFieldSet: ['insuranceOption'].map(getSelector),
};

function stripTags(input, allowd) {
  const allowed = ((`${allowd || ''}`)
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '')
    .replace(tags, ($0, $1) => (allowed.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : ''));
}

export default async function decorateRepaymentsCalculator(formTag, { form, fragments }) {
  /** add custom tooltips */
  decorateTooltips(formTag);

  formTag.querySelectorAll('.form-range-wrapper').forEach((block) => {
    decorateRange(block);
  });

  decorateFieldsets(fieldsets, formTag);

  decorateLayout(formTag, groups);

  const label = formTag.querySelector('#insuranceOption').nextElementSibling;
  label.innerHTML = stripTags(label.innerText, '<a>');

  applyRuleEngine(form, fragments, formTag);
}
