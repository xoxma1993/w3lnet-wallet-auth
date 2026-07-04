export type WalletAuthErrorCode = "INVALID_NONCE" | "INVALID_SIGNATURE" | "INVALID_NAMESPACES" | "MISSING_PROJECT_ID" | "MISSING_TRON_ACCOUNT" | "MISSING_EVM_ACCOUNT";
export declare class WalletAuthError extends Error {
    readonly code: WalletAuthErrorCode;
    readonly status: number;
    constructor(code: WalletAuthErrorCode, message: string, status?: number);
}
export declare function toWalletAuthError(error: unknown): WalletAuthError;
