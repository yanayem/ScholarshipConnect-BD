import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';

/**
 * BKASH IN-APP PAYMENT:
 * - Native UI for bKash Number, OTP and PIN entry.
 * - Simulates the real bKash API flow.
 */
export default function BKashPaymentScreen() {
    const [step, setStep] = useState(1); // 1: Number, 2: OTP, 3: PIN
    const [number, setNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentID, setPaymentID] = useState(null);

    const handleNext = async () => {
        if (step === 1) {
            if (number.length < 11) return Alert.alert('Invalid Number', 'Enter a valid bKash number.');
            setLoading(true);
            const res = await apiService.createBKashPayment();
            if (res.ok) {
                setPaymentID(res.data.paymentID);
                setStep(2);
            } else {
                Alert.alert('Error', 'Could not initialize bKash payment.');
            }
            setLoading(false);
        } else if (step === 2) {
            if (otp.length < 6) return Alert.alert('Invalid OTP', 'Enter the 6-digit OTP sent to your phone.');
            setStep(3);
        } else if (step === 3) {
            if (pin.length < 4) return Alert.alert('Invalid PIN', 'Enter your 5-digit bKash PIN.');
            setLoading(true);
            const res = await apiService.executeBKashPayment(paymentID, otp, pin);
            if (res.ok) {
                router.replace({
                    pathname: '/payment-success',
                    params: { tran_id: paymentID }
                });
            } else {
                Alert.alert('Error', 'Payment verification failed.');
            }
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#D12053" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Image
                    source={{ uri: 'https://logos-world.net/wp-content/uploads/2022/07/BKash-Logo.png' }}
                    style={styles.bkashLogo}
                    resizeMode="contain"
                />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>

                    <View style={styles.contentCard}>
                        {step === 1 && (
                            <View>
                                <Text style={styles.stepTitle}>Enter Your bKash Account Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 01XXXXXXXXX"
                                    keyboardType="phone-pad"
                                    value={number}
                                    onChangeText={setNumber}
                                    autoFocus
                                />
                            </View>
                        )}

                        {step === 2 && (
                            <View>
                                <Text style={styles.stepTitle}>Enter OTP sent to {number}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="6-digit OTP"
                                    keyboardType="numeric"
                                    value={otp}
                                    onChangeText={setOtp}
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>
                        )}

                        {step === 3 && (
                            <View>
                                <Text style={styles.stepTitle}>Enter Your bKash PIN</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="bKash PIN"
                                    keyboardType="numeric"
                                    value={pin}
                                    onChangeText={setPin}
                                    maxLength={5}
                                    secureTextEntry
                                    autoFocus
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.nextBtn, loading && { opacity: 0.7 }]}
                            onPress={handleNext}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>PROCEED</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                            <Text style={styles.cancelText}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.amountText}>Amount: 500.00 BDT</Text>
                </ScrollView>

                <View style={styles.footerInfo}>
                    <Ionicons name="call" size={14} color="#666" />
                    <Text style={styles.footerText}>16247</Text>
                    <View style={{ width: 20 }} />
                    <Ionicons name="globe" size={14} color="#666" />
                    <Text style={styles.footerText}>www.bkash.com</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#D12053' },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30
    },
    backBtn: { padding: 8 },
    bkashLogo: { width: 120, height: 40, marginLeft: 20 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 24,
        ...theme.shadows.premium
    },
    stepTitle: {
        fontSize: 16,
        color: '#D12053',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 14,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 24,
        color: '#333'
    },
    nextBtn: {
        backgroundColor: '#D12053',
        paddingVertical: 14,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 12
    },
    nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { padding: 10, alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: '500' },
    amountText: {
        textAlign: 'center',
        color: '#fff',
        marginTop: 30,
        fontSize: 18,
        fontWeight: 'bold'
    },
    footerInfo: {
        height: 50,
        backgroundColor: '#f1f1f1',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerText: { fontSize: 12, color: '#666', marginLeft: 4 }
});
