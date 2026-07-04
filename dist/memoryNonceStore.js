export function createMemoryNonceStore() {
    const nonces = new Map();
    return {
        save(record) {
            nonces.set(record.nonce, record);
        },
        consume(nonce, message) {
            const record = nonces.get(nonce);
            if (!record || record.consumed || record.message !== message || record.expiresAt.getTime() < Date.now()) {
                return false;
            }
            record.consumed = true;
            return true;
        }
    };
}
