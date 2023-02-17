export default function decorateFieldsets(fieldsets, form) {
  form.querySelectorAll('fieldset').forEach((fieldsetEl) => {
    const fields = form.querySelectorAll(fieldsets[fieldsetEl.name]);
    if (fields.length) {
      fields[0].insertAdjacentElement('beforebegin', fieldsetEl);
      fieldsetEl.append(...fields);
    } else {
      console.log(`unable to decorate fieldset. No field ${fieldsets[fieldsetEl.name]} found`);
    }
  });
}
