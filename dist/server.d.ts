import { z } from "zod";
import type { AuthVerifyRequest, SessionProposal } from "./types.js";
export declare const authVerifySchema: z.ZodObject<{
    namespace: z.ZodEnum<["eip155", "tron"]>;
    chainId: z.ZodType<`eip155:${string}` | `tron:${string}`, z.ZodTypeDef, `eip155:${string}` | `tron:${string}`>;
    account: z.ZodString;
    nonce: z.ZodString;
    message: z.ZodString;
    signature: z.ZodString;
    approvedNamespaces: z.ZodObject<{
        eip155: z.ZodOptional<z.ZodObject<{
            chains: z.ZodArray<z.ZodType<`eip155:${string}` | `tron:${string}`, z.ZodTypeDef, `eip155:${string}` | `tron:${string}`>, "many">;
            methods: z.ZodArray<z.ZodString, "many">;
            events: z.ZodArray<z.ZodString, "many">;
            accounts: z.ZodArray<z.ZodType<`eip155:${string}:${string}` | `tron:${string}:${string}`, z.ZodTypeDef, `eip155:${string}:${string}` | `tron:${string}:${string}`>, "many">;
        }, "strip", z.ZodTypeAny, {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        }, {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        }>>;
        tron: z.ZodOptional<z.ZodObject<{
            chains: z.ZodArray<z.ZodType<`eip155:${string}` | `tron:${string}`, z.ZodTypeDef, `eip155:${string}` | `tron:${string}`>, "many">;
            methods: z.ZodArray<z.ZodString, "many">;
            events: z.ZodArray<z.ZodString, "many">;
            accounts: z.ZodArray<z.ZodType<`eip155:${string}:${string}` | `tron:${string}:${string}`, z.ZodTypeDef, `eip155:${string}:${string}` | `tron:${string}:${string}`>, "many">;
        }, "strip", z.ZodTypeAny, {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        }, {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        }>>;
    }, "strict", z.ZodTypeAny, {
        eip155?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
        tron?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
    }, {
        eip155?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
        tron?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    signature: string;
    namespace: "eip155" | "tron";
    message: string;
    chainId: `eip155:${string}` | `tron:${string}`;
    account: string;
    nonce: string;
    approvedNamespaces: {
        eip155?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
        tron?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
    };
}, {
    signature: string;
    namespace: "eip155" | "tron";
    message: string;
    chainId: `eip155:${string}` | `tron:${string}`;
    account: string;
    nonce: string;
    approvedNamespaces: {
        eip155?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
        tron?: {
            chains: (`eip155:${string}` | `tron:${string}`)[];
            methods: string[];
            events: string[];
            accounts: (`eip155:${string}:${string}` | `tron:${string}:${string}`)[];
        } | undefined;
    };
}>;
export type AuthVerifyInput = z.infer<typeof authVerifySchema>;
export declare function createNonceMessage(options: {
    appName: string;
    nonce: string;
    issuedAt?: Date;
    ttlMs?: number;
}): {
    nonce: string;
    message: string;
    expiresAt: string;
};
export declare function verifyTronMessage(options: {
    message: string;
    signature: string;
    expectedAddress: string;
}): boolean;
export declare function validateApprovedNamespaces(options: {
    request: Pick<AuthVerifyRequest, "chainId" | "account" | "approvedNamespaces">;
    proposal?: SessionProposal;
}): void;
export * from "./types.js";
export * from "./proposal.js";
export * from "./memoryNonceStore.js";
export * from "./errors.js";
