interface WikipediaResponse {
  query: {
    pages: {
      [key: string]: {
        pageid: number;
        ns: number;
        title: string;
        extract: string;
        fullurl: string;
      };
    };
  };
}

// Get country code for Wikipedia disambiguation
function getCountryCode(countryName: string): string {
  const countryCodes: { [key: string]: string } = {
    'united states': 'US',
    'united states of america': 'US',
    'usa': 'US',
    'united kingdom': 'UK',
    'uk': 'UK',
    'great britain': 'UK',
    'britain': 'UK',
    'germany': 'DE',
    'france': 'FR',
    'italy': 'IT',
    'spain': 'ES',
    'canada': 'CA',
    'australia': 'AU',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'brazil': 'BR',
    'mexico': 'MX',
    'russia': 'RU',
    'south korea': 'KR',
    'north korea': 'KP',
    'iran': 'IR',
    'iraq': 'IQ',
    'afghanistan': 'AF',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'indonesia': 'ID',
    'thailand': 'TH',
    'vietnam': 'VN',
    'philippines': 'PH',
    'malaysia': 'MY',
    'singapore': 'SG',
    'south africa': 'ZA',
    'egypt': 'EG',
    'nigeria': 'NG',
    'kenya': 'KE',
    'morocco': 'MA',
    'algeria': 'DZ',
    'tunisia': 'TN',
    'libya': 'LY',
    'sudan': 'SD',
    'ethiopia': 'ET',
    'uganda': 'UG',
    'tanzania': 'TZ',
    'ghana': 'GH',
    'ivory coast': 'CI',
    'senegal': 'SN',
    'mali': 'ML',
    'burkina faso': 'BF',
    'niger': 'NE',
    'chad': 'TD',
    'cameroon': 'CM',
    'central african republic': 'CF',
    'democratic republic of the congo': 'CD',
    'republic of the congo': 'CG',
    'gabon': 'GA',
    'equatorial guinea': 'GQ',
    'sao tome and principe': 'ST',
    'angola': 'AO',
    'zambia': 'ZM',
    'zimbabwe': 'ZW',
    'botswana': 'BW',
    'namibia': 'NA',
    'lesotho': 'LS',
    'swaziland': 'SZ',
    'madagascar': 'MG',
    'mauritius': 'MU',
    'seychelles': 'SC',
    'comoros': 'KM',
    'djibouti': 'DJ',
    'somalia': 'SO',
    'eritrea': 'ER',
    'rwanda': 'RW',
    'burundi': 'BI',
    'malawi': 'MW',
    'mozambique': 'MZ',
    'swaziland': 'SZ',
    'lesotho': 'LS',
    'botswana': 'BW',
    'namibia': 'NA',
    'south africa': 'ZA',
    'zimbabwe': 'ZW',
    'zambia': 'ZM',
    'malawi': 'MW',
    'mozambique': 'MZ',
    'madagascar': 'MG',
    'mauritius': 'MU',
    'seychelles': 'SC',
    'comoros': 'KM',
    'djibouti': 'DJ',
    'somalia': 'SO',
    'eritrea': 'ER',
    'rwanda': 'RW',
    'burundi': 'BI',
    'malawi': 'MW',
    'mozambique': 'MZ'
  };
  
  return countryCodes[countryName.toLowerCase()] || countryName;
}

export async function getWikipediaData(searchTerm: string): Promise<string | null> {
  try {
    let cleanTerm = searchTerm;
    let searchUrl = '';
    
    // Handle city,country format with disambiguation
    if (searchTerm.includes(',')) {
      const parts = searchTerm.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      // Try different search strategies for disambiguation
      const searchTerms = [
        `${cityName}, ${countryName}`,  // "Vienna, United States"
        `${cityName} (${countryName})`, // "Vienna (United States)"
        `${cityName}, ${getCountryCode(countryName)}`, // "Vienna, US"
        cityName // Fallback to just city name
      ];
      
      for (const term of searchTerms) {
        try {
          const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'VoyantTravelApp/1.0 (https://voyant-travel-app.vercel.app)'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.extract && !data.extract.includes('disambiguation')) {
              return data.extract;
            }
          }
        } catch (error) {
          console.log(`Wikipedia search failed for term: ${term}`);
          continue;
        }
      }
      
      // If all specific searches fail, fall back to just city name
      cleanTerm = cityName;
    }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VoyantTravelApp/1.0 (https://voyant-travel-app.vercel.app)'
      }
    });

    if (!response.ok) {
      console.log(`Wikipedia API error for ${cleanTerm}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.extract) {
      // Limit the extract to avoid token limits
      return data.extract.substring(0, 2000);
    }
    
    return null;
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return null;
  }
}

export async function getWikipediaDataForCountry(countryName: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VoyantTravelApp/1.0 (https://voyant-travel-app.vercel.app)'
      }
    });

    if (!response.ok) {
      console.log(`Wikipedia API error for country ${countryName}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.extract) {
      // Limit the extract to avoid token limits
      return data.extract.substring(0, 2000);
    }
    
    return null;
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return null;
  }
}

// Enhanced function to get more detailed Wikipedia content for pop culture facts
export async function getWikipediaContentForPopCulture(cityName: string, countryName: string): Promise<string | null> {
  try {
    // Try to get the full page content instead of just summary
    const searchTerms = [
      `${cityName}, ${countryName}`,
      `${cityName} (${countryName})`,
      `${cityName}, ${getCountryCode(countryName)}`,
      cityName
    ];
    
    for (const term of searchTerms) {
      try {
        // First try to get the page ID
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(term)}&srlimit=1`;
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'VoyantTravelApp/1.0 (https://voyant-travel-app.vercel.app)'
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.query?.search?.[0]?.pageid) {
            const pageId = searchData.query.search[0].pageid;
            
            // Get the full page content
            const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain`;
            const contentResponse = await fetch(contentUrl, {
              headers: {
                'User-Agent': 'VoyantTravelApp/1.0 (https://voyant-travel-app.vercel.app)'
              }
            });
            
            if (contentResponse.ok) {
              const contentData = await contentResponse.json();
              const extract = contentData.query?.pages?.[pageId]?.extract;
              if (extract && extract.length > 200) {
                // Return first 3000 characters to focus on key information including pop culture
                return extract.substring(0, 3000);
              }
            }
          }
        }
      } catch (error) {
        console.log(`Wikipedia content search failed for term: ${term}`);
        continue;
      }
    }
    
    // Fallback to regular summary
    return await getWikipediaData(`${cityName}, ${countryName}`);
  } catch (error) {
    console.error('Wikipedia content API error:', error);
    return null;
  }
}
