import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createMemoryNonceStore } from "./memoryNonceStore.js";
import { createWalletAuthRouter, type WalletAuthSecurityEvent } from "./express.js";

function createApp(events: WalletAuthSecurityEvent[]) {
  const app = express();

  app.use(express.json());
  app.use(
    "/auth",
    createWalletAuthRouter({
      nonceStore: createMemoryNonceStore(),
      honeypot: true,
      onSecurityEvent(event) {
        events.push(event);
      },
      issueSession() {
        throw new Error("not used in these tests");
      }
    })
  );

  return app;
}

describe("createWalletAuthRouter security events", () => {
  it("emits honeypot events for unknown auth routes", async () => {
    const events: WalletAuthSecurityEvent[] = [];
    const app = createApp(events);

    await request(app).get("/auth/admin").expect(404);

    expect(events).toMatchObject([{ type: "honeypot", method: "GET", detail: "Unknown wallet-auth route requested" }]);
  });

  it("emits invalid nonce events", async () => {
    const events: WalletAuthSecurityEvent[] = [];
    const app = createApp(events);

    await request(app)
      .post("/auth/verify")
      .send({
        namespace: "tron",
        chainId: "tron:0x2b6653dc",
        account: "TX6enXAfhBKmjTMW7mTbqGeJxXLRmN3cEe",
        nonce: "1234567890123456",
        message: "message",
        signature: "signature",
        approvedNamespaces: {
          tron: {
            chains: ["tron:0x2b6653dc"],
            methods: ["tron_signMessage", "tron_signTransaction"],
            events: ["accountsChanged"],
            accounts: ["tron:0x2b6653dc:TX6enXAfhBKmjTMW7mTbqGeJxXLRmN3cEe"]
          },
          eip155: {
            chains: ["eip155:1", "eip155:137", "eip155:56"],
            methods: ["personal_sign", "eth_sendTransaction", "eth_signTypedData_v4"],
            events: ["accountsChanged", "chainChanged"],
            accounts: ["eip155:1:0x7e45c9d1161A82c7D22C604660c256A5B2d88f5D"]
          }
        }
      })
      .expect(400);

    expect(events.some((event) => event.type === "invalid_nonce")).toBe(true);
  });
});
