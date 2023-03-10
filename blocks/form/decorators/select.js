export default function decorateSelect(el) {
  el.querySelectorAll('.form-select-wrapper').forEach((wrapper) => {
    const selectTag = wrapper.querySelector('select');
    const options = selectTag.querySelectorAll('option');
    const display = document.createElement('div');
    let selectedItems = [];
    display.className = 'form-select-display';
    display.textContent = options[0].textContent;
    const dialog = document.createElement('div');
    dialog.className = 'form-select-dialog';
    const toggle = (expanded, ev, stopPropagation = false) => {
      wrapper[expanded ? 'setAttribute' : 'removeAttribute']('expanded', '');
      if (ev && stopPropagation) ev.stopPropagation();
    };
    const select = (divOption, option) => {
      selectedItems.forEach((item) => item.removeAttribute('selected')); // @todo handle multiple selection
      [divOption, option].forEach((item) => item.setAttribute('selected', ''));
      display.textContent = divOption.textContent;
      selectTag.value = divOption.getAttribute('value');
      selectedItems = [divOption, option];
    };
    options.forEach((option) => {
      const divOption = document.createElement('div');
      divOption.setAttribute('value', option.value);
      divOption.textContent = option.textContent;
      divOption.addEventListener('click', (ev) => {
        select(divOption, option);
        toggle(false, ev, true);
      });
      if (option.selected) select(divOption, option);
      dialog.append(divOption);
    });
    document.addEventListener('click', (ev) => {
      toggle(false, ev, wrapper.hasAttribute('expanded'));
    });
    display.addEventListener('click', (ev) => {
      toggle(!wrapper.hasAttribute('expanded'), ev, true);
    });
    selectTag.insertAdjacentElement('afterend', display);
    display.insertAdjacentElement('afterend', dialog);
  });
}
