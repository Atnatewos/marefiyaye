/**
 * @file apps/api/src/queries/leases.queries.js
 *
 * SQL for lease applications and viewing requests.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Inserts a lease application. Must be inside a transaction.
 */
export async function insertLeaseApplication(client, data) {
  const { rows } = await client.query(
    `INSERT INTO ${TABLES.LEASE_APPLICATIONS}
       (property_id, tenant_id, lease_start, lease_end, months,
        monthly_rate_snapshot, deposit_snapshot, total_contract_etb, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPLIED')
     RETURNING *`,
    [
      data.propertyId,
      data.tenantId,
      data.leaseStart,
      data.leaseEnd,
      data.months,
      data.monthlyRateSnapshot,
      data.depositSnapshot,
      data.totalContractEtb,
    ]
  );
  return rows[0];
}

/**
 * Fetches all lease applications for a tenant, joined with property data.
 */
export async function findLeasesByTenant(tenantId) {
  const { rows } = await query(
    `SELECT la.*,
            p.slug AS property_slug,
            p.title AS property_title,
            p.title_am AS property_title_am,
            p.city AS property_city,
            p.neighborhood AS property_neighborhood,
            p.images AS property_images
     FROM ${TABLES.LEASE_APPLICATIONS} la
     JOIN ${TABLES.PROPERTIES} p ON p.id = la.property_id
     WHERE la.tenant_id = $1
     ORDER BY la.created_at DESC`,
    [tenantId]
  );
  return rows;
}

/**
 * Fetches a lease application by ID.
 */
export async function findLeaseById(id) {
  const { rows } = await query(
    `SELECT * FROM ${TABLES.LEASE_APPLICATIONS} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Inserts a viewing request.
 */
export async function insertViewing(client, data) {
  const { rows } = await client.query(
    `INSERT INTO ${TABLES.VIEWING_REQUESTS}
       (property_id, requester_id, preferred_date, time_slot, note, status)
     VALUES ($1, $2, $3, $4, $5, 'PENDING')
     RETURNING *`,
    [data.propertyId, data.requesterId, data.preferredDate, data.timeSlot, data.note || null]
  );
  return rows[0];
}

/**
 * Fetches viewings for a requester.
 */
export async function findViewingsByRequester(requesterId) {
  const { rows } = await query(
    `SELECT v.*,
            p.slug AS property_slug,
            p.title AS property_title,
            p.city AS property_city,
            p.neighborhood AS property_neighborhood
     FROM ${TABLES.VIEWING_REQUESTS} v
     JOIN ${TABLES.PROPERTIES} p ON p.id = v.property_id
     WHERE v.requester_id = $1
     ORDER BY v.created_at DESC`,
    [requesterId]
  );
  return rows;
}