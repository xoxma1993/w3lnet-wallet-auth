import type { ConnectedWalletSession, NamespaceKey, SessionProposal, WalletNamespaceApproval } from "./types.js";
export type { ConnectedWalletSession, SessionProposal } from "./types.js";
type ClientMetadata = {
    name: string;
    description: string;
    url: string;
    icons: string[];
};
type ConnectWalletAuthOptions = {
    projectId: string;
    proposal: SessionProposal;
    metadata: ClientMetadata;
    themeMode?: "dark" | "light";
    onUri?: (uri: string) => void;
};
type SignTronNonceOptions = {
    projectId: string;
    metadata: ClientMetadata;
    topic: string;
    chainId: string;
    account: string;
    message: string;
};
type RawWalletConnectSession = {
    topic: string;
    namespaces: Record<string, {
        chains?: string[];
        methods: string[];
        events: string[];
        accounts: string[];
    }>;
};
export declare function connectWalletAuth(options: ConnectWalletAuthOptions): Promise<ConnectedWalletSession>;
export declare function signTronNonce(options: SignTronNonceOptions): Promise<string>;
export declare function normalizeConnectedSession(session: RawWalletConnectSession): ConnectedWalletSession;
export declare function normalizeNamespaces(session: RawWalletConnectSession): Partial<Record<NamespaceKey, WalletNamespaceApproval>>;
