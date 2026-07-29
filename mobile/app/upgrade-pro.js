import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { Loader } from '../components/Loader';

const { width } = Dimensions.get('window');

const BENEFITS = [
  { id: 1, title: 'Unlimited AI Tools', desc: 'SOP Helper, CV Reviewer & Live Support without daily limits.', icon: 'auto-fix-high' },
  { id: 2, title: 'Priority Matching', desc: 'Be the first to know about scholarships tailored to your profile.', icon: 'speed' },
  { id: 3, title: 'Verified Badge', desc: 'Stand out in the community with a gold ScholarConnect badge.', icon: 'verified' },
  { id: 4, title: 'Expert Consultations', desc: 'Direct access to premium mentorship sessions.', icon: 'groups' },
];

export default function UpgradeProScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await apiService.getProfile();
    if (res.ok) setUser(res.data);
    setLoading(false);
  };

  const handlePointUpgrade = async () => {
    const cost = 200;
    if ((user?.scholar_points || 0) < cost) {
      Alert.alert('Insufficient Points', `You need ${cost} points. You currently have ${user?.scholar_points || 0}.`);
      return;
    }

    Alert.alert(
      'Upgrade with Points',
      `Unlock Pro for ${cost} ScholarPoints?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessing(true);
            const res = await apiService.upgradeWithPoints();
            if (res.ok) {
              Alert.alert('Success!', 'Welcome to ScholarConnect Pro.');
              router.replace('/(tabs)/profile');
            } else {
              Alert.alert('Error', res.data.error || 'Upgrade failed.');
            }
            setProcessing(false);
          }
        }
      ]
    );
  };

  const handleCashPayment = async () => {
    router.push('/checkout');
  };

  if (loading) return <Loader message="Loading premium offers..." />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <LinearGradient
          colors={['#1B262C', '#0F172A']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
             <View style={styles.proIconBox}>
                <MaterialIcons name="workspace-premium" size={50} color="#FFD700" />
             </View>
             <Text style={styles.headerTitle}>ScholarConnect Pro</Text>
             <Text style={styles.headerSub}>Unlock your full potential in the global scholarship market.</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Why go Pro?</Text>

          {BENEFITS.map((item) => (
            <View key={item.id} style={styles.benefitItem}>
              <View style={styles.iconCircle}>
                <MaterialIcons name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Choose your path</Text>

          {/* Option 1: ScholarPoints */}
          <TouchableOpacity
            style={[styles.paymentCard, (user?.scholar_points || 0) >= 200 ? styles.activeCard : styles.disabledCard]}
            onPress={handlePointUpgrade}
            disabled={processing}
          >
             <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Community Special (7 Days)</Text>
                <Text style={styles.cardMain}>200 ScholarPoints</Text>
                <Text style={styles.cardSub}>Current Balance: {user?.scholar_points || 0} pts</Text>
             </View>
             <MaterialIcons name="stars" size={32} color="#FFD700" />
          </TouchableOpacity>

          {/* Option 2: Cash Payment */}
          <TouchableOpacity
            style={[styles.paymentCard, styles.cashCard]}
            onPress={handleCashPayment}
            disabled={processing}
          >
             <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: '#E0F2F1' }]}>Instant Access (30 Days)</Text>
                <Text style={[styles.cardMain, { color: '#fff' }]}>500 BDT One-time</Text>
                <Text style={[styles.cardSub, { color: 'rgba(255,255,255,0.7)' }]}>SSLCommerz Secure Payment</Text>
             </View>
             <MaterialIcons name="account-balance-wallet" size={32} color="#fff" />
          </TouchableOpacity>

          <View style={styles.footerNote}>
             <MaterialIcons name="security" size={14} color={theme.colors.placeholder} />
             <Text style={styles.footerText}>Secure, encrypted transactions. Cancel anytime.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {processing && (
        <View style={styles.overlay}>
           <ActivityIndicator size="large" color={theme.colors.primary} />
           <Text style={styles.overlayText}>Connecting to secure gateway...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  headerContent: {
    alignItems: 'center',
  },
  proIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  contentCard: {
    padding: 24,
    marginTop: -20,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 20,
    marginTop: 10
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  benefitText: {
    flex: 1
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2
  },
  benefitDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 24
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: 16,
    justifyContent: 'space-between'
  },
  activeCard: {
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    borderWidth: 2,
    ...theme.shadows.soft
  },
  disabledCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.7
  },
  cashCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.teal
  },
  cardInfo: {
    flex: 1
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  cardMain: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading
  },
  cardSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.placeholder
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold'
  }
});
