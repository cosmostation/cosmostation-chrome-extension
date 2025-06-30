import type { AnyRawTransaction, Ed25519Account, HexInput } from '@aptos-labs/ts-sdk';
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk';

export async function signAndExecuteTxSequentially(
  signer: Ed25519Account,
  transaction: AnyRawTransaction,
  urls: string[],
  option?: {
    asFeePayer?: boolean;
  },
) {
  for (const url of urls) {
    const aptosClientConfig = new AptosConfig({
      fullnode: url + '/v1',
    });

    const aptosClient = new Aptos(aptosClientConfig);

    try {
      if (option?.asFeePayer) {
        const senderAuthenticator = await aptosClient.transaction.signAsFeePayer({
          signer: signer,
          transaction,
        });

        const submittedTransaction = await aptosClient.transaction.submit.simple({
          transaction,
          senderAuthenticator,
        });

        return submittedTransaction;
      } else {
        const senderAuthenticator = await aptosClient.transaction.sign({
          signer: signer,
          transaction,
        });

        const submittedTransaction = await aptosClient.transaction.submit.simple({
          transaction,
          senderAuthenticator,
        });

        return submittedTransaction;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}

export async function signTxSequentially(
  signer: Ed25519Account,
  transaction: AnyRawTransaction,
  urls: string[],
  option?: {
    asFeePayer?: boolean;
  },
) {
  for (const url of urls) {
    const aptosClientConfig = new AptosConfig({
      fullnode: url + '/v1',
    });

    const aptosClient = new Aptos(aptosClientConfig);

    try {
      if (option?.asFeePayer) {
        const senderAuthenticator = await aptosClient.transaction.signAsFeePayer({
          signer: signer,
          transaction,
        });

        return senderAuthenticator;
      } else {
        const senderAuthenticator = await aptosClient.transaction.sign({
          signer: signer,
          transaction,
        });

        return senderAuthenticator;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}

export function signMessage(privateKey: string, messageToSign: HexInput) {
  try {
    const pk = PrivateKey.formatPrivateKey(privateKey, PrivateKeyVariants.Ed25519);

    const account = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(pk) });

    const response = account.sign(messageToSign);

    return response;
  } catch {
    return undefined;
  }
}
