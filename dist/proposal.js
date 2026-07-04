export const DEFAULT_WALLET_AUTH_PROPOSAL = {
    id: "multi-chain-login",
    requiredNamespaces: {
        tron: {
            chains: ["tron:0x2b6653dc"],
            methods: ["tron_signMessage", "tron_signTransaction"],
            events: ["accountsChanged"]
        },
        eip155: {
            chains: ["eip155:1", "eip155:137", "eip155:56"],
            methods: ["personal_sign", "eth_sendTransaction", "eth_signTypedData_v4"],
            events: ["accountsChanged", "chainChanged"]
        }
    },
    optionalNamespaces: {}
};
export const DEFAULT_PROPOSAL = DEFAULT_WALLET_AUTH_PROPOSAL;
