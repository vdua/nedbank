/* eslint-disable max-classes-per-file */
import Formula from './parser/Formula.js';
import formatFns from '../formatting.js';
import transformRule from './RuleCompiler.js';

function coerceValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox' || fe.type === 'radio') {
      if (fe.checked) payload[fe.name] = coerceValue(fe.value);
    } else if (fe.id) {
      payload[fe.id] = coerceValue(fe.value);
    }
  });
  return payload;
}

function stripTags(input, allowd) {
  const allowed = ((`${allowd || ''}`)
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '')
    .replace(tags, ($0, $1) => (allowed.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : ''));
}

export default class RuleEngine {
  rulesOrder = {};

  constructor(formRules, fieldIdMap, formTag) {
    this.formTag = formTag;
    this.data = constructPayload(formTag);
    this.formula = new Formula();
    const newRules = Object.entries(formRules)
      .flatMap(([fragmentName, fragRules]) => fragRules
        .map(([fieldId, fieldRules]) => [fieldId, fieldRules
          .map((rule) => transformRule(rule, fieldIdMap, fragmentName, this.formula)),
        ]));

    this.formRules = Object.fromEntries(newRules);
    this.dependencyTree = newRules.reduce((fields, [fieldId, rules]) => {
      fields[fieldId] = fields[fieldId] || { deps: {} };
      rules.forEach(({ prop, deps }) => {
        deps.forEach((dep) => {
          fields[dep] = fields[dep] || { deps: {} };
          fields[dep].deps[prop] = fields[dep].deps[prop] || [];
          fields[dep].deps[prop].push(fieldId);
        });
      });
      return fields;
    }, {});
  }

  listRules(fieldId) {
    const arr = {};
    let index = 0;
    const stack = [fieldId];
    do {
      const el = stack.pop();
      arr[el] = index;
      index += 1;
      if (this.dependencyTree[el].deps.Value) {
        stack.push(...this.dependencyTree[el].deps.Value);
      }
      // eslint-disable-next-line no-loop-func
      this.dependencyTree[el].deps.Hidden?.forEach((field) => {
        arr[field] = index;
        index += 1;
      });
      // eslint-disable-next-line no-loop-func
      this.dependencyTree[el].deps.Label?.forEach((field) => {
        arr[field] = index;
        index += 1;
      });
    } while (stack.length > 0);
    return Object.entries(arr).sort((a, b) => a[1] - b[1]).map((_) => _[0]).slice(1);
  }

  updateValue(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (!(element instanceof NodeList)) {
      this.data[element.name] = coerceValue(value);
      const { displayFormat } = element.dataset;
      const formatFn = formatFns[displayFormat] || ((x) => x);
      element.value = formatFn(value);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  updateHidden(fieldId, value) {
    const element = document.getElementById(fieldId);
    const wrapper = element.closest('.field-wrapper');
    wrapper.dataset.hidden = value;
  }

  // eslint-disable-next-line class-methods-use-this
  updateLabel(fieldId, value) {
    const element = document.getElementById(fieldId);
    const label = element.closest('.field-wrapper').querySelector('.field-label');
    label.innerHTML = stripTags(value, '<a>');
  }

  enable() {
    this.formTag.addEventListener('input', (e) => {
      const fieldName = e.target.name;
      let fieldId = e.target.id;
      if (e.target.type === 'radio') {
        fieldId = e.target.name;
      }
      if (e.target.type === 'checkbox') {
        this.data[fieldName] = e.target.checked ? coerceValue(e.target.value) : undefined;
      } else {
        this.data[fieldName] = coerceValue(e.target.value);
      }
      if (!this.rulesOrder[fieldId]) {
        this.rulesOrder[fieldId] = this.listRules(fieldId);
      }
      const rules = this.rulesOrder[fieldId];
      rules.forEach((fId) => {
        this.formRules[fId]?.forEach((rule) => {
          const newValue = this.formula.evaluate(rule.ast, this.data);
          const handler = this[`update${rule.prop}`];
          if (handler instanceof Function) {
            handler.apply(this, [fId, newValue]);
          }
        });
      });
    });
  }
}
