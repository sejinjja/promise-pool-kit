import { describe, expect, it } from "vitest";
import { PoolAbortedError, TaskTimeoutError, retry } from "../src/index";

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("retry", () => {
  it("retries transient failures and eventually succeeds", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        if (calls < 3) {
          throw new Error("temporary failure");
        }
        return "ok";
      },
      {
        retries: 4,
        minDelayMs: 1,
        maxDelayMs: 1
      }
    );

    expect(result).toBe("ok");
    expect(calls).toBe(3);
  });

  it("throws timeout error when attempt exceeds timeout", async () => {
    await expect(
      retry(
        async () => {
          await delay(50);
          return "late";
        },
        {
          retries: 0,
          timeoutMs: 10
        }
      )
    ).rejects.toBeInstanceOf(TaskTimeoutError);
  });

  it("stops when externally aborted", async () => {
    const controller = new AbortController();
    controller.abort("manual stop");

    await expect(
      retry(
        async () => "never",
        {
          signal: controller.signal
        }
      )
    ).rejects.toBeInstanceOf(PoolAbortedError);
  });
});
