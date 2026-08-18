import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * FIREBASE SERVICE: Reliable Hybrid Logic
 * - Native: Uses @react-native-firebase
 * - Web/Expo Go: Uses Firebase JS SDK
 */

const isExpoGo = Constants.executionEnvironment === 'storeClient';
let isNative = Platform.OS !== 'web' && !isExpoGo;

let auth;

// =====================================================
// FIREBASE CONFIG
// =====================================================
const firebaseConfig = {
    apiKey: "AIzaSyDV2ZZJNm0usC2OBE0dM1bjrmL7UurH06M",
    authDomain: "scholarships-bd.firebaseapp.com",
    projectId: "scholarships-bd",
    storageBucket: "scholarships-bd.firebasestorage.app",
    messagingSenderId: "1092212923801",
    appId: "1:1092212923801:android:070c4b1d3fab9411f0c708",
    measurementId: "G-FX0EV392R7"
};

// =====================================================
// INITIALIZE AUTH
// =====================================================
const initializeFirebase = () => {
    if (auth) return;

    try {
        if (isNative) {
            console.log('[FIREBASE] Initializing Native SDK...');
            try {
                // Standard React Native Firebase pattern
                const authModule = require('@react-native-firebase/auth');

                if (authModule) {
                    if (typeof authModule === 'function') {
                        auth = authModule();
                    } else if (authModule.default && typeof authModule.default === 'function') {
                        auth = authModule.default();
                    } else if (authModule.auth && typeof authModule.auth === 'function') {
                        auth = authModule.auth();
                    }
                }

                if (auth) {
                    // Configure Google Sign-In
                    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                    GoogleSignin.configure({
                        webClientId: '1092212923801-q7tb6f1tfmefugca2uur4d7rfgbqaejq.apps.googleusercontent.com',
                        offlineAccess: true,
                    });
                    console.log('[FIREBASE] Native Auth initialization successful');
                } else {
                    throw new Error('Native auth module could not be initialized (returned null/undefined)');
                }
            } catch (nativeErr) {
                console.warn('[FIREBASE] Native SDK initialization failed, falling back to Web SDK:', nativeErr.message);
                isNative = false;
            }
        }
        
        if (!isNative) {
            console.log('[FIREBASE] Initializing Web/Expo Go SDK...');
            const { initializeApp, getApps, getApp } = require('firebase/app');
            const { getAuth } = require('firebase/auth');
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);
            console.log('[FIREBASE] Web Auth initialization successful');
        }

        if (!auth) {
            throw new Error('Auth instance could not be initialized after all attempts');
        }
    } catch (e) {
        console.error('[FIREBASE] Global Initialization error:', e.message);
    }
};

initializeFirebase();

export { auth };

// =====================================================
// AUTH SERVICE
// =====================================================
export const firebaseAuth = {
    async signIn(email, password) {
        if (!auth) initializeFirebase();
        if (!auth) throw new Error('Firebase Auth not initialized');
        try {
            if (isNative) {
                const result = await auth.signInWithEmailAndPassword(email.trim(), password);
                return result.user;
            } else {
                const { signInWithEmailAndPassword } = require('firebase/auth');
                const result = await signInWithEmailAndPassword(auth, email.trim(), password);
                return result.user;
            }
        } catch (error) {
            console.error('[FIREBASE] Login Error:', error.message);
            throw error;
        }
    },

    async signInWithGoogle() {
        if (!auth) initializeFirebase();
        if (!auth) throw new Error('Firebase Auth not initialized');
        if (!isNative) {
            const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
            return await signInWithPopup(auth, new GoogleAuthProvider());
        } else {
            try {
                const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();

                const idToken = response?.data?.idToken || response?.idToken;
                const accessToken = response?.data?.accessToken || response?.accessToken;

                const authModule = require('@react-native-firebase/auth');
                const firebaseAuthNative = authModule.default ? authModule.default : authModule;
                const { GoogleAuthProvider } = firebaseAuthNative;

                const credential = GoogleAuthProvider.credential(idToken, accessToken);
                const result = await auth.signInWithCredential(credential);
                return result.user;
            } catch (error) {
                console.error('[FIREBASE] Google Error:', error.message);
                throw error;
            }
        }
    },

    async signUp(email, password) {
        if (!auth) initializeFirebase();
        if (!auth) throw new Error('Firebase Auth not initialized');
        try {
            if (isNative) {
                const result = await auth.createUserWithEmailAndPassword(email.trim(), password);
                return result.user;
            } else {
                const { createUserWithEmailAndPassword } = require('firebase/auth');
                const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
                return result.user;
            }
        } catch (error) {
            throw error;
        }
    },

    async signOut() {
        try {
            if (isNative) {
                const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                await GoogleSignin.signOut().catch(() => {});
            }
            if (auth) await auth.signOut();
        } catch (error) {
            console.error('[FIREBASE] Logout Error:', error.message);
        }
    },

    async getIdToken(forceRefresh = false) {
        if (!auth) initializeFirebase();
        const user = auth?.currentUser;
        if (!user) return null;
        return await user.getIdToken(forceRefresh);
    },

    async sendPasswordReset(email) {
        if (!auth) initializeFirebase();
        if (!auth) throw new Error('Firebase Auth not initialized');
        try {
            if (isNative) {
                await auth.sendPasswordResetEmail(email);
            } else {
                const { sendPasswordResetEmail } = require('firebase/auth');
                await sendPasswordResetEmail(auth, email);
            }
        } catch (error) {
            console.error('[FIREBASE] Password Reset Error:', error.message);
            throw error;
        }
    },

    async waitForUser() {
        if (!auth) initializeFirebase();
        return new Promise((resolve) => {
            const unsubscribe = this.onAuthStateChanged((user) => {
                if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
                resolve(user);
            });
            setTimeout(() => {
                if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
                resolve(auth?.currentUser);
            }, 5000);
        });
    },

    getCurrentUser() {
        return auth?.currentUser;
    },

    onAuthStateChanged(callback) {
        if (!auth) initializeFirebase();
        if (isNative) return auth?.onAuthStateChanged(callback);
        const { onAuthStateChanged: webOnAuth } = require('firebase/auth');
        return webOnAuth(auth, callback);
    }
};

export default firebaseAuth;
