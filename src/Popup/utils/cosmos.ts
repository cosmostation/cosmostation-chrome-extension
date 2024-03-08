import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import { Address, toChecksumAddress } from 'ethereumjs-util';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';
import { keccak256 } from '@ethersproject/keccak256';

import { COSMOS_CHAINS, COSMOS_DEFAULT_ESTIMATE_AV, COSMOS_DEFAULT_ESTIMATE_EXCEPTED_AV } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRONOS_POS } from '~/constants/chain/cosmos/cronosPos';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
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
import { cosmos } from '~/proto/cosmos-v0.44.2.js';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/cosmos/activity';
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
import type { Amount } from '~/types/cosmos/common';
import type { SignDirectDoc } from '~/types/cosmos/proto';

import { plus } from './big';
import { toBase64 } from './string';

export function cosmosURL(chain: CosmosChain) {
  const { restURL, id } = chain;

  const isV1BetaClientState = [EMONEY.id].includes(chain.id);
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
    getClientState: (channelId: string, port?: string) =>
      `${restURL}/ibc/core/channel/${isV1BetaClientState ? 'v1beta1' : 'v1'}/channels/${channelId}/ports/${port || 'transfer'}/client_state`,
    simulate: () => `${restURL}/cosmos/tx/v1beta1/simulate`,
    getTxInfo: (txHash: string) => `${restURL}/cosmos/tx/v1beta1/txs/${txHash}`,
    getBlockLatest: () => (id === GRAVITY_BRIDGE.id ? `${restURL}/blocks/latest` : `${restURL}/cosmos/base/tendermint/v1beta1/blocks/latest`),
  };
}

