import { serverFetch } from '@/lib/auth-server.js';
import PaymentsAdminClient from './_PaymentsAdminClient.jsx';

export const metadata = { title: 'Payments — Admin' };

export default async function AdminPaymentsPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  qs.set('limit', '50');

  const { data } = await serverFetch(`/admin/payments?${qs.toString()}`);
  return <PaymentsAdminClient initialPayments={data?.payments || []} />;
}