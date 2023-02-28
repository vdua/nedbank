import formatFns from '../formatting.js';

async function updateBubble(input, element, values) {
  const step = input.step || 1;
  const max = input.max || 0;
  const min = input.min || 0;
  const value = input.value || 0;
  const steps = {
    '--total-steps': Math.ceil((max - min) / step),
    '--current-steps': Math.ceil((value - min) / step),
  };
  const style = Object.entries(steps).map(([varName, varValue]) => `${varName}:${varValue}`).join(';');
  element.setAttribute('style', style);
  const bubble = element.querySelector('.range-bubble');
  if (values) {
    bubble.innerText = values[input.value];
  } else {
    const format = input.dataset.displayFormat;
    const formatFn = formatFns[format] || ((x) => x);
    bubble.innerText = formatFn(value);
  }
}

export function createRange(input, values) {
  const clonedInput = input.cloneNode();
  clonedInput.type = 'range';
  if (values) {
    clonedInput.min = 0;
    clonedInput.max = values.length - 1;
    clonedInput.step = 1;
  }
  const div = document.createElement('div');
  div.className = 'range-widget-wrapper';

  clonedInput.addEventListener('input', (e) => {
    updateBubble(e.target, div, values);
  });
  const format = clonedInput.dataset.displayFormat;
  const hover = document.createElement('span');
  hover.className = 'range-bubble';
  const rangeMinEl = document.createElement('span');
  rangeMinEl.className = 'range-min';
  const rangeMaxEl = document.createElement('span');
  rangeMaxEl.className = 'range-max';
  div.appendChild(hover);
  div.appendChild(clonedInput);
  div.appendChild(rangeMinEl);
  div.appendChild(rangeMaxEl);
  if (values) {
    rangeMinEl.innerText = values[clonedInput.min];
    rangeMaxEl.innerText = values[clonedInput.max];
  } else {
    const formatFn = formatFns[format] || ((x) => x);
    rangeMinEl.innerText = formatFn(clonedInput.min);
    rangeMaxEl.innerText = formatFn(clonedInput.max);
  }
  updateBubble(input, div, values);
  return div;
}

export default function decorateRange(block) {
  const input = block.querySelector('input');
  const rangeDiv = createRange(input);
  block.replaceChild(rangeDiv, input);
}
