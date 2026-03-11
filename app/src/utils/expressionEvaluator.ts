type FormValues = Record<string, string>;

/**
 * Safe expression evaluator that uses structured parsing instead of new Function().
 * Supports a subset of XPath/ODK expressions used in relevant/constraint fields.
 */

const resolveVariableRefs = (expression: string, formValues: FormValues): string => {
  return expression.replace(/\$\{([^}]+)\}/g, (_match, varName: string) => {
    return formValues[varName] ?? '';
  });
};

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'identifier'; value: string }
  | { type: 'op'; value: string }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma'; value: ',' };

const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) { i++; continue; }

    // String literals
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let str = '';
      i++;
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]))) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // Multi-char operators
    if (expr.slice(i, i + 2) === '!=' || expr.slice(i, i + 2) === '<=' || expr.slice(i, i + 2) === '>=') {
      tokens.push({ type: 'op', value: expr.slice(i, i + 2) });
      i += 2;
      continue;
    }

    // Single-char operators
    if ('=<>+-*'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_\-]/.test(ch)) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_\-]/.test(expr[i])) {
        id += expr[i];
        i++;
      }
      if (id === 'and') tokens.push({ type: 'op', value: 'and' });
      else if (id === 'or') tokens.push({ type: 'op', value: 'or' });
      else if (id === 'mod') tokens.push({ type: 'op', value: 'mod' });
      else if (id === 'div') tokens.push({ type: 'op', value: 'div' });
      else tokens.push({ type: 'identifier', value: id });
      continue;
    }

    // Skip unknown characters
    i++;
  }
  return tokens;
};

type ASTNode =
  | { kind: 'literal'; value: number | string | boolean }
  | { kind: 'binary'; op: string; left: ASTNode; right: ASTNode }
  | { kind: 'unary'; op: string; operand: ASTNode }
  | { kind: 'call'; name: string; args: ASTNode[] }
  | { kind: 'identifier'; name: string };

