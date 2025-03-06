import { ethers, FetchRequest } from 'ethers';
import { Interface } from 'ethers/abi';

import { ERC20_ABI, ERC721_ABI, ERC1155_ABI, ONE_INCH_ABI } from '@/constants/evm/abi';
import { ERC721_INTERFACE_ID, ERC1155_INTERFACE_ID, ONEINCH_CONTRACT_ADDRESS } from '@/constants/evm/common';
import { TOKEN_TYPE } from '@/constants/evm/token';
import { ETHEREUM_CONTRACT_KIND, ETHEREUM_TX_TYPE } from '@/constants/evm/tx';
import type { EvmRpc } from '@/types/evm/api';
import type { EthereumTxType } from '@/types/evm/common';
import type { ERC721SupportInterfacePayload, ERC1155SupportInterfacePayload } from '@/types/evm/contract';
import type { DetermineTxType, EthereumTx } from '@/types/evm/txs';

import { requestRPC } from '../ethereum';
import { isEqualsIgnoringCase } from '../string';

const erc20Interface = new Interface(ERC20_ABI);

const erc721Interface = new Interface(ERC721_ABI);

const erc1155Interface = new Interface(ERC1155_ABI);

const oneInchInterface = new Interface(ONE_INCH_ABI);

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

export function erc721Parse(tx: EthereumTx) {
  const { data } = tx;

  if (!data) {
    return null;
  }
  try {
    return erc721Interface.parseTransaction({ data });
  } catch {
    return null;
  }
}

export function erc1155Parse(tx: EthereumTx) {
  const { data } = tx;

  if (!data) {
    return null;
  }
  try {
    return erc1155Interface.parseTransaction({ data });
  } catch {
    return null;
  }
}

export function oneInchParse(tx: EthereumTx) {
  const { data } = tx;

  if (!data) {
    return null;
  }
  try {
    return oneInchInterface.parseTransaction({ data });
  } catch {
    return null;
  }
}
export async function determineNFTType(rpcURL?: string, contractAddress?: string) {
  if (!rpcURL || !contractAddress) {
    return null;
  }

  const customFetchRequest = new FetchRequest(rpcURL);

  customFetchRequest.setHeader('Cosmostation', `extension/${String(__APP_VERSION__)}`);

  const provider = new ethers.JsonRpcProvider(customFetchRequest);

  const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
  const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
  try {
    const erc721ContractCall = erc721Contract.supportsInterface(ERC721_INTERFACE_ID) as Promise<ERC721SupportInterfacePayload>;
    const erc721Response = await erc721ContractCall;

    const erc1155ContractCall = erc1155Contract.supportsInterface(ERC1155_INTERFACE_ID) as Promise<ERC1155SupportInterfacePayload>;
    const erc1155Response = await erc1155ContractCall;

    if (erc721Response && !erc1155Response) {
      return TOKEN_TYPE.ERC721;
    }
    if (!erc721Response && erc1155Response) {
      return TOKEN_TYPE.ERC1155;
    }
  } catch {
    return null;
  }

  return null;
}

export async function determineTxType(txParams: EthereumTx, rpcURL?: string): Promise<DetermineTxType> {
  const { data, to } = txParams;

  let txDescription;

  let result: EthereumTxType = ETHEREUM_TX_TYPE.SIMPLE_SEND;

  let contractCode: string | null = null;

  let contractKind;

  if (isEqualsIgnoringCase(to, ONEINCH_CONTRACT_ADDRESS) && to) {
    const { contractCode: resultCode, isContractAddress } = await readAddressAsContract(to);

    contractCode = resultCode;

    txDescription = oneInchParse(txParams);

    contractKind = ETHEREUM_CONTRACT_KIND.ONEINCH;

    if (isContractAddress) {
      if (txDescription?.name === ETHEREUM_TX_TYPE.SWAP) {
        result = ETHEREUM_TX_TYPE.SWAP;
      }
      if (txDescription?.name === ETHEREUM_TX_TYPE.UNOSWAP) {
        result = ETHEREUM_TX_TYPE.UNOSWAP;
      }
    }
    return { type: result, getCodeResponse: contractCode, txDescription, contractKind };
  }

  const tokenStandard = await determineNFTType(rpcURL, to);

  if (tokenStandard === 'ERC721') {
    txDescription = erc721Parse(txParams);
    const name = txDescription?.name;

    const tokenMethodName = [ETHEREUM_TX_TYPE.TOKEN_METHOD_APPROVE, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER_FROM].find((methodName) =>
      isEqualsIgnoringCase(methodName, name),
    );

    if (data && tokenMethodName) {
      result = tokenMethodName;
      contractKind = ETHEREUM_CONTRACT_KIND.ERC721;
    }

    return { type: result, getCodeResponse: contractCode, txDescription, contractKind };
  }

  if (tokenStandard === 'ERC1155') {
    txDescription = erc1155Parse(txParams);

    const name = txDescription?.name;

    const tokenMethodName = [ETHEREUM_TX_TYPE.TOKEN_METHOD_IS_APPROVED_FOR_ALL, ETHEREUM_TX_TYPE.TOKEN_METHOD_SAFE_TRANSFER_FROM].find((methodName) =>
      isEqualsIgnoringCase(methodName, name),
    );

    if (data && tokenMethodName) {
      result = tokenMethodName;
      contractKind = ETHEREUM_CONTRACT_KIND.ERC1155;
    }

    return { type: result, getCodeResponse: contractCode, txDescription, contractKind };
  }

  txDescription = erc20Parse(txParams);
  const name = txDescription?.name;

  const tokenMethodName = [ETHEREUM_TX_TYPE.TOKEN_METHOD_APPROVE, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER_FROM].find(
    (methodName) => isEqualsIgnoringCase(methodName, name),
  );

  if (data && tokenMethodName) {
    result = tokenMethodName;
    contractKind = ETHEREUM_CONTRACT_KIND.ERC20;
  } else if (data && !to) {
    result = ETHEREUM_TX_TYPE.DEPLOY_CONTRACT;
  }

  if (result === ETHEREUM_TX_TYPE.SIMPLE_SEND && to) {
    const { contractCode: resultCode, isContractAddress } = await readAddressAsContract(to);

    contractCode = resultCode;

    if (isContractAddress) {
      result = ETHEREUM_TX_TYPE.CONTRACT_INTERACTION;
    }
  }

  return { type: result, getCodeResponse: contractCode, txDescription, contractKind };
}

export async function readAddressAsContract(address: string) {
  let contractCode;
  try {
    contractCode = (await requestRPC<EvmRpc<string | undefined>>('eth_getCode', [address, 'latest'])).result ?? null;
  } catch {
    contractCode = null;
  }

  const isContractAddress = !!(contractCode && contractCode !== '0x' && contractCode !== '0x0');
  return { contractCode, isContractAddress };
}
