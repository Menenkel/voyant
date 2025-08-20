import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testQuery = searchParams.get('q') || 'Germany';

    // Test the Voyant table connection
    const { data, error } = await supabase
      .from('Voyant')
      .select('*')
      .ilike('country', `%${testQuery.toLowerCase()}%`)
      .limit(3);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to connect to Voyant table'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Voyant table connection successful',
      testQuery,
      results: data,
      totalResults: data?.length || 0,
      sampleData: data?.[0] || null
    });

  } catch (error) {
    console.error('Voyant test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
