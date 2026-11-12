import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi } from './Reminders_API';
import { ReminderSchema } from './Reminders_Schema';

test.describe('Complete reminder', () => {
  test('marks a reminder as Done then verifies the status @Healthcheck', async ({ request }) => {
    const api = new RemindersApi(request);
    const createResponse = await api.create({
      patientName: 'Completion Healthcheck Patient',
      title: 'Reminder to complete',
      dueDate: '2026-12-01T12:00:00.000Z',
    });
    await expect(createResponse).toHaveApiStatus(201);

    // Validate response shape and item
    const created = ReminderSchema.parse(await createResponse.json());

    const response = await api.complete(created.id);
    await expect(response).toHaveApiStatus(200);

    // Validate response shape and updated status
    const reminder = ReminderSchema.parse(await response.json());
    expect(reminder.id).toBe(created.id);
    expect(reminder.status).toBe('Done');

    const getResponse = await api.getById(created.id);
    await expect(getResponse).toHaveApiStatus(200);

    // Validate that the fetched reminder reflects the completed status
    const fetched = ReminderSchema.parse(await getResponse.json());
    expect(fetched.status).toBe('Done');
  });

  // negative tests below

  test('returns 404 for non-existent reminder ID', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.complete('r-999');

    // Validate error response
    await expect(response).toHaveApiStatus(404);
  });
});
