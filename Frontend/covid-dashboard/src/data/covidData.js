import {
  getAllCases,
  getCasesByDate,
  transformCasesToCovidData,
} from "../services/apiService.js";
import { API_CONFIG } from "../config/api.js";

// No fallback data - application will rely entirely on API

// Cache for COVID data
let cachedCovidData = null;
let lastFetchTime = null;
const CACHE_DURATION = API_CONFIG.CACHE_DURATION;

// Function to fetch COVID data from API using batch processing
export const fetchCovidData = async (date) => {
  try {
  
    console.log("🌐 Starting batch fetch from API...");
    const startTime = Date.now();

    // Fetch from API using batch processing
    const cases = await getCasesByDate(date);

    const fetchTime = Date.now() - startTime;
    console.log(`⏱️ Batch fetch completed in ${fetchTime}ms`);

    const transformedData = transformCasesToCovidData(cases);

    // Update cache
    cachedCovidData = transformedData;
    lastFetchTime = Date.now();

    console.log(
      "✅ API batch data processed successfully:",
      transformedData.length,
      "countries",
    );
    return transformedData;
  } catch (error) {
    console.error("❌ Failed to fetch COVID data from API:", error);

    // Handle specific errors - but don't return fallback data
    if (error.message.includes("CORS_ERROR")) {
      console.warn(
        "⚠️ CORS Error: Backend needs CORS configuration for batch requests.",
      );
      throw new Error(
        "CORS_ERROR: Backend CORS configuration required for batch processing",
      );
    }

    if (error.message.includes("MOCK_DATA_ENABLED")) {
      console.log("🔧 Mock data mode enabled - API disabled");
      throw new Error("MOCK_DATA_ENABLED: API is disabled in configuration");
    }

    if (error.message.includes("TIMEOUT_ERROR")) {
      console.warn(
        "⚠️ Request timeout: Backend server may be slow or down during batch processing.",
      );
      throw new Error(
        "TIMEOUT_ERROR: Backend server timeout during batch processing",
      );
    }

    // Re-throw the original error instead of returning fallback data
    throw error;
  }
};

// Export a function that returns the cached data (API only)
export const getCovidData = () => {
  if (cachedCovidData && cachedCovidData.length > 0) {
    return cachedCovidData;
  }
  // Return empty array if no cached data from API
  console.warn(
    "⚠️ No COVID data available. Make sure to call fetchCovidData() first.",
  );
  return [];
};

// Remove static export - data will come only from API
// export const covidData = []; // Removed: no longer using static data

// Generate the treemap format data (API data only)
export const getTreemapData = (dataType, providedData = null) => {
  // Use provided data or get from cache
  const currentData = providedData || getCovidData();

  if (
    !dataType ||
    !currentData ||
    !Array.isArray(currentData) ||
    currentData.length === 0
  ) {
    console.warn("⚠️ No data available for treemap. API data required.");
    return [];
  }

  console.log("getTreemapData input:", {
    dataType,
    dataLength: currentData.length,
    sampleData: currentData.slice(0, 3).map((c) => ({
      country: c.country,
      [dataType]: c[dataType],
      percent: c.percent,
    })),
  });

  // Dynamically import the color utils with better error handling
  let getTreemapColor;
  try {
    getTreemapColor = require("../utils/colorUtils").getTreemapColor;
  } catch (e) {
    console.warn("Could not load colorUtils, using fallback colors");
    // Fallback in case of import error
    getTreemapColor = (country) => {
      const colors = {
        US: "#0047AB",
        India: "#FF5733",
        Brazil: "#00A36C",
        "United Kingdom": "#FF6B6B",
        Russia: "#4ECDC4",
        France: "#45B7D1",
        Germany: "#F39C12",
        Italy: "#9B59B6",
        Spain: "#E74C3C",
        Turkey: "#1ABC9C",
        default: "#3498DB",
      };
      return colors[country] || colors.default;
    };
  }

  const result = currentData
    .filter((country) => {
      // More strict filtering
      return (
        country &&
        typeof country === "object" &&
        country.country &&
        country[dataType] !== undefined &&
        country[dataType] !== null &&
        country[dataType] > 0
      ); // Only include countries with data > 0
    })
    .map((country) => {
      const countryName = country.country || "Unknown";
      const size = country[dataType] || 0;
      const percentage = country.percent || 0;

      return {
        name: countryName,
        size: size,
        percentage: percentage,
        color: getTreemapColor(countryName), // Use treemap-specific colors
        fill: getTreemapColor(countryName), // Adding fill for recharts
      };
    })
    .sort((a, b) => b.size - a.size); // Sort by size descending

  console.log("getTreemapData output:", {
    resultLength: result.length,
    top5: result.slice(0, 5).map((r) => ({
      name: r.name,
      size: r.size,
      percentage: r.percentage,
    })),
  });

  return result;
};

