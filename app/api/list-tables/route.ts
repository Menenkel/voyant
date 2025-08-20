import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get information about available tables
    // Note: This might not work with all Supabase permissions
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      // If we can't access information_schema, let's try some common table names
      const commonTables = ['Voyant', 'voyant', 'countries', 'country_data', 'risk_data', 'global_data'];
      const results: any = {};
      
      for (const tableName of commonTables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          results[tableName] = {
            exists: !tableError,
            hasData: tableData && tableData.length > 0,
            error: tableError?.message || null
          };
        } catch (err) {
          results[tableName] = {
            exists: false,
            hasData: false,
            error: 'Table does not exist'
          };
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Table existence check',
        note: 'Could not access information_schema, checking common table names',
        results
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Available tables',
      tables: data?.map(row => row.table_name) || [],
      totalTables: data?.length || 0
    });

  } catch (error) {
    console.error('List tables error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
