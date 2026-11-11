import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';

export default function BanglaQRPaymentScreen() {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        const res = await apiService.initiateCheckout('BanglaQR');
        if (res.ok) {
            router.replace('/(tabs)/profile');
            Alert.alert('Payment Verified!', 'Your lifetime ScholarConnect Pro membership is now active.');
        } else {
            Alert.alert('Error', 'Bangla QR payment verification failed.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#00965E" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bangla QR Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <View style={styles.qrHeader}>
                        <FontAwesome5 name="qrcode" size={28} color="#00965E" />
                        <Text style={styles.qrTitle}>Bangla QR Code</Text>
                        <Text style={styles.qrSub}>Scan using bKash, Nagad, Rocket or any BD Bank App</Text>
                    </View>

                    <View style={styles.qrBox}>
                        <FontAwesome5 name="qrcode" size={160} color="#111" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>বাংলা QR</Text>
                        </View>
                    </View>

                    <Text style={styles.merchantCode}>Merchant Code: 01700000000.SCBD</Text>
                    <Text style={styles.amount}>Payable Amount: 500.00 BDT</Text>

                    <TouchableOpacity
                        style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                <Text style={styles.confirmBtnText}>I Have Scanned & Paid</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel Transaction</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#00965E' },
    header: {
        height: 90,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30
    },
    backBtn: { padding: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        ...theme.shadows.premium
    },
    qrHeader: { alignItems: 'center', marginBottom: 20 },
    qrTitle: { fontSize: 20, fontWeight: 'bold', color: '#00965E', marginTop: 8 },
    qrSub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
    qrBox: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(0,150,94,0.2)',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    badge: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00965E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    badgeText: { color: '#00965E', fontWeight: 'bold', fontSize: 10 },
    merchantCode: { fontSize: 13, fontFamily: theme.typography.fontFamily.bold, color: '#333', marginBottom: 6 },
    amount: { fontSize: 18, fontWeight: 'bold', color: '#00965E', marginBottom: 24 },
    confirmBtn: {
        backgroundColor: '#00965E',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12
    },
    confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    cancelBtn: { padding: 10 },
    cancelText: { color: '#888', fontWeight: '600', fontSize: 13 }
});
