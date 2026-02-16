import { describe, expect, it } from "vitest";
import { TaskTimeoutError, runPool } from "../src/index";

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("runPool", () => {
  it("respects concurrency", async () => {
    const inputs = [1, 2, 3, 4, 5, 6];
    let running = 0;
    let maxRunning = 0;

    const result = await runPool(
      inputs,
      async (value) => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await delay(15);
        running -= 1;
        return value * 2;
      },
      { concurrency: 2 }
    );

    expect(maxRunning).toBeLessThanOrEqual(2);
    expect(result.hasErrors).toBe(false);
    expect(result.fulfilled.map((entry) => entry.value)).toEqual([2, 4, 6, 8, 10, 12]);
  });

  it("retries per task and keeps stable result ordering", async () => {
    const attempts: Record<number, number> = {};
    const result = await runPool(
      [1, 2, 3],
      async (value, context) => {
        attempts[value] = context.attempt;
        if (value === 2 && context.attempt === 1) {
          throw new Error("retry once");
        }
        return value * 10;
      },
      {
        concurrency: 3,
        retry: {
          retries: 1,
          minDelayMs: 1,
          maxDelayMs: 1
        }
      }
    );

    expect(result.hasErrors).toBe(false);
    expect(result.results.map((entry) => (entry.status === "fulfilled" ? entry.value : null))).toEqual([10, 20, 30]);
    expect(attempts[2]).toBe(2);
  });

  it("marks not-started tasks as aborted when stopOnError is enabled", async () => {
    const result = await runPool(
      [1, 2, 3, 4, 5],
      async (value) => {
        if (value === 1) {
          throw new Error("boom");
        }
        await delay(50);
        return value;
      },
      {
        concurrency: 2,
        stopOnError: true
      }
    );

    expect(result.hasErrors).toBe(true);
    expect(result.failed).toBeGreaterThanOrEqual(1);
    expect(result.results.some((entry) => entry.status === "rejected" && entry.attempts === 0)).toBe(true);
  });

  it("returns timeout error in task result", async () => {
    const result = await runPool(
      [1],
      async () => {
        await delay(40);
        return 1;
      },
      {
        timeoutMs: 5
      }
    );

    expect(result.hasErrors).toBe(true);
    expect(result.rejected[0]?.reason).toBeInstanceOf(TaskTimeoutError);
  });
});
