export class WalletAuthError extends Error {
    code;
    status;
    constructor(code, message, status = 400) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = "WalletAuthError";
    }
}
export function toWalletAuthError(error) {
    if (error instanceof WalletAuthError) {
        return error;
    }
    if (error instanceof Error) {
        return new WalletAuthError("INVALID_NAMESPACES", error.message, 400);
    }
    return new WalletAuthError("INVALID_NAMESPACES", "Wallet auth failed", 400);
}
