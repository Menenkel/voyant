# VOYANT - Travel Smarter, Stay Safer

A modern, minimalist travel risk assessment platform that provides comprehensive destination insights and real-time travel updates.

## 🌍 About

VOYANT helps travelers make informed decisions by providing detailed risk assessments, weather forecasts, health considerations, and security updates for destinations worldwide. Whether you're planning a trip to New York, Mexico City, or Kenya, we've got you covered with real-time data and expert insights.

## ✨ Features

### 🔍 **Smart Destination Search**
- Search any city or country with instant results
- Interactive map with location highlighting
- Real-time risk assessment and analysis

### 📊 **Comprehensive Risk Assessment**
- Overall risk level scoring (0-10 scale)
- Interactive natural hazards spider chart for all destinations
- Global rankings with explanatory text (Peace Index, Global Risk Rank, INFORM Index)
- Clear risk indicator explanations (higher ranks = less risky/more peaceful)
- **Country size data**: Area in km² and square miles with similar country comparisons
- Expandable sections for detailed insights

### 🌤️ **Advanced Weather & Climate Intelligence**
- Real-time weather data from Open-Meteo API with intelligent caching
- 16-day weather forecasts with expandable daily views and interactive charts
- Current conditions: temperature, precipitation, wind speed, humidity, weather outlook
- **Temperature stream graph**: Beautiful gradient visualization from red (max) to grey (min) temperatures
- **Units toggle**: Switch between Celsius/Fahrenheit and km/h/mph with instant conversion
- Interactive weather charts with temperature and precipitation trends using Chart.js
- **Separated weather alerts and air quality**: Distinct boxes with black borders and micro-animations
- **Enhanced air quality component**: Comprehensive metrics with detailed tooltips and health explanations
- **Dynamic color coding**: Air quality levels color-coded based on health impact (green/yellow/orange/red/purple)
- **Interactive tooltips**: Hover over air quality metrics for detailed explanations and normal value ranges
- **Extreme weather alerts**: Automated warnings for heavy rain, high winds, temperature extremes, and snow/hail
- **Expandable alert interface**: Shows first alert by default, expand to view all alerts with smooth animations
- Seasonal climate forecasts with contextual advice and best times to visit

### 💧 **Health & Safety Insights**
- Drinking water quality assessment (Low/Medium/High)
- Health risk levels and disease information
- Traveler advice and precautions
- Security status and current events

### 🗺️ **Interactive Map Experience**
- **Stamen Toner Lite basemap**: Clean, minimalist black and white design for professional appearance
- **Smart zoom logic**: Single cities zoom to detailed level 12, two-city comparisons adapt based on distance
- **Intelligent centering**: Single cities center exactly on location, comparisons center between cities
- **Smooth transitions**: Dynamic map updates with smooth flyTo animations between views
- **Consistent teardrop markers**: Professional pin design with yellow (primary) and blue (secondary) colors
- **Distance-based zoom**: Automatic zoom adjustment using Haversine formula for accurate spacing
- **Robust error handling**: Multiple safety checks prevent crashes and ensure stable rendering
- **Satellite and Toner Lite view options**: Toggle between different map styles

### ⚖️ **Destination Comparison**
- Compare risk profiles between two locations
- Side-by-side analysis of multiple destinations
- Comprehensive comparison of all risk factors

### 🤖 **Globaltrot-Bot AI Travel Guide**
- AI-powered travel summaries using ChatGPT integration with strict factual accuracy
- Real-time weather data integration with detailed forecasts and temperature/rain predictions
- 5-section structure: Quick Intro, Main Attractions, Weather & Climate, Accommodation, Airport Access
- **Enhanced Wikipedia integration**: Full page content retrieval for comprehensive destination information
- **Pop culture facts system**: Prioritizes famous actors, musicians, directors, and cultural figures
- **Flexible fact sourcing**: Uses Wikipedia data and training data for well-established pop culture facts
- Enhanced 300-word summaries with hotel price estimates and airport accessibility
- **City-specific pop culture facts**: ChatGPT-generated fascinating, lesser-known but true information
- No risk-related content in AI summaries (focuses on positive travel information)
- Streamlined comparison mode without comparison guide section
- **Dark green theme**: Updated border colors and styling for better visual hierarchy
- Expandable sections with collapsible design for better user experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Menenkel/voyant.git
   cd voyant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # ChatGPT API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
