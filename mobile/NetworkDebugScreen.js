import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

export default function NetworkDebugScreen({ route }) {
  const userEmail = route?.params?.userEmail || '';
  
  const [debugMode, setDebugMode] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runNetworkTest = async (endpoint, name) => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail || 'test@test.com' }),
      });
      const duration = Date.now() - startTime;
      
      return {
        name,
        endpoint,
        status: response.ok ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        duration: `${duration}ms`,
        ok: response.ok,
      };
    } catch (error) {
      return {
        name,
        endpoint,
        status: 'FAILED',
        statusCode: 0,
        duration: `${Date.now() - startTime}ms`,
        ok: false,
        error: error.message,
      };
    }
  };

  const handleTestAll = async () => {
    setTesting(true);
    setTestResults([]);

    const endpoints = [
      { endpoint: '/login', name: 'Login' },
      { endpoint: '/register', name: 'Register' },
      { endpoint: '/calculate', name: 'Calculate BMI' },
      { endpoint: '/save_health_data', name: 'Save Health Data' },
      { endpoint: '/get_health_history', name: 'Get Health History' },
      { endpoint: '/get_health_insights', name: 'Get Health Insights' },
      { endpoint: '/get_personalized_recommendations', name: 'Get Recommendations' },
      { endpoint: '/save_lifestyle_data', name: 'Save Lifestyle Data' },
      { endpoint: '/get_lifestyle_data', name: 'Get Lifestyle Data' },
      { endpoint: '/chat', name: 'AI Chat' },
    ];

    const results = [];
    for (const ep of endpoints) {
      const result = await runNetworkTest(ep.endpoint, ep.name);
      results.push(result);
      setTestResults([...results]);
    }

    setTesting(false);
  };

  const handleTestPing = async () => {
    setTesting(true);
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: 25, weight: 70, height: 170 }),
      });
      const duration = Date.now() - startTime;
      
      Alert.alert(
        'Ping Test',
        `Server responded in ${duration}ms\nStatus: ${response.status}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Ping Test Failed', error.message);
    }
    setTesting(false);
  };

  const getStatusColor = (ok) => {
    return ok ? '#4CAF50' : '#f44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔧 Network Debug</Text>
        <Text style={styles.subtitle}>Test API connectivity and endpoints</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Server URL:</Text>
          <Text style={styles.infoValue}>{API_BASE_URL}</Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Debug Mode</Text>
          <Switch
            value={debugMode}
            onValueChange={setDebugMode}
            trackColor={{ false: '#767577', true: '#81C784' }}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.pingButton]}
            onPress={handleTestPing}
            disabled={testing}
          >
            <Text style={styles.buttonText}>Ping Server</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleTestAll}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : 'Test All APIs'}
            </Text>
          </TouchableOpacity>
        </View>

        {testResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={[styles.resultStatus, { color: getStatusColor(result.ok) }]}>
                    {result.status}
                  </Text>
                </View>
                <Text style={styles.resultEndpoint}>{result.endpoint}</Text>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetail}>Status: {result.statusCode}</Text>
                  <Text style={styles.resultDetail}>Time: {result.duration}</Text>
                </View>
                {result.error && (
                  <Text style={styles.errorText}>{result.error}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Troubleshooting</Text>
          <Text style={styles.helpText}>
            • Make sure the backend server is running{'\n'}
            • Check if your device is on the same network{'\n'}
            • Verify the IP address in config.js{'\n'}
            • Ensure the server port 5000 is accessible{'\n'}
            • Check firewall settings
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pingButton: {
    backgroundColor: '#2196F3',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultEndpoint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultDetail: {
    fontSize: 12,
    color: '#888',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 5,
  },
  helpSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});