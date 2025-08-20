import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get the table structure even if it's empty
    const { data, error, count } = await supabase
      .from('Voyant')
      .select('*', { count: 'exact' });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: 'Error accessing Voyant table'
      }, { status: 500 });
    }

    // Try to insert a test row to see if we can write (this will help us understand permissions)
    const testRow = {
      country: 'test_country',
      ISO3: 'TST',
      population_mio: 1,
      global_peace_rank: 1,
      population_electricity: 100,
      inform_index: 1,
      risk_class: 'Low',
      global_rank: 1,
      earthquake: 1,
      river_flood: 1,
      tsunami: 1,
      tropical_storm: 1,
      coastal_flood: 1,
      drought: 1,
      epidemic: 1,
      projected_conflict: 1,
      current_conflict: 1,
      life_expectancy: 80,
      gdp_per_capita_usd: 50000,
      number_of_earths: 1,
      human_dev_index: 0.9
    };

    const { data: insertData, error: insertError } = await supabase
      .from('Voyant')
      .insert([testRow])
      .select();

    // If insert worked, delete the test row
    if (!insertError && insertData) {
      await supabase
        .from('Voyant')
        .delete()
        .eq('country', 'test_country');
    }

    return NextResponse.json({
      success: true,
      message: 'Voyant table detailed check',
      totalCount: count || 0,
      hasData: (data && data.length > 0) || false,
      canRead: !error,
      canWrite: !insertError,
      writeError: insertError?.message || null,
      tableStructure: insertData?.[0] ? Object.keys(insertData[0]) : [],
      sampleData: insertData?.[0] || null,
      note: insertData ? 'Test row was inserted and then deleted to check table structure' : 'Could not insert test row'
    });

  } catch (error) {
    console.error('Table check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
