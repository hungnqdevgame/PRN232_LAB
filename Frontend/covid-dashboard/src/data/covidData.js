export const covidData = [
  {
    country: "US",
    countryInfo: {
      iso2: "US",
      iso3: "USA",
    },
    confirmed: 52380854,
    active: 10000000,
    recovered: 41000000,
    deaths: 1380854,
    dailyIncrease: 150000,
    percent: 19,
  },
  {
    country: "India",
    countryInfo: {
      iso2: "IN",
      iso3: "IND",
    },
    confirmed: 34751332,
    active: 5000000,
    recovered: 29000000,
    deaths: 751332,
    dailyIncrease: 95000,
    percent: 12,
  },
  {
    country: "Brazil",
    countryInfo: {
      iso2: "BR",
      iso3: "BRA",
    },
    confirmed: 22451205,
    active: 3000000,
    recovered: 18900000,
    deaths: 551205,
    dailyIncrease: 65000,
    percent: 8,
  },
  {
    country: "United Kingdom",
    countryInfo: {
      iso2: "GB",
      iso3: "GBR",
    },
    confirmed: 11958528,
    active: 2000000,
    recovered: 9500000,
    deaths: 458528,
    dailyIncrease: 45000,
    percent: 4,
  },
  {
    country: "Russia",
    countryInfo: {
      iso2: "RU",
      iso3: "RUS",
    },
    confirmed: 10213265,
    active: 1500000,
    recovered: 8400000,
    deaths: 313265,
    dailyIncrease: 35000,
    percent: 4,
  },
  {
    country: "France",
    countryInfo: {
      iso2: "FR",
      iso3: "FRA",
    },
    confirmed: 8220540,
    active: 1200000,
    recovered: 6800000,
    deaths: 220540,
    dailyIncrease: 30000,
    percent: 3,
  },
  {
    country: "Turkey",
    countryInfo: {
      iso2: "TR",
      iso3: "TUR",
    },
    confirmed: 9306094,
    active: 1300000,
    recovered: 7800000,
    deaths: 206094,
    dailyIncrease: 28000,
    percent: 3,
  },
  {
    country: "Spain",
    countryInfo: {
      iso2: "ES",
      iso3: "ESP",
    },
    confirmed: 5718007,
    active: 900000,
    recovered: 4650000,
    deaths: 168007,
    dailyIncrease: 22000,
    percent: 2,
  },
  {
    country: "Italy",
    countryInfo: {
      iso2: "IT",
      iso3: "ITA",
    },
    confirmed: 5647313,
    active: 880000,
    recovered: 4600000,
    deaths: 167313,
    dailyIncrease: 21000,
    percent: 2,
  },
  {
    country: "Germany",
    countryInfo: {
      iso2: "DE",
      iso3: "DEU",
    },
    confirmed: 7009048,
    active: 1100000,
    recovered: 5750000,
    deaths: 159048,
    dailyIncrease: 25000,
    percent: 3,
  },
  {
    country: "Argentina",
    countryInfo: {
      iso2: "AR",
      iso3: "ARG",
    },
    confirmed: 5460042,
    active: 850000,
    recovered: 4450000,
    deaths: 160042,
    dailyIncrease: 20000,
    percent: 2,
  },
  {
    country: "Poland",
    countryInfo: {
      iso2: "PL",
      iso3: "POL",
    },
    confirmed: 4049838,
    active: 600000,
    recovered: 3300000,
    deaths: 149838,
    dailyIncrease: 18000,
    percent: 1,
  },
  {
    country: "Iran",
    countryInfo: {
      iso2: "IR",
      iso3: "IRN",
    },
    confirmed: 6184762,
    active: 900000,
    recovered: 5100000,
    deaths: 184762,
    dailyIncrease: 22000,
    percent: 2,
  },
  {
    country: "Mexico",
    countryInfo: {
      iso2: "MX",
      iso3: "MEX",
    },
    confirmed: 3950200,
    active: 580000,
    recovered: 3200000,
    deaths: 170200,
    dailyIncrease: 17000,
    percent: 1,
  },
  {
    country: "Ukraine",
    countryInfo: {
      iso2: "UA",
      iso3: "UKR",
    },
    confirmed: 3823879,
    active: 550000,
    recovered: 3100000,
    deaths: 173879,
    dailyIncrease: 16000,
    percent: 1,
  },
  {
    country: "South Africa",
    countryInfo: {
      iso2: "ZA",
      iso3: "ZAF",
    },
    confirmed: 3413540,
    active: 480000,
    recovered: 2800000,
    deaths: 133540,
    dailyIncrease: 14000,
    percent: 1,
  },
  {
    country: "Philippines",
    countryInfo: {
      iso2: "PH",
      iso3: "PHL",
    },
    confirmed: 2818240,
    active: 400000,
    recovered: 2300000,
    deaths: 118240,
    dailyIncrease: 12000,
    percent: 1,
  },
  {
    country: "Malaysia",
    countryInfo: {
      iso2: "MY",
      iso3: "MYS",
    },
    confirmed: 2741176,
    active: 380000,
    recovered: 2250000,
    deaths: 111176,
    dailyIncrease: 11000,
    percent: 1,
  },
  {
    country: "Netherlands",
    countryInfo: {
      iso2: "NL",
      iso3: "NLD",
    },
    confirmed: 2196784,
    active: 320000,
    recovered: 1800000,
    deaths: 76784,
    dailyIncrease: 9000,
    percent: 1,
  },
  {
    country: "Indonesia",
    countryInfo: {
      iso2: "ID",
      iso3: "IDN",
    },
    confirmed: 4281467,
    active: 600000,
    recovered: 3500000,
    deaths: 181467,
    dailyIncrease: 18000,
    percent: 2,
  },
  {
    country: "Chile",
    countryInfo: {
      iso2: "CL",
      iso3: "CHL",
    },
    confirmed: 1804251,
    active: 250000,
    recovered: 1500000,
    deaths: 54251,
    dailyIncrease: 8000,
    percent: 1,
  },
];

