import { Address, ecsign, hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toChecksumAddress, toRpcSig } from 'ethereumjs-util';
import { ethers, FetchRequest } from 'ethers';
import * as TinySecp256k1 from 'tiny-secp256k1';
import type { TransactionDescription } from '@ethersproject/abi';
import { Interface } from '@ethersproject/abi';
import type { MessageTypes, SignTypedDataVersion, TypedMessage } from '@metamask/eth-sig-util';
import { signTypedData as baseSignTypedData } from '@metamask/eth-sig-util';

import { ONEINCH_CONTRACT_ADDRESS } from '~/constants/1inch';
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI, ONE_INCH_ABI } from '~/constants/abi';
import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { ERC721_INTERFACE_ID, ERC1155_INTERFACE_ID, ETHEREUM_CONTRACT_KIND, ETHEREUM_TX_TYPE, TOKEN_TYPE } from '~/constants/ethereum';
import { EthereumRPCError } from '~/Popup/utils/error';
import { extensionStorage } from '~/Popup/utils/extensionStorage';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';
import type { ChainIdToAssetNameMapsResponse as ChainIdToAssetNameMaps } from '~/types/cosmos/asset';
import type { EthereumContractKind, EthereumTxType } from '~/types/ethereum/common';
import type { ERC721SupportInterfacePayload, ERC1155SupportInterfacePayload } from '~/types/ethereum/contract';
import type { CustomTypedMessage, EthereumTx } from '~/types/message/ethereum';

export function ethersProvider(rpcURL: string) {
  const customFetchRequest = new FetchRequest(rpcURL);

  customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

  return new ethers.JsonRpcProvider(customFetchRequest);
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
  const { currentEthereumNetwork } = await extensionStorage();

  const rpcURL = url ?? currentEthereumNetwork.rpcURL;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(process.env.VERSION)}`,
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

export type DetermineTxType = {
  type: EthereumTxType;
  txDescription: TransactionDescription | null;
  contractKind?: EthereumContractKind;
  getCodeResponse: string | null;
};

export async function determineNFTType(rpcURL?: string, contractAddress?: string) {
  if (!rpcURL || !contractAddress) {
    return null;
  }

  const customFetchRequest = new FetchRequest(rpcURL);

  customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

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
  } catch (e) {
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
    contractCode = (await requestRPC<{ result?: string }>('eth_getCode', [address, 'latest'])).result ?? null;
  } catch {
    contractCode = null;
  }

  const isContractAddress = !!(contractCode && contractCode !== '0x' && contractCode !== '0x0');
  return { contractCode, isContractAddress };
}

export function signTypedData<T extends MessageTypes>(
  privateKey: Buffer,
  data: CustomTypedMessage<T>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
) {
  const dataToSign = (data.domain.salt ? { ...data, domain: { ...data.domain, salt: Buffer.from(toHex(data.domain.salt), 'hex') } } : data) as TypedMessage<T>;
  return baseSignTypedData({ privateKey, data: dataToSign, version });
}

export function toDisplayTokenStandard(tokenStandard?: string) {
  const standardNumber = tokenStandard?.match(/\d+/g);

  if (!tokenStandard || !standardNumber || standardNumber.length === 0) {
    return '';
  }

  return 'ERC-'.concat(standardNumber[0]);
}

export function convertEVMToAssetName(evmNetwork: EthereumNetwork, chainIdToApiNameMaps: ChainIdToAssetNameMaps) {
  return chainIdToApiNameMaps[evmNetwork.chainId] || evmNetwork.networkName.toLowerCase();
}

export function convertAssetNameToEVM(assetName: string, chainIdToApiNameMaps: ChainIdToAssetNameMaps) {
  const assetNameToChainIdMaps = Object.fromEntries(Object.entries(chainIdToApiNameMaps).map(([key, value]) => [value, key]));

  return ETHEREUM_NETWORKS.find((item) => item.chainId === assetNameToChainIdMaps[assetName] || item.networkName.toLowerCase() === assetName);
}
