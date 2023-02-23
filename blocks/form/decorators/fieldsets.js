function updateLegend(fieldsetItem, i) {
  const legend = fieldsetItem.querySelector('legend');
  legend.childNodes[0].data = legend.dataset.textTemplate.replace('#', i + 1);
}

function update(fieldset) {
  fieldset[Number(fieldset.max || -1) <= fieldset.count ? 'setAttribute' : 'removeAttribute']('maxxed', '');
  const queue = [fieldset];
  for (let i = 0; i < queue.length; i += 1) {
    Array.from(queue[i].children).filter((c) => c.tagName === 'FIELDSET').forEach((item, index) => {
      updateLegend(item, index);
      item.name = `${queue[i].name}_${index + 1}`;
      Array.from(item.elements)
        .filter((c) => ['INPUT', 'SELECT', 'TEXTAREA', 'FIELDSET'].includes(c.tagName)).forEach((el) => {
          el.dataset.name = el.dataset.name || el.name;
          el.name = `${el.dataset.name}_${index + 1}`;
          el.id = el.name; // @todo use getId(el.dataset.name) of form.js
          if (el.tagName === 'FIELDSET' && el.hasAttribute('repeatable')) queue.push(el);
          else if (el.tagName === 'FIELDSET') updateLegend(el, index);
          else el.closest(`.form-${el.dataset.name}`)?.querySelector('label')?.setAttribute('for', el.id);
        });
    });
  }
}

function createButton(fd) {
  const button = document.createElement('button');
  button.className = `${fd.Name}-${fd.Label} fieldset-${fd.Label}`;
  button.innerHTML = `<span>${fd.Label}</span>`;
  button.type = 'button';
  button.onclick = (event) => {
    let item; let fieldset;
    const eventName = event.target.matches('.fieldset-Add') ? 'added' : 'removed';
    if (eventName === 'added') {
      fieldset = event.target.closest('fieldset');
      item = createItem(fieldset); // eslint-disable-line no-use-before-define
      fieldset.insertBefore(item, fieldset.elements['#add']);
    } else {
      item = event.target.closest('fieldset');
      fieldset = item.parentElement.closest('fieldset');
      item.remove();
    }
    fieldset.count += eventName === 'added' ? 1 : -1;
    update(fieldset);
    fieldset.dispatchEvent(new CustomEvent(`form-fieldset-item:${eventName}`, { detail: { item }, bubbles: true }));
    event.stopPropagation();
  };
  return button;
}

function createItem(fieldset, removable = true) {
  const item = document.createElement('fieldset');
  item.append(fieldset.elements['#template'].content.cloneNode(true));
  if (removable) item.querySelector('legend').append(createButton({ Label: 'Remove', Name: fieldset.name }));
  return item;
}

export default function decorateFieldsets(fieldsets, form) {
  form.querySelectorAll('fieldset').forEach((fieldsetEl) => {
    const fields = form.querySelectorAll(fieldsets[fieldsetEl.name]);
    if (fields.length) {
      if (fieldsetEl.hasAttribute('repeatable')) {
        const template = document.createElement('template');
        const legend = fieldsetEl.querySelector('legend');
        legend.dataset.textTemplate = legend.textContent;
        template.content.append(legend, ...fields);
        fieldsetEl.elements['#template'] = template;
        fieldsetEl.elements['#add'] = createButton({ Label: 'Add', Name: fieldsetEl.name });
        fieldsetEl.append(fieldsetEl.elements['#add']);
        fieldsetEl.count = Number(fieldsetEl.min || 0) || 0;
        for (let i = 1; i <= fieldsetEl.count; i += 1) {
          fieldsetEl.insertBefore(createItem(fieldsetEl, false), fieldsetEl.elements['#add']);
        }
        update(fieldsetEl);
      } else {
        fields[0].insertAdjacentElement('beforebegin', fieldsetEl);
        fieldsetEl.append(...fields);
      }
    } else {
      console.log(`unable to decorate fieldset. No field ${fieldsets[fieldsetEl.name]} found`); // eslint-disable-line no-console
    }
  });
}
