export interface CityData {
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  country: string;
  iso2: string;
  iso3: string;
  admin_name: string;
  capital: string;
  population: number;
  id: string;
}

let citiesData: CityData[] | null = null;

// Load cities data from CSV
export async function loadCitiesData(): Promise<CityData[]> {
  if (citiesData) {
    return citiesData;
  }

  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/data/worldcities.csv`);
    const csvText = await response.text();
    
    // Parse CSV - handle quoted fields properly
    const lines = csvText.split('\n');
    
    citiesData = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        try {
          // Split by comma, but handle quoted fields
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Add the last value
          
          if (values.length < 11) return null;
          
          return {
            city: values[0].replace(/"/g, ''),
            city_ascii: values[1].replace(/"/g, ''),
            lat: parseFloat(values[2]) || 0,
            lng: parseFloat(values[3]) || 0,
            country: values[4].replace(/"/g, ''),
            iso2: values[5].replace(/"/g, ''),
            iso3: values[6].replace(/"/g, ''),
            admin_name: values[7].replace(/"/g, ''),
            capital: values[8].replace(/"/g, ''),
            population: parseInt(values[9]) || 0,
            id: values[10].replace(/"/g, '')
          };
        } catch (error) {
          console.error('Error parsing line:', line, error);
          return null;
        }
      })
      .filter(city => city !== null) as CityData[];

    console.log(`Loaded ${citiesData.length} cities`);
    return citiesData;
  } catch (error) {
    console.error('Error loading cities data:', error);
    return [];
  }
}

// Search cities by name
export async function searchCities(query: string, limit: number = 10): Promise<CityData[]> {
  const cities = await loadCitiesData();
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return [];

  return cities
    .filter(city => 
      city.city.toLowerCase().includes(searchTerm) ||
      city.city_ascii.toLowerCase().includes(searchTerm) ||
      city.country.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.city.toLowerCase() === searchTerm || a.city_ascii.toLowerCase() === searchTerm;
      const bExact = b.city.toLowerCase() === searchTerm || b.city_ascii.toLowerCase() === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize by population (larger cities first)
      return b.population - a.population;
    })
    .slice(0, limit);
}

// Get country ISO3 code for a city
export async function getCountryISO3ForCity(cityName: string): Promise<string | null> {
  const cities = await loadCitiesData();
  const searchTerm = cityName.toLowerCase().trim();
  
  const city = cities.find(city => 
    city.city.toLowerCase() === searchTerm ||
    city.city_ascii.toLowerCase() === searchTerm
  );
  
  return city?.iso3 || null;
}

// Get all cities for a country
export async function getCitiesForCountry(iso3: string): Promise<CityData[]> {
  const cities = await loadCitiesData();
  return cities.filter(city => city.iso3 === iso3);
}

// Search for a city within a specific country
export async function searchCityInCountry(cityName: string, countryISO3: string): Promise<CityData | null> {
  const cities = await loadCitiesData();
  const searchTerm = cityName.toLowerCase().trim();
  
  const city = cities.find(city => 
    city.iso3 === countryISO3 && (
      city.city.toLowerCase() === searchTerm ||
      city.city_ascii.toLowerCase() === searchTerm
    )
  );
  
  return city || null;
}
