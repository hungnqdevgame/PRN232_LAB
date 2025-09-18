import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { getCovidData, getColorByPercentage } from "../data/covidData";

// Simple GeoJSON URL that definitely works
const geoUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const WorldMap = ({ dataType = "confirmed", covidData = null }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Use provided data or get from cache (API only)
  const currentData =
    covidData && covidData.length > 0 ? covidData : getCovidData();

  // Log data usage for debugging
  useEffect(() => {
    console.log("WorldMap data source:", {
      providedData: covidData ? covidData.length : 0,
      currentData: currentData.length,
      dataType,
    });
  }, [covidData, currentData, dataType]);

  // Add loading state and error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Wait 3 seconds for map to load

    return () => clearTimeout(timer);
  }, []);

  // Enhanced color mapping function using API data
  const getCountryColor = (countryId) => {
    if (!currentData || currentData.length === 0) {
      return "#F5F5F5"; // Default light gray when no data
    }

    // Enhanced country lookup with multiple fallback strategies
    let country = null;

    // Strategy 1: Direct ISO3 match
    country = currentData.find(
      (c) => c.countryInfo && c.countryInfo.iso3 === countryId
    );

    // Strategy 2: ISO2 match (first 2 chars of ISO3)
    if (!country && countryId.length >= 2) {
      const iso2 = countryId.substring(0, 2);
      country = currentData.find(
        (c) => c.countryInfo && c.countryInfo.iso2 === iso2
      );
    }

    // Strategy 3: Direct country name mapping
    if (!country) {
      const countryNameMap = {
        USA: "US",
        GBR: "United Kingdom",
        IND: "India",
        BRA: "Brazil",
        RUS: "Russia",
        FRA: "France",
        DEU: "Germany",
        ITA: "Italy",
        ESP: "Spain",
        TUR: "Turkey",
        MEX: "Mexico",
        ARG: "Argentina",
        POL: "Poland",
        IRN: "Iran",
        UKR: "Ukraine",
        ZAF: "South Africa",
        PHL: "Philippines",
        MYS: "Malaysia",
        NLD: "Netherlands",
        IDN: "Indonesia",
        CHL: "Chile",
      };

      const mappedName = countryNameMap[countryId];
      if (mappedName) {
        country = currentData.find((c) => c.country === mappedName);
      }
    }

    // Debug logging for major countries
    if (["USA", "IND", "BRA", "RUS", "GBR", "FRA", "DEU"].includes(countryId)) {
      console.log(
        `Color lookup for ${countryId}:`,
        country ? `Found - ${country.percent}%` : "Not found"
      );
    }

    if (!country) {
      return "#F5F5F5"; // Default light gray for no data
    }

    // Use the built-in color function from covidData
    return getColorByPercentage(country.percent);
  };

  const handleMouseEnter = (geo, e) => {
    // Check if we have data available
    if (!currentData || currentData.length === 0) {
      const countryName =
        geo.properties?.NAME ||
        geo.properties?.name ||
        geo.properties?.ADMIN ||
        geo.properties?.admin ||
        "Unknown";

      setTooltipContent(
        `${countryName}\nNo data available\nPlease connect to API`
      );
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setShowTooltip(true);
      return;
    }

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

    // Try to find country data with exact ISO3 match
    const countryData = currentData.find(
      (c) => c.countryInfo && c.countryInfo.iso3 === countryId
    );

    // Also try alternate ways of finding the country
    const altCountryData = currentData.find(
      (c) =>
        c.country === countryName ||
        (c.countryInfo && c.countryInfo.iso2 === countryId.substring(0, 2))
    );

    // Use the best data we have
    const bestData = countryData || altCountryData;

    let tooltipText = countryName;

    if (bestData) {
      // Display country name and percentage
      tooltipText = bestData.country || countryName;
      tooltipText += "\n" + bestData.percent + "%";

      // Add specific data type information
      if (dataType === "confirmed") {
        tooltipText += "\nConfirmed: " + bestData.confirmed.toLocaleString();
      } else if (dataType === "active") {
        tooltipText += "\nActive: " + bestData.active.toLocaleString();
      } else if (dataType === "recovered") {
        tooltipText += "\nRecovered: " + bestData.recovered.toLocaleString();
      } else if (dataType === "deaths") {
        tooltipText += "\nDeaths: " + bestData.deaths.toLocaleString();
      } else if (dataType === "dailyIncrease") {
        tooltipText +=
          "\nDaily Increase: " + bestData.dailyIncrease.toLocaleString();
      }
    } else {
      tooltipText += "\nNo data available";
    }

    setTooltipContent(tooltipText);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Show message when no data is available
  if (!currentData || currentData.length === 0) {
    return (
      <div
        className="world-map-container"
        style={{
          userSelect: "none",
          touchAction: "none",
          position: "relative",
          overflow: "hidden",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FBFF",
        }}
      >
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🌍</div>
          <p>No COVID-19 data available for world map.</p>
          <p>Please ensure the API is connected and data is loaded.</p>
        </div>
      </div>
    );
  }

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
                const countryDataForLog = currentData.find(
                  (c) => c.countryInfo && c.countryInfo.iso3 === countryId
                );
                console.log(`Country data:`, countryDataForLog);
              }

              return (
                <Geography
                  key={geo.rsmKey || `geo-${countryId}-${Math.random()}`}
                  geography={geo}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMouseEnter(geo, e);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMouseLeave();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const countryDataForLog = currentData.find(
                      (c) => c.countryInfo && c.countryInfo.iso3 === countryId
                    );
                    console.log(
                      "CLICKED:",
                      countryName,
                      countryId,
                      countryDataForLog
                    );
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
