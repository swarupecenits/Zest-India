# 🍽️ Zest India - Food Delivery App

A modern, full-featured food delivery application built with React Native and Expo. Order your favorite food with an intuitive interface, real-time location tracking, and secure authentication powered by Appwrite.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.29-000020.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

## 📱 Features

- **🔐 User Authentication** - Secure sign-up and sign-in with Appwrite backend
- **📍 Location Services** - Real-time location detection and delivery address selection
- **🍔 Food Marketplace** - Browse restaurants and menu items by category
- **🛒 Shopping Cart** - Add, remove, and manage orders with persistent cart state
- **👤 User Profile** - Update profile information and avatar with image upload
- **📦 Order Management** - Track order history and current orders
- **🔍 Search & Filter** - Find food items with advanced search and filters
- **💳 Secure Checkout** - Complete payment flow with order confirmation
- **🌙 Dark Mode Ready** - Automatic UI theme switching support
- **📊 Order QR Code** - Generate QR codes for order tracking

## 🛠️ Tech Stack

### Frontend

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe code
- **Expo Router** - File-based routing with deep linking
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - Lightweight state management

### Backend & Services

- **Appwrite** - Backend-as-a-Service (Authentication, Database, Storage)
- **Expo Location** - Geolocation and reverse geocoding
- **Sentry** - Error tracking and monitoring

### UI Components & Libraries

- **React Native Gesture Handler** - Touch gestures
- **React Native Reanimated** - Smooth animations
- **React Native SVG** - SVG rendering
- **Expo Image Picker** - Image selection and upload
- **React Native QR Code** - QR code generation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19.4 or higher recommended)
- **npm** or **yarn** package manager
- **Expo CLI** - `npm install -g expo-cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Appwrite Instance** - Self-hosted or cloud instance

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/swarupecenits/Zest-India.git
cd zest_india
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_PROJECT_NAME=your_project_name
SENTRY_AUTH_TOKEN=your_sentry_token
```

Replace the values with your Appwrite and Sentry credentials.

### 4. Seed Database (Optional)

Populate your Appwrite database with sample data:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm start
```

This will open Expo DevTools. You can then:

- Press **a** to open on Android emulator
- Press **i** to open on iOS simulator
- Scan QR code with Expo Go app on your physical device

## 📱 Build for Production

### Android

```bash
# Development build
npx expo run:android

# Production APK with EAS
eas build -p android --profile preview
```

### iOS

```bash
# Development build
npx expo run:ios

# Production build with EAS
eas build -p ios --profile preview
```

## 📂 Project Structure

```
zest_india/
├── app/                      # Main application code (Expo Router)
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home/Offers
│   │   ├── search.tsx       # Search
│   │   ├── cart.tsx         # Shopping cart
│   │   └── profile.tsx      # User profile
│   ├── marketplace/         # Food marketplace
│   │   └── [category].tsx
│   ├── menu/                # Restaurant menu
│   │   └── [id].tsx
│   ├── orders/              # Order management
│   │   ├── [id].tsx
│   │   └── history.tsx
│   ├── payment/             # Payment flow
│   │   └── checkout.tsx
│   ├── _layout.tsx          # Root layout
│   └── global.css           # Global styles
├── assets/                   # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/              # Reusable components
│   ├── CartButton.tsx
│   ├── CartItem.tsx
│   ├── CustomButton.tsx
│   ├── CustomHeader.tsx
│   ├── CustomInput.tsx
│   ├── Filter.tsx
│   ├── MenuCard.tsx
│   └── SearchBar.tsx
├── constants/               # App constants and data
│   └── index.ts
├── lib/                     # Utilities and services
│   ├── appwrite.ts          # Appwrite configuration
│   ├── data.ts              # Static data
│   ├── seed.ts              # Database seeding
│   └── useAppwrite.ts       # Appwrite custom hook
├── store/                   # State management
│   ├── auth.store.ts        # Authentication state
│   └── cart.store.ts        # Cart state
├── scripts/                 # Build and utility scripts
│   └── runSeed.js
└── android/                 # Native Android code
```

## 🎨 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |
| `npm run web` | Run in web browser |
| `npm run seed` | Seed Appwrite database with sample data |
| `npm run lint` | Run ESLint for code quality |
| `npm run reset-project` | Reset project to starter template |

## 🔧 Configuration Files

- **app.json** - Expo configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **metro.config.js** - Metro bundler configuration
- **eas.json** - EAS Build configuration
- **babel.config.js** - Babel transpiler configuration

## 🌐 Appwrite Setup

### Collections Required

1. **users** - User profiles
   - firstName, lastName, username, email, avatar
2. **restaurants** - Restaurant information
3. **menuItems** - Food items
4. **orders** - Order records
5. **cartItems** - Shopping cart data

### Storage Buckets

- **avatars** - User profile pictures
- **menuImages** - Food item images

## 🔒 Authentication Flow

1. User signs up with email/password
2. Appwrite creates account and session
3. User profile automatically created in database
4. Session persisted with Zustand store
5. Protected routes check authentication state

## 🐛 Troubleshooting

### Common Issues

**Build Errors with New Architecture:**

- Disable New Architecture in `app.json`: `"newArchEnabled": false`

**Location Not Working:**

- Grant location permissions in device settings
- Ensure Expo Location is properly installed

**Images Not Loading:**

- Check Appwrite storage bucket permissions
- Verify file IDs are correct

**Metro Bundler Errors:**

- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Swarup Kumar**

- GitHub: [@swarupecenits](https://github.com/swarupecenits)

## 🙏 Acknowledgments

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [NativeWind Documentation](https://www.nativewind.dev/)

---

Made with ❤️ By Swarup Chanda
