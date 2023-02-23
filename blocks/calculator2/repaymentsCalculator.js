import {
  termField,
  loanAmountField,
  insuranceOptions,
  exampleRate,
  exploreRateToggle,
  emiField,
  totalField,
  rateField,
  summaryButton,
  decorateSummary,
  formatFns,
} from './fields.js';

function findMainButton(block) {
  return block.querySelector('.button-container');
}
const summaryData = {};

function handleModal(block, form, btn) {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modal-overlay';

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    block.classList.add('show');
    document.body.append(modalOverlay);
    document.body.classList.add('modal-show');
    [...block.querySelectorAll('[data-form-placeholder]')].forEach((span) => {
      const fieldName = span.getAttribute('data-form-placeholder');
      if (fieldName && summaryData[fieldName]) {
        span.innerText = summaryData[fieldName];
      }
    });
  });

  block.addEventListener('click', () => {
    block.classList.remove('show');
    modalOverlay.remove();
    document.body.classList.remove('modal-show');
  });
}

const constants = {
  maxncafee: 1050,
  vatratecal: 0.15,
  basencafee: 1000,
  partncalfee: 165,
  percent1ncafee: 0.1,
  percent2ncafee: 0.15,
  monthlyServiceFeeExclVATcal: 60,
  insuranceMultipliercal: 0.0035,
  monthwise: 1200,
  part2: 69,
};

function round(num, digits) {
  const precision = 10 ** digits;
  return Math.round(num * precision) / precision;
}

function runFormula(form, field) {
  if (field && field.name === 'exploreRate') {
    document.querySelector('.form-rate').setAttribute('data-hidden', field.checked);
  } else {
    const loanAmount = +form.elements.loanAmount.value;
    const insuranceOption = form.elements.insuranceOption.value;
    const rate = +form.elements.rate.value;
    const term = +form.elements.term.value || 0.5;
    const {
      partncalfee, basencafee, percent1ncafee, percent2ncafee, maxncafee, vatratecal,
      insuranceMultipliercal, monthwise, part2,
    } = constants;
    const minVal = Math.min(
      partncalfee + ((loanAmount - basencafee) * percent1ncafee),
      loanAmount * percent2ncafee,
      maxncafee,
    );
    const part1 = loanAmount + minVal * (1 + vatratecal);
    const insuranceAmount = round((insuranceMultipliercal * part1), 2);
    const insuranceValue = insuranceOption === 'yes' ? insuranceAmount : 0;
    const actualRate = rate * 100;
    const t0 = part1 + (actualRate / monthwise) * part1 + part2;
    const t1 = (1 + actualRate / monthwise) ** (-12 * term);
    const t3 = ((actualRate / monthwise) * t0) / (1 - t1);
    const emi = round(insuranceValue + part2 + t3, 2);
    const total = round(12 * term * emi, 2);
    form.elements.emi.value = formatFns.currency(emi);
    form.elements.total.value = formatFns.currency(total);
    form.elements.rateDisplay.value = formatFns['%'](rate);
    summaryData.loanAmount = formatFns.currency(loanAmount);
    summaryData.term = formatFns.year(term);
    summaryData.total = formatFns.currency(total);
    summaryData.emi = formatFns.currency(emi);
    summaryData.extra = formatFns.currency(total - loanAmount);
  }
}

function handleFormInput(form) {
  form.addEventListener('input', (e) => {
    runFormula(form, e.target);
  });
}

export default function decorateCalculator(block, config) {
  const form = document.createElement('form');
  const Input = document.createElement('div');
  Input.className = 'Input';
  const inputFields = [
    loanAmountField({
      label: 'How much do you need to borrow?',
      name: 'loanAmount',
    }),
    termField(),
    insuranceOptions(),
  ];
  Input.append(...inputFields);
  const Output = document.createElement('div');
  Output.append(emiField(), totalField(), exampleRate(), exploreRateToggle(), rateField());
  Output.className = 'Output';
  const Toolbar = document.createElement('div');
  Toolbar.className = 'toolbar';
  const summaryBtn = summaryButton(config.summarybutton.trim());
  const summarySection = document.querySelector(`[data-id= "${config.summary}"]`);
  decorateSummary(summarySection);
  Toolbar.append(summaryBtn, findMainButton(block));
  form.append(Input, Output, Toolbar);
  runFormula(form);
  handleModal(summarySection, form, summaryBtn.querySelector('a'));
  handleFormInput(form);
  return form;
}
