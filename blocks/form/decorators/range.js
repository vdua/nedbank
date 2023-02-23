import formatFns from '../formatting.js';

async function updateBubble(input, element) {
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
  const format = input.dataset.displayFormat;
  const formatFn = formatFns[format] || formatFns.identity;
  bubble.innerText = formatFn(value);
}

export default function decorateRange(formTag) {
  formTag.querySelectorAll('.form-range-wrapper').forEach((block) => {
    const input = block.querySelector('input');
    const clonedInput = input.cloneNode();
    const div = document.createElement('div');
    div.className = 'range-widget-wrapper';

    clonedInput.addEventListener('input', (e) => {
      updateBubble(e.target, div);
    });
    const format = clonedInput.dataset.displayFormat;
    const max = clonedInput.max || 0;
    const min = clonedInput.min || 0;
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
    const formatFn = formatFns[format] || formatFns.identity;
    rangeMinEl.innerText = formatFn(min);
    rangeMaxEl.innerText = formatFn(max);
    updateBubble(input, div);
    block.replaceChild(div, input);
  });
}
