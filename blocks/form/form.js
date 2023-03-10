import {
  readBlockConfig,
} from '../../scripts/scripts.js';

function stripTags(input, allowd) {
  const allowed = ((`${allowd || ''}`)
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const comments = /<!--[\s\S]*?-->/gi;
  return input.replace(comments, '')
    .replace(tags, ($0, $1) => (allowed.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : ''));
}

export function sanitizeHTML(input) {
  return stripTags(input, '<a>');
}

const formatFns = await (async function imports() {
  try {
    const formatters = await import('./formatting.js');
    return formatters.default;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Formatting library not found. Formatting will not be supported');
  }
  return {};
}());

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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

async function handleSubmit(form, redirectTo) {
  if (form.getAttribute('data-submitting') !== 'true') {
    form.setAttribute('data-submitting', 'true');
    await submitForm(form);
    const redirectLocation = redirectTo || form.getAttribute('data-redirect');
    window.location.href = redirectLocation;
  }
}

function setPlaceholder(element, fd) {
  if (fd.Placeholder) {
    element.setAttribute('placeholder', fd.Placeholder);
  }
}

function setNumberConstraints(element, fd) {
  if (fd.Max) {
    element.max = fd.Max;
  }
  if (fd.Min) {
    element.min = fd.Min;
  }
  if (fd.Step) {
    element.step = fd.Step || 1;
  }
}
function createLabel(fd, tagName = 'label') {
  const label = document.createElement(tagName);
  if (tagName === 'label') {
    label.setAttribute('for', fd.Id);
  }
  label.className = 'field-label';
  label.innerHTML = sanitizeHTML(fd.Label) || '';
  if (fd.Tooltip) {
    label.title = fd.Tooltip;
  }
  return label;
}

function createLegend(fd) {
  return createLabel(fd, 'legend');
}

export function createHelpText(fd) {
  const div = document.createElement('div');
  div.className = 'field-description';
  div.setAttribute('aria-live', 'polite');
  div.innerText = fd.Description;
  div.id = `${fd.Id}-description`;
  return div;
}

function createFieldWrapper(fd, tagName = 'div') {
  const fieldWrapper = document.createElement(tagName);
  const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
  const fieldId = `form-${fd.Type}-wrapper${nameStyle}`;
  fieldWrapper.className = fieldId;
  fieldWrapper.classList.add('field-wrapper');
  fieldWrapper.append(createLabel(fd));
  if (fd.Hidden?.toLowerCase() === 'true') {
    fieldWrapper.dataset.hidden = 'true';
  }
  return fieldWrapper;
}

function createButton(fd) {
  const wrapper = createFieldWrapper(fd);
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.type = fd.Type;
  button.classList.add('button');
  button.setAttribute('data-redirect', fd.Extra);
  button.id = fd.Id;
  button.name = fd.Name;
  wrapper.replaceChildren(button);
  return wrapper;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  setPlaceholder(input, fd);
  setNumberConstraints(input, fd);
  return input;
}

const withFieldWrapper = (element) => (fd) => {
  const wrapper = createFieldWrapper(fd);
  wrapper.append(element(fd));
  return wrapper;
};

const createTextArea = withFieldWrapper((fd) => {
  const input = document.createElement('textarea');
  setPlaceholder(input, fd);
  return input;
});

const createSelect = withFieldWrapper((fd) => {
  const select = document.createElement('select');
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
  return select;
});

function createRadio(fd) {
  const wrapper = createFieldWrapper(fd);
  const radio = createInput(fd);
  radio.checked = fd.Selected?.toLowerCase() === 'true';
  wrapper.insertAdjacentElement('afterbegin', radio);
  return wrapper;
}

const createOutput = withFieldWrapper((fd) => {
  const output = document.createElement('output');
  output.name = fd.Name;
  output.id = fd.Id;
  const displayFormat = fd['Display Format'];
  if (displayFormat) {
    output.dataset.displayFormat = displayFormat;
  }
  const formatFn = formatFns[displayFormat] || ((x) => x);
  output.innerText = formatFn(fd.Value);
  output.dataset.value = fd.Value;
  return output;
});

const currencySymbol = 'R';
function createCurrency(fd) {
  const wrapper = createFieldWrapper(fd);
  const widgetWrapper = document.createElement('div');
  widgetWrapper.className = 'currency-input-wrapper';
  const currencyEl = document.createElement('div');
  currencyEl.className = 'currency-symbol';
  currencyEl.innerText = currencySymbol; // todo :read from css
  widgetWrapper.append(currencyEl);
  const input = createInput({
    ...fd,
    Type: 'number',
  });
  input.dataset.displayFormat = 'currency';
  input.dataset.type = 'currency';
  widgetWrapper.append(input);
  wrapper.append(widgetWrapper);
  return wrapper;
}

function createHidden() {
  const input = document.createElement('input');
  input.type = 'hidden';
  return input;
}

function createFieldset(fd) {
  const wrapper = createFieldWrapper(fd, 'fieldset');
  wrapper.name = fd.Name;
  wrapper.id = fd.Id;
  wrapper.replaceChildren(createLegend(fd));
  if (fd.Repeatable && fd.Repeatable.toLowerCase() === 'true') {
    wrapper.dataset.repeatable = true;
    setNumberConstraints(wrapper, fd);
  }
  return wrapper;
}

export const nameToId = (function getId() {
  const ids = {};
  return (name) => {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  };
}());

const fieldRenderers = {
  radio: createRadio,
  checkbox: createRadio,
  submit: createButton,
  'text-area': createTextArea,
  select: createSelect,
  button: createButton,
  output: createOutput,
  hidden: createHidden,
  currency: createCurrency,
  fieldset: createFieldset,
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
  if (fd.Description) {
    field.append(createHelpText(fd));
  }
  return field;
}

async function fetchData(url) {
  const resp = await fetch(url);
  const json = await resp.json();
  return json.data.map((fd) => ({
    ...fd,
    Id: fd.Id || nameToId(fd.Name),
  }));
}

export function getRules(fd) {
  const entries = [
    ['Value', fd?.['Value Expression']],
    ['Hidden', fd?.['Hidden Expression']],
  ];
  return entries.filter((e) => e[1]).map(([prop, expression]) => ({
    prop,
    expression,
  }));
}

function getFragmentName(r) {
  const SHEET_NAME_REGEX = /('.{1,31}'|[\w.]{1,31}?)!([$]?[A-Z]+[$]?([0-9]+))/;
  const sheetName = r.expression.match(SHEET_NAME_REGEX)?.[1]?.replace(/^'|'$/g, '');
  return sheetName;
}

function extractFragments(data) {
  return new Set(data
    .map((fd) => getRules(fd))
    .filter((x) => x.length)
    .flatMap((rules) => rules.map(getFragmentName).filter((x) => x)));
}

async function fetchForm(formURL, searchParam) {
  // get the main form
  const jsonData = await fetchData(formURL + searchParam);
  const fragments = [...extractFragments(jsonData)];

  const fragmentData = (await Promise.all(fragments.map(async (fragName) => {
    const paramName = fragName.replace(/^helix-/, '');
    return [fragName, await fetchForm(formURL, `?sheet=${paramName}`)];
  }))).reduce((finalData, [fragmentName, fragment]) => ({
    [fragmentName]: fragment.formData,
    ...fragment.fragmentsData,
    ...finalData,
  }), {});

  return {
    formData: jsonData,
    fragmentsData: fragmentData,
  };
}

function mergeFormWithFragments(form, fragments) {
  return [...form, ...(Object.values(fragments).flat())];
}

async function createForm(formURL, config) {
  const { pathname, search } = new URL(formURL);
  const { formData, fragmentsData } = await fetchForm(pathname, search || '');
  const data = mergeFormWithFragments(formData, fragmentsData);
  const form = document.createElement('form');
  const id = config?.id?.trim();
  form.id = id;
  const fields = data
    .map((fd) => ({ fd, el: renderField(fd) }));
  fields.forEach(({ fd, el }) => {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input,text-area,select');
    if (fd.Mandatory && fd.Mandatory.toLowerCase() === 'true') {
      input.setAttribute('required', 'required');
    }
    if (input) {
      input.id = fd.Id;
      input.name = fd.Name;
      input.value = fd.Value;
      if (fd.Description) {
        input.setAttribute('aria-describedby', `${fd.Id}-description`);
        input.dataset.description = fd.Description;
      }
      if (fd.Disabled === 'true') {
        input.setAttribute('disabled', 'disabled');
      }
      const displayFormat = fd['Display Format'];
      if (displayFormat) {
        input.dataset.displayFormat = displayFormat;
      }
    }
  });
  form.append(...fields.map(({ el }) => el));
  try {
    const formDecorator = await import('./decorators/index.js');
    formDecorator.default(form, { form: formData, fragments: fragmentsData }, config);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('no custom decorator found. default renditions will be used.');
  }
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.setAttribute('disabled', '');
    handleSubmit(form, e.submitter.getAttribute('data-redirect'));
  });
  return form;
}

export default async function decorate(block) {
  const anchor = block.querySelector('a');
  const url = anchor.href;
  const isForm = /\.json(?:\?sheet=.+)?$/.test(url);
  if (isForm) {
    const config = readBlockConfig(block);
    block.replaceChildren(await createForm(url, config));
  }
}
