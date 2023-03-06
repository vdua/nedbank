import decorateRange from './range.js';
import decorateTooltips from './tooltip.js';
import decorateLayout from './layout.js';
import decorateFieldsets from './fieldsets.js';
import decorateSelect from './select.js';
import { applyRuleEngine } from '../rules/index.js';

function getSelector(fieldName) {
  let selector = fieldName;
  if (!fieldName.startsWith('.')) {
    selector = `.form-${fieldName}`;
  }
  return selector;
}

// @todo read groups and fieldsets from excel
const groups = {
  repayments: {
    Input: ['totalLoanAmount', 'term', 'insuranceOptionFieldSet'].map(getSelector).join(','),
    Output: ['.form-output-wrapper', 'exploreRate', 'rate'].map(getSelector).join(','),
    buttons: '.form-button-wrapper',
  },
  loanConsolidate: {
    Input: ['loanFieldSet', 'extraCashFieldSet', 'term', 'insuranceOptionFieldSet'].map(getSelector).join(','),
    Output: ['total, .form-output-wrapper', 'exploreRate', 'rate'].map(getSelector).join(','),
    buttons: ['seeLoanDetails', 'startLoanApplication'].map(getSelector),
  },
};

const fieldsets = {
  insuranceOptionFieldSet: ['insuranceOption'].map(getSelector),
  loanFieldSet: ['loanType', 'loanAmount'].map(getSelector),
  extraCashFieldSet: ['extraCashHeading', 'extraCash'].map(getSelector),
};

function decorateComponents(el) {
  /** add custom decorate */
  decorateRange(el);
  decorateTooltips(el);
  decorateSelect(el);
}

function addListeners(formTag) {
  formTag.addEventListener('form-fieldset-item:added', (event) => {
    decorateComponents(event.detail.item);
  });
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

export default async function decorateForm(formTag, { form, fragments }) {
  decorateFieldsets(formTag, fieldsets);
  decorateLayout(formTag, groups[formTag.name] || {});
  decorateComponents(formTag);
  addListeners(formTag);
  applyRuleEngine(form, fragments, formTag);
}
