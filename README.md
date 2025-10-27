# What's for Dinner? - Universal App Monorepo

A production-ready universal app built with Expo SDK 52, Next.js 15, NativeWind, and Turborepo for iOS, Android, and Web (PWA).

## 🚀 Features

- **Universal App**: Single codebase for iOS, Android, and Web
- **Modern Stack**: Expo SDK 52, Next.js 15, React 18, TypeScript
- **Styling**: NativeWind + Tailwind CSS for consistent design
- **Monorepo**: Turborepo with shared packages
- **PWA Support**: Offline-capable web app
- **CI/CD**: GitHub Actions with automated builds and deployments
- **Cross-Platform**: Shared UI components and business logic

## 📁 Project Structure

```
whats-for-dinner/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js 15 PWA
├── packages/
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utilities and hooks
│   ├── theme/           # Design system
│   └── config/          # Shared configurations
├── .github/workflows/   # CI/CD pipelines
└── turbo.json          # Turborepo configuration
```

## 🛠️ Tech Stack

### Mobile (Expo SDK 52)
- React Native 0.76.3
- Expo Router 4.0
- NativeWind 4.0
- TypeScript 5

### Web (Next.js 15)
- Next.js 15 with App Router
- PWA with next-pwa
- Tailwind CSS 3.4
- TypeScript 5

### Shared
- Turborepo for monorepo management
- pnpm for package management
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- iOS Simulator (for mobile development)
- Android Studio (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whats-for-dinner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build shared packages**
   ```bash
   pnpm run build:packages
   ```

### Development

#### Start all apps
```bash
pnpm dev
```

#### Start specific apps
```bash
# Web app only
pnpm dev:web

# Mobile app only
pnpm dev:mobile
```

#### Performance & Security Commands
```bash
# Performance monitoring
pnpm perf:monitor
pnpm perf:analyze
pnpm perf:lighthouse

# Security auditing
pnpm security:audit
pnpm security:scan

# Format code
pnpm format
pnpm format:check
```

#### Mobile Development

1. **Start Expo development server**
   ```bash
   cd apps/mobile
   pnpm dev
   ```

2. **Run on iOS Simulator**
   ```bash
   pnpm ios
   ```

3. **Run on Android Emulator**
   ```bash
   pnpm android
   ```

4. **Run on Web**
   ```bash
   pnpm web
   ```

#### Web Development

1. **Start Next.js development server**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Building for Production

### Web App

```bash
# Build for production
pnpm build:web

# The built files will be in apps/web/dist
```

### Mobile Apps

#### Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   cd apps/mobile
   eas build:configure
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

5. **Build for Android**
   ```bash
   eas build --platform android
   ```

#### Local Builds

```bash
# iOS (requires macOS)
cd apps/mobile
eas build --platform ios --local

# Android
cd apps/mobile
eas build --platform android --local
```

## 🎨 Styling

This project uses NativeWind (Tailwind CSS for React Native) for consistent styling across platforms.

### Mobile (NativeWind)
```tsx
import { View, Text } from 'react-native';

export function MyComponent() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-foreground">
        Hello World
      </Text>
    </View>
  );
}
```

### Web (Tailwind CSS)
```tsx
export function MyComponent() {
  return (
    <div className="flex-1 bg-background p-4">
      <h1 className="text-2xl font-bold text-foreground">
        Hello World
      </h1>
    </div>
  );
}
```

## 📦 Shared Packages

### UI Components (`@whats-for-dinner/ui`)
Cross-platform UI components that work on both mobile and web.

```tsx
import { Button } from '@whats-for-dinner/ui';

<Button variant="primary" onPress={() => {}}>
  Click me
</Button>
```

### Utils (`@whats-for-dinner/utils`)
Shared utilities, hooks, and helper functions.

```tsx
import { usePantry, cn } from '@whats-for-dinner/utils';

const { items, addItem } = usePantry();
```

### Config (`@whats-for-dinner/config`)
Shared configuration files for ESLint, Tailwind, and TypeScript.

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in the respective app directories:

#### Mobile (apps/mobile/.env.local)
```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Web (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### EAS Configuration

Update `apps/mobile/eas.json` with your app identifiers and credentials.

## 🚀 Deployment

### Web App
The web app is automatically deployed to GitHub Pages on push to main branch.

### Mobile Apps
Mobile apps are built using EAS Build and can be submitted to app stores.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@whats-for-dinner/ui

# Run tests in watch mode
pnpm test:watch
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

Built with ❤️ using Expo, Next.js, and Turborepo