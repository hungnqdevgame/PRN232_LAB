import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { getTreemapData, formatNumber } from "../data/covidData";
import { getTreemapColor } from "../utils/colorUtils";

const TreemapChart = ({ dataType = "confirmed", covidData = null }) => {
  const [tooltipContent, setTooltipContent] = useState(null);

  // Generate the data for the treemap based on the selected data type
  const data = getTreemapData(dataType, covidData);

  // Show message when no data is available or very limited data
  if (!data || data.length === 0) {
    return (
      <div
        className="treemap-container"
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          boxShadow:
            "0 6px 25px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
          borderRadius: "16px",
          padding: "24px",
          overflow: "hidden",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <h3
          className="chart-title"
          style={{
            margin: "0 0 20px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a1a",
            fontFamily: "'Segoe UI', 'Arial', sans-serif",
          }}
        >
          COVID-19 Global Treemap
        </h3>
        <div style={{ padding: "60px 20px", color: "#666" }}>
          <div
            style={{
              fontSize: "64px",
              marginBottom: "24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            📊
          </div>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            No Data Available
          </h4>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Unable to load treemap visualization data.
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "#888",
            }}
          >
            Please ensure the API connection is active and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // Filter out invalid data and sort by size for better visualization
  const validData = data
    .filter(
      (item) => item && item.size > 0 && item.name && item.name !== "Unknown"
    )
    .sort((a, b) => b.size - a.size); // Sort by size descending

  console.log("TreemapChart data:", {
    originalData: data.length,
    validData: validData.length,
    dataType,
    sampleEntries: validData.slice(0, 5).map((item) => ({
      name: item.name,
      size: item.size,
      percentage: item.percentage,
    })),
  });

  // Enhanced custom tooltip with beautiful styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0 && payload[0].payload) {
      const item = payload[0].payload;
      const countryColor = getTreemapColor(item.name);

      return (
        <div
          className="treemap-tooltip"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            padding: "12px 16px",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)",
            fontSize: "13px",
            color: "#333",
            fontFamily: "'Segoe UI', 'Arial', sans-serif",
            minWidth: "160px",
            borderLeft: `4px solid ${countryColor}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: countryColor,
                borderRadius: "2px",
                marginRight: "8px",
              }}
            />
            <p
              className="tooltip-country"
              style={{
                margin: "0",
                fontWeight: "700",
                fontSize: "14px",
                color: "#1a1a1a",
              }}
            >
              {item.name || "Unknown"}
            </p>
          </div>

          <div style={{ marginBottom: "6px" }}>
            <p
              className="tooltip-label"
              style={{
                margin: "0",
                fontSize: "11px",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              {dataType.toUpperCase()} CASES
            </p>
            <p
              className="tooltip-value"
              style={{
                margin: "2px 0 0 0",
                fontWeight: "600",
                fontSize: "15px",
                color: "#1a1a1a",
              }}
            >
              {formatNumber(item.size || 0)}
            </p>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "6px" }}>
            <p
              className="tooltip-percent"
              style={{
                margin: "0",
                color: "#666",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              <span style={{ fontWeight: "600", color: countryColor }}>
                {item.percentage || 0}%
              </span>{" "}
              of worldwide total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom content for the treemap cells with enhanced layout
  const CustomizedContent = (props) => {
    // Add default empty values to prevent errors when props are undefined
    const {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      name = "",
      size = 0,
      percentage = 0,
      fill = "#8884d8",
      color = "#8884d8",
    } = props || {};

    // Calculate text color for better contrast
    const getContrastColor = (bgColor) => {
      // Extract RGB from the color (assuming it is in hex format)
      const hexColor = bgColor.replace("#", "");
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);

      // Calculate relative luminance (perceived brightness)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Return white for dark backgrounds, black for light backgrounds
      // Adjusted threshold for better contrast
      return luminance > 0.45 ? "#000000" : "#FFFFFF";
    };

    // Get the fill color for this country with better error handling
    let fillColor;
    try {
      fillColor = name ? getTreemapColor(name) : color || fill;
    } catch (error) {
      console.warn("Error getting treemap color for", name, error);
      fillColor = color || fill || "#8884d8";
    }

    // Calculate text color based on background
    const textColor = getContrastColor(fillColor);

    // Enhanced responsive text sizing with more granular breakpoints
    const getResponsiveFontSizes = (width, height) => {
      const area = width * height;

      if (area > 50000) {
        // Very large cells (like US, India)
        return { name: 18, value: 16, percent: 14 };
      } else if (area > 20000) {
        // Large cells
        return { name: 16, value: 14, percent: 12 };
      } else if (area > 8000) {
        // Medium cells
        return { name: 14, value: 12, percent: 11 };
      } else if (area > 3000) {
        // Small cells
        return { name: 12, value: 11, percent: 10 };
      } else {
        // Very small cells
        return { name: 10, value: 9, percent: 8 };
      }
    };

    const fontSizes = getResponsiveFontSizes(width, height);

    // Enhanced text rendering conditions
    const shouldRenderName = width > 50 && height > 30;
    const shouldRenderValue = width > 70 && height > 45;
    const shouldRenderPercent = width > 90 && height > 60 && percentage > 0;

    // Smart text truncation for country names
    const getTruncatedName = (name, maxWidth) => {
      if (!name) return "";

      // Special handling for long country names
      const nameMap = {
        "United Kingdom": "UK",
        "United States": "US",
        "South Africa": "S. Africa",
        Netherlands: "Netherlands",
        "New Zealand": "N. Zealand",
        "Saudi Arabia": "S. Arabia",
      };

      if (nameMap[name]) {
        return nameMap[name];
      }

      // Truncate very long names based on cell width
      if (maxWidth < 100 && name.length > 8) {
        return name.substring(0, 7) + "...";
      }

      return name;
    };

    const displayName = getTruncatedName(name, width);

    // Calculate optimal text positioning
    const textCenterX = x + width / 2;
    const textCenterY = y + height / 2;

    // Adjust vertical spacing based on what text elements are shown
    let nameY, valueY, percentY;

    if (shouldRenderName && shouldRenderValue && shouldRenderPercent) {
      // All three elements
      nameY = textCenterY - 12;
      valueY = textCenterY + 4;
      percentY = textCenterY + 18;
    } else if (shouldRenderName && shouldRenderValue) {
      // Name and value only
      nameY = textCenterY - 8;
      valueY = textCenterY + 8;
    } else if (shouldRenderName) {
      // Name only
      nameY = textCenterY + 2;
    }

    return (
      <g>
        {/* Main rectangle with subtle border for better definition */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fillColor,
            stroke: "rgba(255, 255, 255, 0.2)",
            strokeWidth: width > 100 ? 1 : 0.5,
          }}
        />

        {/* Subtle inner shadow effect for depth */}
        <rect
          x={x + 1}
          y={y + 1}
          width={Math.max(0, width - 2)}
          height={Math.max(0, height - 2)}
          style={{
            fill: "none",
            stroke: "rgba(0, 0, 0, 0.1)",
            strokeWidth: 0.5,
          }}
        />

        {/* Country name with enhanced styling */}
        {shouldRenderName && displayName && (
          <text
            x={textCenterX}
            y={nameY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize={fontSizes.name}
            fontWeight="700"
            fontFamily="'Segoe UI', 'Arial', sans-serif"
            style={{
              textShadow:
                textColor === "#FFFFFF"
                  ? "1px 1px 2px rgba(0,0,0,0.5)"
                  : "1px 1px 2px rgba(255,255,255,0.5)",
              letterSpacing: "0.5px",
            }}
          >
            {displayName}
          </text>
        )}

        {/* Value with number formatting */}
        {shouldRenderValue && (
          <text
            x={textCenterX}
            y={valueY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize={fontSizes.value}
            fontWeight="600"
            fontFamily="'Segoe UI', 'Arial', sans-serif"
            style={{
              textShadow:
                textColor === "#FFFFFF"
                  ? "1px 1px 2px rgba(0,0,0,0.5)"
                  : "1px 1px 2px rgba(255,255,255,0.5)",
            }}
          >
            {formatNumber(size)}
          </text>
        )}

        {/* Percentage with enhanced styling */}
        {shouldRenderPercent && (
          <text
            x={textCenterX}
            y={percentY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize={fontSizes.percent}
            fontWeight="500"
            fontFamily="'Segoe UI', 'Arial', sans-serif"
            style={{
              opacity: 0.9,
              textShadow:
                textColor === "#FFFFFF"
                  ? "1px 1px 2px rgba(0,0,0,0.5)"
                  : "1px 1px 2px rgba(255,255,255,0.5)",
            }}
          >
            {percentage}%
          </text>
        )}
      </g>
    );
  };

  return (
    <div
      className="treemap-container"
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        boxShadow:
          "0 6px 25px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
        borderRadius: "16px",
        padding: "24px",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3
          className="chart-title"
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a1a",
            fontFamily: "'Segoe UI', 'Arial', sans-serif",
          }}
        >
          COVID-19 Global Treemap
        </h3>
        <p
          className="chart-subtitle"
          style={{
            margin: "0",
            fontSize: "14px",
            color: "#666",
            lineHeight: "1.5",
            fontFamily: "'Segoe UI', 'Arial', sans-serif",
          }}
        >
          Visualization of {dataType} cases across {validData.length} countries
          worldwide.
        </p>
      </div>

      <div
        style={{
          height: "500px",
          width: "100%",
          overflow: "hidden",
          borderRadius: "8px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          backgroundColor: "#fafafa",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={validData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="rgba(255, 255, 255, 0.3)"
            fill="#8884d8"
            padding={0}
            content={(props) =>
              props ? <CustomizedContent {...props} /> : null
            }
            animationBegin={0}
            animationDuration={800}
            isAnimationActive={true}
          >
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              position={{ x: 0, y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TreemapChart;
