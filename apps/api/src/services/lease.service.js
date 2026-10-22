/**
 * @file apps/api/src/services/lease.service.js
 *
 * Business logic for long-term lease applications, viewings, and document generation.
 */

import { transaction } from '../config/db.js';
import {
  insertLeaseApplication,
  findLeasesByTenant,
  findLeaseById,
  insertViewing,
  findViewingsByRequester,
} from '../queries/leases.queries.js';
import { query } from '../config/db.js';
import { calculateLongTermTotal } from '@marefiyaye/shared';
import { STAY_TYPES } from '@marefiyaye/config/business';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors.js';

/**
 * Tenant applies for a long-term lease.
 */
export async function applyForLease(data) {
  const { rows: props } = await query(
    'SELECT * FROM properties WHERE id = $1 AND is_active = TRUE LIMIT 1',
    [data.propertyId]
  );
  const property = props[0];
  if (!property) throw new NotFoundError('Property');
  if (
    property.stay_type !== STAY_TYPES.LONG_TERM &&
    property.stay_type !== STAY_TYPES.HYBRID
  ) {
    throw new ValidationError('This property does not support long-term leases');
  }
  if (!property.monthly_rate_etb) {
    throw new ValidationError('Property has no monthly rate configured');
  }

  const monthlyRate = Number(property.monthly_rate_etb);
  const deposit = Number(property.security_deposit_etb || 0);
  const total = calculateLongTermTotal(monthlyRate, data.months, deposit);

  const leaseApp = await transaction(async (client) => {
    // Prevent duplicate applications for the same property by the same tenant
    const { rows: existing } = await client.query(
      `SELECT 1 FROM lease_applications
       WHERE property_id = $1 AND tenant_id = $2 AND status = 'APPLIED'
       LIMIT 1`,
      [data.propertyId, data.tenantId]
    );
    if (existing.length > 0) {
      throw new ConflictError('You already have a pending application for this property');
    }
    return insertLeaseApplication(client, {
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      leaseStart: data.leaseStart,
      leaseEnd: data.leaseEnd,
      months: data.months,
      monthlyRateSnapshot: monthlyRate,
      depositSnapshot: deposit,
      totalContractEtb: total.total,
    });
  });

  return toPublicLease(leaseApp);
}

/**
 * Lists leases for the current tenant.
 */
export async function listMyLeases(tenantId) {
  const rows = await findLeasesByTenant(tenantId);
  return rows.map(toPublicLeaseWithProperty);
}

/**
 * Fetches a lease document (HTML) for printing. Only the tenant or admin can view it.
 * Returns a print-ready HTML string (no PDF yet — printer-friendly page in P1-D batch).
 *
 * @param {string} leaseId
 * @param {string} requesterId
 */
export async function getLeaseDocument(leaseId, requesterId) {
  const lease = await findLeaseById(leaseId);
  if (!lease) throw new NotFoundError('Lease');
  if (lease.tenant_id !== requesterId) {
    throw new ForbiddenError('You can only view your own lease documents');
  }

  // Load related data for the document
  const { rows: props } = await query(
    'SELECT title, title_am, city, neighborhood, house_rules, house_rules_am FROM properties WHERE id = $1',
    [lease.property_id]
  );
  const property = props[0];
  const { rows: users } = await query(
    'SELECT full_name FROM users WHERE id = $1',
    [lease.tenant_id]
  );
  const tenantName = users[0]?.full_name || 'Tenant';

  return buildLeaseHtml(lease, property, tenantName);
}

/**
 * Schedules a viewing.
 */
export async function scheduleViewing(data) {
  const { rows: props } = await query(
    'SELECT id FROM properties WHERE id = $1 AND is_active = TRUE LIMIT 1',
    [data.propertyId]
  );
  if (!props[0]) throw new NotFoundError('Property');

  const viewing = await transaction((client) =>
    insertViewing(client, {
      propertyId: data.propertyId,
      requesterId: data.requesterId,
      preferredDate: data.preferredDate,
      timeSlot: data.timeSlot,
      note: data.note,
    })
  );

  return toPublicViewing(viewing);
}

/**
 * Lists viewings for the current requester.
 */
export async function listMyViewings(requesterId) {
  const rows = await findViewingsByRequester(requesterId);
  return rows.map(toPublicViewingWithProperty);
}

// ── Lease HTML template ───────────────────────────────────────────────────

