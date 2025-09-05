import { supabase } from './supabase';
import { searchCities, getCountryISO3ForCity } from './cities';

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
  human_dev_index: number;
  fun_fact: string;
}

export interface ComparisonData {
  informSimilar: { country: string; value: number }[];
  globalRankAbove: { country: string; rank: number }[];
  globalRankBelow: { country: string; rank: number }[];
  peaceRankAbove: { country: string; rank: number }[];
  peaceRankBelow: { country: string; rank: number }[];
}

export async function searchCountries(query: string): Promise<CountryData[]> {
  try {
    const { data, error } = await supabase
      .from('Voyant2')
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
      .from('Voyant2')
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
      .from('Voyant2')
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
    console.log('searchDestinations called with:', query);
    
    // Handle city,country format (e.g., "Berlin, Germany")
    if (query.includes(',')) {
      const parts = query.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      console.log('Detected city,country format:', { cityName, countryName });
      
      // First try to find the country by name
      const { data: countryData, error: countryError } = await supabase
        .from('Voyant2')
        .select('*')
        .ilike('country', countryName.toLowerCase())
        .limit(1);

      if (!countryError && countryData && countryData.length > 0) {
        console.log('Found country by name:', countryData[0].country);
        return countryData;
      }
      
      // If country not found by name, try city search
      const countryISO3 = await getCountryISO3ForCity(cityName);
      if (countryISO3) {
        const { data: cityCountry, error: cityError } = await supabase
          .from('Voyant2')
          .select('*')
          .eq('ISO3', countryISO3)
          .limit(1);

        if (!cityError && cityCountry && cityCountry.length > 0) {
          console.log('Found country by city ISO3:', cityCountry[0].country);
          return cityCountry;
        }
      }
    }

    // First try exact country match
    const { data: exactCountry, error: exactError } = await supabase
      .from('Voyant2')
      .select('*')
      .ilike('country', query.toLowerCase())
      .limit(1);

    if (!exactError && exactCountry && exactCountry.length > 0) {
      console.log('Found exact country match:', exactCountry[0].country);
      return exactCountry;
    }

    // Then try partial country match
    const { data: partialCountry, error: partialError } = await supabase
      .from('Voyant2')
      .select('*')
      .or(`country.ilike.%${query.toLowerCase()}%,ISO3.ilike.%${query.toLowerCase()}%`)
      .limit(5);

    if (!partialError && partialCountry && partialCountry.length > 0) {
      console.log('Found partial country match:', partialCountry[0].country);
      return partialCountry;
    }

    // If no country found, try city search
    const countryISO3 = await getCountryISO3ForCity(query);
    if (countryISO3) {
      const { data: cityCountry, error: cityError } = await supabase
        .from('Voyant2')
        .select('*')
        .eq('ISO3', countryISO3)
        .limit(1);

      if (!cityError && cityCountry && cityCountry.length > 0) {
        console.log('Found country by city search:', cityCountry[0].country);
        return cityCountry;
      }
    }

    // Fallback: search for countries that might contain the query
    const { data: allCountries, error: allError } = await supabase
      .from('Voyant2')
      .select('*')
      .limit(50);

    if (!allError && allCountries) {
      const filtered = allCountries.filter(country => 
        country.country.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(country.country.toLowerCase())
      ).slice(0, 5);
      
      if (filtered.length > 0) {
        console.log('Found country by fallback search:', filtered[0].country);
        return filtered;
      }
    }

    console.log('No country found for query:', query);
    return [];
  } catch (error) {
    console.error('Destination search error:', error);
    return [];
  }
}

// Function to get country data for a city
export async function getCountryForCity(cityName: string): Promise<CountryData | null> {
  try {
    // Get the country ISO3 code for the city
    const countryISO3 = await getCountryISO3ForCity(cityName);
    
    if (!countryISO3) {
      return null;
    }

    // Get the country data using the ISO3 code
    const { data, error } = await supabase
      .from('Voyant2')
      .select('*')
      .eq('ISO3', countryISO3)
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
export function transformCountryData(countryData: CountryData, cityCoordinates?: { lat: number; lng: number; cityName?: string }) {
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
    destination: cityCoordinates?.cityName || countryData.country,
    fun_fact: countryData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available',
    coordinates: cityCoordinates,
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
      human_dev_index: countryData.human_dev_index,
      fun_fact: countryData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'
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

// Get comparison data for a country
export async function getComparisonData(countryData: CountryData): Promise<ComparisonData> {
  try {
    // Get all countries for comparison
    const { data: allCountries, error } = await supabase
      .from('Voyant2')
      .select('*')
      .order('inform_index', { ascending: true });

    if (error || !allCountries) {
      return {
        informSimilar: [],
        globalRankAbove: [],
        globalRankBelow: [],
        peaceRankAbove: [],
        peaceRankBelow: []
      };
    }

    // Find countries with similar INFORM index (closest values)
    const informSimilar = allCountries
      .filter(country => country.ISO3 !== countryData.ISO3)
      .map(country => ({
        country: country.country,
        value: country.inform_index,
        distance: Math.abs(country.inform_index - countryData.inform_index)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(country => ({
        country: country.country,
        value: country.value
      }));

    // Find countries above and below in global rank (closest available ranks)
    const currentGlobalRank = parseInt(countryData.global_rank) || 0;
    
    // Find countries with the closest rank below current (directly above)
    const globalRankAbove = allCountries
      .filter(country => {
        const rank = parseInt(country.global_rank) || 0;
        return rank < currentGlobalRank && rank > 0;
      })
      .sort((a, b) => parseInt(b.global_rank) - parseInt(a.global_rank))
      .slice(0, 1)
      .map(country => ({
        country: country.country,
        rank: parseInt(country.global_rank)
      }));

    // Find countries with the closest rank above current (directly below)
    const globalRankBelow = allCountries
      .filter(country => {
        const rank = parseInt(country.global_rank) || 0;
        return rank > currentGlobalRank && rank > 0;
      })
      .sort((a, b) => parseInt(a.global_rank) - parseInt(b.global_rank))
      .slice(0, 1)
      .map(country => ({
        country: country.country,
        rank: parseInt(country.global_rank)
      }));

    // Find countries above and below in peace rank (closest available ranks)
    const currentPeaceRank = countryData.global_peace_rank || 0;
    
    // Find countries with the closest peace rank below current (directly above)
    const peaceRankAbove = allCountries
      .filter(country => 
        country.global_peace_rank < currentPeaceRank && country.global_peace_rank > 0
      )
      .sort((a, b) => b.global_peace_rank - a.global_peace_rank)
      .slice(0, 1)
      .map(country => ({
        country: country.country,
        rank: country.global_peace_rank
      }));

    // Find countries with the closest peace rank above current (directly below)
    const peaceRankBelow = allCountries
      .filter(country => 
        country.global_peace_rank > currentPeaceRank && country.global_peace_rank > 0
      )
      .sort((a, b) => a.global_peace_rank - b.global_peace_rank)
      .slice(0, 1)
      .map(country => ({
        country: country.country,
        rank: country.global_peace_rank
      }));

    return {
      informSimilar,
      globalRankAbove,
      globalRankBelow,
      peaceRankAbove,
      peaceRankBelow
    };
  } catch (error) {
    console.error('Error getting comparison data:', error);
    return {
      informSimilar: [],
      globalRankAbove: [],
      globalRankBelow: [],
      peaceRankAbove: [],
      peaceRankBelow: []
    };
  }
}
