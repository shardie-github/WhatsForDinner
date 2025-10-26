# What's for Dinner - Universal App

A cross-platform meal planning application built with Next.js, Expo, and shared design system. Runs natively on iOS, Android, and as a Progressive Web App (PWA).

## 🏗️ Architecture

This is a Turborepo monorepo with the following structure:

```
/workspace/
├── apps/
│   ├── web/           # Next.js PWA (Web)
│   └── mobile/        # Expo React Native (iOS/Android)
├── packages/
│   ├── ui/            # Shared UI components
│   ├── utils/         # Shared utilities and hooks
│   └── theme/         # Design tokens and styling
└── scripts/           # Build and setup scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   npm run install:all
   ```

2. **Start development:**
   ```bash
   # Start all apps
   npm run dev
   
   # Or start individual apps
   npm run dev:web      # Web app on http://localhost:3000
   npm run dev:mobile   # Mobile app via Expo
   ```

3. **Build for production:**
   ```bash
   # Build all apps
   npm run build
   
   # Or build individual apps
   npm run build:web    # Static export for PWA
   npm run build:mobile # Expo build for app stores
   ```

## 📱 Platform Support

### Web (PWA)
- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS + NativeWind
- **PWA:** next-pwa with offline support
- **Deployment:** Static export compatible with Vercel, Netlify, etc.

### Mobile (iOS/Android)
- **Framework:** Expo SDK 51
- **Styling:** NativeWind (Tailwind for React Native)
- **Navigation:** Expo Router
- **Deployment:** EAS Build for App Store/Play Store

## 🎨 Design System

### Shared Components
All UI components are located in `/packages/ui` and support both web and mobile:

```tsx
import { Button, Text, Card } from '@whats-for-dinner/ui';

// Automatically renders as HTML button on web, TouchableOpacity on mobile
<Button variant="primary" onPress={handlePress}>
  <Text>Click me</Text>
</Button>
```

### Platform-Specific Files
Components use platform-specific files for optimal rendering:

```
Button/
├── Button.web.tsx     # Web implementation
├── Button.native.tsx  # Mobile implementation
└── Button.tsx         # Main export
```

### Design Tokens
Centralized design tokens in `/packages/theme`:

```tsx
import { colors, spacing, typography } from '@whats-for-dinner/theme';

// Consistent colors, spacing, and typography across platforms
```

## 🔧 Development

### Adding New Components

1. Create component in `/packages/ui/src/components/YourComponent/`
2. Add platform-specific files:
   - `YourComponent.web.tsx` - Web implementation
   - `YourComponent.native.tsx` - Mobile implementation
   - `YourComponent.tsx` - Main export
3. Export from `/packages/ui/src/index.ts`

### Adding New Utilities

1. Add utility functions to `/packages/utils/src/`
2. Export from `/packages/utils/src/index.ts`
3. Import in apps: `import { yourUtil } from '@whats-for-dinner/utils'`

### Styling Guidelines

- Use Tailwind classes for consistent styling
- Platform-specific styles in `.web.tsx` and `.native.tsx` files
- Design tokens from `/packages/theme` for colors, spacing, etc.
- Responsive design with Tailwind breakpoints

## 🧪 Testing

### Web Testing
```bash
cd apps/web
npm run test        # Unit tests
npm run test:e2e    # E2E tests with Playwright
```

### Mobile Testing
```bash
cd apps/mobile
npm run test        # Unit tests
npm run test:e2e    # E2E tests with Detox
```

## 📦 Building & Deployment

### Web (PWA)
```bash
npm run build:web
# Outputs to apps/web/dist/
# Deploy to Vercel, Netlify, or any static hosting
```

### Mobile (App Stores)
```bash
# iOS
cd apps/mobile
eas build --platform ios --profile production

# Android  
cd apps/mobile
eas build --platform android --profile production
```

## 🔄 State Management

- **Web:** React Query + Supabase
- **Mobile:** React Query + Supabase (same API)
- **Shared:** Custom hooks in `/packages/utils`

## 📱 PWA Features

- **Offline Support:** Service worker caches recipes and pantry data
- **Install Prompt:** Native app-like installation
- **Push Notifications:** Recipe reminders and updates
- **Background Sync:** Sync data when online

## 🎯 Performance Targets

- **Web:** TTI < 1.2s, Lighthouse 95+
- **Mobile:** TTI < 2s, 60fps animations
- **Bundle Size:** < 30MB (Android AAB)

## 🛠️ Tech Stack

### Core
- **Monorepo:** Turborepo
- **Web:** Next.js 16, React 19, TypeScript
- **Mobile:** Expo 51, React Native 0.75, TypeScript
- **Styling:** Tailwind CSS, NativeWind

### Shared
- **UI Components:** Custom design system
- **State:** React Query, Supabase
- **Validation:** Zod
- **Icons:** Lucide React

### Development
- **Linting:** ESLint, Prettier
- **Testing:** Jest, Testing Library, Playwright, Detox
- **Type Checking:** TypeScript

## 📚 Documentation

- [Design System Guide](./packages/ui/README.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native platform
- [Next.js](https://nextjs.org/) for the powerful React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [NativeWind](https://www.nativewind.dev/) for bringing Tailwind to React Native
- [Turborepo](https://turbo.build/) for the monorepo build system