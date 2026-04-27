import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍎 AI Healthy Food Suggestion</Text>
        <Text style={styles.subtitle}>Get personalized nutrition powered by AI</Text>
      </View>

      <View style={styles.features}>
        <FeatureCard
          icon="🤖"
          title="AI-Powered"
          description="Advanced algorithms analyze your health data"
        />
        <FeatureCard
          icon="⚕️"
          title="Medical Guidance"
          description="Professional consultation recommended"
        />
        <FeatureCard
          icon="🍽️"
          title="Meal Planning"
          description="Customized daily meal suggestions"
        />
        <FeatureCard
          icon="📊"
          title="Health Tracking"
          description="BMI calculation and progress monitoring"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <Text style={styles.infoStep}>1️⃣ Calculate your BMI using the Calculator tab</Text>
        <Text style={styles.infoStep}>2️⃣ Track your health metrics daily</Text>
        <Text style={styles.infoStep}>3️⃣ Get personalized food suggestions</Text>
        <Text style={styles.infoStep}>4️⃣ Monitor your progress over time</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Medical Disclaimer: This app provides suggestions based on general health guidelines. Please consult a healthcare professional before making any major dietary or lifestyle changes.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 8,
  },
  features: {
    padding: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoStep: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#fff3e0',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 20,
  },
});
