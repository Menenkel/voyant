import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get all data from Voyant2 table to inspect structure
    const { data, error } = await supabase
      .from('Voyant2')
      .select('*')
      .limit(10);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to connect to Voyant2 table'
      }, { status: 500 });
    }

    // Get column names from first row
    const columnNames = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    // Get unique country names (first 20)
    const countryNames = data?.map(row => row.country).slice(0, 20) || [];

    return NextResponse.json({
      success: true,
      message: 'Voyant2 table inspection',
      totalRows: data?.length || 0,
      columnNames,
      sampleCountries: countryNames,
      sampleData: data?.[0] || null,
      allData: data || []
    });

  } catch (error) {
    console.error('Voyant2 debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
