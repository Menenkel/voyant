import { supabase } from './supabase';

export interface CountryData {
  country: string;
  ISO3: string;
  population_mio: number;
  global_peace_rank: number;
  population_electricity: number;
  inform_index: number;
  risk_class: string;
  global_rank: number;
  earthquake: number;
  river_flood: number;
  tsunami: number;
  tropical_storm: number;
  coastal_flood: number;
  drought: number;
  epidemic: number;
  projected_conflict: number;
  current_conflict: number;
  life_expectancy: number;
  gdp_per_capita_usd: number;
  number_of_earths: number;
  human_dev_index: number;
}

export async function searchCountries(query: string): Promise<CountryData[]> {
  try {
    const { data, error } = await supabase
      .from('Voyant')
      .select('*')
      .or(`country.ilike.%${query.toLowerCase()}%,ISO3.ilike.%${query.toLowerCase()}%`)
      .limit(10);

    if (error) {
      console.error('Supabase search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Database search error:', error);
    return [];
  }
}

export async function getCountryByISO(isoCode: string): Promise<CountryData | null> {
  try {
    const { data, error } = await supabase
      .from('Voyant')
      .select('*')
      .eq('ISO3', isoCode.toLowerCase())
      .single();

    if (error) {
      console.error('Supabase get country error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database get country error:', error);
    return null;
  }
}

export async function getCountryByName(countryName: string): Promise<CountryData | null> {
  try {
    const { data, error } = await supabase
      .from('Voyant')
      .select('*')
      .ilike('country', `%${countryName.toLowerCase()}%`)
      .single();

    if (error) {
      console.error('Supabase get country by name error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database get country by name error:', error);
    return null;
  }
}

// Enhanced search function that handles both countries and cities
export async function searchDestinations(query: string): Promise<CountryData[]> {
  try {
    // First try exact country match
    const { data: exactCountry, error: exactError } = await supabase
      .from('Voyant')
      .select('*')
      .ilike('country', query.toLowerCase())
      .limit(1);

    if (!exactError && exactCountry && exactCountry.length > 0) {
      return exactCountry;
    }

    // Then try partial country match
    const { data: partialCountry, error: partialError } = await supabase
      .from('Voyant')
      .select('*')
      .or(`country.ilike.%${query.toLowerCase()}%,ISO3.ilike.%${query.toLowerCase()}%`)
      .limit(5);

    if (!partialError && partialCountry && partialCountry.length > 0) {
      return partialCountry;
    }

    // If no country found, try to match cities to countries
    // This is a simplified approach - you can enhance this with a cities table later
    const { data: allCountries, error: allError } = await supabase
      .from('Voyant')
      .select('*')
      .limit(50);

    if (!allError && allCountries) {
      // Filter countries that might contain the city
      // This is a basic implementation - you can improve this with geocoding
      return allCountries.filter(country => 
        country.country.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(country.country.toLowerCase())
      ).slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Destination search error:', error);
    return [];
  }
}

// Function to get country data for a city (basic implementation)
export async function getCountryForCity(cityName: string): Promise<CountryData | null> {
  try {
    // This is a simplified approach - in a real implementation, you'd have a cities table
    // For now, we'll search for countries that might contain this city
    const { data, error } = await supabase
      .from('Voyant')
      .select('*')
      .or(`country.ilike.%${cityName}%`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Get country for city error:', error);
    return null;
  }
}

// Convert Supabase data to the format expected by your app
export function transformCountryData(countryData: CountryData) {
  // Generate realistic fake weather data
  const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
  const precipitationLevels = ['Low', 'Moderate', 'High'];
  const currentTemp = Math.floor(Math.random() * 35) + 5; // 5-40°C
  const currentWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const currentPrecipitation = precipitationLevels[Math.floor(Math.random() * precipitationLevels.length)];
  
  // Generate seasonal climate data
  const seasonalTemp = Math.floor(Math.random() * 30) + 10; // 10-40°C
  const tempTrends = ['Likely above average', 'Likely below average', 'Near average'];
  const precipTrends = ['Likely above average', 'Likely below average', 'Near average'];
  const seasonalTempTrend = tempTrends[Math.floor(Math.random() * tempTrends.length)];
  const seasonalPrecipTrend = precipTrends[Math.floor(Math.random() * precipTrends.length)];
  const precipitation = Math.floor(Math.random() * 300) + 50; // 50-350mm
  const rainyDays = Math.floor(Math.random() * 30) + 5; // 5-35 days
  
  // Generate water and air quality data
  const waterSafetyLevels = ['High', 'Medium', 'Low'];
  const drinkingAdvice = [
    'Safe to drink from tap',
    'Boil before drinking',
    'Use bottled water only',
    'Filter before drinking'
  ];
  const airQualityLevels = ['Good', 'Moderate', 'Poor', 'Very Poor'];
  
  const waterSafety = waterSafetyLevels[Math.floor(Math.random() * waterSafetyLevels.length)];
  const airQualityIndex = Math.floor(Math.random() * 150) + 20; // 20-170 AQI
  const airStatus = airQualityIndex < 50 ? 'Good' : 
                   airQualityIndex < 100 ? 'Moderate' : 
                   airQualityIndex < 150 ? 'Poor' : 'Very Poor';
  const drinkingAdviceText = drinkingAdvice[Math.floor(Math.random() * drinkingAdvice.length)];

  return {
    destination: countryData.country,
    // Supabase data
    supabaseData: {
      country: countryData.country,
      ISO3: countryData.ISO3,
      population_mio: countryData.population_mio,
      global_peace_rank: countryData.global_peace_rank,
      population_electricity: countryData.population_electricity,
      inform_index: countryData.inform_index,
      risk_class: countryData.risk_class,
      global_rank: countryData.global_rank,
      earthquake: countryData.earthquake,
      river_flood: countryData.river_flood,
      tsunami: countryData.tsunami,
      tropical_storm: countryData.tropical_storm,
      coastal_flood: countryData.coastal_flood,
      drought: countryData.drought,
      epidemic: countryData.epidemic,
      projected_conflict: countryData.projected_conflict,
      current_conflict: countryData.current_conflict,
      life_expectancy: countryData.life_expectancy,
      gdp_per_capita_usd: countryData.gdp_per_capita_usd,
      number_of_earths: countryData.number_of_earths,
      human_dev_index: countryData.human_dev_index
    },
    // Weather data
    weatherData: {
      location: countryData.country,
      forecast_date: new Date().toISOString().split('T')[0],
      temperature: currentTemp,
      precipitation: currentPrecipitation,
      outlook: currentWeather
    },
    // Seasonal climate
    seasonalClimate: {
      period: 'September - November 2025',
      temperature: {
        trend: seasonalTempTrend,
        average: seasonalTemp,
        min: Math.round(seasonalTemp - 8),
        max: Math.round(seasonalTemp + 8)
      },
      precipitation: {
        trend: seasonalPrecipTrend,
        average: precipitation,
        days: rainyDays
      }
    },
    // Water and air quality
    waterQuality: {
      safety_level: waterSafety,
      drinking_advice: drinkingAdviceText
    },
    airQuality: {
      aqi: airQualityIndex,
      status: airStatus
    }
  };
}

function getRiskClassColor(riskClass: string): string {
  switch (riskClass?.toLowerCase()) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-orange-400';
    case 'very high': return 'text-red-400';
    default: return 'text-yellow-400';
  }
}

function getRiskClassBg(riskClass: string): string {
  switch (riskClass?.toLowerCase()) {
    case 'low': return 'bg-green-400/10';
    case 'medium': return 'bg-yellow-400/10';
    case 'high': return 'bg-orange-400/10';
    case 'very high': return 'bg-red-400/10';
    default: return 'bg-yellow-400/10';
  }
}

function getRiskClassBorder(riskClass: string): string {
  switch (riskClass?.toLowerCase()) {
    case 'low': return 'border-green-400/30';
    case 'medium': return 'border-yellow-400/30';
    case 'high': return 'border-orange-400/30';
    case 'very high': return 'border-red-400/30';
    default: return 'border-yellow-400/30';
  }
}
