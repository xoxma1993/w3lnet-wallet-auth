import { describe, expect, it } from "vitest";
import { DEFAULT_WALLET_AUTH_PROPOSAL } from "./proposal.js";
import { authVerifySchema, createNonceMessage, validateApprovedNamespaces } from "./server.js";
import type { AuthVerifyRequest } from "./types.js";

const validRequest: AuthVerifyRequest = {
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
};

describe("createNonceMessage", () => {
  it("creates deterministic message when issuedAt is supplied", () => {
    const issuedAt = new Date("2026-01-01T00:00:00.000Z");
    const nonce = createNonceMessage({ appName: "Test App", nonce: "nonce-1", issuedAt, ttlMs: 60_000 });

    expect(nonce.message).toContain("Sign in to Test App");
    expect(nonce.message).toContain("Nonce: nonce-1");
    expect(nonce.expiresAt).toBe("2026-01-01T00:01:00.000Z");
  });
});

describe("authVerifySchema", () => {
  it("parses valid verify request", () => {
    expect(authVerifySchema.parse(validRequest).namespace).toBe("tron");
  });

  it("rejects unknown namespaces", () => {
    expect(() => authVerifySchema.parse({ ...validRequest, approvedNamespaces: { ...validRequest.approvedNamespaces, solana: {} } })).toThrow();
  });
});

describe("validateApprovedNamespaces", () => {
  it("accepts valid approved namespaces", () => {
    expect(() => validateApprovedNamespaces({ request: validRequest })).not.toThrow();
  });

  it("rejects missing required namespace", () => {
    expect(() =>
      validateApprovedNamespaces({
        request: {
          ...validRequest,
          approvedNamespaces: {
            tron: validRequest.approvedNamespaces.tron
          }
        }
      })
    ).toThrow("eip155");
  });

  it("rejects unknown approved chain", () => {
    expect(() =>
      validateApprovedNamespaces({
        request: {
          ...validRequest,
          approvedNamespaces: {
            ...validRequest.approvedNamespaces,
            eip155: {
              ...validRequest.approvedNamespaces.eip155!,
              chains: [...validRequest.approvedNamespaces.eip155!.chains, "eip155:999"]
            }
          }
        }
      })
    ).toThrow("unknown chains");
  });

  it("rejects when signer is not in approved accounts", () => {
    expect(() => validateApprovedNamespaces({ request: { ...validRequest, account: "TDifferentAddress111111111111111111111" } })).toThrow("authenticated account");
  });

  it("accepts a custom proposal", () => {
    expect(() => validateApprovedNamespaces({ request: validRequest, proposal: DEFAULT_WALLET_AUTH_PROPOSAL })).not.toThrow();
  });
});
