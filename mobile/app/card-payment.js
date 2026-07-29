import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { apiService } from '../services/api';

/**
 * ACADEMIC CARD PAYMENT SCREEN (Simplified):
 * - Professional banking UI using only core React Native components.
 * - No external SDK dependencies (Safe for any environment).
 * - Real-time card visualization for high-quality demo.
 */
export default function CardPaymentScreen() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCardPayment = () => {
        if (!cardNumber || !expiry || !cvv || !cardHolder) {
            Alert.alert("Error", "Please fill in all card details correctly.");
            return;
        }

        setLoading(true);

        // Simulated processing for demo purposes
        setTimeout(async () => {
            const cleanNumber = cardNumber.replace(/\s/g, '');

            if (cleanNumber === '4242424242424242') {
                const res = await apiService.initiateCheckout('DirectCard');
                if (res.ok) {
                    router.replace({
                        pathname: '/payment-success',
                        params: { tran_id: `CARD-${Math.floor(Math.random() * 1000000)}` }
                    });
                } else {
                    Alert.alert("System Error", "Could not sync payment with server.");
                }
            } else {
                Alert.alert(
                    "Payment Failed",
                    "Invalid card number. For academic testing, please use 4242 4242 4242 4242."
                );
            }
            setLoading(false);
        }, 2000);
    };

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const matched = cleaned.match(/.{1,4}/g);
        return matched ? matched.join(' ') : cleaned;
    };

    const formatExpiry = (text) => {
        const cleaned = text.replace(/\//g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Debit/Credit Card</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Visual Card Preview */}
                    <LinearGradient
                        colors={['#1F2937', '#111827']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardPreview}
                    >
                        <View style={styles.cardTop}>
                            <FontAwesome name="cc-visa" size={40} color="#fff" />
                            <Ionicons name="wifi" size={24} color="#fff" style={{ opacity: 0.5 }} />
                        </View>

                        <Text style={styles.previewNumber}>
                            {cardNumber || "•••• •••• •••• ••••"}
                        </Text>

                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                <Text style={styles.cardValue}>{cardHolder.toUpperCase() || "YOUR NAME"}</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardValue}>{expiry || "MM/YY"}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Input Form */}
                    <View style={styles.formBox}>
                        <Text style={styles.formTitle}>Enter Payment Details</Text>

                        <Text style={styles.inputLabel}>Cardholder Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full name on card"
                            placeholderTextColor={theme.colors.placeholder}
                            value={cardHolder}
                            onChangeText={setCardHolder}
                            autoCapitalize="characters"
                        />

                        <Text style={styles.inputLabel}>Card Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="4242 4242 4242 4242"
                            placeholderTextColor={theme.colors.placeholder}
                            keyboardType="numeric"
                            maxLength={19}
                            value={cardNumber}
                            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.inputLabel}>Expiry Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/YY"
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    value={expiry}
                                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.inputLabel}>CVV</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="•••"
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="numeric"
                                    secureTextEntry
                                    maxLength={3}
                                    value={cvv}
                                    onChangeText={setCvv}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.securityNote}>
                         <MaterialIcons name="security" size={16} color={theme.colors.success} />
                         <Text style={styles.securityText}>Academic Demo Mode (Stripe Sandbox Simulation)</Text>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.payBtn, loading && { opacity: 0.8 }]}
                        onPress={handleCardPayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.payBtnText}>Securely Pay 500 BDT</Text>
                                <MaterialIcons name="lock" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F3F4F6' },
    headerTitle: { fontSize: 18, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
    scroll: { padding: 24 },
    cardPreview: {
        height: 200,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        marginBottom: 32,
        ...theme.shadows.premium,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    previewNumber: {
        fontSize: 22,
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 2,
        marginVertical: 20,
        textAlign: 'center'
    },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    cardValue: { fontSize: 14, color: '#fff', fontFamily: theme.typography.fontFamily.semiBold },
    formBox: { marginBottom: 20 },
    formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: theme.colors.heading },
    inputLabel: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8, marginLeft: 4, fontWeight: '600' },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    row: { flexDirection: 'row' },
    securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
    securityText: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic' },
    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#fff' },
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
