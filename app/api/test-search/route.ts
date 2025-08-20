import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, transformCountryData } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination') || 'Germany';

    console.log('Testing search for:', destination);

    // Try to find the destination in Supabase
    const searchResults = await searchDestinations(destination);
    console.log('Search results:', searchResults);

    if (searchResults.length > 0) {
      const countryData = searchResults[0];
      console.log('Using country data:', countryData);
      
      const result = transformCountryData(countryData);
      console.log('Final result:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Search successful',
        destination,
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No results found',
        destination
      });
    }

  } catch (error) {
    console.error('Test search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
