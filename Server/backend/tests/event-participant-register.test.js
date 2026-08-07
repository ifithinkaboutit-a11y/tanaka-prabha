/**
 * Regression tests for EventParticipant.register.
 *
 * The INSERT once listed six target columns (…, status, id) while supplying
 * only five expressions. Postgres rejects that with 42601 "INSERT has more
 * target columns than expressions", so every event registration returned a 500
 * and the app showed "Could not submit your application. Please try again
 * later." Nothing caught it because the unit tests mock `query` and never
 * inspected the SQL.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../src/config/db.js', () => ({
  pool: { query: jest.fn(), on: jest.fn() },
  query: jest.fn(),
  supabase: {},
}));

const { query } = await import('../src/config/db.js');
const { default: EventParticipant } = await import('../src/models/EventParticipant.js');

/** Extract the "(a, b, c)" column list that follows INSERT INTO <table>. */
function parseInsertColumns(sql) {
  const match = sql.match(/INSERT\s+INTO\s+[\w.]+\s*\(([^)]*)\)/i);
  if (!match) throw new Error('No INSERT column list found in SQL');
  return match[1].split(',').map((c) => c.trim()).filter(Boolean);
}

/** Extract the "VALUES (...)" expression list. */
function parseInsertValues(sql) {
  const match = sql.match(/VALUES\s*\(([^)]*)\)/i);
  if (!match) throw new Error('No VALUES list found in SQL');
  return match[1].split(',').map((v) => v.trim()).filter(Boolean);
}

describe('EventParticipant.register — INSERT statement shape', () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [{ id: 'participant-1' }], rowCount: 1 });
  });

  test('column count matches the VALUES expression count', async () => {
    await EventParticipant.register('event-1', 'user-1', '9876543210', 'Test Farmer');

    const [sql] = query.mock.calls[0];
    const columns = parseInsertColumns(sql);
    const values = parseInsertValues(sql);

    expect(columns).toHaveLength(values.length);
  });

  test('does not write `id` — it has a gen_random_uuid() default', async () => {
    await EventParticipant.register('event-1', 'user-1', '9876543210', 'Test Farmer');

    const [sql] = query.mock.calls[0];
    expect(parseInsertColumns(sql)).not.toContain('id');
  });

  test('every positional placeholder has a matching bound parameter', async () => {
    await EventParticipant.register('event-1', 'user-1', '9876543210', 'Test Farmer');

    const [sql, params] = query.mock.calls[0];
    const highest = Math.max(
      ...[...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1]))
    );

    expect(params).toHaveLength(highest);
  });

  test('passes null rather than undefined when the user is unknown (walk-in)', async () => {
    await EventParticipant.register('event-1', undefined, '9876543210', 'Walk In');

    const [, params] = query.mock.calls[0];
    expect(params).not.toContain(undefined);
    expect(params[1]).toBeNull();
  });

  test('upserts on (event_id, mobile_number) so re-applying is not an error', async () => {
    await EventParticipant.register('event-1', 'user-1', '9876543210', 'Test Farmer');

    const [sql] = query.mock.calls[0];
    expect(sql).toMatch(/ON CONFLICT\s*\(\s*event_id\s*,\s*mobile_number\s*\)/i);
  });
});
