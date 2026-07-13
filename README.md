# 🎓 ScholarshipConnectBD

> **Bridging the gap between Bangladeshi students and global opportunities.**
> A comprehensive mobile platform to discover, track, and apply for international scholarships.

---

## 📌 Project Overview
ScholarshipConnectBD is a specialized mobile application built with **React Native & Expo** and powered by a **Django REST Framework** backend. It serves as a central hub for students in Bangladesh to find prestigious scholarships like MEXT, Chevening, Fulbright, and DAAD.

---

## 🚀 Core Features
- [x] **Smart Dashboard**: Real-time announcements and featured scholarships.
- [x] **Scholarship Discovery**: Advanced search and multi-layer filtering (Country, Level, Field).
- [x] **Eligibility Checker**: Instant matching based on CGPA and academic background.
- [x] **Deadline Calendar**: Visual tracking of upcoming application deadlines.
- [x] **Personalized Profiles**: Manage academic history, CGPA, and preferences.
- [x] **Firebase Authentication**: Secure login and registration with social auth support.
- [x] **Material 3 Admin Console**: Professional Android-style dashboard for system management.
- [x] **Community Discussion**: Interactive forum for students to share tips and solutions.
- [x] **Stories & Polls**: Share academic journeys through visual stories and participate in community polls.
- [x] **Mentorship Program**: Connect with experienced mentors for personalized scholarship guidance.
- [x] **Student App Manager**: Oversee and approve scholarship submissions from the community.
- [x] **Global Broadcast**: Send instant notifications and alerts to all registered users.
- [x] **Moderation Center**: Protect community standards by managing reported content.
- [x] **Admin Analytics**: Visualize system performance with data-driven insights and KPIs.
- [x] **Activity History**: Audit trail for tracking all administrative actions.
- [x] **Document Vault**: Secure storage for certificates, SOPs, and LORs with image fallback.
- [x] **Deadline Tracker**: Real-time progress tracking for application deadlines.
- [x] **Smart Reminders**: Push notification integration for upcoming deadlines.
- [x] **Scholarship Blog**: Curated articles, success stories, and application guides.

---

## 🌟 Phase 2 - Professional Redesign (Latest Updates)
Recently, the platform underwent a significant UI/UX overhaul to meet global academic standards:

### 📱 Premium Scholarship Details
- **Educational Layout**: Redesigned with a focus on high-readability and professional hierarchy.
- **Independent Styling**: Decoupled CSS for the details page to ensure a unique, academic look.
- **Quick-Stat Grid**: Modern icons for Location, Program, Funding, and Deadlines.
- **Immersive Header**: Branded teal background with glass-morphic controls.
- **Pro-Tip Integration**: Contextual advice for students within scholarship pages.

### 🛡️ Android-Native Admin Console (Full Management Suite)
- **Material 3 Dashboard**: Centralized metrics for scholarships, users, applications, and mentorship sessions.
- **Moderation Center**: A dedicated system to review reported posts and comments to ensure a safe community.
- **Mentor Approval System**: Evaluate and approve expert mentors to guide younger students.
- **Advanced Analytics**: Interactive charts and progress bars showing user trends, top scholarship countries, and engagement rates.
- **Activity Logs**: A transparent audit trail tracking every admin action for accountability.
- **Student App Tracking**: Manage student applications with "Submitted", "Approved", and "Rejected" status workflows.
- **Broadcast Tool**: Send instant announcements to the entire student community.
- **Floating Action Button (FAB)**: Native Android experience for adding new records.
- **Simplified Language**: UI updated with common, easy-to-understand terms like "Live Now", "Waiting", and "Working Now".

---

## 🛠️ Technology Stack

### 📱 Frontend (Mobile App)
- **Core**: React Native & Expo (SDK 56)
- **Navigation**: **Expo Router** (Refined with stable history management for Admin tabs)
- **Styling**: Native StyleSheet with a **Dual-Layer Theme Engine** (Global + Page-Specific professional CSS)
- **Animations**: **React Native Reanimated** for premium fluid transitions
- **UI Components**:
  - `react-native-calendars`: For scholarship deadline tracking
  - `@expo/vector-icons`: Material & Ionicons integration
  - `expo-image-picker`: Reliable document capture and upload (Fallback for DocumentPicker)
- **Persistence**: **AsyncStorage** for session and token management

### ⚙️ Backend (API & Data)
- **Framework**: **Django 3.2** (Robust & Scalable Python Framework)
- **Architecture**: **RESTful API** powered by Django REST Framework (DRF)
- **Database**: **MongoDB Atlas** (NoSQL Cloud Database for flexible data schemas)
- **Database Connector**: **Djongo** (Seamlessly maps Django ORM to MongoDB)
- **Authentication**: **Firebase Auth** (Cross-platform secure authentication)

---

## 🗄️ Database Architecture
ScholarshipConnectBD utilizes a **hybrid relational-document approach** by leveraging **MongoDB Atlas** via the **Djongo** connector.

### 👤 User & Profile Schema (Relational)
The core user data follows a structured relational pattern:
- **User Model**: Standard Django Auth user (Username, Email, Password).
- **Profile Model**: A `OneToOne` extension of the User model containing academic records, personal details, and preferences.

