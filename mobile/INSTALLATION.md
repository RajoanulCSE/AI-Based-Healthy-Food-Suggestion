# Quick Start Guide - Mobile App Installation

## ✅ Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher) - Download from https://nodejs.org
- npm (comes with Node.js)
- Android phone with Expo Go app (from Google Play Store) OR Android emulator with Android Studio

## 🚀 Fast Setup (5 minutes)

### Step 1: Install Expo CLI
```powershell
npm install -g expo-cli
```

### Step 2: Navigate to Mobile Folder
```powershell
cd "c:\Users\USER\AI Based Healthy Food Suggestion\mobile"
```

### Step 3: Install Dependencies
```powershell
npm install
```

### Step 4: Start the App
```powershell
npm start
```

This will show a QR code in the terminal.

### Step 5: Run on Your Device

**Option A: Physical Android Phone**
1. Open Expo Go app on your phone
2. Tap "Scan QR code"
3. Scan the code shown in PowerShell
4. App loads on your phone!

**Option B: Android Emulator**
```powershell
npm run android
```

## ⚙️ Configuration

Before running, update the API URL in `config.js`:

1. Open: `mobile/config.js`
2. Find this line:
```javascript
export const API_BASE_URL = "http://192.168.0.110:5000";
```
3. Replace `192.168.0.110` with your actual server IP:
   - On Windows: Run `ipconfig` in terminal and look for "IPv4 Address"
   - Make sure backend Flask server is running

## ✨ Features Available

✅ User Registration & Login
✅ BMI Calculator with food suggestions
✅ Daily health tracking (weight, exercise, meals)
✅ Progress history
✅ Beautiful mobile UI

## ⚠️ Common Issues & Solutions

### Issue: "Can't connect to backend"
**Solution:**
- Check Flask server is running: `netstat -ano | findstr :5000`
- Update IP in `config.js` to match actual server IP
- Ensure phone and server are on same WiFi

### Issue: Expo won't start
**Solution:**
```powershell
# Clear cache and reinstall
expo start --clear
# OR
npm install
```

### Issue: QR code not scanning
**Solution:**
- Ensure good lighting
- Try using physical phone with Expo Go app
- Or use Android emulator with `npm run android`

## 📱 Screen Overview

1. **Login/Register** - Create account or sign in
2. **Home** - Learn about the app features
3. **BMI Calculator** - Calculate and get food suggestions
4. **Health Tracking** - Log daily measurements and activities
5. **Profile** - User info and settings

## 🎯 Next Steps

1. Run the app and test registration
2. Calculate your BMI
3. Track your health daily
4. Check recommended foods

## 📞 Support

- Backend server issues? Check Flask server is running on port 5000
- Expo issues? Visit https://docs.expo.dev
- React Native? Check https://reactnative.dev/docs

## 🔧 Advanced: Building APK for Distribution

When ready to share your app:

```powershell
# Build APK (requires Expo account)
eas build --platform android

# Then download from Expo dashboard
```

Happy coding! 🎉
