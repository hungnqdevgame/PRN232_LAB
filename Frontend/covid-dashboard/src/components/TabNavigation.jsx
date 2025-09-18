import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'active', label: 'Active' },
    { id: 'recovered', label: 'Recovered' },
    { id: 'deaths', label: 'Deaths' },
    { id: 'dailyIncrease', label: 'Daily Increase' }
  ];

  return (
    <div className="tab-navigation" style={{ 
      display: 'flex', 
      background: '#fff', 
      borderRadius: '8px', 
      overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === tab.id ? '#0066CC' : 'transparent',
            fontSize: '16px',
            fontWeight: '500',
            color: activeTab === tab.id ? 'white' : '#555',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.backgroundColor = '#f0f0f0';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;