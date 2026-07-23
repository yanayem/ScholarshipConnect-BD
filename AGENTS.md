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

**COMMUNITY PAGE:**
- A "queue feed" is implemented in the Community tab.
- Users can share problems/questions (Discussions).
- Authors or Staff can mark discussions as **Solved** once a solution is found.
- "Open Problems" filter helps users find unresolved issues to contribute to.

**MENTORSHIP SESSIONS:**
- Students can book sessions with verified mentors.
- Mentors manage requests via the **Mentor Dashboard** in their profile.
- Sessions have states: `Pending`, `Approved`, `Rejected`, and `Completed`.
- Both parties can track their upcoming and past sessions.
- **IMPORTANT:** When booking a session via API, use the Mentor's **User ID** (from `user_id` field in profile) rather than the Profile ID.

**UX & BRANDING:**
- **Splash Screen:** The app features a branded logo page on startup with a 1.5s delay to ensure visibility.
- **Onboarding:** Forced reset (version 4) is active to ensure all users see the updated onboarding flow.
- **Color Palette:** The onboarding slides use vibrant brand colors (`Primary Teal`, `Lavender`, `Warning Orange`) with white text for high contrast.

**BUSINESS MODEL (SCHOLARPOINTS):**
- Users earn points by contributing valid scholarships (+50 pts) or being helpful in community discussions (+20 pts).
- **Pro Upgrade:** Users can spend **200 points** in Settings to unlock **ScholarConnect Pro**.
- Pro benefits include unlimited AI tools and priority scholarship matching.
- Mentorship is currently a value-added service to build student-to-student trust.
