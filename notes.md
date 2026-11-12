## Bugs found

Short repros with the endpoint, input, and expected vs. actual behavior:

- **Empty title is accepted**
  - Endpoint/input: `POST /reminders` with `title: ""` and a valid `patientName` and `dueDate`.
  - Expected: `400` with validation errors.
  - Actual: `201`; a reminder is created with an empty title.

- **Completing a missing reminder returns 200**
  - Endpoint/input: `POST /reminders/r-999/complete` (or any non-existent ID).
  - Expected: `404`.
  - Actual: `200` with `{}`.

- **Sort order desc is ignored**
  - Endpoint/input: `GET /reminders?sort=createdAt&order=desc`.
    - Expected: newest first.
    - Actual: oldest first, same as ascending order.
  - Endpoint/input: `GET /reminders?sort=dueDate&order=desc`.
    - Expected: latest due date first.
    - Actual: earliest due date first, same as ascending order.

- **List query parameters are not validated** (These might be a feature request, since invalid responses are not specified in the API reference)
  - `GET /reminders?page=0` — expected `400`; actual `200` with the first page.
  - `GET /reminders?status=invalid` — expected `400`; actual `200` with no items.
  - `GET /reminders?sort=invalid` — expected `400`; actual `200` with the normal list.
  - `GET /reminders?order=invalid` — expected `400`; actual `200` with the normal list.

## Load results

Ran load test with 2 virtual users for 30s. There were 64 requests and all checks passed.
95% of all requests finished in under 3.39ms against a 200ms threshold
Error rate was 0% against a 1% threshold
Create duration averaged 1.78ms with 95% of create requests finishing in under 2.98ms.
This looks healthy for a small load. Response times are well under the threshold and there were no errors at all. Next I would dig into raising the virtual users step by step, to 10, then 25, then 50, and running for longer than 30s, to find when response times start to approach the threshold or errors start to appear (the breaking point).

## What todo next

I would add more tests for pageSize limits, testing what happens with a very large pageSize, pageSize set to 0, and a page number past the last page.
I would also create other test suites that can be run on their own. Currently there is only the full Playwright suite and the @Healthcheck smoke suite. I would add a negative test suite for the invalid input tests so that those can be ran separately.