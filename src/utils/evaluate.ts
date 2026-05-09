/**
 * Safely evaluates a math expression string.
 * Supports basic arithmetic + scientific functions.
 * Trig functions use DEGREES.
 */

// Degree-based trig + math helpers injected into Function scope
const MATH_HELPERS = `
  const __sin   = x => Math.sin(x * Math.PI / 180);
  const __cos   = x => Math.cos(x * Math.PI / 180);
  const __tan   = x => Math.tan(x * Math.PI / 180);
  const __asin  = x => Math.asin(x) * 180 / Math.PI;
  const __acos  = x => Math.acos(x) * 180 / Math.PI;
  const __atan  = x => Math.atan(x) * 180 / Math.PI;
  const __sinh  = x => Math.sinh(x);
  const __cosh  = x => Math.cosh(x);
  const __tanh  = x => Math.tanh(x);
  const __log   = x => Math.log10(x);
  const __ln    = x => Math.log(x);
  const __sqrt  = x => Math.sqrt(x);
  const __cbrt  = x => Math.cbrt(x);
  const __abs   = x => Math.abs(x);
  const __recip = x => 1 / x;
  const __pow10 = x => Math.pow(10, x);
  const __expe  = x => Math.exp(x);
`;

function sanitize(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
    .replace(/([0-9.]+)\s*%/g, '($1/100)')
    .replace(/([0-9.]+|\))\s*\*\*2/g, '($1**2)')
    .replace(/([0-9.]+|\))\s*\*\*3/g, '($1**3)')
    .replace(/\bπ\b/g, `(${Math.PI})`)
    .replace(/(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_(+\-])/g, `(${Math.E})`)
    // Page A
    .replace(/sin\(/g, '__sin(')
    .replace(/cos\(/g, '__cos(')
    .replace(/tan\(/g, '__tan(')
    .replace(/log\(/g, '__log(')
    .replace(/ln\(/g, '__ln(')
    .replace(/√\(/g, '__sqrt(')
    // Page B
    .replace(/asin\(/g, '__asin(')
    .replace(/acos\(/g, '__acos(')
    .replace(/atan\(/g, '__atan(')
    .replace(/sinh\(/g, '__sinh(')
    .replace(/cosh\(/g, '__cosh(')
    .replace(/tanh\(/g, '__tanh(')
    .replace(/cbrt\(/g, '__cbrt(')
    .replace(/abs\(/g, '__abs(')
    .replace(/1\/x/g, '__recip')
    .replace(/10\^\(/g, '__pow10(')
    .replace(/e\^\(/g, '__expe(')
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
    if (typeof result !== 'number') return '';
    if (!isFinite(result)) return 'Error';
    if (isNaN(result)) return 'Error';

    // Clean up floating point noise (e.g. 0.1 + 0.2 = 0.3, not 0.30000000004)
    const rounded = parseFloat(result.toFixed(10));
    return String(rounded);

  } catch {
    return ''; // Incomplete or invalid expression
  }
}