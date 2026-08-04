import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function PaymentFailScreen() {
    const { error } = useLocalSearchParams();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ]).start();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.content}>
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <MaterialIcons name="error-outline" size={100} color={theme.colors.error} />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
                    <Text style={styles.title}>Payment Failed</Text>
                    <Text style={styles.subtitle}>Something went wrong with your transaction.</Text>

                    <View style={[styles.errorCard, theme.shadows.soft]}>
                        <Text style={styles.errorLabel}>Error Details</Text>
                        <Text style={styles.errorValue}>{error || 'The transaction was cancelled or declined by the provider.'}</Text>
                    </View>

                    <Text style={styles.footerNote}>
                        Don&apos;t worry, no money was deducted from your account. You can try again or use a different payment method.
                    </Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => router.replace('/checkout')}
                >
                    <Text style={styles.retryBtnText}>Try Again</Text>
                    <MaterialIcons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Text style={styles.homeBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff', padding: 24 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: { fontSize: 26, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 8 },
    subtitle: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 40 },
    errorCard: {
        width: '100%',
        backgroundColor: '#FFF8F8',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#FFEBEB',
    },
    errorLabel: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 8 },
    errorValue: { fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.error, textAlign: 'center' },
    footerNote: { marginTop: 32, fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
    footer: { gap: 16, marginBottom: 20 },
    retryBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...theme.shadows.teal,
    },
    retryBtnText: { color: '#fff', fontSize: 16, fontFamily: theme.typography.fontFamily.bold },
    homeBtn: { height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    homeBtnText: { color: theme.colors.textSecondary, fontSize: 14, fontFamily: theme.typography.fontFamily.medium },
});
