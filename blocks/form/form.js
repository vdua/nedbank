function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function createFieldWrapper(fd, tagName = 'div') {
  const fieldWrapper = document.createElement(tagName);
  const style = fd.Style ? ` form-${fd.Style}` : '';
  const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
  const fieldId = `form-${fd.Type}-wrapper${style}${nameStyle}`;
  fieldWrapper.className = fieldId;
  fieldWrapper.classList.add('field-wrapper');
  fieldWrapper.append(createLabel(fd));
  return fieldWrapper;
}

function createSelect(fd) {
  const wrapper = createFieldWrapper(fd);
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  wrapper.append(select);
  return wrapper;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

function createButton(fd) {
  const wrapper = createFieldWrapper(fd);
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        await submitForm(form);
        const redirectTo = fd.Extra;
        window.location.href = redirectTo;
      }
    });
  }
  wrapper.replaceChildren(button);
  return wrapper;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const wrapper = createFieldWrapper(fd);
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  wrapper.append(input);
  return wrapper;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function createRadio(fd) {
  const wrapper = createFieldWrapper(fd);
  wrapper.insertAdjacentElement('afterbegin', createInput(fd));
  return wrapper;
}

const fieldRenderers = {
  radio: createRadio,
  checkbox: createRadio,
  submit: createButton,
  heading: createHeading,
  'text-area': createTextArea,
  select: createSelect,
};

function renderField(fd) {
  const renderer = fieldRenderers[fd.Type];
  let field;
  if (typeof renderer === 'function') {
    field = renderer(fd);
  } else {
    field = createFieldWrapper(fd);
    field.append(createInput(fd));
  }
  return field;
}

async function fetchData(url) {
  const resp = await fetch(url);
  const json = await resp.json();
  return json;
}

async function fetchForm(pathname) {
  // get the main form
  const jsonData = await fetchData(pathname);
  return jsonData.data;
}

async function enableRuleEngine(data, form) {
  const rules = data.filter((fd) => fd.Rules).flatMap((fd) => {
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    try {
      return { fieldId, rule: JSON.parse(fd.Rules) };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      return undefined;
    }
  }).filter((x) => x);
  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const data = await fetchForm(pathname);
  const formTag = document.createElement('form');
  const fields = data.map((fd) => renderField(fd));
  formTag.append(...fields);
  // eslint-disable-next-line prefer-destructuring
  formTag.dataset.action = pathname.split('.json')[0];
  enableRuleEngine(data, formTag);

  return formTag;
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
