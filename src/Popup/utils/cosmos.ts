import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import { Address, toChecksumAddress } from 'ethereumjs-util';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';
import { keccak256 } from '@ethersproject/keccak256';

import { COSMOS_CHAINS, COSMOS_DEFAULT_ESTIMATE_AV, COSMOS_DEFAULT_ESTIMATE_EXCEPTED_AV } from '~/constants/chain';
import { ARTELA_TESTNET } from '~/constants/chain/cosmos/artelaTestnet';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRONOS_POS } from '~/constants/chain/cosmos/cronosPos';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { HUMANS_AI } from '~/constants/chain/cosmos/humansAi';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { IXO } from '~/constants/chain/cosmos/ixo';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { KI } from '~/constants/chain/cosmos/ki';
import { MARS } from '~/constants/chain/cosmos/mars';
import { ONOMY } from '~/constants/chain/cosmos/onomy';
import { PROVENANCE } from '~/constants/chain/cosmos/provenance';
import { SEI } from '~/constants/chain/cosmos/sei';
import { STAFIHUB } from '~/constants/chain/cosmos/stafihub';
import { TERITORI } from '~/constants/chain/cosmos/teritori';
import { UX } from '~/constants/chain/cosmos/ux';
import { PUBLIC_KEY_TYPE } from '~/constants/cosmos';
import { cosmos } from '~/proto/cosmos-sdk-v0.47.4.js';
import type { CosmosChain } from '~/types/chain';
import type {
  Msg,
  MsgCommission,
  MsgCustom,
  MsgExecuteContract,
  MsgReward,
  MsgSend,
  MsgSignData,
  MsgSwapExactAmountIn,
  MsgTransfer,
  SignAminoDoc,
} from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';

import { toBase64 } from './string';

export function cosmosURL(chain: CosmosChain) {
  const { restURL, id } = chain;

  // reward 중첩 typing!
  return {
    getNodeInfo: () => `${restURL}/cosmos/base/tendermint/v1beta1/node_info`,
    getBalance: (address: string) => `${restURL}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=10000`,
    getDelegations: (address: string) => `${restURL}/cosmos/staking/v1beta1/delegations/${address}`,
    getRewards: (address: string) => `${restURL}/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
    getUndelegations: (address: string) => `${restURL}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
    getAccount: (address: string) => `${restURL}/cosmos/auth/v1beta1/accounts/${address}`,
    getIncentive: (address: string) => (id === KAVA.id ? `${restURL}/kava/incentive/v1beta1/rewards?owner=${address}` : ''),
    postBroadcast: () => `${restURL}/cosmos/tx/v1beta1/txs`,
    getCW20TokenInfo: (contractAddress: string) => `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"token_info":{}}')}`,
    getCW20Balance: (contractAddress: string, address: string) =>
      `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"balance":{"address":"${address}"}}`)}`,
    getCW721NFTInfo: (contractAddress: string, tokenId: string) =>
      `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"nft_info":{"token_id":"${tokenId}"}}`)}`,
    getCW721NFTIds: (contractAddress: string, ownerAddress: string, limit = 50) =>
      `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"tokens":{"owner":"${ownerAddress}","limit":${limit},"start_after":"0"}}`)}`,
    getCW721ContractInfo: (contractAddress: string) => `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"contract_info":{}}')}`,
    getCW721NumTokens: (contractAddress: string) => `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"num_tokens":{}}')}`,
    getCW721CollectionInfo: (contractAddress: string) => `${restURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"collection_info":{}}')}`,
    getClientState: (channelId: string, port?: string) => `${restURL}/ibc/core/channel/v1/channels/${channelId}/ports/${port || 'transfer'}/client_state`,
    simulate: () => `${restURL}/cosmos/tx/v1beta1/simulate`,
    getTxInfo: (txHash: string) => `${restURL}/cosmos/tx/v1beta1/txs/${txHash}`,
    getBlockLatest: () => (id === GRAVITY_BRIDGE.id ? `${restURL}/blocks/latest` : `${restURL}/cosmos/base/tendermint/v1beta1/blocks/latest`),
    getCommission: (validatorAddress: string) => `${restURL}/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`,
    getFeemarket: (denom?: string) => `${restURL}/feemarket/v1/gas_prices${denom ? `/${denom}` : ''}`,
  };
}

