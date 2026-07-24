import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const TABLE_NAME = 'content';
const ROW_ID = 1;

const normalizeRow = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    whatsappNumber: row.whatsappnumber || row.whatsappNumber,
    announcement: row.announcement,
    heroTitle: row.herotitle || row.heroTitle,
    heroSubtitle: row.herosubtitle || row.heroSubtitle,
    prices: row.prices || {}
  };
};

export async function GET() {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select('*')
    .eq('id', ROW_ID)
    .single();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(normalizeRow(data));
}

export async function PUT(request) {
  try {
    const supabaseServer = getSupabaseServer();
    const data = await request.json();

    const payload = {
      id: ROW_ID,
      whatsappnumber: data.whatsappNumber,
      announcement: data.announcement,
      herotitle: data.heroTitle,
      herosubtitle: data.heroSubtitle,
      prices: data.prices || {}
    };

    const { data: updated, error } = await supabaseServer
      .from(TABLE_NAME)
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(normalizeRow(updated));
  } catch (error) {
    return new NextResponse(error?.message || 'Bad request', { status: 400 });
  }
}
