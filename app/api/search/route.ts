import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData, getComparisonData } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    console.log('=== SEARCH API CALLED ===');
    console.log('Searching for:', destination);

    if (!destination) {
      return NextResponse.json({ error: 'Destination parameter is required' }, { status: 400 });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Try to find the destination in Supabase first
    let countryData = await getCountryByName(destination);
    console.log('getCountryByName result:', countryData);
    
    // If not found, try searching for partial matches and cities
    if (!countryData) {
      const searchResults = await searchDestinations(destination);
      console.log('searchDestinations results:', searchResults);
      if (searchResults.length > 0) {
        countryData = searchResults[0]; // Use the first match
      }
    }

    // If we found data in Supabase, use it
    if (countryData) {
      console.log('Found country data:', countryData);
      
      // Check if this is a city search and get coordinates
      let cityCoordinates = null;
      if (destination.includes(',')) {
        const parts = destination.split(',').map(part => part.trim());
        const cityName = parts[0];
        const countryName = parts[1];
        
        // Get city coordinates from the cities database
        const { getCountryISO3ForCity } = await import('@/lib/cities');
        const countryISO3 = await getCountryISO3ForCity(cityName);
        if (countryISO3) {
          // Get city coordinates from the cities CSV data
          const { searchCities } = await import('@/lib/cities');
          const cities = await searchCities(cityName, 1);
          if (cities.length > 0) {
            cityCoordinates = {
              lat: cities[0].lat,
              lng: cities[0].lng,
              cityName: cities[0].city
            };
            console.log('Found city coordinates:', cityCoordinates);
          }
        }
      }
      
      const result = transformCountryData(countryData, cityCoordinates || undefined);
      const comparisonData = await getComparisonData(countryData);
      console.log('Transformed result:', result);
      return NextResponse.json({
        ...result,
        comparisonData
      });
    }

    console.log('No country data found, falling back to mock data');
    // Fallback to mock data for countries not in the database
    const result = {
      destination,
      riskData: {
        hazard_score: Math.floor(Math.random() * 10) + 1,
        vulnerability_score: Math.floor(Math.random() * 10) + 1,
        coping_capacity: Math.floor(Math.random() * 10) + 1,
        overall_risk: Math.floor(Math.random() * 10) + 1
      },
      travelDistance: {
        name: 'Nearest International Airport',
        distance: Math.floor(Math.random() * 40) + 10,
        public_transport: Math.floor(Math.random() * 60) + 20,
        car: Math.floor(Math.random() * 40) + 15
      },
      seasonalClimate: {
        period: 'September - November 2025',
        temperature: {
          trend: 'Likely above average',
          average: Math.floor(Math.random() * 30) + 5,
          min: Math.floor(Math.random() * 15) + 0,
          max: Math.floor(Math.random() * 20) + 20
        },
        precipitation: {
          trend: 'Near average',
          average: Math.floor(Math.random() * 200) + 50,
          days: Math.floor(Math.random() * 30) + 10
        }
      },
      riskIndicators: {
        risk_class: { class: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
        overall_risk: Math.floor(Math.random() * 10) + 1,
        hazard_indicators: {
          earthquake: Math.floor(Math.random() * 10) + 1,
          river_flood: Math.floor(Math.random() * 10) + 1,
          tsunami: Math.floor(Math.random() * 10) + 1,
          tropical_cyclone: Math.floor(Math.random() * 10) + 1,
          coastal_flood: Math.floor(Math.random() * 10) + 1,
          drought: Math.floor(Math.random() * 10) + 1,
          epidemic: Math.floor(Math.random() * 10) + 1,
          projected_conflict_risk: Math.floor(Math.random() * 10) + 1
        },
        global_indices: {
          global_peace_index: Math.floor(Math.random() * 163) + 1,
          fragile_states_index: Math.floor(Math.random() * 179) + 1,
          corruption_index: Math.floor(Math.random() * 180) + 1
        }
      },
      newsData: [
        {
          title: `Tourism Boom: ${destination} Sees Record Visitor Numbers`,
          summary: 'Tourist arrivals increase by 25% as travelers flock to experience local attractions and cultural sites.',
          source: 'Global News Network',
          publishedAt: '2025-08-15T10:30:00Z'
        },
        {
          title: `Weather Alert: Severe Storm System Approaches ${destination}`,
          summary: 'Heavy rainfall and strong winds expected to impact travel and outdoor activities in the region.',
          source: 'International Herald',
          publishedAt: '2025-08-14T14:20:00Z'
        },
        {
          title: `Security Update: Increased Police Presence in ${destination} Tourist Areas`,
          summary: 'Authorities enhance security measures following recent incidents in popular tourist districts.',
          source: 'National Post',
          publishedAt: '2025-08-13T09:15:00Z'
        }
      ],
      weatherData: {
        location: destination,
        forecast_date: '2025-08-15',
        temperature: Math.floor(Math.random() * 30) + 5,
        precipitation: 'Low',
        outlook: 'Sunny'
      },
      healthData: {
        disease: 'COVID-19',
        country: destination,
        risk_level: 'Low',
        date: '2025-08-15',
        advice: 'Standard precautions recommended'
      },
      securityData: {
        event_type: 'Peaceful Protest',
        country: destination,
        actors: 'Local Government',
        fatalities: 0,
        date: '2025-08-15',
        location: 'City Center'
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
