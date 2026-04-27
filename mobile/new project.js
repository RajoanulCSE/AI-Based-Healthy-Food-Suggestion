// Configuration for API calls
// Change this to your server's IP address
export const API_BASE_URL = "http://192.168.218.16:5000";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
  },
  CALCULATE: `${API_BASE_URL}/calculate`,
  SAVE_HEALTH: `${API_BASE_URL}/save_health_data`,
  GET_HEALTH_HISTORY: `${API_BASE_URL}/get_health_history`,
  GET_INSIGHTS: `${API_BASE_URL}/get_health_insights`,
  GET_RECOMMENDATIONS: `${API_BASE_URL}/get_personalized_recommendations`,
  SAVE_LIFESTYLE: `${API_BASE_URL}/save_lifestyle_data`,
  GET_LIFESTYLE: `${API_BASE_URL}/get_lifestyle_data`,
  CHAT: `${API_BASE_URL}/chat`,
};
