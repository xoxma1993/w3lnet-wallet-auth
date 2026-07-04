import { describe, expect, it } from "vitest";
import { createMemoryNonceStore } from "./memoryNonceStore.js";

describe("createMemoryNonceStore", () => {
  it("consumes nonce once", async () => {
    const store = createMemoryNonceStore();
    await store.save({ nonce: "nonce", message: "message", expiresAt: new Date(Date.now() + 10_000), consumed: false });

    expect(await store.consume("nonce", "message")).toBe(true);
    expect(await store.consume("nonce", "message")).toBe(false);
  });

  it("rejects expired nonce", async () => {
    const store = createMemoryNonceStore();
    await store.save({ nonce: "nonce", message: "message", expiresAt: new Date(Date.now() - 1), consumed: false });

    expect(await store.consume("nonce", "message")).toBe(false);
  });

  it("rejects changed message", async () => {
    const store = createMemoryNonceStore();
    await store.save({ nonce: "nonce", message: "message", expiresAt: new Date(Date.now() + 10_000), consumed: false });

    expect(await store.consume("nonce", "changed")).toBe(false);
  });
});
