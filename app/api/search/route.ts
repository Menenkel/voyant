import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData, getComparisonData, getCountriesWithSimilarRankings } from '@/lib/database';
import { getWikipediaData, getWikipediaDataForCountry, getWikipediaContentForPopCulture } from '@/lib/wikipedia';
import { generateSummary, generateCityFunFact, generateLanguagesAndCurrency, generatePopulationData } from '@/lib/chatgpt';
import { getWeatherForCity, getWeatherForCoordinates, getWeatherDescription, getAirQualityDescription, getWindSpeedDescription, getPM10Description, getUVIndexDescription, getOzoneDescription, generateWeatherAlerts } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    console.log('=== SEARCH API CALLED ===');
    console.log('Searching for:', destination);

    if (!destination) {
      return NextResponse.json({ error: 'Destination parameter is required' }, { status: 400 });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Try to find the destination in Supabase first
    let countryData = null;
    
    // If it's a city,country format, search for the country first
    if (destination.includes(',')) {
      const parts = destination.split(',').map(part => part.trim());
      const countryName = parts[1];
      countryData = await getCountryByName(countryName);
      console.log('getCountryByName result for country:', countryName, countryData);
    } else {
      // For country-only searches, search directly
      countryData = await getCountryByName(destination);
      console.log('getCountryByName result:', countryData);
    }
    
    // If not found, try searching for partial matches and cities
    if (!countryData) {
      const searchResults = await searchDestinations(destination);
      console.log('searchDestinations results:', searchResults);
      if (searchResults.length > 0) {
        countryData = searchResults[0]; // Use the first match
      }
    }

    // If we found data in Supabase, use it
    if (countryData) {
      console.log('Found country data:', countryData);
      
      // Check if this is a city search and get coordinates
      let cityCoordinates = null;
      if (destination.includes(',')) {
        const parts = destination.split(',').map(part => part.trim());
        const cityName = parts[0];
        const countryName = parts[1];
        
        // Get city coordinates from the cities database within the specific country
        const { searchCityInCountry } = await import('@/lib/cities');
        const cityData = await searchCityInCountry(cityName, countryData.ISO3);
        if (cityData) {
          cityCoordinates = {
            lat: cityData.lat,
            lng: cityData.lng,
            cityName: cityData.city
          };
          console.log('Found city coordinates:', cityCoordinates);
        }
      }
      
      // Get languages and currency from ChatGPT
      let languagesAndCurrency = null;
      try {
        languagesAndCurrency = await generateLanguagesAndCurrency(countryData.country);
        console.log(`Languages and currency fetched for ${countryData.country}:`, languagesAndCurrency);
      } catch (error) {
        console.error('ChatGPT languages/currency fetch error:', error);
      }
      
      // Get population data from ChatGPT (override Supabase data if it's 0 or incorrect)
      let populationData = null;
      if (countryData.population_mio === 0) {
        try {
          populationData = await generatePopulationData(countryData.country, false);
          console.log(`Population data fetched for ${countryData.country}:`, populationData);
          // Override the Supabase population data
          countryData.population_mio = populationData.population;
        } catch (error) {
          console.error('ChatGPT population fetch error:', error);
        }
      }
      
      // Get city population data if it's a city search
      let cityPopulationData = null;
      if (cityCoordinates && destination.includes(',')) {
        const cityName = destination.split(',')[0].trim();
        try {
          cityPopulationData = await generatePopulationData(cityName, true);
          console.log(`City population data fetched for ${cityName}:`, cityPopulationData);
        } catch (error) {
          console.error('ChatGPT city population fetch error:', error);
        }
      }
      
      const result = transformCountryData(countryData, cityCoordinates || undefined, destination, languagesAndCurrency, cityPopulationData);
      const comparisonData = await getComparisonData(countryData);
      
      // Get countries with similar rankings for better context
      const similarRankings = await getCountriesWithSimilarRankings(
        countryData.global_rank,
        countryData.global_peace_rank,
        countryData.country
      );
      
      // Merge the similar rankings data with existing comparison data
      const enhancedComparisonData = {
        ...comparisonData,
        ...similarRankings,
        gdpSimilar: comparisonData.gdpSimilar || []
      };
      
      // Get Wikipedia data for summarization
      let wikipediaData = null;
      try {
        if (destination.includes(',')) {
          // It's a city search
          wikipediaData = await getWikipediaData(destination);
        } else {
          // It's a country search
          wikipediaData = await getWikipediaDataForCountry(destination);
        }
      } catch (error) {
        console.error('Wikipedia data fetch error:', error);
      }

      // Get real weather data from Open-Meteo FIRST
      let realWeatherData = null;
      let weatherData: any = null;
      try {
        const weatherCity = result.destination || destination;
        console.log(`Fetching real weather data for: ${weatherCity}`);
        
        // Always use Open-Meteo's geocoding API for weather data to ensure accuracy
        weatherData = await getWeatherForCity(weatherCity);
        
        realWeatherData = {
          location: weatherData.city,
          coordinates: weatherData.coordinates,
          current: {
            temperature: Math.round(weatherData.current.temperature),
            apparent_temperature: Math.round(weatherData.current.apparent_temperature),
            precipitation: weatherData.current.precipitation,
            wind_speed: Math.round(weatherData.current.wind_speed * 10) / 10,
            humidity: weatherData.current.humidity,
            weather_code: weatherData.current.weather_code,
            weather_description: getWeatherDescription(weatherData.current.weather_code),
            wind_description: getWindSpeedDescription(weatherData.current.wind_speed),
            time: weatherData.current.time
          },
          forecast: {
            next_24h: (() => {
              const hourlyTemps = weatherData.hourly.temperature_2m.slice(0, 24);
              const maxTemp = Math.max(...hourlyTemps);
              const minTemp = Math.min(...hourlyTemps);
              
              // If max and min are too close (within 1 degree), use daily data for better variation
              if (Math.abs(maxTemp - minTemp) < 1 && weatherData.daily.temperature_2m_max.length > 0) {
                return {
                  max_temp: Math.round(weatherData.daily.temperature_2m_max[0]),
                  min_temp: Math.round(weatherData.daily.temperature_2m_min[0]),
                  total_precipitation: Math.round(weatherData.hourly.precipitation.slice(0, 24).reduce((sum: number, val: number) => sum + val, 0) * 10) / 10,
                  avg_wind_speed: Math.round(weatherData.hourly.wind_speed_10m.slice(0, 24).reduce((sum: number, val: number) => sum + val, 0) / 24 * 10) / 10
                };
              }
              
              return {
                max_temp: Math.round(maxTemp),
                min_temp: Math.round(minTemp),
                total_precipitation: Math.round(weatherData.hourly.precipitation.slice(0, 24).reduce((sum: number, val: number) => sum + val, 0) * 10) / 10,
                avg_wind_speed: Math.round(weatherData.hourly.wind_speed_10m.slice(0, 24).reduce((sum: number, val: number) => sum + val, 0) / 24 * 10) / 10
              };
            })(),
            next_16_days: weatherData.daily.time.slice(0, 16).map((date: string, index: number) => ({
              date,
              max_temp: Math.round(weatherData.daily.temperature_2m_max[index]),
              min_temp: Math.round(weatherData.daily.temperature_2m_min[index]),
              precipitation: Math.round(weatherData.daily.precipitation_sum[index] * 10) / 10,
              wind_speed: Math.round(weatherData.daily.wind_speed_10m_max[index] * 10) / 10,
              weather_code: weatherData.daily.weather_code[index],
              weather_description: getWeatherDescription(weatherData.daily.weather_code[index])
            }))
          },
          air_quality: weatherData.air_quality ? {
            pm10: Math.round(weatherData.air_quality.pm10 * 10) / 10,
            pm2_5: Math.round(weatherData.air_quality.pm2_5 * 10) / 10,
            carbon_monoxide: Math.round(weatherData.air_quality.carbon_monoxide * 10) / 10,
            nitrogen_dioxide: Math.round(weatherData.air_quality.nitrogen_dioxide * 10) / 10,
            sulphur_dioxide: Math.round(weatherData.air_quality.sulphur_dioxide * 10) / 10,
            ozone: Math.round(weatherData.air_quality.ozone * 10) / 10,
            dust: Math.round(weatherData.air_quality.dust * 10) / 10,
            uv_index: Math.round(weatherData.air_quality.uv_index * 10) / 10,
            pm2_5_description: getAirQualityDescription(weatherData.air_quality.pm2_5),
            pm10_description: getPM10Description(weatherData.air_quality.pm10),
            uv_index_description: getUVIndexDescription(weatherData.air_quality.uv_index),
            ozone_description: getOzoneDescription(weatherData.air_quality.ozone)
          } : null
        };
        
        console.log(`Real weather data successfully fetched for ${weatherCity}`);
      } catch (error) {
        console.error('Weather data fetch error:', error);
        // Keep the existing mock weather data if real data fails
      }
      
      // Generate weather alerts from the same weather data used for forecast
      let weatherAlerts = null;
      if (realWeatherData && weatherData) {
        try {
          // Reuse the same weatherData that was fetched for the forecast
          weatherAlerts = generateWeatherAlerts(weatherData, 7); // 7-day alerts
          console.log(`Weather alerts generated for ${result.destination || destination}`);
        } catch (error) {
          console.error('Weather alerts generation error:', error);
        }
      }
      
      // Generate ChatGPT summary WITH weather data
      let chatgptSummary = null;
      try {
        chatgptSummary = await generateSummary(
          countryData,
          wikipediaData,
          result.destination || destination,
          false,
          undefined,
          undefined,
          undefined,
          !!cityCoordinates, // isCityQuery: true if city coordinates were found
          realWeatherData // Pass weather data to ChatGPT
        );
      } catch (error) {
        console.error('ChatGPT summary generation error:', error);
        chatgptSummary = 'Summary generation temporarily unavailable.';
      }
      
      // Generate city-specific fun fact if this is a city query
      let cityFunFact = null;
      if (cityCoordinates) {
        try {
          const cityName = cityCoordinates.cityName || destination.split(',')[0].trim();
          const countryName = countryData.country;
          
          // Get enhanced Wikipedia content for pop culture facts
          const popCultureWikipediaData = await getWikipediaContentForPopCulture(cityName, countryName);
          
          cityFunFact = await generateCityFunFact(cityName, countryName, popCultureWikipediaData || wikipediaData);
          console.log(`City fun fact generated for ${cityName}, ${countryName}`);
        } catch (error) {
          console.error('City fun fact generation error:', error);
          cityFunFact = 'Fun fact generation temporarily unavailable.';
        }
      }
      
      console.log('Transformed result:', result);
      // Override fun_fact with city-specific fun fact if available
      const finalResult = {
        ...result,
        fun_fact: cityFunFact || result.fun_fact,
        comparisonData: enhancedComparisonData,
        chatgptSummary,
        realWeatherData,
        weatherAlerts
      };
      
      return NextResponse.json(finalResult);
    }

    console.log('No country data found, falling back to mock data');
    // Fallback to mock data for countries not in the database
    const result = {
      destination,
      riskData: {
        hazard_score: Math.floor(Math.random() * 10) + 1,
        vulnerability_score: Math.floor(Math.random() * 10) + 1,
        coping_capacity: Math.floor(Math.random() * 10) + 1,
        overall_risk: Math.floor(Math.random() * 10) + 1
      },
      travelDistance: {
        name: 'Nearest International Airport',
        distance: Math.floor(Math.random() * 40) + 10,
        public_transport: Math.floor(Math.random() * 60) + 20,
        car: Math.floor(Math.random() * 40) + 15
      },
      seasonalClimate: {
        period: 'September - November 2025',
        temperature: {
          trend: 'Likely above average',
          average: Math.floor(Math.random() * 30) + 5,
          min: Math.floor(Math.random() * 15) + 0,
          max: Math.floor(Math.random() * 20) + 20
        },
        precipitation: {
          trend: 'Near average',
          average: Math.floor(Math.random() * 200) + 50,
          days: Math.floor(Math.random() * 30) + 10
        }
      },
      riskIndicators: {
        risk_class: { class: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
        peace_index: { rank: Math.floor(Math.random() * 100) + 50, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
        corruption_index: { score: Math.floor(Math.random() * 50) + 30, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
        fragile_states: { score: Math.floor(Math.random() * 50) + 30, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' }
      },
      healthData: {
        water_quality: { level: 'Medium', advice: 'Boil before drinking', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
        health_risks: { level: 'Low', diseases: ['Common cold', 'Traveler\'s diarrhea'], color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' }
      },
      securityData: {
        status: 'Stable',
        current_events: ['Normal operations', 'Tourist areas safe'],
        advice: 'Exercise normal precautions'
      },
      newsUpdates: [
        {
          title: 'Travel Advisory Update',
          summary: 'No significant changes to travel recommendations',
          date: new Date().toISOString().split('T')[0],
          source: 'Travel Advisory'
        }
      ],
      chatgptSummary: 'This destination is not currently in our database. Please check back later for updated information.'
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}