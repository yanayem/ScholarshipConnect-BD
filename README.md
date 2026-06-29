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
- [x] **JWT Authentication**: Secure login and registration with session management.
- [x] **Admin Panel**: Robust dashboard for managing scholarships and user data.
- [x] **Community Discussion**: Interactive forum for students to share tips.
- [x] **Mentor Network**: Verified network of past scholars to guide new applicants.
- [ ] **Document Vault**: (In-Progress) Secure storage for certificates and SOPs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native, Expo (SDK 56)
- **Navigation**: Expo Router (File-based)
- **State Management**: React Hooks & Context API
- **Storage**: AsyncStorage (Token management)

### Backend
- **Framework**: Django 3.2 (Python)
- **API**: Django REST Framework (DRF)
- **Database**: MongoDB Atlas (Cloud)
- **Auth**: SimpleJWT (Access/Refresh Tokens)
- **Connector**: Djongo (Django to MongoDB)

---

## 🎨 UI & Design Theme
The application follows a **Premium, Minimal, and Modern** design system.

- **Primary Color**: Warm Teal (`#2A9D8F`)
- **Background**: Warm Cream (`#F8F2E7`)
- **Corners**: Standardized `rounded-base` (**12px**) for a professional look.
- **Shadows**: Reduced, subtle shadows for a clean interface.

---

## 📥 Getting Started

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start Expo
npx expo start
```

### 2. Backend Setup
```bash
cd backend

# Create & Activate Virtual Environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install Python packages
pip install -r requirements.txt  # (Ensure you create this or install manually)

# Run Migrations
python manage.py migrate

# Start Server
python manage.py runserver
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DEBUG=True
SECRET_KEY=your_secret_key
MONGODB_URI=your_mongodb_atlas_uri
DATABASE_NAME=scholarship_db
```

---

## 🤝 Team
- **Developer**: ScholarshipConnectBD Team
- **Status**: Phase 1 Complete (Backend & Frontend Integrated)
- **UI Theme**: Premium Teal & Warm Cream (#2A9D8F / #F8F2E7)

---
*Created with ❤️ for Bangladeshi Scholars.*
