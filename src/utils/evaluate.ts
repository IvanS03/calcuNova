/**
 * Safely evaluates a math expression string.
 * Supports basic arithmetic + scientific functions.
 * Trig functions use DEGREES.
 */

// Degree-based trig + math helpers injected into Function scope
const MATH_HELPERS = `
  const __sin  = x => Math.sin(x * Math.PI / 180);
  const __cos  = x => Math.cos(x * Math.PI / 180);
  const __tan  = x => Math.tan(x * Math.PI / 180);
  const __log  = x => Math.log10(x);
  const __ln   = x => Math.log(x);
  const __sqrt = x => Math.sqrt(x);
`;

function sanitize(expr: string): string {
  return expr
    // Basic symbols
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
    // x² → **2  (wrap left side in parens if needed)
    .replace(/([0-9.]+|\))\s*\*\*2/g, '($1**2)')
    // Constants — replace BEFORE function names to avoid conflicts
    .replace(/\bπ\b/g, `(${Math.PI})`)
    // e constant: only standalone 'e', not inside words or exponents like 1e10
    .replace(/(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_(+\-])/g, `(${Math.E})`)
    // Scientific functions → internal helpers
    .replace(/sin\(/g,  '__sin(')
    .replace(/cos\(/g,  '__cos(')
    .replace(/tan\(/g,  '__tan(')
    .replace(/log\(/g,  '__log(')
    .replace(/ln\(/g,   '__ln(')
    .replace(/√\(/g,    '__sqrt(')
    // Power operator
    .replace(/\^/g, '**');
}

function isBalanced(expr: string): boolean {
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function isSafeExpression(expr: string): boolean {
  // Allow digits, operators, parens, dots, spaces, and our __helper names
  return /^[0-9+\-*/.() _a-zA-Z]+$/.test(expr);
}

export function evaluateExpression(expr: string): string {
  if (!expr || expr.trim() === '') return '';

  try {
    const sanitized = sanitize(expr);

    // Must not end with an operator, dot, or opening paren
    if (/[+\-*/.(__]$/.test(sanitized)) return '';

    // Parentheses must be balanced
    if (!isBalanced(sanitized)) return '';

    // Safety check on characters
    if (!isSafeExpression(sanitized)) return '';

    // eslint-disable-next-line no-new-func
    const result = Function(
      '"use strict";' +
      MATH_HELPERS +
      `return (${sanitized});`
    )();

    if (result === undefined || result === null) return '';
    if (typeof result !== 'number')              return '';
    if (!isFinite(result))                       return 'Error';
    if (isNaN(result))                           return 'Error';

    // Clean up floating point noise (e.g. 0.1 + 0.2 = 0.3, not 0.30000000004)
    const rounded = parseFloat(result.toFixed(10));
    return String(rounded);

  } catch {
    return ''; // Incomplete or invalid expression
  }
}