export type RetryJitter = "none" | "full";

export interface BaseRetryOptions {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: RetryJitter;
  shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
}

export interface RetryOptions extends BaseRetryOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  onRetry?: (event: RetryEvent) => void;
}

export interface RetryEvent {
  attempt: number;
  nextAttempt: number;
  delayMs: number;
  error: unknown;
}

export interface PoolWorkerContext {
  index: number;
  attempt: number;
  signal: AbortSignal;
}

export interface PoolOptions<TInput, TResult> {
  concurrency?: number;
  retry?: BaseRetryOptions;
  timeoutMs?: number;
  signal?: AbortSignal;
  stopOnError?: boolean;
  onProgress?: (progress: PoolProgress<TInput, TResult>) => void;
}

interface NormalizedRetryOptions {
  retries: number;
  minDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitter: RetryJitter;
  shouldRetry: (error: unknown, attempt: number) => boolean | Promise<boolean>;
}

export interface PoolBaseResult<TInput> {
  status: "fulfilled" | "rejected";
  index: number;
  input: TInput;
  attempts: number;
  durationMs: number;
}

export interface PoolFulfilledResult<TInput, TResult> extends PoolBaseResult<TInput> {
  status: "fulfilled";
  value: TResult;
}

export interface PoolRejectedResult<TInput> extends PoolBaseResult<TInput> {
  status: "rejected";
  reason: unknown;
}

export type PoolSettledResult<TInput, TResult> =
  | PoolFulfilledResult<TInput, TResult>
  | PoolRejectedResult<TInput>;

export interface PoolProgress<TInput, TResult> {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  running: number;
  pending: number;
  percentage: number;
  lastResult?: PoolSettledResult<TInput, TResult>;
}

export interface PoolRunResult<TInput, TResult> {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  hasErrors: boolean;
  results: Array<PoolSettledResult<TInput, TResult>>;
  fulfilled: Array<PoolFulfilledResult<TInput, TResult>>;
  rejected: Array<PoolRejectedResult<TInput>>;
}

export class PoolAbortedError extends Error {
  constructor(message = "Operation aborted.") {
    super(message);
    this.name = "PoolAbortedError";
  }
}

export class TaskTimeoutError extends Error {
  readonly taskIndex: number;
  readonly timeoutMs: number;

  constructor(taskIndex: number, timeoutMs: number) {
    super(
      taskIndex >= 0
        ? `Task ${taskIndex} timed out after ${timeoutMs}ms.`
        : `Operation timed out after ${timeoutMs}ms.`
    );
    this.name = "TaskTimeoutError";
    this.taskIndex = taskIndex;
    this.timeoutMs = timeoutMs;
  }
}

const DEFAULT_RETRY: NormalizedRetryOptions = {
  retries: 0,
  minDelayMs: 100,
  maxDelayMs: 5000,
  factor: 2,
  jitter: "none",
  shouldRetry: (error: unknown) => !(error instanceof PoolAbortedError)
};

function toAbortError(reason: unknown, fallbackMessage: string): Error {
  if (reason instanceof Error) {
    return reason;
  }
  if (typeof reason === "string" && reason.trim().length > 0) {
    return new PoolAbortedError(reason);
  }
  return new PoolAbortedError(fallbackMessage);
}

function asNonNegativeInteger(value: number | undefined, name: string, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer.`);
  }
  return value;
}

function asPositiveInteger(value: number | undefined, name: string, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer.`);
  }
  return value;
}

function asPositiveNumber(value: number | undefined, name: string, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive number.`);
  }
  return value;
}

function asOptionalPositiveInteger(value: number | undefined, name: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer.`);
  }
  return value;
}

function normalizeRetryOptions(options: BaseRetryOptions | undefined): NormalizedRetryOptions {
  const retries = asNonNegativeInteger(options?.retries, "retries", DEFAULT_RETRY.retries);
  const minDelayMs = asPositiveInteger(options?.minDelayMs, "minDelayMs", DEFAULT_RETRY.minDelayMs);
  const maxDelayMs = asPositiveInteger(options?.maxDelayMs, "maxDelayMs", DEFAULT_RETRY.maxDelayMs);
  const factor = asPositiveNumber(options?.factor, "factor", DEFAULT_RETRY.factor);
  const jitter = options?.jitter ?? DEFAULT_RETRY.jitter;

  if (jitter !== "none" && jitter !== "full") {
    throw new TypeError("jitter must be either 'none' or 'full'.");
  }
  if (minDelayMs > maxDelayMs) {
    throw new TypeError("minDelayMs cannot be larger than maxDelayMs.");
  }

  return {
    retries,
    minDelayMs,
    maxDelayMs,
    factor,
    jitter,
    shouldRetry: options?.shouldRetry ?? DEFAULT_RETRY.shouldRetry
  };
}

