import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const allSettings = db.select().from(settings).all();
    const settingsMap: Record<string, string> = {};
    for (const item of allSettings) {
      if (item.value !== null) {
        settingsMap[item.key] = item.value;
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body)) {
      db.insert(settings)
        .values({
          key,
          value: value === null ? null : String(value),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: value === null ? null : String(value) },
        })
        .run();
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
