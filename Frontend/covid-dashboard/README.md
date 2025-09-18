# COVID-19 Data Visualization Dashboard

This is a React-based dashboard that visualizes COVID-19 data across the world with:
- An interactive world map that displays countries colored by their COVID-19 statistics
- A treemap visualization showing the proportional distribution of cases by country
- Tab navigation to switch between different data views (Confirmed, Active, Recovered, Deaths, Daily Increase)

## Features

- Interactive world map with country highlighting
- Treemap visualization showing proportional distribution of cases
- Tab navigation for different data types
- Responsive design that works on desktop and mobile devices

## Technology Stack

- React
- Vite
- react-simple-maps (for the world map)
- recharts (for the treemap)
- d3-scale (for scaling data values to colors)
- topojson-client (for processing map data)
- prop-types (for component property validation)
- react-is (for React type checking)

## Running the Project

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `src/components/` - React components
  - `WorldMap.jsx` - World map visualization
  - `TreemapChart.jsx` - Treemap visualization
  - `TabNavigation.jsx` - Navigation tabs
- `src/data/` - Data models and sample data
  - `covidData.js` - Sample COVID-19 data and helper functions
- `src/utils/` - Utility functions
  - `dataUtils.js` - Data processing utilities

## Data Structure

The application uses a data model that includes:
- Country name and ISO codes
- Confirmed cases
- Active cases
- Recovered cases
- Deaths
- Daily increase in cases
- Percentage of global total

## Troubleshooting

If you encounter any of the following issues:

### Map Data Loading Error
The app uses CDN-hosted GeoJSON data for the world map. If this fails to load, the app will fall back to a simplified local map file.

### "Cannot read properties of undefined" Error
This could happen if data is unavailable or in an unexpected format. The app includes error handling to prevent crashes in these cases.

### Node.js Version Error
Vite requires Node.js version 20.19.0 or newer. If you see an error about Node.js version requirements, please upgrade your Node.js installation.

## License

MIT
