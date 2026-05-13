/**
 * Safely evaluates a math expression string.
 * Supports basic arithmetic + scientific functions.
 * Trig functions use DEGREES.
 * % is context-aware:
 *   - After + or -: percentage of the left operand  (20+10% → 22)
 *   - After × or ÷: simple division by 100          (20×10% → 2)
 *   - Standalone:   simple division by 100          (10%    → 0.1)
 */

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

/**
 * Resolves contextual % BEFORE other sanitization.
 *
 * Cases:
 *   number + number%  →  number + (number * leftOperand / 100)
 *   number - number%  →  number - (number * leftOperand / 100)
 *   number × number%  →  number * (number / 100)     [simple]
 *   number ÷ number%  →  number / (number / 100)     [simple]
 *   standalone number% →  (number / 100)             [simple]
 */
function resolvePercent(expr: string): string {
  // Find all % occurrences and process them right-to-left
  // so indices don't shift as we replace
  let result = expr;

  // Pattern: captures everything up to and including the % token
  // We process iteratively until no % remains
  let safety = 0;
  while (result.includes('%') && safety++ < 20) {
    // Find the LAST % in the expression
    const pctIdx = result.lastIndexOf('%');

    // Extract the number immediately before %
    // Walk left from pctIdx-1 to find the start of the number
    let numEnd = pctIdx - 1;
    if (numEnd < 0) break;

    // Skip any closing parens (e.g. sin(30)%)
    let scanIdx = numEnd;
    let numStr = '';

    if (result[scanIdx] === ')') {
      // Find matching open paren
      let depth = 0;
      while (scanIdx >= 0) {
        if (result[scanIdx] === ')') depth++;
        if (result[scanIdx] === '(') depth--;
        if (depth === 0) break;
        scanIdx--;
      }
      numStr = result.slice(scanIdx, numEnd + 1);
    } else {
      // Walk back over digits, dots, e (scientific notation)
      while (scanIdx >= 0 && /[0-9.]/.test(result[scanIdx])) {
        scanIdx--;
      }
      scanIdx++; // move back to first digit
      numStr = result.slice(scanIdx, numEnd + 1);
    }

    if (!numStr) break;

    const numStart = scanIdx;

    // Look at what comes before the number (the operator)
    const before = result.slice(0, numStart).trimEnd();
    const lastOp = before.slice(-1);

    let replacement: string;

    if (lastOp === '+' || lastOp === '-') {
      // Context-aware: find the left operand
      // Everything before the operator is the left side
      const leftExpr = before.slice(0, before.length - 1).trim();

      if (leftExpr) {
        // 20+10% → 20+(20*10/100)
        // Use the whole left expression as context
        replacement = `(${numStr}*(${leftExpr})/100)`;
      } else {
        // Nothing on the left (e.g. just "+10%"), fallback to simple
        replacement = `(${numStr}/100)`;
      }
    } else {
      // ×, ÷, ^, or standalone → simple /100
      replacement = `(${numStr}/100)`;
    }

    // Replace "numStr%" with the resolved expression
    result =
      result.slice(0, numStart) +
      replacement +
      result.slice(pctIdx + 1);
  }

  return result;
}

function sanitize(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
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

function isSafe(expr: string): boolean {
  return /^[0-9+\-*/.() _a-zA-Z]+$/.test(expr);
}

export function evaluateExpression(expr: string): string {
  if (!expr || expr.trim() === '') return '';

  try {
    // Step 1: resolve % with context BEFORE sanitizing operators
    const withPercent = resolvePercent(expr);

    // Step 2: sanitize operators and function names
    const sanitized = sanitize(withPercent);

    // Must not end with an operator or open paren
    if (/[+\-*/.(__]$/.test(sanitized)) return '';

    // Parentheses must be balanced
    if (!isBalanced(sanitized)) return '';

    // Safety check
    if (!isSafe(sanitized)) return '';

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

    const rounded = parseFloat(result.toFixed(10));
    return String(rounded);

  } catch {
    return '';
  }
}