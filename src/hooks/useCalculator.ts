import { useCallback, useState } from 'react';
import { evaluateExpression } from '../utils/evaluate';

export type ButtonValue =
  // Basic digits
  | '0' | '1' | '2' | '3' | '4'
  | '5' | '6' | '7' | '8' | '9'
  // Basic operators
  | '+' | '-' | '×' | '÷' | '.' | '='
  // Basic functions
  | 'AC' | '+/-' | '%' | '⌫'
  // Scientific
  | 'sin(' | 'cos(' | 'tan('
  | 'log(' | 'ln(' | '√('
  | 'x²' | '^'
  | 'π' | 'e'
  | '('   | ')' | '()'

const OPERATORS = ['+', '-', '×', '÷', '^'];

// Values that append directly to expression as-is
const APPEND_AS_IS: ButtonValue[] = [
  'sin(', 'cos(', 'tan(',
  'log(', 'ln(', '√(',
  'π', 'e', '(', ')',
];

export function useCalculator() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const updateExpression = useCallback((newExpr: string) => {
    setExpression(newExpr);
    const live = evaluateExpression(newExpr);
    setResult(live !== newExpr ? live : '');
  }, []);

  // Determines whether to insert ( or ) based on current expression
  function getSmartParen(expr: string): '(' | ')' {
    let open = 0;
    for (const ch of expr) {
      if (ch === '(') open++;
      if (ch === ')') open--;
    }
    // If there are unclosed parens AND last char isn't an operator, close
    const lastChar = expr.slice(-1);
    const isOperatorOrOpen = ['+', '-', '×', '÷', '^', '(', ''].includes(lastChar);
    if (open > 0 && !isOperatorOrOpen) return ')';
    return '(';
  }

  const handlePress = useCallback((value: ButtonValue) => {

    // ── Clear ──────────────────────────────────────────────
    if (value === 'AC') {
      setExpression('0');
      setResult('');
      setJustEvaluated(false);
      return;
    }

    // ── Backspace ──────────────────────────────────────────
    if (value === '⌫') {
      setJustEvaluated(false);
      setExpression(prev => {
        // Remove multi-char tokens like sin( cos( etc.
        const multiTokens = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√('];
        for (const token of multiTokens) {
          if (prev.endsWith(token)) {
            const next = prev.slice(0, -token.length) || '0';
            setResult(evaluateExpression(next));
            return next;
          }
        }
        const next = prev.length > 1 ? prev.slice(0, -1) : '0';
        setResult(evaluateExpression(next));
        return next;
      });
      return;
    }

    // ── Equals ────────────────────────────────────────────
    if (value === '=') {
      const evaluated = evaluateExpression(expression);
      if (evaluated && evaluated !== 'Error') {
        setExpression(evaluated);
        setResult('');
        setJustEvaluated(true);
      }
      return;
    }

    // ── Toggle sign ───────────────────────────────────────
    if (value === '+/-') {
      setJustEvaluated(false);
      const toggled = expression.startsWith('-')
        ? expression.slice(1)
        : '-' + expression;
      updateExpression(toggled);
      return;
    }

    // ── Percentage ────────────────────────────────────────
    if (value === '%') {
      setJustEvaluated(false);
      const pct = evaluateExpression(expression);
      if (pct) updateExpression(String(parseFloat(pct) / 100));
      return;
    }

    // ── x² shorthand ─────────────────────────────────────
    if (value === 'x²') {
      setJustEvaluated(false);
      const next = expression === '0' ? '0**2' : expression + '**2';
      updateExpression(next);
      return;
    }

    // ── Decimal point ─────────────────────────────────────
    if (value === '.') {
      setJustEvaluated(false);
      setExpression(prev => {
        const segments = prev.split(/[+\-×÷^(]/);
        const lastSeg = segments[segments.length - 1];
        if (lastSeg.includes('.')) return prev;
        const next = prev + '.';
        setResult(evaluateExpression(next));
        return next;
      });
      return;
    }

    // ── Operators ─────────────────────────────────────────
    if (OPERATORS.includes(value)) {
      setJustEvaluated(false);
      setExpression(prev => {
        const lastChar = prev.slice(-1);
        const base = OPERATORS.includes(lastChar) ? prev.slice(0, -1) : prev;
        const next = base + value;
        setResult(evaluateExpression(next));
        return next;
      });
      return;
    }

    // ── Smart parenthesis ─────────────────────────────
    if (value === '()') {
      setJustEvaluated(false);
      const paren = getSmartParen(expression);
      const next = expression === '0' ? paren : expression + paren;
      updateExpression(next);
      return;
    }

    // ── Scientific tokens that append as-is ───────────────
    if (APPEND_AS_IS.includes(value)) {
      setJustEvaluated(false);
      const next = expression === '0' ? String(value) : expression + value;
      updateExpression(next);
      return;
    }

    // ── Digit ─────────────────────────────────────────────
    {
      let next: string;
      if (justEvaluated) {
        next = value;
        setJustEvaluated(false);
      } else {
        next = expression === '0' ? value : expression + value;
      }
      updateExpression(next);
    }

  }, [expression, justEvaluated, updateExpression]);

  return { expression, result, handlePress };
}