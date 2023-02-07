const appendChild = (parent, element) => {
  if (parent && element) {
    parent.appendChild(element);
  }
};

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

function setStringConstraints(element, fd) {
  if (fd.MaxLength) {
    element.maxlength = fd.MaxLength;
  }
  if (fd.MinLength) {
    element.minlength = fd.MinLength;
  }
  if (fd.Pattern) {
    element.pattern = fd.Pattern;
  }
}

function widgetProps(element, fd) {
  element.id = fd.Id;
  if (fd.Mandatory === 'TRUE') {
    element.setAttribute('required', 'required');
  }
  element.name = fd.Name;
  setPlaceholder(element, fd);
  setStringConstraints(element, fd);
  setNumberConstraints(element, fd);
  element.value = fd.Value;
}

function createSelect(fd) {
  const select = document.createElement('select');
  widgetProps(select, fd);
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
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  button.type = fd.Type;
  button.id = fd.Id;
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
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  widgetProps(input, fd);
  return input;
}

function createOutput(fd) {
  const output = document.createElement('output');
  output.name = fd.Name;
  output.textContent = fd.Value;
  return output;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  widgetProps(input, fd);
  return input;
}

// eslint-disable-next-line consistent-return
function createLabel(fd) {
  if (fd.Label) {
    const label = document.createElement('label');
    label.setAttribute('for', fd.Name);
    label.textContent = fd.Label;
    return label;
  }
}

// eslint-disable-next-line consistent-return
function createLegend(fd) {
  if (fd.Label) {
    const label = document.createElement('legend');
    label.textContent = fd.Label;
    return label;
  }
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

function createWidget(fd) {
  switch (fd.Type) {
    case 'select':
      return createSelect(fd);
    case 'checkbox':
    case 'radio':
      return createInput(fd);
    case 'textarea':
      return createTextArea(fd);
    case 'output':
      return createOutput(fd);
    default:
      return createInput(fd);
  }
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  const ids = {};
  const getId = function (name) {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  };
  const currentRadioGroup = "";
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Id = fd.Id || getId(fd.Name);
    fd.Type = fd.Type || 'text';
    if (fd.Type === 'hidden') {
      form.append(createWidget(fd));
    } else {
      if (fd.Type !== 'radio' && currentRadioGroup != null) {
        currentRadioGroup = null;
      }
      const wrapperTag = fd.Type === 'radio-group' ? 'fieldset' : 'div';
      const fieldWrapper = document.createElement(wrapperTag);
      const style = fd.Style ? ` form-${fd.Style}` : '';
      const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
      const fieldId = `form-${fd.Type}-wrapper${style}${nameStyle}`;
      fieldWrapper.className = fieldId;
      fieldWrapper.classList.add('field-wrapper');
      fieldWrapper.dataset.hidden = fd.Hidden || 'false';
      fieldWrapper.dataset.mandatory = fd.Mandatory || 'true';
      fieldWrapper.dataset.tooltip = fd.Tooltip;
      fieldWrapper.title = fd.Tooltip;
      switch (fd.Type) {
        case 'heading':
          fieldWrapper.append(createHeading(fd));
          break;
        case 'button':
        case 'submit':
          fieldWrapper.append(createButton(fd));
          break;
        case 'radio-group':
          appendChild(fieldWrapper, createLegend(fd));
          currentRadioGroup = fieldWrapper;
          break;
        case 'checkbox':
        case 'radio':
          fieldWrapper.append(createWidget(fd));
          appendChild(fieldWrapper, createLabel(fd));
          break;
        default:
          appendChild(fieldWrapper, createLabel(fd));
          fieldWrapper.append(createWidget(fd));
      }

      if (fd.Rules) {
        try {
          rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
        }
      }
      if (fd.Type === 'radio' && currentRadioGroup) {
        currentRadioGroup.append(fieldWrapper);
      } else {
        form.append(fieldWrapper);
      }
    }
  });

  form.addEventListener('change', () => applyRules(form, rules));
  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
