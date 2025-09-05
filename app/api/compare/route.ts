import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getCountryByName, transformCountryData } from '@/lib/database';
import { getWikipediaData, getWikipediaDataForCountry } from '@/lib/wikipedia';
import { generateSummary } from '@/lib/chatgpt';

export async function POST(request: NextRequest) {
  try {
    const { firstDestination, secondDestination } = await request.json();

    console.log('=== COMPARISON API CALLED ===');
    console.log('Comparing:', firstDestination, 'vs', secondDestination);

    if (!firstDestination || !secondDestination) {
      return NextResponse.json({ error: 'Both destinations are required' }, { status: 400 });
    }

    // Get data for first destination
    let firstCountryData = await getCountryByName(firstDestination);
    if (!firstCountryData) {
      const firstResults = await searchDestinations(firstDestination);
      if (firstResults.length > 0) {
        firstCountryData = firstResults[0];
      }
    }

    // Get data for second destination
    let secondCountryData = await getCountryByName(secondDestination);
    if (!secondCountryData) {
      const secondResults = await searchDestinations(secondDestination);
      if (secondResults.length > 0) {
        secondCountryData = secondResults[0];
      }
    }

    if (!firstCountryData || !secondCountryData) {
      return NextResponse.json({ error: 'Could not find data for one or both destinations' }, { status: 404 });
    }

    // Get city coordinates for both destinations
    let firstCityCoordinates = null;
    let secondCityCoordinates = null;

    if (firstDestination.includes(',')) {
      const parts = firstDestination.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      const { getCountryISO3ForCity, searchCities } = await import('@/lib/cities');
      const countryISO3 = await getCountryISO3ForCity(cityName);
      if (countryISO3) {
        const cities = await searchCities(cityName, 1);
        if (cities.length > 0) {
          firstCityCoordinates = {
            lat: cities[0].lat,
            lng: cities[0].lng,
            cityName: cities[0].city
          };
        }
      }
    }

    if (secondDestination.includes(',')) {
      const parts = secondDestination.split(',').map(part => part.trim());
      const cityName = parts[0];
      const countryName = parts[1];
      
      const { getCountryISO3ForCity, searchCities } = await import('@/lib/cities');
      const countryISO3 = await getCountryISO3ForCity(cityName);
      if (countryISO3) {
        const cities = await searchCities(cityName, 1);
        if (cities.length > 0) {
          secondCityCoordinates = {
            lat: cities[0].lat,
            lng: cities[0].lng,
            cityName: cities[0].city
          };
        }
      }
    }

    const firstResult = transformCountryData(firstCountryData, firstCityCoordinates || undefined);
    const secondResult = transformCountryData(secondCountryData, secondCityCoordinates || undefined);

    // Get Wikipedia data for both destinations
    let firstWikipediaData = null;
    let secondWikipediaData = null;

    try {
      if (firstDestination.includes(',')) {
        firstWikipediaData = await getWikipediaData(firstDestination);
      } else {
        firstWikipediaData = await getWikipediaDataForCountry(firstDestination);
      }
    } catch (error) {
      console.error('First Wikipedia data fetch error:', error);
    }

    try {
      if (secondDestination.includes(',')) {
        secondWikipediaData = await getWikipediaData(secondDestination);
      } else {
        secondWikipediaData = await getWikipediaDataForCountry(secondDestination);
      }
    } catch (error) {
      console.error('Second Wikipedia data fetch error:', error);
    }

    // Generate comparison summary
    let comparisonSummary = null;
    try {
      comparisonSummary = await generateSummary(
        firstCountryData,
        firstWikipediaData,
        firstResult.destination || firstDestination,
        true, // isComparison = true
        secondCountryData,
        secondWikipediaData,
        secondResult.destination || secondDestination
      );
    } catch (error) {
      console.error('ChatGPT comparison summary generation error:', error);
      comparisonSummary = 'Comparison summary generation temporarily unavailable.';
    }

    return NextResponse.json({
      firstResult,
      secondResult,
      comparisonSummary
    });

  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
