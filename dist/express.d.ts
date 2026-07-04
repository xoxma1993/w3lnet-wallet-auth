import { type Router as ExpressRouter } from "express";
import type { ApprovedSession, AuthVerifyRequest, AuthVerifyResponse, SessionProposal } from "./types.js";
import type { NonceStore } from "./memoryNonceStore.js";
export type IssueSessionInput = {
    subject: string;
    request: AuthVerifyRequest;
    issuedAt: Date;
    expiresAt: Date;
};
export type CreateWalletAuthRouterOptions = {
    nonceStore: NonceStore;
    issueSession(input: IssueSessionInput): Promise<AuthVerifyResponse> | AuthVerifyResponse;
    appName?: string;
    proposal?: SessionProposal;
    nonceTtlMs?: number;
    sessionTtlMs?: number;
};
export declare function createWalletAuthRouter(options: CreateWalletAuthRouterOptions): ExpressRouter;
export declare function createApprovedSession(input: {
    subject: string;
    namespaces: AuthVerifyRequest["approvedNamespaces"];
    issuedAt: Date;
    expiresAt: Date;
}): ApprovedSession;
export declare function walletAuthExpressErrorHandler(error: unknown, _request: unknown, response: {
    status(status: number): {
        json(body: unknown): void;
    };
}, _next: unknown): void;
export * from "./memoryNonceStore.js";
export * from "./errors.js";
export * from "./server.js";
