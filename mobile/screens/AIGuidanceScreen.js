import React, { useState, useRef } from 'react';
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

export default function AIGuidanceScreen({ route }) {
  const userEmail = route?.params?.userEmail || '';
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! I\'m your AI health assistant. Ask me about sleep, meals, exercise, or any health tips!',
      sender: 'bot',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const messageIdRef = useRef(1);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please login again.');
      return;
    }

    const messageText = inputText;
    
    // Increment message ID
    messageIdRef.current += 1;
    const userMsgId = messageIdRef.current;

    // Add user message to chat
    const userMsg = {
      id: userMsgId,
      text: messageText,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.CHAT, {
        email: userEmail,
        message: messageText,
      }, {
        timeout: 10000,
      });

      if (response.data && response.data.reply) {
        messageIdRef.current += 1;
        const botMsg = {
          id: messageIdRef.current,
          text: response.data.reply,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, botMsg]);
        
        // Scroll to bottom after bot response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'No response from server');
      }
    } catch (error) {
      let errorMsg = 'Failed to get response';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Server may be slow.';
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Network error. Check connection.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('Error', errorMsg);
      console.log('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Health Assistant</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.messageBubble}>
            <ActivityIndicator color="#4CAF50" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me about sleep, meals, exercise..."
          value={inputText}
          onChangeText={setInputText}
          editable={!loading}
          multiline
          maxLength={200}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
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
    padding: 15,
    paddingTop: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 14,
    maxHeight: 80,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
