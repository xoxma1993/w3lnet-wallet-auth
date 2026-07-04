export type WalletAuthErrorCode =
  | "INVALID_NONCE"
  | "INVALID_SIGNATURE"
  | "INVALID_NAMESPACES"
  | "MISSING_PROJECT_ID"
  | "MISSING_TRON_ACCOUNT"
  | "MISSING_EVM_ACCOUNT";

export class WalletAuthError extends Error {
  constructor(
    public readonly code: WalletAuthErrorCode,
    message: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = "WalletAuthError";
  }
}

export function toWalletAuthError(error: unknown) {
  if (error instanceof WalletAuthError) {
    return error;
  }

  if (error instanceof Error) {
    return new WalletAuthError("INVALID_NAMESPACES", error.message, 400);
  }

  return new WalletAuthError("INVALID_NAMESPACES", "Wallet auth failed", 400);
}
