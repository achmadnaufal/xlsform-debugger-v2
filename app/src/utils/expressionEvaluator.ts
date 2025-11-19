type FormValues = Record<string, string>;

const replaceVariableRefs = (expression: string, formValues: FormValues): string => {
  return expression.replace(/\$\{([^}]+)\}/g, (_match, varName: string) => {
    const value = formValues[varName] ?? '';
    return JSON.stringify(value);
  });
};

const replaceXPathFunctions = (expression: string): string => {
  let result = expression;
  result = result.replace(/selected\(([^,]+),\s*'([^']+)'\)/g, '(String($1).split(" ").includes("$2"))');
  result = result.replace(/selected\(([^,]+),\s*"([^"]+)"\)/g, '(String($1).split(" ").includes("$2"))');
  result = result.replace(/string-length\(([^)]*)\)/g, 'String($1).length');
  result = result.replace(/number\(([^)]*)\)/g, 'Number($1)');
  result = result.replace(/true\(\)/g, 'true');
  result = result.replace(/false\(\)/g, 'false');
  result = result.replace(/\band\b/g, '&&');
  result = result.replace(/\bor\b/g, '||');
  result = result.replace(/\bmod\b/g, '%');
  result = result.replace(/(?<![!<>=])=(?!=)/g, '==');
  return result;
};

const prepareExpression = (expression: string, formValues: FormValues): string => {
  const withVars = replaceVariableRefs(expression, formValues);
  return replaceXPathFunctions(withVars);
};

export const evaluateRelevant = (expression: string, formValues: FormValues): boolean => {
  if (!expression) return true;
  try {
    const prepared = prepareExpression(expression, formValues);
    // eslint-disable-next-line no-new-func
    return Boolean(new Function(`return (${prepared})`)());
  } catch {
    return true;
  }
};

export const evaluateConstraint = (expression: string, value: string, formValues: FormValues): boolean => {
  if (!expression || !value) return true;
  try {
    const withDot = expression.replace(/\./g, '__DOT__');
    const prepared = prepareExpression(withDot, formValues);
    const withValue = prepared.replace(/__DOT__/g, JSON.stringify(value));
    // eslint-disable-next-line no-new-func
    return Boolean(new Function(`return (${withValue})`)());
  } catch {
    return true;
  }
};
