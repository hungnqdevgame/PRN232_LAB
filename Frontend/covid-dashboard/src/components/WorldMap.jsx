import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { getCovidData } from "../data/covidData";

// Simple GeoJSON URL that definitely works
const geoUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const WorldMap = ({ dataType = "confirmed", covidData = null }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add loading state and error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Wait 3 seconds for map to load

    return () => clearTimeout(timer);
  }, []);

  // Simple color mapping function
  const getCountryColor = (countryId) => {
    // Use provided data or fallback to cached/static data
    const currentData = covidData || getCovidData();
    const country = currentData.find((c) => c.countryInfo.iso3 === countryId);

    // Log for debugging color selection
    if (["USA", "IND", "BRA", "RUS", "GBR", "FRA", "DEU"].includes(countryId)) {
      console.log(
        `Color lookup for ${countryId}:`,
        country ? `Found - ${country.percent}%` : "Not found"
      );
    }

    if (!country) return "#F5F5F5"; // Default light gray for no data

    const value = country.percent;
    if (value >= 15) return "#00205B"; // Critical (15%+)
    if (value >= 10) return "#00297A"; // Very High (10-15%)
    if (value >= 8) return "#003399"; // High (8-10%)
    if (value >= 5) return "#0047AB"; // Medium-High (5-8%)
    if (value >= 3) return "#0066CC"; // Medium (3-5%)
    if (value >= 2) return "#4D94FF"; // Low-Medium (2-3%)
    if (value >= 1) return "#99C2FF"; // Low (1-2%)
    return "#E6F7FF"; // Very low (<1%)
  };

  const handleMouseEnter = (geo, e) => {
    // Use provided data or fallback to cached/static data
    const currentData = covidData || getCovidData();

    // Try different property names for country ID and name
    const countryId =
      geo.properties?.ISO_A3 ||
      geo.properties?.iso_a3 ||
      geo.properties?.ADM0_A3 ||
      geo.properties?.id ||
      "";
    const countryName =
      geo.properties?.NAME ||
      geo.properties?.name ||
      geo.properties?.ADMIN ||
      geo.properties?.admin ||
      "Unknown";

    // Log all possible properties for debugging
    console.log(`Mouse enter - Country: ${countryName}, ID: ${countryId}`);
    console.log(`Geo Properties:`, geo.properties);

    // Try to find country data with exact ISO3 match
    const countryData = currentData.find(
      (c) => c.countryInfo.iso3 === countryId
    );

    // Log what we found or didn't find
    console.log(`Found data for ${countryName}:`, countryData ? "Yes" : "No");

    // Also try alternate ways of finding the country
    const altCountryData = currentData.find(
      (c) =>
        c.country === countryName ||
        c.countryInfo.iso2 === countryId.substring(0, 2)
    );

    if (!countryData && altCountryData) {
      console.log(
        `Found alternate data match for ${countryName}:`,
        altCountryData
      );
    }

    // Use the best data we have
    const bestData = countryData || altCountryData;

    let tooltipText = countryName;

    if (bestData) {
      console.log("Using data for tooltip:", bestData);

      // Chỉ hiển thị tên quốc gia và % - không có "COVID %"
      tooltipText = bestData.country || countryName;
      tooltipText += "\n" + bestData.percent + "%";

      // Chỉ giữ lại active, recovered, deaths - bỏ confirmed và daily increase
      if (dataType === "active") {
        tooltipText += "\nActive: " + bestData.active.toLocaleString();
      } else if (dataType === "recovered") {
        tooltipText += "\nRecovered: " + bestData.recovered.toLocaleString();
      } else if (dataType === "deaths") {
        tooltipText += "\nDeaths: " + bestData.deaths.toLocaleString();
      }
    } else {
      tooltipText += "\nNo data available";
      console.log(`No data found for ${countryName} (${countryId})`);
    }

    // Log to console for debugging
    console.log("Final tooltip text:", tooltipText);

    setTooltipContent(tooltipText);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    console.log("Mouse leaving, hiding tooltip");
    setShowTooltip(false);
  };

  return (
    <div
      className="world-map-container"
      style={{
        userSelect: "none",
        touchAction: "none",
        position: "relative",
        overflow: "hidden",
      }}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.8)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          Loading map...
        </div>
      )}

      <ComposableMap
        projection="geoEqualEarth"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F8FBFF",
        }}
        projectionConfig={{
          scale: 160,
          center: [0, 0],
        }}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={(e) => e.preventDefault()}
      >
        <Geographies geography={geoUrl}>
          {({ geographies, error }) => {
            if (error) {
              console.error("Error loading geographies:", error);
              return (
                <text x="50%" y="50%" textAnchor="middle" fill="#888">
                  Error loading map data
                </text>
              );
            }

            if (!geographies || geographies.length === 0) {
              return (
                <text x="50%" y="50%" textAnchor="middle" fill="#888">
                  Loading map data...
                </text>
              );
            }

            console.log("Loaded geographies count:", geographies.length);

            return geographies.map((geo) => {
              if (!geo || !geo.properties) {
                console.warn("Invalid geography object:", geo);
                return null;
              }

              const countryId =
                geo.properties.ISO_A3 || geo.properties.iso_a3 || geo.id || "";
              const countryName =
                geo.properties.NAME || geo.properties.name || "Unknown";

              // Log all properties for debugging
              if (
                ["USA", "IND", "BRA", "RUS", "GBR", "FRA", "DEU"].includes(
                  countryId
                )
              ) {
                console.log(
                  `Country Properties for ${countryName}:`,
                  geo.properties
                );
              }

              const fillColor = getCountryColor(countryId);

              // Debug logging for key countries
              if (
                ["USA", "IND", "BRA", "RUS", "GBR", "FRA", "DEU"].includes(
                  countryId
                )
              ) {
                console.log(
                  `Rendering ${countryName} (${countryId}) with color ${fillColor}`
                );
                console.log(
                  `Country data:`,
                  covidData.find((c) => c.countryInfo.iso3 === countryId)
                );
              }

              return (
                <Geography
                  key={geo.rsmKey || `geo-${countryId}-${Math.random()}`}
                  geography={geo}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "CLICKED:",
                      countryName,
                      countryId,
                      covidData.find((c) => c.countryInfo.iso3 === countryId)
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const countryData = covidData.find(
                      (c) => c.countryInfo.iso3 === countryId
                    );
                    console.log("Direct country data in event:", countryData);
                    handleMouseEnter(geo, e);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMouseLeave();
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent mouse dragging
                  onMouseMove={(e) => e.preventDefault()} // Prevent mouse dragging
                  style={{
                    default: {
                      fill: fillColor,
                      outline: "none",
                    },
                    hover: {
                      fill: fillColor,
                      stroke: "#666",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: fillColor,
                      outline: "none",
                    },
                  }}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {showTooltip && tooltipContent && (
        <div
          className="map-tooltip"
          style={{
            position: "fixed",
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15,
            background: "rgba(255, 255, 255, 0.9)",
            color: "#333",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            pointerEvents: "none",
            zIndex: 99999,
            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
            minWidth: "150px",
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(2px)",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
