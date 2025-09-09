import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForCity, getWeatherDescription, getAirQualityDescription, getWindSpeedDescription, getPM10Description, getUVIndexDescription, getOzoneDescription } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    console.log(`=== WEATHER API CALLED ===`);
    console.log(`Fetching weather for: ${city}`);

    // Get weather data from Open-Meteo
    const weatherData = await getWeatherForCity(city);

    // Transform the data for the frontend
    const transformedData = {
      city: weatherData.city,
      coordinates: weatherData.coordinates,
      current: {
        ...weatherData.current,
        weather_description: getWeatherDescription(weatherData.current.weather_code),
        wind_description: getWindSpeedDescription(weatherData.current.wind_speed)
      },
      hourly: weatherData.hourly,
      daily: weatherData.daily,
      air_quality: weatherData.air_quality ? {
        ...weatherData.air_quality,
        pm2_5_description: getAirQualityDescription(weatherData.air_quality.pm2_5),
        pm10_description: getPM10Description(weatherData.air_quality.pm10),
        uv_index_description: getUVIndexDescription(weatherData.air_quality.uv_index),
        ozone_description: getOzoneDescription(weatherData.air_quality.ozone)
      } : null,
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
              total_precipitation: weatherData.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0),
              avg_wind_speed: weatherData.hourly.wind_speed_10m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24
            };
          }
          
          return {
            max_temp: Math.round(maxTemp),
            min_temp: Math.round(minTemp),
            total_precipitation: weatherData.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0),
            avg_wind_speed: weatherData.hourly.wind_speed_10m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24
          };
        })(),
        next_16_days: weatherData.daily.time.slice(0, 16).map((date, index) => ({
          date,
          max_temp: weatherData.daily.temperature_2m_max[index],
          min_temp: weatherData.daily.temperature_2m_min[index],
          precipitation: weatherData.daily.precipitation_sum[index],
          wind_speed: weatherData.daily.wind_speed_10m_max[index],
          weather_code: weatherData.daily.weather_code[index],
          weather_description: getWeatherDescription(weatherData.daily.weather_code[index])
        }))
      }
    };

    console.log(`Weather data successfully fetched for ${city}`);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Weather API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
