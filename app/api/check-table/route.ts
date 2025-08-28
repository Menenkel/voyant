import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get the table structure even if it's empty
    const { data, error, count } = await supabase
      .from('Voyant2')
      .select('*', { count: 'exact' });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: 'Error accessing Voyant2 table'
      }, { status: 500 });
    }

    // Note: Write permissions are not tested to avoid modifying production data

    return NextResponse.json({
      success: true,
      message: 'Voyant2 table detailed check',
      totalCount: count || 0,
      hasData: (data && data.length > 0) || false,
      canRead: !error,
      canWrite: 'Not tested',
      writeError: null,
      tableStructure: data?.[0] ? Object.keys(data[0]) : [],
      sampleData: data?.[0] || null,
      note: 'Read-only check completed successfully'
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
