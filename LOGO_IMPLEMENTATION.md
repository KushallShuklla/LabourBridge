# LabourBridge Logo Implementation

## Overview
The LabourBridge logo has been successfully integrated throughout the application to ensure consistent branding across all screens and platforms.

## Logo Files
- **Primary Logo**: `assets/images/labourbridgelogo.png`
- **App Icon**: `assets/images/icon.png` (copy of primary logo)
- **Favicon**: `assets/images/favicon.png` (copy of primary logo)
- **Splash Icon**: `assets/images/splash-icon.png` (copy of primary logo)

## Logo Component
A reusable `Logo` component has been created at `components/Logo.tsx` with the following features:
- Multiple size options: small (24x24), medium (40x40), large (60x60), xlarge (120x120)
- Consistent styling and responsive design
- Easy to use across different screens

### Usage Example:
```tsx
import Logo from '@/components/Logo';

// Different sizes
<Logo size="small" />
<Logo size="medium" />
<Logo size="large" />
<Logo size="xlarge" />

// With custom styling
<Logo size="medium" style={{ marginBottom: 20 }} />
```

## Logo Placement

### 1. Splash Screen (`app/splash.tsx`)
- Large logo (120x120) prominently displayed
- Replaces the generic bridge emoji

### 2. Authentication Screen (`app/auth.tsx`)
- Large logo (60x60) in the header
- Provides brand recognition during login/signup

### 3. Role Selection Screen (`app/(tabs)/index.tsx`)
- Large logo (60x60) in the hero section
- Establishes brand identity for new users

### 4. Tab Layouts
- **Employer Tabs** (`app/employer-tabs/_layout.tsx`): Medium logo (40x40) in header
- **Worker Tabs** (`app/worker-tabs/_layout.tsx`): Medium logo (40x40) in header

### 5. Header Component (`components/Header.tsx`)
- Reusable header component with optional logo display
- Small logo (24x24) for consistent navigation branding

## App Configuration
Updated `app.json` to use the LabourBridge logo for:
- App icon
- Web favicon
- Splash screen icon

## Platform Support
The logo implementation supports:
- **iOS**: App icon and splash screen
- **Android**: App icon, adaptive icon, and splash screen
- **Web**: Favicon and app icon

## Deployment Considerations
When deploying the app:
1. The logo will appear as the app icon on device home screens
2. Web version will show the logo as favicon in browser tabs
3. Splash screen will display the logo during app startup
4. All navigation headers will show the logo for brand consistency

## File Structure
```
assets/
  images/
    labourbridgelogo.png     # Primary logo file
    icon.png                 # App icon (copy of logo)
    favicon.png              # Web favicon (copy of logo)
    splash-icon.png          # Splash screen icon (copy of logo)

components/
  Logo.tsx                   # Reusable logo component
  Header.tsx                 # Header component with logo option
```

## Benefits
1. **Brand Consistency**: Logo appears consistently across all screens
2. **Professional Appearance**: Enhances app's professional look
3. **User Recognition**: Helps users identify the app easily
4. **Scalable Implementation**: Easy to update logo across entire app
5. **Platform Optimization**: Proper logo sizing for different platforms

The logo implementation ensures that LabourBridge branding is visible and consistent throughout the entire application experience, from app installation to daily usage.