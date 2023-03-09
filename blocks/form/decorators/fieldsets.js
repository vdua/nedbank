export default function decorateFieldsets(form, fieldsets) {
  form.querySelectorAll('fieldset').forEach((fieldsetEl) => {
    const fields = form.querySelectorAll(fieldsets[fieldsetEl.name]);
    if (fields.length) {
      fields.forEach((f) => f.setAttribute('data-fieldset', fieldsetEl.id));
      fieldsetEl.append(...fields);
    } else {
      console.log(`unable to decorate fieldset.No field ${fieldsets[fieldsetEl.name]} found`); // eslint-disable-line no-console
    }
  });
}
