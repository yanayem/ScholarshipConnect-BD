import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Alert, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { Loader } from '../components/Loader';

const { width } = Dimensions.get('window');

/**
 * CHECKOUT PAGE: Final summary before payment gateway.
 * - Displays order details and price.
 * - Integrated with SSLCommerz via backend.
 * - Modern, clean, and secure UI.
 */
export default function CheckoutScreen() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('bKash');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const res = await apiService.getProfile();
        if (res.ok) setUser(res.data);
        setLoading(false);
    };

    const handlePayment = async () => {
        if (selectedMethod === 'SSLCommerz') {
            setProcessing(true);
            const res = await apiService.initiateCheckout('SSLCommerz');
            setProcessing(false);
            if (res.ok && res.data.checkout_url) {
                await WebBrowser.openBrowserAsync(res.data.checkout_url);
            } else {
                Alert.alert('Error', 'Could not initialize gateway.');
            }
            return;
        }

        if (selectedMethod === 'DirectCard') {
            router.push('/card-payment');
            return;
        }

        if (selectedMethod === 'bKash') {
            router.push('/bkash-payment');
            return;
        }
    };

    if (loading) return <Loader message="Preparing your checkout..." />;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Order Summary Card */}
                <View style={[styles.card, theme.shadows.soft]}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="shopping-bag" size={20} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Order Summary</Text>
                    </View>

                    <View style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>ScholarConnect Pro Plan</Text>
                            <Text style={styles.itemType}>30 Days Premium Access</Text>
                        </View>
                        <Text style={styles.itemPrice}>500.00 BDT</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalAmount}>500.00 BDT</Text>
                    </View>
                </View>

                {/* Account Info */}
                <View style={[styles.card, theme.shadows.soft]}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Billing Details</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Name:</Text>
                        <Text style={styles.detailValue}>{user?.full_name || user?.username}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email Address:</Text>
                        <Text style={styles.detailValue}>{user?.email}</Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <TouchableOpacity
                    style={[styles.methodBtn, selectedMethod === 'SSLCommerz' && styles.selectedMethod]}
                    onPress={() => setSelectedMethod('SSLCommerz')}
                >
                    <View style={styles.methodIconBox}>
                         <Image
                            source={{ uri: 'https://avatars.githubusercontent.com/u/12984950?s=200&v=4' }}
                            style={{ width: 34, height: 34 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.methodText}>
                        <Text style={styles.methodTitle}>SSLCommerz Gateway</Text>
                        <Text style={styles.methodSub}>Pay via bKash, Cards, Net Banking etc.</Text>
                    </View>
                    <Ionicons
                        name={selectedMethod === 'SSLCommerz' ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={selectedMethod === 'SSLCommerz' ? theme.colors.primary : theme.colors.placeholder}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.methodBtn, selectedMethod === 'bKash' && styles.selectedMethod]}
                    onPress={() => setSelectedMethod('bKash')}
                >
                    <View style={styles.methodIconBox}>
                        <Image
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/BKash_logo.svg/512px-BKash_logo.svg.png' }}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.methodText}>
                        <Text style={styles.methodTitle}>bKash Wallet</Text>
                        <Text style={styles.methodSub}>Pay using your mobile wallet</Text>
                    </View>
                    <Ionicons
                        name={selectedMethod === 'bKash' ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={selectedMethod === 'bKash' ? theme.colors.primary : theme.colors.placeholder}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.methodBtn, selectedMethod === 'DirectCard' && styles.selectedMethod]}
                    onPress={() => setSelectedMethod('DirectCard')}
                >
                    <View style={styles.methodIconBox}>
                        <MaterialIcons name="credit-card" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.methodText}>
                        <Text style={styles.methodTitle}>Direct Card Entry</Text>
                        <Text style={styles.methodSub}>Pay using Visa, MasterCard or Amex</Text>
                    </View>
                    <Ionicons
                        name={selectedMethod === 'DirectCard' ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={selectedMethod === 'DirectCard' ? theme.colors.primary : theme.colors.placeholder}
                    />
                </TouchableOpacity>

                <View style={styles.securityNote}>
                    <MaterialIcons name="security" size={16} color={theme.colors.success} />
                    <Text style={styles.securityText}>Your payment is secured with SSL 256-bit encryption.</Text>
                </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payBtn, processing && { opacity: 0.8 }]}
                    onPress={handlePayment}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.payBtnText}>Pay 500.00 BDT Now</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: theme.colors.background },
    headerTitle: { fontSize: 20, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
    scroll: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 15, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textPrimary },
    itemType: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    itemPrice: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary },
    divider: { height: 1, backgroundColor: theme.colors.divider, marginVertical: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 14, color: theme.colors.textSecondary },
    totalAmount: { fontSize: 20, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    detailLabel: { fontSize: 13, color: theme.colors.textSecondary },
    detailValue: { fontSize: 13, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary },
    sectionTitle: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 15, marginLeft: 4 },
    methodBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.divider,
        marginBottom: 12,
    },
    selectedMethod: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
    methodIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    methodText: { flex: 1 },
    methodTitle: { fontSize: 15, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textPrimary },
    methodSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, marginBottom: 30 },
    securityText: { fontSize: 11, color: theme.colors.textSecondary },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: theme.colors.divider },
    payBtn: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...theme.shadows.teal,
    },
    payBtnText: { color: '#fff', fontSize: 16, fontFamily: theme.typography.fontFamily.bold },
});