```bash
npm run dev
# or
pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet with React-Leaflet
- **Charts:** Recharts, Chart.js with react-chartjs-2
- **Icons:** Heroicons
- **AI Integration:** OpenAI ChatGPT API
- **Weather Data:** Open-Meteo API
- **Data Sources:** Wikipedia API, Supabase
- **Deployment:** Vercel (recommended)

## 📁 Project Structure

```
voyant/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── search/        # Destination search endpoint
│   │   ├── compare/       # Destination comparison endpoint
│   │   ├── city-search/   # City suggestions endpoint
│   │   └── weather/       # Weather data endpoint
│   ├── contact/           # Contact page
│   ├── features/          # Features page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AirQuality.tsx     # Enhanced air quality component with tooltips
│   ├── CountryMap.tsx     # Interactive map component
│   ├── DestinationSearch.tsx # Main search interface
│   ├── Footer.tsx         # Footer component
│   ├── Hero.tsx           # Hero section
│   ├── Navbar.tsx         # Navigation
│   ├── RiskRadarChart.tsx # Risk visualization
│   ├── WeatherChart.tsx   # Weather data visualization
│   ├── WeatherAlerts.tsx  # Extreme weather alerts component
│   └── ScrollProgressBar.tsx # Scroll indicator
├── lib/                   # Utility libraries
│   ├── chatgpt.ts         # ChatGPT API integration
│   ├── database.ts        # Supabase database functions
│   ├── wikipedia.ts       # Wikipedia API integration
│   ├── weather.ts         # Weather data integration
│   ├── cities.ts          # City data utilities
│   └── countryArea.ts     # Country area data and size comparisons
├── public/                # Static assets
└── README.md             # This file
```

## 🎨 Design Features

### Dark Mode Interface
- Permanent dark theme for better readability
- Yellow accent colors for highlights and interactions
- White borders and labels on maps for visibility

### Micro-Animations & Enhanced UI
- Smooth fade-in animations for content
- Hover effects and transitions with scale animations
- Interactive elements with visual feedback
- **Black borders**: All information boxes feature consistent black borders
- **Subtle color coding**: Each information type has distinct color themes
- **Enhanced spacing**: Proper visual separation between sections
- **Interactive tooltips**: Detailed explanations on hover for air quality metrics

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface

## 🔧 API Endpoints

### `/api/search`
- **Method:** GET
- **Parameters:** `destination` (string)
- **Returns:** Comprehensive destination data including:
  - Risk assessment scores with explanatory text
  - Real-time weather data (16-day forecast)
  - Air quality information (PM2.5, PM10, UV Index, Ozone)
  - Health data and security status
  - Interactive natural hazards spider chart
  - AI-generated travel summary (city vs country optimized)

### `/api/compare`
- **Method:** POST
- **Parameters:** `firstDestination`, `secondDestination` (strings)
- **Returns:** Side-by-side comparison with AI-generated comparison summary

### `/api/city-search`
- **Method:** GET
- **Parameters:** `q` (query string), `limit` (number)
- **Returns:** City suggestions for autocomplete functionality

### `/api/weather`
- **Method:** GET
- **Parameters:** `city` (string), `lat` (number), `lng` (number)
- **Returns:** Detailed weather data including:
  - Current conditions and 16-day forecast
  - Air quality metrics with health descriptions
  - Interactive weather charts

## 🌟 Key Features in Detail

### Risk Assessment
- **Overall Risk Level:** Single 0-10 score with color-coded indicators
- **Natural Hazards Spider Chart:** Interactive visualization for all destinations
- **Global Rankings:** Peace Index, Global Risk Rank, INFORM Index with explanatory text
- **Clear Explanations:** Higher ranks = less risky/more peaceful, lower INFORM scores = less risk
- **Expandable Details:** Click to see comprehensive risk breakdowns

### Weather Intelligence
- **Real-time Data:** Open-Meteo API integration for accurate weather information
- **16-Day Forecasts:** Expandable daily views with temperature and precipitation charts
- **Temperature Stream Graph:** Beautiful gradient visualization from red (max) to grey (min) temperatures
- **Units Toggle:** Switch between Celsius/Fahrenheit and km/h/mph with instant conversion
- **Air Quality Monitoring:** PM2.5, PM10, UV Index, Ozone with detailed health descriptions
- **Interactive Charts:** Temperature trends and precipitation patterns with hover interactions
- **Current Conditions:** Temperature, precipitation, wind speed, humidity, and weather outlook

### Health & Safety
- **Water Quality:** Low/Medium/High ratings with specific advice
- **Health Risks:** Disease information and traveler precautions
- **Security Updates:** Current events and safety recommendations

### AI-Powered Travel Intelligence
- **Globaltrot-Bot Integration:** ChatGPT-powered travel summaries with strict factual accuracy
- **Smart Query Differentiation:** City vs country optimized summaries with location-specific content
- **City Queries:** Quick Intro, Main Attractions, Weather & Climate, Accommodation, Airport Access (no national risks)
- **Country Queries:** Quick Intro, Main Attractions, Weather & Climate, Accommodation, Airport Access, Risks
- **Wikipedia Data:** Comprehensive destination information from Wikipedia with intelligent disambiguation
- **Hotel Price Estimates:** AI-generated entry-level, medium, and high-level accommodation pricing
- **Airport Access Information:** AI-generated distances, travel times, and transportation options
- **City-Specific Fun Facts:** ChatGPT-generated entertaining and factual information for cities
- **Enhanced Summaries:** 300-word maximum for detailed, focused insights with weather integration
- **Comparison Mode:** AI-generated side-by-side destination analysis
- **Expandable Design:** Collapsible sections for better user experience

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Custom domain configuration available

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆕 Recent Updates

### 🤖 Enhanced AI-Powered Travel Intelligence
- **Comprehensive AI Structure:** 5-section summaries (Quick Intro, Main Attractions, Weather & Climate, Accommodation, Airport Access)
- **Hotel Price Estimates:** AI-generated entry-level, medium, and high-level accommodation pricing with currency
- **Airport Access Information:** AI-generated distances in km/miles, travel times, and transportation options
- **City-Specific Fun Facts:** ChatGPT-generated entertaining and factual information for cities (not countries)
- **Strict Factual Accuracy:** Enhanced prompts to prevent fabrication and ensure credibility
- **Location Disambiguation:** Proper handling of cities with same names in different countries (e.g., Vienna, Austria vs Vienna, United States)
- **Expandable Design:** Collapsible Globetrot-Bot Summary and Basic Country Information sections

### 🌤️ Advanced Weather & Climate Integration
- **Open-Meteo API Integration:** Real-time weather data with intelligent caching and 16-day forecasts
- **Extreme Weather Alerts:** Automated warnings for heavy rain, high winds, temperature extremes, and snow/hail
- **Interactive Weather Charts:** Temperature and precipitation trends with Chart.js visualization
- **Comprehensive Air Quality:** PM2.5, PM10, UV Index, Ozone with detailed health descriptions and guidance
- **Weather-Aware AI:** ChatGPT incorporates current and forecasted weather conditions into summaries
- **Expandable Daily Views:** Interactive charts with expandable daily summaries for better user experience

### 🗺️ Enhanced Location Intelligence
- **Country-Specific City Search:** Accurate location matching using ISO3 country codes
- **Wikipedia Disambiguation:** Intelligent handling of city/country combinations for accurate data
- **Coordinate-Based Weather:** Direct lat/lng weather fetching for precise location data
- **Destination Name Preservation:** Maintains original search queries for consistent user experience

### 🎨 Improved User Experience
- **Expandable Sections:** Collapsible design for Globetrot-Bot Summary and Basic Country Information
- **Enhanced Weather Visualization:** Modern charts and daily forecast cards with intuitive icons
- **Air Quality Indicators:** Color-coded health guidance for all air quality metrics
- **Responsive Design:** Optimized for all device sizes with smooth animations
- **Performance Optimization:** Reduced API calls and improved loading times with caching

### 🗺️ Enhanced Map Visualization & Weather Alerts
- **Stamen Toner Lite Basemap:** Professional black and white design for clean, minimalist appearance
- **Smart Zoom Logic:** Single cities zoom to detailed level 12, two-city comparisons adapt based on distance
- **Intelligent Map Centering:** Single cities center exactly on location, comparisons center between cities
- **Smooth Map Transitions:** Dynamic updates with smooth transitions between single and comparison views
- **Collapsible Weather Alerts:** Shows first alert by default, expand to view all alerts with smooth animations
- **Distance-Based Zoom:** Automatic zoom adjustment for two-city comparisons (continent to city level)

### 🎭 Enhanced User Experience & Entertainment
- **Redesigned Fun Facts:** Renamed to "Not really important, but still good to know" with theater mask icon
- **Artist-Focused Content:** ChatGPT now prioritizes famous artists, musicians, and cultural figures
- **Entertaining Facts:** Enhanced prompts focus on quirky details, surprising statistics, and hidden gems
- **Expandable AI Summaries:** Globetrot-Bot summaries now show by default (no longer cut off)
- **Improved Loading States:** Better progress indicators and error handling throughout the app

### 🛡️ Robust Error Handling & Stability
- **Comprehensive Map Error Handling:** Multiple safety checks prevent crashes and DOM manipulation errors
- **Leaflet Loading Detection:** Advanced retry logic with timeout protection (5 seconds max)
- **Graceful Degradation:** App continues to work even if map fails, with clear error messages
- **Enhanced Debugging:** Extensive console logging for development and troubleshooting
- **Professional Error States:** User-friendly error messages instead of technical crashes

### 🌡️ Enhanced Weather Visualization & Units
- **Temperature Stream Graph:** Beautiful gradient visualization from red (max) to grey (min) temperatures
- **Units Toggle:** Switch between Celsius/Fahrenheit and km/h/mph with instant conversion
- **Interactive Hover Points:** Both max and min temperature points with detailed tooltips
- **Petrol Blue Rainfall:** Updated precipitation bars with proper blue color scheme
- **Weather Section Integration:** Units switch conveniently located in weather section

### 📏 Country Size & Geographic Data
- **Comprehensive Area Database:** 195+ countries with accurate area measurements in km² and square miles
- **Similar Size Comparisons:** Intelligent matching to find countries with similar land area
- **Smart Country Matching:** Handles country name variations (USA, UK, DRC, etc.)
- **Basic Country Information:** Enhanced with size data and geographic context
- **Dual Unit Display:** Both metric and imperial measurements for global accessibility

### 🎨 Enhanced UI/UX & Pop Culture Facts (Latest Update)
- **Separated Information Boxes:** Weather alerts and air quality now in distinct boxes with black borders
- **Micro-Animations:** Added hover effects, scale animations, and smooth transitions throughout
- **Enhanced Air Quality Component:** Comprehensive metrics with detailed tooltips and health explanations
- **Dynamic Color Coding:** Air quality levels color-coded based on health impact (green/yellow/orange/red/purple)
- **Interactive Tooltips:** Hover over air quality metrics for detailed explanations and normal value ranges
- **Pop Culture Facts System:** Enhanced Wikipedia search and ChatGPT prompts for fascinating cultural facts
- **Flexible Fact Sourcing:** Uses both Wikipedia data and training data for well-established pop culture facts
- **Visual Hierarchy:** Dark green theme for globetrot box, petrol blue for fun facts, proper spacing between sections
- **Enhanced Wikipedia Integration:** Full page content retrieval for comprehensive destination information
- **City-Specific Pop Culture Facts:** ChatGPT-generated fascinating, lesser-known but true information about famous people

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Leaflet](https://leafletjs.com/) for the interactive maps
- [Recharts](https://recharts.org/) for the beautiful charts
- [Open-Meteo](https://open-meteo.com/) for comprehensive weather data
- [Chart.js](https://www.chartjs.org/) for interactive weather visualizations

## 📞 Contact

- **Website:** [VOYANT](https://voyant.vercel.app)
- **GitHub:** [@Menenkel](https://github.com/Menenkel)
- **Email:** support@voyant.com

---

**Discover, compare, and prepare** — get destination risk ratings and live updates before you go. 🌍✈️
