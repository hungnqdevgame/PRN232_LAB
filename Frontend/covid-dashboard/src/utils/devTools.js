// Development utilities for testing different modes
import { enableMockData, enableCorsProxy, API_CONFIG } from "../config/api.js";

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
- enableMockData()    : Use static fallback data instead of API
- enableCorsProxy()   : Use CORS proxy for API calls
- showApiConfig()     : Show current API configuration

💡 Run these commands in the browser console to test different modes.
`);

export default {
  enableMockData,
  enableCorsProxy,
  showApiConfig: () => console.log(API_CONFIG),
};
