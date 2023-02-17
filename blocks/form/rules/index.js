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

function extractRules(data) {
  return data
    .reduce(({ fieldNameMap, rules }, fd, index) => {
      const currentRules = getRules(fd);
      return {
        fieldNameMap: {
          ...fieldNameMap,
          [index + 2]: fd.Name,
        },
        rules: currentRules.length ? rules.concat([[fd.Name, currentRules]]) : rules,
      };
    }, { fieldNameMap: {}, rules: [] });
}

export async function applyRuleEngine(form, fragments, formTag) {
  try {
    const RuleEngine = (await import('./RuleEngine.js')).default;
    const fragmentData = Object.entries(fragments).reduce((finalData, [fragmentName, data]) => {
      const { fieldNameMap, rules: fragmentRules } = extractRules(data);
      finalData.fieldNameMap[fragmentName] = fieldNameMap;
      finalData.rules[fragmentName] = fragmentRules;
      return finalData;
    }, { fieldNameMap: {}, rules: {} });

    const formData = extractRules(form);
    const fieldNameMap = {
      'helix-default': formData.fieldNameMap,
      ...fragmentData.fieldNameMap,
    };
    const rules = {
      'helix-default': formData.rules,
      ...fragmentData.rules,
    };

    new RuleEngine(rules, fieldNameMap, formTag).enable();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('unable to apply rules ', e);
  }
}