### 🎓 Scholarship Schema (Document-based)
Scholarship entries are stored as flexible JSON-like documents:
- **Basic Info**: Title, Provider, Country, Amount, and Category.
- **Academic Criteria**: Minimum CGPA, Study Level, and Field requirements.
- **Tracking Data**: Application deadlines, status (Active/Pending/Rejected), and user bookmarks.

---

## 🎨 UI & Design Theme
The application follows a **Premium, Minimal, and Modern** design system focused on clarity and scholar focus.

### 🎨 Color Palette
- **Primary**: Sophisticated Warm Teal (`#2A9D8F`) - Main branding and CTAs.
- **Background**: Warm Cream (`#F8F2E7`) - A soft, academic backdrop for high readability.
- **Secondary**: Light Lavender (`#F2ECFF`) - Subtle section highlighting.
- **Surface**: Pure White (`#FFFFFF`) - For cards, modals, and input fields.

### 🔤 Typography & Spacing
- **Font Family**: `Inter` (Regular, Medium, SemiBold, Bold) for maximum readability.
- **Base Spacing**: 16px (md) grid system.
- **Border Radius**: Professional **24px-36px** for cards and buttons.

---

## 📂 Project Structure

```text
ScholarshipConnectBD/
├── mobile/                   # Frontend (React Native + Expo Router)
│   ├── app/                  # Application Screens (File-based Routing)
│   │   ├── (auth)/           # Authentication Flow (Login, Register, Forgot)
│   │   ├── (tabs)/           # Main App Navigation (Dashboard, Search, Saved, Profile)
│   │   ├── admin/            # Android-Style Admin Console
│   │   │   ├── _layout.js    # Bottom Tab Navigation for Admins
│   │   │   ├── index.js      # Admin Home (System Summary & Analytics)
│   │   │   ├── moderation.js # Community Standards & Report Management
│   │   │   ├── mentors.js    # Mentor Application Review
│   │   │   ├── analytics.js  # Data Visualization & KPI Tracking
│   │   │   ├── logs.js       # Activity History & Audit Trail
│   │   │   ├── applications.js # Student App Manager
│   │   │   ├── scholarships.js # Scholarship Audit Log
│   │   │   ├── broadcast.js    # Global Announcement Tool
│   │   │   └── users.js        # User Management & Reports
│   │   ├── scholarships/     # Scholarship Details ([id].js)
│   │   ├── apply/            # Application Submission Forms
│   │   ├── blog/             # Success Stories & Blog Views
│   │   ├── documents.js      # Document Vault (CV/LOR Management)
│   │   ├── reminders.js      # Deadline Tracker & Reminders
│   │   └── _layout.js        # Root Navigation Setup
│   ├── components/           # Reusable UI Components (Cards, Buttons, Inputs)
│   ├── services/             # API Layer (Fetch wrappers, Auth interceptors)
│   │   └── api.js            # Central API Service
│   ├── constants/            # App Config, Colors, and Global Constants
│   ├── theme.js              # Centralized Dual-Layer Theme Engine
│   └── package.json          # Project Dependencies & Scripts
├── backend/                  # Backend (Django REST Framework)
│   ├── core/                 # Project Settings & Root URL routing
│   ├── accounts/             # Firebase Authentication, Profiles & JWT
│   │   ├── authentication.py # Custom Firebase ID Token Verifier
│   │   └── models.py         # User Profile & Academic Data
│   ├── scholarships/         # Scholarship Database & Audit Logic
│   ├── blog/                 # Success Stories & Educational Content
│   ├── applications/         # Student Scholarship Applications Manager
│   ├── notifications/        # System Alerts & Broadcast Logic
│   ├── media/                # User Uploaded Documents (CVs, Photos)
│   ├── manage.py             # Django Management CLI
│   └── .env                  # Secure Credentials (DB URI, Firebase Keys)
└── README.md                 # Project Documentation
```

---

## 📥 Getting Started

### 1. Frontend (Mobile) Setup
```bash
cd mobile
npm install
npx expo start
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## 🔒 Security & Verification

### 🛡️ Scholarship Verification System
To maintain the quality and authenticity of data, the platform implements a dual-layer verification flow:
1. **User Submission**: Any registered user can contribute by submitting a scholarship. These are initially marked as **`Pending`**.
2. **Admin Review**: Staff members review pending submissions in the **Admin Home**.
3. **Activation**: Only after admin approval does a scholarship become **`Live`** and visible to the community.

### 🔥 Firebase Authentication
The app uses **Firebase SDK** for robust cross-platform authentication:
- **Real-time Sync**: Automatic profile creation in the Django backend upon Firebase signup.
- **ID Token Verification**: The backend verifies Firebase-issued JWT tokens for every API request, ensuring top-tier security.

---

## 🤝 Team
- **Developer**: ScholarshipConnectBD Team
- **Status**: Phase 2 Complete (Professional Redesign & Stability)
- **UI Theme**: Warm Teal & Cream (#2A9D8F / #F8F2E7)

---
*Created with ❤️ for Bangladeshi Scholars.*
