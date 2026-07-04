export type NonceRecord = {
  nonce: string;
  message: string;
  expiresAt: Date;
  consumed: boolean;
};

export type NonceStore = {
  save(record: NonceRecord): Promise<void> | void;
  consume(nonce: string, message: string): Promise<boolean> | boolean;
};

export function createMemoryNonceStore(): NonceStore {
  const nonces = new Map<string, NonceRecord>();

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
