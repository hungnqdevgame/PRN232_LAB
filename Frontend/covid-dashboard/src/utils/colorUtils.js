// Generates a color map for countries in the treemap
// Each country will get its own consistent color based on its name
export const getCountryColorMap = () => {
  // Define specific colors for major countries to match the reference image
  const specificColors = {
    US: "#4A90E2", // Vibrant blue
    India: "#E74C3C", // Strong red
    Brazil: "#27AE60", // Fresh green
    "United Kingdom": "#9B59B6", // Rich purple
    Russia: "#F39C12", // Warm orange
    France: "#E91E63", // Bright pink
    Germany: "#1ABC9C", // Modern teal
    Italy: "#F1C40F", // Golden yellow
    Spain: "#FF6B35", // Coral orange
    Turkey: "#3498DB", // Sky blue
    Poland: "#E67E22", // Burnt orange
    Iran: "#8E44AD", // Deep purple
    Mexico: "#C0392B", // Deep red
    Ukraine: "#95A5A6", // Cool grey
    "South Africa": "#2ECC71", // Emerald green
    Indonesia: "#6C5CE7", // Soft purple
    Netherlands: "#A0522D", // Sienna brown
    Philippines: "#0984E3", // Ocean blue
    Malaysia: "#00B894", // Mint green
    Chile: "#FDCB6E", // Soft yellow
    Argentina: "#74B9FF", // Light blue
    Colombia: "#55A3FF", // Medium blue
    Canada: "#FD79A8", // Rose pink
    Peru: "#FDCB6E", // Light orange
    Belgium: "#A29BFE", // Lavender
    "Czech Republic": "#6C5CE7", // Purple blue
    Portugal: "#00B894", // Turquoise
    Israel: "#FFEAA7", // Cream yellow
    Japan: "#FF7675", // Salmon pink
    Bangladesh: "#81ECEC", // Light cyan
    Pakistan: "#00CEC9", // Teal
    Romania: "#A29BFE", // Light purple
    Iraq: "#FDCB6E", // Sandy yellow
  };

  return specificColors;
};

// Enhanced color generation for better visual variety
export const getTreemapColor = (countryName) => {
  const colorMap = getCountryColorMap();

  // If country has a specific color assigned, use it
  if (colorMap[countryName]) {
    return colorMap[countryName];
  }

  // Enhanced color palette for auto-generated colors
  const colorPalettes = [
    ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
    ["#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#E17055"],
    ["#00B894", "#00CEC9", "#0984E3", "#6C5CE7", "#A29BFE"],
    ["#E84393", "#F0932B", "#EB4D4B", "#6AB04C", "#30336B"],
    ["#535C68", "#95AFC0", "#40739E", "#487EB0", "#8C7AE6"],
  ];

  // Generate a consistent hash for the country name
  let hash = 0;
  for (let i = 0; i < countryName.length; i++) {
    hash = countryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Select palette and color based on hash
  const paletteIndex = Math.abs(hash) % colorPalettes.length;
  const colorIndex = Math.abs(hash >> 8) % colorPalettes[paletteIndex].length;

  return colorPalettes[paletteIndex][colorIndex];
};
