/**
 * MAREFIYAYE WEB — Admin Banners Page
 * Path: apps/web/src/app/(admin)/admin/banners/page.jsx
 */

import { serverFetch } from '@/lib/auth-server.js';
import BannersClient from './_BannersClient.jsx';

export const metadata = { title: 'Banners — Admin' };

export default async function AdminBannersPage() {
  const { data } = await serverFetch('/admin/banners');
  return <BannersClient initialBanners={data?.banners || []} />;
}