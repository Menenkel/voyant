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
  secondDestination?: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Prepare the system message
  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `You are Globaltrot-Bot, an AI travel companion that helps tourists explore destinations safely and enjoyably. Create a comprehensive travel guide based ONLY on the provided Supabase data and Wikipedia information. Do not use any external knowledge beyond these two sources.

MANDATORY STRUCTURE - Follow this exact format:
1. Quick Intro - Brief overview of the destination (NO headline above this)
2. Main Attractions - Key places to visit and things to do
3. Weather and Climate - Climate information and best times to visit
4. Risks - Only mention HIGH risks (7+ on the risk scale) - ALWAYS LAST

Guidelines:
- Follow the exact 4-section structure above
- Start directly with "## Quick Intro" - NO main title/headline above it
- End with "## Risks" - this must always be the last section
- Only mention HIGH risks (7+ on the risk scale) - ignore low/medium risks
- Never mention specific INFORM numbers (like "epidemic risk is 1.8")
- Use only the data provided from Supabase and Wikipedia
- Be engaging and informative for travelers
- Keep the summary concise and focused (maximum 150 words)
- Structure with clear headlines (use ## for all sections)
- NEVER use ** for bold formatting - this is strictly forbidden
- Use simple bullet points (-) for lists without any bold formatting
- Write in plain text with headlines only - no markdown bold formatting
- Example format: "## Quick Intro\nBrief overview\n\n## Main Attractions\n- Attraction 1\n- Attraction 2\n\n## Weather and Climate\nClimate info\n\n## Risks\nHigh risk factors only"
- If comparing two locations, highlight key differences for tourists
- Focus on what makes each destination special and worth visiting`
  };

  // Prepare the user message with data
  let userContent = `Please create a comprehensive travel guide for ${destination} based on the following data. IMPORTANT: Do not use ** for bold formatting anywhere in your response. Use only headlines (# and ##) and simple bullet points (-).

DESTINATION DATA:
- Country: ${supabaseData.country}
- Overall Safety Level: ${supabaseData.risk_class}
- Population: ${supabaseData.population_mio} million
- Life Expectancy: ${supabaseData.life_expectancy} years
- GDP per Capita: $${supabaseData.gdp_per_capita_usd}
- Human Development Index: ${supabaseData.human_dev_index}
- High Risk Factors (only mention if 7+ on scale):
  * Earthquake Risk: ${supabaseData.earthquake >= 7 ? supabaseData.earthquake : 'Low'}
  * River Flood Risk: ${supabaseData.river_flood >= 7 ? supabaseData.river_flood : 'Low'}
  * Tsunami Risk: ${supabaseData.tsunami >= 7 ? supabaseData.tsunami : 'Low'}
  * Tropical Storm Risk: ${supabaseData.tropical_storm >= 7 ? supabaseData.tropical_storm : 'Low'}
  * Coastal Flood Risk: ${supabaseData.coastal_flood >= 7 ? supabaseData.coastal_flood : 'Low'}
  * Drought Risk: ${supabaseData.drought >= 7 ? supabaseData.drought : 'Low'}
  * Epidemic Risk: ${supabaseData.epidemic >= 7 ? supabaseData.epidemic : 'Low'}
  * Projected Conflict: ${supabaseData.projected_conflict >= 7 ? supabaseData.projected_conflict : 'Low'}
  * Current Conflict: ${supabaseData.current_conflict >= 7 ? supabaseData.current_conflict : 'Low'}
- Fun Fact: ${supabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}`;

  if (wikipediaData) {
    userContent += `\n\nWIKIPEDIA INFORMATION:\n${wikipediaData}`;
  } else {
    userContent += `\n\nWIKIPEDIA INFORMATION: No Wikipedia data available for this location.`;
  }

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
- High Risk Factors (only mention if 7+ on scale):
  * Earthquake Risk: ${secondSupabaseData.earthquake >= 7 ? secondSupabaseData.earthquake : 'Low'}
  * River Flood Risk: ${secondSupabaseData.river_flood >= 7 ? secondSupabaseData.river_flood : 'Low'}
  * Tsunami Risk: ${secondSupabaseData.tsunami >= 7 ? secondSupabaseData.tsunami : 'Low'}
  * Tropical Storm Risk: ${secondSupabaseData.tropical_storm >= 7 ? secondSupabaseData.tropical_storm : 'Low'}
  * Coastal Flood Risk: ${secondSupabaseData.coastal_flood >= 7 ? secondSupabaseData.coastal_flood : 'Low'}
  * Drought Risk: ${secondSupabaseData.drought >= 7 ? secondSupabaseData.drought : 'Low'}
  * Epidemic Risk: ${secondSupabaseData.epidemic >= 7 ? secondSupabaseData.epidemic : 'Low'}
  * Projected Conflict: ${secondSupabaseData.projected_conflict >= 7 ? secondSupabaseData.projected_conflict : 'Low'}
  * Current Conflict: ${secondSupabaseData.current_conflict >= 7 ? secondSupabaseData.current_conflict : 'Low'}
- Fun Fact: ${secondSupabaseData.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}`;

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
        max_tokens: 200,
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
