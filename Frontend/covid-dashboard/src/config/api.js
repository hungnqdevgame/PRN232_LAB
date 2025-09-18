// API Configuration
export const API_CONFIG = {
  // Development settings
  BASE_URL: "http://localhost:7000/odata",
  USE_MOCK_DATA: false, // Set to true to use mock data instead of API
  ENABLE_CORS_PROXY: false, // Set to true to use CORS proxy in development

  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // CORS Proxy URL (for development only)
  CORS_PROXY: "https://cors-anywhere.herokuapp.com/",

  // Request timeout - increased for batch processing
  TIMEOUT: 30000, // 30 seconds per batch request

  // Batch processing settings
  BATCH_SIZE: 64000, // Records per batch (reduced from 64000 for better concurrency)
  BATCH_DELAY: 50, // Milliseconds delay between batches (legacy, now used for chunk delays)
  MAX_CONCURRENT_REQUESTS: 8, // Maximum concurrent batch requests
  CHUNK_DELAY: 50, // Delay between concurrent chunks (milliseconds)
};

// Helper to get the correct API URL
export const getApiUrl = (endpoint) => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return null; // Will use mock data instead
  }

  const baseUrl = API_CONFIG.ENABLE_CORS_PROXY
    ? `${API_CONFIG.CORS_PROXY}${API_CONFIG.BASE_URL}`
    : API_CONFIG.BASE_URL;

  return `${baseUrl}${endpoint}`;
};

// Development helper to enable mock data
export const enableMockData = () => {
  API_CONFIG.USE_MOCK_DATA = true;
  console.log("🔧 Mock data enabled - API calls will be bypassed");
};

// Development helper to enable CORS proxy
export const enableCorsProxy = () => {
  API_CONFIG.ENABLE_CORS_PROXY = true;
  console.log("🔧 CORS proxy enabled - API calls will use proxy");
};

export default API_CONFIG;
