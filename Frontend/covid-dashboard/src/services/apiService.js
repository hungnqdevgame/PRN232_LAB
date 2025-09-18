// API Service for COVID-19 Dashboard
import { API_CONFIG, getApiUrl } from "../config/api.js";

// Helper function to handle API calls
const apiCall = async (endpoint) => {
  // Check if mock data is enabled
  if (API_CONFIG.USE_MOCK_DATA) {
    throw new Error("MOCK_DATA_ENABLED");
  }

  const url = getApiUrl(endpoint);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: "GET",
      mode: "cors", // Explicitly enable CORS
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "omit", // Don't send credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle OData response format - extract the 'value' array
    if (data && typeof data === "object" && Array.isArray(data.value)) {
      console.log("OData response received:", data);
      return data.value; // Return the actual data array
    }

    // If it's already an array, return as is
    if (Array.isArray(data)) {
      return data;
    }

    // For single object responses, wrap in array
    return [data];
  } catch (error) {
    console.error("API call failed:", error);

    // Handle different types of errors
    if (error.name === "AbortError") {
      throw new Error("TIMEOUT_ERROR: Request timed out");
    }

    if (error.message.includes("CORS") || error.message.includes("fetch")) {
      console.error(
        "CORS Error: Backend needs to allow frontend origin. Please configure CORS on the backend server."
      );
      throw new Error("CORS_ERROR: Backend CORS configuration required");
    }

    throw error;
  }
};

// Get all cases with region information
export const getAllCases = async () => {
  return await apiCall("/Cases?$expand=Region");
};

// Get latest cases for all regions (assuming we want the most recent date)
export const getLatestCasesByRegion = async () => {
  return await apiCall("/Cases?$expand=Region&$orderby=RecordedDate desc");
};

// Get cases for a specific country by region name
export const getCasesByCountry = async (countryName) => {
  return await apiCall(
    `/Cases?$filter=Region/Name eq '${countryName}'&$expand=Region&$orderby=RecordedDate desc`
  );
};

// Get cases for a specific date
export const getCasesByDate = async (date) => {
  return await apiCall(`/Cases?$filter=RecordedDate eq ${date}&$expand=Region`);
};

// Get aggregated totals for all regions
export const getGlobalTotals = async () => {
  return await apiCall(
    "/Cases?$apply=groupby((RecordedDate),aggregate(ConfirmedCases with sum as TotalConfirmed,RecoveredCases with sum as TotalRecovered,DeathCases with sum as TotalDeaths))&$orderby=RecordedDate desc&$top=1"
  );
};

// Get all regions
export const getAllRegions = async () => {
  return await apiCall(
    "/Cases?$select=Region/Name,Region/Id&$expand=Region&$apply=groupby((Region/Name,Region/Id))"
  );
};

// Transform backend data to frontend format
export const transformCasesToCovidData = (cases) => {
  console.log("Transforming cases data:", cases);

  // Ensure cases is an array
  if (!Array.isArray(cases)) {
    console.error("Cases data is not an array:", cases);
    return [];
  }

  // Group cases by region and get the latest data for each region
  const regionMap = new Map();

  cases.forEach((caseItem) => {
    const regionName = caseItem.Region?.Name;
    if (!regionName) {
      console.warn("Case item missing region name:", caseItem);
      return;
    }

    const existingCase = regionMap.get(regionName);
    if (
      !existingCase ||
      new Date(caseItem.RecordedDate) > new Date(existingCase.RecordedDate)
    ) {
      regionMap.set(regionName, caseItem);
    }
  });

  console.log("Regions found:", Array.from(regionMap.keys()));

  // Transform to frontend format
  const transformedData = Array.from(regionMap.values()).map((caseItem) => {
    const region = caseItem.Region;
    const confirmed = caseItem.ConfirmedCases || 0;
    const recovered = caseItem.RecoveredCases || 0;
    const deaths = caseItem.DeathCases || 0;
    const active = confirmed - recovered - deaths;

    console.log(`Processing ${region.Name}:`, {
      confirmed,
      recovered,
      deaths,
      active: Math.max(0, active),
    });

    // Get country info mapping
    const countryMapping = {
      US: { iso2: "US", iso3: "USA" },
      "United States": { iso2: "US", iso3: "USA" },
      India: { iso2: "IN", iso3: "IND" },
      Brazil: { iso2: "BR", iso3: "BRA" },
      "United Kingdom": { iso2: "GB", iso3: "GBR" },
      Russia: { iso2: "RU", iso3: "RUS" },
      France: { iso2: "FR", iso3: "FRA" },
      Turkey: { iso2: "TR", iso3: "TUR" },
      Spain: { iso2: "ES", iso3: "ESP" },
      Italy: { iso2: "IT", iso3: "ITA" },
      Germany: { iso2: "DE", iso3: "DEU" },
      Argentina: { iso2: "AR", iso3: "ARG" },
      Poland: { iso2: "PL", iso3: "POL" },
      Iran: { iso2: "IR", iso3: "IRN" },
      Mexico: { iso2: "MX", iso3: "MEX" },
      Ukraine: { iso2: "UA", iso3: "UKR" },
      "South Africa": { iso2: "ZA", iso3: "ZAF" },
      Philippines: { iso2: "PH", iso3: "PHL" },
      Malaysia: { iso2: "MY", iso3: "MYS" },
      Netherlands: { iso2: "NL", iso3: "NLD" },
      Indonesia: { iso2: "ID", iso3: "IDN" },
      Chile: { iso2: "CL", iso3: "CHL" },
    };

    const countryInfo = countryMapping[region.Name] || {
      iso2: region.Name?.substring(0, 2).toUpperCase(),
      iso3: region.Name?.substring(0, 3).toUpperCase(),
    };

    return {
      country: region.Name,
      countryInfo,
      confirmed,
      active: Math.max(0, active),
      recovered,
      deaths,
      dailyIncrease: 0, // This would need historical data to calculate
      percent: 0, // This will be calculated after we have all data
    };
  });

  // Calculate percentages
  const totalConfirmed = transformedData.reduce(
    (sum, item) => sum + item.confirmed,
    0
  );

  console.log("Total confirmed cases:", totalConfirmed);

  transformedData.forEach((item) => {
    item.percent =
      totalConfirmed > 0
        ? Math.round((item.confirmed / totalConfirmed) * 100)
        : 0;
  });

  console.log("Transformed data sample:", transformedData.slice(0, 3));
  return transformedData;
};

// Get daily increase data for a specific country
export const getDailyIncreaseByCountry = async (countryName, days = 7) => {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const cases = await apiCall(
    `/Cases?$filter=Region/Name eq '${countryName}' and RecordedDate ge ${startDate} and RecordedDate le ${endDate}&$expand=Region&$orderby=RecordedDate asc`
  );

  console.log(`Daily increase data for ${countryName}:`, cases);

  // Ensure cases is an array
  if (!Array.isArray(cases)) {
    console.error("Cases data is not an array for daily increase:", cases);
    return [];
  }

  // Calculate daily increases
  const dailyIncreases = [];
  for (let i = 1; i < cases.length; i++) {
    const current = cases[i];
    const previous = cases[i - 1];
    const increase =
      (current.ConfirmedCases || 0) - (previous.ConfirmedCases || 0);
    dailyIncreases.push({
      date: current.RecordedDate,
      dailyIncrease: Math.max(0, increase),
    });
  }

  return dailyIncreases;
};

// Error handler for failed API calls
export const handleApiError = (error) => {
  console.error("API Error:", error);

  // Return fallback data or empty array
  return [];
};
