# Contributing

Thank you for contributing.

## Prerequisites

- Node.js 18+
- npm 10+

## Setup

```bash
npm install
```

## Development

```bash
npm run test:watch
```

## Quality Gate

Before creating a pull request:

```bash
npm run check
```

## Pull Request Rules

- Keep changes focused.
- Add or update tests for behavior changes.
- Update `README.md` if API or behavior changes.

## Commit Messages

Use clear, descriptive messages. Example:

- `feat: add stopOnError behavior to runPool`
- `fix: avoid retrying aborted operations`
