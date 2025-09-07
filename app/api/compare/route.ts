import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData } from '@/lib/database';
import { getWikipediaData, getWikipediaDataForCountry } from '@/lib/wikipedia';
import { generateSummary, generateCityFunFact } from '@/lib/chatgpt';
import { getWeatherForCity, getWeatherForCoordinates, getWeatherDescription, getAirQualityDescription, getWindSpeedDescription, getPM10Description, getUVIndexDescription, getOzoneDescription, generateWeatherAlerts } from '@/lib/weather';

export async function POST(request: NextRequest) {
  try {
    const { firstDestination, secondDestination } = await request.json();

    console.log('=== COMPARISON API CALLED ===');
    console.log('Comparing:', firstDestination, 'vs', secondDestination);

    if (!firstDestination || !secondDestination) {
      return NextResponse.json({ error: 'Both destinations are required' }, { status: 400 });
    }

    // Get data for first destination
    let firstCountryData = null;
    if (firstDestination.includes(',')) {
      const parts = firstDestination.split(',').map(part => part.trim());
      const countryName = parts[1];
      firstCountryData = await getCountryByName(countryName);
    } else {
      firstCountryData = await getCountryByName(firstDestination);
    }
    if (!firstCountryData) {
      const firstResults = await searchDestinations(firstDestination);
      if (firstResults.length > 0) {
        firstCountryData = firstResults[0];
      }
    }

    // Get data for second destination
    let secondCountryData = null;
    if (secondDestination.includes(',')) {
      const parts = secondDestination.split(',').map(part => part.trim());
      const countryName = parts[1];
      secondCountryData = await getCountryByName(countryName);
    } else {
      secondCountryData = await getCountryByName(secondDestination);
    }
    if (!secondCountryData) {
      const secondResults = await searchDestinations(secondDestination);
      if (secondResults.length > 0) {
        secondCountryData = secondResults[0];
      }
    }

    if (!firstCountryData || !secondCountryData) {
      return NextResponse.json({ error: 'Could not find data for one or both destinations' }, { status: 404 });
    }

    // Get city coordinates for both destinations
    let firstCityCoordinates = null;
    let secondCityCoordinates = null;

    if (firstDestination.includes(',')) {
      const parts = firstDestination.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      const { searchCityInCountry } = await import('@/lib/cities');
      const cityData = await searchCityInCountry(cityName, firstCountryData.ISO3);
      if (cityData) {
        firstCityCoordinates = {
          lat: cityData.lat,
          lng: cityData.lng,
          cityName: cityData.city
        };
      }
    }

    if (secondDestination.includes(',')) {
      const parts = secondDestination.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      const { searchCityInCountry } = await import('@/lib/cities');
      const cityData = await searchCityInCountry(cityName, secondCountryData.ISO3);
      if (cityData) {
        secondCityCoordinates = {
          lat: cityData.lat,
          lng: cityData.lng,
          cityName: cityData.city
        };
      }
    }

    const firstResult = transformCountryData(firstCountryData, firstCityCoordinates || undefined, firstDestination);
    const secondResult = transformCountryData(secondCountryData, secondCityCoordinates || undefined, secondDestination);

    // Get Wikipedia data for both destinations
    let firstWikipediaData = null;
    let secondWikipediaData = null;

    try {
      if (firstDestination.includes(',')) {
        firstWikipediaData = await getWikipediaData(firstDestination);
      } else {
        firstWikipediaData = await getWikipediaDataForCountry(firstDestination);
      }
    } catch (error) {
      console.error('First Wikipedia data fetch error:', error);
    }

    try {
      if (secondDestination.includes(',')) {
        secondWikipediaData = await getWikipediaData(secondDestination);
      } else {
        secondWikipediaData = await getWikipediaDataForCountry(secondDestination);
      }
    } catch (error) {
      console.error('Second Wikipedia data fetch error:', error);
    }

    // Get real weather data for both destinations FIRST
    let firstWeatherData = null;
    let secondWeatherData = null;
    let weatherData1: any = null;
    let weatherData2: any = null;

    try {
      const firstWeatherCity = firstResult.destination || firstDestination;
      console.log(`Fetching weather data for first destination: ${firstWeatherCity}`);
      
      // Use coordinates if available, otherwise geocode the city name
      if (firstCityCoordinates) {
        console.log(`Using coordinates for first destination: ${firstCityCoordinates.lat}, ${firstCityCoordinates.lng}`);
        weatherData1 = await getWeatherForCoordinates(firstCityCoordinates.lat, firstCityCoordinates.lng, firstWeatherCity);
      } else {
        weatherData1 = await getWeatherForCity(firstWeatherCity);
      }
      
      firstWeatherData = {
        location: weatherData1.city,
        coordinates: weatherData1.coordinates,
        current: {
          temperature: Math.round(weatherData1.current.temperature),
          apparent_temperature: Math.round(weatherData1.current.apparent_temperature),
          precipitation: weatherData1.current.precipitation,
          wind_speed: Math.round(weatherData1.current.wind_speed * 10) / 10,
          humidity: weatherData1.current.humidity,
          weather_code: weatherData1.current.weather_code,
          weather_description: getWeatherDescription(weatherData1.current.weather_code),
          wind_description: getWindSpeedDescription(weatherData1.current.wind_speed),
          time: weatherData1.current.time
        },
        forecast: {
          next_24h: {
            max_temp: Math.round(Math.max(...weatherData1.hourly.temperature_2m.slice(0, 24))),
            min_temp: Math.round(Math.min(...weatherData1.hourly.temperature_2m.slice(0, 24))),
            total_precipitation: Math.round(weatherData1.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0) * 10) / 10,
            avg_wind_speed: Math.round(weatherData1.hourly.wind_speed_10m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24 * 10) / 10
          },
          next_16_days: weatherData1.daily.time.slice(0, 16).map((date, index) => ({
            date,
            max_temp: Math.round(weatherData1.daily.temperature_2m_max[index]),
            min_temp: Math.round(weatherData1.daily.temperature_2m_min[index]),
            precipitation: Math.round(weatherData1.daily.precipitation_sum[index] * 10) / 10,
            wind_speed: Math.round(weatherData1.daily.wind_speed_10m_max[index] * 10) / 10,
            weather_code: weatherData1.daily.weather_code[index],
            weather_description: getWeatherDescription(weatherData1.daily.weather_code[index])
          }))
        },
        air_quality: weatherData1.air_quality ? {
          pm10: Math.round(weatherData1.air_quality.pm10 * 10) / 10,
          pm2_5: Math.round(weatherData1.air_quality.pm2_5 * 10) / 10,
          carbon_monoxide: Math.round(weatherData1.air_quality.carbon_monoxide * 10) / 10,
          nitrogen_dioxide: Math.round(weatherData1.air_quality.nitrogen_dioxide * 10) / 10,
          sulphur_dioxide: Math.round(weatherData1.air_quality.sulphur_dioxide * 10) / 10,
          ozone: Math.round(weatherData1.air_quality.ozone * 10) / 10,
          dust: Math.round(weatherData1.air_quality.dust * 10) / 10,
          uv_index: Math.round(weatherData1.air_quality.uv_index * 10) / 10,
          pm2_5_description: getAirQualityDescription(weatherData1.air_quality.pm2_5),
          pm10_description: getPM10Description(weatherData1.air_quality.pm10),
          uv_index_description: getUVIndexDescription(weatherData1.air_quality.uv_index),
          ozone_description: getOzoneDescription(weatherData1.air_quality.ozone)
        } : null
      };
      
      console.log(`Weather data successfully fetched for first destination: ${firstWeatherCity}`);
    } catch (error) {
      console.error('First destination weather data fetch error:', error);
    }

    try {
      const secondWeatherCity = secondResult.destination || secondDestination;
      console.log(`Fetching weather data for second destination: ${secondWeatherCity}`);
      
      // Use coordinates if available, otherwise geocode the city name
      if (secondCityCoordinates) {
        console.log(`Using coordinates for second destination: ${secondCityCoordinates.lat}, ${secondCityCoordinates.lng}`);
        weatherData2 = await getWeatherForCoordinates(secondCityCoordinates.lat, secondCityCoordinates.lng, secondWeatherCity);
      } else {
        weatherData2 = await getWeatherForCity(secondWeatherCity);
      }
      
      secondWeatherData = {
        location: weatherData2.city,
        coordinates: weatherData2.coordinates,
        current: {
          temperature: Math.round(weatherData2.current.temperature),
          apparent_temperature: Math.round(weatherData2.current.apparent_temperature),
          precipitation: weatherData2.current.precipitation,
          wind_speed: Math.round(weatherData2.current.wind_speed * 10) / 10,
          humidity: weatherData2.current.humidity,
          weather_code: weatherData2.current.weather_code,
          weather_description: getWeatherDescription(weatherData2.current.weather_code),
          wind_description: getWindSpeedDescription(weatherData2.current.wind_speed),
          time: weatherData2.current.time
        },
        forecast: {
          next_24h: {
            max_temp: Math.round(Math.max(...weatherData2.hourly.temperature_2m.slice(0, 24))),
            min_temp: Math.round(Math.min(...weatherData2.hourly.temperature_2m.slice(0, 24))),
            total_precipitation: Math.round(weatherData2.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0) * 10) / 10,
            avg_wind_speed: Math.round(weatherData2.hourly.wind_speed_10m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24 * 10) / 10
          },
          next_16_days: weatherData2.daily.time.slice(0, 16).map((date, index) => ({
            date,
            max_temp: Math.round(weatherData2.daily.temperature_2m_max[index]),
            min_temp: Math.round(weatherData2.daily.temperature_2m_min[index]),
            precipitation: Math.round(weatherData2.daily.precipitation_sum[index] * 10) / 10,
            wind_speed: Math.round(weatherData2.daily.wind_speed_10m_max[index] * 10) / 10,
            weather_code: weatherData2.daily.weather_code[index],
            weather_description: getWeatherDescription(weatherData2.daily.weather_code[index])
          }))
        },
        air_quality: weatherData2.air_quality ? {
          pm10: Math.round(weatherData2.air_quality.pm10 * 10) / 10,
          pm2_5: Math.round(weatherData2.air_quality.pm2_5 * 10) / 10,
          carbon_monoxide: Math.round(weatherData2.air_quality.carbon_monoxide * 10) / 10,
          nitrogen_dioxide: Math.round(weatherData2.air_quality.nitrogen_dioxide * 10) / 10,
          sulphur_dioxide: Math.round(weatherData2.air_quality.sulphur_dioxide * 10) / 10,
          ozone: Math.round(weatherData2.air_quality.ozone * 10) / 10,
          dust: Math.round(weatherData2.air_quality.dust * 10) / 10,
          uv_index: Math.round(weatherData2.air_quality.uv_index * 10) / 10,
          pm2_5_description: getAirQualityDescription(weatherData2.air_quality.pm2_5),
          pm10_description: getPM10Description(weatherData2.air_quality.pm10),
          uv_index_description: getUVIndexDescription(weatherData2.air_quality.uv_index),
          ozone_description: getOzoneDescription(weatherData2.air_quality.ozone)
        } : null
      };
      
      console.log(`Weather data successfully fetched for second destination: ${secondWeatherCity}`);
    } catch (error) {
      console.error('Second destination weather data fetch error:', error);
    }

    // Generate weather alerts for both destinations
    let firstWeatherAlerts = null;
    let secondWeatherAlerts = null;
    
    if (firstWeatherData && weatherData1) {
      try {
        // Reuse the same weatherData1 that was fetched for the forecast
        firstWeatherAlerts = generateWeatherAlerts(weatherData1, 7);
        console.log(`Weather alerts generated for first destination: ${firstResult.destination || firstDestination}`);
      } catch (error) {
        console.error('First destination weather alerts generation error:', error);
      }
    }
    
    if (secondWeatherData && weatherData2) {
      try {
        // Reuse the same weatherData2 that was fetched for the forecast
        secondWeatherAlerts = generateWeatherAlerts(weatherData2, 7);
        console.log(`Weather alerts generated for second destination: ${secondResult.destination || secondDestination}`);
      } catch (error) {
        console.error('Second destination weather alerts generation error:', error);
      }
    }

    // Generate comparison summary WITH weather data
    let comparisonSummary = null;
    try {
      comparisonSummary = await generateSummary(
        firstCountryData,
        firstWikipediaData,
        firstResult.destination || firstDestination,
        true, // isComparison = true
        secondCountryData,
        secondWikipediaData,
        secondResult.destination || secondDestination,
        !!(firstCityCoordinates || secondCityCoordinates), // isCityQuery: true if either destination has city coordinates
        firstWeatherData, // Pass first weather data to ChatGPT
        secondWeatherData // Pass second weather data to ChatGPT
      );
    } catch (error) {
      console.error('ChatGPT comparison summary generation error:', error);
      comparisonSummary = 'Comparison summary generation temporarily unavailable.';
    }

    // Generate city-specific fun facts for both destinations if they are city queries
    let firstCityFunFact = null;
    let secondCityFunFact = null;
    
    if (firstCityCoordinates) {
      try {
        const cityName = firstCityCoordinates.cityName || firstDestination.split(',')[0].trim();
        const countryName = firstCountryData.country;
        firstCityFunFact = await generateCityFunFact(cityName, countryName, firstWikipediaData);
        console.log(`First destination city fun fact generated for ${cityName}, ${countryName}`);
      } catch (error) {
        console.error('First destination city fun fact generation error:', error);
        firstCityFunFact = 'Fun fact generation temporarily unavailable.';
      }
    }
    
    if (secondCityCoordinates) {
      try {
        const cityName = secondCityCoordinates.cityName || secondDestination.split(',')[0].trim();
        const countryName = secondCountryData.country;
        secondCityFunFact = await generateCityFunFact(cityName, countryName, secondWikipediaData);
        console.log(`Second destination city fun fact generated for ${cityName}, ${countryName}`);
      } catch (error) {
        console.error('Second destination city fun fact generation error:', error);
        secondCityFunFact = 'Fun fact generation temporarily unavailable.';
      }
    }

    // Override fun_fact with city-specific fun facts if available
    const finalFirstResult = {
      ...firstResult,
      fun_fact: firstCityFunFact || firstResult.fun_fact
    };
    
    const finalSecondResult = {
      ...secondResult,
      fun_fact: secondCityFunFact || secondResult.fun_fact
    };

    return NextResponse.json({
      firstResult: finalFirstResult,
      secondResult: finalSecondResult,
      comparisonSummary,
      firstWeatherData,
      secondWeatherData,
      firstWeatherAlerts,
      secondWeatherAlerts
    });

  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}