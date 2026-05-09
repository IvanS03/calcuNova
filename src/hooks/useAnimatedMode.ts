import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { AppMode } from '../components/ModeBar';

export function useAnimatedMode(mode: AppMode) {
    const opacity = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const prevMode = useRef<AppMode>(mode);
    const mounted = useRef(false);
    const animation = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            // Stop any in-flight animation on unmount
            animation.current?.stop();
        };
    }, []);

    useEffect(() => {
        // Skip on first render — no previous mode to transition from
        if (!mounted.current) return;
        if (prevMode.current === mode) return;
        prevMode.current = mode;

        // Stop previous animation if still running
        animation.current?.stop();

        const outAnim = Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 8,
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]);

        animation.current = outAnim;

        outAnim.start(({ finished }) => {
            // Only continue if animation completed and component still mounted
            if (!finished || !mounted.current) return;

            translateY.setValue(-8);

            const inAnim = Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 160,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 160,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]);

            animation.current = inAnim;
            inAnim.start();
        });
    }, [mode]);

    return { opacity, translateY };
}