export type UnitCategory =
  | 'length'
  | 'weight'
  | 'volume'
  | 'temperature'
  | 'area'
  | 'speed';

export interface Unit {
  key:    string;
  label:  string;
  symbol: string;
  // All units convert through a base unit (SI)
  // toBase: value in this unit → base unit
  // fromBase: base unit → this unit
  toBase:   (v: number) => number;
  fromBase: (v: number) => number;
}

export interface Category {
  key:   UnitCategory;
  label: string;
  units: Unit[];
}

export const CATEGORIES: Category[] = [
  {
    key: 'length',
    label: 'Longitud',
    units: [
      { key: 'km',  label: 'Kilómetros',  symbol: 'km',
        toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { key: 'm',   label: 'Metros',      symbol: 'm',
        toBase: v => v,              fromBase: v => v },
      { key: 'cm',  label: 'Centímetros', symbol: 'cm',
        toBase: v => v / 100,        fromBase: v => v * 100 },
      { key: 'mm',  label: 'Milímetros',  symbol: 'mm',
        toBase: v => v / 1000,       fromBase: v => v * 1000 },
      { key: 'in',  label: 'Pulgadas',    symbol: 'in',
        toBase: v => v * 0.0254,     fromBase: v => v / 0.0254 },
      { key: 'ft',  label: 'Pies',        symbol: 'ft',
        toBase: v => v * 0.3048,     fromBase: v => v / 0.3048 },
      { key: 'yd',  label: 'Yardas',      symbol: 'yd',
        toBase: v => v * 0.9144,     fromBase: v => v / 0.9144 },
      { key: 'mi',  label: 'Millas',      symbol: 'mi',
        toBase: v => v * 1609.344,   fromBase: v => v / 1609.344 },
    ],
  },
  {
    key: 'weight',
    label: 'Peso',
    units: [
      { key: 'kg',  label: 'Kilogramos', symbol: 'kg',
        toBase: v => v,              fromBase: v => v },
      { key: 'g',   label: 'Gramos',     symbol: 'g',
        toBase: v => v / 1000,       fromBase: v => v * 1000 },
      { key: 'mg',  label: 'Miligramos', symbol: 'mg',
        toBase: v => v / 1e6,        fromBase: v => v * 1e6 },
      { key: 'lb',  label: 'Libras',     symbol: 'lb',
        toBase: v => v * 0.453592,   fromBase: v => v / 0.453592 },
      { key: 'oz',  label: 'Onzas',      symbol: 'oz',
        toBase: v => v * 0.0283495,  fromBase: v => v / 0.0283495 },
      { key: 't',   label: 'Toneladas',  symbol: 't',
        toBase: v => v * 1000,       fromBase: v => v / 1000 },
    ],
  },
  {
    key: 'volume',
    label: 'Volumen',
    units: [
      { key: 'l',   label: 'Litros',      symbol: 'L',
        toBase: v => v,              fromBase: v => v },
      { key: 'ml',  label: 'Mililitros',  symbol: 'mL',
        toBase: v => v / 1000,       fromBase: v => v * 1000 },
      { key: 'm3',  label: 'Metros³',     symbol: 'm³',
        toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { key: 'gal', label: 'Galones',     symbol: 'gal',
        toBase: v => v * 3.78541,    fromBase: v => v / 3.78541 },
      { key: 'floz',label: 'Fl. oz',      symbol: 'fl oz',
        toBase: v => v * 0.0295735,  fromBase: v => v / 0.0295735 },
      { key: 'cup', label: 'Tazas',       symbol: 'cup',
        toBase: v => v * 0.236588,   fromBase: v => v / 0.236588 },
      { key: 'tbsp',label: 'Cucharadas',  symbol: 'tbsp',
        toBase: v => v * 0.0147868,  fromBase: v => v / 0.0147868 },
      { key: 'tsp', label: 'Cucharaditas',symbol: 'tsp',
        toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
    ],
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    units: [
      { key: 'c',  label: 'Celsius',    symbol: '°C',
        toBase: v => v,                    fromBase: v => v },
      { key: 'f',  label: 'Fahrenheit', symbol: '°F',
        toBase: v => (v - 32) * 5 / 9,    fromBase: v => v * 9 / 5 + 32 },
      { key: 'k',  label: 'Kelvin',     symbol: 'K',
        toBase: v => v - 273.15,           fromBase: v => v + 273.15 },
    ],
  },
  {
    key: 'area',
    label: 'Área',
    units: [
      { key: 'm2',  label: 'Metros²',      symbol: 'm²',
        toBase: v => v,              fromBase: v => v },
      { key: 'km2', label: 'Kilómetros²',  symbol: 'km²',
        toBase: v => v * 1e6,        fromBase: v => v / 1e6 },
      { key: 'cm2', label: 'Centímetros²', symbol: 'cm²',
        toBase: v => v / 1e4,        fromBase: v => v * 1e4 },
      { key: 'ha',  label: 'Hectáreas',    symbol: 'ha',
        toBase: v => v * 1e4,        fromBase: v => v / 1e4 },
      { key: 'ft2', label: 'Pies²',        symbol: 'ft²',
        toBase: v => v * 0.092903,   fromBase: v => v / 0.092903 },
      { key: 'in2', label: 'Pulgadas²',    symbol: 'in²',
        toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
      { key: 'ac',  label: 'Acres',        symbol: 'ac',
        toBase: v => v * 4046.86,    fromBase: v => v / 4046.86 },
    ],
  },
  {
    key: 'speed',
    label: 'Velocidad',
    units: [
      { key: 'ms',  label: 'Metros/seg',  symbol: 'm/s',
        toBase: v => v,              fromBase: v => v },
      { key: 'kmh', label: 'Km/hora',     symbol: 'km/h',
        toBase: v => v / 3.6,        fromBase: v => v * 3.6 },
      { key: 'mph', label: 'Millas/hora', symbol: 'mph',
        toBase: v => v * 0.44704,    fromBase: v => v / 0.44704 },
      { key: 'kn',  label: 'Nudos',       symbol: 'kn',
        toBase: v => v * 0.514444,   fromBase: v => v / 0.514444 },
    ],
  },
];

// Convert a value from one unit to another within the same category
export function convert(
  value: number,
  fromKey: string,
  toKey: string,
  category: UnitCategory
): number {
  const cat  = CATEGORIES.find(c => c.key === category)!;
  const from = cat.units.find(u => u.key === fromKey)!;
  const to   = cat.units.find(u => u.key === toKey)!;
  const base = from.toBase(value);
  return to.fromBase(base);
}

// Format result: avoid unnecessary decimals
export function formatResult(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '';
  const rounded = parseFloat(value.toFixed(8));
  return String(rounded);
}