// Generate color based on percentage with shades of blue (for world map)
export const getColorByPercentage = (percent) => {
  if (percent >= 15) return "#00205B"; // Darkest blue for very high values (US - 19%)
  if (percent >= 10) return "#00297A"; // Very dark blue for high values (India - 12%)
  if (percent >= 8) return "#003399"; // Dark blue for medium-high values (Brazil - 8%)
  if (percent >= 5) return "#0047AB"; // Medium-dark blue for medium-high values (5-8%)
  if (percent >= 3) return "#0066CC"; // Medium blue for medium values (3-5%)
  if (percent >= 2) return "#4D94FF"; // Light blue for lower-medium values (2-3%)
  if (percent >= 1) return "#99C2FF"; // Very light blue for low values (1-2%)
  if (percent > 0) return "#E6F7FF"; // Lightest blue for very low or no values (<1%)
  return "#F5F5F5";
};

// Get a country's color for the map based on dataType (API data only)
export const getCountryColor = (countryCode, dataType, providedData = null) => {
  // Use provided data or get from cache
  const currentData = providedData || getCovidData();

  if (!currentData || currentData.length === 0) {
    console.warn(
      "⚠️ No COVID data available for country coloring. API data required.",
    );
    return "#F5F5F5"; // Default light gray when no data
  }

  // Enhanced country mapping for better API data support
  const directMapping = {
    USA: "US", // United States
    GBR: "United Kingdom", // United Kingdom
    IND: "India", // India
    BRA: "Brazil", // Brazil
    RUS: "Russia", // Russia
    FRA: "France", // France
    DEU: "Germany", // Germany
    ITA: "Italy", // Italy
    ESP: "Spain", // Spain
    TUR: "Turkey", // Turkey
    MEX: "Mexico", // Mexico
  };

  // Attempt direct mapping first
  let countryName = directMapping[countryCode];
  if (countryName) {
    const countryObj = currentData.find((c) => c.country === countryName);
    if (countryObj) {
      console.log(
        `Direct match: ${countryCode} -> ${countryName}, percent: ${countryObj.percent}`,
      );
      return getColorByPercentage(countryObj.percent);
    }
  }

  // Try matching by ISO code
  let country = currentData.find(
    (c) =>
      c.countryInfo &&
      (c.countryInfo.iso3 === countryCode ||
        c.countryInfo.iso2 === countryCode),
  );

  // If no match by ISO code, try matching by name
  if (!country && countryCode) {
    const normalizedCode = countryCode.toLowerCase();
    const codeNameMap = {
      usa: "US",
      gbr: "United Kingdom",
      ind: "India",
      bra: "Brazil",
      rus: "Russia",
      fra: "France",
      deu: "Germany",
      ita: "Italy",
      esp: "Spain",
      tur: "Turkey",
      mex: "Mexico",
    };

    const possibleName = codeNameMap[normalizedCode];
    if (possibleName) {
      country = currentData.find((c) => c.country === possibleName);
    }
  }

  if (!country) {
    console.log(`No match for country code: ${countryCode}`);
    return "#F5F5F5"; // Default light gray for countries with no data
  }

  console.log(
    `Found match for ${countryCode}: ${country.country}, percent: ${country.percent}`,
  );
  return getColorByPercentage(country.percent);
};

// Format large numbers with commas
export const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get total counts for each data type (API data only)
export const getTotals = (providedData = null) => {
  // Use provided data or get from cache
  const currentData = providedData || getCovidData();

  if (!currentData || currentData.length === 0) {
    console.warn(
      "⚠️ No COVID data available for totals calculation. API data required.",
    );
    return {
      confirmed: 0,
      active: 0,
      recovered: 0,
      deaths: 0,
      dailyIncrease: 0,
    };
  }

  return currentData.reduce(
    (totals, country) => {
      totals.confirmed += country.confirmed || 0;
      totals.active += country.active || 0;
      totals.recovered += country.recovered || 0;
      totals.deaths += country.deaths || 0;
      totals.dailyIncrease += country.dailyIncrease || 0;
      return totals;
    },
    {
      confirmed: 0,
      active: 0,
      recovered: 0,
      deaths: 0,
      dailyIncrease: 0,
    },
  );
};
