function render(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children[0];
}

function label($for, text, title) {
  return `<label for="${$for}" class="field-label" title=${title}
  >${text}</label>`;
}

function input(fd) {
  const {
    type, name, id, required, description, min, max, step,
    value, checked,
  } = fd;
  const v = typeof value === 'undefined' ? '' : value;
  const elementId = id || name;
  return `
  <input type=${type}
    id=${elementId}
    ${checked ? 'checked' : ''}
    ${required ? 'required' : ''}
    name=${name}
    ${min ? `min=${min}` : ''}
    ${max ? `max=${max}` : ''}
    ${step ? `step=${step}` : ''}
    value=${v}
    ${description ? `aria-describedby="${elementId}-description"` : ''}
  />`;
}

function fieldWrapper(name, type, children) {
  const nameStyle = name ? ` form-${name}` : '';
  const fieldId = `field-wrapper form-${type}-wrapper${nameStyle}`;
  return `<div class="${fieldId}">
    ${children?.join('')}
  </div>`;
}

function updateBubble(inputEl, element, formatter) {
  const step = inputEl.step || 1;
  const max = inputEl.max || 0;
  const min = inputEl.min || 0;
  const value = inputEl.value || 0;
  const steps = {
    '--total-steps': Math.ceil((max - min) / step),
    '--current-steps': Math.ceil((value - min) / step),
  };
  const style = Object.entries(steps).map(([varName, varValue]) => `${varName}:${varValue}`).join(';');
  element.setAttribute('style', style);
  const bubble = element.querySelector('.range-bubble');
  bubble.innerText = formatter(value);
}

function toPercent(num) {
  return `${(num * 100).toFixed(2).replace(/(\.0*$)|0*$/, '')}%`;
}

export const loanTermOptions = ['6 Months', '1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years'];

function format(num, fmt) {
  if (fmt === '%') {
    return toPercent(num);
  }
  return num;
}

function rangeElement(opts) {
  const fd = {
    name: opts.name,
    min: opts.min,
    max: opts.max,
    step: opts.step,
    type: 'range',
    value: opts.value,
  };
  if (opts.values) {
    fd.min = 0;
    fd.step = 1;
    fd.max = opts.values.length - 1;
  }
  const rangeMin = opts.values?.[0] || format(fd.min, opts.fmt);
  const rangeMax = opts.values ? opts.values[opts.values.length - 1] : format(fd.min, opts.fmt);
  const inputWrapper = `<div class="range-input-wrapper">
    <div class="range-bubble"></div>
    ${input(fd)}
    <div class="range-min">${rangeMin}</div>
    <div class="range-max">${rangeMax}</div>
    `;
  const element = render(inputWrapper);
  const inputEl = element.querySelector('input');
  const formatter = (val) => {
    if (opts.values) {
      return opts.values[val];
    }
    return format(val, opts.format);
  };
  updateBubble(inputEl, element, formatter);
  inputEl.addEventListener('input', (e) => {
    updateBubble(e.target, element, formatter);
  });
  return element;
}

function output(opts) {
  return render(fieldWrapper(
    opts.name,
    'output',
    [
      label(opts.name, opts.label, opts.title),
      `<output name=${opts.name} data-type='${opts.type}'>${opts.value || ''}</output>`],
  ));
}

const insuranceLink = 'https://personal.nedbank.co.za/learn/blog/why-you-must-have-insurance-on-your-personal-loan.html';

export function heading(content) {
  return render(`<h3>${content}</h3>`);
}

export function disclaimer(content) {
  return render(`<p class="disclaimer">${content}</h3>`);
}

export function loanAmountField(opts) {
  const fd = {
    name: opts.name,
    type: 'number',
    value: 2000,
    min: 2000,
    max: 300000,
    description: 'Enter an amount between R2,000 and R300,000',
    required: true,
  };

  const inputWrapper = `<div class= "currency-input-wrapper">
    <div class="currency-symbol">R</div>
    ${input(fd)}
  </div>
  `;
  const html = fieldWrapper(
    opts.name,
    'currency',
    [label(opts.name, opts.label, opts.title), inputWrapper],
  );
  return render(html);
}

export function termField() {
  const html = fieldWrapper(
    'term',
    'range',
    [label('term', 'What’s your preferred repayment term?')],
  );
  const rangeInput = rangeElement({
    name: 'term',
    values: loanTermOptions,
    value: 2,
  });
  const element = render(html);
  element.append(rangeInput);
  return element;
}

