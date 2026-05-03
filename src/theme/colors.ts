// All color tokens for light and dark mode
export const darkTheme = {
  background:     '#1C1C1E',
  displayBg:      '#1C1C1E',
  divider:        '#3A3A3C',
  expressionText: '#FFFFFF',
  resultText:     '#b47de0',

  btnNumber:      '#1C1C1E',
  btnNumberBorder:'#3A3A3C',
  btnFunction:    '#2C2C2E',
  btnOperator:    '#7119c3',

  btnTextNumber:  '#FFFFFF',
  btnTextFunction:'#FFFFFF',
  btnTextOperator:'#FFFFFF',

  scientificBg:   '#141416',
  scientificBtn:  '#252528',
  scientificText: '#c084f5',

  historyBg:      '#1C1C1E',
  historyItem:    '#2C2C2E',
  historyExpr:    '#AAAAAA',
  historyResult:  '#FFFFFF',
  historyBorder:  '#3A3A3C',

  toggleTrack:    '#7119c3',
  toggleThumb:    '#FFFFFF',
  headerIcon:     '#FFFFFF',
};

export const lightTheme = {
  background:     '#F2F2F7',
  displayBg:      '#F2F2F7',
  divider:        '#C6C6C8',
  expressionText: '#1C1C1E',
  resultText:     '#7119c3',

  btnNumber:      '#FFFFFF',
  btnNumberBorder:'#E5E5EA',
  btnFunction:    '#E5E5EA',
  btnOperator:    '#7119c3',

  btnTextNumber:  '#1C1C1E',
  btnTextFunction:'#1C1C1E',
  btnTextOperator:'#FFFFFF',

  scientificBg:   '#E5E5EA',
  scientificBtn:  '#FFFFFF',
  scientificText: '#7119c3',

  historyBg:      '#F2F2F7',
  historyItem:    '#FFFFFF',
  historyExpr:    '#666666',
  historyResult:  '#1C1C1E',
  historyBorder:  '#C6C6C8',

  toggleTrack:    '#7119c3',
  toggleThumb:    '#FFFFFF',
  headerIcon:     '#1C1C1E',
};

export type AppTheme = typeof darkTheme;