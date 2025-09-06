import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData, getComparisonData } from '@/lib/database';
import { getWikipediaData, getWikipediaDataForCountry } from '@/lib/wikipedia';
import { generateSummary } from '@/lib/chatgpt';
import { getWeatherForCity, getWeatherDescription, getAirQualityDescription, getWindSpeedDescription, getPM10Description, getUVIndexDescription, getOzoneDescription } from '@/lib/weather';

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
    let countryData = await getCountryByName(destination);
    console.log('getCountryByName result:', countryData);
    
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
        
        // Get city coordinates from the cities database
        const { getCountryISO3ForCity } = await import('@/lib/cities');
        const countryISO3 = await getCountryISO3ForCity(cityName);
        if (countryISO3) {
          // Get city coordinates from the cities CSV data
          const { searchCities } = await import('@/lib/cities');
          const cities = await searchCities(cityName, 1);
          if (cities.length > 0) {
            cityCoordinates = {
              lat: cities[0].lat,
              lng: cities[0].lng,
              cityName: cities[0].city
            };
            console.log('Found city coordinates:', cityCoordinates);
          }
        }
      }
      
      const result = transformCountryData(countryData, cityCoordinates || undefined);
      const comparisonData = await getComparisonData(countryData);
      
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
      
      // Generate ChatGPT summary
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
          !!cityCoordinates // isCityQuery: true if city coordinates were found
        );
      } catch (error) {
        console.error('ChatGPT summary generation error:', error);
        chatgptSummary = 'Summary generation temporarily unavailable.';
      }

      // Get real weather data from Open-Meteo
      let realWeatherData = null;
      try {
        const weatherCity = result.destination || destination;
        console.log(`Fetching real weather data for: ${weatherCity}`);
        const weatherData = await getWeatherForCity(weatherCity);
        
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
            next_24h: {
              max_temp: Math.round(Math.max(...weatherData.hourly.temperature_2m.slice(0, 24))),
              min_temp: Math.round(Math.min(...weatherData.hourly.temperature_2m.slice(0, 24))),
              total_precipitation: Math.round(weatherData.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0) * 10) / 10,
              avg_wind_speed: Math.round(weatherData.hourly.wind_speed_10m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24 * 10) / 10
            },
            next_16_days: weatherData.daily.time.slice(0, 16).map((date, index) => ({
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
      
      console.log('Transformed result:', result);
      return NextResponse.json({
        ...result,
        comparisonData,
        chatgptSummary,
        realWeatherData
      });
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
        overall_risk: Math.floor(Math.random() * 10) + 1,
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
          global_peace_index: Math.floor(Math.random() * 163) + 1,
          fragile_states_index: Math.floor(Math.random() * 179) + 1,
          corruption_index: Math.floor(Math.random() * 180) + 1
        }
      },
      newsData: [
        {
          title: `Tourism Boom: ${destination} Sees Record Visitor Numbers`,
          summary: 'Tourist arrivals increase by 25% as travelers flock to experience local attractions and cultural sites.',
          source: 'Global News Network',
          publishedAt: '2025-08-15T10:30:00Z'
        },
        {
          title: `Weather Alert: Severe Storm System Approaches ${destination}`,
          summary: 'Heavy rainfall and strong winds expected to impact travel and outdoor activities in the region.',
          source: 'International Herald',
          publishedAt: '2025-08-14T14:20:00Z'
        },
        {
          title: `Security Update: Increased Police Presence in ${destination} Tourist Areas`,
          summary: 'Authorities enhance security measures following recent incidents in popular tourist districts.',
          source: 'National Post',
          publishedAt: '2025-08-13T09:15:00Z'
        }
      ],
      weatherData: {
        location: destination,
        forecast_date: '2025-08-15',
        temperature: Math.floor(Math.random() * 30) + 5,
        precipitation: 'Low',
        outlook: 'Sunny'
      },
      healthData: {
        disease: 'COVID-19',
        country: destination,
        risk_level: 'Low',
        date: '2025-08-15',
        advice: 'Standard precautions recommended'
      },
      securityData: {
        event_type: 'Peaceful Protest',
        country: destination,
        actors: 'Local Government',
        fatalities: 0,
        date: '2025-08-15',
        location: 'City Center'
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
