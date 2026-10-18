import { NextResponse } from 'next/server';
import { getIndianFeaturedSections } from '@/lib/saavn';

export async function GET() {
  try {
    const sections = await getIndianFeaturedSections();
    return NextResponse.json({ sections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
