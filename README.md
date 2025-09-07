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
- Expandable sections for detailed insights

### 🌤️ **Advanced Weather & Climate Intelligence**
- Real-time weather data from Open-Meteo API
- 16-day weather forecasts with expandable daily views
- Current conditions: temperature, precipitation, wind speed, humidity
- Interactive weather charts with temperature and precipitation trends
- Comprehensive air quality data (PM2.5, PM10, UV Index, Ozone)
- Detailed air quality descriptions with health context
- Seasonal climate forecasts with contextual advice

### 💧 **Health & Safety Insights**
- Drinking water quality assessment (Low/Medium/High)
- Health risk levels and disease information
- Traveler advice and precautions
- Security status and current events

### 🗺️ **Interactive Map Experience**
- Dark mode map with white borders and labels
- Bright location pins for easy identification
- Support for comparing two destinations
- Satellite and street view options

### ⚖️ **Destination Comparison**
- Compare risk profiles between two locations
- Side-by-side analysis of multiple destinations
- Comprehensive comparison of all risk factors

### 🤖 **Globaltrot-Bot AI Travel Guide**
- AI-powered travel summaries using ChatGPT integration
- Real-time weather data integration with detailed forecasts
- 3-section structure: Quick Intro, Main Attractions, Weather & Climate
- Wikipedia data integration for comprehensive destination information
- Enhanced 300-word summaries with temperature and rain predictions
- No risk-related content in AI summaries (focuses on positive travel information)
- Streamlined comparison mode without comparison guide section

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
│   ├── CountryMap.tsx     # Interactive map component
│   ├── DestinationSearch.tsx # Main search interface
│   ├── Footer.tsx         # Footer component
│   ├── Hero.tsx           # Hero section
│   ├── Navbar.tsx         # Navigation
│   ├── RiskRadarChart.tsx # Risk visualization
│   ├── WeatherChart.tsx   # Weather data visualization
│   └── ScrollProgressBar.tsx # Scroll indicator
├── lib/                   # Utility libraries
│   ├── chatgpt.ts         # ChatGPT API integration
│   ├── database.ts        # Supabase database functions
│   ├── wikipedia.ts       # Wikipedia API integration
│   ├── weather.ts         # Weather data integration
│   └── cities.ts          # City data utilities
├── public/                # Static assets
└── README.md             # This file
```

## 🎨 Design Features

### Dark Mode Interface
- Permanent dark theme for better readability
- Yellow accent colors for highlights and interactions
- White borders and labels on maps for visibility

### Micro-Animations
- Smooth fade-in animations for content
- Hover effects and transitions
- Interactive elements with visual feedback

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
- **Air Quality Monitoring:** PM2.5, PM10, UV Index, Ozone with detailed health descriptions
- **Interactive Charts:** Temperature trends and precipitation patterns
- **Current Conditions:** Temperature, precipitation, wind speed, humidity, and weather outlook

### Health & Safety
- **Water Quality:** Low/Medium/High ratings with specific advice
- **Health Risks:** Disease information and traveler precautions
- **Security Updates:** Current events and safety recommendations

### AI-Powered Travel Intelligence
- **Globaltrot-Bot Integration:** ChatGPT-powered travel summaries
- **Smart Query Differentiation:** City vs country optimized summaries
- **City Queries:** Quick Intro, Main Attractions, Weather & Climate (no national risks)
- **Country Queries:** Quick Intro, Main Attractions, Weather & Climate, Risks
- **Wikipedia Data:** Comprehensive destination information from Wikipedia
- **Risk Filtering:** Shows only high risks (7+ on scale) for country queries
- **Enhanced Summaries:** 300-word maximum for detailed, focused insights
- **Comparison Mode:** AI-generated side-by-side destination analysis

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

### Enhanced AI Summaries & User Experience
- **Streamlined AI Structure:** Reduced from 4 to 3 sections (Quick Intro, Main Attractions, Weather & Climate)
- **Removed All Risk Content:** AI summaries now focus purely on positive travel information
- **Enhanced Weather Integration:** Real-time weather data with detailed 16-day forecasts and temperature/rain predictions
- **Cleaner Comparison Mode:** Removed comparison guide section for streamlined side-by-side destination viewing
- **Simplified Map Interface:** Removed search functionality from Leaflet map for cleaner user experience

### Advanced Weather Integration
- **Open-Meteo API Integration:** Real-time weather data with 16-day forecasts
- **Expandable Weather Views:** Interactive charts with expandable daily summaries
- **Comprehensive Air Quality:** PM2.5, PM10, UV Index, Ozone with detailed health descriptions
- **Weather Charts:** Temperature and precipitation trends with Chart.js visualization

### Improved User Experience
- **Enhanced AI Summaries:** Increased from 150 to 300 words for more detailed insights
- **Better Risk Understanding:** Clear explanations of what risk indicators mean
- **Visual Weather Data:** Interactive charts and expandable daily forecasts
- **Optimized Performance:** Caching and retry mechanisms for reliable data fetching

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
