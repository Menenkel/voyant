interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatGPTResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateSummary(
  supabaseData: any,
  wikipediaData: string | null,
  destination: string,
  isComparison: boolean = false,
  secondSupabaseData?: any,
  secondWikipediaData?: string | null,
  secondDestination?: string,
  isCityQuery: boolean = false,
  weatherData?: any,
  secondWeatherData?: any
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Prepare the system message
  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `You are Globaltrot-Bot, an AI travel companion that helps tourists explore destinations safely and enjoyably. Create a comprehensive travel guide based ONLY on the provided Supabase data, Wikipedia information, and real-time weather data. Do not use any external knowledge beyond these three sources.

MANDATORY STRUCTURE - Follow this exact format:
1. Quick Intro - Brief overview of the destination (NO headline above this)
2. Main Attractions - Key places to visit and things to do
3. Weather and Climate - Use the provided real-time weather data and 16-day forecast to give current conditions, detailed temperature and rain forecasts, seasonal patterns, and best times to visit (MUST include best times to visit)

Guidelines:
- Follow the exact 3-section structure above
- Start directly with "## Quick Intro" - NO main title/headline above it
- End with "## Weather and Climate" - this must always be the last section
- ALWAYS include "best times to visit" in the Weather and Climate section
- Do NOT include any Risks section - end your summary after the Weather and Climate section
- Never mention specific INFORM numbers (like "epidemic risk is 1.8")
- Use the provided real-time weather data and 16-day forecast to enhance the Weather and Climate section with specific temperature and rain predictions
- Be engaging and informative for travelers
- Keep the summary concise and focused (maximum 300 words)
- Structure with clear headlines (use ## for all sections)
- NEVER use ** for bold formatting - this is strictly forbidden
- Use simple bullet points (-) for lists without any bold formatting
- Write in plain text with headlines only - no markdown bold formatting
- Example format for country queries: "## Quick Intro\nBrief overview\n\n## Main Attractions\n- Attraction 1\n- Attraction 2\n\n## Weather and Climate\nCurrent weather info and best times to visit\n\n## Risks\nHigh risk factors only or 'No significant high risks identified'"
- Example format for city queries: "## Quick Intro\nBrief overview\n\n## Main Attractions\n- Attraction 1\n- Attraction 2\n\n## Weather and Climate\nCurrent weather info and best times to visit"
- If comparing two locations, highlight key differences for tourists
- Focus on what makes each destination special and worth visiting
- IMPORTANT: For city queries, focus on city-specific information and avoid mentioning national-level statistics (like population, GDP, life expectancy, HDI) or any natural disaster risks in your summary. For city queries, do NOT include a Risks section at all - end your summary after the Weather and Climate section`
  };

  // Prepare the user message with data
  let userContent = `Please create a comprehensive travel guide for ${destination} based on the following data. IMPORTANT: Do not use ** for bold formatting anywhere in your response. Use only headlines (# and ##) and simple bullet points (-). CRITICAL: You MUST include all required sections: Quick Intro, Main Attractions, and Weather and Climate (with best times to visit). For country queries, also include a Risks section. For city queries, do NOT include a Risks section - end your summary after the Weather and Climate section.

DESTINATION DATA:
- Country: ${supabaseData.country}
- Overall Safety Level: ${supabaseData.risk_class}
- Population: ${supabaseData.population_mio} million
- Life Expectancy: ${supabaseData.life_expectancy} years
- GDP per Capita: $${supabaseData.gdp_per_capita_usd}
- Human Development Index: ${supabaseData.human_dev_index}`;

  // Risk factors are not included in AI summaries

  userContent += `
- Fun Fact: ${supabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}`;

  // Add weather data if available
  if (weatherData) {
    userContent += `

REAL-TIME WEATHER DATA:
- Current Temperature: ${weatherData.current.temperature}°C (feels like ${weatherData.current.apparent_temperature}°C)
- Current Weather: ${weatherData.current.weather_description}
- Wind: ${weatherData.current.wind_speed} km/h (${weatherData.current.wind_description})
- Humidity: ${weatherData.current.humidity}%
- Next 24 Hours: Max ${weatherData.forecast.next_24h.max_temp}°C, Min ${weatherData.forecast.next_24h.min_temp}°C
- Next 24 Hours Precipitation: ${weatherData.forecast.next_24h.total_precipitation}mm

16-DAY WEATHER FORECAST:
${weatherData.forecast.next_16_days.slice(0, 7).map((day, index) => {
  const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `- ${date}: ${day.min_temp}°C to ${day.max_temp}°C, ${day.precipitation}mm rain, ${day.weather_description}`;
}).join('\n')}

EXTENDED FORECAST (Days 8-16):
${weatherData.forecast.next_16_days.slice(7, 16).map((day, index) => {
  const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `- ${date}: ${day.min_temp}°C to ${day.max_temp}°C, ${day.precipitation}mm rain, ${day.weather_description}`;
}).join('\n')}`;

    // Add air quality data if available
    if (weatherData.air_quality) {
      userContent += `

AIR QUALITY:
- PM2.5: ${weatherData.air_quality.pm2_5} (${weatherData.air_quality.pm2_5_description})
- PM10: ${weatherData.air_quality.pm10} (${weatherData.air_quality.pm10_description})
- UV Index: ${weatherData.air_quality.uv_index} (${weatherData.air_quality.uv_index_description})
- Ozone: ${weatherData.air_quality.ozone} (${weatherData.air_quality.ozone_description})`;
    }
  } else {
    userContent += `

WEATHER DATA: No real-time weather data available for this location.`;
  }

  if (wikipediaData) {
    userContent += `\n\nWIKIPEDIA INFORMATION:\n${wikipediaData}`;
  } else {
    userContent += `\n\nWIKIPEDIA INFORMATION: No Wikipedia data available for this location.`;
  }

  // Add explicit instruction based on query type
  userContent += `\n\nIMPORTANT: Do NOT include a Risks section in your response. End your summary after the Weather and Climate section.`;

  // Add comparison data if provided
  if (isComparison && secondSupabaseData && secondDestination) {
    userContent += `\n\n--- COMPARISON WITH ${secondDestination.toUpperCase()} ---\n\n`;
    userContent += `SECOND LOCATION DATA:
- Country: ${secondSupabaseData.country}
- Overall Safety Level: ${secondSupabaseData.risk_class}
- Population: ${secondSupabaseData.population_mio} million
- Life Expectancy: ${secondSupabaseData.life_expectancy} years
- GDP per Capita: $${secondSupabaseData.gdp_per_capita_usd}
- Human Development Index: ${secondSupabaseData.human_dev_index}`;

    // Risk factors are not included in AI summaries

    userContent += `
- Fun Fact: ${secondSupabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}`;

    // Add second location weather data if available
    if (secondWeatherData) {
      userContent += `

SECOND LOCATION REAL-TIME WEATHER DATA:
- Current Temperature: ${secondWeatherData.current.temperature}°C (feels like ${secondWeatherData.current.apparent_temperature}°C)
- Current Weather: ${secondWeatherData.current.weather_description}
- Wind: ${secondWeatherData.current.wind_speed} km/h (${secondWeatherData.current.wind_description})
- Humidity: ${secondWeatherData.current.humidity}%
- Next 24 Hours: Max ${secondWeatherData.forecast.next_24h.max_temp}°C, Min ${secondWeatherData.forecast.next_24h.min_temp}°C
- Next 24 Hours Precipitation: ${secondWeatherData.forecast.next_24h.total_precipitation}mm

SECOND LOCATION 16-DAY WEATHER FORECAST:
${secondWeatherData.forecast.next_16_days.slice(0, 7).map((day, index) => {
  const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `- ${date}: ${day.min_temp}°C to ${day.max_temp}°C, ${day.precipitation}mm rain, ${day.weather_description}`;
}).join('\n')}

SECOND LOCATION EXTENDED FORECAST (Days 8-16):
${secondWeatherData.forecast.next_16_days.slice(7, 16).map((day, index) => {
  const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `- ${date}: ${day.min_temp}°C to ${day.max_temp}°C, ${day.precipitation}mm rain, ${day.weather_description}`;
}).join('\n')}`;

      // Add second location air quality data if available
      if (secondWeatherData.air_quality) {
        userContent += `

SECOND LOCATION AIR QUALITY:
- PM2.5: ${secondWeatherData.air_quality.pm2_5} (${secondWeatherData.air_quality.pm2_5_description})
- PM10: ${secondWeatherData.air_quality.pm10} (${secondWeatherData.air_quality.pm10_description})
- UV Index: ${secondWeatherData.air_quality.uv_index} (${secondWeatherData.air_quality.uv_index_description})
- Ozone: ${secondWeatherData.air_quality.ozone} (${secondWeatherData.air_quality.ozone_description})`;
      }
    } else {
      userContent += `

SECOND LOCATION WEATHER DATA: No real-time weather data available for this location.`;
    }

    if (secondWikipediaData) {
      userContent += `\n\nSECOND LOCATION WIKIPEDIA INFORMATION:\n${secondWikipediaData}`;
    } else {
      userContent += `\n\nSECOND LOCATION WIKIPEDIA INFORMATION: No Wikipedia data available for this location.`;
    }
  }

  const userMessage: ChatGPTMessage = {
    role: 'user',
    content: userContent
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, userMessage],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: ChatGPTResponse = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate summary';
  } catch (error) {
    console.error('ChatGPT API error:', error);
    throw error;
  }
}