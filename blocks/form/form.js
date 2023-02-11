function appendChild(parent, element) {
  if (parent && element) {
    parent.appendChild(element);
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

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  button.type = fd.Type;
  button.id = fd.Id;
  return button;
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

const measure = function (name) {
  const start = new Date().getTime();
  return {
    report() {
      const stop = new Date().getTime();
      console.error(`${name} `, stop - start);
    },
  };
};

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const fetchJsonPerf = measure('fetch Json');
  const resp = await fetch(pathname);
  const json = await resp.json();
  fetchJsonPerf.report();
  const form = document.createElement('form');
  const rules = [];
  const ids = {};
  function getId(name) {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  }
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  const formCreate = measure('form Creation');
  json.data.forEach((fd) => {
    const fieldCreation = measure(`${fd.Type} - ${fd.Name}`);
    fd.Type = fd.Type || 'text';
    if (fd.Name) {
      fd.Id = fd.Id || getId(fd.Name);
    }
    if (fd.Type === 'hidden') {
      form.append(createWidget(fd));
    } else {
      const fieldWrapper = document.createElement('div');
      const style = fd.Style ? ` form-${fd.Style}` : '';
      const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
      const fieldId = `field-wrapper form-${fd.Type}-wrapper${style}${nameStyle}`;
      fieldWrapper.className = fieldId;
      fieldWrapper.dataset.hidden = fd.Hidden || 'false';
      fieldWrapper.dataset.mandatory = fd.Mandatory || 'true';
      fieldWrapper.dataset.tooltip = fd.Tooltip;
      fieldWrapper.title = fd.Tooltip;
      switch (fd.Type) {
        case 'label':
          fieldWrapper.append(createLabel(fd));
          break;
        case 'button':
        case 'submit':
          fieldWrapper.append(createButton(fd));
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
      form.append(fieldWrapper);
      fieldCreation.report();
    }
  });
  formCreate.report();

  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
