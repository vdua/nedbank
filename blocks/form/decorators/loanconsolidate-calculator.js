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

function addListeners(formTag) {
  // formTag.addEventListener('form-fieldset-item:added', (event) => {
  //   decorateComponents(event.detail.item);
  // });
  if (formTag.name === 'loanConsolidate') { // @todo implement rules for repeatable using excel formulas
    formTag.querySelectorAll('fieldset[repeatable]').forEach((element) => {
      ['form-fieldset-item:added', 'form-fieldset-item:removed', 'input'].forEach((eventName) => {
        element.addEventListener(eventName, () => {
          const total = formTag.querySelector('input[name=totalLoanAmount]');
          const deps = Array.from(formTag.querySelectorAll('[data-name=loanAmount], [data-name=extraCash]'));
          const newValue = deps.reduce((a, c) => a + Number(c.value || 0), 0);
          if (total.value !== newValue) {
            total.value = newValue;
            total.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      });
    });
  }
}

export default async function decorateRepaymentsCalculator(formTag, { form, fragments }) {
  decorateTooltips(formTag);
  decorateSelect(formTag);
  formTag.querySelectorAll('.form-range-wrapper').forEach((block) => {
    decorateRange(block);
  });

  const termField = formTag.querySelector('.form-term');
  decorateTermField(termField);

  decorateLayout(formTag, groups);
  decorateFieldsets(formTag, fieldsets);
  decorateRepeatable(formTag);
  decorateValidations(formTag);
  addListeners(formTag);
  applyRuleEngine(form, fragments, formTag);
}
