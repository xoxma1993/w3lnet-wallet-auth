import { randomUUID } from "node:crypto";
import { Router } from "express";
import { nanoid } from "nanoid";
import { DEFAULT_WALLET_AUTH_PROPOSAL } from "./proposal.js";
import { authVerifySchema, createNonceMessage, validateApprovedNamespaces, verifyTronMessage } from "./server.js";
import { WalletAuthError, toWalletAuthError } from "./errors.js";
export function createWalletAuthRouter(options) {
    const router = Router();
    const proposal = options.proposal ?? DEFAULT_WALLET_AUTH_PROPOSAL;
    const nonceTtlMs = options.nonceTtlMs ?? 5 * 60 * 1000;
    const sessionTtlMs = options.sessionTtlMs ?? 24 * 60 * 60 * 1000;
    const appName = options.appName ?? "Wallet Auth";
    router.get("/proposal", (_request, response) => {
        response.json(proposal);
    });
    router.post("/nonce", async (_request, response, next) => {
        try {
            const nonce = nanoid(32);
            const nonceMessage = createNonceMessage({ appName, nonce, ttlMs: nonceTtlMs });
            await options.nonceStore.save({
                nonce,
                message: nonceMessage.message,
                expiresAt: new Date(nonceMessage.expiresAt),
                consumed: false
            });
            response.json(nonceMessage);
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/verify", async (request, response, next) => {
        try {
            const body = authVerifySchema.parse(request.body);
            const nonceOk = await options.nonceStore.consume(body.nonce, body.message);
            if (!nonceOk) {
                await emitSecurityEvent(options, request, { type: "invalid_nonce", detail: "Nonce validation failed" });
                throw new WalletAuthError("INVALID_NONCE", "Nonce is invalid, expired, already used, or message was changed", 400);
            }
            if (body.namespace !== "tron") {
                await emitSecurityEvent(options, request, { type: "invalid_signature", detail: `Unsupported login namespace: ${body.namespace}` });
                throw new WalletAuthError("INVALID_SIGNATURE", "Only TRON login signatures are supported by this router", 400);
            }
            if (!verifyTronMessage({ message: body.message, signature: body.signature, expectedAddress: body.account })) {
                await emitSecurityEvent(options, request, { type: "invalid_signature", detail: "TRON signature mismatch" });
                throw new WalletAuthError("INVALID_SIGNATURE", "TRON signature does not match account", 401);
            }
            try {
                validateApprovedNamespaces({ request: body, proposal });
            }
            catch (error) {
                await emitSecurityEvent(options, request, { type: "invalid_namespaces", detail: error instanceof Error ? error.message : "Approved namespaces are invalid" });
                throw new WalletAuthError("INVALID_NAMESPACES", error instanceof Error ? error.message : "Approved namespaces are invalid", 400);
            }
            const issuedAt = new Date();
            const expiresAt = new Date(issuedAt.getTime() + sessionTtlMs);
            const result = await options.issueSession({
                subject: `${body.chainId}:${body.account}`,
                request: body,
                issuedAt,
                expiresAt
            });
            response.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    if (options.honeypot) {
        router.all("/*", async (request, response) => {
            await emitSecurityEvent(options, request, { type: "honeypot", detail: "Unknown wallet-auth route requested" });
            response.status(404).json({ error: "Not found" });
        });
    }
    return router;
}
export function createApprovedSession(input) {
    return {
        id: randomUUID(),
        subject: input.subject,
        namespaces: input.namespaces,
        issuedAt: input.issuedAt.toISOString(),
        expiresAt: input.expiresAt.toISOString()
    };
}
export function walletAuthExpressErrorHandler(error, _request, response, _next) {
    const walletError = toWalletAuthError(error);
    response.status(walletError.status).json({ error: walletError.message, code: walletError.code });
}
async function emitSecurityEvent(options, request, event) {
    await options.onSecurityEvent?.({
        ...event,
        method: request.method,
        path: request.originalUrl || request.url,
        ip: request.ip,
        userAgent: request.get("user-agent")
    });
}
export * from "./memoryNonceStore.js";
export * from "./errors.js";
export * from "./server.js";
