import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE } from '../constants/layout';
import { rf, rsp } from '../utils/responsive';

interface ToastProps {
    message: string;
    visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-8)).current;
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (!mounted.current) return;

        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 4,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -8,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!message) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + SPACE.sm,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
            pointerEvents="none"
        >
            <View style={styles.pill}>
                <Text style={styles.icon}>⚠</Text>
                <Text style={styles.text} numberOfLines={1}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.xs,
        backgroundColor: 'rgba(30,30,30,0.88)',
        paddingHorizontal: rsp(14),
        paddingVertical: rsp(8),
        borderRadius: rsp(20),
        borderWidth: 1,
        borderColor: '#ff453a44',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        fontSize: rf(13),
        color: '#ff453a',
    },
    text: {
        fontSize: rf(13),
        fontWeight: '500',
        color: '#ffffff',
        flexShrink: 1,
    },
});