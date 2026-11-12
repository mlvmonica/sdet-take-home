import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi } from './Reminders_API';
import { ReminderSchema } from './Reminders_Schema';

test.describe('Create reminder', () => {
  test('creates a reminder @Healthcheck', async ({ request }) => {
    const api = new RemindersApi(request);
    const input = {
      patientName: 'Healthcheck Patient',
      title: 'Healthcheck reminder',
      dueDate: '2026-12-01T12:00:00.000Z',
    };

    const response = await api.create(input);
    await expect(response).toHaveApiStatus(201);

    // Validate response shape and item
    const reminder = ReminderSchema.parse(await response.json());
    expect(reminder.patientName).toBe(input.patientName);
    expect(reminder.title).toBe(input.title);
    expect(reminder.dueDate).toBe(input.dueDate);
    expect(reminder.status).toBe('Open');
  });

  test('creates a reminder with all fields and Done status', async ({ request }) => {
    const api = new RemindersApi(request);
    const input = {
      patientName: 'Complete Patient',
      title: 'Completed reminder',
      notes: 'Reminder created as done',
      dueDate: '2026-12-01T12:00:00.000Z',
      status: 'Done',
    };

    const response = await api.create(input);
    await expect(response).toHaveApiStatus(201);

    // Validate response shape and item
    const reminder = ReminderSchema.parse(await response.json());
    expect(reminder.patientName).toBe(input.patientName);
    expect(reminder.title).toBe(input.title);
    expect(reminder.notes).toBe(input.notes);
    expect(reminder.dueDate).toBe(input.dueDate);
    expect(reminder.status).toBe(input.status);
  });

  // negative tests below

  test('missing patientName returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      title: 'Reminder without patient',
      dueDate: '2026-12-01T12:00:00.000Z',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('patientName is required');
  });

  test('missing title returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: 'Patient without title',
      dueDate: '2026-12-01T12:00:00.000Z',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('title is required');
  });

  test('empty patientName returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: '',
      title: 'Reminder with empty patient name',
      dueDate: '2026-12-01T12:00:00.000Z',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('patientName is required');
  });

  test('empty title returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: 'Patient with empty title',
      title: '',
      dueDate: '2026-12-01T12:00:00.000Z',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('title is required');
  });

  test('missing dueDate returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: 'Patient without due date',
      title: 'Reminder without due date',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('dueDate must be a valid date');
  });

  test('invalid dueDate returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: 'Patient with invalid due date',
      title: 'Reminder with invalid due date',
      dueDate: 'not-a-date',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('dueDate must be a valid date');
  });

  test('invalid status returns 400', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create({
      patientName: 'Patient with invalid status',
      title: 'Reminder with invalid status',
      dueDate: '2026-12-01T12:00:00.000Z',
      status: 'invalid',
    });
    await expect(response).toHaveApiStatus(400);

    // Validate error response
    const body = await response.json();
    expect(body.errors).toContain('status must be one of Open, Done');
  });
});
