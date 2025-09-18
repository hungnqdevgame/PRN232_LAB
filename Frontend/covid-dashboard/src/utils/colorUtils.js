// Generates a color map for countries in the treemap
// Each country will get its own consistent color based on its name
export const getCountryColorMap = () => {
  // Define specific colors for major countries to match the reference image
  const specificColors = {
    'US': '#0047AB',            // Cobalt blue
    'India': '#FF5733',         // Red/orange
    'Brazil': '#00A36C',        // Green
    'United Kingdom': '#A569BD', // Purple
    'Russia': '#FF9933',        // Orange
    'France': '#FF3366',        // Pink
    'Germany': '#73C6B6',       // Teal
    'Italy': '#F7DC6F',         // Yellow
    'Spain': '#F39C12',         // Amber
    'Turkey': '#3498DB',        // Sky blue
    'Poland': '#E74C3C',        // Red
    'Iran': '#BF40BF',          // Purple
    'Mexico': '#C0392B',        // Dark red
    'Ukraine': '#AAB7B8',       // Grey blue
    'South Africa': '#2ECC71',  // Emerald
    'Indonesia': '#8E44AD',     // Violet
    'Netherlands': '#D35400',   // Orange brown
    'Philippines': '#2980B9',   // Blue
    'Malaysia': '#1ABC9C',      // Turquoise
    'Chile': '#E67E22'          // Orange
  };
  
  return specificColors;
};

// Get a color for treemap based on country name
export const getTreemapColor = (countryName) => {
  const colorMap = getCountryColorMap();
  
  // If country has a specific color assigned, use it
  if (colorMap[countryName]) {
    return colorMap[countryName];
  }
  
  // Otherwise generate a consistent color based on the country name
  let hash = 0;
  for (let i = 0; i < countryName.length; i++) {
    hash = countryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hexadecimal format and ensure good contrast
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    // Ensure the color is not too light
    const adjustedValue = Math.max(value, 100); 
    color += ('00' + adjustedValue.toString(16)).substr(-2);
  }
  
  return color;
};