export function insuranceOptions() {
  const name = 'insuranceOption';
  const type = 'radio';
  const radios = [
    { v: 'yes', l: `Add R8.07 to the loan amount for <a href="${insuranceLink}">insurance</a>` },
    { v: 'no', l: 'I have my own insurance' },
  ].map(({ v, l }) => {
    const id = `${name}-${v}`;
    return fieldWrapper(
      name,
      type,
      [
        input({
          name,
          id,
          value: v,
          type,
        }),
        label(id, l),
      ],
    );
  });
  const html = `
    <fieldset>
    <legend class="field-label"
      title="This covers your repayments if you lose your income, become disabled or when you die. You need to have insurance for the full loan term.">
      Include insurance in your repayment
    </legend>
      ${radios.join('')}
    </fieldset
  `;
  return render(html);
}

export function emiField() {
  return output({
    label: 'How much you’ll pay back each month',
    title: 'This estimate covers all fees, the loan instalment, the interest charged for the month and your insurance, if you’ve included the monthly premium.',
    name: 'emi',
  });
}

export function totalField() {
  return output({
    label: 'How much you’ll pay back in total ',
    title: 'This estimate covers all fees, the loan instalments, the total interest charged over the full loan term and your insurance, if you’ve included the monthly premium.',
    name: 'total',
  });
}

export function exampleRate() {
  return output({
    label: 'Example interest rate',
    name: 'rateDisplay',
    title: 'After you apply, we’ll make you an offer with a personal interest rate based on your risk profile.',
  });
}

export function exploreRateToggle() {
  const name = 'exploreRate';
  const type = 'checkbox';
  return render(fieldWrapper(
    name,
    type,
    [
      input({
        name, type, checked: true,
      }),
      label(name, 'Explore Rate'),
    ],
  ));
}

export function rateField() {
  const name = 'rate';
  const type = 'range';
  const html = fieldWrapper(name, type);
  const rangeInput = rangeElement({
    name,
    min: 0.1075,
    max: 0.2825,
    step: 0.0025,
    value: 0.1825,
    format: 'percent',
  });
  const element = render(html);
  element.append(rangeInput);
  element.dataset.hidden = true;
  return element;
}

function modal() {
  return `<div class= "modal-dialog">
    <div class="modal-content">
      </div>
    </div>
    `;
}

function decorateModal(block) {
  block.classList.add('modal');
  const modalContent = [...block.children];
  block.append(render(modal()));
  block.querySelector('.modal-content').append(...[...modalContent]);
}

export function decorateSummary(block) {
  decorateModal(block);
  [...block.querySelectorAll('em')].forEach((em) => {
    const fieldName = em.innerText.trim().match(/^\{([^}]+)\}/)?.[1];
    const el = document.createElement('span');
    el.innerText = em.innerText;
    el.setAttribute('data-form-placeholder', fieldName);
    em.replaceWith(el);
  });
}

export function summaryButton(text) {
  const button = render(`
  <div class="button-container">
    <a href="#" class="button summary"/>${text}
    <i class="up-right-arrow"></i>
    </a>
  </div>
  `);
  return button;
}

const decimalSymbol = '.';
const groupingSymbol = ',';
const minFractionDigits = '00';

function toString(num) {
  const [integer, fraction] = num.toString().split('.');
  const formattedInteger = integer.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${groupingSymbol}`);
  let formattedFraction = fraction || minFractionDigits;
  const lengthFraction = formattedFraction.length;
  if (lengthFraction < minFractionDigits) {
    formattedFraction += Array(minFractionDigits - lengthFraction).fill(0).join('');
  }
  return `${formattedInteger}${decimalSymbol}${fraction || '00'}`;
}

function currency(num, currencySymbol = 'R') {
  return `${currencySymbol} ${toString(num)}`;
}

function year(num) {
  if (num < 1) {
    return `${num * 12} months`;
  } if (num === 1) {
    return `${num} year`;
  }
  return `${num} years`;
}

function percent(num) {
  return `${(num * 100).toFixed(2).replace(/(\.0*$)|0*$/, '')}%`;
}

export const formatFns = {
  currency,
  year,
  '%': percent,
};
