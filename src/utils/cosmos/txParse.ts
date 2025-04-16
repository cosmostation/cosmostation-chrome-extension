import { TX_MESSAGE_TYPE } from '@/constants/cosmos/tx';
import type { Amount } from '@/types/cosmos/common';
import type { AccountTx } from '@/types/cosmos/txs';

import { plus } from '../numbers';
import { shorterAddress } from '../string';

export function getTxMsgs(tx: AccountTx) {
  return tx.data?.tx?.['/cosmos-tx-v1beta1-Tx']?.body?.messages || [];
}

export function getMsgType(tx: AccountTx, address: string) {
  const msgs = getTxMsgs(tx);

  if (msgs.length === 0) {
    return TX_MESSAGE_TYPE.TX_KNOWN;
  }

  if (msgs.length === 2) {
    const msgType0 = typeof msgs[0]['@type'] === 'string' ? msgs[0]['@type'] : '';
    const msgType1 = typeof msgs[1]['@type'] === 'string' ? msgs[1]['@type'] : '';

    if ((msgType0.includes('MsgWithdrawDelegatorReward') || msgType0.includes('MsgWithdrawDelegationReward')) && msgType1.includes('MsgDelegate')) {
      return TX_MESSAGE_TYPE.TX_REINVEST;
    }
  }

  let result: string = TX_MESSAGE_TYPE.TX_KNOWN;

  const firstMsg = msgs[0];
  const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';

  if (msgType) {
    result = msgType.split('.').pop()?.replace('Msg', '') || TX_MESSAGE_TYPE.TX_KNOWN;

    const msgValue = firstMsg[msgType.replace(/\./g, '-')] as Record<string, unknown>;

    if (msgType.includes('cosmos.') && msgType.includes('staking')) {
      if (msgType.includes('MsgCreateValidator')) {
        result = TX_MESSAGE_TYPE.TX_CREATE_VALIDATOR;
      } else if (msgType.includes('MsgEditValidator')) {
        result = TX_MESSAGE_TYPE.TX_EDIT_VALIDATOR;
      } else if (msgType.includes('MsgDelegate')) {
        result = TX_MESSAGE_TYPE.TX_DELEGATE;
      } else if (msgType.includes('MsgUndelegate')) {
        result = TX_MESSAGE_TYPE.TX_UNDELEGATE;
      } else if (msgType.includes('MsgBeginRedelegate')) {
        result = TX_MESSAGE_TYPE.TX_REDELEGATE;
      } else if (msgType.includes('MsgCancelUnbondingDelegation')) {
        result = TX_MESSAGE_TYPE.TX_CANCEL_UNDELEGATE;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('bank')) {
      if (msgType.includes('MsgSend')) {
        const senderAddr = msgValue?.from_address;
        const receiverAddr = msgValue?.to_address;

        if (senderAddr === address) {
          result = TX_MESSAGE_TYPE.TX_SEND;
        } else if (receiverAddr === address) {
          result = TX_MESSAGE_TYPE.TX_RECEIVE;
        } else {
          result = TX_MESSAGE_TYPE.TX_TRANSFER;
        }
      } else if (msgType.includes('MsgMultiSend')) {
        result = TX_MESSAGE_TYPE.TX_MULTI_SEND;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('distribution')) {
      if (msgType.includes('MsgSetWithdrawAddress') || msgType.includes('MsgModifyWithdrawAddress')) {
        result = TX_MESSAGE_TYPE.TX_CHANGE_REWARD_ADDRESS;
      } else if (msgType.includes('MsgWithdrawDelegatorReward') || msgType.includes('MsgWithdrawDelegationReward')) {
        result = TX_MESSAGE_TYPE.TX_GET_REWARD;
      } else if (msgType.includes('MsgWithdrawValidatorCommission')) {
        result = TX_MESSAGE_TYPE.TX_GET_COMMISSION;
      } else if (msgType.includes('MsgFundCommunityPool')) {
        result = TX_MESSAGE_TYPE.TX_FUND_POOL;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('gov')) {
      if (msgType.includes('MsgSubmitProposal')) {
        result = TX_MESSAGE_TYPE.TX_SUBMIT_PROPOSAL;
      } else if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_PROPOSAL_DEPOSIT;
      } else if (msgType.includes('MsgVote')) {
        result = TX_MESSAGE_TYPE.TX_VOTE;
      } else if (msgType.includes('MsgVoteWeighted')) {
        result = TX_MESSAGE_TYPE.TX_VOTE_WEIGHTED;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('authz')) {
      if (msgType.includes('MsgGrant')) {
        result = TX_MESSAGE_TYPE.TX_AUTHZ_GRANT;
      } else if (msgType.includes('MsgRevoke')) {
        result = TX_MESSAGE_TYPE.TX_AUTHZ_REVOKE;
      } else if (msgType.includes('MsgExec')) {
        result = TX_MESSAGE_TYPE.TX_AUTHZ_EXE;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('slashing')) {
      if (msgType.includes('MsgUnjail')) {
        result = TX_MESSAGE_TYPE.TX_UNJAIL_VALIDATOR;
      }
    } else if (msgType.includes('cosmos.') && msgType.includes('feegrant')) {
      if (msgType.includes('MsgGrantAllowance')) {
        result = TX_MESSAGE_TYPE.TX_FEEGRANT_ALLOWANCE;
      } else if (msgType.includes('MsgRevokeAllowance')) {
        result = TX_MESSAGE_TYPE.TX_FEEGRANT_REVOKE;
      }
    }

    // stride msg type
    else if (msgType.includes('stride.') && msgType.includes('stakeibc')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = TX_MESSAGE_TYPE.TX_STRIDE_LIQUID_STAKE;
      } else if (msgType.includes('MsgRedeemStake')) {
        result = TX_MESSAGE_TYPE.TX_STRIDE_LIQUID_UNSTAKE;
      }
    }

    // crescent msg type
    else if (msgType.includes('crescent.') && msgType.includes('liquidstaking')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_LIQUID_STAKE;
      } else if (msgType.includes('MsgLiquidUnstake')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_LIQUID_UNSTAKE;
      }
    } else if (msgType.includes('crescent.') && msgType.includes('liquidity')) {
      if (msgType.includes('MsgCreatePair')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CREATE_PAIR;
      } else if (msgType.includes('MsgCreatePool')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CREATE_POOL;
      } else if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_DEPOSIT;
      } else if (msgType.includes('MsgWithdraw')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_WITHDRAW;
      } else if (msgType.includes('MsgLimitOrder')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_LIMIT_ORDER;
      } else if (msgType.includes('MsgMarketOrder')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_MARKET_ORDER;
      } else if (msgType.includes('MsgCancelOrder')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CANCEL_ORDER;
      } else if (msgType.includes('MsgCancelAllOrders')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CANCEL_ALL_ORDERS;
      }
    } else if (msgType.includes('crescent.') && msgType.includes('farming')) {
      if (msgType.includes('MsgStake')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_STAKE;
      } else if (msgType.includes('MsgUnstake')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_UNSTAKE;
      } else if (msgType.includes('MsgHarvest')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_HARVEST;
      } else if (msgType.includes('MsgCreateFixedAmountPlan')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CREATE_FIXED_AMOUNT_PLAN;
      } else if (msgType.includes('MsgCreateRatioPlan')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CREATE_RATIO_PLAN;
      } else if (msgType.includes('MsgRemovePlan')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_REMOVE_PLAN;
      } else if (msgType.includes('MsgAdvanceEpoch')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_ADVANCE_EPOCH;
      }
    } else if (msgType.includes('crescent.') && msgType.includes('claim')) {
      if (msgType.includes('MsgClaim')) {
        result = TX_MESSAGE_TYPE.TX_CRESCENT_CLAIM;
      }
    }

    // irismod msg type
    else if (msgType.includes('irismod.') && msgType.includes('nft')) {
      if (msgType.includes('MsgMintNFT')) {
        result = TX_MESSAGE_TYPE.TX_NFT_MINT;
      } else if (msgType.includes('MsgTransferNFT')) {
        if (msgValue?.sender === address) {
          result = TX_MESSAGE_TYPE.TX_NFT_SEND;
        } else if (msgValue?.recipient === address) {
          result = TX_MESSAGE_TYPE.TX_NFT_RECEIVE;
        } else {
          result = TX_MESSAGE_TYPE.TX_NFT_TRANSFER;
        }
      } else if (msgType.includes('MsgEditNFT')) {
        result = TX_MESSAGE_TYPE.TX_NFT_EDIT;
      } else if (msgType.includes('MsgIssueDenom')) {
        result = TX_MESSAGE_TYPE.TX_NFT_ISSUE_DENOM;
      }
    } else if (msgType.includes('irismod.') && msgType.includes('coinswap')) {
      if (msgType.includes('MsgSwapOrder')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgAddLiquidity')) {
        result = TX_MESSAGE_TYPE.TX_ADD_LIQUIDITY;
      } else if (msgType.includes('MsgRemoveLiquidity')) {
        result = TX_MESSAGE_TYPE.TX_REMOVE_LIQUIDITY;
      }
    } else if (msgType.includes('irismod.') && msgType.includes('farm')) {
      if (msgType.includes('MsgStake')) {
        result = TX_MESSAGE_TYPE.TX_FARM_STAKE;
      } else if (msgType.includes('MsgHarvest')) {
        result = TX_MESSAGE_TYPE.TX_FARM_HARVEST;
      }
    }

    // crypto msg type
    else if (msgType.includes('chainmain.') && msgType.includes('nft')) {
      if (msgType.includes('MsgMintNFT')) {
        result = TX_MESSAGE_TYPE.TX_NFT_MINT;
      } else if (msgType.includes('MsgTransferNFT')) {
        if (msgValue?.sender === address) {
          result = TX_MESSAGE_TYPE.TX_NFT_SEND;
        } else if (msgValue?.recipient === address) {
          result = TX_MESSAGE_TYPE.TX_NFT_RECEIVE;
        } else {
          result = TX_MESSAGE_TYPE.TX_NFT_TRANSFER;
        }
      } else if (msgType.includes('MsgEditNFT')) {
        result = TX_MESSAGE_TYPE.TX_NFT_EDIT;
      } else if (msgType.includes('MsgIssueDenom')) {
        result = TX_MESSAGE_TYPE.TX_NFT_ISSUE_DENOM;
      }
    }

    // starname msg type
    else if (msgType.includes('starnamed.') && msgType.includes('starname')) {
      if (msgType.includes('MsgRegisterDomain')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_REGISTE_DOMAIN;
      } else if (msgType.includes('MsgRegisterAccount')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_REGISTE_ACCOUNT;
      } else if (msgType.includes('MsgDeleteDomain')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_DELETE_DOMAIN;
      } else if (msgType.includes('MsgDeleteAccount')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_DELETE_ACCOUNT;
      } else if (msgType.includes('MsgRenewDomain')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_RENEW_DOMAIN;
      } else if (msgType.includes('MsgRenewAccount')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_RENEW_ACCOUNT;
      } else if (msgType.includes('MsgReplaceAccountResources')) {
        result = TX_MESSAGE_TYPE.TX_STARNAME_UPDATE_RESOURCE;
      }
    }

    // osmosis msg type
    else if (msgType.includes('osmosis.')) {
      if (msgType.includes('MsgSwapExactAmountIn')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgSwapExactAmountOut')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgJoinPool')) {
        result = TX_MESSAGE_TYPE.TX_JOIN_POOL;
      } else if (msgType.includes('MsgExitPool')) {
        result = TX_MESSAGE_TYPE.TX_EXIT_POOL;
      } else if (msgType.includes('MsgJoinSwapExternAmountIn')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgJoinSwapShareAmountOut')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgExitSwapExternAmountOut')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgExitSwapShareAmountIn')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgCreatePool')) {
        result = TX_MESSAGE_TYPE.TX_CREATE_POOL;
      } else if (msgType.includes('MsgCreateBalancerPool')) {
        result = TX_MESSAGE_TYPE.TX_CREATE_POOL;
      }

      if (msgType.includes('lockup')) {
        if (msgType.includes('MsgLockTokens')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_TOKEN_LOCKUP;
        } else if (msgType.includes('MsgBeginUnlockingAll')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_BEGIN_UNLUCKING_ALL;
        } else if (msgType.includes('MsgBeginUnlocking')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_BEGIN_UNLUCKING;
        }
      }

      if (msgType.includes('superfluid')) {
        if (msgType.includes('MsgSuperfluidDelegate')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_SUPER_FLUID_DELEGATE;
        } else if (msgType.includes('MsgSuperfluidUndelegate')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_SUPER_FLUID_UNDELEGATE;
        } else if (msgType.includes('MsgSuperfluidUnbondLock')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_SUPER_FLUID_UNBONDINGLOCK;
        } else if (msgType.includes('MsgLockAndSuperfluidDelegate')) {
          result = TX_MESSAGE_TYPE.TX_OSMOSIS_SUPER_FLUID_LOCKANDDELEGATE;
        }
      }
    }

    // medi msg type
    else if (msgType.includes('panacea.') && msgType.includes('aol')) {
      if (msgType.includes('MsgAddRecord')) {
        result = TX_MESSAGE_TYPE.TX_MED_ADD_RECORD;
      } else if (msgType.includes('MsgCreateTopic')) {
        result = TX_MESSAGE_TYPE.TX_MED_CREATE_TOPIC;
      } else if (msgType.includes('MsgAddWriter')) {
        result = TX_MESSAGE_TYPE.TX_MED_ADD_WRITER;
      }
    } else if (msgType.includes('panacea.') && msgType.includes('did')) {
      if (msgType.includes('MsgCreateDID')) {
        result = TX_MESSAGE_TYPE.TX_MED_CREATE_DID;
      }
    }

    // rizon msg type
    else if (msgType.includes('rizonworld.') && msgType.includes('tokenswap')) {
      if (msgType.includes('MsgCreateTokenswapRequest')) {
        result = TX_MESSAGE_TYPE.TX_RIZON_EVENT_HORIZON;
      }
    }

    // gravity dex msg type
    else if (msgType.includes('tendermint.') && msgType.includes('liquidity')) {
      if (msgType.includes('MsgDepositWithinBatch')) {
        result = TX_MESSAGE_TYPE.TX_JOIN_POOL;
      } else if (msgType.includes('MsgSwapWithinBatch')) {
        result = TX_MESSAGE_TYPE.TX_COIN_SWAP;
      } else if (msgType.includes('MsgWithdrawWithinBatch')) {
        result = TX_MESSAGE_TYPE.TX_EXIT_POOL;
      }
    }

    // desmos msg type
    else if (msgType.includes('desmos.') && msgType.includes('profiles')) {
      if (msgType.includes('MsgSaveProfile')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_SAVE_PROFILE;
      } else if (msgType.includes('MsgDeleteProfile')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_DELETE_PROFILE;
      } else if (msgType.includes('MsgCreateRelationship')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_CREATE_RELATION;
      } else if (msgType.includes('MsgDeleteRelationship')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_DELETE_RELATION;
      } else if (msgType.includes('MsgBlockUser')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_DELETE_BLOCK_USER;
      } else if (msgType.includes('MsgUnblockUser')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_DELETE_UNBLOCK_USER;
      } else if (msgType.includes('MsgLinkChainAccount')) {
        result = TX_MESSAGE_TYPE.TX_DESMOS_LINK_CHAIN_ACCOUNT;
      }
    }

    // kava msg type
    else if (msgType.includes('kava.') && msgType.includes('auction')) {
      if (msgType.includes('MsgPlaceBid')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_AUCTION_BID;
      }
    } else if (msgType.includes('kava.') && msgType.includes('cdp')) {
      if (msgType.includes('MsgCreateCDP')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_CREATE_CDP;
      } else if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_DEPOSIT_CDP;
      } else if (msgType.includes('MsgWithdraw')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_WITHDRAW_CDP;
      } else if (msgType.includes('MsgDrawDebt')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_DRAWDEBT_CDP;
      } else if (msgType.includes('MsgRepayDebt')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_REPAYDEBT_CDP;
      } else if (msgType.includes('MsgLiquidate')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_LIQUIDATE_CDP;
      }
    } else if (msgType.includes('kava.') && msgType.includes('swap')) {
      if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SWAP_DEPOSIT;
      } else if (msgType.includes('MsgWithdraw')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SWAP_WITHDRAW;
      } else if (msgType.includes('MsgSwapExactForTokens')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SWAP_TOKEN;
      } else if (msgType.includes('MsgSwapForExactTokens')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SWAP_TOKEN;
      }
    } else if (msgType.includes('kava.') && msgType.includes('hard')) {
      if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_DEPOSIT;
      } else if (msgType.includes('MsgWithdraw')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_WITHDRAW;
      } else if (msgType.includes('MsgBorrow')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_BORROW;
      } else if (msgType.includes('MsgRepay')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_REPAY;
      } else if (msgType.includes('MsgLiquidate')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_LIQUIDATE;
      }
    } else if (msgType.includes('kava.') && msgType.includes('savings')) {
      if (msgType.includes('MsgDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SAVE_DEPOSIT;
      } else if (msgType.includes('MsgWithdraw')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SAVE_WITHDRAW;
      }
    } else if (msgType.includes('kava.') && msgType.includes('incentive')) {
      if (msgType.includes('MsgClaimUSDXMintingReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_MINT_INCENTIVE;
      } else if (msgType.includes('MsgClaimHardReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_HARD_INCENTIVE;
      } else if (msgType.includes('MsgClaimDelegatorReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_DELEGATOR_INCENTIVE;
      } else if (msgType.includes('MsgClaimSwapReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SWAP_INCENTIVE;
      } else if (msgType.includes('MsgClaimSavingsReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_SAVE_INCENTIVE;
      } else if (msgType.includes('MsgClaimEarnReward')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_EARN_INCENTIVE;
      }
    } else if (msgType.includes('kava.') && msgType.includes('bep3')) {
      if (msgType.includes('MsgCreateAtomicSwap')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_BEP3_CREATE;
      } else if (msgType.includes('MsgClaimAtomicSwap')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_BEP3_CLAIM;
      } else if (msgType.includes('MsgRefundAtomicSwap')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_BEP3_REFUND;
      }
    } else if (msgType.includes('kava.') && msgType.includes('pricefeed')) {
      if (msgType.includes('MsgPostPrice')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_POST_PRICE;
      }
    } else if (msgType.includes('kava.') && msgType.includes('router')) {
      if (msgType.includes('MsgDelegateMintDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_EARN_DELEGATE_DEPOSIT;
      } else if (msgType.includes('MsgMintDeposit')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_EARN_DEPOSIT;
      } else if (msgType.includes('MsgWithdrawBurn')) {
        result = TX_MESSAGE_TYPE.TX_KAVA_EARN_WITHDRAW;
      }
    }

    // axelar msg type
    else if (msgType.includes('axelar.') && msgType.includes('reward')) {
      if (msgType.includes('RefundMsgRequest')) {
        result = TX_MESSAGE_TYPE.TX_AXELAR_REFUND_MSG_REQUEST;
      }
    } else if (msgType.includes('axelar.') && msgType.includes('axelarnet')) {
      if (msgType.includes('LinkRequest')) {
        result = TX_MESSAGE_TYPE.TX_AXELAR_LINK_REQUEST;
      } else if (msgType.includes('ConfirmDepositRequest')) {
        result = TX_MESSAGE_TYPE.TX_AXELAR_CONFIRM_DEPOSIT_REQUEST;
      } else if (msgType.includes('RouteIBCTransfersRequest')) {
        result = TX_MESSAGE_TYPE.TX_AXELAR_ROUTE_IBC_REQUEST;
      }
    }

    // injective msg type
    else if (msgType.includes('injective.') && msgType.includes('exchange')) {
      if (msgType.includes('MsgBatchUpdateOrders')) {
        result = TX_MESSAGE_TYPE.TX_INJECTIVE_BATCH_UPDATE_ORDER;
      } else if (msgType.includes('MsgBatchCreateDerivativeLimitOrders') || msgType.includes('MsgCreateDerivativeLimitOrder')) {
        result = TX_MESSAGE_TYPE.TX_INJECTIVE_CREATE_LIMIT_ORDER;
      } else if (msgType.includes('MsgBatchCreateSpotLimitOrders') || msgType.includes('MsgCreateSpotLimitOrder')) {
        result = TX_MESSAGE_TYPE.TX_INJECTIVE_CREATE_SPOT_ORDER;
      } else if (msgType.includes('MsgBatchCancelDerivativeOrders') || msgType.includes('MsgCancelDerivativeOrder')) {
        result = TX_MESSAGE_TYPE.TX_INJECTIVE_CANCEL_LIMIT_ORDER;
      } else if (msgType.includes('MsgBatchCancelSpotOrder') || msgType.includes('MsgCancelSpotOrder')) {
        result = TX_MESSAGE_TYPE.TX_INJECTIVE_CANCEL_SPOT_ORDER;
      }
    }

    // persistence msg type
    else if (msgType.includes('pstake.') && msgType.includes('lscosmos')) {
      if (msgType.includes('MsgLiquidStake')) {
        result = TX_MESSAGE_TYPE.TX_STRIDE_LIQUID_STAKE;
      } else if (msgType.includes('MsgLiquidUnstake')) {
        result = TX_MESSAGE_TYPE.TX_STRIDE_LIQUID_UNSTAKE;
      } else if (msgType.includes('MsgRedeem')) {
        result = TX_MESSAGE_TYPE.TX_PERSIS_LIQUID_REDEEM;
      } else if (msgType.includes('MsgClaim')) {
        result = TX_MESSAGE_TYPE.TX_PERSIS_LIQUID_CLAIM;
      }
    }

    // ibc msg type
    else if (msgType.includes('ibc.')) {
      if (msgType.includes('MsgTransfer')) {
        result = TX_MESSAGE_TYPE.TX_IBC_SEND;
      } else if (msgType.includes('MsgUpdateClient')) {
        result = TX_MESSAGE_TYPE.TX_IBC_CLIENT_UPDATE;
      } else if (msgType.includes('MsgRecvPacket')) {
        result = TX_MESSAGE_TYPE.TX_IBC_RECEIVE;
      } else if (msgType.includes('MsgAcknowledgement')) {
        result = TX_MESSAGE_TYPE.TX_IBC_ACKNOWLEDGEMENT;
      }

      if (msgs.length >= 2) {
        msgs.forEach((msg) => {
          const typeValue = msg['@type'] as string;
          if (typeValue.includes('MsgAcknowledgement')) {
            result = TX_MESSAGE_TYPE.TX_IBC_ACKNOWLEDGEMENT;
          }
        });
        msgs.forEach((msg) => {
          const typeValue = msg['@type'] as string;

          if (typeValue.includes('MsgRecvPacket')) {
            result = TX_MESSAGE_TYPE.TX_IBC_RECEIVE;
          }
        });
      }
    }

    // wasm msg type
    else if (msgType.includes('cosmwasm.')) {
      if (msgType.includes('MsgStoreCode')) {
        result = TX_MESSAGE_TYPE.TX_COSMWASM_STORE_CODE;
      } else if (msgType.includes('MsgInstantiateContract')) {
        result = TX_MESSAGE_TYPE.TX_COSMWASM_INSTANTIATE;
      } else if (msgType.includes('MsgExecuteContract')) {
        const wasmMsg = msgValue['msg__@stringify'] as string;

        if (wasmMsg) {
          try {
            const wasmFunc = JSON.parse(wasmMsg) as Record<string, unknown>;
            const description =
              Object.keys(wasmFunc)[0]
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (match) => match.toUpperCase()) || '';

            result = `${TX_MESSAGE_TYPE.TX_COSMWASM}.${description}`;
          } catch {
            result = TX_MESSAGE_TYPE.TX_COSMWASM_EXECONTRACT;
          }
        } else {
          result = TX_MESSAGE_TYPE.TX_COSMWASM_EXECONTRACT;
        }
      }
    }

    // evm msg type
    else if (msgType.includes('ethermint.evm')) {
      if (msgType.includes('MsgEthereumTx')) {
        result = TX_MESSAGE_TYPE.TX_ETHEREUM_EVM;
      }
    }
  }

  return result;
}

export function getDpCoin(tx: AccountTx, mainAssetDenom: string, address: string) {
  const msgs = getTxMsgs(tx);

  const result: Amount[] = [];

  if (msgs.length > 0) {
    const allReward = msgs.every((msg) => typeof msg?.['@type'] !== 'string' || msg['@type'].includes('MsgWithdrawDelegatorReward'));

    if (allReward) {
      tx.data?.logs?.forEach((log) => {
        const transferEvent = log.events?.find((e) => e.type === 'transfer');

        if (transferEvent) {
          const attribute = transferEvent.attributes.find((a) => a.key === 'amount');

          if (attribute) {
            const rawAmounts = attribute.value?.split(',');

            rawAmounts?.forEach((rawAmount) => {
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
      return sortedCoins(mainAssetDenom, result);
    }

    const ibcReceived = msgs.some((msg) => typeof msg?.['@type'] === 'string' && msg['@type'].includes('ibc') && msg['@type'].includes('MsgRecvPacket'));

    if (ibcReceived) {
      tx.data?.logs?.forEach((log) => {
        const transferEvent = log.events?.find((event) => event.type === 'transfer');

        if (transferEvent) {
          transferEvent.attributes?.forEach((attribute) => {
            if (attribute.value === address) {
              const amountAttribute = transferEvent.attributes?.find((a) => a.key === 'amount');

              if (amountAttribute) {
                amountAttribute.value?.split(',').forEach((rawAmount) => {
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

      return sortedCoins(mainAssetDenom, result);
    }
  }

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
      return sortedCoins(mainAssetDenom, result);
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
  return sortedCoins(mainAssetDenom, result);
}

function sortedCoins(mainAssetDenom: string, input: Amount[]): Amount[] {
  const accumulatedAmounts = input?.reduce((acc: Amount[], amountItem: Amount) => {
    const duplicateAmountItem = acc.find((c) => c.denom === amountItem.denom);

    if (duplicateAmountItem) {
      duplicateAmountItem.amount = plus(duplicateAmountItem.amount, amountItem.amount);
    } else {
      acc.push(amountItem);
    }

    return acc;
  }, []);

  return accumulatedAmounts?.sort((a, b) => (a.denom === mainAssetDenom && b.denom !== mainAssetDenom ? -1 : 0)) || [];
}

export function getVoteOption(tx: AccountTx) {
  const firstMsg = getTxMsgs(tx)?.[0];

  if (firstMsg) {
    const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';

    if (msgType && msgType.includes('MsgVote')) {
      const msgValue = firstMsg[msgType.replace(/\./g, '-')] as Record<string, unknown>;
      const rawOption = msgValue?.option;

      if (rawOption) {
        if (rawOption === 'VOTE_OPTION_YES') {
          return 'YES';
        } else if (rawOption === 'VOTE_OPTION_ABSTAIN') {
          return 'ABSTAIN';
        } else if (rawOption === 'VOTE_OPTION_NO') {
          return 'NO';
        } else if (rawOption === 'VOTE_OPTION_NO_WITH_VETO') {
          return 'VETO';
        }
      }
    }
  }

  return undefined;
}

export function getMsgSendDetail(tx: AccountTx, address: string) {
  const firstMsg = getTxMsgs(tx)?.[0];

  if (firstMsg) {
    const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';

    if (msgType && msgType.includes('MsgSend')) {
      const msgValue = firstMsg[msgType.replace(/\./g, '-')] as Record<string, unknown>;
      const senderAddr = msgValue?.from_address as string;
      const receiverAddr = msgValue?.to_address as string;

      if (senderAddr === address) {
        return `To : ${shorterAddress(receiverAddr, 16)}`;
      }
      if (receiverAddr === address) {
        return `From : ${shorterAddress(senderAddr, 16)}`;
      }
    }
  }

  return undefined;
}

export function getMsgDetail(tx: AccountTx, address?: string) {
  const firstMsg = getTxMsgs(tx)?.[0];

  if (firstMsg) {
    const msgType = typeof firstMsg['@type'] === 'string' ? firstMsg['@type'] : '';

    if (msgType && msgType.includes('MsgVote')) {
      return getVoteOption(tx);
    }
    if (msgType && msgType.includes('MsgSend')) {
      return getMsgSendDetail(tx, address || '');
    }
  }

  return undefined;
}
