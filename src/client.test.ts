import { describe, expect, it } from "vitest";
import { normalizeConnectedSession, normalizeNamespaces } from "./client.js";

const rawSession = {
  topic: "topic-1",
  namespaces: {
    tron: {
      methods: ["tron_signTransaction", "tron_signMessage"],
      events: ["accountsChanged"],
      accounts: ["tron:0x2b6653dc:TX6enXAfhBKmjTMW7mTbqGeJxXLRmN3cEe"]
    },
    eip155: {
      chains: ["eip155:1", "eip155:137", "eip155:56"],
      methods: ["personal_sign"],
      events: ["accountsChanged"],
      accounts: [
        "eip155:1:0x7e45c9d1161A82c7D22C604660c256A5B2d88f5D",
        "eip155:137:0x7e45c9d1161A82c7D22C604660c256A5B2d88f5D"
      ]
    }
  }
};

describe("normalizeNamespaces", () => {
  it("derives chains from accounts when chains are missing", () => {
    const namespaces = normalizeNamespaces(rawSession);

    expect(namespaces.tron?.chains).toEqual(["tron:0x2b6653dc"]);
    expect(namespaces.eip155?.chains).toEqual(["eip155:1", "eip155:137", "eip155:56"]);
  });
});

describe("normalizeConnectedSession", () => {
  it("extracts TRON signer and preserves namespaces", () => {
    const connected = normalizeConnectedSession(rawSession);

    expect(connected.topic).toBe("topic-1");
    expect(connected.chainId).toBe("tron:0x2b6653dc");
    expect(connected.account).toBe("TX6enXAfhBKmjTMW7mTbqGeJxXLRmN3cEe");
    expect(connected.namespaces.eip155?.accounts).toHaveLength(2);
  });

  it("throws when TRON account is missing", () => {
    expect(() => normalizeConnectedSession({ topic: "topic-1", namespaces: { eip155: rawSession.namespaces.eip155 } })).toThrow("TRON account");
  });

  it("throws when EVM account is missing", () => {
    expect(() => normalizeConnectedSession({ topic: "topic-1", namespaces: { tron: rawSession.namespaces.tron } })).toThrow("EVM account");
  });
});
