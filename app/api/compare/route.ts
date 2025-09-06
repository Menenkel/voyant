import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData } from '@/lib/database';
import { getWikipediaData, getWikipediaDataForCountry } from '@/lib/wikipedia';
import { generateSummary } from '@/lib/chatgpt';
import { getWeatherForCity, getWeatherDescription, getAirQualityDescription, getWindSpeedDescription, getPM10Description, getUVIndexDescription, getOzoneDescription } from '@/lib/weather';

export async function POST(request: NextRequest) {
  try {
    const { firstDestination, secondDestination } = await request.json();

    console.log('=== COMPARISON API CALLED ===');
    console.log('Comparing:', firstDestination, 'vs', secondDestination);

    if (!firstDestination || !secondDestination) {
      return NextResponse.json({ error: 'Both destinations are required' }, { status: 400 });
    }

    // Get data for first destination
    let firstCountryData = await getCountryByName(firstDestination);
    if (!firstCountryData) {
      const firstResults = await searchDestinations(firstDestination);
      if (firstResults.length > 0) {
        firstCountryData = firstResults[0];
      }
    }

    // Get data for second destination
    let secondCountryData = await getCountryByName(secondDestination);
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
      
      const { getCountryISO3ForCity, searchCities } = await import('@/lib/cities');
      const countryISO3 = await getCountryISO3ForCity(cityName);
      if (countryISO3) {
        const cities = await searchCities(cityName, 1);
        if (cities.length > 0) {
          firstCityCoordinates = {
            lat: cities[0].lat,
            lng: cities[0].lng,
            cityName: cities[0].city
          };
        }
      }
    }

    if (secondDestination.includes(',')) {
      const parts = secondDestination.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      const { getCountryISO3ForCity, searchCities } = await import('@/lib/cities');
      const countryISO3 = await getCountryISO3ForCity(cityName);
      if (countryISO3) {
        const cities = await searchCities(cityName, 1);
        if (cities.length > 0) {
          secondCityCoordinates = {
            lat: cities[0].lat,
            lng: cities[0].lng,
            cityName: cities[0].city
          };
        }
      }
    }

    const firstResult = transformCountryData(firstCountryData, firstCityCoordinates || undefined);
    const secondResult = transformCountryData(secondCountryData, secondCityCoordinates || undefined);

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

    try {
      const firstWeatherCity = firstResult.destination || firstDestination;
      console.log(`Fetching weather data for first destination: ${firstWeatherCity}`);
      const weatherData1 = await getWeatherForCity(firstWeatherCity);
      
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
      const weatherData2 = await getWeatherForCity(secondWeatherCity);
      
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

    return NextResponse.json({
      firstResult,
      secondResult,
      comparisonSummary,
      firstWeatherData,
      secondWeatherData
    });

  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}