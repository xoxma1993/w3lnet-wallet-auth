import SignClient from "@walletconnect/sign-client";
const clients = new Map();
const modals = new Map();
export async function connectWalletAuth(options) {
    assertProjectId(options.projectId);
    const client = await getSignClient(options.projectId, options.metadata);
    const existing = client.session.getAll().find((candidate) => candidate.namespaces.tron?.accounts.length && candidate.namespaces.eip155?.accounts.length);
    if (existing) {
        return normalizeConnectedSession(existing);
    }
    const { uri, approval } = await client.connect({
        optionalNamespaces: {
            ...options.proposal.requiredNamespaces,
            ...options.proposal.optionalNamespaces
        }
    });
    if (uri) {
        if (options.onUri) {
            options.onUri(uri);
        }
        else {
            await (await getModal(options.projectId, options.themeMode)).openModal({ uri });
        }
    }
    try {
        const session = await approval();
        return normalizeConnectedSession(session);
    }
    finally {
        if (!options.onUri) {
            await (await getModal(options.projectId, options.themeMode)).closeModal();
        }
    }
}
export async function signTronNonce(options) {
    assertProjectId(options.projectId);
    const client = await getSignClient(options.projectId, options.metadata);
    const result = await client.request({
        topic: options.topic,
        chainId: options.chainId,
        request: {
            method: "tron_signMessage",
            params: {
                address: options.account,
                message: options.message
            }
        }
    });
    if (typeof result === "string") {
        return result;
    }
    if (result.signature) {
        return result.signature;
    }
    throw new Error("TRON wallet did not return a signature");
}
export function normalizeConnectedSession(session) {
    const namespaces = normalizeNamespaces(session);
    const caipAccount = namespaces.tron?.accounts[0];
    const [namespace, reference, ...addressParts] = caipAccount?.split(":") ?? [];
    const account = addressParts.join(":");
    if (namespace !== "tron" || !reference || !account) {
        throw new Error("WalletConnect session did not approve a TRON account");
    }
    if (!namespaces.eip155?.accounts.length) {
        throw new Error("WalletConnect session did not approve an EVM account");
    }
    return {
        topic: session.topic,
        account,
        chainId: `tron:${reference}`,
        namespaces
    };
}
export function normalizeNamespaces(session) {
    return Object.fromEntries(Object.entries(session.namespaces).map(([key, namespace]) => {
        const chains = namespace.chains ?? Array.from(new Set(namespace.accounts.map((account) => account.split(":").slice(0, 2).join(":"))));
        return [
            key,
            {
                chains,
                methods: namespace.methods,
                events: namespace.events,
                accounts: namespace.accounts
            }
        ];
    }));
}
async function getSignClient(projectId, metadata) {
    const existing = clients.get(projectId);
    if (existing) {
        return existing;
    }
    const client = SignClient.init({ projectId, metadata });
    clients.set(projectId, client);
    return client;
}
async function getModal(projectId, themeMode = "dark") {
    const existing = modals.get(projectId);
    if (existing) {
        return existing;
    }
    const { WalletConnectModal } = await import("@walletconnect/modal");
    const modal = new WalletConnectModal({
        projectId,
        themeMode,
        themeVariables: {
            "--wcm-accent-color": "#111827",
            "--wcm-background-color": "#ffffff"
        }
    });
    modals.set(projectId, modal);
    return modal;
}
function assertProjectId(projectId) {
    if (!projectId || projectId === "your-walletconnect-project-id") {
        throw new Error("Set WalletConnect projectId before using wallet auth");
    }
}
