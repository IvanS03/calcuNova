import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Physical screen diagonal in inches (approximate)
const pxW = W * PixelRatio.get();
const pxH = H * PixelRatio.get();
const diagPx = Math.sqrt(pxW * pxW + pxH * pxH);
const diagIn = diagPx / PixelRatio.get() / 160; // 160 = mdpi baseline

// True tablet: physical diagonal > 6.5 inches
export const isTabletDevice = diagIn > 6.5;

// Reference design widths
const REF_PHONE_W = 390;  // iPhone 14 Pro
const REF_TABLET_W = 800;  // iPad Air

// Scale factor relative to reference design
const refW = isTabletDevice ? REF_TABLET_W : REF_PHONE_W;

// Clamp scale so extreme screens don't go wild
export const wScale = clamp(W / refW, 0.65, 1.6);
export const hScale = clamp(H / (isTabletDevice ? 600 : 844), 0.65, 1.6);

// General scale: average of w/h but weighted toward width
export const appScale = wScale * 0.6 + hScale * 0.4;

// Responsive size: scales linearly with screen
export function rs(size: number): number {
    return Math.round(size * appScale);
}

// Responsive font: also respects system font scale
export function rf(size: number): number {
    return Math.round(rs(size) / PixelRatio.getFontScale());
}

// Responsive spacing (less aggressive than rs)
export function rsp(size: number): number {
    return Math.round(size * Math.sqrt(appScale)); // sqrt = softer curve
}

// Percentage of screen width/height
export function wp(percent: number): number {
    return Math.round(W * percent / 100);
}

export function hp(percent: number): number {
    return Math.round(H * percent / 100);
}

function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}