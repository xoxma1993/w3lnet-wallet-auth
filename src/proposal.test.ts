import { describe, expect, it } from "vitest";
import { DEFAULT_WALLET_AUTH_PROPOSAL } from "./proposal.js";

describe("DEFAULT_WALLET_AUTH_PROPOSAL", () => {
  it("requires TRON and EVM namespaces", () => {
    expect(DEFAULT_WALLET_AUTH_PROPOSAL.requiredNamespaces.tron?.chains).toEqual(["tron:0x2b6653dc"]);
    expect(DEFAULT_WALLET_AUTH_PROPOSAL.requiredNamespaces.eip155?.chains).toEqual(["eip155:1", "eip155:137", "eip155:56"]);
  });

  it("does not include optional namespaces by default", () => {
    expect(DEFAULT_WALLET_AUTH_PROPOSAL.optionalNamespaces).toEqual({});
  });
});
