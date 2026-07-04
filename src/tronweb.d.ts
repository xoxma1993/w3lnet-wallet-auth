declare module "tronweb" {
  const TronWeb: {
    Trx: {
      verifyMessageV2(message: string, signature: string, address: string): boolean;
    };
  };

  export default TronWeb;
}
