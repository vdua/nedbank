import formatFns from '../formatting.js';

function render(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children[0];
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

function getFormattedValue(input) {
  const format = input.dataset.displayFormat;
  if (input.tagName === 'OUTPUT') {
    return input.value;
  }
  const formatFn = formatFns[format] || ((x) => x);
  return formatFn(input.value);
}

function handleModal(block, form) {
  const btn = form.querySelector('.form-summary button');
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modal-overlay';

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    block.classList.add('show');
    document.body.append(modalOverlay);
    document.body.classList.add('modal-show');
    [...block.querySelectorAll('[data-form-placeholder]')].forEach((span) => {
      const fieldName = span.getAttribute('data-form-placeholder');
      if (fieldName && form.elements[fieldName]) {
        span.innerText = getFormattedValue(form.elements[fieldName]);
      }
    });
  });

  block.addEventListener('click', () => {
    block.classList.remove('show');
    modalOverlay.remove();
    document.body.classList.remove('modal-show');
  });
}

export default function decorateSummary(form, block) {
  decorateModal(block);
  [...block.querySelectorAll('em')].forEach((em) => {
    const fieldName = em.innerText.trim().match(/^\{([^}]+)\}/)?.[1];
    const el = document.createElement('span');
    el.innerText = em.innerText;
    el.setAttribute('data-form-placeholder', fieldName);
    em.replaceWith(el);
  });
  handleModal(block, form);
}
