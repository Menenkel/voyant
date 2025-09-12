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
    content: `You are Globaltrot-Bot, an AI travel companion that helps tourists explore destinations safely and enjoyably. Create a comprehensive travel guide based ONLY on the provided Supabase data, Wikipedia information, and real-time weather data. 

CRITICAL: You MUST NOT use any external knowledge beyond the three provided sources. If the provided data does not contain sufficient information about the specific city, you must clearly state this limitation and only provide information that is directly supported by the provided data.

MANDATORY STRUCTURE - Follow this exact format, but ONLY include sections when data is available:
1. Quick Intro - Brief overview of the destination (ALWAYS include - NO headline above this)
2. Main Attractions - Key places to visit and things to do (ALWAYS include)
3. Airport Access - Include travel distances from the closest national and international airports to the city center (ALWAYS include - AI generated)
4. Accommodation - Provide estimated hotel prices for entry-level, medium, and high-level accommodations (ALWAYS include - AI generated)
5. Drinking Water Quality - Information about tap water safety, drinking recommendations, and water quality status (ALWAYS include - AI generated)
6. Weather and Climate - Use the provided real-time weather data and 16-day forecast to give current conditions, detailed temperature and rain forecasts, seasonal patterns, and best times to visit (ONLY include if weather data is available)

Guidelines:
- CONDITIONAL SECTIONS: Only include Weather and Climate section when weather data is available
- Start directly with "## Quick Intro" - NO main title/headline above it
- End with the last available section (Weather and Climate if available, otherwise Drinking Water Quality)
- ALWAYS include "best times to visit" in the Weather and Climate section (if weather data is available)
- ALWAYS include airport distance information in the Airport Access section (AI generated)
- ALWAYS include hotel price estimates in the Accommodation section (AI generated)
- ALWAYS include drinking water quality information in the Drinking Water Quality section (AI generated)
- Do NOT include any Risks section - end your summary after the last available section
- Never mention specific INFORM numbers (like "epidemic risk is 1.8")
- Use the provided real-time weather data and 16-day forecast to enhance the Weather and Climate section with specific temperature and rain predictions (if available)
- Be engaging and informative for travelers
- Keep the summary concise and focused (maximum 350 words)
- Structure with clear headlines (use ## for all sections)
- NEVER use ** for bold formatting - this is strictly forbidden
- Use simple bullet points (-) for lists without any bold formatting
- Write in plain text with headlines only - no markdown bold formatting
- CONFIDENCE LEVELS: For each section, add a confidence level at the end in parentheses: (confidence: low/medium/high)
- AI GENERATION: Generate airport access, accommodation, and drinking water quality information based on your knowledge of the destination
- Example format for country queries: "## Quick Intro\nBrief overview (confidence: high)\n\n## Main Attractions\n- Attraction 1\n- Attraction 2 (confidence: medium)\n\n## Airport Access\nAirport information (confidence: high)\n\n## Accommodation\nHotel prices (confidence: medium)\n\n## Drinking Water Quality\nWater safety info (confidence: high)\n\n## Weather and Climate\nCurrent weather info and best times to visit (confidence: high)"
- Example format for city queries: "## Quick Intro\nBrief overview (confidence: high)\n\n## Main Attractions\n- Attraction 1\n- Attraction 2 (confidence: medium)\n\n## Airport Access\nAirport information (confidence: high)\n\n## Accommodation\nHotel prices (confidence: medium)\n\n## Drinking Water Quality\nWater safety info (confidence: high)\n\n## Weather and Climate\nCurrent weather info and best times to visit (confidence: high)"
- If comparing two locations, highlight key differences for tourists
- Focus on what makes each destination special and worth visiting
- IMPORTANT: For city queries, focus on city-specific information and avoid mentioning national-level statistics (like population, GDP, life expectancy, HDI) or any natural disaster risks in your summary. For city queries, do NOT include a Risks section at all - end your summary after the Weather and Climate section`
  };

  // Prepare the user message with data
  let userContent = `Please create a comprehensive travel guide for ${destination} based on the following data. IMPORTANT: Do not use ** for bold formatting anywhere in your response. Use only headlines (# and ##) and simple bullet points (-). CRITICAL: ALWAYS include: Quick Intro, Main Attractions, Airport Access, Accommodation, and Drinking Water Quality (all AI generated). CONDITIONALLY include: Weather and Climate (only if weather data available). Do NOT include a Risks section. CONFIDENCE LEVELS: Add confidence levels (low/medium/high) at the end of each section in parentheses.

DATA LIMITATION WARNING: If the provided data does not contain sufficient information about the specific city (e.g., if Wikipedia data is missing or refers to a different city), you must clearly state this limitation and only provide information that is directly supported by the provided data. Do not use external knowledge to fill in missing information.

DESTINATION DATA:
- Country: ${supabaseData.country}
- Overall Safety Level: ${supabaseData.risk_class}
- Population: ${supabaseData.population_mio} million
- Life Expectancy: ${supabaseData.life_expectancy} years
- GDP per Capita: $${supabaseData.gdp_per_capita_usd}
- Human Development Index: ${supabaseData.human_dev_index}
- Fun Fact: ${supabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}

DATA AVAILABILITY INDICATORS:
- Airport Access Data: AI GENERATED (based on destination knowledge)
- Accommodation Data: AI GENERATED (based on destination knowledge)
- Drinking Water Quality Data: AI GENERATED (based on destination knowledge)
- Weather Data: ${weatherData ? 'AVAILABLE' : 'NOT AVAILABLE'}`;

  // Risk factors are not included in AI summaries

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

  userContent += `\n\nCRITICAL INSTRUCTION: If Wikipedia data is not available or refers to a different city, you must clearly state this limitation and only provide information that is directly supported by the Supabase data above. Do not use your training data to fill in missing information about specific cities. If the provided data does not contain sufficient information about the specific city, you must acknowledge this limitation.`;

  // Add explicit instruction based on query type
  userContent += `\n\nIMPORTANT: Do NOT include a Risks section in your response. End your summary after the last available section.

CONDITIONAL SECTION REQUIREMENTS:
- ALWAYS include Airport Access section (AI will generate based on destination knowledge)
- ALWAYS include Accommodation section (AI will generate based on destination knowledge)
- ALWAYS include Drinking Water Quality section (AI will generate based on destination knowledge)
- Only include Weather and Climate section if "Weather Data: AVAILABLE" is shown above

AIRPORT ACCESS REQUIREMENT (always include): In the Airport Access section, provide travel distances from the closest national and international airports to the city center. Include:
- Airport names and types (national/international)
- Distance in kilometers and miles
- Approximate travel time by car/public transport
- Brief description of transportation options

Example format:
- Vienna International Airport (VIE): 18 km (11 miles) from city center, 20-30 minutes by car or train
- Bratislava Airport (BTS): 60 km (37 miles) from city center, 1 hour by car or bus

ACCOMMODATION REQUIREMENT (always include): In the Accommodation section, provide estimated hotel prices for different budget levels. Include:
- Entry-level hotels: Budget accommodations (hostels, basic hotels)
- Medium-level hotels: Mid-range accommodations (3-star hotels, boutique hotels)
- High-level hotels: Luxury accommodations (4-5 star hotels, resorts)
- Include currency and price ranges per night
- Base estimates on the destination's cost of living and tourism market

Example format:
- Entry-level: $30-60 USD per night (hostels, budget hotels)
- Medium-level: $80-150 USD per night (3-star hotels, boutique accommodations)
- High-level: $200-400 USD per night (4-5 star hotels, luxury resorts)

DRINKING WATER QUALITY REQUIREMENT (always include): In the Drinking Water Quality section, provide information about tap water safety and drinking recommendations. Include:
- Tap water safety level (Low/Medium/High)
- Specific drinking advice (e.g., "Safe to drink from tap", "Filter before drinking", "Use bottled water only")
- Brief explanation of water quality standards
- Recommendations for travelers

Example format:
- Tap water is generally safe to drink in most areas
- Water quality meets international standards
- Travelers can drink from tap in hotels and restaurants
- Consider bottled water in rural areas`;

  // Add comparison data if provided
  if (isComparison && secondSupabaseData && secondDestination) {
    userContent += `\n\n--- COMPARISON WITH ${secondDestination.toUpperCase()} ---\n\n`;
    userContent += `SECOND LOCATION DATA:
- Country: ${secondSupabaseData.country}
- Overall Safety Level: ${secondSupabaseData.risk_class}
- Population: ${secondSupabaseData.population_mio} million
- Life Expectancy: ${secondSupabaseData.life_expectancy} years
- GDP per Capita: $${secondSupabaseData.gdp_per_capita_usd}
- Human Development Index: ${secondSupabaseData.human_dev_index}
- Fun Fact: ${secondSupabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}

SECOND LOCATION DATA AVAILABILITY INDICATORS:
- Airport Access Data: AI GENERATED (based on destination knowledge)
- Accommodation Data: AI GENERATED (based on destination knowledge)
- Drinking Water Quality Data: AI GENERATED (based on destination knowledge)
- Weather Data: ${secondWeatherData ? 'AVAILABLE' : 'NOT AVAILABLE'}`;

    // Risk factors are not included in AI summaries

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

// Generate city-specific fun fact using ChatGPT
export async function generateCityFunFact(
  cityName: string,
  countryName: string,
  wikipediaData: string | null
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `You are a travel expert who provides fascinating, lesser-known but TRUE facts about cities. Your goal is to share one interesting pop culture fact that entertains and surprises users.

CRITICAL REQUIREMENTS - FACTUAL ACCURACY IS MANDATORY:
- Create ONE entertaining fact only (1-2 sentences maximum)
- MUST be 100% factual and verifiable - NO FABRICATION OR CREATIVE INTERPRETATION
- Should be lesser-known but TRUE information that most tourists don't know
- Focus on something unique to this specific city, not the country
- PRIORITIZE POP CULTURE: Famous actors, musicians, singers, directors, writers, filmmakers, or cultural figures born in or associated with the city
- SECONDARY: Quirky architectural details, unusual local customs, surprising statistics, or hidden gems
- Use the provided Wikipedia data as your primary source, but you may also use your training data for well-established pop culture facts
- If Wikipedia data doesn't contain interesting pop culture facts, use your knowledge of famous people associated with the city
- Do not include quotation marks around the fun fact
- Keep it concise, factual, and entertaining
- NEVER create fictional traditions, customs, or stories
- DOUBLE-CHECK: Verify all names, dates, and facts are accurate before responding

EXAMPLES OF GOOD ENTERTAINING FACTUAL FACTS (POP CULTURE PRIORITY):
- "Elvis Presley was born in Tupelo, Mississippi, and his childhood home is now a museum."
- "Salvador Dalí was born in Figueres, Spain, and the city's Dalí Theatre-Museum houses the largest collection of his works."
- "Mozart was born in Salzburg, Austria, and the city celebrates his legacy with the annual Salzburg Festival."
- "The Beatles formed in Liverpool, England, and the city has a dedicated Beatles Story museum."
- "Leonardo da Vinci was born in Vinci, Italy, and the town's museum houses replicas of his inventions."
- "Johnny Cash was born in Kingsland, Arkansas, and the city has a Johnny Cash Memorial."
- "Marilyn Monroe was born in Los Angeles, California, and her childhood home is now a historic landmark."
- "Bob Dylan was born in Duluth, Minnesota, and the city has a Bob Dylan Way street."

EXAMPLES OF GOOD NON-POP CULTURE FACTS:
- "Vienna has more than 1,700 acres of vineyards within city limits, making it the world's largest wine-growing region inside a city."
- "Tokyo's Shibuya Crossing sees up to 2,500 people cross at once during peak hours."
- "Paris has a hidden vineyard in Montmartre that produces wine from 2,000 vines."
- "Amsterdam has more canals than Venice and more bridges than Paris combined."

STRICTLY AVOID:
- Fictional traditions or customs
- Made-up stories or legends
- Creative interpretations of facts
- Famous landmarks (Eiffel Tower, Big Ben, etc.)
- Well-known historical events
- Common tourist information
- Generic city statistics
- Information that applies to the whole country
- Unverified claims about celebrities or cultural figures`
  };

  // Disambiguate city names to avoid confusion
  let disambiguatedCityName = cityName;
  if (cityName.toLowerCase().includes('washington') && countryName.toLowerCase().includes('united states')) {
    // Check if it's Washington, DC (capital) or Washington state
    if (cityName.toLowerCase().includes('dc') || cityName.toLowerCase().includes('district')) {
      disambiguatedCityName = 'Washington, DC (the capital city)';
    } else {
      // Default to Washington, DC for US searches unless specifically Washington state
      disambiguatedCityName = 'Washington, DC (the capital city of the United States)';
    }
  }

  let userContent = `Generate a FACTUAL, entertaining, lesser-known fact about ${disambiguatedCityName}, ${countryName}. PRIORITIZE pop culture facts about famous actors, musicians, singers, directors, writers, filmmakers, or cultural figures born in or associated with this city. This must be 100% true and verifiable information that most tourists wouldn't know.

CRITICAL: If the city name is "Washington" in the United States, you MUST focus on Washington, DC (the capital city), NOT Washington state. Washington, DC is the capital of the United States and is a separate entity from Washington state.`;

  if (wikipediaData) {
    userContent += `\n\nWikipedia information about ${disambiguatedCityName}:\n${wikipediaData}`;
  } else {
    userContent += `\n\nNo Wikipedia data available for this city.`;
  }

  userContent += `\n\nINSTRUCTIONS: Use the Wikipedia data as your primary source, but if it doesn't contain interesting pop culture facts about famous people, you may use your training data to provide well-established facts about celebrities, musicians, actors, or cultural figures associated with this city. Focus on lesser-known but true information that would surprise tourists. DOUBLE-CHECK all names, dates, and facts for accuracy.`;

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
        model: 'gpt-4o-mini',
        messages: [systemMessage, userMessage],
        max_tokens: 120,
        temperature: 0.9
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: ChatGPTResponse = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'No fun fact available for this city.';
  } catch (error) {
    console.error('ChatGPT fun fact generation error:', error);
    return 'Fun fact generation temporarily unavailable.';
  }
}

