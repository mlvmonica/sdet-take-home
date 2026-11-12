import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { smoke } from '../profiles/smoke';
import { url } from '../shared/http';

/**
 * Example k6 scenario against the Reminders API.
 *
 * This is a minimal starting point: it lists reminders and checks the status.
 * For Part C, build this into a realistic journey (for example: search, page
 * through results, then fetch a detail), add a custom metric, and set a couple
 * of thresholds (for example a p95 response-time budget and an error ceiling).
 *
 * Run:
 *   npm run api        # in one terminal
 *   npm run k6:build   # bundle scenarios to load/dist/
 *   npm run k6:smoke   # runs load/dist/reminders-smoke.js
 */

const createDuration = new Trend('create_duration');

export const options = {
  vus: smoke.vus,
  duration: smoke.duration,
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // List reminders
  const res = http.get(url('/reminders?page=1&pageSize=10'));

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Create a reminder
  const payload = JSON.stringify({
    patientName: 'Load Test Patient',
    title: 'Load test reminder',
    notes: 'Created by k6 smoke test',
    dueDate: '2026-12-01T12:00:00.000Z',
  });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const createRes = http.post(url('/reminders'), payload, params);
  check(createRes, { 'create status is 201': (r) => r.status === 201 });
  createDuration.add(createRes.timings.duration);
  sleep(1);

  const created = createRes.json() as { id: string };

  // Get the reminder just created
  const getRes = http.get(url(`/reminders/${created.id}`));
  check(getRes, { 'get status is 200': (r) => r.status === 200 });
  sleep(1);

  // Complete it
  const completeRes = http.post(url(`/reminders/${created.id}/complete`));
  check(completeRes, { 'complete status is 200': (r) => r.status === 200 });
  sleep(1);
}
