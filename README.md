# LabourBridge 🏗️

A labour marketplace mobile app connecting **workers** and **employers** — built with React Native (Expo) and Supabase.

## Features

### For Workers
- Browse and apply for jobs
- Manage profile, documents, and job history
- Track applications and bookmarked jobs
- Community chat and notifications

### For Employers
- Post and manage job listings
- Browse talent pool and shortlist workers
- View analytics and applications
- Company profile management

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (Database + Auth)
- **Notifications**: Expo Notifications + Push Notifications
- **Styling**: Custom theme system with dark/light mode
- **Deployment**: EAS (Expo Application Services)

## Project Structure

```
LabourBridge/
├── app/              # Screens (Expo Router)
│   ├── employer-tabs/  # Employer navigation
│   └── worker-tabs/    # Worker navigation
├── components/       # Reusable UI components
├── constants/        # Theme, translations, app constants
├── contexts/         # React contexts (Theme, Language, Notifications)
├── hooks/            # Custom hooks
├── services/         # Supabase & notification services
└── utils/            # Helper utilities
```

## Getting Started

### Prerequisites
- Node.js >= 18
- Expo CLI
- Supabase account

### Installation

```bash
# Clone the repo
git clone https://github.com/KushallShuklla/LabourBridge.git

# Install dependencies
cd LabourBridge
npm install

# Add environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key

# Start the app
npm start
```

### Environment Variables

Create a `.env` file in the root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on Web
```

## License

This project is private and not open for public use.
