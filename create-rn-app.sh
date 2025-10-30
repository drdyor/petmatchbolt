#!/bin/bash

# PawMatch React Native Migration Script
# This creates a complete Expo app structure with all necessary files

echo "🐾 Creating PawMatch React Native App..."

# Create project directory
PROJECT_DIR="pawmatch-mobile"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "pawmatch-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
EOF

# Create app.json
cat > app.json << 'EOF'
{
  "expo": {
    "name": "PawMatch",
    "slug": "pawmatch",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "pawmatch",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pawmatch.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.pawmatch.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-location"
    ]
  }
}
EOF

# Create .env template
cat > .env.example << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Create directory structure
mkdir -p src/{config,contexts,navigation,screens/{auth,buyer,breeder,vet,shelter,onboarding,shared},components,types,utils}

echo "✅ Created project structure"
echo ""
echo "📦 Next steps:"
echo "1. cd $PROJECT_DIR"
echo "2. npm install (install all dependencies)"
echo "3. Copy your .env file from the web project"
echo "4. npx expo start"
echo ""
echo "📱 Then I'll create all the React Native component files!"
EOF

chmod +x create-rn-app.sh

echo "✅ Script created: create-rn-app.sh"
