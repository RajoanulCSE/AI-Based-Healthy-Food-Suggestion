# Healthy Food Suggestion - React Native Mobile App

A React Native mobile app for personalized AI-powered nutrition recommendations. This app connects to the Flask backend to provide BMI calculations and food suggestions.

## 📱 Features

- **User Authentication**: Register and login with email and password
- **BMI Calculator**: Calculate BMI based on age, weight, height, and activity level
- **Personalized Food Suggestions**: Get food recommendations based on your health profile
- **Health Tracking**: Track daily weight, height, meals, water intake, and exercise
- **Responsive UI**: Beautiful Material Design interface optimized for mobile

## 🚀 Setup Instructions

### Prerequisites
- Node.js and npm installed
- Expo CLI: `npm install -g expo-cli`
- Android emulator or physical Android phone with Expo Go app

### Installation

1. Navigate to the mobile directory:
```bash
cd "c:\Users\USER\AI Based Healthy Food Suggestion\mobile"
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `config.js`:
```javascript
export const API_BASE_URL = "http://192.168.0.110:5000"; // Update with your server IP
```

### Running the App

#### On Emulator:
```bash
npm run android
```

#### On Physical Device:
1. Install Expo Go app from Google Play Store
2. Run:
```bash
npm start
```
3. Scan the QR code with your phone or select "Open with Expo Go"

## 📁 Project Structure

```
mobile/
├── App.js                 # Main app entry point with navigation
├── config.js             # API configuration
├── package.json          # Dependencies
├── app.json              # Expo configuration
└── screens/
    ├── ProfileScreen.js  # Login/Registration
    ├── HomeScreen.js     # Home page with info
    ├── CalculatorScreen.js # BMI Calculator
    └── HealthTrackingScreen.js # Health data tracking
```

## 🔗 API Integration

The app connects to your Flask backend at port 5000. Make sure your Flask server is running:

```bash
cd backend
python app.py
```

### Supported Endpoints:
- `POST /register` - User registration
- `POST /login` - User login
- `POST /calculate` - BMI calculation
- `POST /save_health_tracking` - Save health data
- `POST /chat` - AI chatbot (future feature)

## 📦 Building for Production

To build an APK for Android:

```bash
eas build --platform android
```

Or using the Expo dashboard at [https://expo.dev](https://expo.dev)

## ⚠️ Important Notes

1. **Update API URL**: Before building, update `config.js` with your actual server IP address
2. **Network Access**: Ensure your phone is on the same WiFi network as the server (for local testing)
3. **Permissions**: Grant necessary permissions when the app requests them
4. **Medical Disclaimer**: This app is for informational purposes. Always consult healthcare professionals.

## 🛠️ Troubleshooting

### App won't connect to backend
- Check if Flask server is running: `netstat -ano | findstr :5000`
- Verify API URL in `config.js` matches your server IP
- Ensure phone and server are on the same network

### Expo not working
- Try clearing cache: `expo start --clear`
- Delete `node_modules` and reinstall: `npm install`

## 📝 License

This project is part of the Healthy Food Suggestion System.

## 👨‍💻 Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
