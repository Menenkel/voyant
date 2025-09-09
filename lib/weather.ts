interface WeatherData {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    apparent_temperature: number;
    precipitation: number;
    wind_speed: number;
    humidity: number;
    weather_code: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
    snowfall_sum: number[];
  };
  air_quality?: {
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    dust: number;
    uv_index: number;
  };
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface WeatherAlert {
  type: string;
  description: string;
  forecastPeriod: string;
  severity: 'moderate' | 'high' | 'extreme';
}

interface WeatherAlerts {
  location: string;
  forecastDate: string;
  alerts: WeatherAlert[];
}

// Cache for weather data (in-memory cache)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Geocode city name to coordinates using Open-Meteo's geocoding API with fallback
export async function geocodeCity(cityName: string): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`City '${cityName}' not found`);
    }
    
    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback: Try to get coordinates from our internal cities database
    try {
      const { searchCityInCountry } = await import('@/lib/cities');
      
      // If it's a city,country format, try to find it in our database
      if (cityName.includes(',')) {
        const parts = cityName.split(',').map(part => part.trim());
        const cityNameOnly = parts[0];
        const countryName = parts[1];
        
        // Try to find the country first
        const { getCountryByName } = await import('@/lib/database');
        const countryData = await getCountryByName(countryName);
        
        if (countryData) {
          const cityData = await searchCityInCountry(cityNameOnly, countryData.ISO3);
          if (cityData) {
            console.log(`Using fallback coordinates for ${cityName}:`, cityData);
            return {
              latitude: cityData.lat,
              longitude: cityData.lng,
              name: cityData.city,
              country: countryData.country
            };
          }
        }
      }
      
      throw new Error(`No fallback coordinates available for: ${cityName}`);
    } catch (fallbackError) {
      console.error('Fallback geocoding error:', fallbackError);
      throw new Error(`Failed to geocode city: ${cityName}`);
    }
  }
}

