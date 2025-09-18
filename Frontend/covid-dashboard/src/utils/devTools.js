// Development utilities for testing different modes
import { enableMockData, enableCorsProxy, API_CONFIG } from "../config/api.js";
import { getAllCases } from "../services/apiService.js";

// Test API connection
window.testApiConnection = async () => {
  console.log("🔌 Testing API connection...");
  try {
    const data = await getAllCases();
    console.log("✅ API connection successful!");
    console.log("📊 Sample data received:", data?.slice(0, 2));
    return data;
  } catch (error) {
    console.error("❌ API connection failed:", error.message);
    if (error.message.includes("CORS")) {
      console.log("💡 Try running enableCorsProxy() or fix CORS on backend");
    }
    return null;
  }
};

// Quick functions to switch modes during development
window.enableMockData = () => {
  enableMockData();
  console.log("🔧 Mock data enabled. Refresh the page to see changes.");
};

window.enableCorsProxy = () => {
  enableCorsProxy();
  console.log("🔧 CORS proxy enabled. Refresh the page to see changes.");
};

window.showApiConfig = () => {
  console.log("📊 Current API Configuration:", API_CONFIG);
};

// Log available development commands
console.log(`
🛠️  Development Commands Available:
- testApiConnection() : Test connection to backend API
- enableMockData()    : Use static fallback data instead of API
- enableCorsProxy()   : Use CORS proxy for API calls
- showApiConfig()     : Show current API configuration

💡 Run these commands in the browser console to test different modes.
`);

export default {
  testApiConnection: window.testApiConnection,
  enableMockData,
  enableCorsProxy,
  showApiConfig: () => console.log(API_CONFIG),
};
