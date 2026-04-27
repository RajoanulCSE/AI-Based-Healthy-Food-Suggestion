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

export default function HealthTrackingScreen({ route }) {
  const userEmail = route?.params?.userEmail || '';

  const [trackingData, setTrackingData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    activity: 'moderate',
    goal: 'maintain',
    skin_disease: false,
    allergies: [],
  });

  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  const handleInputChange = (field, value) => {
    setTrackingData({
      ...trackingData,
      [field]: value,
    });
  };

  const handleSaveTracking = async () => {
    if (!trackingData.weight || !trackingData.height) {
      Alert.alert('Error', 'Please enter weight and height');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please login again.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: userEmail,
        date: trackingData.date,
        weight: parseFloat(trackingData.weight),
        height: parseFloat(trackingData.height),
        activity: trackingData.activity || 'moderate',
        goal: trackingData.goal || 'maintain',
        skin_disease: trackingData.skin_disease || false,
        allergies: trackingData.allergies || [],
      };

      const response = await axios.post(API_ENDPOINTS.SAVE_HEALTH, payload, {
        timeout: 10000,
      });
      
      if (response.data && (response.data.success || response.data.id)) {
        Alert.alert('Success', 'Health data saved successfully');
        
        setSavedData([trackingData, ...savedData]);
        setTrackingData({
          date: new Date().toISOString().split('T')[0],
          weight: '',
          height: '',
          activity: 'moderate',
          goal: 'maintain',
          skin_disease: false,
          allergies: [],
        });
      } else {
        Alert.alert('Error', response.data?.error || 'Failed to save data');
      }
    } catch (error) {
      let errorMsg = 'Failed to save data';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server may be slow.';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.error || 'Invalid data format';
      } else if (error.response?.status === 404) {
        errorMsg = 'User not found. Please login again.';
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Network error. Check connection.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else {
        errorMsg = error.message || 'Failed to save data. Check server connection.';
      }
      
      Alert.alert('Error', errorMsg);
      console.log('Save tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please login again.');
      return;
    }

    setRecommendationLoading(true);

    try {
      const response = await axios.get(API_ENDPOINTS.GET_RECOMMENDATIONS, {
        params: { email: userEmail },
        timeout: 10000,
      });

      if (response.data) {
        setRecommendations(response.data);
        Alert.alert('Success', 'Recommendations loaded');
      } else {
        Alert.alert('Error', 'No recommendations available. Please save health data first.');
      }
    } catch (error) {
      let errorMsg = 'Failed to get recommendations';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server may be slow.';
      } else if (error.response?.status === 404) {
        errorMsg = 'No health data found. Please save your health info first.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Network error. Check connection.';
      }
      
      Alert.alert('Error', errorMsg);
      console.log('Recommendations error:', error);
    } finally {
      setRecommendationLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📊 Health Tracking</Text>

        <Text style={styles.sectionTitle}>Basic Measurements</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={trackingData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={trackingData.weight}
            onChangeText={(value) => handleInputChange('weight', value)}
            keyboardType="decimal-pad"
            placeholder="Enter weight"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={trackingData.height}
            onChangeText={(value) => handleInputChange('height', value)}
            keyboardType="decimal-pad"
            placeholder="Enter height"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Health Goals</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.buttonGroup}>
            {['sedentary', 'light', 'moderate', 'active'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  trackingData.activity === level && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange('activity', level)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    trackingData.activity === level && styles.optionButtonTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.buttonGroup}>
            {['lose', 'maintain', 'gain'].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.optionButton,
                  trackingData.goal === goal && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange('goal', goal)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    trackingData.goal === goal && styles.optionButtonTextActive,
                  ]}
                >
                  {goal.charAt(0).toUpperCase() + goal.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSaveTracking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Health Data</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recommendationButton, recommendationLoading && styles.buttonDisabled]}
          onPress={handleGetRecommendations}
          disabled={recommendationLoading}
        >
          {recommendationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🍽️ Get Meal Recommendations</Text>
          )}
        </TouchableOpacity>
      </View>

      {savedData && savedData.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>📈 Recent Entries</Text>
          {savedData.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>{entry?.date || 'N/A'}</Text>
              <Text style={styles.historyText}>Weight: {entry?.weight || 'N/A'} kg | Height: {entry?.height || 'N/A'} cm</Text>
              <Text style={styles.historyText}>Activity: {entry?.activity || 'N/A'} | Goal: {entry?.goal || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}

      {recommendations && (
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>🎯 Your Personalized Recommendations</Text>
          
          {recommendations.foods && recommendations.foods.length > 0 && (
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationSectionTitle}>🍽️ Recommended Foods</Text>
              {recommendations.foods.map((food, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  • {food}
                </Text>
              ))}
            </View>
          )}

          {recommendations.notes && (
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationSectionTitle}>💡 Health Tips</Text>
              <Text style={styles.tipsText}>{recommendations.notes}</Text>
            </View>
          )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 12,
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
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
  subButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  subButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bmiResult: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 12,
  },
  bmiLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bmiValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  historyText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  recommendationButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  recommendationCard: {
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
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2196F3',
  },
  recommendationSection: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendationSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 18,
  },
  tipsText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});
