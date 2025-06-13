import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee/CosmosFee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NEUTRON_STAKE_CONTRACT_ADDRESS, NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS } from '@/constants/cosmos/contract';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { useAccount } from '@/hooks/cosmos/useAccount';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit';
import { useDelegationInfo } from '@/hooks/cosmos/useDelegationInfo';
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useNTRNReward } from '@/hooks/cosmos/useNTRNReward';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCoinList } from '@/hooks/useCoinList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { MsgExecuteContract, MsgReward, SignAminoDoc } from '@/types/cosmos/amino';
import { isTestnetChain } from '@/utils/chain';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { ceil, gt, plus, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainIdWithManual, isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { getUtf8BytesLength, safeStringify, shorterAddress, toPercentages } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import {
  ChainNameContainer,
  CoinContainer,
  CoinImage,
  CoinImageContainer,
  CoinSymbolText,
  Divider,
  EstimatedValueTextContainer,
  InformationPanelBody,
  InputWrapper,
} from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const account = useAccount({ coinId });
  const nodeInfo = useNodeInfo({ coinId });

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { getCosmosAccountAssetFilteredByAccountType } = useGetAccountAsset({ coinId });
  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: coinId });

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const { data: coinList } = useCoinList();

  const selectedRewardCoin = getCosmosAccountAssetFilteredByAccountType();

  const delegationInfo = useDelegationInfo({ coinId });

  const rewardReceiptAddress = selectedRewardCoin?.address.address || '';

  const mainRewardCoin = getCosmosAccountAssetFilteredByAccountType();

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId).chainId);

  const { data: ntrnRewards } = useNTRNReward({ coinId: isNTRN ? coinId : undefined });

  const coinSymbol = mainRewardCoin?.asset.symbol ? mainRewardCoin.asset.symbol + `${isTestnetChain(mainRewardCoin.chain.id) ? ' (Testnet)' : ''}` : '';
  const chainName = mainRewardCoin?.chain.name || '';

  const accumulatedRewards = (() => {
    if (isNTRN) {
      return [
        {
          denom: ntrnRewards?.data.pending_rewards.denom || parseCoinId(coinId).id,
          amount: ntrnRewards?.data.pending_rewards.amount || '0',
        },
      ];
    }

    const flattenedRewards = delegationInfo.delegationInfo.flatMap((entry) => entry.rewardInfo?.reward || []);

    const denomTotalAmountMap = flattenedRewards.reduce((acc: Record<string, string>, { denom, amount }) => {
      if (!acc[denom]) {
        acc[denom] = '0';
      }
      const sum = plus(acc[denom], amount);
      acc[denom] = sum;
      return acc;
    }, {});

    const result = Object.entries(denomTotalAmountMap).map(([denom, totalAmount]) => ({
      denom,
      amount: totalAmount,
    }));
    return result;
  })();

  const availableValidators = useMemo(
    () =>
      delegationInfo.delegationInfo
        .map((item) => {
          const votingPower = ceil(toDisplayDenomAmount(item.validatorInfo?.tokens || '0', selectedRewardCoin?.asset.decimals || 0));
          const commission = toPercentages(item.validatorInfo?.commission.commission_rates.rate || '0', {
            disableMark: true,
          });

          return {
            validatorName: item.validatorInfo?.description.moniker || shorterAddress(item.validatorAddress, 12) || '',
            validatorAddress: item.validatorAddress,
            votingPower: votingPower,
            commission: commission,
            stakedAmount: item.totalDelegationAmount,
            validatorImage: item.validatorInfo?.monikerImage,
            status: item.validatorInfo?.validatorStatus,
          };
        })
        .sort((a, b) => (gt(a.stakedAmount, b.stakedAmount) ? -1 : 1)),
    [delegationInfo.delegationInfo, selectedRewardCoin?.asset.decimals],
  );

  const rewardCoins = useMemo(
    () =>
      accumulatedRewards.map((item) => {
        const rewardCoinAccountAsset = [...(coinList?.cosmosAssets || []), ...(coinList?.cw20Assets || [])].find(
          (asset) => selectedRewardCoin?.chain.chainType === asset.chainType && selectedRewardCoin?.chain.id === asset.chainId && asset.id === item.denom,
        );

        const displayRewardAmount = toDisplayDenomAmount(item.amount, rewardCoinAccountAsset?.decimals || 0);

        return {
          id: rewardCoinAccountAsset?.id,
          coinImage: rewardCoinAccountAsset?.image,
          symbol: rewardCoinAccountAsset?.symbol,
          coinGeckoId: rewardCoinAccountAsset?.coinGeckoId,
          displayRewardAmount,
        };
      }),
    [accumulatedRewards, coinList?.cosmosAssets, coinList?.cw20Assets, selectedRewardCoin?.chain.chainType, selectedRewardCoin?.chain.id],
  );

  const rewardCoinImages = useMemo(
    () =>
      rewardCoins
        ?.sort((a) => (a.id === selectedRewardCoin?.asset.id ? -1 : 1))
        .map((item) => item.coinImage || '')
        .slice(0, 5)
        .filter((item) => item),
    [rewardCoins, selectedRewardCoin?.asset.id],
  );

  const rewardCoinCounts = rewardCoins?.length || 0;
  const isMultipleRewardCoins = rewardCoinCounts > 1;

  const displayMainCoinRewardAmount = rewardCoins?.find((item) => item.id === selectedRewardCoin?.asset.id)?.displayRewardAmount || '0';

  const displayTotalRewardValue = useMemo(
    () =>
      rewardCoins?.reduce((acc, item) => {
        const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[userCurrencyPreference]) || 0;
        const value = times(coinPrice, item.displayRewardAmount);
        return plus(acc, value);
      }, '0'),
    [coinGeckoPrice, userCurrencyPreference, rewardCoins],
  );

  const alternativeFeeAsset = useMemo(
    () =>
      customFeeCoinId
        ? feeAssets.find((item) => isMatchingCoinId(item.asset, customFeeCoinId))
        : autoSetFeeCoinId
          ? feeAssets.find((item) => isMatchingCoinId(item.asset, autoSetFeeCoinId))
          : feeAssets[0],
    [autoSetFeeCoinId, customFeeCoinId, feeAssets],
  );

  const alternativeFeeCoinId = useMemo(() => (alternativeFeeAsset?.asset ? getCoinId(alternativeFeeAsset.asset) : ''), [alternativeFeeAsset?.asset]);

  const alternativeGasRate = useMemo(() => alternativeFeeAsset?.gasRate, [alternativeFeeAsset?.gasRate]);

  const memoizedRewardAminoTx = useMemo<SignAminoDoc<MsgReward> | SignAminoDoc<MsgExecuteContract> | undefined>(() => {
    if (selectedRewardCoin) {
      if (
        account.data?.value.account_number &&
        gt(displayMainCoinRewardAmount || '0', '0') &&
        alternativeFeeAsset?.asset.id &&
        delegationInfo.delegationInfo &&
        rewardReceiptAddress
      ) {
        const sequence = String(account.data?.value.sequence || '0');

        if (isNTRN) {
          const contractAddress = (() => {
            if (selectedRewardCoin.chain.id === NEUTRON_CHAINLIST_ID) return NEUTRON_STAKE_CONTRACT_ADDRESS;

            if (selectedRewardCoin.chain.id === NEUTRON_TESTNET_CHAINLIST_ID) return NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS;
            return NEUTRON_STAKE_CONTRACT_ADDRESS;
          })();

          return {
            account_number: String(account.data.value.account_number),
            sequence,
            chain_id: nodeInfo.data?.default_node_info?.network ?? selectedRewardCoin.chain.chainId,
            fee: {
              amount: [
                {
                  denom: alternativeFeeAsset.asset.id,
                  amount: selectedRewardCoin.chain.isEvm
                    ? times(alternativeGasRate?.[0] || '0', selectedRewardCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                    : '1',
                },
              ],
              gas: String(selectedRewardCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
            },
            memo: inputMemo,
            msgs: [
              {
                type: 'wasm/MsgExecuteContract',
                value: {
                  sender: selectedRewardCoin.address.address,
                  contract: contractAddress,
                  msg: {
                    claim_rewards: {},
                  },
                  funds: [],
                },
              },
            ],
          };
        }

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedRewardCoin.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedRewardCoin.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedRewardCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedRewardCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: delegationInfo.delegationInfo.map((item) => ({
            type: 'cosmos-sdk/MsgWithdrawDelegationReward',
            value: {
              delegator_address: rewardReceiptAddress,
              validator_address: item.rewardInfo?.validator_address || item.validatorAddress,
            },
          })),
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    alternativeFeeAsset?.asset.id,
    alternativeGasRate,
    delegationInfo.delegationInfo,
    displayMainCoinRewardAmount,
    inputMemo,
    isNTRN,
    nodeInfo.data?.default_node_info?.network,
    rewardReceiptAddress,
    selectedRewardCoin,
  ]);

  const [rewardAminoTx] = useDebounce(memoizedRewardAminoTx, 700);

  const rewardProtoTx = useMemo(() => {
    if (rewardAminoTx) {
      const pTx = protoTx(
        rewardAminoTx,
        [''],
        { type: selectedRewardCoin?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [selectedRewardCoin?.address.accountType.pubkeyType, rewardAminoTx]);

  const simulate = useSimulate({ coinId, txBytes: rewardProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedRewardCoin?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedRewardCoin?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedRewardCoin?.chain.feeInfo.defaultGasLimit, selectedRewardCoin?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

  const feeOptions = useMemo(() => {
    const customOption = {
      gas: customGasAmount,
      gasRate: customGasRate,
      coinId: alternativeFeeCoinId,
      decimals: alternativeFeeAsset?.asset.decimals || 0,
      balance: alternativeFeeAsset?.balance || '0',
      denom: alternativeFeeAsset?.asset.id,
      coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
      symbol: alternativeFeeAsset?.asset.symbol || '',
      title: 'Custom',
    };

    const feeStepNames = getCosmosFeeStepNames(isFeemarketActive || false, alternativeGasRate);

    const alternativeFeeOptions = alternativeGasRate
      ? alternativeGasRate.map((item, i) => ({
          gas: alternativeGas,
          gasRate: item,
          coinId: alternativeFeeCoinId,
          decimals: alternativeFeeAsset?.asset.decimals || 0,
          balance: alternativeFeeAsset?.balance || '0',
          denom: alternativeFeeAsset?.asset.id,
          coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
          symbol: alternativeFeeAsset?.asset.symbol || '',
          title: feeStepNames[i],
        }))
      : [];

    return [...alternativeFeeOptions, customOption];
  }, [
    alternativeFeeAsset?.asset.coinGeckoId,
    alternativeFeeAsset?.asset.decimals,
    alternativeFeeAsset?.asset.id,
    alternativeFeeAsset?.asset.symbol,
    alternativeFeeAsset?.balance,
    alternativeFeeCoinId,
    alternativeGas,
    alternativeGasRate,
    customGasAmount,
    customGasRate,
    isFeemarketActive,
  ]);

  const isCustomStep = useMemo(() => {
    if (!alternativeGasRate || feeOptions.length === 0) return false;
    return feeOptions.length - 1 === currentFeeStepKey;
  }, [alternativeGasRate, currentFeeStepKey, feeOptions.length]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const currentBaseFee = useMemo(() => {
    const baseFee = times(selectedFeeOption.gas || '0', selectedFeeOption.gasRate || '0');

    return ceil(baseFee);
  }, [selectedFeeOption.gas, selectedFeeOption.gasRate]);

  const currentDisplayFeeAmount = useMemo(() => toDisplayDenomAmount(currentBaseFee, selectedFeeOption.decimals), [currentBaseFee, selectedFeeOption.decimals]);

  const currentGas = selectedFeeOption.gas || '0';

  const validatorAddress = availableValidators[0]?.validatorAddress;

  const totalValidatorCounts = availableValidators.length - 1;

  const displayTx = useMemo(() => {
    if (!memoizedRewardAminoTx) return undefined;

    const tx = {
      ...memoizedRewardAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };

    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedRewardAminoTx, selectedFeeOption.denom]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!selectedRewardCoin?.chain.isSupportStaking) {
      return t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.bankLocked');
    }

    if (!rewardCoins || rewardCoins.length === 0 || !gt(displayMainCoinRewardAmount, '0')) {
      return t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.noReward');
    }

    if (gt(currentDisplayFeeAmount, toDisplayDenomAmount(selectedFeeOption.balance || '0', selectedFeeOption.decimals))) {
      return t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.insufficientAmount');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (!rewardAminoTx) {
      return t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    currentDisplayFeeAmount,
    displayMainCoinRewardAmount,
    inputMemoErrorMessage,
    rewardAminoTx,
    rewardCoins,
    selectedFeeOption.balance,
    selectedFeeOption.decimals,
    selectedRewardCoin?.chain.isSupportStaking,
    t,
  ]);

  useAutoFeeCurrencySelectionOnInit({
    feeAssets: feeAssets,
    isCustomFee: isCustomStep,
    currentFeeStepKey: currentFeeStepKey,
    gas: currentGas,
    setFeeCoinId: (coinId) => {
      setAutoSetFeeCoinId(coinId);
    },
  });

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedRewardCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedRewardAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedRewardAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedRewardCoin.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedRewardCoin.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedRewardCoin.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedRewardCoin?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedRewardCoin.chain,
        urls: requestURLs,
      });

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({
        txHash: response.tx_response.txhash,
        chainId: uniqueChainId,
        address: selectedRewardCoin.address.address,
        addedAt: Date.now(),
        retryCount: 0,
        type: 'staking',
      });

      navigate({
        to: TxResult.to,
        search: {
          coinId,
          txHash: response.tx_response.txhash,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [
    account.data?.value.account_number,
    addTx,
    coinId,
    currentAccount,
    currentBaseFee,
    currentGas,
    currentPassword,
    memoizedRewardAminoTx,
    navigate,
    selectedFeeOption,
    selectedRewardCoin?.address.accountType.pubkeyType,
    selectedRewardCoin?.address.address,
    selectedRewardCoin?.chain,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedRewardAminoTx, simulate.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImageContainer>
              <CoinImage imageURLs={rewardCoinImages} />
            </CoinImageContainer>
            <CoinSymbolText variant="h2_B">
              {isMultipleRewardCoins
                ? t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimRewards')
                : t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimSymbolRewards', {
                    symbol: coinSymbol,
                  })}
            </CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {isMultipleRewardCoins
                  ? t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.subtitle', {
                      symbol: coinSymbol,
                      coinCount: rewardCoins.length - 1,
                    })
                  : t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.stakingCoin', {
                      chainName: chainName,
                    })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={availableValidators}
              disabled
              currentValidatorAddress={validatorAddress}
              validatorCounts={totalValidatorCounts}
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.rewardAmount')}
              value={displayMainCoinRewardAmount + ' ' + coinSymbol + `${isMultipleRewardCoins ? ` + ${rewardCoins.length - 1} Coins` : ''}`}
              disabled
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displayTotalRewardValue}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.memo')}
              error={!!inputMemoErrorMessage}
              helperText={inputMemoErrorMessage}
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <InformationPanelBody>
                <Typography variant="b4_R_Multiline">
                  {t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription', {
                    address: rewardReceiptAddress,
                  })}
                </Typography>
              </InformationPanelBody>
            }
          />

          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            feeOptionDatas={feeOptions}
            availableFeeAssets={feeAssets}
            selectedCustomFeeCoinId={alternativeFeeCoinId}
            currentSelectedFeeOptionKey={currentFeeStepKey}
            errorMessage={errorMessage}
            onChangeGas={(gas) => {
              setCustomGasAmount(gas);
            }}
            onChangeGasRate={(gasRate) => {
              setCustomGasRate(gasRate);
            }}
            onChangeFeeCoinId={(feeCoinId) => {
              setCustomFeeCoinId(feeCoinId);
            }}
            onClickFeeStep={(val) => {
              setInputFeeStepKey(val);
            }}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
          />
        </>
      </BaseFooter>
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewardsReview')}
        contentsSubTitle={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewardsReviewDescription')}
        confirmButtonText={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewards')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}