// Generate languages and currency information using ChatGPT
export async function generateLanguagesAndCurrency(
  countryName: string
): Promise<{ languages: string; currency: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `You are a geography expert who provides accurate information about countries. Your task is to extract the official languages and currency for a given country.

CRITICAL REQUIREMENTS:
- Provide ONLY factual, verifiable information
- Return the response in a specific JSON format
- Include ALL official languages (not just the primary one)
- Use the official currency name and symbol
- Be concise but comprehensive

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "languages": "Language1, Language2, Language3",
  "currency": "Currency Name (Symbol)"
}

EXAMPLES:
- For France: {"languages": "French", "currency": "Euro (€)"}
- For Canada: {"languages": "English, French", "currency": "Canadian Dollar (C$)"}
- For India: {"languages": "Hindi, English, 22 other official languages", "currency": "Indian Rupee (₹)"}
- For Switzerland: {"languages": "German, French, Italian, Romansh", "currency": "Swiss Franc (CHF)"}

IMPORTANT:
- Do not include any text before or after the JSON
- Do not use markdown formatting
- Do not include explanations or additional information
- Ensure the JSON is valid and parseable`
  };

  const userMessage: ChatGPTMessage = {
    role: 'user',
    content: `Provide the official languages and currency for ${countryName}. Return only the JSON object as specified.`
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
        max_tokens: 150,
        temperature: 0.1, // Low temperature for factual accuracy
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: ChatGPTResponse = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from ChatGPT');
    }

    // Parse the JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        languages: parsed.languages || 'N/A',
        currency: parsed.currency || 'N/A'
      };
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', content);
      throw new Error('Invalid JSON response from ChatGPT');
    }
  } catch (error) {
    console.error('ChatGPT languages/currency generation error:', error);
    return {
      languages: 'N/A',
      currency: 'N/A'
    };
  }
}

