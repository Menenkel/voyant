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

export async function getWikipediaData(searchTerm: string): Promise<string | null> {
  try {
    // Clean the search term - remove country suffix if it's a city
    let cleanTerm = searchTerm;
    if (searchTerm.includes(',')) {
      cleanTerm = searchTerm.split(',')[0].trim();
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
