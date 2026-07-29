import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

/**
 * PAYMENT SUCCESS SCREEN: Celebration page after purchase.
 * - Visual confirmation of Pro status.
 * - Displays a simple "Thank You" with transaction ID.
 * - Redirects to dashboard/tabs.
 */
export default function PaymentSuccessScreen() {
    const { tran_id } = useLocalSearchParams();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();

        // Disable hardware back button to prevent going back to payment form
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.content}>
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <MaterialIcons name="check-circle" size={100} color={theme.colors.success} />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Text style={styles.title}>Payment Successful!</Text>
                    <Text style={styles.subtitle}>Welcome to ScholarConnect Pro</Text>

                    <View style={styles.receiptCard}>
                        <Text style={styles.receiptLabel}>Transaction ID</Text>
                        <Text style={styles.receiptValue}>{tran_id || 'SC-PRO-88291'}</Text>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Amount Paid</Text>
                            <Text style={styles.rowValue}>500.00 BDT</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Status</Text>
                            <Text style={[styles.rowValue, { color: theme.colors.success }]}>COMPLETED</Text>
                        </View>
                    </View>

                    <Text style={styles.footerNote}>
                        Your AI limits have been removed. You can now use all premium features indefinitely.
                    </Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Text style={styles.homeBtnText}>Go to Dashboard</Text>
                    <MaterialIcons name="dashboard" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => router.replace('/(tabs)/profile')}
                >
                    <Text style={styles.profileBtnText}>View My Profile</Text>
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
        backgroundColor: '#F0FFF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.heading,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: 40
    },
    receiptCard: {
        width: '100%',
        backgroundColor: theme.colors.background,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.divider,
    },
    receiptLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 4
    },
    receiptValue: {
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 20
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderRadius: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    rowLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary
    },
    rowValue: {
        fontSize: 14,
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.textPrimary
    },
    footerNote: {
        marginTop: 32,
        fontSize: 13,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20
    },
    footer: { gap: 16, marginBottom: 20 },
    homeBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...theme.shadows.teal,
    },
    homeBtnText: { color: '#fff', fontSize: 16, fontFamily: theme.typography.fontFamily.bold },
    profileBtn: {
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileBtnText: { color: theme.colors.textSecondary, fontSize: 14, fontFamily: theme.typography.fontFamily.medium },
});
