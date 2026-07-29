import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Discover Opportunities',
    description: 'Explore thousands of international scholarships like MEXT, Chevening, and Fulbright tailored for Bangladeshi students.',
    icon: 'school',
    color: theme.colors.primary,
    bgColor: theme.colors.primary
  },
  {
    id: '2',
    title: 'Smart Application Tracking',
    description: 'Never miss a deadline again. Manage your documents in the secure vault and track every application step.',
    icon: 'track-changes',
    color: theme.colors.chartSecondary,
    bgColor: theme.colors.chartSecondary
  },
  {
    id: '3',
    title: 'Connect with Mentors',
    description: 'Get expert guidance from verified mentors and share your journey with our supportive student community.',
    icon: 'people',
    color: theme.colors.warning,
    bgColor: theme.colors.warning
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      await AsyncStorage.setItem('onboarding_version', '4');
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Error saving onboarding state', err);
      router.replace('/(auth)/login');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <MaterialIcons name={item.icon} size={100} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={slides[currentIndex].bgColor}
      />
      <TouchableOpacity style={styles.skipBtn} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp'
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            return (
              <Animated.View
                key={i.toString()}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: slides[currentIndex].color }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slides[currentIndex].color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons
            name={currentIndex === slides.length - 1 ? 'check' : 'arrow-forward'}
            size={20}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  textContainer: { alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30
  },
  paginator: { flexDirection: 'row', height: 64, alignItems: 'center' },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 4 },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 30,
    zIndex: 10,
    padding: 10
  },
  skipText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  nextBtn: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
