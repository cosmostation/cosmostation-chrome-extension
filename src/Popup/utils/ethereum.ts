import { Address, ecsign, hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toChecksumAddress, toRpcSig } from 'ethereumjs-util';
import * as TinySecp256k1 from 'tiny-secp256k1';
import type { TransactionDescription } from '@ethersproject/abi';
import { Interface } from '@ethersproject/abi';

import { ERC20_ABI } from '~/constants/abi';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { ETHEREUM_TX_TYPE } from '~/constants/ethereum';
import { chromeStorage } from '~/Popup/utils/chromeStorage';
import { EthereumRPCError } from '~/Popup/utils/error';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumTxType } from '~/types/ethereum/common';
import type { EthereumTx } from '~/types/ethereum/message';

export function toHex(data: string) {
  if (data.startsWith('0x')) {
    return data;
  }

  return `0x${Buffer.from(data, 'utf8').toString('hex')}`;
}

export function toUTF8(hex: string) {
  return Buffer.from(stripHexPrefix(hex), 'hex').toString('utf8');
}

export function getAddress(publicKey: Buffer) {
  const uncompressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));
  return toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());
}

export function sign(data: string, privateKey: Buffer) {
  const message = Buffer.from(stripHexPrefix(data), 'hex');

  const signature = ecsign(message, privateKey);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}

export function personalSign(data: string, privateKey: Buffer) {
  const message = isHexString(data) ? toBuffer(data) : Buffer.from(data);
  const msgHash = hashPersonalMessage(message);

  const signature = ecsign(msgHash, privateKey);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}

export function rpcResponse(result: unknown, id?: number | string) {
  return id !== undefined
    ? {
        result,
        jsonrpc: '2.0',
        id,
      }
    : { result, jsonrpc: '2.0' };
}

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const { currentEthereumNetwork } = await chromeStorage();

  const rpcURL = url ?? currentEthereumNetwork().rpcURL;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new EthereumRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}

const erc20Interface = new Interface(ERC20_ABI);

export function erc20Parse(tx: EthereumTx) {
  const { data } = tx;

  if (!data) {
    return null;
  }
  try {
    return erc20Interface.parseTransaction({ data });
  } catch {
    return null;
  }
}

export type DetermineTxType = {
  type: EthereumTxType;
  erc20: TransactionDescription | null;
  getCodeResponse: string | null;
};

export async function determineTxType(txParams: EthereumTx): Promise<DetermineTxType> {
  const { data, to } = txParams;
  const erc20 = erc20Parse(txParams);
  const name = erc20?.name;

  const tokenMethodName = [ETHEREUM_TX_TYPE.TOKEN_METHOD_APPROVE, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER_FROM].find(
    (methodName) => isEqualsIgnoringCase(methodName, name),
  );

  let result: EthereumTxType = ETHEREUM_TX_TYPE.SIMPLE_SEND;

  if (data && tokenMethodName) {
    result = tokenMethodName;
  } else if (data && !to) {
    result = ETHEREUM_TX_TYPE.DEPLOY_CONTRACT;
  }

  let contractCode: string | null = null;

  if (result === ETHEREUM_TX_TYPE.SIMPLE_SEND && to) {
    const { contractCode: resultCode, isContractAddress } = await readAddressAsContract(to);

    contractCode = resultCode;

    if (isContractAddress) {
      result = ETHEREUM_TX_TYPE.CONTRACT_INTERACTION;
    }
  }

  return { type: result, getCodeResponse: contractCode, erc20 };
}

export async function readAddressAsContract(address: string) {
  let contractCode;
  try {
    contractCode = (await requestRPC<{ result?: string }>('eth_getCode', [address, 'latest'])).result ?? null;
  } catch {
    contractCode = null;
  }

  const isContractAddress = !!(contractCode && contractCode !== '0x' && contractCode !== '0x0');
  return { contractCode, isContractAddress };
}
