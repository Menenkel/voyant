# VOYANT - Travel Smart, Stay Safe

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
- Detailed hazard indicators with radar chart visualization
- Global rankings (Peace Index, Fragile States, Corruption Index)
- Expandable sections for detailed insights

### 🌤️ **Weather & Climate Intelligence**
- Current weather conditions and travel impact
- Seasonal climate forecasts with fun, contextual advice
- Precipitation and temperature trend analysis
- Packing recommendations based on weather patterns

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

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet with React-Leaflet
- **Charts:** Recharts
- **Icons:** Heroicons
- **Deployment:** Vercel (recommended)

## 📁 Project Structure

```
voyant/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
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
│   └── ScrollProgressBar.tsx # Scroll indicator
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
  - Risk assessment scores
  - Weather information
  - Health data
  - Security status
  - Travel distance
  - News updates

## 🌟 Key Features in Detail

### Risk Assessment
- **Overall Risk Level:** Single 0-10 score with color-coded indicators
- **Hazard Indicators:** Radar chart showing earthquake, flood, tsunami, cyclone, and other risks
- **Global Rankings:** Peace Index, Fragile States Index, and Corruption Index
- **Expandable Details:** Click to see comprehensive risk breakdowns

### Weather Intelligence
- **Current Conditions:** Temperature, precipitation, and outlook
- **Seasonal Forecasts:** 3-month weather predictions
- **Fun Packing Tips:** Contextual advice like "Better bring an umbrella - Mother Nature's having a water party!"

### Health & Safety
- **Water Quality:** Low/Medium/High ratings with specific advice
- **Health Risks:** Disease information and traveler precautions
- **Security Updates:** Current events and safety recommendations

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

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Leaflet](https://leafletjs.com/) for the interactive maps
- [Recharts](https://recharts.org/) for the beautiful charts

## 📞 Contact

- **Website:** [VOYANT](https://voyant.vercel.app)
- **GitHub:** [@Menenkel](https://github.com/Menenkel)
- **Email:** support@voyant.com

---

**Discover, compare, and prepare** — get destination risk ratings and live updates before you go. 🌍✈️
