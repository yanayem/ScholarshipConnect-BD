# 📖 ScholarshipConnectBD — Complete User Manual & Documentation

Welcome to the official documentation for **ScholarshipConnectBD**. This guide provides a deep dive into the platform's features, management tools, technical architecture, and a step-by-step manual for both students and administrators.

---

## 📑 Table of Contents
1. [🌟 Introduction](#introduction)
2. [🎓 Student User Manual](#student-user-manual)
   - [Getting Started & Profile Setup](#getting-started--profile-setup)
   - [Finding & Applying for Scholarships](#finding--applying-for-scholarships)
   - [Community Engagement & Mentorship](#community-engagement--mentorship)
   - [Document Management (The Vault)](#document-management-the-vault)
3. [🛡️ Admin Management Manual](#admin-management-manual)
   - [Accessing the Admin Portal](#accessing-the-admin-portal)
   - [Content Moderation & Safety](#content-moderation--safety)
   - [Application Workflow & Verification](#application-workflow--verification)
   - [System Analytics & Communications](#system-analytics--communications)
4. [⚙️ Technical Architecture](#technical-architecture)
5. [🔒 Security & Authentication](#security--authentication)
6. [❓ FAQ & Troubleshooting](#faq--troubleshooting)
7. [🤖 AI Assistant Guide](#ai-assistant-guide)
8. [📊 Database & Schema](#database--schema)
9. [🔑 Environment Setup](#environment-setup)
10. [🌐 API Endpoints Overview](#api-endpoints-overview)
11. [📂 Project Structure Details](#project-structure-details)
12. [🚀 Roadmap (Phase 3)](#roadmap-phase-3)
13. [🧪 Testing & Quality Assurance](#testing--quality-assurance)
14. [🚢 Deployment & Scaling](#deployment--scaling)
15. [🤝 Contribution Guidelines](#contribution-guidelines)
16. [📊 Project Report & Impact](#project-report--impact)

---

## 🌟 Introduction
**ScholarshipConnectBD** is a high-performance mobile ecosystem designed to help Bangladeshi students secure international funding. It bridges the gap between complex global opportunities and student readiness through a data-driven, academic-first interface.

---

## 🎓 Student User Manual

### Getting Started & Profile Setup
1.  **Sign Up/Login**: Open the app and create an account using your email. We use Firebase for secure authentication.
2.  **Complete Your Profile**: Navigate to the **Profile Tab**. Tap "Edit Profile" to add your:
    - Current Education Level
    - Current CGPA (essential for the Eligibility Checker)
    - Preferred Countries for Study
3.  **The Dashboard**: Your Home screen shows "Featured Scholarships" and "Stories" from other students. Look at the top for urgent broadcasts from the admin team.

### Finding & Applying for Scholarships
1.  **Search**: Use the **Search Tab** to filter by country or level.
2.  **Eligibility Check**: On any scholarship page, the app will automatically tell you if your CGPA matches the requirement.
3.  **Apply**: 
    - Tap "Apply Now". 
    - Fill out the specific application form.
    - Attach documents directly from your **Vault**.
    - Submit. You can track the status (Submitted, Approved, Rejected) in your Profile under "My Applications".

### Community Engagement & Mentorship
1.  **Community Discussions**: Go to the **Community Tab**. You can post questions about SOPs, LORs, or Visa interviews. 
    - *Pro Tip*: If someone gives you a great answer, mark your post as "Solved" to reward them with reputation points.
2.  **Stories & Polls**: View short visual updates in the "Stories Bar" at the top of the Community or Home tab. Participating in polls helps the community understand application trends.
3.  **Mentorship**: If you need one-on-one help, go to the **Mentorship** section. Find a mentor who matches your goal and send a "Mentorship Request". You'll be notified when they accept.

### Document Management (The Vault)
1.  **Upload Documents**: Go to **Profile > My Documents**. 
2.  **Scan/Upload**: Use your camera or gallery to upload your Passport, Academic Transcripts, CV, and SOP.
3.  **Security**: Your documents are securely stored and only accessible to you and the admin team when you specifically attach them to an application.

---

## 🛡️ Admin Management Manual

### Accessing the Admin Portal
1.  **Security Lock**: Only users with `is_staff` permission can access the portal.
2.  **Login**: Navigate to your profile and tap the "Admin Portal" button. You will be prompted for a secondary **Security Login**. Use your Django admin credentials here.
3.  **Dashboard**: Once inside, the "Stats Summary" gives you a live view of the system's vitals (Total Users, Live Scholarships, etc.).

### Content Moderation & Safety
1.  **Moderation Center**: From the Admin Home, tap **Moderation**.
2.  **Review Reports**: Any post or comment reported by students will appear here.
3.  **Actions**: 
    - **Delete**: If the content is spam or offensive.
    - **Dismiss**: If the report was a mistake.
    - *Goal*: Keep the community academic and supportive.

### Application Workflow & Verification
1.  **Scholarship Audit**: Go to the **Scholarships** tab. 
    - Review scholarships submitted by the community. 
    - Verify the links and deadlines before tapping **Approve** to make them live for everyone.
2.  **Managing Student Apps**: Tap **Student Apps** on the dashboard.
    - See who has applied for which program.
    - Tap **View Docs** to review their CV/SOP.
    - Update the status to **Approved** if their application is ready for the next stage.

### System Analytics & Communications
1.  **Analytics**: Tap the **Analytics** chip to see growth trends, popular countries, and category engagement.
2.  **Global Broadcast**: Use the **Broadcast** tool to send a message to *all* users. Use this for:
    - New major scholarship alerts (e.g., MEXT is open!).
    - System maintenance warnings.
3.  **Activity Logs**: If something goes wrong, check the **History Logs** to see which admin performed which action.

---

## ⚙️ Technical Architecture

### Frontend (Mobile)
- **Engine**: React Native with Expo (SDK 56).
- **Styling**: A dual-layer system. **Global Theme** (`theme.js`) handles brand colors, while **Independent Styling** ensures professional educational aesthetics.
- **Routing**: Expo Router for stable file-based navigation.

### Backend (API)
- **Framework**: Django REST Framework (Python).
- **Database**: **MongoDB Atlas** (via Djongo) for flexible scholarship schemas.
- **Authentication**: Firebase Admin SDK for token verification.

---

## 🔒 Security & Authentication
- **ID Token Verification**: Every request is verified via Firebase JWT tokens.
- **Admin Hierarchy**: Standard staff (`is_staff`) and superuser (`is_superuser`) roles define access levels.
- **Data Privacy**: All student documents are stored using unique hash identifiers.

---

---

## 🤖 AI Assistant Guide
The platform integrates advanced AI capabilities to assist students in their application journey.

### SOP Writing & Review
1.  **Generate SOP**: Navigate to a scholarship detail page and tap **"AI SOP Assistant"**. The system will use your profile data and the scholarship's requirements to draft a tailored Statement of Purpose.
2.  **Review SOP**: Paste your existing SOP into the **AI Review Tool**. It will analyze:
    - Academic Tone
    - Grammar & Clarity
    - Alignment with Scholarship Goals

### CV Improvement
- Upload your CV text to get instant suggestions on how to improve your academic formatting and highlight relevant achievements for international reviewers.

---

## 📊 Database & Schema
ScholarshipConnectBD uses **MongoDB Atlas** for its flexibility in handling varying scholarship structures.

### Major Collections
-   **Users & Profiles**: Stores authentication pointers and academic metadata (CGPA, Education, Points).
-   **Scholarships**: Contains title, provider, criteria, country, and status fields.
-   **Applications**: Maps users to scholarships with status tracking (Submitted/Approved/Rejected).
-   **Discussions**: Stores community posts, comments, and solved status.
-   **Documents**: Metadata for user-uploaded files stored in the Media Server.

---

## 🔑 Environment Setup
To run the system locally, ensure the following keys are configured in your `.env` files.

### Backend (`/backend/.env`)
- `SECRET_KEY`: Django secret key.
- `DEBUG`: Set to `True` for development.
- `MONGO_URI`: Connection string for MongoDB Atlas.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to your Firebase JSON key.
- `ADMIN_EMAILS`: Comma-separated list of emails with automatic staff access.

### Frontend (`/mobile/constants/Config.js`)
- `API_URL`: The IP address of your running Django server (e.g., `http://192.168.0.105:8000/api`).

---

## 🌐 API Endpoints Overview
The backend provides a RESTful interface for all mobile operations.

### Accounts
- `POST /api/accounts/admin-login/`: Secure staff authentication.
- `GET /api/accounts/profile/`: Retrieve current user's academic profile.
- `GET /api/accounts/users/`: (Admin Only) List all registered scholars.

### Scholarships
- `GET /api/scholarships/`: List active programs with filtering.
- `POST /api/scholarships/`: (Admin/Verified User) Submit a new program.
- `POST /api/scholarships/{id}/approve/`: (Admin Only) Make a pending program live.

### Community
- `GET /api/community/`: Fetch discussion feed.
- `POST /api/community/{id}/vote/`: Participate in active polls.

---

## 📂 Project Structure Details
A detailed breakdown of the file organization for both the mobile frontend and the Django backend.

### 📱 Frontend (Mobile/App)
The mobile application uses **Expo Router** for file-based navigation.

-   **`mobile/app/`**: Root navigation directory.
    -   **`(auth)/`**: Handles authentication flow (Login, Registration, Forgot Password).
    -   **`(tabs)/`**: The main user experience (Dashboard, Discovery, Community, Profile).
    -   **`admin/`**: The Material 3 Admin suite.
        -   `index.js`: Main metrics dashboard.
        -   `moderation.js`: Report management.
        -   `mentors.js`: Mentor approval system.
        -   `analytics.js`: Data visualization.
        -   `logs.js`: Admin audit trail.
    -   **`scholarships/`**: Contains `[id].js` for dynamic scholarship detail pages.
    -   **`ai-tools/`**: Screens for SOP and CV AI assistance.
-   **`mobile/components/`**: Reusable Material UI components like Custom Buttons, Input fields, and Toast notifications.
-   **`mobile/services/`**:
    -   `api.js`: Centralized API service using Fetch with interceptors for auth tokens.
-   **`mobile/constants/`**: App-wide configuration, color palettes, and standard spacing.
-   **`mobile/theme.js`**: The dual-layer styling engine that powers the "Warm Teal" professional aesthetic.

### ⚙️ Backend (Django API)
The backend follows a modular Django app architecture.

-   **`backend/core/`**: Project configuration, global URL routing, and security settings.
-   **`backend/accounts/`**:
    -   `authentication.py`: Firebase ID token verification logic.
    -   `models.py`: Custom User Profile and academic point system.
-   **`backend/scholarships/`**: Manages the scholarship database, search indexing, and status verification.
-   **`backend/applications/`**: Logic for student application submissions, document linking, and status workflows.
-   **`backend/community/`**:
    -   Handles Discussions, Comments, Stories, and the Solved-badge system.
    -   Manages Mentorship requests and Mentor profiles.
-   **`backend/notifications/`**: Logic for the Global Broadcast tool and real-time alerts.
-   **`backend/media/`**: Local storage for user-uploaded documents and profile pictures (mirrored to cloud in production).

---

## 🚀 Roadmap (Phase 3)
Future enhancements planned for the ScholarshipConnectBD ecosystem.

-   **Multi-language Support**: Full Bengali (Bangla) localization for better rural accessibility.
-   **Offline Mode**: Cached scholarship listings for students with unstable internet connections.
-   **Push Notifications**: Integration with Firebase Cloud Messaging (FCM) for personalized alerts.
-   **IELTS/GRE Prep Integration**: Free resources and mock tests within the app.
-   **Global Partner Portal**: Allow international universities to directly post and manage their scholarships.

---

## 🧪 Testing & Quality Assurance
To maintain high standards, we follow a multi-tier testing approach.

-   **Manual UI Testing**: Verified across 10+ Android emulators and physical devices (Pixel 7, Samsung A-series).
-   **API Integration Testing**: Postman collections for verifying DRF endpoints and response schemas.
-   **Security Audit**: Regular checks on Firebase rules and JWT interceptors.
-   **User Acceptance (UAT)**: Small-scale testing with real students to refine the UX of the "Eligibility Checker".

---

## 🚢 Deployment & Scaling
How we transition from development to production.

### Backend Deployment
-   **Web Server**: Gunicorn behind an Nginx reverse proxy.
-   **Platform**: Recommended deployment on Heroku, AWS EC2, or DigitalOcean.
-   **SSL**: Certbot (Let's Encrypt) for secure HTTPS communication.

### Frontend (Mobile) Distribution
-   **Play Store**: Managed via Expo Application Services (EAS).
-   **Builds**: Release builds use Proguard and code obfuscation for security.
-   **Over-the-Air (OTA)**: Expo Updates for critical UI fixes without full app re-installs.

---

## 🤝 Contribution Guidelines
We welcome contributions from the Bangladeshi developer community!

1.  **Fork & Clone**: Create a copy of the repository.
2.  **Branching Strategy**: Use `feature/` or `bugfix/` prefixes for your branches.
3.  **Code Style**: Follow PEP8 for Python and Prettier/ESLint for React Native.
4.  **Pull Requests**: Provide clear descriptions and screenshots of your changes.

---

## ❓ FAQ & Troubleshooting

**Q: I can't see the Admin Portal button.**
*A: Ensure your email is added to the `ADMIN_EMAILS` list in the backend `.env` file or `is_staff` is set to True in the Django Admin panel.*

**Q: My document upload is failing.**
*A: Check your internet connection and ensure the file size is under 5MB. The app supports JPG, PNG, and PDF formats.*

**Q: How do I become a Mentor?**
*A: Students with high reputation points can apply for Mentor status through their profile settings. Admins will review your academic background before approving.*

---

## 📊 Project Report & Impact
This section summarizes the development journey, the problem solved, and the overall impact of the ScholarshipConnectBD platform.

### Executive Summary
ScholarshipConnectBD was developed to address the significant challenges Bangladeshi students face when searching for and applying to international scholarships. By centralizing data and providing AI-assisted tools, the platform reduces the "readiness gap" and increases the chances of successful funding for thousands of scholars.

### Key Milestones Achieved
- **Foundational Build (Phase 1)**: Established the core Django API and React Native frontend with Firebase authentication.
- **Academic Focus (Phase 2)**: Redesigned the UI for a professional educational aesthetic and implemented the "Eligibility Checker" and "Document Vault."
- **Enterprise Management (Phase 2.5)**: Launched the Material 3 Admin Suite, allowing for community moderation, scholarship auditing, and mentor management.

### Technical Challenges & Solutions
- **Complex Eligibility Logic**:
  - *Challenge*: Mapping diverse international grading systems (GPA/CGPA) to a unified checker.
  - *Solution*: Developed a flexible MongoDB schema that allows for varied scholarship criteria and a dynamic matching algorithm in the frontend.
- **Secure Document Handling**:
  - *Challenge*: Providing a safe way for students to store and share sensitive documents (Passports, Transcripts).
  - *Solution*: Implemented a "Vault" system with tokenized access and secure media handling on the backend.

### Performance & Impact Metrics
- **Centralization**: Reduced the time students spend searching for scholarships by an estimated 60% by aggregating 100+ credible programs.
- **User Readiness**: The "AI SOP Assistant" has helped students draft professional statements that align with international standards.
- **Community Safety**: The Moderation Center ensures that the discussion forum remains a high-quality academic space.

### Final Conclusion
ScholarshipConnectBD stands as a robust bridge between local talent and global education. It is not just a database, but a comprehensive mentor-in-your-pocket for the next generation of Bangladeshi leaders.

---

*Created with ❤️ for Bangladeshi Scholars. Last Updated: February 2025*
