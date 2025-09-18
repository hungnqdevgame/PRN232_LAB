import { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import TreemapChart from "./components/TreemapChart";
import TabNavigation from "./components/TabNavigation";
import { getTotals, formatNumber, fetchCovidData } from "./data/covidData";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("confirmed");
  const [covidData, setCovidData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch COVID data on component mount
  useEffect(() => {
    const loadCovidData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Loading COVID data from API...");
        const data = await fetchCovidData();
        setCovidData(data);
        console.log(
          "✅ COVID data loaded successfully:",
          data.length,
          "countries"
        );
      } catch (err) {
        console.error("❌ Failed to load COVID data from API:", err);

        // Set specific error messages based on error type
        if (err.message.includes("CORS_ERROR")) {
          setError(
            "Backend server needs CORS configuration. Please check server settings."
          );
        } else if (err.message.includes("TIMEOUT_ERROR")) {
          setError(
            "Backend server is not responding. Please check if the server is running."
          );
        } else if (err.message.includes("MOCK_DATA_ENABLED")) {
          setError("API is disabled in configuration. Please enable the API.");
        } else {
          setError(`API Error: ${err.message}. Please check backend server.`);
        }

        // Set empty data when API fails (no fallback)
        setCovidData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCovidData();

    // Auto refresh every 5 minutes when API is working
    const refreshInterval = setInterval(() => {
      if (!error) {
        console.log("🔄 Auto-refreshing COVID data...");
        loadCovidData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [error]);

  const totals = getTotals(covidData);

  // Manual refresh function for users
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCovidData();
      setCovidData(data);
      console.log("✅ Data refreshed successfully");
    } catch (err) {
      console.error("❌ Manual refresh failed:", err);
      if (err.message.includes("CORS_ERROR")) {
        setError(
          "Backend server needs CORS configuration. Please check server settings."
        );
      } else if (err.message.includes("TIMEOUT_ERROR")) {
        setError(
          "Backend server is not responding. Please check if the server is running."
        );
      } else if (err.message.includes("MOCK_DATA_ENABLED")) {
        setError("API is disabled in configuration. Please enable the API.");
      } else {
        setError(
          `Refresh failed: ${err.message}. Please check backend server.`
        );
      }
      // Keep current data on refresh failure
    } finally {
      setLoading(false);
    }
  };

  // Show error state when no data is available
  if (!loading && (!covidData || covidData.length === 0)) {
    return (
      <div
        className="app"
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#f0f2f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ color: "#dc3545", marginBottom: "20px" }}>
            No COVID Data Available
          </h2>
          <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.6" }}>
            {error || "Unable to load COVID-19 data from the backend API."}
            <br />
            Please ensure the backend server is running and accessible.
          </p>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="app"
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#f0f2f5",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {/* Enhanced loading animation */}
          <div
            style={{
              position: "relative",
              marginBottom: "30px",
            }}
          >
            {/* Outer spinning ring */}
            <div
              style={{
                width: "80px",
                height: "80px",
                border: "4px solid #e3e3e3",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1.2s linear infinite",
                margin: "0 auto",
                position: "relative",
              }}
            />

            {/* Inner pulsing circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40px",
                height: "40px",
                backgroundColor: "#007bff",
                borderRadius: "50%",
                animation: "pulse 1.5s ease-in-out infinite",
                opacity: 0.6,
              }}
            />

            {/* Center icon */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "24px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              🌍
            </div>
          </div>

          {/* Animated text */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "24px",
                color: "#333",
                margin: "0 0 10px 0",
                fontWeight: "600",
              }}
            >
              Loading COVID-19 Data
            </h2>
            <div
              style={{
                fontSize: "16px",
                color: "#666",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Fetching global statistics</span>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    animation: "bounce 1.4s ease-in-out infinite both",
                    animationDelay: "0s",
                  }}
                />
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    animation: "bounce 1.4s ease-in-out infinite both",
                    animationDelay: "0.16s",
                  }}
                />
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    animation: "bounce 1.4s ease-in-out infinite both",
                    animationDelay: "0.32s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Progress indication */}
          <div
            style={{
              width: "200px",
              height: "4px",
              backgroundColor: "#e9ecef",
              borderRadius: "2px",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, #007bff 0%, #0056b3 50%, #007bff 100%)",
                animation: "shimmer 2s ease-in-out infinite",
                transformOrigin: "left center",
              }}
            />
          </div>

          {/* Loading tip */}
          <p
            style={{
              fontSize: "14px",
              color: "#888",
              marginTop: "20px",
              fontStyle: "italic",
            }}
          >
            Processing data from multiple sources...
          </p>
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 0.6;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.2;
            }
          }

          @keyframes bounce {
            0%,
            80%,
            100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="app"
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <header
        className="header"
        style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "10px 0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1 style={{ fontSize: "28px", color: "#333", margin: 0 }}>
          COVID-19 Dashboard
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "4px",
              margin: "10px 0",
              fontSize: "14px",
              border: "1px solid #f5c6cb",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </header>

      <div
        className="tab-container"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div
        className="metric-summary"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div
          className="metric-card"
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            minWidth: "200px",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#555" }}>
            Total {activeTab === "dailyIncrease" ? "Daily Increase" : activeTab}
          </h3>
          <p
            className="metric-value"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#0066CC",
              margin: 0,
            }}
          >
            {formatNumber(totals[activeTab])}
          </p>
        </div>
      </div>

      <div
        className="dashboard-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          width: "100%",
        }}
      >
        <div
          className="world-map-section"
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginBottom: "10px",
              textAlign: "center",
              color: "#333",
              fontWeight: "600",
            }}
          >
            World Map Visualization
          </h3>
          <WorldMap dataType={activeTab} covidData={covidData} />
        </div>

        {/* Map Legend - Added below the map */}
        <div
          className="map-legend-section"
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "15px",
            marginTop: "-15px",
          }}
        >
          <div
            className="map-legend"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4
              style={{
                margin: "0 0 15px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                width: "100%",
                textAlign: "center",
              }}
            >
              COVID-19{" "}
              {activeTab === "dailyIncrease"
                ? "Daily Increase"
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Legend
            </h4>

            <div
              className="legend-items"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "10px 20px",
                width: "100%",
                maxWidth: "800px",
              }}
            >
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#F5F5F5",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>No data/Very low (&lt; 1%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#99C2FF",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Low (1-2%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#4D94FF",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Low-Medium (2-3%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#0066CC",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Medium (3-5%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#0047AB",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Medium-High (5-8%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#003399",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>High (8-10%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#00297A",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Very High (10-15%)</span>
              </div>
              <div
                className="legend-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span
                  className="color-box"
                  style={{
                    background: "#00205B",
                    width: "18px",
                    height: "18px",
                    display: "inline-block",
                    marginRight: "8px",
                    border: "1px solid #ddd",
                  }}
                ></span>
                <span>Critical (15%+)</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="treemap-section"
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "20px",
          }}
        >
          <TreemapChart dataType={activeTab} covidData={covidData} />
        </div>
      </div>

      <footer
        className="footer"
        style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#888",
          fontSize: "14px",
          padding: "20px",
          borderTop: "1px solid #ddd",
        }}
      >
        <p>
          {error
            ? `Data unavailable. Last attempt: ${new Date().toLocaleString()}`
            : `COVID-19 Global Dashboard • Last updated: ${new Date().toLocaleString()}`}
        </p>
      </footer>
    </div>
  );
}

export default App;