function computeDelayMs(options: NormalizedRetryOptions, retryAttempt: number): number {
  const exponential = options.minDelayMs * options.factor ** Math.max(retryAttempt - 1, 0);
  const bounded = Math.min(exponential, options.maxDelayMs);
  if (options.jitter === "full") {
    return Math.floor(Math.random() * (bounded + 1));
  }
  return Math.floor(bounded);
}

function createLinkedAbortController(
  signals: Array<AbortSignal | undefined>,
  fallbackMessage: string
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();
  const listeners: Array<{ signal: AbortSignal; listener: () => void }> = [];

  for (const signal of signals) {
    if (!signal) {
      continue;
    }
    if (signal.aborted) {
      controller.abort(toAbortError(signal.reason, fallbackMessage));
      break;
    }
    const listener = (): void => {
      if (!controller.signal.aborted) {
        controller.abort(toAbortError(signal.reason, fallbackMessage));
      }
    };
    signal.addEventListener("abort", listener, { once: true });
    listeners.push({ signal, listener });
  }

  const cleanup = (): void => {
    for (const { signal, listener } of listeners) {
      signal.removeEventListener("abort", listener);
    }
  };

  return { controller, cleanup };
}

function createAbortPromise(
  signal: AbortSignal,
  fallbackMessage: string
): { promise: Promise<never>; cleanup: () => void } {
  let listener: (() => void) | undefined;
  const promise = new Promise<never>((_, reject) => {
    listener = (): void => reject(toAbortError(signal.reason, fallbackMessage));
    if (signal.aborted) {
      listener();
      return;
    }
    signal.addEventListener("abort", listener, { once: true });
  });

  return {
    promise,
    cleanup: (): void => {
      if (listener) {
        signal.removeEventListener("abort", listener);
      }
    }
  };
}

async function sleep(delayMs: number, signal: AbortSignal, abortMessage: string): Promise<void> {
  if (delayMs <= 0) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(toAbortError(signal.reason, abortMessage));
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);

    const onAbort = (): void => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(toAbortError(signal.reason, abortMessage));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function runWithAttemptTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: {
    signal: AbortSignal;
    timeoutMs?: number;
    timeoutErrorFactory: () => Error;
    abortMessage: string;
  }
): Promise<T> {
  const { controller, cleanup } = createLinkedAbortController([options.signal], options.abortMessage);
  let timeoutHandle: NodeJS.Timeout | undefined;
  let timeoutPromise: Promise<never> | undefined;
  const operationPromise = Promise.resolve().then(() => operation(controller.signal));
  const { promise: abortPromise, cleanup: cleanupAbortPromise } = createAbortPromise(
    controller.signal,
    options.abortMessage
  );

  if (typeof options.timeoutMs === "number") {
    timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        const timeoutError = options.timeoutErrorFactory();
        if (!controller.signal.aborted) {
          controller.abort(timeoutError);
        }
        reject(timeoutError);
      }, options.timeoutMs);
    });
  }

  try {
    const contenders: Array<Promise<T>> = [operationPromise, abortPromise as Promise<T>];
    if (timeoutPromise) {
      contenders.push(timeoutPromise as Promise<T>);
    }
    return await Promise.race(contenders);
  } finally {
    cleanupAbortPromise();
    cleanup();
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export async function retry<T>(
  operation: (attempt: number, signal: AbortSignal) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const normalized = normalizeRetryOptions(options);
  const timeoutMs = asOptionalPositiveInteger(options.timeoutMs, "timeoutMs");
  const { controller, cleanup } = createLinkedAbortController([options.signal], "Retry operation aborted.");
  const maxAttempts = normalized.retries + 1;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await runWithAttemptTimeout(
          (signal) => operation(attempt, signal),
          {
            signal: controller.signal,
            timeoutMs,
            timeoutErrorFactory: () => new TaskTimeoutError(-1, timeoutMs ?? 0),
            abortMessage: "Retry operation aborted."
          }
        );
      } catch (error) {
        if (attempt >= maxAttempts) {
          throw error;
        }
        const shouldRetry = await normalized.shouldRetry(error, attempt);
        if (!shouldRetry) {
          throw error;
        }
        const delayMs = computeDelayMs(normalized, attempt);
        options.onRetry?.({
          attempt,
          nextAttempt: attempt + 1,
          delayMs,
          error
        });
        await sleep(delayMs, controller.signal, "Retry wait aborted.");
      }
    }
  } finally {
    cleanup();
  }

  throw new Error("Unreachable retry state.");
}

function toPoolResultError(reason: unknown): unknown {
  if (reason instanceof Error) {
    return reason;
  }
  if (typeof reason === "string" && reason.trim().length > 0) {
    return new Error(reason);
  }
  return reason;
}

