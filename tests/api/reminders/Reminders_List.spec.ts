import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi } from './Reminders_API';
import { ReminderListSchema } from './Reminders_Schema';

/**
 * Example spec. This is here to show the patterns we use: a wrapper class, a
 * custom status matcher, and schema validation. It is deliberately minimal.
 *
 * Build your own coverage out from here. Every spec file should have at least
 * one @Healthcheck test.
 */
test.describe('Reminders list @ReadOnly', () => {
  test('returns 200 and a well-formed list @Healthcheck', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ page: 1, pageSize: 5 });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate the response shape, not just the status.
    ReminderListSchema.parse(body);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('pagination', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ page: 2, pageSize: 5 });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate response body
    ReminderListSchema.parse(body);
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(5);
    expect(body.items.length).toBe(5);
  });

  test('page 1 and page 2 contain different items', async ({ request }) => {
    const api = new RemindersApi(request);

    const response1 = await api.list({ page: 1, pageSize: 5 });
    await expect(response1).toHaveApiStatus(200);
    const response2 = await api.list({ page: 2, pageSize: 5 });
    await expect(response2).toHaveApiStatus(200);

    const page1 = ReminderListSchema.parse(
      await response1.json(),
    );
    const page2 = ReminderListSchema.parse(
      await response2.json(),
    );

    // Validate that there is no overlap between page 1 and page 2 items
    const page1Ids = page1.items.map((item) => item.id);
    const page2Ids = page2.items.map((item) => item.id);

    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap).toEqual([]);
  });

  test('open status parameter returns only open reminders', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ status: 'Open' });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate open status on all items
    ReminderListSchema.parse(body);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every(item => item.status === 'Open')).toBe(true);
  });

  test('done status parameter returns only done reminders', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ status: 'Done' });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate done status on all items
    ReminderListSchema.parse(body);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every(item => item.status === 'Done')).toBe(true);
  });

  test('sort dueDate is in ascending order', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ sort: 'dueDate' });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate dueDate is in ascending order
    ReminderListSchema.parse(body);
    const dueDates = body.items.map(item => new Date(item.dueDate).getTime());
    expect(dueDates).toEqual([...dueDates].sort((a, b) => a - b));
  });

  test('list sorted by createdAt desc is in descending order', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ sort: 'createdAt', order: 'desc' });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate createdAt is in descending order
    ReminderListSchema.parse(body);
    const createdDates = body.items.map((item) => item.createdAt);
    const sortedDesc = [...createdDates].sort().reverse();

    expect(createdDates).toEqual(sortedDesc);
  });

  test('list sorted by dueDate desc is in descending order', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ sort: 'dueDate', order: 'desc' });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate dueDate is in descending order
    ReminderListSchema.parse(body);
    const dueDates = body.items.map((item) => item.dueDate);
    const sortedDesc = [...dueDates].sort().reverse();

    expect(dueDates).toEqual(sortedDesc);
  });

  // negative tests below

  test('invalid pagination parameter returns 400', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ page: 0 });
    await expect(response).toHaveApiStatus(400);

    const body = await response.json();

    // Validate error response
    expect(body.error).toBeDefined();
  });

  test('invalid status parameter returns 400', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ status: 'invalid' });
    await expect(response).toHaveApiStatus(400);

    const body = await response.json();

    // Validate error response
    expect(body.error).toBeDefined();
  });

  test('invalid sort parameter returns 400', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ sort: 'invalid' });
    await expect(response).toHaveApiStatus(400);

    const body = await response.json();

    // Validate error response
    expect(body.error).toBeDefined();
  });

  test('invalid order parameter returns 400', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ order: 'invalid' });
    await expect(response).toHaveApiStatus(400);

    const body = await response.json();

    // Validate error response
    expect(body.error).toBeDefined();
  });
});
