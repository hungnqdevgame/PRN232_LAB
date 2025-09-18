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
      credentials: "omit", // Don't send credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);

    // Handle different types of errors
    if (error.name === "AbortError") {
      throw new Error("TIMEOUT_ERROR: Request timed out");
    }

    if (error.message.includes("CORS") || error.message.includes("fetch")) {
      console.error(
        "CORS Error: Backend needs to allow frontend origin. Please configure CORS on the backend server.",
      );
      throw new Error("CORS_ERROR: Backend CORS configuration required");
    }

    throw error;
  }
};

// Get all cases with region information using optimized batch processing with concurrent requests
export const getAllCases = async () => {
  const startTime = performance.now();

  try {
    // Step 1: Get total count of cases
    const countUrl = getApiUrl("/Cases/$count");
    console.log("🔢 Getting total count from:", countUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const countResponse = await fetch(countUrl, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain", // OData $count returns plain text
      },
      credentials: "omit",
      signal: controller.signal,
    });

    console.log(countResponse);
    clearTimeout(timeoutId);

    if (!countResponse.ok) {
      throw new Error(`Failed to get count: ${countResponse.status}`);
    }

    const totalCount = parseInt(await countResponse.text());
    console.log(`📊 Total cases count: ${totalCount}`);

    if (totalCount === 0) {
      return { value: [] };
    }

    // Step 2: Fetch data in batches using concurrent processing
    const BATCH_SIZE = API_CONFIG.BATCH_SIZE || 4000;
    const MAX_CONCURRENT_REQUESTS = API_CONFIG.MAX_CONCURRENT_REQUESTS || 5;
    const CHUNK_DELAY = API_CONFIG.CHUNK_DELAY || 200;
    const totalBatches = Math.ceil(totalCount / BATCH_SIZE);

    console.log(
      `� Processing ${totalBatches} batches of ${BATCH_SIZE} records each with concurrent requests`,
    );

    // Create batch fetch function
    const fetchBatch = async (batchIndex) => {
      const skip = batchIndex * BATCH_SIZE;
      const top = Math.min(BATCH_SIZE, totalCount - skip);

      console.log(
        `📦 Starting batch ${
          batchIndex + 1
        }/${totalBatches} (skip: ${skip}, top: ${top})`,
      );

      try {
        const batchData = await apiCall(
          `/Cases?$expand=Region&$skip=${skip}&$top=${top}&$orderby=Id`,
        );

        if (batchData && batchData.value && Array.isArray(batchData.value)) {
          console.log(
            `✅ Batch ${batchIndex + 1} completed: ${
              batchData.value.length
            } records`,
          );
          return {
            batchIndex,
            data: batchData.value,
            success: true,
          };
        } else {
          console.warn(
            `⚠️ Batch ${batchIndex + 1} returned invalid data:`,
            batchData,
          );
          return {
            batchIndex,
            data: [],
            success: false,
          };
        }
      } catch (error) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, error);
        return {
          batchIndex,
          data: [],
          success: false,
          error: error.message,
        };
      }
    };

    // Process batches in parallel with controlled concurrency
    const allCases = [];
    const results = [];

    // Process batches in chunks to control concurrency
    for (let i = 0; i < totalBatches; i += MAX_CONCURRENT_REQUESTS) {
      const batchPromises = [];
      const endIndex = Math.min(i + MAX_CONCURRENT_REQUESTS, totalBatches);

      // Create promises for current chunk
      for (let j = i; j < endIndex; j++) {
        batchPromises.push(fetchBatch(j));
      }

      console.log(
        `🔄 Processing concurrent batch chunk: ${
          i + 1
        }-${endIndex} of ${totalBatches}`,
      );

      // Wait for all batches in current chunk to complete
      const chunkResults = await Promise.allSettled(batchPromises);

      // Process results
      chunkResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const batchResult = result.value;
          results.push(batchResult);

          if (batchResult.success) {
            allCases.push(...batchResult.data);
          }
        } else {
          console.error(
            `❌ Promise rejected for batch ${i + index + 1}:`,
            result.reason,
          );
          results.push({
            batchIndex: i + index,
            data: [],
            success: false,
            error: result.reason?.message || "Promise rejected",
          });
        }
      });

      // Progress update
      const completedBatches = Math.min(endIndex, totalBatches);
      const progress = Math.round((completedBatches / totalBatches) * 100);
      console.log(
        `📈 Progress: ${completedBatches}/${totalBatches} batches completed (${progress}%) - ${allCases.length} records fetched`,
      );

      // Add small delay between chunks to be respectful to server
      if (endIndex < totalBatches) {
        await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY));
      }
    }

    // Sort results by batch index to maintain order
    results.sort((a, b) => a.batchIndex - b.batchIndex);

    // Report final statistics
    const successfulBatches = results.filter((r) => r.success).length;
    const failedBatches = results.filter((r) => !r.success).length;

    console.log(`🎉 Batch processing completed!`);
    console.log(`✅ Successful batches: ${successfulBatches}/${totalBatches}`);
    console.log(`❌ Failed batches: ${failedBatches}/${totalBatches}`);
    console.log(`📊 Total records fetched: ${allCases.length}/${totalCount}`);

    if (failedBatches > 0) {
      console.warn(`⚠️ Some batches failed. Data may be incomplete.`);
      const failedBatchIndexes = results
        .filter((r) => !r.success)
        .map((r) => r.batchIndex + 1);
      console.warn(`Failed batch numbers: ${failedBatchIndexes.join(", ")}`);
    }

    return { value: allCases };
  } catch (error) {
    console.error("❌ Batch processing failed:", error);

    // Handle different types of errors
    if (error.name === "AbortError") {
      throw new Error(
        "TIMEOUT_ERROR: Request timed out during batch processing",
      );
    }

    if (error.message.includes("CORS") || error.message.includes("fetch")) {
      console.error(
        "CORS Error: Backend needs to allow frontend origin for batch requests.",
      );
      throw new Error(
        "CORS_ERROR: Backend CORS configuration required for batch processing",
      );
    }

    throw error;
  }
};

