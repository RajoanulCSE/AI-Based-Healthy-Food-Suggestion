import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

export default function CalculatorScreen() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('sedentary');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!age || !weight || !height) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.CALCULATE, {
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        activity: activity || 'sedentary',
        goal: goal || 'maintain',
      }, {
        timeout: 10000,
      });

      if (response.data && response.data.bmi) {
        setResult(response.data);
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      let errorMsg = 'Failed to calculate';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server not responding.';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.error || 'Invalid input values';
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Network error. Cannot reach server.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else {
        errorMsg = 'Failed to calculate. Make sure server is running.';
      }
      
      Alert.alert('Error', errorMsg);
      console.log('Calculate error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📊 BMI Calculator</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter age"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter height"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.buttonGroup}>
            {[
              { label: 'Sedentary', value: 'sedentary' },
              { label: 'Light', value: 'light' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Very Active', value: 'very_active' }
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionButton,
                  activity === item.value && styles.optionButtonActive,
                ]}
                onPress={() => setActivity(item.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    activity === item.value && styles.optionButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal</Text>
          <View style={styles.buttonGroup}>
            {[
              { label: 'Weight Loss', value: 'lose' },
              { label: 'Maintain', value: 'maintain' },
              { label: 'Muscle Gain', value: 'gain' }
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionButton,
                  goal === item.value && styles.optionButtonActive,
                ]}
                onPress={() => setGoal(item.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    goal === item.value && styles.optionButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCalculate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Calculate BMI</Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your Results</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Age</Text>
            <Text style={styles.resultValue}>{result.age || 'N/A'}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>BMI</Text>
            <Text style={styles.resultValue}>{result.bmi ? result.bmi.toFixed(1) : 'N/A'}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Category</Text>
            <Text style={[
              styles.resultValue,
              {
                color: result.category && result.category.toLowerCase().includes('normal') ? '#4CAF50' : 
                       result.category && result.category.toLowerCase().includes('overweight') ? '#ff9800' : 
                       result.category && result.category.toLowerCase().includes('obese') ? '#f44336' : '#2196F3'
              }
            ]}>
              {result.category || 'N/A'}
            </Text>
          </View>

          <View style={styles.foodsSection}>
            <Text style={styles.foodsTitle}>🍽️ Recommended Foods</Text>
            {result.foods && Array.isArray(result.foods) && result.foods.length > 0 ? (
              result.foods.map((food, index) => (
                <Text key={index} style={styles.foodItem}>
                  • {food || 'Unknown food'}
                </Text>
              ))
            ) : (
              <Text style={styles.foodItem}>No foods recommended</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  foodsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  foodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  foodItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 18,
  },
});

