export const BREAKPOINTS = {
    tablet: 768,
    landscape: 600,
};

export const SPACE = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const BUTTON_SIZE = {
    phone: { size: 72, gap: 5, fontSize: 24 },
    tablet: { size: 80, gap: 6, fontSize: 26 }, // ← bajado de 88 a 80
    landscape: { size: 62, gap: 5, fontSize: 20 },
    tabletLandscape: { size: 76, gap: 6, fontSize: 24 },
};

export const CONTENT_PADDING = {
    phone: 16,
    tablet: 24,
};

// Fixed display heights — prevents display from shrinking when sci grid appears
export const DISPLAY_HEIGHT = {
    phone: 140,
    tablet: 180,  // ← fixed, never shrinks
    landscape: 90,
    tabletLandscape: 120,
};

export const TYPOGRAPHY = {
    phone: {
        expressionLarge: 42,
        expressionMedium: 28,
        resultSize: 22,
        displayThreshold: 14,
    },
    tablet: {
        expressionLarge: 52,   // ← bajado de 56
        expressionMedium: 36,   // ← bajado de 38
        resultSize: 26,   // ← bajado de 28
        displayThreshold: 18,
    },
    landscape: {
        expressionLarge: 34,
        expressionMedium: 24,
        resultSize: 18,
        displayThreshold: 14,
    },
    tabletLandscape: {
        expressionLarge: 44,
        expressionMedium: 30,
        resultSize: 22,
        displayThreshold: 16,
    },
};