import { useState } from 'react'
import WorldMap from './components/WorldMap'
import TreemapChart from './components/TreemapChart'
import TabNavigation from './components/TabNavigation'
import { getTotals, formatNumber } from './data/covidData'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('confirmed');
  const totals = getTotals();

  return (
    <div className="app" style={{ 
      width: '100%', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <header className="header" style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        padding: '10px 0', 
        borderBottom: '1px solid #ddd' 
      }}>
        <h1 style={{ fontSize: '28px', color: '#333', margin: 0 }}>COVID-19 Dashboard</h1>
        <h2 style={{ fontSize: '20px', color: '#555', marginTop: '5px', margin: '5px 0 0 0' }}># of Cases Worldwide</h2>
      </header>

      <div className="tab-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px' 
      }}>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="metric-summary" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '20px' 
      }}>
        <div className="metric-card" style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
          textAlign: 'center', 
          minWidth: '200px' 
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#555' }}>Total {activeTab === 'dailyIncrease' ? 'Daily Increase' : activeTab}</h3>
          <p className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066CC', margin: 0 }}>{formatNumber(totals[activeTab])}</p>
        </div>
      </div>

      <div className="dashboard-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '30px', 
        width: '100%' 
      }}>
        <div className="world-map-section" style={{ 
          width: '100%', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', 
          padding: '20px' 
        }}>
          <h3 style={{ marginBottom: '10px', textAlign: 'center', color: '#333', fontWeight: '600' }}>World Map Visualization</h3>
          <WorldMap dataType={activeTab} />
        </div>

        <div className="treemap-section" style={{ 
          width: '100%', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', 
          padding: '20px' 
        }}>
          <TreemapChart dataType={activeTab} />
        </div>
      </div>

      <footer className="footer" style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '14px', 
        padding: '20px', 
        borderTop: '1px solid #ddd' 
      }}>
        <p>Data is for demonstration purposes only</p>
      </footer>
    </div>
  )
}

export default App
