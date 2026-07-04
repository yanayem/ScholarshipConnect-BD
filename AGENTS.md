# Expo & Firebase Transition

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

**BIG STEP:** User authentication has migrated from SimpleJWT to **Firebase Authentication**.
- Backend now uses `FirebaseAuthentication` (verifies ID tokens).
- Frontend should use Firebase SDK for login/register.
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set in backend `.env`.
