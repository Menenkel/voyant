import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/cities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const cities = await searchCities(query.trim(), limit);
    
    const suggestions = cities.map(city => ({
      city: city.city,
      country: city.country,
      iso3: city.iso3,
      population: city.population,
      display: `${city.city}, ${city.country}`,
      isCapital: city.capital === 'primary'
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('City search error:', error);
    return NextResponse.json({ error: 'City search failed' }, { status: 500 });
  }
}