// Import functions from colorUtils.js in the getTreemapData function to avoid import issues
// Generate the treemap format data
export const getTreemapData = (dataType) => {
  if (!dataType || !covidData || !Array.isArray(covidData)) {
    return [];
  }
  
  // Dynamically import the color utils
  let getTreemapColor;
  try {
    getTreemapColor = require('../utils/colorUtils').getTreemapColor;
  } catch (e) {
    // Fallback in case of import error
    getTreemapColor = (country) => {
      const colors = {
        'US': '#0047AB',
        'India': '#FF5733',
        'Brazil': '#00A36C',
        'default': '#3498DB'
      };
      return colors[country] || colors.default;
    };
  }
  
  return covidData
    .filter(country => country && typeof country === 'object')
    .map((country) => {
      const countryName = country.country || 'Unknown';
      return {
        name: countryName,
        size: country[dataType] || 0,
        percentage: country.percent || 0,
        color: getTreemapColor(countryName), // Use treemap-specific colors
        fill: getTreemapColor(countryName),  // Adding fill for recharts
      };
    });
};

// Generate color based on percentage with shades of blue (for world map)
export const getColorByPercentage = (percent) => {
  if (percent >= 15) return "#00205B"; // Darkest blue for very high values (US - 19%)
  if (percent >= 10) return "#00297A"; // Very dark blue for high values (India - 12%)
  if (percent >= 8) return "#003399";  // Dark blue for medium-high values (Brazil - 8%)
  if (percent >= 5) return "#0047AB";  // Medium-dark blue for medium-high values (5-8%)
  if (percent >= 3) return "#0066CC";  // Medium blue for medium values (3-5%)
  if (percent >= 2) return "#4D94FF";  // Light blue for lower-medium values (2-3%)
  if (percent >= 1) return "#99C2FF";  // Very light blue for low values (1-2%)
  return "#E6F7FF";  // Lightest blue for very low or no values (<1%)
};

// Get a country's color for the map based on dataType
export const getCountryColor = (countryCode, dataType) => {
  // Hard-coded map for major countries to ensure proper coloring
  const directMapping = {
    'USA': 'US',  // United States
    'USA': 'US', 
    'GBR': 'United Kingdom',  // United Kingdom
    'IND': 'India',  // India
    'BRA': 'Brazil',  // Brazil
    'RUS': 'Russia',  // Russia
    'FRA': 'France',  // France
    'DEU': 'Germany',  // Germany
    'ITA': 'Italy',  // Italy
    'ESP': 'Spain',  // Spain
    'TUR': 'Turkey',  // Turkey
    'MEX': 'Mexico'   // Mexico
  };
  
  // Attempt direct mapping first
  let countryName = directMapping[countryCode];
  if (countryName) {
    const countryObj = covidData.find(c => c.country === countryName);
    if (countryObj) {
      console.log(`Direct match: ${countryCode} -> ${countryName}, percent: ${countryObj.percent}`);
      return getColorByPercentage(countryObj.percent);
    }
  }
  
  // Next try matching by ISO code
  let country = covidData.find(c => 
    c.countryInfo && 
    (c.countryInfo.iso3 === countryCode || c.countryInfo.iso2 === countryCode)
  );
  
  // If no match by ISO code, try matching by name
  if (!country && countryCode) {
    // Create a normalized version of the country code for name matching
    const normalizedCode = countryCode.toLowerCase();
    
    // Country code to name mapping for common countries
    const codeNameMap = {
      'usa': 'US',
      'gbr': 'United Kingdom',
      'ind': 'India',
      'bra': 'Brazil',
      'rus': 'Russia',
      'fra': 'France',
      'deu': 'Germany',
      'ita': 'Italy',
      'esp': 'Spain',
      'tur': 'Turkey',
      'mex': 'Mexico'
    };
    
    const possibleName = codeNameMap[normalizedCode];
    if (possibleName) {
      country = covidData.find(c => c.country === possibleName);
    }
  }

  // Apply fixed colors for specific countries for testing
  if (countryCode === "USA" || countryCode === "US" || countryCode === "840") {
    return "#00205B"; // Dark blue for US
  } else if (countryCode === "IND" || countryCode === "IN" || countryCode === "356") {
    return "#00297A"; // For India
  } else if (countryCode === "BRA" || countryCode === "BR" || countryCode === "076") {
    return "#003399"; // For Brazil
  }
  
  if (!country) {
    console.log(`No match for country code: ${countryCode}`);
    return "#F5F5F5"; // Default light gray for countries with no data
  }
  
  console.log(`Found match for ${countryCode}: ${country.country}, percent: ${country.percent}`);
  // Make sure the color is based on percentage data
  return getColorByPercentage(country.percent);
};

// Format large numbers with commas
export const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get total counts for each data type
export const getTotals = () => {
  return covidData.reduce((totals, country) => {
    totals.confirmed += country.confirmed;
    totals.active += country.active;
    totals.recovered += country.recovered;
    totals.deaths += country.deaths;
    totals.dailyIncrease += country.dailyIncrease;
    return totals;
  }, {
    confirmed: 0,
    active: 0,
    recovered: 0,
    deaths: 0,
    dailyIncrease: 0
  });
};