// // Get latest cases for all regions (assuming we want the most recent date)
// export const getLatestCasesByRegion = async () => {
//   return await apiCall("/Cases?$expand=Region&$orderby=RecordedDate desc");
// };

// // Get cases for a specific country by region name
// export const getCasesByCountry = async (countryName) => {
//   return await apiCall(
//     `/Cases?$filter=Region/Name eq '${countryName}'&$expand=Region&$orderby=RecordedDate desc`
//   );
// };

// // Get cases for a specific date
// export const getCasesByDate = async (date) => {
//   return await apiCall(`/Cases?$filter=RecordedDate eq ${date}&$expand=Region`);
// };

// // Get aggregated totals for all regions
// export const getGlobalTotals = async () => {
//   return await apiCall(
//     "/Cases?$apply=groupby((RecordedDate),aggregate(ConfirmedCases with sum as TotalConfirmed,RecoveredCases with sum as TotalRecovered,DeathCases with sum as TotalDeaths))&$orderby=RecordedDate desc&$top=1"
//   );
// };

// // Get all regions
// export const getAllRegions = async () => {
//   return await apiCall(
//     "/cases?$select=Region/Name,Region/Id&$expand=Region&$apply=groupby((Region/Name,Region/Id))"
//   );
// };

// Transform backend data to frontend format
export const transformCasesToCovidData = (cases) => {
  if (!cases || !cases.value || !Array.isArray(cases.value)) {
    console.error("Invalid cases data structure:", cases);
    return [];
  }

  console.log("transformCasesToCovidData input:", {
    totalCases: cases.value.length,
    sampleCase: cases.value[0],
  });

  // Group cases by region and get the latest data for each region
  const regionMap = new Map();

  cases.value.forEach((caseItem) => {
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

  // Transform to frontend format
  const transformedData = Array.from(regionMap.values()).map((caseItem) => {
    const region = caseItem.Region;
    const confirmed = caseItem.ConfirmedCases || 0;
    const recovered = caseItem.RecoveredCases || 0;
    const deaths = caseItem.DeathCases || 0;
    const active = Math.max(0, confirmed - recovered - deaths);

    // Enhanced country info mapping for better coverage
    const countryMapping = {
      US: { iso2: "US", iso3: "USA" },
      "United States": { iso2: "US", iso3: "USA" },
      India: { iso2: "IN", iso3: "IND" },
      Brazil: { iso2: "BR", iso3: "BRA" },
      "United Kingdom": { iso2: "GB", iso3: "GBR" },
      UK: { iso2: "GB", iso3: "GBR" },
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
      Canada: { iso2: "CA", iso3: "CAN" },
      Australia: { iso2: "AU", iso3: "AUS" },
      Japan: { iso2: "JP", iso3: "JPN" },
      "South Korea": { iso2: "KR", iso3: "KOR" },
      China: { iso2: "CN", iso3: "CHN" },
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

  console.log("transformCasesToCovidData output:", {
    totalTransformed: transformedData.length,
    sampleCountries: transformedData.slice(0, 5).map((c) => ({
      country: c.country,
      confirmed: c.confirmed,
      active: c.active,
    })),
  });

  // Calculate percentages
  const totalConfirmed = transformedData.reduce(
    (sum, item) => sum + item.confirmed,
    0,
  );
  transformedData.forEach((item) => {
    item.percent =
      totalConfirmed > 0
        ? Math.round((item.confirmed / totalConfirmed) * 100)
        : 0;
  });

  return transformedData;
};

// Get daily increase data for a specific country
export const getDailyIncreaseByCountry = async (countryName, days = 7) => {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const cases = await apiCall(
    `/cases?$filter=Region/Name eq '${countryName}' and RecordedDate ge ${startDate} and RecordedDate le ${endDate}&$expand=Region&$orderby=RecordedDate asc`,
  );

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