// Generate population information using ChatGPT
export async function generatePopulationData(
  locationName: string,
  isCity: boolean = false
): Promise<{ population: number; populationText: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `You are a geography and demographics expert who provides accurate population information. Your task is to extract the current population for a given location.

CRITICAL REQUIREMENTS:
- Provide ONLY factual, verifiable information
- Return the response in a specific JSON format
- Use the most recent available population data (2024-2025)
- For countries, provide total population in millions
- For cities, provide population in thousands or millions as appropriate
- Be concise but accurate

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "population": 3.07,
  "populationText": "3.07 million"
}

EXAMPLES:
- For Namibia: {"population": 3.07, "populationText": "3.07 million"}
- For Botswana: {"population": 2.7, "populationText": "2.7 million"}
- For Tokyo: {"population": 37.4, "populationText": "37.4 million"}
- For Windhoek: {"population": 0.39, "populationText": "390,000"}

IMPORTANT:
- Do not include any text before or after the JSON
- Do not use markdown formatting
- Do not include explanations or additional information
- Ensure the JSON is valid and parseable
- Use decimal format for population (e.g., 3.07 not 3,070,000)`
  };

  const locationType = isCity ? 'city' : 'country';
  const userMessage: ChatGPTMessage = {
    role: 'user',
    content: `Provide the current population for ${locationName} (${locationType}). Return only the JSON object as specified.`
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
        max_tokens: 100,
        temperature: 0.1, // Low temperature for factual accuracy
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: ChatGPTResponse = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from ChatGPT');
    }

    // Parse the JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        population: parsed.population || 0,
        populationText: parsed.populationText || 'N/A'
      };
    } catch (parseError) {
      console.error('Failed to parse ChatGPT population response:', content);
      throw new Error('Invalid JSON response from ChatGPT');
    }
  } catch (error) {
    console.error('ChatGPT population generation error:', error);
    return {
      population: 0,
      populationText: 'N/A'
    };
  }
}