import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';

export const defaultSiteSettings = {
  siteName: '墨韵',
  siteSubtitle: '水墨写意，笔走龙蛇',
  siteDescription: '琳习田的个人网站。',
  authorName: '琳习田',
  authorBio: '「墨韵」的主人，在字里行间记录日常，在一方留白里安放所思。',
  githubUrl: '',
  icp: '',
  footerText: '',
};

export type SiteSettings = typeof defaultSiteSettings;

export function getSiteSettings(): SiteSettings {
  const result = { ...defaultSiteSettings };
  for (const row of db.select().from(settings).all()) {
    if (Object.hasOwn(result, row.key) && row.value !== null) {
      result[row.key as keyof SiteSettings] = row.value;
    }
  }
  // Old seeds used this example number; it is not a real site registration.
  if (result.icp === '京ICP备20260001号-1') result.icp = '';
  if (!/^https?:\/\//i.test(result.githubUrl)) result.githubUrl = '';
  return result;
}
