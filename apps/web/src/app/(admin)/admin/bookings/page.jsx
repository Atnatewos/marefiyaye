import { serverFetch } from '@/lib/auth-server.js';
import BookingsAdminClient from './_BookingsAdminClient.jsx';

export const metadata = { title: 'Bookings — Admin' };

export default async function AdminBookingsPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  qs.set('limit', '50');
  const { data } = await serverFetch(`/admin/bookings?${qs.toString()}`);
  return <BookingsAdminClient initialBookings={data?.bookings || []} />;
}