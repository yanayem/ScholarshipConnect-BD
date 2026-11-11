import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';

export default function NagadPaymentScreen() {
    const [step, setStep] = useState(1); // 1: Number, 2: OTP, 3: PIN
    const [number, setNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (step === 1) {
            if (number.length < 11) return Alert.alert('Invalid Number', 'Enter a valid 11-digit Nagad number.');
            setStep(2);
        } else if (step === 2) {
            if (otp.length < 4) return Alert.alert('Invalid OTP', 'Enter the verification code sent to your phone.');
            setStep(3);
        } else if (step === 3) {
            if (pin.length < 4) return Alert.alert('Invalid PIN', 'Enter your 4-digit Nagad PIN.');
            setLoading(true);
            const res = await apiService.initiateCheckout('Nagad');
            if (res.ok) {
                router.replace('/(tabs)/profile');
                Alert.alert('Payment Successful!', 'Your lifetime ScholarConnect Pro membership is now active.');
            } else {
                Alert.alert('Error', 'Nagad payment verification failed.');
            }
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#E42229" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.nagadLogoText}>নগদ Pay</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>

                    <View style={styles.contentCard}>
                        {step === 1 && (
                            <View>
                                <Text style={styles.stepTitle}>Enter Your Nagad Account Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 018XXXXXXXX"
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
                                <Text style={styles.stepTitle}>Enter Your Nagad PIN</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nagad PIN"
                                    keyboardType="numeric"
                                    value={pin}
                                    onChangeText={setPin}
                                    maxLength={4}
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
                    <Text style={styles.footerText}>16167</Text>
                    <View style={{ width: 20 }} />
                    <Ionicons name="globe" size={14} color="#666" />
                    <Text style={styles.footerText}>nagad.com.bd</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#E42229' },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30
    },
    backBtn: { padding: 8 },
    nagadLogoText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        ...theme.shadows.premium
    },
    stepTitle: {
        fontSize: 16,
        color: '#E42229',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 24,
        color: '#333'
    },
    nextBtn: {
        backgroundColor: '#E42229',
        paddingVertical: 14,
        borderRadius: 8,
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
