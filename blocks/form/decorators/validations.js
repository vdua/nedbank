import { createHelpText } from '../form.js';

export default function decorateValidations(form) {
  form.addEventListener('input', (e) => {
    const input = e.target;
    const wrapper = input.closest('.field-wrapper');
    let helpTextDiv = wrapper.querySelector('.field-description');
    input.checkValidity();
    const { valid } = input.validity;
    const prevValid = !(input.getAttribute('aria-invalid') || false);
    if (valid !== prevValid) {
      if (!valid) {
        if (!helpTextDiv) {
          helpTextDiv = createHelpText({
            Id: e.id,
            Description: '',
          });
        }
        input.setAttribute('aria-invalid', true);
        wrapper.setAttribute('data-invalid', true);
        helpTextDiv.innerText = input.validationMessage;
      } else if (helpTextDiv) {
        helpTextDiv.innerText = input.dataset.description || '';
        input.removeAttribute('aria-invalid');
        wrapper.removeAttribute('data-invalid');
      }
    }
  });
}
