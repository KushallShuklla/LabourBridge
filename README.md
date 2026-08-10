<div align="center">

# 🏗️ LabourBridge

### *Bridging Work. Building Lives.*

A comprehensive cross-platform mobile application connecting **skilled workers** and **employers** in India's informal labor sector.

![Version](https://img.shields.io/badge/version-1.2.0.3-blue)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)

</div>

---

## 📖 About

LabourBridge is a bilingual (English/Hindi) mobile application designed to bridge the gap between skilled workers and employers in India. Unlike existing platforms that focus on white-collar jobs, LabourBridge provides separate optimized interfaces for workers and employers, making it accessible to users across all digital literacy levels.

> Built with React Native (Expo) + TypeScript on the frontend and Supabase (PostgreSQL) on the backend.

---

## 🚩 Problem Statement

**For Workers:**
- Difficulty finding reliable job opportunities
- No digital presence or skill verification
- Language barriers in existing platforms
- No centralized platform for job applications
- Ai based job search

**For Employers:**
- Challenges finding skilled workers quickly
- No organized talent pool
- Time-consuming hiring process
- Difficulty managing multiple applications

---

## ✨ Features

### 👷 Worker Features
| Feature | Description |
|--------|-------------|
| Profile Management | Photo, skills, experience, bio |
| Job Search & Filter | Filter by skills, location, salary, work type |
| Skill-Based Recommendations | Jobs matched to your skills |
| Quick Apply | One-tap job application |
| Application Tracking | Track status of all applications |
| Job Bookmarking | Save jobs for later |
| Document Upload | Aadhaar, PAN, certificates |
| Communities | Create, join, and chat in worker communities |
| Job History | Track past work records |
| Analytics Dashboard | Profile views, application stats |
| Notifications | Real-time job match alerts |

### 🏢 Employer Features
| Feature | Description |
|--------|-------------|
| Company Profile | Logo, industry, verification badge |
| Job Posting | Post with skill requirements and expiry |
| Application Management | Review and update application status |
| Talent Pool Search | Search and filter workers |
| Worker Shortlisting | Save promising candidates |
| Analytics Dashboard | Job views, applications, hiring metrics |
| Posted Jobs Management | Edit, deactivate, or delete listings |

### 🌐 Common Features
- 🌙 Dark / Light Theme
- 🗣️ Bilingual Support (English & Hindi)
- 🔔 Real-time Notifications
- 🔒 Secure Authentication (JWT + SecureStore)
- 📄 Privacy Policy & Terms of Service
- 🆘 Help Center & Contact Support

---

## 🛠️ Tech Stack

### Frontend
- **React Native** 0.81.5 — Cross-platform mobile framework
- **Expo SDK 54** — Build toolchain and development
- **TypeScript** — Type-safe JavaScript
- **Expo Router** — File-based navigation
- **React Context API** — Global state management
- **expo-linear-gradient** — Gradient UI effects
- **expo-image-picker** — Image selection & upload
- **expo-secure-store** — Secure token storage

### Backend
- **Supabase** — Backend-as-a-Service (BaaS)
- **PostgreSQL 15** — Relational database
- **Supabase Auth** — Authentication service
- **Supabase Storage** — File & document storage
- **Supabase Realtime** — Live data subscriptions
- **Row Level Security (RLS)** — Database-level security

### DevOps & Tools
- **EAS Build** — Production APK/IPA builds
- **Git & GitHub** — Version control
- **Visual Studio Code** — IDE

---

## 🗂️ Project Structure

```
LabourBridge/
├── app/                          # Screens (Expo Router file-based routing)
│   ├── (tabs)/                   # Default tab layout
│   ├── worker-tabs/              # Worker navigation tabs
│   ├── employer-tabs/            # Employer navigation tabs
│   ├── auth.tsx                  # Authentication screen
│   ├── jobs.tsx                  # Job listings
│   ├── job-details.tsx           # Job detail view
│   ├── worker-profile.tsx        # Worker profile
│   ├── employer-profile-setup.tsx
│   ├── communities.tsx
│   ├── documents.tsx
│   ├── settings.tsx
│   └── ...                       # 40+ screens
├── components/                   # Reusable UI components
│   ├── AnimatedButton.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── SearchBar.tsx
│   ├── SkeletonLoader.tsx
│   └── ...
├── contexts/                     # React Contexts
│   ├── ThemeContext.tsx
│   ├── LanguageContext.tsx
│   └── NotificationContext.tsx
├── services/                     # Backend integrations
│   ├── supabase.ts               # Supabase client
│   └── notificationService.ts
├── constants/                    # App-wide constants
│   ├── translations.ts           # English & Hindi strings
│   └── theme.ts                  # Color palette
├── hooks/                        # Custom React hooks
├── utils/                        # Helper utilities
├── supabase/migrations/          # SQL migration files
└── assets/                       # Images & icons
```

---

## 🗄️ Database Design

**11 Tables** with Row Level Security enabled on all:

| Table | Purpose |
|-------|---------|
| `users` | Supabase Auth users |
| `worker_profiles` | Worker info (skills, photo, bio) |
| `employer_profiles` | Company info and verification |
| `jobs` | Job postings with expiry |
| `applications` | Job applications with status |
| `communities` | Worker communities |
| `community_members` | Community membership |
| `documents` | Worker uploaded documents |
| `bookmarks` | Saved jobs |
| `notifications` | User notifications |
| `app_settings` | App configuration |

**Key Relationships:**
- `users` ↔ `worker_profiles` (One-to-One)
- `users` ↔ `employer_profiles` (One-to-One)
- `users` → `jobs` → `applications` (One-to-Many)
- `workers` ↔ `communities` via `community_members` (Many-to-Many)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- Expo CLI
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/KushallShuklla/LabourBridge.git

# Navigate to project
cd LabourBridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the App

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
```

---

## 📦 Build & Deployment

### Preview APK (Android)
```bash
eas build --platform android --profile preview
```

### Production Build
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| App Load Time | ~2.1 seconds |
| Job Search Response | ~1.3 seconds |
| Image Upload (2MB) | ~3.8 seconds |
| Database Query | < 500ms |
| App Size | ~45 MB (APK) |

---

## 🔒 Security

- HTTPS for all API communications
- JWT token-based session management
- Secure token storage via Expo SecureStore
- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- Encrypted file storage

---

## 🔮 Future Enhancements

**Short-term (3–6 months)**
- In-app messaging between workers and employers
- Video profile feature
- Payment integration for premium features
- Rating and review system

**Medium-term (6–12 months)**
- Background verification service
- Skill assessment tests
- Geolocation-based job alerts
- Regional language support (Tamil, Telugu, Bengali)

**Long-term (1–2 years)**
- AI-powered skill matching
- Payroll management integration
- Web application version
- Blockchain-based credential verification

---

## 🧪 Testing

- **50+ test cases** covering all major features
- Unit, Integration, System, and UAT testing
- Cross-platform testing on Android & iOS
- All critical test cases passed ✅

---

## 🌍 Social Impact

LabourBridge aims to:
- Digitally empower informal sector workers
- Reduce unemployment in the skilled labor sector
- Provide transparency in the hiring process
- Enable digital literacy among workers
- Create an organized labor marketplace
- Support economic growth through efficient labor allocation

---



© LabourBridge 2026 — All Rights Reserved
