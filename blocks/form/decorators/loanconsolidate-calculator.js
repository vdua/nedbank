import decorateRange from './range.js';
import decorateTooltips from './tooltip.js';
import decorateLayout from './layout.js';
import decorateFieldsets from './fieldsets.js';
import { applyRuleEngine } from '../rules/index.js';
import decorateValidations from './validations.js';
import decorateTermField from './term.js';
import decorateSelect from './select.js';
import decorateRepeatable from './repeat.js';

function getSelector(fieldName) {
  let selector = fieldName;
  if (!fieldName.startsWith('.')) {
    selector = `.form-${fieldName}`;
  }
  return selector;
}

const groups = {
  Input: ['loanFieldSet', 'getExtraCash', 'extraCashFieldSet', 'term', 'insuranceOptionFieldSet'].map(getSelector).join(','),
  Output: ['totalLoanAmount, .form-output-wrapper', 'exploreRate', 'rate'].map(getSelector).join(','),
  buttons: ['summary', 'startLoanApplication'].map(getSelector),
};

const fieldsets = {
  insuranceOptionFieldSet: ['insuranceOption'].map(getSelector),
  loanFieldSet: ['loanType', 'loanAmount'].map(getSelector),
  extraCashFieldSet: ['extraCashHeading', 'extraCash'].map(getSelector),
};

function decorateComponents(formTag) {
  decorateTooltips(formTag);
  decorateSelect(formTag);
  formTag.querySelectorAll('.form-range-wrapper').forEach((block) => {
    decorateRange(block);
  });

  const termField = formTag.querySelector('.form-term');
  decorateTermField(termField);
}

export default async function decorateRepaymentsCalculator(formTag, { form, fragments }) {
  decorateLayout(formTag, groups);
  decorateFieldsets(formTag, fieldsets);
  decorateRepeatable(formTag, {
    extraCashFieldSet: {
      add: 'Get extra cash',
    },
  });
  decorateComponents(formTag);

  decorateValidations(formTag);
  formTag.addEventListener('item:add', (event) => {
    const { id } = event.detail.item;
    const fieldset = document.getElementById(id);
    decorateSelect(fieldset);
    decorateTooltips(fieldset);
  });
  applyRuleEngine(form, fragments, formTag);
}
