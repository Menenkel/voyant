import { NextRequest, NextResponse } from 'next/server';

const generateRiskData = (_destination: string) => {
  const hazard_score = Math.floor(Math.random() * 10) + 1;
  const vulnerability_score = Math.floor(Math.random() * 10) + 1;
  const coping_capacity = Math.floor(Math.random() * 10) + 1;
  
  return {
    hazard_score,
    vulnerability_score,
    coping_capacity,
    overall_risk: Math.round((hazard_score + vulnerability_score + (11 - coping_capacity)) / 3)
  };
};

const generateTravelDistance = (destination: string) => {
  const airports = {
    'tokyo': { name: 'Narita International Airport', distance: 60, public_transport: 90, car: 60 },
    'new york': { name: 'JFK International Airport', distance: 25, public_transport: 45, car: 35 },
    'london': { name: 'Heathrow Airport', distance: 23, public_transport: 50, car: 40 },
    'paris': { name: 'Charles de Gaulle Airport', distance: 25, public_transport: 35, car: 30 },
    'mexico city': { name: 'Benito Juárez International Airport', distance: 8, public_transport: 25, car: 20 },
    'nairobi': { name: 'Jomo Kenyatta International Airport', distance: 15, public_transport: 45, car: 25 },
    'sydney': { name: 'Sydney Airport', distance: 8, public_transport: 20, car: 15 },
    'rio de janeiro': { name: 'Galeão International Airport', distance: 20, public_transport: 60, car: 35 },
    'mumbai': { name: 'Chhatrapati Shivaji International Airport', distance: 18, public_transport: 45, car: 30 },
    'beijing': { name: 'Beijing Capital International Airport', distance: 28, public_transport: 50, car: 40 },
    'cairo': { name: 'Cairo International Airport', distance: 22, public_transport: 40, car: 30 },
    'istanbul': { name: 'Istanbul Airport', distance: 35, public_transport: 60, car: 45 },
    'moscow': { name: 'Sheremetyevo International Airport', distance: 30, public_transport: 55, car: 40 },
    'singapore': { name: 'Changi Airport', distance: 20, public_transport: 30, car: 25 },
    'dubai': { name: 'Dubai International Airport', distance: 5, public_transport: 25, car: 15 },
    'bangkok': { name: 'Suvarnabhumi Airport', distance: 30, public_transport: 45, car: 35 },
    'seoul': { name: 'Incheon International Airport', distance: 50, public_transport: 70, car: 55 },
    'madrid': { name: 'Adolfo Suárez Madrid–Barajas Airport', distance: 15, public_transport: 30, car: 20 },
    'rome': { name: 'Leonardo da Vinci International Airport', distance: 30, public_transport: 45, car: 35 },
    'amsterdam': { name: 'Amsterdam Airport Schiphol', distance: 18, public_transport: 25, car: 20 }
  };
  
  const normalizedDestination = destination.toLowerCase().trim();
  return (airports as Record<string, unknown>)[normalizedDestination] || {
    name: 'Nearest International Airport',
    distance: Math.floor(Math.random() * 40) + 10,
    public_transport: Math.floor(Math.random() * 60) + 20,
    car: Math.floor(Math.random() * 40) + 15
  };
};

const generateSeasonalClimateForecast = (_destination: string) => {
  const temperatureTrends = ['Likely above average', 'Very likely above average', 'Likely below average', 'Very likely below average', 'Near average'];
  const precipitationTrends = ['Likely above average', 'Very likely above average', 'Likely below average', 'Very likely below average', 'Near average'];
  
  return {
    period: 'September - November 2025',
    temperature: {
      trend: temperatureTrends[Math.floor(Math.random() * temperatureTrends.length)],
      average: Math.floor(Math.random() * 30) + 5, // 5-35°C range
      min: Math.floor(Math.random() * 15) + 0, // 0-15°C range
      max: Math.floor(Math.random() * 20) + 20 // 20-40°C range
    },
    precipitation: {
      trend: precipitationTrends[Math.floor(Math.random() * precipitationTrends.length)],
      average: Math.floor(Math.random() * 200) + 50, // 50-250mm range
      days: Math.floor(Math.random() * 30) + 10 // 10-40 rainy days
    }
  };
};

