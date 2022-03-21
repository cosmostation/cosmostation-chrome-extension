import { Interface } from '@ethersproject/abi';

import { ERC20_ABI } from '~/constants/abi';
import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR } from '~/constants/error';
import { ETHEREUM_TX_TYPE } from '~/constants/ethereum';
import { EthereumRPCError } from '~/Popup/utils/error';
import type { EthereumTxParams } from '~/types/ethereum/message';

import { chromeStorage } from './chromeStorage';

const abiInterface = new Interface(ERC20_ABI);

export async function requestRPC<T>(method: string, params: unknown, id?: string | number) {
  const { currentEthereumNetwork } = await chromeStorage();

  const { rpcURL } = currentEthereumNetwork;

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
    throw new EthereumRPCError(RPC_ERROR.INTERNAL, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}

export async function determineTxType(txParams: EthereumTxParams) {
  const { data, to } = txParams;
  console.log(txParams);
  let name: undefined | string;
  try {
    console.log(abiInterface.parseTransaction({ data: data! }));
    name = data && abiInterface.parseTransaction({ data }).name;
    // eslint-disable-next-line no-empty
  } catch {}

  const tokenMethodName = [ETHEREUM_TX_TYPE.TOKEN_METHOD_APPROVE, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER_FROM].find(
    (methodName) => isEqualString(methodName, name),
  );

  let result = '';

  if (data && tokenMethodName) {
    result = tokenMethodName;
  } else if (data && !to) {
    result = ETHEREUM_TX_TYPE.DEPLOY_CONTRACT;
  }

  let contractCode: string | null = null;

  if (!result && to) {
    const { contractCode: resultCode, isContractAddress } = await readAddressAsContract(to);

    contractCode = resultCode;

    if (isContractAddress) {
      result = ETHEREUM_TX_TYPE.CONTRACT_INTERACTION;
    }
  }

  if (!result) {
    result = ETHEREUM_TX_TYPE.SIMPLE_SEND;
  }

  return { type: result, getCodeResponse: contractCode };
}

export function isEqualString(value1?: string, value2?: string) {
  if (typeof value1 !== 'string' || typeof value2 !== 'string') {
    return false;
  }
  return value1.toLowerCase() === value2.toLowerCase();
}

export async function readAddressAsContract(address: string) {
  let contractCode;
  console.log(await requestRPC<{ result?: string }>('eth_getCode', [address, 'latest']));
  try {
    contractCode = (await requestRPC<{ result?: string }>('eth_getCode', [address, 'latest'])).result ?? null;
  } catch {
    contractCode = null;
  }

  const isContractAddress = !!(contractCode && contractCode !== '0x' && contractCode !== '0x0');
  return { contractCode, isContractAddress };
}