const parse = (tokens: Token[]): ASTNode => {
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const advance = (): Token => tokens[pos++];

  const parseOr = (): ASTNode => {
    let left = parseAnd();
    while (peek()?.type === 'op' && peek()?.value === 'or') {
      advance();
      const right = parseAnd();
      left = { kind: 'binary', op: 'or', left, right };
    }
    return left;
  };

  const parseAnd = (): ASTNode => {
    let left = parseComparison();
    while (peek()?.type === 'op' && peek()?.value === 'and') {
      advance();
      const right = parseComparison();
      left = { kind: 'binary', op: 'and', left, right };
    }
    return left;
  };

  const parseComparison = (): ASTNode => {
    let left = parseAddSub();
    const compOps = ['=', '!=', '<', '>', '<=', '>='];
    while (peek()?.type === 'op' && compOps.includes(String(peek()?.value ?? ''))) {
      const op = advance().value as string;
      const right = parseAddSub();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  };

  const parseAddSub = (): ASTNode => {
    let left = parseMulDiv();
    while (peek()?.type === 'op' && (peek()?.value === '+' || peek()?.value === '-')) {
      const op = advance().value as string;
      const right = parseMulDiv();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  };

  const parseMulDiv = (): ASTNode => {
    let left = parseUnary();
    while (peek()?.type === 'op' && (peek()?.value === '*' || peek()?.value === 'div' || peek()?.value === 'mod')) {
      const op = advance().value as string;
      const right = parseUnary();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  };

  const parseUnary = (): ASTNode => {
    if (peek()?.type === 'op' && peek()?.value === '-') {
      advance();
      const operand = parsePrimary();
      return { kind: 'unary', op: '-', operand };
    }
    return parsePrimary();
  };

  const parsePrimary = (): ASTNode => {
    const token = peek();
    if (!token) return { kind: 'literal', value: '' };

    if (token.type === 'number') {
      advance();
      return { kind: 'literal', value: token.value };
    }

    if (token.type === 'string') {
      advance();
      return { kind: 'literal', value: token.value };
    }

    if (token.type === 'identifier') {
      const name = token.value;
      advance();

      // Check if it's a function call
      if (peek()?.type === 'paren' && peek()?.value === '(') {
        advance(); // skip '('
        const args: ASTNode[] = [];
        if (!(peek()?.type === 'paren' && peek()?.value === ')')) {
          args.push(parseOr());
          while (peek()?.type === 'comma') {
            advance();
            args.push(parseOr());
          }
        }
        if (peek()?.type === 'paren' && peek()?.value === ')') advance();
        return { kind: 'call', name, args };
      }

      return { kind: 'identifier', name };
    }

    if (token.type === 'paren' && token.value === '(') {
      advance();
      const expr = parseOr();
      if (peek()?.type === 'paren' && peek()?.value === ')') advance();
      return expr;
    }

    advance();
    return { kind: 'literal', value: '' };
  };

  return parseOr();
};

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

const toBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return false;
};

const evaluate = (node: ASTNode, dotValue?: string): unknown => {
  switch (node.kind) {
    case 'literal':
      return node.value;

    case 'identifier':
      return node.name;

    case 'unary':
      if (node.op === '-') return -toNumber(evaluate(node.operand, dotValue));
      return evaluate(node.operand, dotValue);

    case 'binary': {
      const left = evaluate(node.left, dotValue);
      const right = evaluate(node.right, dotValue);
      switch (node.op) {
        case 'and': return toBool(left) && toBool(right);
        case 'or': return toBool(left) || toBool(right);
        case '=': return String(left) === String(right);
        case '!=': return String(left) !== String(right);
        case '<': return toNumber(left) < toNumber(right);
        case '>': return toNumber(left) > toNumber(right);
        case '<=': return toNumber(left) <= toNumber(right);
        case '>=': return toNumber(left) >= toNumber(right);
        case '+': return toNumber(left) + toNumber(right);
        case '-': return toNumber(left) - toNumber(right);
        case '*': return toNumber(left) * toNumber(right);
        case 'div': {
          const d = toNumber(right);
          return d === 0 ? 0 : toNumber(left) / d;
        }
        case 'mod': {
          const d = toNumber(right);
          return d === 0 ? 0 : toNumber(left) % d;
        }
        default: return false;
      }
    }

    case 'call': {
      const args = node.args.map(a => evaluate(a, dotValue));
      switch (node.name) {
        case 'true': return true;
        case 'false': return false;
        case 'selected': {
          const haystack = String(args[0] ?? '');
          const needle = String(args[1] ?? '');
          return haystack.split(' ').includes(needle);
        }
        case 'string-length': return String(args[0] ?? '').length;
        case 'number': return toNumber(args[0]);
        case 'string': return String(args[0] ?? '');
        case 'not': return !toBool(args[0]);
        case 'coalesce': return args.find(a => a !== '' && a !== undefined) ?? '';
        case 'concat': return args.map(a => String(a ?? '')).join('');
        case 'contains': return String(args[0] ?? '').includes(String(args[1] ?? ''));
        case 'starts-with': return String(args[0] ?? '').startsWith(String(args[1] ?? ''));
        case 'substr': return String(args[0] ?? '').substring(toNumber(args[1]), args[2] !== undefined ? toNumber(args[2]) : undefined);
        case 'count-selected': return String(args[0] ?? '').split(' ').filter(Boolean).length;
        case 'round': {
          const num = toNumber(args[0]);
          const decimals = args[1] !== undefined ? toNumber(args[1]) : 0;
          const factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        }
        case 'int': return Math.floor(toNumber(args[0]));
        case 'if': return toBool(args[0]) ? args[1] : args[2];
        default: return '';
      }
    }

    default:
      return '';
  }
};

export const evaluateRelevant = (expression: string, formValues: FormValues): boolean => {
  if (!expression) return true;
  try {
    const resolved = resolveVariableRefs(expression, formValues);
    const tokens = tokenize(resolved);
    const ast = parse(tokens);
    return toBool(evaluate(ast));
  } catch {
    return true;
  }
};

export const evaluateConstraint = (expression: string, value: string, formValues: FormValues): boolean => {
  if (!expression || !value) return true;
  try {
    // Replace standalone '.' with the current value (XPath self-reference)
    const withDot = expression.replace(/(?<![a-zA-Z0-9_])\.(?![a-zA-Z0-9_])/g, `'${value.replace(/'/g, "\\'")}'`);
    const resolved = resolveVariableRefs(withDot, formValues);
    const tokens = tokenize(resolved);
    const ast = parse(tokens);
    return toBool(evaluate(ast, value));
  } catch {
    return true;
  }
};
