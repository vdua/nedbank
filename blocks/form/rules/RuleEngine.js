/* eslint-disable max-classes-per-file */
import Formula from './formula/Formula.js';
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

export default class RuleEngine {
  rulesOrder = {};

  constructor(formRules, fieldNameMap, formTag) {
    this.formTag = formTag;
    this.data = constructPayload(formTag);
    this.formula = new Formula();
    const newRules = Object.entries(formRules)
      .flatMap(([fragmentName, fragRules]) => fragRules
        .map(([fieldName, fieldRules]) => [fieldName, fieldRules
          .map((rule) => transformRule(rule, fieldNameMap, fragmentName, this.formula))]));

    this.formRules = Object.fromEntries(newRules);
    this.dependencyTree = newRules.reduce((fields, [fieldName, rules]) => {
      fields[fieldName] = fields[fieldName] || { deps: {} };
      rules.forEach(({ prop, deps }) => {
        deps.forEach((dep) => {
          fields[dep] = fields[dep] || { deps: {} };
          fields[dep].deps[prop] = fields[dep].deps[prop] || [];
          fields[dep].deps[prop].push(fieldName);
        });
      });
      return fields;
    }, {});
  }

  listRules(fieldName) {
    const arr = {};
    let index = 0;
    const stack = [fieldName];
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
    } while (stack.length > 0);
    return Object.entries(arr).sort((a, b) => a[1] - b[1]).map((_) => _[0]).slice(1);
  }

  updateValue(fieldName, value) {
    const element = this.formTag.elements[fieldName];
    if (!(element instanceof NodeList)) {
      this.data[fieldName] = coerceValue(value);
      const { displayFormat } = element.dataset;
      const formatFn = formatFns[displayFormat] || formatFns.identity;
      element.value = formatFn(value);
    }
  }

  updateHidden(fieldName, value) {
    const element = this.formTag.elements[fieldName];
    const wrapper = element.closest('.field-wrapper');
    wrapper.dataset.hidden = value;
  }

  enable() {
    this.formTag.addEventListener('input', (e) => {
      const fieldName = e.target.name;
      if (e.target.type === 'checkbox') {
        this.data[fieldName] = e.target.checked ? coerceValue(e.target.value) : undefined;
      } else {
        this.data[fieldName] = coerceValue(e.target.value);
      }
      if (!this.rulesOrder[fieldName]) {
        this.rulesOrder[fieldName] = this.listRules(fieldName);
      }
      const rules = this.rulesOrder[fieldName];
      rules.forEach((fName) => {
        this.formRules[fName]?.forEach((rule) => {
          const newValue = this.formula.evaluate(rule.ast, this.data);
          const handler = this[`update${rule.prop}`];
          if (handler instanceof Function) {
            handler.apply(this, [fName, newValue]);
          }
        });
      });
    });
  }
}
