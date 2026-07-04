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
export declare function createMemoryNonceStore(): NonceStore;
