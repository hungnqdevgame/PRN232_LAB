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

// Get latest cases for all regions (assuming we want the most recent date)
export const getLatestCasesByRegion = async () => {
  return await apiCall("/Cases?$expand=Region&$orderby=RecordedDate desc");
};

// // Get cases for a specific country by region name
// export const getCasesByCountry = async (countryName) => {
//   return await apiCall(
//     `/Cases?$filter=Region/Name eq '${countryName}'&$expand=Region&$orderby=RecordedDate desc`
//   );
// };

// // Get cases for a specific date
export const getCasesByDate = async (date) => {
  return await apiCall(`/Cases?$filter=RecordedDate eq ${date}&$expand=Region`);
};

export async function getDates() {
  return await apiCall(
    "/Cases?$apply=groupby((RecordedDate))&$orderby=RecordedDate asc",
  );
}

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
      Afghanistan: { iso2: "AF", iso3: "AFG" },
      Albania: { iso2: "AL", iso3: "ALB" },
      Algeria: { iso2: "DZ", iso3: "DZA" },
      Andorra: { iso2: "AD", iso3: "AND" },
      Angola: { iso2: "AO", iso3: "AGO" },
      Antarctica: { iso2: "AQ", iso3: "ATA" },
      "Antigua and Barbuda": { iso2: "AG", iso3: "ATG" },
      Argentina: { iso2: "AR", iso3: "ARG" },
      Armenia: { iso2: "AM", iso3: "ARM" },
      Australia: { iso2: "AU", iso3: "AUS" },
      Austria: { iso2: "AT", iso3: "AUT" },
      Azerbaijan: { iso2: "AZ", iso3: "AZE" },
      Bahamas: { iso2: "BS", iso3: "BHS" },
      Bahrain: { iso2: "BH", iso3: "BHR" },
      Bangladesh: { iso2: "BD", iso3: "BGD" },
      Barbados: { iso2: "BB", iso3: "BRB" },
      Belarus: { iso2: "BY", iso3: "BLR" },
      Belgium: { iso2: "BE", iso3: "BEL" },
      Belize: { iso2: "BZ", iso3: "BLZ" },
      Benin: { iso2: "BJ", iso3: "BEN" },
      Bhutan: { iso2: "BT", iso3: "BTN" },
      Bolivia: { iso2: "BO", iso3: "BOL" },
      "Bosnia and Herzegovina": { iso2: "BA", iso3: "BIH" },
      Botswana: { iso2: "BW", iso3: "BWA" },
      Brazil: { iso2: "BR", iso3: "BRA" },
      Brunei: { iso2: "BN", iso3: "BRN" },
      Bulgaria: { iso2: "BG", iso3: "BGR" },
      "Burkina Faso": { iso2: "BF", iso3: "BFA" },
      Burma: { iso2: "MM", iso3: "MMR" },
      Burundi: { iso2: "BI", iso3: "BDI" },
      "Cabo Verde": { iso2: "CV", iso3: "CPV" },
      Cambodia: { iso2: "KH", iso3: "KHM" },
      Cameroon: { iso2: "CM", iso3: "CMR" },
      Canada: { iso2: "CA", iso3: "CAN" },
      "Central African Republic": { iso2: "CF", iso3: "CAF" },
      Chad: { iso2: "TD", iso3: "TCD" },
      Chile: { iso2: "CL", iso3: "CHL" },
      China: { iso2: "CN", iso3: "CHN" },
      Colombia: { iso2: "CO", iso3: "COL" },
      Comoros: { iso2: "KM", iso3: "COM" },
      Congo: { iso2: "CG", iso3: "COG" },
      "Costa Rica": { iso2: "CR", iso3: "CRI" },
      "Cote d'Ivoire": { iso2: "CI", iso3: "CIV" },
      Croatia: { iso2: "HR", iso3: "HRV" },
      Cuba: { iso2: "CU", iso3: "CUB" },
      Cyprus: { iso2: "CY", iso3: "CYP" },
      Czechia: { iso2: "CZ", iso3: "CZE" },
      Djibouti: { iso2: "DJ", iso3: "DJI" },
      Dominica: { iso2: "DM", iso3: "DMA" },
      "Dominican Republic": { iso2: "DO", iso3: "DOM" },
      Ecuador: { iso2: "EC", iso3: "ECU" },
      Egypt: { iso2: "EG", iso3: "EGY" },
      "El Salvador": { iso2: "SV", iso3: "SLV" },
      "Equatorial Guinea": { iso2: "GQ", iso3: "GNQ" },
      Eritrea: { iso2: "ER", iso3: "ERI" },
      Estonia: { iso2: "EE", iso3: "EST" },
      Eswatini: { iso2: "SZ", iso3: "SWZ" },
      Ethiopia: { iso2: "ET", iso3: "ETH" },
      Fiji: { iso2: "FJ", iso3: "FJI" },
      Finland: { iso2: "FI", iso3: "FIN" },
      France: { iso2: "FR", iso3: "FRA" },
      Gabon: { iso2: "GA", iso3: "GAB" },
      Gambia: { iso2: "GM", iso3: "GMB" },
      Georgia: { iso2: "GE", iso3: "GEO" },
      Germany: { iso2: "DE", iso3: "DEU" },
      Ghana: { iso2: "GH", iso3: "GHA" },
      Greece: { iso2: "GR", iso3: "GRC" },
      Grenada: { iso2: "GD", iso3: "GRD" },
      Guatemala: { iso2: "GT", iso3: "GTM" },
      Guinea: { iso2: "GN", iso3: "GIN" },
      "Guinea-Bissau": { iso2: "GW", iso3: "GNB" },
      Guyana: { iso2: "GY", iso3: "GUY" },
      Haiti: { iso2: "HT", iso3: "HTI" },
      "Holy See": { iso2: "VA", iso3: "VAT" },
      Honduras: { iso2: "HN", iso3: "HND" },
      Hungary: { iso2: "HU", iso3: "HUN" },
      Iceland: { iso2: "IS", iso3: "ISL" },
      India: { iso2: "IN", iso3: "IND" },
      Indonesia: { iso2: "ID", iso3: "IDN" },
      Iran: { iso2: "IR", iso3: "IRN" },
      Iraq: { iso2: "IQ", iso3: "IRQ" },
      Ireland: { iso2: "IE", iso3: "IRL" },
      Israel: { iso2: "IL", iso3: "ISR" },
      Italy: { iso2: "IT", iso3: "ITA" },
      Jamaica: { iso2: "JM", iso3: "JAM" },
      Japan: { iso2: "JP", iso3: "JPN" },
      Jordan: { iso2: "JO", iso3: "JOR" },
      Kazakhstan: { iso2: "KZ", iso3: "KAZ" },
      Kenya: { iso2: "KE", iso3: "KEN" },
      Kiribati: { iso2: "KI", iso3: "KIR" },
      "North Korea": { iso2: "KP", iso3: "PRK" },
      "South Korea": { iso2: "KR", iso3: "KOR" },
      Kosovo: { iso2: "XK", iso3: "XKX" }, // unofficial
      Kuwait: { iso2: "KW", iso3: "KWT" },
      Kyrgyzstan: { iso2: "KG", iso3: "KGZ" },
      Laos: { iso2: "LA", iso3: "LAO" },
      Latvia: { iso2: "LV", iso3: "LVA" },
      Lebanon: { iso2: "LB", iso3: "LBN" },
      Lesotho: { iso2: "LS", iso3: "LSO" },
      Liberia: { iso2: "LR", iso3: "LBR" },
      Libya: { iso2: "LY", iso3: "LBY" },
      Liechtenstein: { iso2: "LI", iso3: "LIE" },
      Lithuania: { iso2: "LT", iso3: "LTU" },
      Luxembourg: { iso2: "LU", iso3: "LUX" },
      Madagascar: { iso2: "MG", iso3: "MDG" },
      Malawi: { iso2: "MW", iso3: "MWI" },
      Malaysia: { iso2: "MY", iso3: "MYS" },
      Maldives: { iso2: "MV", iso3: "MDV" },
      Mali: { iso2: "ML", iso3: "MLI" },
      Malta: { iso2: "MT", iso3: "MLT" },
      "Marshall Islands": { iso2: "MH", iso3: "MHL" },
      Mauritania: { iso2: "MR", iso3: "MRT" },
      Mauritius: { iso2: "MU", iso3: "MUS" },
      Mexico: { iso2: "MX", iso3: "MEX" },
      Micronesia: { iso2: "FM", iso3: "FSM" },
      Moldova: { iso2: "MD", iso3: "MDA" },
      Monaco: { iso2: "MC", iso3: "MCO" },
      Mongolia: { iso2: "MN", iso3: "MNG" },
      Montenegro: { iso2: "ME", iso3: "MNE" },
      Morocco: { iso2: "MA", iso3: "MAR" },
      Mozambique: { iso2: "MZ", iso3: "MOZ" },
      Namibia: { iso2: "NA", iso3: "NAM" },
      Nauru: { iso2: "NR", iso3: "NRU" },
      Nepal: { iso2: "NP", iso3: "NPL" },
      Netherlands: { iso2: "NL", iso3: "NLD" },
      "New Zealand": { iso2: "NZ", iso3: "NZL" },
      Nicaragua: { iso2: "NI", iso3: "NIC" },
      Niger: { iso2: "NE", iso3: "NER" },
      Nigeria: { iso2: "NG", iso3: "NGA" },
      "North Macedonia": { iso2: "MK", iso3: "MKD" },
      Norway: { iso2: "NO", iso3: "NOR" },
      Oman: { iso2: "OM", iso3: "OMN" },
      Pakistan: { iso2: "PK", iso3: "PAK" },
      Palau: { iso2: "PW", iso3: "PLW" },
      Panama: { iso2: "PA", iso3: "PAN" },
      "Papua New Guinea": { iso2: "PG", iso3: "PNG" },
      Paraguay: { iso2: "PY", iso3: "PRY" },
      Peru: { iso2: "PE", iso3: "PER" },
      Philippines: { iso2: "PH", iso3: "PHL" },
      Poland: { iso2: "PL", iso3: "POL" },
      Portugal: { iso2: "PT", iso3: "PRT" },
      Qatar: { iso2: "QA", iso3: "QAT" },
      Romania: { iso2: "RO", iso3: "ROU" },
      Russia: { iso2: "RU", iso3: "RUS" },
      Rwanda: { iso2: "RW", iso3: "RWA" },
      "Saint Kitts and Nevis": { iso2: "KN", iso3: "KNA" },
      "Saint Lucia": { iso2: "LC", iso3: "LCA" },
      "Saint Vincent and the Grenadines": { iso2: "VC", iso3: "VCT" },
      Samoa: { iso2: "WS", iso3: "WSM" },
      "San Marino": { iso2: "SM", iso3: "SMR" },
      "Sao Tome and Principe": { iso2: "ST", iso3: "STP" },
      "Saudi Arabia": { iso2: "SA", iso3: "SAU" },
      Senegal: { iso2: "SN", iso3: "SEN" },
      Serbia: { iso2: "RS", iso3: "SRB" },
      Seychelles: { iso2: "SC", iso3: "SYC" },
      "Sierra Leone": { iso2: "SL", iso3: "SLE" },
      Singapore: { iso2: "SG", iso3: "SGP" },
      Slovakia: { iso2: "SK", iso3: "SVK" },
      Slovenia: { iso2: "SI", iso3: "SVN" },
      "Solomon Islands": { iso2: "SB", iso3: "SLB" },
      Somalia: { iso2: "SO", iso3: "SOM" },
      "South Africa": { iso2: "ZA", iso3: "ZAF" },
      "South Sudan": { iso2: "SS", iso3: "SDS" },
      Spain: { iso2: "ES", iso3: "ESP" },
      "Sri Lanka": { iso2: "LK", iso3: "LKA" },
      Sudan: { iso2: "SD", iso3: "SDN" },
      Suriname: { iso2: "SR", iso3: "SUR" },
      Sweden: { iso2: "SE", iso3: "SWE" },
      Switzerland: { iso2: "CH", iso3: "CHE" },
      Syria: { iso2: "SY", iso3: "SYR" },
      Taiwan: { iso2: "TW", iso3: "TWN" },
      Tajikistan: { iso2: "TJ", iso3: "TJK" },
      Tanzania: { iso2: "TZ", iso3: "TZA" },
      Thailand: { iso2: "TH", iso3: "THA" },
      "Timor-Leste": { iso2: "TL", iso3: "TLS" },
      Togo: { iso2: "TG", iso3: "TGO" },
      Tonga: { iso2: "TO", iso3: "TON" },
      "Trinidad and Tobago": { iso2: "TT", iso3: "TTO" },
      Tunisia: { iso2: "TN", iso3: "TUN" },
      Turkey: { iso2: "TR", iso3: "TUR" },
      Tuvalu: { iso2: "TV", iso3: "TUV" },
      US: { iso2: "US", iso3: "USA" },
      Uganda: { iso2: "UG", iso3: "UGA" },
      Ukraine: { iso2: "UA", iso3: "UKR" },
      "United Arab Emirates": { iso2: "AE", iso3: "ARE" },
      "United Kingdom": { iso2: "GB", iso3: "GBR" },
      Uruguay: { iso2: "UY", iso3: "URY" },
      Uzbekistan: { iso2: "UZ", iso3: "UZB" },
      Vanuatu: { iso2: "VU", iso3: "VUT" },
      Venezuela: { iso2: "VE", iso3: "VEN" },
      Vietnam: { iso2: "VN", iso3: "VNM" },
      Yemen: { iso2: "YE", iso3: "YEM" },
      Zambia: { iso2: "ZM", iso3: "ZMB" },
      Zimbabwe: { iso2: "ZW", iso3: "ZWE" },
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
