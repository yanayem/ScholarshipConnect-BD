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
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2nt8ujKLj6rDUN6GwyOK36BZaJ_dxBwM",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "scholarships-bd.firebaseapp.com",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "scholarships-bd",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "scholarships-bd.firebasestorage.app",
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1092212923801",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1092212923801:web:230adde622f8daecf0c708",
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FX0EV392R7"
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} else {
    try {
        const fbAuth = require('@react-native-firebase/auth');
        auth = fbAuth.default();

        // Initialize Google Sign-in for Native
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
            // The Web Client ID is required for Firebase auth to work with Google Sign-in on Android
            // You can find this in Firebase Console -> Project Settings -> Authentication -> Google -> Web Client ID
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1092212923801-v6l82n7u9p5n5n5n5n5n5n5n5n5n5n5n.apps.googleusercontent.com',
            offlineAccess: true,
        });
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

    async signInWithGoogle() {
        if (Platform.OS === 'web' || isExpoGo) {
            const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
            const provider = new GoogleAuthProvider();
            return await signInWithPopup(auth, provider);
        } else {
            try {
                const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                // Get the idToken correctly based on the response structure (v13+ uses .data)
                const idToken = userInfo.data ? userInfo.data.idToken : userInfo.idToken;

                if (!idToken) {
                    console.error('[FIREBASE] Google Sign-In succeeded but idToken is null. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env');
                    throw new Error('Google ID Token is missing. Please verify your configuration.');
                }

                const fbAuth = require('@react-native-firebase/auth');
                const googleCredential = fbAuth.default.GoogleAuthProvider.credential(idToken);
                return await auth.signInWithCredential(googleCredential);
            } catch (e) {
                console.error('[FIREBASE] Google Sign-In failed:', e.message);
                throw e;
            }
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

    async sendPasswordReset(email) {
        if (Platform.OS === 'web' || isExpoGo) {
            const { sendPasswordResetEmail } = require('firebase/auth');
            return await sendPasswordResetEmail(auth, email);
        } else {
            if (!auth) throw new Error('Firebase Auth not available');
            return await auth.sendPasswordResetEmail(email);
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
    },

    /**
     * Helper to wait for Firebase to initialize and return the current user
     * @returns {Promise<any>}
     */
    waitForUser() {
        return new Promise((resolve) => {
            const user = auth?.currentUser;
            if (user) return resolve(user);

            const unsubscribe = this.onAuthStateChanged((u) => {
                unsubscribe();
                resolve(u);
            });

            // Absolute timeout of 5 seconds to prevent hanging
            setTimeout(() => {
                unsubscribe();
                resolve(auth?.currentUser || null);
            }, 5000);
        });
    }
};
