# ScholarshipConnectBD - Web Platform 🎓

The official web application for **ScholarshipConnectBD**, a premium platform designed to bridge Bangladeshi students with international scholarship opportunities through AI-powered guidance and expert mentorship.

## ✨ Premium Experience (Web Version)
This web platform mirrors the mobile experience with a specialized **Premium Warm Teal** theme, optimized for larger screens to provide deep academic insights and a seamless application workflow.

## 🚀 Core Features
- **AI Smart Suite**:
    - **ScholarAI Matchmaker**: Personalized scholarship discovery based on your academic profile.
    - **Eligibility Checker**: Instant verification against university requirements.
    - **Live Support**: AI-driven real-time assistance for scholarship queries.
- **User Dashboard**:
    - **Dual Mode**: Seamlessly switch between **Student** and **Mentor** profiles (for staff).
    - **Application Tracker**: Visual progress line from "Saved" to "Accepted".
    - **Deadline Calendar**: Centralized view of all upcoming scholarship dates.
- **Academic Assets**:
    - **Doc Vault**: Secure, encrypted storage for transcripts, passports, and SOPs.
    - **Scholar Insights**: A high-quality blog feed for success stories and tips.
- **Premium Services**:
    - **Pro Upgrade**: Unlock unlimited AI usage via ScholarPoints or SSLCommerz payment.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Auth**: [Firebase Authentication](https://firebase.google.com/)
- **API**: Custom Django REST Backend (Deployed on Render)
- **Deployment**: [Vercel](https://vercel.com/)

## 📦 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/yanayem/ScholarshipConnect-BD.git

# Navigate to web directory
cd web

# Install dependencies
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the `web` folder and add your configuration:
```env
NEXT_PUBLIC_API_URL=https://scholarshipconnectbd.onrender.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design System
- **Main Background**: `#F8F2E7` (Warm Cream)
- **Primary Color**: `#2A9D8F` (Premium Teal)
- **Container Radius**: `rounded-sm` (Sharp Flat Design)
- **Element Radius**: `rounded-lg` (Modern Interactive Components)

---
© 2026 ScholarshipConnectBD. Supporting the next generation of Bangladeshi Scholars.
