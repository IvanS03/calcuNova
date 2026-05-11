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
    tablet: { size: 88, gap: 7, fontSize: 30 },
    landscape: { size: 56, gap: 4, fontSize: 18 },
    tabletLandscape: { size: 66, gap: 4, fontSize: 21 },
};

export const CONTENT_PADDING = {
    phone: 16,
    tablet: 24,
};

export const TYPOGRAPHY = {
    phone: {
        expressionLarge: 42,
        expressionMedium: 28,
        resultSize: 22,
        displayThreshold: 14,
    },
    tablet: {
        expressionLarge: 56,
        expressionMedium: 38,
        resultSize: 28,
        displayThreshold: 18,
    },
    landscape: {
        expressionLarge: 26,
        expressionMedium: 20,
        resultSize: 38,
        displayThreshold: 14,
    },
    tabletLandscape: {
        expressionLarge: 32,
        expressionMedium: 24,
        resultSize: 48,
        displayThreshold: 16,
    },
};

// Fixed UI chrome heights used for button size calculation
export const UI_CHROME = {
    // Portrait
    topBar: 48,  // ModeBar + ThemeButton row
    displayPortrait: 160, // fixed display area height (phone)
    displayTablet: 200, // fixed display area height (tablet)
    divider: 17,  // hairline + marginVertical*2
    backspaceRow: 40,  // ⌫ row height
    // Shared
    rowGap: 2,  // marginVertical per row
};