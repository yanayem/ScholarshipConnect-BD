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
- [x] **Mentor Network**: Verified network of past scholars to guide new applicants via community discussions.
- [x] **Document Vault**: Secure storage for certificates, SOPs, and LORs.
- [x] **Deadline Tracker**: Real-time progress tracking for application deadlines.
- [x] **Smart Reminders**: Push notification integration for upcoming deadlines.
- [x] **Scholarship Blog**: Curated articles, success stories, and application guides.
- [x] **Application Management**: Track the status of all your scholarship applications in one place.

---

## 🛠️ Technology Stack

### 📱 Frontend (Mobile App)
- **Core**: React Native & Expo (SDK 56)
- **Navigation**: **Expo Router** (Next.js-style file-based routing)
- **Styling**: Native StyleSheet with a centralized **Theme Engine** (Custom JSON system)
- **Animations**: **React Native Reanimated** for premium fluid transitions
- **UI Components**:
  - `react-native-calendars`: For scholarship deadline tracking
  - `@expo/vector-icons`: Material & Ionicons integration
  - `expo-glass-effect`: Modern frosted-glass UI elements
- **Persistence**: **AsyncStorage** for session and token management
- **Fonts**: `@expo-google-fonts` (Inter & Poppins)

### ⚙️ Backend (API & Data)
- **Framework**: **Django 3.2** (Robust & Scalable Python Framework)
- **Architecture**: **RESTful API** powered by Django REST Framework (DRF)
- **Database**: **MongoDB Atlas** (NoSQL Cloud Database for flexible data schemas)
- **Database Connector**: **Djongo** (Seamlessly maps Django ORM to MongoDB)
- **Authentication**: **SimpleJWT** (JSON Web Tokens with Access/Refresh cycle)
- **Deployment**: Prepared for Docker and cloud hosting

### 🛠️ Tools & DevOps
- **Version Control**: Git & GitHub
- **API Testing**: Postman / Insomnia
- **Design**: Figma (Modern Royal Blue design language)
- **Environment**: Dotenv for secure credential management

---

## 🗄️ Database Architecture
ScholarshipConnectBD utilizes a **hybrid relational-document approach** by leveraging **MongoDB Atlas** via the **Djongo** connector. This allows the project to maintain Django's robust authentication system while benefiting from NoSQL's flexibility for scholarship data.

### 👤 User & Profile Schema (Relational)
The core user data follows a structured relational pattern:
- **User Model**: Standard Django Auth user (Username, Email, Password).
- **Profile Model**: A `OneToOne` extension of the User model containing:
  - **Academic Records**: CGPA (Decimal), Study Level (HSC/Bachelors/Masters/PhD), Department, and University.
  - **Personal Details**: Full Name, Phone, Date of Birth, and Bio.
  - **Preferences**: Target countries and preferred scholarship fields.
  - **Document Links**: References to files stored in the Document Vault.

### 🎓 Scholarship Schema (Document-based)
Scholarship entries are stored as flexible JSON-like documents, allowing for varying fields across different programs:
- **Basic Info**: Title, Provider, Country, Amount, and Category.
- **Dynamic Criteria**: Custom eligibility fields (e.g., "Research Proposal Required", "Japanese Proficiency") that vary between MEXT, Chevening, etc.
- **Tracking Data**: Application deadlines, status, and user bookmarks.

---

## 🎨 UI & Design Theme
The application follows a **Premium, Minimal, and Modern** design system focused on clarity and scholar focus.

### 🎨 Color Palette
- **Primary**: Modern Royal Blue (`#4361EE`) - Main branding and CTAs.
- **Secondary**: Deep Purple (`#7209B7`) - Accent highlights.
- **Background**: Crystal White (`#F8F9FF`) - Clean, modern backdrop.
- **Surface**: Pure White (`#FFFFFF`) - For cards and input fields.

### 🔤 Typography & Spacing
- **Font Family**: `Inter` (Regular, Medium, SemiBold, Bold) for maximum readability.
- **Base Spacing**: 16px (md) grid system.
- **Border Radius**: Standardized **12px** (base) for all UI components.

### 🌈 Visual Elements
- **Shadows**:
  - `Soft`: Low-elevation subtle shadows for list items.
  - `Premium`: High-depth shadows for featured cards and modals.
- **Pastel Accents**: Specialized soft colors (Teal, Lavender, Peach, Mint) for scholarship category badges.

---

## 📂 Project Structure

```text
ScholarshipConnectBD/
├── app/                  # Frontend (React Native + Expo Router)
│   ├── (auth)/           # Login & Registration screens
│   ├── (tabs)/           # Main application tabs (Dashboard, Search, etc.)
│   ├── blog/             # Scholarship articles and success stories
│   ├── scholarship/      # Individual scholarship detail pages
│   └── components/       # Reusable UI components
├── backend/              # Backend (Django REST Framework)
│   ├── accounts/         # User models, profiles, and authentication logic
│   ├── core/             # Project settings and root URL routing
│   └── manage.py         # Django management CLI
├── theme.js              # Centralized Theme Engine (Colors, Spacing, Shadows)
├── assets/               # Local images, fonts, and branding assets
└── README.md             # Project documentation
```

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
pip install -r requirements.txt

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
- **Status**: Phase 2 Complete (Advanced Features & Modern UI)
- **UI Theme**: Royal Blue & Crystal White (#4361EE / #F8F9FF)

---
*Created with ❤️ for Bangladeshi Scholars.*
