import formatFns from './formatting.js';
import decorateForm from './decorators/calculator.js'; // todo - read this from form id
import { readBlockConfig } from '../../scripts/scripts.js';

const getId = (function () {
  const ids = {};
  return (name) => {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  };
}());

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
  if (fd.Repeatable === 'true') {
    wrapper.setAttribute('repeatable', '');
    setNumberConstraints(wrapper, fd);
  }
  return wrapper;
}

function createSelect(fd) {
  const wrapper = createFieldWrapper(fd);
  const select = document.createElement('select');
  select.name = fd.Name;
  const options = fd.Options.split(',');
  if (fd.Placeholder) {
    options.unshift(fd.Placeholder);
  }
  options.forEach((o) => {
    const option = document.createElement('option');
    const optionText = o.trim();
    option.textContent = optionText;
    option.value = optionText;
    option.selected = fd.Value.trim() === optionText;
    select.append(option);
  });
  wrapper.append(select);
  return wrapper;
}

function createParagraph(fd) {
  const p = document.createElement('p');
  p.className = `form-paragraph${fd.Name ? ` form-${fd.Name}` : ''}`;
  p.textContent = fd.Value;
  return p;
}

function createFormTag(config) {
  const form = document.createElement('form');
  Object.entries(config).forEach(([n, v]) => form.setAttribute(n, v || ''));
  return form;
}

const fieldRenderers = {
  radio: createRadio,
  checkbox: createRadio,
  button: createButton,
  output: createOutput,
  hidden: createHidden,
  currency: createCurrency,
  fieldset: createFieldset,
  select: createSelect,
  paragraph: createParagraph,
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

async function fetchData(formURL) {
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

async function fetchForm(formURL) {
  const { origin, pathname } = new URL(formURL);
  const jsonData = await fetchData(formURL); // get the main form
  const fragments = [...extractFragments(jsonData)];

  const fragmentData = (await Promise.all(fragments.map(async (fragName) => {
    const paramName = fragName.replace(/^helix-/, '');
    const url = `${origin}${pathname}?sheet=${paramName}`;
    return [fragName, await fetchForm(url)];
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

async function createForm(formURL, config) {
  const { pathname } = new URL(formURL);
  const { form, fragments } = await fetchForm(formURL);
  const data = mergeFormWithFragments(form, fragments);
  const formTag = createFormTag(config);
  const fields = data.map((fd) => renderField(fd));
  formTag.append(...fields);
  await decorateForm(formTag, { form, fragments });
  // eslint-disable-next-line prefer-destructuring
  formTag.dataset.action = pathname.split('.json')[0];
  return formTag;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const form = block.querySelector('a[href*=".json"]');
  while (block.children.length > 1) block.removeChild(block.lastElementChild); // remove config
  if (form) {
    block.firstElementChild.replaceWith(await createForm(form.href, config));
  }
}
