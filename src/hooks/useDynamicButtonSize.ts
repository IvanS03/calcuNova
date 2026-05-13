import { useMemo } from 'react';
import { BUTTON_SIZE, SPACE, UI_CHROME } from '../constants/layout';
import { rsp } from '../utils/responsive';

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
const SCI_BOOST = 1.08;

function clamp(v: number, min: number, max: number) {
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
        const hPad = (isTablet ? SPACE.md * 2 : SPACE.md * 2);
        const safeH = insetTop + insetBottom + SPACE.xs * 2;
        const safeW = insetLeft + insetRight + hPad * 2;

        // ── LANDSCAPE ──────────────────────────────────
        if (isLandscape || isTabletLandscape) {
            const colW = screenWidth * 0.5 - SPACE.md * 2 - SPACE.sm;
            const colH = screenHeight - safeH;

            const rows = sciMode ? BASIC_ROWS + SCI_ROWS : BASIC_ROWS;
            const cols = sciMode ? SCI_COLS : BASIC_COLS;
            const gap = rsp(4);

            const byH = Math.floor((colH - rows * gap * 2) / rows);
            const byW = Math.floor((colW - cols * gap * 2) / cols);
            const raw = Math.min(byH, byW);

            const min = isTabletLandscape ? rsp(48) : rsp(40);
            const max = isTabletLandscape
                ? BUTTON_SIZE.tabletLandscape.size
                : BUTTON_SIZE.landscape.size;

            const size = clamp(sciMode ? Math.floor(raw * SCI_BOOST) : raw, min, max);
            return { buttonSize: size, dynamicSize: size };
        }

        // ── PORTRAIT ───────────────────────────────────
        const displayH = isTablet
            ? UI_CHROME.displayTablet
            : UI_CHROME.displayPortrait;

        const chromeH = UI_CHROME.topBar
            + displayH
            + UI_CHROME.divider
            + UI_CHROME.backspaceRow;

        const availH = screenHeight - safeH - chromeH;
        const availW = screenWidth - safeW;

        const rows = sciMode ? BASIC_ROWS + SCI_ROWS : BASIC_ROWS;
        const cols = sciMode ? SCI_COLS : BASIC_COLS;
        const gap = isTablet ? rsp(7) : rsp(5);

        const byH = Math.floor((availH - rows * gap * 2) / rows);
        const byW = Math.floor((availW - cols * gap * 2) / cols);
        const raw = Math.min(byH, byW);

        const min = isTablet ? rsp(60) : rsp(52);
        const max = isTablet
            ? BUTTON_SIZE.tablet.size
            : BUTTON_SIZE.phone.size;

        const size = clamp(sciMode ? Math.floor(raw * SCI_BOOST) : raw, min, max);
        return { buttonSize: size, dynamicSize: size };

    }, [
        screenWidth, screenHeight,
        insetTop, insetBottom, insetLeft, insetRight,
        isTablet, isLandscape, isTabletLandscape, sciMode,
    ]);
}