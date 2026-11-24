import { serverFetch } from '@/lib/auth-server.js';
import UsersAdminClient from './_UsersAdminClient.jsx';

export const metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.status) qs.set('status', params.status);
  qs.set('limit', '100');
  const { data } = await serverFetch(`/admin/users?${qs.toString()}`);
  return <UsersAdminClient initialUsers={data?.users || []} />;
}