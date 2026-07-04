export type NamespaceKey = "eip155" | "tron";
export type ChainId = `${NamespaceKey}:${string}`;
export type Caip10Account = `${NamespaceKey}:${string}:${string}`;
export type WalletNamespaceRequest = {
    chains: ChainId[];
    methods: string[];
    events: string[];
};
export type WalletNamespaceApproval = WalletNamespaceRequest & {
    accounts: Caip10Account[];
};
export type SessionProposal = {
    id: string;
    requiredNamespaces: Partial<Record<NamespaceKey, WalletNamespaceRequest>>;
    optionalNamespaces: Partial<Record<NamespaceKey, WalletNamespaceRequest>>;
};
export type ApprovedSession = {
    id: string;
    subject: string;
    namespaces: Partial<Record<NamespaceKey, WalletNamespaceApproval>>;
    issuedAt: string;
    expiresAt: string;
};
export type NonceResponse = {
    nonce: string;
    message: string;
    expiresAt: string;
};
export type AuthVerifyRequest = {
    namespace: NamespaceKey;
    chainId: ChainId;
    account: string;
    nonce: string;
    message: string;
    signature: string;
    approvedNamespaces: Partial<Record<NamespaceKey, WalletNamespaceApproval>>;
};
export type AuthVerifyResponse = {
    token: string;
    session: ApprovedSession;
};
export type ConnectedWalletSession = {
    topic: string;
    account: string;
    chainId: ChainId;
    namespaces: Partial<Record<NamespaceKey, WalletNamespaceApproval>>;
};