function buildLeaseHtml(lease, property, tenantName) {
  const start = lease.lease_start instanceof Date ? lease.lease_start.toISOString().slice(0, 10) : lease.lease_start;
  const end = lease.lease_end instanceof Date ? lease.lease_end.toISOString().slice(0, 10) : lease.lease_end;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Lease Agreement — ${escapeHtml(property.title)}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #0f172a; line-height: 1.6; }
  h1 { text-align: center; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
  h1 + p { text-align: center; font-family: sans-serif; color: #64748b; font-size: 12px; }
  h3 { font-size: 14px; margin-top: 24px; font-family: sans-serif; text-transform: uppercase; }
  p, li { font-size: 14px; }
  .sig { margin-top: 60px; display: flex; justify-content: space-between; font-family: sans-serif; font-size: 12px; }
  .sig div { width: 220px; }
  .sig hr { border: none; border-top: 1px solid #94a3b8; margin-bottom: 6px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>Residential Lease Agreement</h1>
  <p>የመኖሪያ ቤት ኪራይ ውል ስምምነት</p>

  <h3>1. Parties / ተዋዋዮች</h3>
  <p>This Lease Agreement is entered into between the <strong>Landlord</strong> and the <strong>Tenant</strong> listed below:</p>
  <p><strong>Tenant:</strong> ${escapeHtml(tenantName)}</p>
  <p><strong>Property Owner:</strong> ${escapeHtml(property.title_am || property.title)}</p>

  <h3>2. Premises / ንብረቱ</h3>
  <p>The Landlord agrees to rent the property located at:</p>
  <p><strong>${escapeHtml(property.neighborhood || '')}${property.neighborhood ? ', ' : ''}${escapeHtml(property.city || '')}</strong><br>${escapeHtml(property.title)}</p>

  <h3>3. Lease Term & Rent / የኪራይ ጊዜና ክፍያ</h3>
  <p><strong>Lease Start:</strong> ${start}<br><strong>Lease End:</strong> ${end}<br><strong>Monthly Rent:</strong> ${Number(lease.monthly_rate_snapshot).toLocaleString()} ETB<br><strong>Security Deposit:</strong> ${Number(lease.deposit_snapshot).toLocaleString()} ETB<br><strong>Total Contract Value:</strong> ${Number(lease.total_contract_etb).toLocaleString()} ETB</p>

  <h3>4. Utilities / መገልገያዎች</h3>
  <p>Utility inclusions are as displayed on the property listing. Tenant is responsible for any utility not explicitly included.</p>

  <h3>5. House Rules / የቤት ደንቦች</h3>
  <p>${escapeHtml(property.house_rules || 'Standard house rules apply.')}</p>
  <p style="font-family: sans-serif; font-size: 12px; color: #64748b;">${escapeHtml(property.house_rules_am || '')}</p>

  <h3>6. Governing Law / የሚመራበት ሕግ</h3>
  <p>This lease agreement is governed by the Civil Code and urban housing proclamations of the Federal Democratic Republic of Ethiopia.</p>
  <p style="font-family: sans-serif; font-size: 12px; color: #64748b;">ይህ የኪራይ ውል በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ ሲቪል ሕግና በከተማ ቤቶች ኪራይ አዋጆች ይመራል።</p>

  <div class="sig">
    <div>
      <hr>
      <strong>Landlord Signature</strong><br>
      Date: ______________
    </div>
    <div>
      <hr>
      <strong>Tenant Signature</strong><br>
      Date: ______________
    </div>
  </div>

  <p style="text-align: center; margin-top: 40px; font-family: sans-serif; font-size: 10px; color: #94a3b8;">
    Generated by Marefiyaye • ማረፊያዬ • Lease ID: ${escapeHtml(lease.id)}
  </p>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Mappers ───────────────────────────────────────────────────────────────

function toPublicLease(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    months: row.months,
    monthlyRateSnapshot: Number(row.monthly_rate_snapshot),
    depositSnapshot: Number(row.deposit_snapshot || 0),
    totalContractEtb: Number(row.total_contract_etb),
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPublicLeaseWithProperty(row) {
  return {
    ...toPublicLease(row),
    property: {
      slug: row.property_slug,
      title: row.property_title,
      titleAm: row.property_title_am,
      city: row.property_city,
      neighborhood: row.property_neighborhood,
      images: row.property_images || [],
    },
  };
}

function toPublicViewing(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    requesterId: row.requester_id,
    preferredDate: row.preferred_date,
    timeSlot: row.time_slot,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPublicViewingWithProperty(row) {
  return {
    ...toPublicViewing(row),
    property: {
      slug: row.property_slug,
      title: row.property_title,
      city: row.property_city,
      neighborhood: row.property_neighborhood,
    },
  };
}