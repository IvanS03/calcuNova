import { useCallback, useRef, useState } from 'react';
import { evaluateExpression } from '../utils/evaluate';

export type ButtonValue =
  | '0' | '1' | '2' | '3' | '4'
  | '5' | '6' | '7' | '8' | '9'
  | '+' | '-' | '×' | '÷' | '.' | '='
  | 'AC' | '+/-' | '%' | '⌫'
  | '(' | ')' | '()'
  // Scientific page A
  | 'sin(' | 'cos(' | 'tan('
  | 'log(' | 'ln(' | '√('
  | 'x²' | 'x³' | '^'
  | 'π' | 'e'
  | 'asin(' | 'acos(' | 'atan('
  | '10^('
  // Scientific page B
  | 'sinh(' | 'cosh(' | 'tanh('
  | 'abs(' | 'cbrt('
  | 'e^(' | '1/x'
  | 'n!' | 'mod'
  | 'floor(' | 'ceil(' | 'round('
  | 'nPr(' | 'nCr('
  | 'log2(' | 'rand' | 'trunc(' | 'sign(';

const OPERATORS = ['+', '-', '×', '÷', '^'];
const MULTI_TOKENS = [
  'sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(',
  'asin(', 'acos(', 'atan(',
  'sinh(', 'cosh(', 'tanh(',
  'cbrt(', 'abs(', '10^(', 'e^(',
  'floor(', 'ceil(', 'round(',
  'nPr(', 'nCr(', 'log2(', 'trunc(', 'sign(',
];

const APPEND_AS_IS: ButtonValue[] = [
  'sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(',
  'π', 'e', '(', ')',
  'asin(', 'acos(', 'atan(',
  'sinh(', 'cosh(', 'tanh(',
  'cbrt(', 'abs(', '10^(', 'e^(',
  'floor(', 'ceil(', 'round(',
  'nPr(', 'nCr(',
  'mod', 'log2(', 'trunc(', 'sign(',           // appended as operator
];

// ── Cursor-aware helpers ─────────────────────────────

