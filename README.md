# SupplyLink LK

> KYC-verified agricultural reverse marketplace for Sri Lanka.  
> Connecting home growers & small farmers with importers, distributors, restaurants, and hotels.

## Tech Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Mobile             | React Native + Expo SDK 51 + TypeScript |
| Backend            | Node.js + Express.js (REST API)         |
| Auth               | Firebase Authentication (Phone OTP)     |
| Database           | Cloud Firestore (real-time)             |
| Storage            | Firebase Storage                        |
| Push Notifications | Firebase Cloud Messaging (FCM)          |
| SMS Fallback       | Notify.lk API                           |
| Payments           | PayHere Sri Lanka                       |
| State Management   | Zustand                                 |
| Navigation         | Expo Router (file-based)                |
| Styling            | NativeWind (Tailwind for RN)            |
| Forms              | React Hook Form + Zod                   |
| i18n               | react-i18next (EN / SI / TA)            |

## Monorepo Structure

```
supplylink-lk/
├── apps/
│   ├── mobile/               # Expo React Native app
│   │   ├── app/              # Expo Router pages
│   │   │   ├── (auth)/       # Auth flow: phone → otp → role-select
│   │   │   ├── (tabs)/       # Main tabs: home, discover, post, messages, profile
│   │   │   └── (kyc)/        # KYC flow: nic-upload → selfie → status
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Colors, config, collections
│   │   ├── hooks/            # Custom React hooks
│   │   ├── locales/          # i18n translations (en, si, ta)
│   │   ├── services/         # Firebase SDK, API client, i18n init
│   │   ├── stores/           # Zustand stores (auth, etc.)
│   │   ├── types/            # App-specific TypeScript types
│   │   └── utils/            # Helpers & Zod validation schemas
│   └── backend/              # Express.js API server
│       └── src/
│           ├── constants/    # Firestore collection paths
│           ├── controllers/  # Route handlers
│           ├── middleware/    # Auth middleware
│           ├── routes/       # Express routers
│           ├── services/     # Business logic
│           └── types/        # Backend-specific types
└── packages/
    └── shared-types/         # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9 (workspaces support)
- Expo CLI (`npm install -g expo-cli`)
- Firebase project with Auth, Firestore, and Storage enabled

### Setup

1. **Clone & install dependencies**
   ```bash
   cd supplylink-lk
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in your Firebase config and API keys
   ```

3. **Run the mobile app**
   ```bash
   cd apps/mobile
   npx expo start
   ```

4. **Run the backend**
   ```bash
   cd apps/backend
   npm run dev
   ```

## User Roles

| Role       | Description                                     |
| ---------- | ----------------------------------------------- |
| `supplier` | Home growers & small farmers posting supply ads  |
| `business` | Importers, distributors, restaurants, hotels     |
| `admin`    | Platform admins managing KYC verification queue  |

## Languages

- 🇬🇧 English (`en`)
- 🇱🇰 Sinhala (`si`)
- 🇱🇰 Tamil (`ta`)

All UI strings go through `react-i18next` from day one.

## Color Palette

| Token        | Value     | Usage               |
| ------------ | --------- | ------------------- |
| Primary      | `#2D6A4F` | Trust, nature       |
| Accent       | `#F4A261` | Warmth, Sri Lanka   |
| Background   | `#F9F7F2` | Off-white, natural  |
| Surface      | `#FFFFFF` | Cards, modals       |
| Text Primary | `#1A1A2E` | Body text           |
| Text Muted   | `#6B7280` | Secondary text      |
| Error        | `#EF4444` | Validation errors   |
| Success      | `#10B981` | Confirmations       |

## License

Private — All rights reserved.
