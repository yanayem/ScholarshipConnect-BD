# Expo & Firebase Transition

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

**BIG STEP:** User authentication has migrated from SimpleJWT to **Firebase Authentication**.
- Backend now uses `FirebaseAuthentication` (verifies ID tokens).
- Frontend should use Firebase SDK for login/register.
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set in backend `.env`.

**ADMIN ACCESS:**
- To grant admin access to a user, add their email to `ADMIN_EMAILS` in the backend `.env`.
- Alternatively, set `is_staff` and `is_superuser` to True in the Django Admin panel.
- The mobile **Admin Portal** is protected by a secondary **Security Login**. Use your Django admin credentials to unlock it.