export function getAddress(publicKey: Buffer, prefix: string) {
  const encodedBySha256 = sha256(encHex.parse(publicKey.toString('hex'))).toString(encHex);

  const encodedByRipemd160 = ripemd160(encHex.parse(encodedBySha256)).toString(encHex);

  const words = bech32.toWords(Buffer.from(encodedByRipemd160, 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
}

export function convertToValidatorAddress(address?: string, validatorPrefix?: string) {
  if (!address || !validatorPrefix) {
    return undefined;
  }

  const { words } = bech32.decode(address);
  return bech32.encode(validatorPrefix, words);
}

export function getAddressForEthermint(publicKey: Buffer, prefix: string) {
  const uncompressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));

  const address = toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());

  const words = bech32.toWords(Buffer.from(address.substring(2), 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
}

export function signAmino(signDoc: SignAminoDoc, privateKey: Buffer, chain: CosmosChain) {
  const sha256SignDoc = (() => {
    if (chain.type === 'ETHERMINT') {
      return keccak256(Buffer.from(JSON.stringify(sortKeys(signDoc, { deep: true })))).substring(2);
    }

    return sha256(JSON.stringify(sortKeys(signDoc, { deep: true }))).toString(encHex);
  })();

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export function signDirect(signDoc: SignDirectDoc, privateKey: Buffer, chain: CosmosChain) {
  const txSignDoc = new cosmos.tx.v1beta1.SignDoc({
    ...signDoc,
    auth_info_bytes: new Uint8Array(signDoc.auth_info_bytes),
    body_bytes: new Uint8Array(signDoc.body_bytes),
    account_number: Number(signDoc.account_number),
  });

  const txSignDocHex = Buffer.from(cosmos.tx.v1beta1.SignDoc.encode(txSignDoc).finish()).toString('hex');

  const sha256SignDoc = (() => {
    if (chain.type === 'ETHERMINT') {
      return keccak256(Buffer.from(txSignDocHex, 'hex')).substring(2);
    }
    return sha256(encHex.parse(txSignDocHex)).toString(encHex);
  })();

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export const getPublicKeyType = (chain: CosmosChain) => {
  if (chain.id === INJECTIVE.id) {
    return PUBLIC_KEY_TYPE.INJ_SECP256K1;
  }

  if (chain.id === ARTELA_TESTNET.id) {
    return PUBLIC_KEY_TYPE.ART_SECP256K1;
  }

  if (chain.type === 'ETHERMINT') {
    return PUBLIC_KEY_TYPE.ETH_SECP256K1;
  }

  return PUBLIC_KEY_TYPE.SECP256K1;
};

export function isAminoSend(msg: Msg): msg is Msg<MsgSend> {
  return msg.type === 'cosmos-sdk/MsgSend' || msg.type === 'bank/MsgSend';
}

export function isAminoIBCSend(msg: Msg): msg is Msg<MsgTransfer> {
  return msg.type === 'cosmos-sdk/MsgTransfer';
}

export function isAminoReward(msg: Msg): msg is Msg<MsgReward> {
  return msg.type === 'cosmos-sdk/MsgWithdrawDelegationReward';
}

export function isAminoCommission(msg: Msg): msg is Msg<MsgCommission> {
  return msg.type === 'cosmos-sdk/MsgWithdrawValidatorCommission';
}

export function isAminoSwapExactAmountIn(msg: Msg): msg is Msg<MsgSwapExactAmountIn> {
  return msg.type === 'osmosis/gamm/swap-exact-amount-in' || msg.type === 'osmosis/poolmanager/swap-exact-amount-in';
}

export function isAminoExecuteContract(msg: Msg): msg is Msg<MsgExecuteContract> {
  return msg.type === 'wasm/MsgExecuteContract';
}

export function isAminoMsgSignData(msg: Msg): msg is Msg<MsgSignData> {
  return msg.type === 'sign/MsgSignData';
}

export function isAminoCustom(msg: Msg): msg is Msg<MsgCustom> {
  return true;
}

export function convertCosmosToAssetName(cosmosChain: CosmosChain) {
  const nameMap = {
    [CRONOS_POS.id]: 'crypto-org',
    [ASSET_MANTLE.id]: 'asset-mantle',
    [GRAVITY_BRIDGE.id]: 'gravity-bridge',
    [KI.id]: 'ki-chain',
    [STAFIHUB.id]: 'stafi',
    [FETCH_AI.id]: 'fetchai',
    [MARS.id]: 'mars-protocol',
    [HUMANS_AI.id]: 'humans',
    [ONOMY.id]: 'onomy-protocol',
    [UX.id]: 'umee',
    [ARTELA_TESTNET.id]: 'artela-testnet',
  };
  return nameMap[cosmosChain.id] || cosmosChain.chainName.toLowerCase();
}

export function convertAssetNameToCosmos(assetName: string) {
  const nameMap = {
    'crypto-org': CRONOS_POS,
    'asset-mantle': ASSET_MANTLE,
    'gravity-bridge': GRAVITY_BRIDGE,
    'ki-chain': KI,
    stafi: STAFIHUB,
    fetchai: FETCH_AI,
    'mars-protocol': MARS,
    humans: HUMANS_AI,
    'onomy-protocol': ONOMY,
    umee: UX,
    'artela-testnet': ARTELA_TESTNET,
  } as Record<string, CosmosChain | undefined>;

  return nameMap[assetName] || COSMOS_CHAINS.find((item) => item.chainName.toLowerCase() === assetName);
}

export function findCosmosChainByAddress(address?: string) {
  if (!address || !isValidCosmosAddress(address)) {
    return undefined;
  }

  return COSMOS_CHAINS.find((item) => bech32.decode(address).prefix === item.bech32Prefix.address);
}

export function isValidCosmosAddress(address: string): boolean {
  try {
    return COSMOS_CHAINS.some((chain) => chain.bech32Prefix.address === bech32.decode(address).prefix);
  } catch (e) {
    return false;
  }
}

export function getMsgSignData(signer: string, message: string) {
  return {
    account_number: '0',
    chain_id: '',
    fee: {
      amount: [],
      gas: '0',
    },
    memo: '',
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          data: Buffer.from(message, 'utf8').toString('base64'),
          signer,
        },
      },
    ],
    sequence: '0',
  };
}

export function getDefaultAV(chain?: CosmosChain) {
  const exceptedChainIds = [PROVENANCE.id, TERITORI.id, SEI.id];

  if (chain?.id === IXO.id) {
    return '3.0';
  }

  if (exceptedChainIds.includes(chain?.id || '')) {
    return COSMOS_DEFAULT_ESTIMATE_EXCEPTED_AV;
  }
  return COSMOS_DEFAULT_ESTIMATE_AV;
}

export function toDisplayCWTokenStandard(tokenStandard?: string) {
  const standardNumber = tokenStandard?.match(/\d+/g);

  if (!tokenStandard || !standardNumber || standardNumber.length === 0) {
    return '';
  }

  return 'CW-'.concat(standardNumber[0]);
}
