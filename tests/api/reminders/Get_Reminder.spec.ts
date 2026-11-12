import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi } from './Reminders_API';
import { ReminderSchema } from './Reminders_Schema';

test.describe('Get reminder', () => {
  test('returns a reminder by ID @Healthcheck', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.getById('r-001');
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate response shape and item
    const reminder = ReminderSchema.parse(body);
    expect(reminder.id).toBe('r-001');
  });

  test('returns a created reminder by ID', async ({ request }) => {
    const api = new RemindersApi(request);

    const createResponse = await api.create({
        patientName: 'Alex Rivera',
        title: 'Follow-up bloodwork',
        notes: 'Bring insurance card',
        dueDate: '2026-11-15T10:00:00.000Z',
    });
    await expect(createResponse).toHaveApiStatus(201);

    const created = ReminderSchema.parse(await createResponse.json());

    const response = await api.getById(created.id);
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();

    // Validate response matches the created reminder
    const fetched = ReminderSchema.parse(body);
    expect(fetched.id).toBe(created.id);
    expect(fetched.patientName).toBe('Alex Rivera');
    expect(fetched.title).toBe('Follow-up bloodwork');
    expect(fetched.notes).toBe('Bring insurance card');
    expect(fetched.dueDate).toBe('2026-11-15T10:00:00.000Z');
    expect(fetched.status).toBe('Open');
  });

  // negative tests below

  test('returns 404 for non-existent reminder ID', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.getById('r-999');
    await expect(response).toHaveApiStatus(404);

    const body = await response.json();

    // Validate error response
    expect(body.error).toBeDefined();
  });
});