function isRejected<TInput, TResult>(
  result: PoolSettledResult<TInput, TResult>
): result is PoolRejectedResult<TInput> {
  return result.status === "rejected";
}

function isFulfilled<TInput, TResult>(
  result: PoolSettledResult<TInput, TResult>
): result is PoolFulfilledResult<TInput, TResult> {
  return result.status === "fulfilled";
}

export async function runPool<TInput, TResult>(
  inputs: Iterable<TInput>,
  worker: (input: TInput, context: PoolWorkerContext) => Promise<TResult>,
  options: PoolOptions<TInput, TResult> = {}
): Promise<PoolRunResult<TInput, TResult>> {
  const items = Array.isArray(inputs) ? inputs.slice() : Array.from(inputs);
  const total = items.length;

  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      hasErrors: false,
      results: [],
      fulfilled: [],
      rejected: []
    };
  }

  const retryOptions = normalizeRetryOptions(options.retry);
  const timeoutMs = asOptionalPositiveInteger(options.timeoutMs, "timeoutMs");
  const stopOnError = options.stopOnError ?? false;
  const concurrency = Math.min(asPositiveInteger(options.concurrency, "concurrency", 5), total);
  const { controller: poolController, cleanup } = createLinkedAbortController(
    [options.signal],
    "Pool execution aborted."
  );

  const results = new Array<PoolSettledResult<TInput, TResult> | undefined>(total);
  let nextIndex = 0;
  let running = 0;
  let completed = 0;
  let succeeded = 0;
  let failed = 0;

  const emitProgress = (lastResult?: PoolSettledResult<TInput, TResult>): void => {
    options.onProgress?.({
      total,
      completed,
      succeeded,
      failed,
      running,
      pending: Math.max(total - completed - running, 0),
      percentage: Math.round((completed / total) * 100),
      lastResult
    });
  };

  const runSingle = async (index: number): Promise<void> => {
    const input = items[index];
    const startedAt = Date.now();
    let attempts = 0;
    let settled: PoolSettledResult<TInput, TResult> | undefined;
    running += 1;

    try {
      const value = await retry(
        async (attempt, signal) => {
          attempts = attempt;
          return worker(input, { index, attempt, signal });
        },
        {
          ...retryOptions,
          signal: poolController.signal,
          timeoutMs
        }
      );

      settled = {
        status: "fulfilled",
        index,
        input,
        value,
        attempts,
        durationMs: Date.now() - startedAt
      };
      succeeded += 1;
      completed += 1;
      results[index] = settled;
    } catch (error) {
      settled = {
        status: "rejected",
        index,
        input,
        reason: toPoolResultError(error),
        attempts,
        durationMs: Date.now() - startedAt
      };
      failed += 1;
      completed += 1;
      results[index] = settled;

      if (stopOnError && !poolController.signal.aborted) {
        poolController.abort(new PoolAbortedError(`Pool aborted because task ${index} failed.`));
      }
    } finally {
      running -= 1;
      if (settled) {
        emitProgress(settled);
      }
    }
  };

  const runner = async (): Promise<void> => {
    while (!poolController.signal.aborted) {
      const index = nextIndex;
      if (index >= total) {
        return;
      }
      nextIndex += 1;
      await runSingle(index);
    }
  };

  try {
    await Promise.all(Array.from({ length: concurrency }, () => runner()));
  } finally {
    cleanup();
  }

  if (poolController.signal.aborted) {
    const abortError = toAbortError(poolController.signal.reason, "Pool execution aborted.");
    for (let index = 0; index < total; index += 1) {
      if (results[index]) {
        continue;
      }
      const settled: PoolRejectedResult<TInput> = {
        status: "rejected",
        index,
        input: items[index],
        reason: abortError,
        attempts: 0,
        durationMs: 0
      };
      results[index] = settled;
      failed += 1;
      completed += 1;
      emitProgress(settled);
    }
  }

  const settledResults = results.map((result, index) => {
    if (result) {
      return result;
    }
    return {
      status: "rejected",
      index,
      input: items[index],
      reason: new PoolAbortedError("Task did not execute."),
      attempts: 0,
      durationMs: 0
    } satisfies PoolRejectedResult<TInput>;
  });

  const fulfilled = settledResults.filter(isFulfilled);
  const rejected = settledResults.filter(isRejected);

  return {
    total,
    completed: settledResults.length,
    succeeded: fulfilled.length,
    failed: rejected.length,
    hasErrors: rejected.length > 0,
    results: settledResults,
    fulfilled,
    rejected
  };
}

export function assertPoolSuccess<TInput, TResult>(result: PoolRunResult<TInput, TResult>): void {
  if (!result.hasErrors) {
    return;
  }
  const reasons = result.rejected.map((entry) => entry.reason);
  throw new AggregateError(reasons, `${result.failed} task(s) failed in runPool.`);
}
