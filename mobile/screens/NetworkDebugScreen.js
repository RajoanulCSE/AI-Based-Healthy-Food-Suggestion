import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function NetworkDebugScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setTestResults([]);
    setLoading(true);
    const results = [];

    // Test 1: Connection to backend
    results.push({
      name: '1. Connecting to Backend',
      status: 'testing',
      message: `Testing ${API_BASE_URL}...`,
    });
    setTestResults([...results]);

    try {
      const response = await axios.get(`${API_BASE_URL}/`, {
        timeout: 5000,
      });
      results[0] = {
        name: '1. Connecting to Backend',
        status: 'success',
        message: `✓ Connected to ${API_BASE_URL}`,
      };
    } catch (error) {
      results[0] = {
        name: '1. Connecting to Backend',
        status: 'failed',
        message: `✗ Cannot reach ${API_BASE_URL}\nError: ${error.message}`,
      };
    }

    setTestResults([...results]);

    // Test 2: Ping Endpoint
    results.push({
      name: '2. Testing /login endpoint',
      status: 'testing',
      message: 'Sending test request...',
    });
    setTestResults([...results]);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: 'test@test.com',
        password: 'test',
      }, {
        timeout: 5000,
      });
      results[1] = {
        name: '2. Testing /login endpoint',
        status: 'success',
        message: '✓ Login endpoint is responding',
      };
    } catch (error) {
      if (error.response) {
        results[1] = {
          name: '2. Testing /login endpoint',
          status: 'success',
          message: '✓ Login endpoint is responding (error is expected)',
        };
      } else {
        results[1] = {
          name: '2. Testing /login endpoint',
          status: 'failed',
          message: `✗ Endpoint not responding\nError: ${error.message}`,
        };
      }
    }

    setTestResults([...results]);

    // Test 3: Configuration
    results.push({
      name: '3. Configuration Check',
      status: 'success',
      message: `API URL: ${API_BASE_URL}`,
    });
    setTestResults([...results]);

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Network Diagnostics</Text>
        <Text style={styles.subtitle}>Test your connection to the backend server</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        
        <View style={styles.configBox}>
          <Text style={styles.configLabel}>Backend Server IP:</Text>
          <Text style={styles.configValue}>{API_BASE_URL}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Run Network Test</Text>
          )}
        </TouchableOpacity>

        {testResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results:</Text>
            {testResults.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  result.status === 'success' ? styles.resultSuccess :
                  result.status === 'failed' ? styles.resultFailed :
                  styles.resultTesting,
                ]}
              >
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.troubleshootCard}>
        <Text style={styles.troubleshootTitle}>⚠️ Common Issues & Solutions:</Text>
        
        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootBold}>1. Network Error:</Text>
          <Text style={styles.troubleshootText}>
            • Make sure phone and laptop are on the SAME WiFi network{'\n'}
            • Check if phone is on 2.4GHz or 5GHz band{'\n'}
            • Try connecting phone to WiFi FIRST, then running the app{'\n'}
            • Restart WiFi router if needed
          </Text>
        </View>

        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootBold}>2. Firewall Issue:</Text>
          <Text style={styles.troubleshootText}>
            • Windows Firewall might be blocking port 5000{'\n'}
            • Allow Python through firewall{'\n'}
            • Or temporarily disable firewall for testing
          </Text>
        </View>

        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootBold}>3. IP Address Changed:</Text>
          <Text style={styles.troubleshootText}>
            • Run 'ipconfig' on laptop to get current IP{'\n'}
            • Update config.js with new IP if it changed{'\n'}
            • Restart Expo Go app after updating
          </Text>
        </View>

        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootBold}>4. Backend Not Running:</Text>
          <Text style={styles.troubleshootText}>
            • Make sure Flask server is still running{'\n'}
            • Check terminal for error messages{'\n'}
            • Restart with: npm run backend
          </Text>
        </View>
      </View>

      <View style={styles.navigationCard}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => {
            if (navigation) {
              navigation.navigate('LoginScreen');
            } else {
              Alert.alert('Ready', 'You can now try logging in!');
            }
          }}
        >
          <Text style={styles.proceedButtonText}>Continue to Login →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#ffe0b2',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  configBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  configLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  configValue: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultFailed: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  resultTesting: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  resultName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  troubleshootCard: {
    backgroundColor: '#fff3e0',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#e65100',
  },
  troubleshootItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  troubleshootBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 5,
  },
  troubleshootText: {
    fontSize: 12,
    color: '#bf360c',
    lineHeight: 18,
  },
  navigationCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
