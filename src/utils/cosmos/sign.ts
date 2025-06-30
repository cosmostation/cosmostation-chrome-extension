import type { CosmosChain } from '@/types/chain';
import type { SendTransactionPayload } from '@/types/cosmos/common';
import type { SignDirectDoc } from '@/types/cosmos/direct';

import { signDirect } from './msg';
import { protoTxBytes } from './proto';
import { post } from '../axios';
import { toUint8Array } from '../crypto';

type SignDirectAndExecuteTxSequentiallyProps = {
  privateKey: string;
  directDoc: SignDirectDoc;
  chain: CosmosChain;
  urls: string[];
};

export async function signDirectAndexecuteTxSequentially({ privateKey, directDoc, chain, urls }: SignDirectAndExecuteTxSequentiallyProps) {
  const signature = signDirect(directDoc, Buffer.from(privateKey, 'hex'), chain);
  const base64Signature = Buffer.from(signature).toString('base64');

  const pTxBytes = protoTxBytes({
    signatures: [base64Signature],
    txBodyBytes: toUint8Array(directDoc.body_bytes),
    authInfoBytes: toUint8Array(directDoc.auth_info_bytes),
  });

  for (const url of urls) {
    try {
      const response = await post<SendTransactionPayload>(url, pTxBytes);

      return response;
    } catch {
      continue;
    }
  }
  throw new Error('All RPC URLs failed');
}
