import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * FIREBASE SERVICE: Cross-platform abstraction for Firebase Authentication.
 * - Handles both Web (Firebase JS SDK) and Native (@react-native-firebase).
 * - Prevents crashes in Expo Go by checking execution environment.
 */

let auth;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (Platform.OS === 'web') {
    const { initializeApp, getApps, getApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');

    // Values extracted from google-services.json
    const firebaseConfig = {
        apiKey: "AIzaSyDV2ZZJNm0usC2OBE0dM1bjrmL7UurH06M",
        authDomain: "scholarships-bd.firebaseapp.com",
        projectId: "scholarships-bd",
        storageBucket: "scholarships-bd.firebasestorage.app",
        messagingSenderId: "1092212923801",
        appId: "1:1092212923801:web:placeholder" // Replace with actual Web App ID from Firebase Console
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} else if (!isExpoGo) {
    try {
        const fbAuth = require('@react-native-firebase/auth');
        auth = fbAuth.default();
    } catch (e) {
        console.warn('[FIREBASE] Native auth initialization failed:', e.message);
    }
}

export const firebaseAuth = {
    async signIn(email, password) {
        if (Platform.OS === 'web') {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            return await signInWithEmailAndPassword(auth, email, password);
        } else {
            if (!auth) throw new Error('Firebase Auth not available');
            return await auth.signInWithEmailAndPassword(email, password);
        }
    },

    async signUp(email, password) {
        if (Platform.OS === 'web') {
            const { createUserWithEmailAndPassword } = require('firebase/auth');
            return await createUserWithEmailAndPassword(auth, email, password);
        } else {
            if (!auth) throw new Error('Firebase Auth not available');
            return await auth.createUserWithEmailAndPassword(email, password);
        }
    },

    async signOut() {
        if (Platform.OS === 'web') {
            const { signOut } = require('firebase/auth');
            return await signOut(auth);
        } else {
            if (auth) await auth.signOut();
        }
    },

    getCurrentUser() {
        return auth?.currentUser;
    },

    async getIdToken(forceRefresh = false) {
        const user = auth?.currentUser;
        if (!user) return null;
        return await user.getIdToken(forceRefresh);
    },

    onAuthStateChanged(callback) {
        if (Platform.OS === 'web') {
            const { onAuthStateChanged } = require('firebase/auth');
            return onAuthStateChanged(auth, callback);
        } else if (auth) {
            return auth.onAuthStateChanged(callback);
        }
        return () => {};
    }
};
