/**
 * MAREFIYAYE WEB — Admin Bank Accounts Page
 * Path: apps/web/src/app/(admin)/admin/bank-accounts/page.jsx
 */

import { serverFetch } from '@/lib/auth-server.js';
import BankAccountsClient from './_BankAccountsClient.jsx';

export const metadata = { title: 'Bank accounts — Admin' };

export default async function AdminBankAccountsPage() {
  const { data } = await serverFetch('/admin/bank-accounts');
  return <BankAccountsClient initialAccounts={data?.accounts || []} />;
}