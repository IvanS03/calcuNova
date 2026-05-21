import { useMemo } from 'react';
import { BUTTON_SIZE } from '../constants/layout';

interface Options {
    screenWidth: number;
    screenHeight: number;
    insetTop: number;
    insetBottom: number;
    insetLeft: number;
    insetRight: number;
    isTablet: boolean;
    isLandscape: boolean;
    isTabletLandscape: boolean;
    sciMode: boolean;
}

interface Result {
    buttonSize: number;
    dynamicSize: number;
}

const BASIC_ROWS = 5;
const SCI_ROWS = 3;
const BASIC_COLS = 4;
const SCI_COLS = 5;
const SCI_BOOST = 1.06;

function clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}

export function useDynamicButtonSize({
    screenWidth,
    screenHeight,
    insetTop,
    insetBottom,
    insetLeft,
    insetRight,
    isTablet,
    isLandscape,
    isTabletLandscape,
    sciMode,
}: Options): Result {
    return useMemo(() => {
        // ── Available canvas after safe area ─────────
        const canvasW = screenWidth - insetLeft - insetRight;
        const canvasH = screenHeight - insetTop - insetBottom;

        // ── LANDSCAPE ────────────────────────────────
        if (isLandscape || isTabletLandscape) {
            // Left column: 50% of canvas minus divider margin
            const colW = canvasW * 0.50 - canvasW * 0.04;
            // Full height minus top/bottom padding (1% each side)
            const colH = canvasH * 0.98;

            const rows = sciMode ? BASIC_ROWS + SCI_ROWS : BASIC_ROWS;
            const cols = sciMode ? SCI_COLS : BASIC_COLS;

            // Gap: 0.5% of canvas height per side
            const gap = canvasH * 0.005;

            const byH = Math.floor((colH - rows * gap * 2) / rows);
            const byW = Math.floor((colW - cols * gap * 2) / cols);
            const raw = Math.min(byH, byW);

            // Min: 5% of canvas height / Max: token from layout
            const min = canvasH * 0.05;
            const max = isTabletLandscape
                ? BUTTON_SIZE.tabletLandscape.size
                : BUTTON_SIZE.landscape.size;

            const boosted = sciMode ? Math.floor(raw * SCI_BOOST) : raw;
            const size = clamp(boosted, min, max);
            return { buttonSize: size, dynamicSize: size };
        }

        // ── PORTRAIT ─────────────────────────────────
        // Chrome percentages of canvas height:
        //   topBar:   6%
        //   display:  22% phone / 24% tablet
        //   divider:  0.5%
        //   padding:  1% top + 1% bottom
        const topBarH = canvasH * 0.06;
        const displayH = canvasH * (isTablet ? 0.24 : 0.22);
        const dividerH = canvasH * 0.005;
        const paddingH = canvasH * 0.02;

        const chromeH = topBarH + displayH + dividerH + paddingH;
        const availH = canvasH - chromeH;

        // Horizontal padding: 3% each side
        const availW = canvasW * 0.94;

        const rows = sciMode ? BASIC_ROWS + SCI_ROWS : BASIC_ROWS;
        const cols = sciMode ? SCI_COLS : BASIC_COLS;

        // Gap: 0.6% of canvas height per side
        const gap = canvasH * 0.006;

        const byH = Math.floor((availH - rows * gap * 2) / rows);
        const byW = Math.floor((availW - cols * gap * 2) / cols);
        const raw = Math.min(byH, byW);

        // Min: 7% of canvas height / Max: token from layout
        const min = canvasH * 0.07;
        const max = isTablet
            ? BUTTON_SIZE.tablet.size
            : BUTTON_SIZE.phone.size;

        const boosted = sciMode ? Math.floor(raw * SCI_BOOST) : raw;
        const size = clamp(boosted, min, max);
        return { buttonSize: size, dynamicSize: size };

    }, [
        screenWidth, screenHeight,
        insetTop, insetBottom, insetLeft, insetRight,
        isTablet, isLandscape, isTabletLandscape,
        sciMode,
    ]);
}