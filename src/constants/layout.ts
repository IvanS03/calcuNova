import { Dimensions } from 'react-native';
import { hp, isTabletDevice, rf, rs, rsp } from '../utils/responsive';

const { height: H } = Dimensions.get('window');

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
        expressionMedium: rf(28),
        resultSize: rf(22),
        displayThreshold: 14,
    },
    tablet: {
        expressionLarge: rf(56),
        expressionMedium: rf(38),
        resultSize: rf(28),
        displayThreshold: 18,
    },
    landscape: {
        expressionLarge: rf(26),
        expressionMedium: rf(20),
        resultSize: rf(38),
        displayThreshold: 14,
    },
    tabletLandscape: {
        expressionLarge: rf(32),
        expressionMedium: rf(24),
        resultSize: rf(48),
        displayThreshold: 16,
    },
};

// UI chrome — percentage of screen height so it scales with any DPI
export const UI_CHROME = {
    topBar: hp(6),    // 6% of screen height
    displayPortrait: hp(isTabletDevice ? 22 : 20),
    displayTablet: hp(22),
    divider: rsp(17),
    backspaceRow: hp(5),    // 5% of screen height
    rowGap: rsp(2),
};