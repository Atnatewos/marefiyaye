/**
 * MAREFIYAYE WEB — Admin Audit Log Page
 * Path: apps/web/src/app/(admin)/admin/audit-log/page.jsx
 */

import { serverFetch } from '@/lib/auth-server.js';
import AuditLogTable from '@/components/admin/AuditLogTable.jsx';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';

export const metadata = { title: 'Audit log — Admin' };

export default async function AdminAuditLogPage() {
  const { data } = await serverFetch('/admin/audit-log?limit=100');
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">Audit log</h1>
          <p className="text-sm text-muted mt-1">
            Every sensitive admin action is recorded here.
          </p>
        </div>
        <AuditLogTable entries={data?.entries || []} />
      </Stack>
    </Container>
  );
}