const generateComprehensiveRiskIndicators = (_destination: string) => {
  const getRiskClass = (score: number) => {
    if (score <= 2.5) return { class: 'Low', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' };
    if (score <= 5) return { class: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' };
    if (score <= 7.5) return { class: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' };
    return { class: 'Very High', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
  };

  const overallRisk = Math.floor(Math.random() * 10) + 1;
  const riskClass = getRiskClass(overallRisk);

  return {
    risk_class: riskClass,
    overall_risk: overallRisk,
    hazard_indicators: {
      earthquake: Math.floor(Math.random() * 10) + 1,
      river_flood: Math.floor(Math.random() * 10) + 1,
      tsunami: Math.floor(Math.random() * 10) + 1,
      tropical_cyclone: Math.floor(Math.random() * 10) + 1,
      coastal_flood: Math.floor(Math.random() * 10) + 1,
      drought: Math.floor(Math.random() * 10) + 1,
      epidemic: Math.floor(Math.random() * 10) + 1,
      projected_conflict_risk: Math.floor(Math.random() * 10) + 1
    },
    global_indices: {
      global_peace_index: Math.floor(Math.random() * 163) + 1, // 1-163 countries
      fragile_states_index: Math.floor(Math.random() * 179) + 1, // 1-179 countries
      corruption_index: Math.floor(Math.random() * 180) + 1 // 1-180 countries
    }
  };
};

const generateNewsData = (destination: string) => {
  const newsSources = [
    'Global News Network', 'International Herald', 'World Daily', 'Metro Times', 'City News',
    'Regional Observer', 'National Post', 'Daily Chronicle', 'Urban Report', 'Capital News'
  ];
  
  const newsTemplates = [
    {
      title: `Tourism Boom: ${destination} Sees Record Visitor Numbers`,
      summary: `Tourist arrivals increase by 25% as travelers flock to experience local attractions and cultural sites.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-15T10:30:00Z'
    },
    {
      title: `Weather Alert: Severe Storm System Approaches ${destination}`,
      summary: `Heavy rainfall and strong winds expected to impact travel and outdoor activities in the region.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-14T14:20:00Z'
    },
    {
      title: `Security Update: Increased Police Presence in ${destination} Tourist Areas`,
      summary: `Authorities enhance security measures following recent incidents in popular tourist districts.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-13T09:15:00Z'
    },
    {
      title: `Climate Change Impact: ${destination} Faces Unusual Weather Patterns`,
      summary: `Scientists report changing climate conditions affecting local tourism and agriculture sectors.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-12T16:45:00Z'
    },
    {
      title: `Tourism Infrastructure: New Hotels and Attractions Open in ${destination}`,
      summary: `Major development projects completed to accommodate growing tourist demand and improve visitor experience.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-11T11:30:00Z'
    },
    {
      title: `Travel Advisory: Potential Civil Unrest Reported in ${destination}`,
      summary: `Foreign embassies issue warnings about planned demonstrations that may affect tourist areas.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-10T08:20:00Z'
    },
    {
      title: `Weather Forecast: Ideal Conditions for Tourism in ${destination}`,
      summary: `Perfect weather expected for the next two weeks, boosting local tourism and outdoor activities.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-09T12:15:00Z'
    },
    {
      title: `Natural Disaster Risk: ${destination} Monitors Earthquake Activity`,
      summary: `Seismic monitoring stations detect unusual activity, prompting safety reviews for tourist facilities.`,
      source: newsSources[Math.floor(Math.random() * newsSources.length)],
      publishedAt: '2025-08-08T15:30:00Z'
    }
  ];
  
  return newsTemplates.slice(0, 3);
};

const generateWeatherData = (destination: string) => {
  const temperatures = [15, 18, 22, 25, 28, 32, 35, 12, 8, 5];
  const precipitation = ['Low', 'Moderate', 'High', 'Very High', 'None'];
  const outlooks = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy', 'Clear'];
  
  return {
    location: destination,
    forecast_date: '2025-08-15',
    temperature: temperatures[Math.floor(Math.random() * temperatures.length)],
    precipitation: precipitation[Math.floor(Math.random() * precipitation.length)],
    outlook: outlooks[Math.floor(Math.random() * outlooks.length)]
  };
};

const generateHealthData = (destination: string) => {
  const riskLevels = ['Low', 'Medium', 'High', 'Very High'];
  const diseases = ['COVID-19', 'Dengue Fever', 'Malaria', 'Zika Virus', 'Yellow Fever', 'None Reported'];
  const advice = [
    'Standard precautions recommended',
    'Vaccination advised before travel',
    'Avoid mosquito-prone areas',
    'Monitor local health advisories',
    'No special precautions needed'
  ];
  
  return {
    disease: diseases[Math.floor(Math.random() * diseases.length)],
    country: destination,
    risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    date: '2025-08-15',
    advice: advice[Math.floor(Math.random() * advice.length)]
  };
};

const generateSecurityData = (destination: string) => {
  const eventTypes = ['Peaceful Protest', 'Political Rally', 'Cultural Event', 'No Major Events', 'Security Exercise'];
  const actors = ['Local Government', 'Civil Society', 'International Organizations', 'Private Sector', 'Community Groups'];
  const locations = ['City Center', 'University District', 'Business District', 'Residential Area', 'Downtown'];
  
  return {
    event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    country: destination,
    actors: actors[Math.floor(Math.random() * actors.length)],
    fatalities: 0,
    date: '2025-08-15',
    location: locations[Math.floor(Math.random() * locations.length)]
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    if (!destination) {
      return NextResponse.json({ error: 'Destination parameter is required' }, { status: 400 });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate comprehensive data
    const riskData = generateRiskData(destination);
    const travelDistance = generateTravelDistance(destination);
    const seasonalClimate = generateSeasonalClimateForecast(destination);
    const riskIndicators = generateComprehensiveRiskIndicators(destination);
    const newsData = generateNewsData(destination);
    const weatherData = generateWeatherData(destination);
    const healthData = generateHealthData(destination);
    const securityData = generateSecurityData(destination);

    const result = {
      destination,
      riskData,
      travelDistance,
      seasonalClimate,
      riskIndicators,
      newsData,
      weatherData,
      healthData,
      securityData
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
