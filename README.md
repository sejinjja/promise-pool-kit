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

`npm run check` also validates `CHANGELOG.md` heading format and version ordering.

## Open Source Workflow

1. Open an issue or discussion.
2. Create a branch and add tests for behavior changes.
3. Submit a pull request using the template.

## Publishing

```bash
npm run check
npm publish --access public --//registry.npmjs.org/:_authToken=$NPM_TOKEN
```

If the package is scoped and publish fails with `E403` about 2FA, use a granular npm token with `Read and Write` + `Bypass 2FA`, then set it as `NPM_TOKEN`.

If the package is scoped and first publish fails for access reasons, verify scope ownership:

```bash
npm whoami
npm access list packages <your-npm-id>
```

For automated tag-based publishing via GitHub Actions, set repository secret `NPM_TOKEN` (granular token with publish permission).
Tag-based publish also creates a GitHub release for the same tag automatically.
Tag-based publish requires a matching version entry in `CHANGELOG.md` and uploads the npm tarball as a workflow artifact.

For local release preparation:

```bash
npm run release:patch
# or: npm run release:minor / npm run release:major
# add --push by running the script directly:
node scripts/release.mjs patch --push
```

`--push` mode is guarded to run only on the `main` branch.

## License

MIT
