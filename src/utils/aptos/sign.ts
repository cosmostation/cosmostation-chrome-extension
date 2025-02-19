import type { AnyRawTransaction, Ed25519Account } from '@aptos-labs/ts-sdk';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

export async function signAndExecuteTxSequentially(signer: Ed25519Account, transaction: AnyRawTransaction, urls: string[]) {
  for (const url of urls) {
    const aptosClientConfig = new AptosConfig({
      fullnode: url + '/v1',
    });

    const aptosClient = new Aptos(aptosClientConfig);

    try {
      const senderAuthenticator = aptosClient.transaction.sign({
        signer: signer,
        transaction,
      });

      const submittedTransaction = await aptosClient.transaction.submit.simple({
        transaction,
        senderAuthenticator,
      });

      return submittedTransaction;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}
