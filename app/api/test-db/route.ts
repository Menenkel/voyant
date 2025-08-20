import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test different possible table names
    const possibleTableNames = ['Voyant', 'countries', 'country_data', 'risk_data', 'global_data', 'country_risk'];
    
    const results: any = {};
    
    for (const tableName of possibleTableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data && data.length > 0) {
          results[tableName] = {
            success: true,
            sampleData: data[0],
            columnNames: Object.keys(data[0])
          };
        } else {
          results[tableName] = {
            success: false,
            error: error?.message || 'No data found'
          };
        }
      } catch (err) {
        results[tableName] = {
          success: false,
          error: 'Table does not exist'
        };
      }
    }
    
    return NextResponse.json({
      message: 'Database connection test results',
      results,
      recommendations: Object.entries(results)
        .filter(([_, result]: [string, any]) => result.success)
        .map(([tableName, result]: [string, any]) => ({
          tableName,
          columnCount: result.columnNames?.length || 0,
          hasCountryColumn: result.columnNames?.includes('country') || false,
          hasISO3Column: result.columnNames?.includes('ISO3') || false
        }))
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
