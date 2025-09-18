import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { getTreemapData, formatNumber } from "../data/covidData";
import { getTreemapColor } from "../utils/colorUtils";

const TreemapChart = ({ dataType = "confirmed", covidData = null }) => {
  const [tooltipContent, setTooltipContent] = useState(null);

  // Generate the data for the treemap based on the selected data type
  const data = getTreemapData(dataType, covidData);

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0 && payload[0].payload) {
      const item = payload[0].payload;
      return (
        <div className="treemap-tooltip">
          <p className="tooltip-country">{item.name || "Unknown"}</p>
          <p className="tooltip-value">{formatNumber(item.size || 0)}</p>
          <p className="tooltip-percent">
            {item.percentage || 0}% of total cases
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom content for the treemap cells
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
      // Threshold set at 0.55 for better contrast
      return luminance > 0.55 ? "#000000" : "#FFFFFF";
    };

    // Get the fill color for this country
    const fillColor = name ? getTreemapColor(name) : color || fill;

    // Calculate text color based on background
    const textColor = getContrastColor(fillColor);

    // Adjust text sizes for better readability
    const nameFontSize = width > 150 ? 16 : width > 100 ? 14 : 11;
    const valueFontSize = width > 150 ? 14 : width > 100 ? 12 : 10;
    const percentFontSize = width > 150 ? 12 : width > 100 ? 10 : 9;

    // Only show text if cell is large enough
    const shouldRenderName = width > 60 && height > 40;
    const shouldRenderValue = width > 80 && height > 60;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fillColor,
            stroke: "none",
          }}
        />
        {shouldRenderName && name && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill={textColor}
            fontSize={nameFontSize}
            fontWeight="600"
            className="treemap-text country-name"
          >
            {name}
          </text>
        )}
        {shouldRenderValue && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill={textColor}
            fontSize={valueFontSize}
            fontWeight="500"
            className="treemap-text country-value"
          >
            {formatNumber(size)}
          </text>
        )}
        {shouldRenderValue && percentage > 0 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 25}
            textAnchor="middle"
            fill={textColor}
            fontSize={percentFontSize}
            fontWeight="500"
            className="treemap-text"
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
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <h3 className="chart-title">Treemap of Countries</h3>
      <p className="chart-subtitle">
        The Treemap shows the number of {dataType} cases in different countries
        and their percent of total cases worldwide
      </p>

      <div style={{ height: "450px", width: "100%", overflow: "hidden" }}>
        <ResponsiveContainer width="99%" height="100%">
          <Treemap
            data={data || []}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="none"
            fill="#8884d8"
            padding={1}
            content={(props) =>
              props ? <CustomizedContent {...props} /> : null
            }
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TreemapChart;