export function getAddress(publicKey: Buffer, prefix: string) {
  const encodedBySha256 = sha256(encHex.parse(publicKey.toString('hex'))).toString(encHex);

  const encodedByRipemd160 = ripemd160(encHex.parse(encodedBySha256)).toString(encHex);

  const words = bech32.toWords(Buffer.from(encodedByRipemd160, 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
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
  if (chain.chainName === INJECTIVE.chainName) {
    return PUBLIC_KEY_TYPE.INJ_SECP256K1;
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
    [ONOMY.id]: 'onomy-protocol',
    [UX.id]: 'umee',
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
    'onomy-protocol': ONOMY,
    umee: UX,
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

export function isTxSuccess(activity: Activity) {
  return activity.data?.code === 0;
}

export function getTxMsgs(activity: Activity) {
  return activity.data?.tx?.['/cosmos-tx-v1beta1-Tx']?.body?.messages || [];
}

export function getMsgType(activity: Activity, address: string) {
  const msgs = getTxMsgs(activity);

  if (msgs.length === 0) {
    return 'tx_known';
  }

  if (msgs.length === 2) {
    const msgType0 = typeof msgs[0]['@type'] === 'string' ? msgs[0]['@type'] : '';
    const msgType1 = typeof msgs[1]['@type'] === 'string' ? msgs[1]['@type'] : '';

    if ((msgType0.includes('MsgWithdrawDelegatorReward') || msgType0.includes('MsgWithdrawDelegationReward')) && msgType1.includes('MsgDelegate')) {
      return 'tx_reinvest';
    }
  }

  let result = 'tx_known';
  const firstMsg = msgs[0];
  const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';

  if (msgType) {
    result = msgType.split('.').pop()?.replace('Msg', '') || 'tx_known';

    const msgValue = firstMsg[msgType.replace(/\./g, '-')] as Record<string, unknown>;

    if (msgType.includes('cosmos.') && msgType.includes('staking')) {
      if (msgType.includes('MsgCreateValidator')) {
        result = 'tx_create_validator';
      } else if (msgType.includes('MsgEditValidator')) {
        result = 'tx_edit_validator';
      } else if (msgType.includes('MsgDelegate')) {
        result = 'tx_delegate';
      } else if (msgType.includes('MsgUndelegate')) {
        result = 'tx_undelegate';
      } else if (msgType.includes('MsgBeginRedelegate')) {
        result = 'tx_redelegate';
      } else if (msgType.includes('MsgCancelUnbondingDelegation')) {
        result = 'tx_cancel_undelegate';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('bank')) {
      if (msgType.includes('MsgSend')) {
        const senderAddr = msgValue?.from_address;
        const receiverAddr = msgValue?.to_address;

        if (senderAddr === address) {
          result = 'tx_send';
        } else if (receiverAddr === address) {
          result = 'tx_receive';
        } else {
          result = 'tx_transfer';
        }
      } else if (msgType.includes('MsgMultiSend')) {
        result = 'tx_multi_send';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('distribution')) {
      if (msgType.includes('MsgSetWithdrawAddress') || msgType.includes('MsgModifyWithdrawAddress')) {
        result = 'tx_change_reward_address';
      } else if (msgType.includes('MsgWithdrawDelegatorReward') || msgType.includes('MsgWithdrawDelegationReward')) {
        result = 'tx_get_reward';
      } else if (msgType.includes('MsgWithdrawValidatorCommission')) {
        result = 'tx_get_commission';
      } else if (msgType.includes('MsgFundCommunityPool')) {
        result = 'tx_fund_pool';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('gov')) {
      if (msgType.includes('MsgSubmitProposal')) {
        result = 'tx_submit_proposal';
      } else if (msgType.includes('MsgDeposit')) {
        result = 'tx_proposal_deposit';
      } else if (msgType.includes('MsgVote')) {
        result = 'tx_vote';
      } else if (msgType.includes('MsgVoteWeighted')) {
        result = 'tx_vote_weighted';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('authz')) {
      if (msgType.includes('MsgGrant')) {
        result = 'tx_authz_grant';
      } else if (msgType.includes('MsgRevoke')) {
        result = 'tx_authz_revoke';
      } else if (msgType.includes('MsgExec')) {
        result = 'tx_authz_exe';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('slashing')) {
      if (msgType.includes('MsgUnjail')) {
        result = 'tx_unjail_validator';
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('feegrant')) {
      if (msgType.includes('MsgGrantAllowance')) {
        result = 'tx_feegrant_allowance';
      } else if (msgType.includes('MsgRevokeAllowance')) {
        result = 'tx_feegrant_revoke';
      }
    }

    // stride msg type
    else if (msgType.includes('stride.') && msgType.includes('stakeibc')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = 'tx_stride_liquid_stake';
      } else if (msgType.includes('MsgRedeemStake')) {
        result = 'tx_stride_liquid_unstake';
      }
    }

    // crescent msg type
    else if (msgType.includes('crescent.') && msgType.includes('liquidstaking')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = 'tx_crescent_liquid_stake';
      } else if (msgType.includes('MsgLiquidUnstake')) {
        result = 'tx_crescent_liquid_unstake';
      }
    } else if (msgType.includes('crescent.') && msgType.includes('liquidity')) {
      if (msgType.includes('MsgCreatePair')) {
        result = 'tx_crescent_create_pair';
      } else if (msgType.includes('MsgCreatePool')) {
        result = 'tx_crescent_create_pool';
      } else if (msgType.includes('MsgDeposit')) {
        result = 'tx_crescent_deposit';
      } else if (msgType.includes('MsgWithdraw')) {
        result = 'tx_crescent_withdraw';
      } else if (msgType.includes('MsgLimitOrder')) {
        result = 'tx_crescent_limit_order';
      } else if (msgType.includes('MsgMarketOrder')) {
        result = 'tx_crescent_market_order';
      } else if (msgType.includes('MsgCancelOrder')) {
        result = 'tx_crescent_cancel_order';
      } else if (msgType.includes('MsgCancelAllOrders')) {
        result = 'tx_crescent_cancel_all_orders';
      }
    } else if (msgType.includes('crescent.') && msgType.includes('farming')) {
      if (msgType.includes('MsgStake')) {
        result = 'tx_crescent_stake';
      } else if (msgType.includes('MsgUnstake')) {
        result = 'tx_crescent_unstake';
      } else if (msgType.includes('MsgHarvest')) {
        result = 'tx_crescent_harvest';
      } else if (msgType.includes('MsgCreateFixedAmountPlan')) {
        result = 'tx_crescent_create_fixed_amount_plan';
      } else if (msgType.includes('MsgCreateRatioPlan')) {
        result = 'tx_crescent_create_ratio_plan';
      } else if (msgType.includes('MsgRemovePlan')) {
        result = 'tx_crescent_remove_plan';
      } else if (msgType.includes('MsgAdvanceEpoch')) {
        result = 'tx_crescent_advance_epoch';
      }
    } else if (msgType.includes('crescent.') && msgType.includes('claim')) {
      if (msgType.includes('MsgClaim')) {
        result = 'tx_crescent_claim';
      }
    }

    // irismod msg type
    else if (msgType.includes('irismod.') && msgType.includes('nft')) {
      if (msgType.includes('MsgMintNFT')) {
        result = 'tx_nft_mint';
      } else if (msgType.includes('MsgTransferNFT')) {
        if (msgValue?.sender === address) {
          result = 'tx_nft_send';
        } else if (msgValue?.recipient === address) {
          result = 'tx_nft_receive';
        } else {
          result = 'tx_nft_transfer';
        }
      } else if (msgType.includes('MsgEditNFT')) {
        result = 'tx_nft_edit';
      } else if (msgType.includes('MsgIssueDenom')) {
        result = 'tx_nft_issueDenom';
      }
    } else if (msgType.includes('irismod.') && msgType.includes('coinswap')) {
      if (msgType.includes('MsgSwapOrder')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgAddLiquidity')) {
        result = 'tx_add_liquidity';
      } else if (msgType.includes('MsgRemoveLiquidity')) {
        result = 'tx_remove_liquidity';
      }
    } else if (msgType.includes('irismod.') && msgType.includes('farm')) {
      if (msgType.includes('MsgStake')) {
        result = 'tx_farm_stake';
      } else if (msgType.includes('MsgHarvest')) {
        result = 'tx_farm_harvest';
      }
    }

    // crypto msg type
    else if (msgType.includes('chainmain.') && msgType.includes('nft')) {
      if (msgType.includes('MsgMintNFT')) {
        result = 'tx_nft_mint';
      } else if (msgType.includes('MsgTransferNFT')) {
        if (msgValue?.sender === address) {
          result = 'tx_nft_send';
        } else if (msgValue?.recipient === address) {
          result = 'tx_nft_receive';
        } else {
          result = 'tx_nft_transfer';
        }
      } else if (msgType.includes('MsgEditNFT')) {
        result = 'tx_nft_edit';
      } else if (msgType.includes('MsgIssueDenom')) {
        result = 'tx_nft_issueDenom';
      }
    }

    // starname msg type
    else if (msgType.includes('starnamed.') && msgType.includes('starname')) {
      if (msgType.includes('MsgRegisterDomain')) {
        result = 'tx_starname_registe_domain';
      } else if (msgType.includes('MsgRegisterAccount')) {
        result = 'tx_starname_registe_account';
      } else if (msgType.includes('MsgDeleteDomain')) {
        result = 'tx_starname_delete_domain';
      } else if (msgType.includes('MsgDeleteAccount')) {
        result = 'tx_starname_delete_account';
      } else if (msgType.includes('MsgRenewDomain')) {
        result = 'tx_starname_renew_domain';
      } else if (msgType.includes('MsgRenewAccount')) {
        result = 'tx_starname_renew_account';
      } else if (msgType.includes('MsgReplaceAccountResources')) {
        result = 'tx_starname_update_resource';
      }
    }

    // osmosis msg type
    else if (msgType.includes('osmosis.')) {
      if (msgType.includes('MsgSwapExactAmountIn')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgSwapExactAmountOut')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgJoinPool')) {
        result = 'tx_join_pool';
      } else if (msgType.includes('MsgExitPool')) {
        result = 'tx_exit_pool';
      } else if (msgType.includes('MsgJoinSwapExternAmountIn')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgJoinSwapShareAmountOut')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgExitSwapExternAmountOut')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgExitSwapShareAmountIn')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgCreatePool')) {
        result = 'tx_create_pool';
      } else if (msgType.includes('MsgCreateBalancerPool')) {
        result = 'tx_create_pool';
      }

      if (msgType.includes('lockup')) {
        if (msgType.includes('MsgLockTokens')) {
          result = 'tx_osmosis_token_lockup';
        } else if (msgType.includes('MsgBeginUnlockingAll')) {
          result = 'tx_osmosis_begin_unlucking_all';
        } else if (msgType.includes('MsgBeginUnlocking')) {
          result = 'tx_osmosis_begin_unlucking';
        }
      }

      if (msgType.includes('superfluid')) {
        if (msgType.includes('MsgSuperfluidDelegate')) {
          result = 'tx_osmosis_super_fluid_delegate';
        } else if (msgType.includes('MsgSuperfluidUndelegate')) {
          result = 'tx_osmosis_super_fluid_undelegate';
        } else if (msgType.includes('MsgSuperfluidUnbondLock')) {
          result = 'tx_osmosis_super_fluid_unbondinglock';
        } else if (msgType.includes('MsgLockAndSuperfluidDelegate')) {
          result = 'tx_osmosis_super_fluid_lockanddelegate';
        }
      }
    }

    // medi msg type
    else if (msgType.includes('panacea.') && msgType.includes('aol')) {
      if (msgType.includes('MsgAddRecord')) {
        result = 'tx_med_add_record';
      } else if (msgType.includes('MsgCreateTopic')) {
        result = 'tx_med_create_topic';
      } else if (msgType.includes('MsgAddWriter')) {
        result = 'tx_med_add_writer';
      }
    } else if (msgType.includes('panacea.') && msgType.includes('did')) {
      if (msgType.includes('MsgCreateDID')) {
        result = 'tx_med_create_did';
      }
    }

    // rizon msg type
    else if (msgType.includes('rizonworld.') && msgType.includes('tokenswap')) {
      if (msgType.includes('MsgCreateTokenswapRequest')) {
        result = 'tx_rizon_event_horizon';
      }
    }

    // gravity dex msg type
    else if (msgType.includes('tendermint.') && msgType.includes('liquidity')) {
      if (msgType.includes('MsgDepositWithinBatch')) {
        result = 'tx_join_pool';
      } else if (msgType.includes('MsgSwapWithinBatch')) {
        result = 'tx_coin_swap';
      } else if (msgType.includes('MsgWithdrawWithinBatch')) {
        result = 'tx_exit_pool';
      }
    }

    // desmos msg type
    else if (msgType.includes('desmos.') && msgType.includes('profiles')) {
      if (msgType.includes('MsgSaveProfile')) {
        result = 'tx_desmos_save_profile';
      } else if (msgType.includes('MsgDeleteProfile')) {
        result = 'tx_desmos_delete_profile';
      } else if (msgType.includes('MsgCreateRelationship')) {
        result = 'tx_desmos_create_relation';
      } else if (msgType.includes('MsgDeleteRelationship')) {
        result = 'tx_desmos_delete_relation';
      } else if (msgType.includes('MsgBlockUser')) {
        result = 'tx_desmos_delete_block_user';
      } else if (msgType.includes('MsgUnblockUser')) {
        result = 'tx_desmos_delete_unblock_user';
      } else if (msgType.includes('MsgLinkChainAccount')) {
        result = 'tx_desmos_link_chain_account';
      }
    }

    // kava msg type
    else if (msgType.includes('kava.') && msgType.includes('auction')) {
      if (msgType.includes('MsgPlaceBid')) {
        result = 'tx_kava_auction_bid';
      }
    } else if (msgType.includes('kava.') && msgType.includes('cdp')) {
      if (msgType.includes('MsgCreateCDP')) {
        result = 'tx_kava_create_cdp';
      } else if (msgType.includes('MsgDeposit')) {
        result = 'tx_kava_deposit_cdp';
      } else if (msgType.includes('MsgWithdraw')) {
        result = 'tx_kava_withdraw_cdp';
      } else if (msgType.includes('MsgDrawDebt')) {
        result = 'tx_kava_drawdebt_cdp';
      } else if (msgType.includes('MsgRepayDebt')) {
        result = 'tx_kava_repaydebt_cdp';
      } else if (msgType.includes('MsgLiquidate')) {
        result = 'tx_kava_liquidate_cdp';
      }
    } else if (msgType.includes('kava.') && msgType.includes('swap')) {
      if (msgType.includes('MsgDeposit')) {
        result = 'tx_kava_swap_deposit';
      } else if (msgType.includes('MsgWithdraw')) {
        result = 'tx_kava_swap_withdraw';
      } else if (msgType.includes('MsgSwapExactForTokens')) {
        result = 'tx_kava_swap_token';
      } else if (msgType.includes('MsgSwapForExactTokens')) {
        result = 'tx_kava_swap_token';
      }
    } else if (msgType.includes('kava.') && msgType.includes('hard')) {
      if (msgType.includes('MsgDeposit')) {
        result = 'tx_kava_hard_deposit';
      } else if (msgType.includes('MsgWithdraw')) {
        result = 'tx_kava_hard_withdraw';
      } else if (msgType.includes('MsgBorrow')) {
        result = 'tx_kava_hard_borrow';
      } else if (msgType.includes('MsgRepay')) {
        result = 'tx_kava_hard_repay';
      } else if (msgType.includes('MsgLiquidate')) {
        result = 'tx_kava_hard_liquidate';
      }
    } else if (msgType.includes('kava.') && msgType.includes('savings')) {
      if (msgType.includes('MsgDeposit')) {
        result = 'tx_kava_save_deposit';
      } else if (msgType.includes('MsgWithdraw')) {
        result = 'tx_kava_save_withdraw';
      }
    } else if (msgType.includes('kava.') && msgType.includes('incentive')) {
      if (msgType.includes('MsgClaimUSDXMintingReward')) {
        result = 'tx_kava_mint_incentive';
      } else if (msgType.includes('MsgClaimHardReward')) {
        result = 'tx_kava_hard_incentive';
      } else if (msgType.includes('MsgClaimDelegatorReward')) {
        result = 'tx_kava_delegator_incentive';
      } else if (msgType.includes('MsgClaimSwapReward')) {
        result = 'tx_kava_swap_incentive';
      } else if (msgType.includes('MsgClaimSavingsReward')) {
        result = 'tx_kava_save_incentive';
      } else if (msgType.includes('MsgClaimEarnReward')) {
        result = 'tx_kava_earn_incentive';
      }
    } else if (msgType.includes('kava.') && msgType.includes('bep3')) {
      if (msgType.includes('MsgCreateAtomicSwap')) {
        result = 'tx_kava_bep3_create';
      } else if (msgType.includes('MsgClaimAtomicSwap')) {
        result = 'tx_kava_bep3_claim';
      } else if (msgType.includes('MsgRefundAtomicSwap')) {
        result = 'tx_kava_bep3_refund';
      }
    } else if (msgType.includes('kava.') && msgType.includes('pricefeed')) {
      if (msgType.includes('MsgPostPrice')) {
        result = 'tx_kava_post_price';
      }
    } else if (msgType.includes('kava.') && msgType.includes('router')) {
      if (msgType.includes('MsgDelegateMintDeposit')) {
        result = 'tx_kava_earn_delegateDeposit';
      } else if (msgType.includes('MsgMintDeposit')) {
        result = 'tx_kava_earn_Deposit';
      } else if (msgType.includes('MsgWithdrawBurn')) {
        result = 'tx_kava_earn_withdraw';
      }
    }

    // axelar msg type
    else if (msgType.includes('axelar.') && msgType.includes('reward')) {
      if (msgType.includes('RefundMsgRequest')) {
        result = 'tx_axelar_refund_msg_request';
      }
    } else if (msgType.includes('axelar.') && msgType.includes('axelarnet')) {
      if (msgType.includes('LinkRequest')) {
        result = 'tx_axelar_link_request';
      } else if (msgType.includes('ConfirmDepositRequest')) {
        result = 'tx_axelar_confirm_deposit_request';
      } else if (msgType.includes('RouteIBCTransfersRequest')) {
        result = 'tx_axelar_route_ibc_request';
      }
    }

    // injective msg type
    else if (msgType.includes('injective.') && msgType.includes('exchange')) {
      if (msgType.includes('MsgBatchUpdateOrders')) {
        result = 'tx_injective_batch_update_order';
      } else if (msgType.includes('MsgBatchCreateDerivativeLimitOrders') || msgType.includes('MsgCreateDerivativeLimitOrder')) {
        result = 'tx_injective_create_limit_order';
      } else if (msgType.includes('MsgBatchCreateSpotLimitOrders') || msgType.includes('MsgCreateSpotLimitOrder')) {
        result = 'tx_injective_create_spot_order';
      } else if (msgType.includes('MsgBatchCancelDerivativeOrders') || msgType.includes('MsgCancelDerivativeOrder')) {
        result = 'tx_injective_cancel_limit_order';
      } else if (msgType.includes('MsgBatchCancelSpotOrder') || msgType.includes('MsgCancelSpotOrder')) {
        result = 'tx_injective_cancel_spot_order';
      }
    }

    // persistence msg type
    else if (msgType.includes('pstake.') && msgType.includes('lscosmos')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = 'tx_stride_liquid_stake';
      } else if (msgType.includes('MsgLiquidUnstake')) {
        result = 'tx_stride_liquid_unstake';
      } else if (msgType.includes('MsgRedeem')) {
        result = 'tx_persis_liquid_redeem';
      } else if (msgType.includes('MsgClaim')) {
        result = 'tx_persis_liquid_claim';
      }
    }

    // ibc msg type
    else if (msgType.includes('ibc.')) {
      if (msgType.includes('MsgTransfer')) {
        result = 'tx_ibc_send';
      } else if (msgType.includes('MsgUpdateClient')) {
        result = 'tx_ibc_client_update';
      } else if (msgType.includes('MsgRecvPacket')) {
        result = 'tx_ibc_receive';
      } else if (msgType.includes('MsgAcknowledgement')) {
        result = 'tx_ibc_acknowledgement';
      }

      if (msgs.length >= 2) {
        msgs.forEach((msg) => {
          const typeValue = msg['@type'] as string;
          if (typeValue.includes('MsgAcknowledgement')) {
            result = 'tx_ibc_acknowledgement';
          }
        });
        msgs.forEach((msg) => {
          const typeValue = msg['@type'] as string;

          if (typeValue.includes('MsgRecvPacket')) {
            result = 'tx_ibc_receive';
          }
        });
      }
    }

    // wasm msg type
    else if (msgType.includes('cosmwasm.')) {
      if (msgType.includes('MsgStoreCode')) {
        result = 'tx_cosmwasm_store_code';
      } else if (msgType.includes('MsgInstantiateContract')) {
        result = 'tx_cosmwasm_instantiate';
      } else if (msgType.includes('MsgExecuteContract')) {
        const wasmMsg = msgValue['msg__@stringify'] as string;

        if (wasmMsg) {
          try {
            const wasmFunc = JSON.parse(wasmMsg) as Record<string, unknown>;
            const description =
              Object.keys(wasmFunc)[0]
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (match) => match.toUpperCase()) || '';

            result = `tx_cosmwasm ${description}`;
          } catch (_) {
            result = 'tx_cosmwasm_execontract';
          }
        } else {
          result = 'tx_cosmwasm_execontract';
        }
      }
    }

    // evm msg type
    else if (msgType.includes('ethermint.evm')) {
      if (msgType.includes('MsgEthereumTx')) {
        result = 'tx_ethereum_evm';
      }
    }

    if (msgs.length > 1) {
      result = `${result} + ${msgs.length - 1}`;
    }
  }

  return result;
}

export function getDpCoin(activity: Activity, chain: CosmosChain, address: string) {
  const msgs = getTxMsgs(activity);

  // display staking reward amount
  const result: Amount[] = [];

  if (msgs.length > 0) {
    const allReward = msgs.every((msg) => typeof msg?.['@type'] !== 'string' || msg['@type'].includes('MsgWithdrawDelegatorReward'));

    if (allReward) {
      activity.data?.logs?.forEach((log) => {
        const transferEvent = log.events?.find((e) => e.type === 'transfer');

        if (transferEvent) {
          const attribute = transferEvent.attributes.find((a) => a.key === 'amount');

          if (attribute) {
            const rawAmounts = attribute.value.split(',');

            rawAmounts.forEach((rawAmount) => {
              const match = rawAmount.match(/[0-9]*/);

              if (match) {
                const amount = match[0];
                const denom = rawAmount.slice(amount.length);
                const value = {
                  denom,
                  amount,
                };

                result.push(value);
              }
            });
          }
        }
      });
      return sortedCoins(chain, result);
    }

    const ibcReceived = msgs.some((msg) => typeof msg?.['@type'] === 'string' && msg['@type'].includes('ibc') && msg['@type'].includes('MsgRecvPacket'));

    if (ibcReceived) {
      activity.data?.logs?.forEach((log) => {
        const transferEvent = log.events?.find((event) => event.type === 'transfer');

        if (transferEvent) {
          transferEvent.attributes?.forEach((attribute) => {
            if (isValidCosmosAddress(attribute.value) && attribute.value === address) {
              const amountAttribute = transferEvent.attributes?.find((a) => a.key === 'amount');

              if (amountAttribute) {
                amountAttribute.value.split(',').forEach((rawAmount) => {
                  const match = rawAmount.match(/[0-9]*/);

                  if (match) {
                    const amount = match[0];
                    const denom = rawAmount.substring(match[0].length);
                    const value = {
                      denom,
                      amount,
                    };
                    result.push(value);
                  }
                });
              }
            }
          });
        }
      });

      return sortedCoins(chain, result);
    }
  }

  // display re-invest amount
  if (msgs.length === 2) {
    const msgType0 = typeof msgs[0]?.['@type'] === 'string' ? msgs[0]?.['@type'] : '';
    const msgType1 = typeof msgs[1]?.['@type'] === 'string' ? msgs[1]?.['@type'] : '';

    if (msgType0.includes('MsgWithdrawDelegatorReward') && msgType1.includes('MsgDelegate')) {
      const msgValue1 = msgs[1][msgType1.replace(/\./g, '-')] as Record<string, unknown>;

      const rawAmount = msgValue1?.amount as { denom: string; amount: string };

      if (rawAmount) {
        const value = {
          denom: rawAmount.denom,
          amount: rawAmount.amount,
        };

        result.push(value);
      }
      return sortedCoins(chain, result);
    }
  }

  if (msgs.length === 0 || msgs.length > 1) {
    return null;
  }

  const firstMsg = msgs[0];
  const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';
  const msgValue = firstMsg[msgType.replace(/\./g, '-')] as {
    amount?: Amount[] | Amount;
    value?: { amount: Amount[] };
    token?: Amount;
  };

  if (msgType.includes('MsgSend')) {
    const rawAmounts = msgValue.amount;

    if (rawAmounts && Array.isArray(rawAmounts) && rawAmounts.length > 0) {
      const value = {
        denom: rawAmounts[0].denom,
        amount: rawAmounts[0].amount,
      };
      result.push(value);
    }

    const rawVaueAmounts = msgValue.value?.amount;
    if (rawVaueAmounts) {
      const value = {
        denom: rawVaueAmounts[0].denom,
        amount: rawVaueAmounts[0].amount,
      };
      result.push(value);
    }
  } else if (
    msgType.includes('MsgDelegate') ||
    msgType.includes('MsgUndelegate') ||
    msgType.includes('MsgBeginRedelegate') ||
    msgType.includes('MsgCancelUnbondingDelegation')
  ) {
    const rawAmount = msgValue.amount;

    if (rawAmount && !Array.isArray(rawAmount)) {
      const value = {
        denom: rawAmount.denom,
        amount: rawAmount.amount,
      };

      result.push(value);
    }
  } else if (msgType.includes('ibc') && msgType.includes('MsgTransfer')) {
    const rawAmount = msgValue.token;

    if (rawAmount) {
      const value = {
        denom: rawAmount.denom,
        amount: rawAmount.amount,
      };

      result.push(value);
    }
  }
  return sortedCoins(chain, result);
}

function sortedCoins(chain: CosmosChain, input: Amount[]): Amount[] {
  const accumulatedAmounts = input?.reduce((acc: Amount[], amountItem: Amount) => {
    const duplicateAmountItem = acc.find((c) => c.denom === amountItem.denom);

    if (duplicateAmountItem) {
      duplicateAmountItem.amount = plus(duplicateAmountItem.amount, amountItem.amount);
    } else {
      acc.push(amountItem);
    }

    return acc;
  }, []);

  return accumulatedAmounts?.sort((a, b) => (a.denom === chain.baseDenom && b.denom !== chain.baseDenom ? -1 : 0)) || [];
}
