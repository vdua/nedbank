function update(fieldset) {
  const queue = [fieldset];
  for (let i = 0; i < queue.length; i += 1) {
    [...queue[i].children].filter((c) => c.tagName === 'FIELDSET').forEach((item, index) => {
      const legend = item.querySelector('legend');
      legend.childNodes[0].data = legend.dataset.textTemplate.replace('#', index + 1);
      item.name = `${queue[i].name}_${index + 1}`;
      [...item.elements].filter((el) => !!el.name).forEach((el) => {
        el.dataset.name = el.dataset.name || el.name;
        el.name = `${el.dataset.name}_${index + 1}`;
        el.id = el.name; // @todo use getId(el.dataset.name) of form.js
        if (el.tagName === 'FIELDSET' && el.dataset.repeatable === 'true') {
          queue.push(el);
        } else if (el.tagName !== 'FIELDSET') {
          const label = el.closest(`.form-${el.dataset.name}`)?.querySelector('label');
          if (label?.dataset.for === el.dataset.name || label?.htmlFor === el.dataset.name) {
            label.dataset.for = label.dataset.for || el.dataset.name;
            label.htmlFor = el.id;
          }
        }
      });
      queue[i].count = index + 1;
    });
    queue[i].dataset.maxxed = Number(queue[i].max || 999) <= queue[i].count ? 'true' : 'false';
  }
}

function createButton(fd) {
  const button = document.createElement('button');
  button.className = `${fd.Name}-${fd.Label} fieldset-${fd.Label}`;
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
  };
  return button;
}

function createItem(fieldset, removable = true) {
  const item = document.createElement('fieldset');
  item.innerHTML = fieldset.elements['#template'];
  if (removable) item.querySelector('legend').append(createButton({ Label: 'Remove', Name: fieldset.name }));
  return item;
}

export default function decorateFieldsets(form, fieldsets) {
  form.querySelectorAll('fieldset').forEach((fieldsetEl) => {
    const fields = form.querySelectorAll(fieldsets[fieldsetEl.name]);
    if (fields.length) {
      if (fieldsetEl.dataset.repeatable === 'true') {
        const legend = fieldsetEl.querySelector('legend');
        legend.dataset.textTemplate = legend.textContent;
        fieldsetEl.elements['#template'] = [...fields].reduce((html, field) => html + field.outerHTML, legend.outerHTML);
        fieldsetEl.elements['#add'] = createButton({ Label: 'Add', Name: fieldsetEl.name });
        legend.replaceWith(fieldsetEl.elements['#add']);
        for (let i = 1; i <= Number(fieldsetEl.min || 0) || 0; i += 1) {
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
