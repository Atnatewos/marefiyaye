import { serverFetch } from '@/lib/auth-server.js';
import HostsAdminClient from './_HostsAdminClient.jsx';

export const metadata = { title: 'Hosts — Admin' };

export default async function AdminHostsPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.verification_status) qs.set('verification_status', params.verification_status);
  qs.set('limit', '50');

  const { data } = await serverFetch(`/admin/hosts?${qs.toString()}`);
  return <HostsAdminClient initialHosts={data?.hosts || []} />;
}