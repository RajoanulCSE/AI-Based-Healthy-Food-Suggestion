import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

export default function ProfileScreen({ route }) {
  // Get parameters from initialParams or route
  const setIsLoggedIn = route?.params?.setIsLoggedIn;
  const setUserEmail = route?.params?.setUserEmail;
  const userEmail = route?.params?.userEmail || '';
  const isProfileTab = route?.params?.isProfileTab === true;
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          if (setIsLoggedIn && setUserEmail) {
            setIsLoggedIn(false);
            setUserEmail('');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.REGISTER;
      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await axios.post(endpoint, payload, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success) {
        if (setIsLoggedIn && setUserEmail) {
          setIsLoggedIn(true);
          setUserEmail(email);
        }
        const msg = isLogin ? 'Login successful' : 'Registration successful';
        Alert.alert('Success', msg);
      } else {
        Alert.alert('Error', response.data.error || 'Authentication failed');
      }
    } catch (error) {
      let errorMsg = 'Connection failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout (10s). Server not responding.';
      } else if (error.message?.includes('Network') || error.message?.includes('ENOTFOUND')) {
        errorMsg = `Network error: Cannot reach server at 192.168.0.111:5000. Make sure:\n1. Phone and laptop are on same WiFi\n2. Backend server is running\n3. IP is correct`;
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.error || 'Invalid input';
      } else if (error.response?.status === 404) {
        errorMsg = 'User not found';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('Error', errorMsg);
      console.log('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // If used as a profile tab (after login), show profile info
  if (isProfileTab && userEmail) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>👤 My Profile</Text>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{userEmail}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>ℹ️ About This App</Text>
            <Text style={styles.infoBoxText}>
              AI-powered healthy food suggestions based on your BMI, activity level, and personal health goals.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>📋 Features</Text>
            <Text style={styles.infoBoxText}>• BMI Calculator{'\n'}• Health Tracking{'\n'}• Personalized Meal Suggestions{'\n'}• AI Insights</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // If used as auth screen, show login/register form
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🍎 Healthy Food App</Text>
        
        <View style={styles.toggleButtons}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.activeText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {isLogin
            ? "Don't have an account? Tap Register above"
            : 'Already have an account? Tap Login above'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  toggleButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#999',
    fontSize: 14,
  },
  profileInfo: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  profileLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  profileValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 20,
  },
});