function insertAt(
  expr: string,
  text: string,
  pos: number,
  replaceZero = true,   // ← nuevo param opcional
): { newExpr: string; newPos: number } {
  // Only replace bare '0' when inserting digits or open paren,
  // and only when the caller explicitly allows it
  if (replaceZero && expr === '0' && /^[0-9(]/.test(text)) {
    return { newExpr: text, newPos: text.length };
  }
  const newExpr = expr.slice(0, pos) + text + expr.slice(pos);
  return { newExpr, newPos: pos + text.length };
}

function deleteAt(
  expr: string,
  pos: number,
): { newExpr: string; newPos: number } {
  if (pos === 0) return { newExpr: expr, newPos: 0 };
  // Check multi-char tokens ending at cursor
  for (const token of MULTI_TOKENS) {
    if (expr.slice(pos - token.length, pos) === token) {
      const newExpr = expr.slice(0, pos - token.length) + expr.slice(pos);
      return { newExpr: newExpr || '0', newPos: pos - token.length };
    }
  }
  const newExpr = expr.slice(0, pos - 1) + expr.slice(pos);
  return { newExpr: newExpr || '0', newPos: pos - 1 };
}

function insertOperator(
  expr: string,
  op: string,
  pos: number,
): { newExpr: string; newPos: number } {
  const charBefore = expr[pos - 1];
  if (OPERATORS.includes(charBefore) && pos > 0) {
    // Replace existing operator instead of stacking
    const newExpr = expr.slice(0, pos - 1) + op + expr.slice(pos);
    return { newExpr, newPos: pos };
  }
  const newExpr = expr.slice(0, pos) + op + expr.slice(pos);
  return { newExpr, newPos: pos + op.length };
}

function smartParen(expr: string, pos: number): '(' | ')' {
  const slice = expr.slice(0, pos);
  let open = 0;
  for (const ch of slice) {
    if (ch === '(') open++;
    if (ch === ')') open--;
  }
  const lastChar = slice.slice(-1);
  return open > 0 && !['+', '-', '×', '÷', '^', '(', ''].includes(lastChar)
    ? ')'
    : '(';
}

// ── Validation for direct text edits ────────────────
const ALLOWED_RE = /^[0-9+\-×÷().π^%e\s]*$/i;
const FRIENDLY_ERRORS: Record<string, string> = {
  invalidChar: 'Solo se permiten números y operadores',
  doubleOp: 'No se pueden poner dos operadores seguidos',
  leadingOp: 'No puede empezar con un operador',
};

function validateDirectEdit(text: string): string | null {
  if (!ALLOWED_RE.test(text)) return FRIENDLY_ERRORS.invalidChar;
  if (/[+×÷^]{2,}/.test(text)) return FRIENDLY_ERRORS.doubleOp;
  if (/^[×÷^+]/.test(text)) return FRIENDLY_ERRORS.leadingOp;
  return null;
}

// ── Validation helpers ───────────────────────────

const MAX_DIGITS_PER_NUMBER = 16;
const MAX_OPERATORS = 50;
const OPERATOR_CHARS = new Set(['+', '-', '×', '÷', '%']);

// Count digits in the current number at cursor position
function digitsInCurrentNumber(expr: string, pos: number): number {
  let count = 0;
  let i = pos - 1;
  while (i >= 0) {
    const ch = expr[i];
    if (/[0-9]/.test(ch)) { count++; i--; }
    else break;
  }
  return count;
}

// Count total operators in expression
function countOperators(expr: string): number {
  let count = 0;
  for (const ch of expr) {
    if (OPERATOR_CHARS.has(ch)) count++;
  }
  return count;
}

// ── Hook ─────────────────────────────────────────────

export function useCalculator() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [editError, setEditError] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Tracks where cursor is between button presses
  const cursorPosRef = useRef(1);

  // History refs
  const lastEvaluatedExpr = useRef('');
  const lastEvaluatedResult = useRef('');

  // Clear error after 2 seconds
  const showError = useCallback((msg: string) => {
    setEditError(msg);
    setTimeout(() => setEditError(''), 2000);
  }, []);

  // Apply a new expression and move cursor
  const apply = useCallback((newExpr: string, newPos: number) => {
    const clamped = Math.min(Math.max(newPos, 0), newExpr.length);
    cursorPosRef.current = clamped;
    setExpression(newExpr);
    setSelection({ start: clamped, end: clamped });
    const live = evaluateExpression(newExpr);
    setResult(live !== newExpr ? live : '');
  }, []);

  // Called by Display when user moves cursor by tapping
  const onSelectionChange = useCallback((pos: number) => {
    cursorPosRef.current = pos;
    // Release programmatic control so TextInput manages cursor freely
    setSelection(undefined);
  }, []);

  // Called by Display when user edits text directly
  const onDirectEdit = useCallback((text: string) => {
    if (!text || text.trim() === '') {
      apply('0', 1);
      return;
    }
    const error = validateDirectEdit(text);
    if (error) {
      showError(error);
      return; // reject the edit
    }
    setExpression(text);
    const live = evaluateExpression(text);
    setResult(live !== text ? live : '');
    // Don't override selection — TextInput manages cursor for direct edits
    setSelection(undefined);
  }, [apply, showError]);

  // Inject a value directly — used by history selection
  const setExpressionDirect = useCallback((value: string) => {
    setJustEvaluated(false);
    apply(value, value.length);
  }, [apply]);

  const handlePress = useCallback((value: ButtonValue) => {
    if (value !== '=') setShowIncompleteWarning(false);
    const pos = cursorPosRef.current;

    // ── Clear ──────────────────────────────────────
    if (value === 'AC') {
      setJustEvaluated(false);
      setEditError('');
      apply('0', 1);
      return;
    }

    // ── Backspace ──────────────────────────────────
    if (value === '⌫') {
      setJustEvaluated(false);
      const { newExpr, newPos } = deleteAt(expression, pos);
      apply(newExpr, newPos);
      return;
    }

    // ── Equals ────────────────────────────────────
    if (value === '=') {
      const evaluated = evaluateExpression(expression);
      if (evaluated && evaluated !== 'Error') {
        lastEvaluatedExpr.current = expression;
        lastEvaluatedResult.current = evaluated;
        setJustEvaluated(true);
        apply(evaluated, evaluated.length);
        setResult('');
      } else {
        // Incomplete or invalid — show warning
        setShowIncompleteWarning(true);
      }
      return;
    }

    // ── After evaluation: fresh start on digit ────
    if (justEvaluated && /^[0-9]$/.test(value)) {
      setJustEvaluated(false);
      apply(value, 1);
      return;
    }
    setJustEvaluated(false);

    // ── Toggle sign ───────────────────────────────
    if (value === '+/-') {
      const toggled = expression.startsWith('-')
        ? expression.slice(1)
        : '-' + expression;
      const newPos = expression.startsWith('-') ? pos - 1 : pos + 1;
      apply(toggled, Math.max(0, newPos));
      return;
    }

    // ── Percentage ────────────────────────────────
    if (value === '%') {
      setJustEvaluated(false);
      if (expression === '0') return;
      const lastChar = expression[pos - 1];
      if (!/[0-9)]/.test(lastChar)) return;
      // % counts as operator
      if (countOperators(expression) >= MAX_OPERATORS) {
        showError('Máximo 50 operadores por expresión');
        return;
      }
      const { newExpr, newPos } = insertAt(expression, '%', pos);
      apply(newExpr, newPos);
      return;
    }

    // ── x² ───────────────────────────────────────
    if (value === 'x²') {
      const ins = '**2';
      const { newExpr, newPos } = insertAt(expression, ins, pos, false);
      apply(newExpr, newPos);
      return;
    }

    // ── x³ ───────────────────────────────────────
    if (value === 'x³') {
      const { newExpr, newPos } = insertAt(expression, '**3', pos, false);
      apply(newExpr, newPos);
      return;
    }

    // ── 1/x ──────────────────────────────────────
    if (value === '1/x') {
      if (expression === '0') return;
      const wrapped = `1/(${expression})`;
      apply(wrapped, wrapped.length);
      return;
    }

    // ── Decimal ───────────────────────────────────
    if (value === '.') {
      const segments = expression.slice(0, pos).split(/[+\-×÷^(]/);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg.includes('.')) return;
      const { newExpr, newPos } = insertAt(expression, '.', pos, false);
      apply(newExpr, newPos);
      return;
    }

    if (value === 'rand') {
      const randVal = String(parseFloat(Math.random().toFixed(10)));
      apply(randVal, randVal.length);
      return;
    }

    // ── Factorial ────────────────────────────────────
    if (value === 'n!') {
      setJustEvaluated(false);
      if (expression === '0') return;
      const next = `factorial(${expression})`;
      apply(next, next.length);
      return;
    }

    // ── Smart paren () ────────────────────────────
    if (value === '()') {
      const paren = smartParen(expression, pos);
      const { newExpr, newPos } = insertAt(expression, paren, pos, false);
      apply(newExpr, newPos);
      return;
    }

    // ── Operators ─────────────────────────────────
    if (OPERATORS.includes(value)) {
      setJustEvaluated(false);

      // Validate: max 50 operators
      if (countOperators(expression) >= MAX_OPERATORS) {
        showError('Máximo 50 operadores por expresión');
        return;
      }

      const { newExpr, newPos } = insertOperator(expression, value, pos);
      apply(newExpr, newPos);
      return;
    }

    // ── Append-as-is (functions, constants) ───────
    if (APPEND_AS_IS.includes(value)) {
      const { newExpr, newPos } = insertAt(expression, String(value), pos);
      apply(newExpr, newPos);
      return;
    }

    // ── Digit ────────────────────────────────────
    // Validate: max 16 digits per number
    const currentDigits = digitsInCurrentNumber(expression, pos);
    if (currentDigits >= MAX_DIGITS_PER_NUMBER) {
      showError('Máximo 16 dígitos por número');
      return;
    }

    const { newExpr, newPos } = insertAt(expression, value, pos);
    apply(newExpr, newPos);

  }, [expression, justEvaluated, apply, showError]);

  return {
    expression,
    result,
    handlePress,
    selection,
    onSelectionChange,
    onDirectEdit,
    showIncompleteWarning,
    setExpressionDirect,
    editError,
    lastEvaluatedExpr,
    lastEvaluatedResult,
  };
}