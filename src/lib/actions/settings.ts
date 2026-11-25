'use server';

import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(formDataMap: Record<string, string | null>) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    for (const [key, value] of Object.entries(formDataMap)) {
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

    revalidatePath('/admin');
    revalidatePath('/admin/settings');
    revalidatePath('/about');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error in updateSettingsAction:', error);
    return { error: '保存系统配置失败' };
  }
}
