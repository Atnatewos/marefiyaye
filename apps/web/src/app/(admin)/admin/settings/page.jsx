/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Settings Page (God Panel)
 * Path: apps/web/src/app/(admin)/admin/settings/page.jsx
 *
 * Purpose:
 *   Server component. Fetches the full schema-aware settings map from
 *   `GET /admin/config` and hands it to SettingsForm for auto-rendering.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { serverFetch } from '@/lib/auth-server.js';
import SettingsForm from '@/components/admin/SettingsForm.jsx';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';

export const metadata = { title: 'Settings — Admin' };

export default async function AdminSettingsPage() {
  const { data } = await serverFetch('/config/admin');
  const groups = data?.groups || [];
  const values = data?.values || {};

  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">Platform settings</h1>
          <p className="text-sm text-muted mt-1">
            Every configurable behavior lives here. Changes apply immediately.
          </p>
        </div>
        <SettingsForm groups={groups} initialValues={values} />
      </Stack>
    </Container>
  );
}