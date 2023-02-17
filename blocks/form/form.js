import formatFns from './formatting.js';
// todo - read this from form id
import decorateForm from './decorators/repayments-calculator.js';

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
  label.textContent = fd.Label || '';
  if (fd.Tooltip) {
    label.title = fd.Tooltip;
  }
  return label;
}

function createLegend(fd) {
  return createLabel(fd, 'legend');
}

function createHelpText(fd) {
  const div = document.createElement('div');
  div.className = 'field-description';
  div.setAttribute('aria-live', 'polite');
  div.innerText = fd.Description;
  div.id = `${fd.Id}-description`;
  return div;
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

function createButton(fd) {
  const wrapper = createFieldWrapper(fd);
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  button.type = fd.Type;
  button.id = fd.Id;
  wrapper.replaceChildren(button);
  return wrapper;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  const displayFormat = fd['Display Format'];
  if (displayFormat) {
    input.dataset.displayFormat = displayFormat;
  }
  input.id = fd.Id;
  if (fd.Mandatory === 'TRUE') {
    input.setAttribute('required', 'required');
  }
  input.name = fd.Name;
  setPlaceholder(input, fd);
  setNumberConstraints(input, fd);
  if (fd.Description) {
    input.setAttribute('aria-describedby', `${fd.Id}-description`);
  }
  input.value = fd.Value;
  return input;
}

function createRadio(fd) {
  const wrapper = createFieldWrapper(fd);
  wrapper.insertAdjacentElement('afterbegin', createInput(fd));
  return wrapper;
}

function createOutput(fd) {
  const wrapper = createFieldWrapper(fd);
  const output = document.createElement('output');
  output.name = fd.Name;
  const displayFormat = fd['Display Format'];
  if (displayFormat) {
    output.dataset.displayFormat = displayFormat;
  }
  const formatFn = formatFns[displayFormat] || formatFns.identity;
  output.innerText = formatFn(fd.Value);
  wrapper.append(output);
  return wrapper;
}

const currencySymbol = 'R';
function createCurrency(fd) {
  const wrapper = createFieldWrapper(fd);
  const widgetWrapper = document.createElement('div');
  widgetWrapper.className = 'currency-input-wrapper';
  const currencyEl = document.createElement('div');
  currencyEl.className = 'currency-symbol';
  currencyEl.innerText = currencySymbol; // todo :read from css
  widgetWrapper.append(currencyEl);
  widgetWrapper.append(createInput({
    ...fd,
    Type: 'number',
  }));
  wrapper.append(widgetWrapper);
  return wrapper;
}

function createHidden(fd) {
  const element = document.createElement('input');
  element.type = 'hidden';
  element.id = fd.Id;
  element.name = fd.Name;
  element.value = fd.Value;
  return element;
}

function createFieldset(fd) {
  const wrapper = createFieldWrapper(fd, 'fieldset');
  wrapper.name = fd.Name;
  wrapper.replaceChildren(createLegend(fd));
  return wrapper;
}

function idGenerator() {
  const ids = {};
  return (name) => {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  };
}

const fieldRenderers = {
  radio: createRadio,
  checkbox: createRadio,
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

async function fetchData(formURL, getId) {
  const { pathname, search } = new URL(formURL);
  const resp = await fetch(pathname + search);
  const json = await resp.json();
  return json.data.map((fd) => ({
    ...fd,
    Id: fd.Id || getId(fd.Name),
  }));
}

export function getRules(fd) {
  const entries = [
    ['Value', fd?.['Value Expression']],
    ['Hidden', fd?.['Hidden Expression']],
    ['Label', fd?.['Label Expression']],
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

async function fetchForm(formURL, getId) {
  // get the main form
  const jsonData = await fetchData(formURL, getId);
  const fragments = [...extractFragments(jsonData)];

  const fragmentData = (await Promise.all(fragments.map(async (fragName) => {
    const paramName = fragName.replace(/^helix-/, '');
    const url = `${formURL}?sheet=${paramName}`;
    return [fragName, await fetchForm(url, getId)];
  }))).reduce((finalData, [fragmentName, fragment]) => ({
    [fragmentName]: fragment.form,
    ...fragment.fragments,
    ...finalData,
  }), {});

  return {
    form: jsonData,
    fragments: fragmentData,
  };
}

function mergeFormWithFragments(form, fragments) {
  return [...form, ...(Object.values(fragments).flat())];
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const { form, fragments } = await fetchForm(formURL, idGenerator());
  const data = mergeFormWithFragments(form, fragments);
  const formTag = document.createElement('form');
  const fields = data.map((fd) => renderField(fd));
  formTag.append(...fields);
  await decorateForm(formTag);
  // eslint-disable-next-line prefer-destructuring
  formTag.dataset.action = pathname.split('.json')[0];
  return formTag;
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
