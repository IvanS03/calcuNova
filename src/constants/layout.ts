import { hp, isTabletDevice, rf, rs, rsp } from '../utils/responsive';

export const BREAKPOINTS = {
    tablet: 768,
    landscape: 600,
};

// Spacing — responsive
export const SPACE = {
    xs: rsp(4),
    sm: rsp(8),
    md: rsp(16),
    lg: rsp(24),
    xl: rsp(32),
};

// Button sizes — responsive
export const BUTTON_SIZE = {
    phone: { size: rs(72), gap: rsp(5), fontSize: rf(24) },
    tablet: { size: rs(88), gap: rsp(7), fontSize: rf(30) },
    landscape: { size: rs(56), gap: rsp(4), fontSize: rf(18) },
    tabletLandscape: { size: rs(66), gap: rsp(4), fontSize: rf(21) },
};

export const CONTENT_PADDING = {
    phone: rsp(16),
    tablet: rsp(24),
};

// Typography — responsive fonts
export const TYPOGRAPHY = {
    phone: {
        expressionLarge: rf(42),
        expressionMedium: rf(32),
        expressionSmall: rf(24),   // ← nuevo
        thresholdMedium: 18,       // chars antes de reducir a medium
        thresholdSmall: 36,       // chars antes de reducir a small
        resultSize: rf(22),
        displayThreshold: 14,       // kept for landscape
    },
    tablet: {
        expressionLarge: rf(56),
        expressionMedium: rf(42),
        expressionSmall: rf(32),
        thresholdMedium: 22,
        thresholdSmall: 44,
        resultSize: rf(28),
        displayThreshold: 18,
    },
    landscape: {
        expressionLarge: rf(26),
        expressionMedium: rf(20),
        expressionSmall: rf(16),
        thresholdMedium: 16,
        thresholdSmall: 30,
        resultSize: rf(38),
        displayThreshold: 14,
    },
    tabletLandscape: {
        expressionLarge: rf(32),
        expressionMedium: rf(24),
        expressionSmall: rf(18),
        thresholdMedium: 20,
        thresholdSmall: 38,
        resultSize: rf(48),
        displayThreshold: 16,
    },
};

// UI chrome — percentage of screen height so it scales with any DPI
export const UI_CHROME = {
    topBar: hp(6),    // 6% of screen height
    displayPortrait: hp(isTabletDevice ? 22 : 28),
    displayTablet: hp(22),
    divider: rsp(17),
    backspaceRow: hp(5),    // 5% of screen height
    rowGap: rsp(2),
};