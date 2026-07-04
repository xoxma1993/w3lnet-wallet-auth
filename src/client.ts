import SignClient from "@walletconnect/sign-client";
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
  namespaces: Record<
    string,
    {
      chains?: string[];
      methods: string[];
      events: string[];
      accounts: string[];
    }
  >;
};

const clients = new Map<string, Promise<SignClient>>();
const modals = new Map<string, WalletConnectModalLike>();

export async function connectWalletAuth(options: ConnectWalletAuthOptions) {
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
    } else {
      await (await getModal(options.projectId, options.themeMode)).openModal({ uri });
    }
  }

  try {
    const session = await approval();
    return normalizeConnectedSession(session);
  } finally {
    if (!options.onUri) {
      await (await getModal(options.projectId, options.themeMode)).closeModal();
    }
  }
}

export async function signTronNonce(options: SignTronNonceOptions) {
  assertProjectId(options.projectId);
  const client = await getSignClient(options.projectId, options.metadata);

  const result = await client.request<string | { signature?: string }>({
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

export function normalizeConnectedSession(session: RawWalletConnectSession): ConnectedWalletSession {
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

export function normalizeNamespaces(session: RawWalletConnectSession) {
  return Object.fromEntries(
    Object.entries(session.namespaces).map(([key, namespace]) => {
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
    })
  ) as Partial<Record<NamespaceKey, WalletNamespaceApproval>>;
}

async function getSignClient(projectId: string, metadata: ClientMetadata) {
  const existing = clients.get(projectId);
  if (existing) {
    return existing;
  }

  const client = SignClient.init({ projectId, metadata });
  clients.set(projectId, client);
  return client;
}

type WalletConnectModalLike = {
  openModal(options: { uri: string }): void | Promise<void>;
  closeModal(): void | Promise<void>;
};

async function getModal(projectId: string, themeMode: "dark" | "light" = "dark") {
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

function assertProjectId(projectId: string) {
  if (!projectId || projectId === "your-walletconnect-project-id") {
    throw new Error("Set WalletConnect projectId before using wallet auth");
  }
}
