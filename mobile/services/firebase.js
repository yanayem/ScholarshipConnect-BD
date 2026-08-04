import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * FIREBASE SERVICE: Cross-platform abstraction for Firebase Authentication.
 * - Handles both Web (Firebase JS SDK) and Native (@react-native-firebase).
 * - Prevents crashes in Expo Go by checking execution environment.
 */

let auth;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (Platform.OS === 'web' || isExpoGo) {
    const { initializeApp, getApps, getApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');

    // Values extracted from Firebase Console (Web App)
    const firebaseConfig = {
        apiKey: "AIzaSyB2nt8ujKLj6rDUN6GwyOK36BZaJ_dxBwM",
        authDomain: "scholarships-bd.firebaseapp.com",
        projectId: "scholarships-bd",
        storageBucket: "scholarships-bd.firebasestorage.app",
        messagingSenderId: "1092212923801",
        appId: "1:1092212923801:web:230adde622f8daecf0c708",
        measurementId: "G-FX0EV392R7"
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} else {
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

        // Handle both Namespaced and Modular (v22+) styles to avoid warnings
        try {
            if (typeof user.getIdToken === 'function') {
                return await user.getIdToken(forceRefresh);
            }
            // Fallback for some library versions
            return await user.getIdToken;
        } catch (e) {
            console.error('[FIREBASE] Failed to get ID token:', e);
            return null;
        }
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
