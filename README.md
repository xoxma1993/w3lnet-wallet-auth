# @w3lnet/wallet-auth

Framework-agnostic TRON + EVM WalletConnect authorization helpers.

The package provides:

- shared TRON + EVM namespace types;
- default WalletConnect proposal;
- browser client helpers for one-modal `tron + eip155` approval;
- TRON nonce signing helper;
- backend Zod schema;
- TRON signature verification;
- approved namespace validation.

## Entrypoints

```ts
import { DEFAULT_WALLET_AUTH_PROPOSAL } from "@w3lnet/wallet-auth";
```

```ts
import { connectWalletAuth, signTronNonce } from "@w3lnet/wallet-auth/client";
```

```ts
import { authVerifySchema, verifyTronMessage, validateApprovedNamespaces } from "@w3lnet/wallet-auth/server";
```

```ts
import { createWalletAuthRouter, createMemoryNonceStore } from "@w3lnet/wallet-auth/express";
```

## Client Example

```ts
const connected = await connectWalletAuth({
  projectId,
  proposal: DEFAULT_WALLET_AUTH_PROPOSAL,
  metadata: {
    name: "Your App",
    description: "TRON + EVM login",
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.svg`]
  }
});

const signature = await signTronNonce({
  projectId,
  metadata,
  topic: connected.topic,
  chainId: connected.chainId,
  account: connected.account,
  message: nonce.message
});
```

## Headless QR Mode

Pass `onUri` if you want to render the WalletConnect URI yourself. In this mode the package does not load `@walletconnect/modal`.

```ts
const connected = await connectWalletAuth({
  projectId,
  proposal: DEFAULT_WALLET_AUTH_PROPOSAL,
  metadata,
  onUri: (uri) => {
    console.log(uri);
    // Render QR/deep-link with your own UI.
  }
});
```

## Server Example

```ts
const body = authVerifySchema.parse(req.body);

if (!verifyTronMessage({ message: body.message, signature: body.signature, expectedAddress: body.account })) {
  throw new Error("Invalid TRON signature");
}

validateApprovedNamespaces({ request: body });
```

## Express Adapter

Use the optional Express adapter when you want ready-made `/proposal`, `/nonce`, and `/verify` routes.

```ts
import { createSecretKey } from "node:crypto";
import express from "express";
import { SignJWT } from "jose";
import { createApprovedSession, createMemoryNonceStore, createWalletAuthRouter } from "@w3lnet/wallet-auth/express";

const app = express();
const nonceStore = createMemoryNonceStore();

app.use(express.json());
app.use(
  "/auth",
  createWalletAuthRouter({
    appName: "My App",
    nonceStore,
    honeypot: true,
    onSecurityEvent(event) {
      console.warn("wallet-auth security event", event);
    },
    async issueSession({ subject, request, issuedAt, expiresAt }) {
      const session = createApprovedSession({
        subject,
        namespaces: request.approvedNamespaces,
        issuedAt,
        expiresAt
      });

      const token = await new SignJWT({ sid: session.id, sub: session.subject })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(createSecretKey(Buffer.from(process.env.JWT_SECRET!, "utf8")));

      return { token, session };
    }
  })
);
```

The adapter does not create users or persist sessions for you. The host app owns `issueSession` and should store the returned session as needed.

The `honeypot` option is defensive-only. It emits security events for unknown auth routes and returns `404`; it does not attack, damage, or interact with clients beyond normal HTTP responses.

## Notes

- TRON mainnet chain id is `tron:0x2b6653dc`.
- TRON `tron_signMessage` params must be `{ address, message }`.
- `@walletconnect/modal` is optional if you use `onUri`.
- This package does not create users, persist sessions, issue cookies, or manage databases. Host apps own those concerns.
