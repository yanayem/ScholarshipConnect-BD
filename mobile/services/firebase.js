import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * FIREBASE SERVICE: Cross-platform abstraction for Firebase Authentication.
 * - Handles both Web (Firebase JS SDK) and Native (@react-native-firebase).
 */

let auth;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (Platform.OS === 'web' || isExpoGo) {
    const { initializeApp, getApps, getApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');

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
        const fbAuth = require('@react-native-firebase/auth').default;
        auth = fbAuth();

        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1092212923801-v6l82n7u9p5n5n5n5n5n5n5n5n5n5n5n.apps.googleusercontent.com',
            offlineAccess: true,
        });
    } catch (e) {
        console.warn('[FIREBASE] Native auth initialization failed:', e.message);
    }
}

export const firebaseAuth = {
    async signIn(email, password) {
        if (Platform.OS === 'web' || isExpoGo) {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            return await signInWithEmailAndPassword(auth, email, password);
        } else {
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
                const idToken = userInfo.data ? userInfo.data.idToken : userInfo.idToken;

                if (!idToken) throw new Error('Google ID Token is missing.');

                const fbAuth = require('@react-native-firebase/auth').default;
                const googleCredential = fbAuth.GoogleAuthProvider.credential(idToken);
                return await auth.signInWithCredential(googleCredential);
            } catch (e) {
                console.error('[FIREBASE] Google Sign-In failed:', e.message);
                throw e;
            }
        }
    },

    async signUp(email, password) {
        if (Platform.OS === 'web' || isExpoGo) {
            const { createUserWithEmailAndPassword } = require('firebase/auth');
            return await createUserWithEmailAndPassword(auth, email, password);
        } else {
            return await auth.createUserWithEmailAndPassword(email, password);
        }
    },

    async sendPasswordReset(email) {
        if (Platform.OS === 'web' || isExpoGo) {
            const { sendPasswordResetEmail } = require('firebase/auth');
            return await sendPasswordResetEmail(auth, email);
        } else {
            return await auth.sendPasswordResetEmail(email);
        }
    },

    async signOut() {
        if (Platform.OS === 'web' || isExpoGo) {
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
        try {
            return await user.getIdToken(forceRefresh);
        } catch (e) {
            return null;
        }
    },

    onAuthStateChanged(callback) {
        if (Platform.OS === 'web' || isExpoGo) {
            const { onAuthStateChanged } = require('firebase/auth');
            return onAuthStateChanged(auth, callback);
        } else if (auth) {
            return auth.onAuthStateChanged(callback);
        }
        return () => {};
    },

    waitForUser() {
        return new Promise((resolve) => {
            const user = auth?.currentUser;
            if (user) return resolve(user);
            const unsubscribe = this.onAuthStateChanged((u) => {
                unsubscribe();
                resolve(u);
            });
            setTimeout(() => {
                unsubscribe();
                resolve(auth?.currentUser || null);
            }, 5000);
        });
    }
};