// Get weather data from Open-Meteo API
export async function getWeatherForCity(cityName: string): Promise<WeatherData> {
  // Check cache first
  const cacheKey = cityName.toLowerCase().trim();
  const cached = weatherCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached weather data for ${cityName}`);
    return cached.data;
  }

  try {
    // Geocode the city to get coordinates
    const geocodeResult = await geocodeCity(cityName);
    const { latitude, longitude } = geocodeResult;

    // Build the API URL with all required parameters
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
        'relative_humidity_2m',
        'weather_code'
      ].join(','),
      hourly: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
        'weather_code'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'weather_code',
        'snowfall_sum'
      ].join(','),
      air_quality: 'true',
      timezone: 'auto',
      forecast_days: '16'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    console.log(`Fetching weather data from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Weather API response received');

    // Transform the data to our format
    const weatherData: WeatherData = {
      city: cityName,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      current: {
        temperature: data.current.temperature_2m,
        apparent_temperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation,
        wind_speed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        weather_code: data.current.weather_code,
        time: data.current.time
      },
      hourly: {
        time: data.hourly.time,
        temperature_2m: data.hourly.temperature_2m,
        apparent_temperature: data.hourly.apparent_temperature,
        precipitation: data.hourly.precipitation,
        wind_speed_10m: data.hourly.wind_speed_10m,
        weather_code: data.hourly.weather_code
      },
      daily: {
        time: data.daily.time,
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
        precipitation_sum: data.daily.precipitation_sum,
        wind_speed_10m_max: data.daily.wind_speed_10m_max,
        weather_code: data.daily.weather_code,
        snowfall_sum: data.daily.snowfall_sum
      }
    };

    // Fetch air quality data separately
    try {
      const airQualityParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          'pm10',
          'pm2_5',
          'carbon_monoxide',
          'nitrogen_dioxide',
          'sulphur_dioxide',
          'ozone',
          'dust',
          'uv_index'
        ].join(','),
        timezone: 'auto'
      });

      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${airQualityParams}`;
      console.log(`Fetching air quality data for ${cityName}`);
      
      const airQualityResponse = await fetch(airQualityUrl);
      
      if (airQualityResponse.ok) {
        const airQualityData = await airQualityResponse.json();
        const airQualityCurrent = airQualityData.current;
        
        if (airQualityCurrent) {
          weatherData.air_quality = {
            pm10: airQualityCurrent.pm10 || 0,
            pm2_5: airQualityCurrent.pm2_5 || 0,
            carbon_monoxide: airQualityCurrent.carbon_monoxide || 0,
            nitrogen_dioxide: airQualityCurrent.nitrogen_dioxide || 0,
            sulphur_dioxide: airQualityCurrent.sulphur_dioxide || 0,
            ozone: airQualityCurrent.ozone || 0,
            dust: airQualityCurrent.dust || 0,
            uv_index: airQualityCurrent.uv_index || 0
          };
          console.log(`Air quality data fetched for ${cityName}:`, weatherData.air_quality);
        }
      } else {
        console.log(`Air quality data not available for ${cityName}`);
      }
    } catch (error) {
      console.log(`Air quality fetch error for ${cityName}:`, error);
    }

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    console.log(`Weather data cached for ${cityName}`);
    return weatherData;

  } catch (error) {
    console.error(`Weather API error for ${cityName}:`, error);
    throw error;
  }
}

export async function getWeatherForCoordinates(latitude: number, longitude: number, cityName: string): Promise<WeatherData> {
  // Check cache first
  const cacheKey = `${cityName.toLowerCase().trim()}_${latitude}_${longitude}`;
  const cached = weatherCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached weather data for ${cityName}`);
    return cached.data;
  }

  try {
    // Use provided coordinates directly

    // Build the API URL with all required parameters
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
        'relative_humidity_2m',
        'weather_code'
      ].join(','),
      hourly: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
        'weather_code'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'weather_code',
        'snowfall_sum'
      ].join(','),
      air_quality: 'true',
      timezone: 'auto',
      forecast_days: '16'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    
    console.log(`Fetching weather data for ${cityName} (${latitude}, ${longitude})`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract current weather data
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    
    const weatherData: WeatherData = {
      city: cityName,
      coordinates: {
        latitude: latitude,
        longitude: longitude
      },
      current: {
        temperature: current.temperature_2m,
        apparent_temperature: current.apparent_temperature,
        precipitation: current.precipitation,
        wind_speed: current.wind_speed_10m,
        humidity: current.relative_humidity_2m,
        weather_code: current.weather_code,
        time: current.time
      },
      hourly: {
        time: hourly.time,
        temperature_2m: hourly.temperature_2m,
        apparent_temperature: hourly.apparent_temperature,
        precipitation: hourly.precipitation,
        wind_speed_10m: hourly.wind_speed_10m,
        weather_code: hourly.weather_code
      },
      daily: {
        time: daily.time,
        temperature_2m_max: daily.temperature_2m_max,
        temperature_2m_min: daily.temperature_2m_min,
        precipitation_sum: daily.precipitation_sum,
        wind_speed_10m_max: daily.wind_speed_10m_max,
        weather_code: daily.weather_code,
        snowfall_sum: daily.snowfall_sum
      }
    };

    // Fetch air quality data separately
    try {
      const airQualityParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          'pm10',
          'pm2_5',
          'carbon_monoxide',
          'nitrogen_dioxide',
          'sulphur_dioxide',
          'ozone',
          'dust',
          'uv_index'
        ].join(','),
        timezone: 'auto'
      });

      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${airQualityParams}`;
      console.log(`Fetching air quality data for ${cityName}`);
      
      const airQualityResponse = await fetch(airQualityUrl);
      
      if (airQualityResponse.ok) {
        const airQualityData = await airQualityResponse.json();
        const airQualityCurrent = airQualityData.current;
        
        if (airQualityCurrent) {
          weatherData.air_quality = {
            pm10: airQualityCurrent.pm10 || 0,
            pm2_5: airQualityCurrent.pm2_5 || 0,
            carbon_monoxide: airQualityCurrent.carbon_monoxide || 0,
            nitrogen_dioxide: airQualityCurrent.nitrogen_dioxide || 0,
            sulphur_dioxide: airQualityCurrent.sulphur_dioxide || 0,
            ozone: airQualityCurrent.ozone || 0,
            dust: airQualityCurrent.dust || 0,
            uv_index: airQualityCurrent.uv_index || 0
          };
          console.log(`Air quality data fetched for ${cityName}:`, weatherData.air_quality);
        }
      } else {
        console.log(`Air quality data not available for ${cityName}`);
      }
    } catch (error) {
      console.log(`Air quality fetch error for ${cityName}:`, error);
    }

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    console.log(`Weather data fetched and cached for ${cityName}`);
    return weatherData;

  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error(`Failed to fetch weather data for ${cityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get weather description from weather code
export function getWeatherDescription(weatherCode: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  return weatherCodes[weatherCode] || 'Unknown weather condition';
}

// Get air quality description
export function getAirQualityDescription(pm2_5: number): string {
  if (pm2_5 <= 10) return 'Good - Air quality is satisfactory, and air pollution poses little or no risk';
  if (pm2_5 <= 25) return 'Moderate - Air quality is acceptable; however, there may be a risk for some people, particularly those who are unusually sensitive to air pollution';
  if (pm2_5 <= 50) return 'Unhealthy for sensitive groups - Members of sensitive groups may experience health effects; the general public is less likely to be affected';
  if (pm2_5 <= 75) return 'Unhealthy - Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects';
  if (pm2_5 <= 110) return 'Very unhealthy - Health alert: The risk of health effects is increased for everyone';
  return 'Hazardous - Health warning of emergency conditions: everyone is more likely to be affected';
}

// Get PM10 air quality description
export function getPM10Description(pm10: number): string {
  if (pm10 <= 20) return 'Good - Coarse particles are at safe levels, minimal health risk';
  if (pm10 <= 50) return 'Moderate - Some coarse particles present, sensitive individuals may experience minor irritation';
  if (pm10 <= 100) return 'Unhealthy for sensitive groups - Coarse particles may cause breathing difficulties for sensitive people';
  if (pm10 <= 150) return 'Unhealthy - Coarse particles can cause respiratory issues and reduced visibility';
  if (pm10 <= 200) return 'Very unhealthy - High levels of coarse particles, significant health risks for all';
  return 'Hazardous - Extremely high coarse particle levels, emergency conditions';
}

// Get UV index description
export function getUVIndexDescription(uvIndex: number): string {
  if (uvIndex <= 2) return 'Low - Minimal sun protection required; safe to be outside';
  if (uvIndex <= 5) return 'Moderate - Some protection required; seek shade during midday hours';
  if (uvIndex <= 7) return 'High - Protection required; avoid sun during midday, wear sunscreen and protective clothing';
  if (uvIndex <= 10) return 'Very high - Extra protection required; avoid sun exposure, seek shade, wear protective clothing';
  return 'Extreme - Avoid sun exposure; unprotected skin can burn in minutes';
}

// Get Ozone description
export function getOzoneDescription(ozone: number): string {
  if (ozone <= 50) return 'Good - Ozone levels are safe, no health concerns';
  if (ozone <= 100) return 'Moderate - Ozone levels may cause minor breathing discomfort for sensitive individuals';
  if (ozone <= 150) return 'Unhealthy for sensitive groups - Ozone may cause breathing problems for people with lung disease, children, and older adults';
  if (ozone <= 200) return 'Unhealthy - Ozone can cause breathing problems for everyone, especially during outdoor activities';
  if (ozone <= 300) return 'Very unhealthy - Ozone levels are dangerous; everyone should avoid outdoor activities';
  return 'Hazardous - Ozone levels are extremely dangerous; stay indoors if possible';
}

// Get wind speed description
export function getWindSpeedDescription(windSpeed: number): string {
  if (windSpeed < 1) return 'Calm';
  if (windSpeed < 6) return 'Light breeze';
  if (windSpeed < 12) return 'Gentle breeze';
  if (windSpeed < 20) return 'Moderate breeze';
  if (windSpeed < 29) return 'Fresh breeze';
  if (windSpeed < 39) return 'Strong breeze';
  if (windSpeed < 50) return 'Near gale';
  if (windSpeed < 62) return 'Gale';
  if (windSpeed < 75) return 'Strong gale';
  if (windSpeed < 89) return 'Storm';
  if (windSpeed < 103) return 'Violent storm';
  return 'Hurricane';
}

// Map weather codes to user-friendly descriptions
export function getWeatherCodeDescription(weatherCode: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[weatherCode] || 'Unknown weather condition';
}

// Check if weather code indicates extreme conditions
export function isExtremeWeatherCode(weatherCode: number): boolean {
  const extremeCodes = [65, 66, 67, 75, 77, 82, 85, 86, 95, 96, 99];
  return extremeCodes.includes(weatherCode);
}

// Generate extreme weather alerts from daily forecast data
export function generateWeatherAlerts(weatherData: WeatherData, forecastDays: number = 7): WeatherAlerts[] {
  const alerts: WeatherAlerts[] = [];
  const { city, daily } = weatherData;
  
  // Define extreme thresholds
  const thresholds = {
    heavyRainfall: 20, // mm
    highTemperature: 35, // °C
    highWind: 50, // km/h
    heavySnowfall: 5 // cm
  };
  
  // Process each day in the forecast
  for (let i = 0; i < Math.min(forecastDays, daily.time.length); i++) {
    // Parse the date string directly to avoid timezone issues
    const dateStr = daily.time[i];
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayAlerts: WeatherAlert[] = [];
    
    // Check for heavy rainfall
    if (daily.precipitation_sum[i] > thresholds.heavyRainfall) {
      dayAlerts.push({
        type: 'Heavy Rain',
        description: `${daily.precipitation_sum[i].toFixed(1)} mm of rain expected`,
        forecastPeriod: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, all day`,
        severity: daily.precipitation_sum[i] > 50 ? 'extreme' : daily.precipitation_sum[i] > 30 ? 'high' : 'moderate'
      });
    }
    
    // Check for high temperature
    if (daily.temperature_2m_max[i] > thresholds.highTemperature) {
      dayAlerts.push({
        type: 'High Temperature',
        description: `Temperature up to ${daily.temperature_2m_max[i].toFixed(1)}°C expected`,
        forecastPeriod: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, daytime`,
        severity: daily.temperature_2m_max[i] > 40 ? 'extreme' : daily.temperature_2m_max[i] > 38 ? 'high' : 'moderate'
      });
    }
    
    // Check for high wind
    if (daily.wind_speed_10m_max[i] > thresholds.highWind) {
      dayAlerts.push({
        type: 'High Wind',
        description: `Wind gusts up to ${daily.wind_speed_10m_max[i].toFixed(1)} km/h expected`,
        forecastPeriod: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, all day`,
        severity: daily.wind_speed_10m_max[i] > 80 ? 'extreme' : daily.wind_speed_10m_max[i] > 65 ? 'high' : 'moderate'
      });
    }
    
    // Check for heavy snowfall
    if (daily.snowfall_sum[i] > thresholds.heavySnowfall) {
      dayAlerts.push({
        type: 'Heavy Snow',
        description: `${daily.snowfall_sum[i].toFixed(1)} cm of snow expected`,
        forecastPeriod: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, all day`,
        severity: daily.snowfall_sum[i] > 15 ? 'extreme' : daily.snowfall_sum[i] > 10 ? 'high' : 'moderate'
      });
    }
    
    // Check for extreme weather conditions based on weather code
    if (isExtremeWeatherCode(daily.weather_code[i])) {
      const weatherDescription = getWeatherCodeDescription(daily.weather_code[i]);
      dayAlerts.push({
        type: 'Extreme Weather',
        description: `${weatherDescription} expected`,
        forecastPeriod: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, all day`,
        severity: 'high'
      });
    }
    
    // Only add to alerts if there are any alerts for this day
    if (dayAlerts.length > 0) {
      alerts.push({
        location: city,
        forecastDate: daily.time[i],
        alerts: dayAlerts
      });
    }
  }
  
  return alerts;
}

export type { WeatherData, GeocodeResult };
