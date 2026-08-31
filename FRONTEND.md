# Mobile Frontend Documentation - ScholarshipConnect-BD

This mobile application is built using **Expo (React Native)** with **Expo Router**. It features a modern scholarship discovery platform with AI integration and Firebase authentication.

---

## 📂 Directory Structure Deep Dive

### 1. `app/` (Routing & Navigation)
Expo Router uses file-based routing. The folder structure mirrors the app's navigation.

*   **`_layout.js` (The Root)**: This is the entry point. It wraps the entire app in Context Providers (`UserProvider`, `ToastProvider`). It also loads custom fonts and sets the global theme.
*   **`index.js`**: The first screen that loads. It checks if a user is logged in (via `AsyncStorage`) and redirects them to either `(auth)/login` or `(tabs)/index`.
*   **`(tabs)/` (Bottom Navigation)**:
    *   `index.js`: The Dashboard. Shows "Recommended for You" scholarships using the AI Matchmaker.
    *   `scholarships.js`: A list of all scholarships with search and filter functionality.
    *   `community.js`: A social-media-like feed for success stories and discussions.
    *   `inbox.js`: Central hub for all chat conversations.
    *   `profile.js`: User settings, academic info, and access to the "Admin Portal" (if the user is staff).
*   **`ai-tools/`**: Contains specialized screens for AI-driven tasks like `sop-generator.js` and `cv-reviewer.js`.
*   **`scholarships/[id].js`**: Dynamic route. When a user taps a scholarship, this file fetches details for that specific ID.

### 2. `services/` (The Engine)
*   **`api.js`**: 
    *   **Interceptor Logic**: Before every request, it calls `getToken()` to get a fresh Firebase ID token.
    *   **Error Handling**: If the backend returns a `401 Unauthorized`, it automatically attempts to refresh the token via Firebase.
    *   **Relative to Absolute URL**: It converts relative media paths from Django (e.g., `/media/photo.jpg`) into absolute URLs that the phone can display.
*   **`firebase.js`**:
    *   **Hybrid Initialization**: It detects if you are in development (Expo Go) or production (APK). 
    *   **Auth Methods**: Handles `signInWithEmailAndPassword` and `GoogleSignin`.
*   **`notifications.js`**: Interfaces with Firebase Cloud Messaging (FCM). It requests permission and generates the `fcm_token` which is then saved to the Django backend.

### 3. `context/` (State Management)
*   **`UserContext.js`**: The "Heart" of the app. It stores the `user` object. Any screen can call `useUser()` to get the student's name, CGPA, or Pro status without refetching from the API.
*   **`ToastContext.js`**: Used for non-intrusive alerts. Instead of `alert()`, we use `showToast("Success!", "success")` for a better UI experience.

### 4. `constants/` (Dev Configuration)
*   **`Config.js`**: 
    *   **Local Testing**: You must update `PC_IP` whenever you change Wi-Fi networks.
    *   **Backend Switching**: It automatically detects if the app is a "production build" and switches the `API_URL` to the live Render server.

---

## 🔐 Authentication Flow (The "Deep" Part)

1.  **Frontend**: User enters email/pass -> `firebaseAuth.signIn()` -> Firebase returns a long cryptographic **ID Token**.
2.  **Storage**: The token is saved in `AsyncStorage`.
3.  **API Call**: `apiService.getProfile()` is called. 
4.  **Header**: `api.js` adds `Authorization: Bearer <ID_TOKEN>` to the request.
5.  **Backend Verification**:
    *   Django receives the token.
    *   It sends the token to Firebase Admin SDK to verify it's real.
    *   If valid, Django finds or creates a user with that Firebase UID.
    *   If the email matches `ADMIN_EMAILS` in `.env`, the user is granted staff access.

---

## 🛠 Troubleshooting Common Issues

### 1. "Network Request Failed"
*   **Cause**: The app can't see the Django server.
*   **Fix**: 
    *   Check `Config.js` has your current `PC_IP`.
    *   Make sure your phone and PC are on the same Wi-Fi.
    *   Check that your PC Firewall allows port 8000.

### 2. "401 Unauthorized" (Repeatedly)
*   **Cause**: Firebase token verification failed on the backend.
*   **Fix**:
    *   Check the backend console for `[FIREBASE AUTH ERROR]`.
    *   Ensure the `firebase-service-account.json` in the `backend/` folder matches the one in your Firebase console.
    *   Synchronize the time on your PC and Phone.

### 3. Image Not Loading
*   **Cause**: Django is returning `localhost:8000` but the phone needs `YOUR_IP:8000`.
*   **Fix**: The `handleResponse` function in `api.js` is designed to fix this automatically. Ensure `API_URL` is set correctly in `Config.js`.
