import { z } from "zod";
import TronWeb from "tronweb";
import { DEFAULT_WALLET_AUTH_PROPOSAL } from "./proposal.js";
import type { AuthVerifyRequest, Caip10Account, ChainId, NamespaceKey, SessionProposal } from "./types.js";

const namespaceKeySchema = z.enum(["eip155", "tron"]);
const chainIdSchema = z.custom<ChainId>((value) => typeof value === "string" && /^(eip155|tron):[^:]+$/.test(value));
const caip10AccountSchema = z.custom<Caip10Account>((value) => typeof value === "string" && /^(eip155|tron):[^:]+:.+$/.test(value));

const namespaceApprovalSchema = z.object({
  chains: z.array(chainIdSchema),
  methods: z.array(z.string().min(1)),
  events: z.array(z.string()),
  accounts: z.array(caip10AccountSchema)
});

export const authVerifySchema = z.object({
  namespace: namespaceKeySchema,
  chainId: chainIdSchema,
  account: z.string().min(1),
  nonce: z.string().min(16),
  message: z.string().min(1),
  signature: z.string().min(1),
  approvedNamespaces: z
    .object({
      eip155: namespaceApprovalSchema.optional(),
      tron: namespaceApprovalSchema.optional()
    })
    .strict()
});

export type AuthVerifyInput = z.infer<typeof authVerifySchema>;

export function createNonceMessage(options: { appName: string; nonce: string; issuedAt?: Date; ttlMs?: number }) {
  const issuedAt = options.issuedAt ?? new Date();
  const expiresAt = new Date(issuedAt.getTime() + (options.ttlMs ?? 5 * 60 * 1000));
  const message = [
    `Sign in to ${options.appName}`,
    "",
    "This signature proves wallet ownership and does not submit a transaction.",
    `Nonce: ${options.nonce}`,
    `Issued At: ${issuedAt.toISOString()}`
  ].join("\n");

  return {
    nonce: options.nonce,
    message,
    expiresAt: expiresAt.toISOString()
  };
}

export function verifyTronMessage(options: { message: string; signature: string; expectedAddress: string }) {
  const normalizedSignature = options.signature.startsWith("0x") ? options.signature : `0x${options.signature}`;
  return TronWeb.Trx.verifyMessageV2(options.message, normalizedSignature, options.expectedAddress);
}

export function validateApprovedNamespaces(options: {
  request: Pick<AuthVerifyRequest, "chainId" | "account" | "approvedNamespaces">;
  proposal?: SessionProposal;
}) {
  const proposal = options.proposal ?? DEFAULT_WALLET_AUTH_PROPOSAL;
  const requested = {
    ...proposal.requiredNamespaces,
    ...proposal.optionalNamespaces
  };

  for (const [namespace, requirement] of Object.entries(proposal.requiredNamespaces)) {
    const approved = options.request.approvedNamespaces[namespace as NamespaceKey];
    if (!approved) {
      throw new Error(`Required namespace was not approved: ${namespace}`);
    }

    for (const chain of requirement.chains) {
      if (!approved.chains.includes(chain)) {
        throw new Error(`Required chain was not approved: ${chain}`);
      }
    }

    for (const method of requirement.methods) {
      if (!approved.methods.includes(method)) {
        throw new Error(`Required method was not approved: ${method}`);
      }
    }
  }

  for (const [namespace, approved] of Object.entries(options.request.approvedNamespaces)) {
    const requirement = requested[namespace as NamespaceKey];
    if (!requirement) {
      throw new Error(`Unknown namespace: ${namespace}`);
    }

    const unknownChains = approved.chains.filter((chain) => !requirement.chains.includes(chain));
    if (unknownChains.length > 0) {
      throw new Error(`Namespace ${namespace} approved unknown chains: ${unknownChains.join(", ")}`);
    }

    const unknownMethods = approved.methods.filter((method) => !requirement.methods.includes(method));
    if (unknownMethods.length > 0) {
      throw new Error(`Namespace ${namespace} approved unknown methods: ${unknownMethods.join(", ")}`);
    }
  }

  const loginAccount = `${options.request.chainId}:${options.request.account}`.toLowerCase();
  const approvedAccounts = Object.values(options.request.approvedNamespaces).flatMap((namespace) => namespace?.accounts ?? []);
  const hasLoginAccount = approvedAccounts.some((account) => account.toLowerCase() === loginAccount);

  if (!hasLoginAccount) {
    throw new Error("Approved namespaces do not contain the authenticated account");
  }
}

export * from "./types.js";
export * from "./proposal.js";
export * from "./memoryNonceStore.js";
export * from "./errors.js";
