import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import HealthTrackingScreen from './screens/HealthTrackingScreen';
import AIGuidanceScreen from './screens/AIGuidanceScreen';
import ProfileScreen from './screens/ProfileScreen';
import NetworkDebugScreen from './screens/NetworkDebugScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ userEmail, setIsLoggedIn, setUserEmail }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'circle';
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'CalculatorTab') iconName = 'calculator';
          else if (route.name === 'TrackingTab') iconName = 'chart-line';
          else if (route.name === 'AITab') iconName = 'robot';
          else if (route.name === 'ProfileTab') iconName = 'account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShown: true,
        lazy: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="CalculatorTab"
        component={CalculatorScreen}
        options={{ title: 'BMI Calculator' }}
      />
      <Tab.Screen
        name="TrackingTab"
        component={HealthTrackingScreen}
        options={{
          title: 'Tracking',
          headerShown: true,
        }}
        initialParams={{
          userEmail: userEmail,
        }}
      />
      <Tab.Screen
        name="AITab"
        component={AIGuidanceScreen}
        options={{
          title: 'AI Guidance',
          headerShown: true,
        }}
        initialParams={{
          userEmail: userEmail,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{
          userEmail: userEmail,
          setIsLoggedIn: setIsLoggedIn,
          setUserEmail: setUserEmail,
          isProfileTab: true,
        }}
      />
    </Tab.Navigator>
  );
}

function LoginStackNavigator({ setIsLoggedIn, setUserEmail }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="NetworkDebug"
        component={NetworkDebugScreen}
      />
      <Stack.Screen
        name="LoginScreen"
        component={ProfileScreen}
        initialParams={{
          setIsLoggedIn: setIsLoggedIn,
          setUserEmail: setUserEmail,
          isProfileTab: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        {!isLoggedIn ? (
          <LoginStackNavigator setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />
        ) : (
          <TabNavigator userEmail={userEmail} setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />
        )}
      </NavigationContainer>
    </>
  );
}
