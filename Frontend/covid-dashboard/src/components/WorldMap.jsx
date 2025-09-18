import React, { useState, useEffect } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { covidData } from '../data/covidData';

// Simple GeoJSON URL that definitely works
const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const WorldMap = ({ dataType = 'confirmed' }) => {
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
    const country = covidData.find(c => c.countryInfo.iso3 === countryId);
    if (!country) return "#F5F5F5"; // Default light gray for no data
    
    const value = country.percent;
    if (value >= 15) return "#00205B"; // Critical (15%+)
    if (value >= 10) return "#00297A"; // Very High (10-15%)
    if (value >= 8) return "#003399";  // High (8-10%)
    if (value >= 5) return "#0047AB";  // Medium-High (5-8%)
    if (value >= 3) return "#0066CC";  // Medium (3-5%)
    if (value >= 2) return "#4D94FF";  // Low-Medium (2-3%)
    if (value >= 1) return "#99C2FF";  // Low (1-2%)
    return "#E6F7FF"; // Very low (<1%)
  };

  const handleMouseEnter = (geo, e) => {
    // Try different property names for country ID and name
    const countryId = geo.properties?.ISO_A3 || geo.properties?.iso_a3 || 
                     geo.properties?.ADM0_A3 || geo.properties?.id || "";
    const countryName = geo.properties?.NAME || geo.properties?.name || 
                       geo.properties?.ADMIN || geo.properties?.admin || "Unknown";
    
    const countryData = covidData.find(c => c.countryInfo.iso3 === countryId);
    
    let tooltipText = countryName;
    
    if (countryData) {
      tooltipText = `${countryData.country || countryName}: ${countryData.percent}%`;
      
      if (dataType === 'confirmed') {
        tooltipText += `\nConfirmed: ${countryData.confirmed.toLocaleString()}`;
      } else if (dataType === 'active') {
        tooltipText += `\nActive: ${countryData.active.toLocaleString()}`;
      } else if (dataType === 'recovered') {
        tooltipText += `\nRecovered: ${countryData.recovered.toLocaleString()}`;
      } else if (dataType === 'deaths') {
        tooltipText += `\nDeaths: ${countryData.deaths.toLocaleString()}`;
      }
      
      tooltipText += `\nDaily Increase: ${countryData.dailyIncrease.toLocaleString()}`;
    }
      
    setTooltipContent(tooltipText);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="world-map-container">
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'rgba(255,255,255,0.8)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Loading map...
        </div>
      )}
      
      <ComposableMap 
        projection="geoEqualEarth"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F8FBFF"
        }}
        projectionConfig={{
          scale: 160,
          center: [0, 0]
        }}
      >
        <ZoomableGroup zoom={1.0}>
          <Geographies geography={geoUrl}>
            {({ geographies, error }) => {
              if (error) {
                console.error('Error loading geographies:', error);
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
              
              console.log('Loaded geographies count:', geographies.length);
              
              return geographies.map(geo => {
                if (!geo || !geo.properties) {
                  console.warn('Invalid geography object:', geo);
                  return null;
                }
                
                const countryId = geo.properties.ISO_A3 || geo.properties.iso_a3 || geo.id || "";
                const countryName = geo.properties.NAME || geo.properties.name || "Unknown";
                const fillColor = getCountryColor(countryId);
                
                // Debug logging for key countries
                if (['USA', 'IND', 'BRA', 'RUS'].includes(countryId)) {
                  console.log(`Rendering ${countryName} (${countryId}) with color ${fillColor}`);
                  console.log(`Country data:`, covidData.find(c => c.countryInfo.iso3 === countryId));
                }
                
                return (
                  <Geography
                    key={geo.rsmKey || `geo-${countryId}-${Math.random()}`}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: fillColor,
                        outline: 'none'
                      },
                      hover: {
                        fill: fillColor,
                        stroke: '#666',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer'
                      },
                      pressed: {
                        fill: fillColor,
                        outline: 'none'
                      }
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="map-tooltip" 
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0px 3px 8px rgba(0,0,0,0.3)'
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      {/* Legend */}
      <div className="map-legend">
        <h4>COVID-19 {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Cases</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="color-box" style={{ background: "#F5F5F5" }}></span>
            <span>No data/Very low (&lt; 1%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#99C2FF" }}></span>
            <span>Low (1-2%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#4D94FF" }}></span>
            <span>Low-Medium (2-3%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#0066CC" }}></span>
            <span>Medium (3-5%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#0047AB" }}></span>
            <span>Medium-High (5-8%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#003399" }}></span>
            <span>High (8-10%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#00297A" }}></span>
            <span>Very High (10-15%)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ background: "#00205B" }}></span>
            <span>Critical (15%+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;