import type { NavigateOptions } from '@tanstack/react-router';

import { COSMOS_SIGN_MODE } from '@/constants/cosmos/sign';
import { getKeypair } from '@/libs/address';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import type { Account, AccountAddress } from '@/types/account';
import type { AllCosmosAccountAssets } from '@/types/accountAssets';
import type { CosmosChain, CustomCosmosChain } from '@/types/chain';
import type { AuthAccount } from '@/types/cosmos/account';
import type { SignAminoDoc } from '@/types/cosmos/amino';
import type { CosmosFeeOption } from '@/types/cosmos/fee';
import type { TrackedTx } from '@/zustand/hooks/useTxTrackerStore';

import { protoTx } from './proto';
import { signDirectAndexecuteTxSequentially } from './sign';
import { cosmosURL } from '../crypto/cosmos';
import { devLogger } from '../devLogger';
import { getUniqueChainIdWithManual, parseCoinId } from '../queryParamGenerator';

interface CosmosTransactionParams {
  chain: CosmosChain | CustomCosmosChain | undefined;
  account: AuthAccount | undefined;
  aminoTx: SignAminoDoc | undefined;
  feeOption: CosmosFeeOption;
  feeAmount: string;
  gas: string;
  currentAccount: Account;
  currentPassword: string | null;
  coinId: string;
  recipientAddress?: string;
  txType?: 'staking' | 'send' | 'nft';
  address?: AccountAddress;
}

interface NavigationCallbacks {
  addTx: (txData: TrackedTx) => void;
  navigate: (options: NavigateOptions) => void;
  setIsOpenTxProcessingOverlay: (isOpen: boolean) => void;
}

export function resolveSeiChainConfig(chain: CosmosChain | CustomCosmosChain) {
  const isSeiWithKeccak = chain.id === 'sei' && chain.chainType === 'cosmos' && chain.accountTypes?.[0]?.pubkeyStyle === 'keccak256';

  if (isSeiWithKeccak) {
    return {
      ...chain,
      accountTypes: [
        {
          hdPath: "m/44'/60'/0'/0/${index}",
          pubkeyStyle: 'secp256k1',
          pubkeyType: '/cosmos.crypto.secp256k1.PubKey',
        },
      ],
    };
  }

  return chain;
}

export function resolvePubkeyType(chain: CosmosChain | CustomCosmosChain, address: AccountAddress): string {
  if (chain.id === 'sei' && chain.chainType === 'cosmos') {
    return '/cosmos.crypto.secp256k1.PubKey';
  }

  return address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey';
}

export async function executeCosmosTransaction(params: CosmosTransactionParams, callbacks: NavigationCallbacks): Promise<void> {
  const { chain, account, aminoTx, feeOption, feeAmount, gas, currentAccount, currentPassword, coinId, recipientAddress, txType, address } = params;

  const { addTx, navigate, setIsOpenTxProcessingOverlay } = callbacks;

  try {
    setIsOpenTxProcessingOverlay(true);

    if (!chain || !address) {
      throw new Error('Chain not found');
    }

    if (!account?.value.account_number) {
      throw new Error('Account number not found');
    }

    if (!aminoTx) {
      throw new Error('Failed to calculate final transaction');
    }

    if (!feeOption || !feeOption.denom) {
      throw new Error('Failed to get current fee asset');
    }

    const finalizedTransaction = {
      ...aminoTx,
      fee: {
        amount: [{ denom: feeOption.denom, amount: feeAmount }],
        gas,
      },
    };

    const resolvedChain = resolveSeiChainConfig(chain);

    const keyPair = getKeypair(resolvedChain, currentAccount, currentPassword);
    const privateKey = keyPair.privateKey;
    const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

    const pubkeyType = resolvePubkeyType(chain, address);

    const pTx = protoTx(finalizedTransaction, [''], { type: pubkeyType, value: base64PublicKey }, COSMOS_SIGN_MODE.SIGN_MODE_DIRECT);

    if (!pTx) {
      throw new Error('Failed to calculate proto transaction');
    }

    const directDoc = {
      chain_id: chain.chainId,
      account_number: account.value.account_number,
      auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
      body_bytes: [...Array.from(pTx.txBodyBytes)],
    };

    const requestURLs = chain.lcdUrls?.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

    if (!requestURLs.length) {
      throw new Error('RPC URLs not found');
    }

    const response = await signDirectAndexecuteTxSequentially({
      privateKey,
      directDoc,
      chain: resolvedChain,
      urls: requestURLs,
    });

    if (!response) {
      throw new Error('Failed to send transaction');
    }

    const { chainId, chainType } = parseCoinId(coinId);
    const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);

    const txData: TrackedTx = {
      txHash: response.tx_response.txhash,
      chainId: uniqueChainId,
      address: address.address,
      addedAt: Date.now(),
      retryCount: 0,
    };

    if (txType) {
      txData.type = txType;
    }

    addTx(txData);

    const searchParams = {
      coinId,
      txHash: response.tx_response.txhash,
      ...(recipientAddress && { address: recipientAddress }),
    };

    navigate({
      to: TxResult.to,
      search: searchParams,
    });
  } catch (error) {
    devLogger.error('Transaction failed:', error);

    navigate({
      to: TxResult.to,
      search: { coinId },
    });
  } finally {
    setIsOpenTxProcessingOverlay(false);
  }
}

export async function executeSendTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  recipientAddress: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      recipientAddress,
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeCancelUnstakeTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeStakeTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeUnstakeTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeClaimRewardTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeClaimAllRewardTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeClaimCommissionTransaction(
  selectedCoin: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  coinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain: selectedCoin?.chain,
      account,
      aminoTx: memoizedAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId,
      txType: 'staking',
      address: selectedCoin?.address,
    },
    callbacks,
  );
}

export async function executeNFTSendTransaction(
  chain: CosmosChain | undefined,
  accountAsset: AllCosmosAccountAssets | undefined,
  account: AuthAccount | undefined,
  memoizedNFTSendAminoTx: SignAminoDoc | undefined,
  selectedFeeOption: CosmosFeeOption,
  currentBaseFee: string,
  currentGas: string,
  currentAccount: Account,
  currentPassword: string | null,
  accountAssetCoinId: string,
  callbacks: NavigationCallbacks,
) {
  await executeCosmosTransaction(
    {
      chain,
      account,
      aminoTx: memoizedNFTSendAminoTx,
      feeOption: selectedFeeOption,
      feeAmount: currentBaseFee,
      gas: currentGas,
      currentAccount,
      currentPassword,
      coinId: accountAssetCoinId,
      txType: 'nft',
      address: accountAsset?.address,
    },
    callbacks,
  );
}
