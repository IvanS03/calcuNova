/**
 * Formats a calculator expression for display by inserting \n
 * at term boundaries — never in the middle of a number.
 *
 * A "term" is:
 *   - The first element: everything before the first binary operator
 *   - Subsequent elements: (operator)(number/expression) pairs
 *
 * Binary operators that separate terms: + - × ÷
 * (scientific functions, parens, % stay attached to their term)
 */

const TERM_OPERATORS = new Set(['+', '-', '×', '÷']);

/**
 * Splits a raw expression into terms.
 * Example: "10+20×3.5-sin(30)" → ["10", "+20×", "3.5", "-sin(30)"]
 *
 * Wait, that's wrong. Terms must be complete: operator+everything until next operator.
 * "10+20×3.5-sin(30)" → ["10", "+20", "×3.5", "-sin(30)"]
 */
export function parseTerms(expr: string): string[] {
  if (!expr) return [''];

  const terms: string[] = [];
  let current = '';
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (TERM_OPERATORS.has(ch) && current !== '') {
      // Check if this is a unary operator (after another operator or open paren)
      const lastCh = current.slice(-1);
      const isUnary =
        TERM_OPERATORS.has(lastCh) ||
        lastCh === '(' ||
        current === '';

      if (isUnary) {
        // Unary: attach to current term
        current += ch;
      } else {
        // Binary: start new term
        terms.push(current);
        current = ch;
      }
    } else {
      current += ch;
    }
    i++;
  }

  if (current !== '') terms.push(current);
  return terms;
}

/**
 * Inserts \n at term boundaries so no term is split across lines.
 *
 * @param expr         Raw expression (no \n)
 * @param charsPerLine Approximate characters that fit on one line
 */
export function formatExpressionForDisplay(
  expr:         string,
  charsPerLine: number,
): string {
  if (!expr || charsPerLine <= 0) return expr;

  const terms = parseTerms(expr);
  const lines: string[] = [];
  let currentLine = '';

  for (const term of terms) {
    if (currentLine === '') {
      // Always start with first term, even if it's longer than the line
      currentLine = term;
    } else if (currentLine.length + term.length <= charsPerLine) {
      // Term fits — append to current line
      currentLine += term;
    } else {
      // Term doesn't fit — push current line and start fresh
      lines.push(currentLine);
      currentLine = term;
    }
  }

  if (currentLine !== '') lines.push(currentLine);

  return lines.join('\n');
}

/**
 * Maps a position in the raw expression to the equivalent
 * position in the formatted expression (which has extra \n chars).
 */
export function rawPosToFormatted(
  rawPos:    number,
  formatted: string,
): number {
  let raw = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (raw === rawPos) return i;
    if (formatted[i] !== '\n') raw++;
  }
  return formatted.length;
}

/**
 * Maps a position in the formatted expression back to the raw position.
 */
export function formattedPosToRaw(
  formattedPos: number,
  formatted:    string,
): number {
  let raw = 0;
  for (let i = 0; i < formattedPos && i < formatted.length; i++) {
    if (formatted[i] !== '\n') raw++;
  }
  return raw;
}