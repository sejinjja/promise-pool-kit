# @sejinjja/promise-pool-kit

Lightweight TypeScript utilities for async workloads:

- retry with exponential backoff and jitter
- task-level timeout
- concurrency-limited promise pool
- abort signal support

## Installation

```bash
npm i @sejinjja/promise-pool-kit
```

## Quick Start

```ts
import { runPool } from "@sejinjja/promise-pool-kit";

const urls = [
  "https://api.example.com/a",
  "https://api.example.com/b",
  "https://api.example.com/c"
];

const result = await runPool(
  urls,
  async (url, { signal }) => {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  },
  {
    concurrency: 4,
    timeoutMs: 5000,
    retry: {
      retries: 2,
      minDelayMs: 200,
      maxDelayMs: 2000,
      jitter: "full"
    }
  }
);

if (result.hasErrors) {
  console.error(result.rejected);
} else {
  console.log(result.fulfilled.map((item) => item.value));
}
```

## API

### `retry(operation, options?)`

Retry a single async operation.

```ts
import { retry } from "@sejinjja/promise-pool-kit";

const token = await retry(
  async (attempt) => {
    const response = await fetch("https://example.com/token");
    if (!response.ok) throw new Error(`Failed attempt ${attempt}`);
    return response.text();
  },
  {
    retries: 3,
    minDelayMs: 100,
    maxDelayMs: 2000,
    jitter: "full",
    timeoutMs: 3000
  }
);
```

### `runPool(inputs, worker, options?)`

Run tasks with controlled concurrency.

- `concurrency` default: `5`
- `stopOnError` default: `false`
- `timeoutMs` applies per task attempt
- `retry` applies per task
- `onProgress` receives current summary and last settled task

### `assertPoolSuccess(result)`

Throw `AggregateError` when `runPool` contains rejected tasks.

## Error Types

- `PoolAbortedError`
- `TaskTimeoutError`

## Local Development

```bash
npm install
npm run check
```

`npm run check` also validates `CHANGELOG.md` heading format, version ordering, release-date validity, section bullet presence, `package-lock.json` metadata consistency, `npm pack --dry-run` file list expectations, and `main/module/types/exports` metadata consistency.

## Open Source Workflow

1. Open an issue or discussion.
2. Create a branch and add tests for behavior changes.
3. Submit a pull request using the template.

## License

MIT
