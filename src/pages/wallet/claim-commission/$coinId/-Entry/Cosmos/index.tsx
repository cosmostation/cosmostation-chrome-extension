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
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { useAccount } from '@/hooks/cosmos/useAccount';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit';
import { useCommission } from '@/hooks/cosmos/useCommission';
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useValidators } from '@/hooks/cosmos/useValidators';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCoinList } from '@/hooks/useCoinList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { MsgCommission, SignAminoDoc } from '@/types/cosmos/amino';
import { isTestnetChain } from '@/utils/chain';
import { convertToValidatorAddress } from '@/utils/cosmos/address';
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

  const selectedCoin = getCosmosAccountAssetFilteredByAccountType();

  const commissionReceiptAddress = selectedCoin?.address.address || '';

  const coinSymbol = selectedCoin?.asset.symbol ? selectedCoin.asset.symbol + `${isTestnetChain(selectedCoin.chain.id) ? ' (Testnet)' : ''}` : '';
  const chainName = selectedCoin?.chain.name || '';

  const validators = useValidators({ coinId });

  const availableValidators = useMemo(
    () =>
      validators.data?.map((item) => {
        const votingPower = ceil(toDisplayDenomAmount(item?.tokens || '0', selectedCoin?.asset.decimals || 0));
        const commission = toPercentages(item?.commission.commission_rates.rate || '0', {
          disableMark: true,
        });

        return {
          validatorName: item.description.moniker || shorterAddress(item.operator_address, 12) || '',
          validatorAddress: item.operator_address,
          votingPower,
          commission,
          stakedAmount: '0',
          validatorImage: item.monikerImage,
          status: item.validatorStatus,
        };
      }),
    [selectedCoin?.asset.decimals, validators.data],
  );

  const validatorAddress = convertToValidatorAddress(selectedCoin?.address.address, selectedCoin?.chain.validatorAccountPrefix);

  const commission = useCommission({ coinId, validatorAddress });

  const commissionCoins = useMemo(
    () =>
      commission.data?.commission.commission?.map((item) => {
        const commissionCoinAccountAsset = [...(coinList?.cosmosAssets || []), ...(coinList?.cw20Assets || [])].find(
          (asset) => selectedCoin?.chain.chainType === asset.chainType && selectedCoin?.chain.id === asset.chainId && asset.id === item.denom,
        );

        const displayCommissionAmount = toDisplayDenomAmount(item.amount, commissionCoinAccountAsset?.decimals || 0);

        return {
          id: commissionCoinAccountAsset?.id,
          coinImage: commissionCoinAccountAsset?.image,
          symbol: commissionCoinAccountAsset?.symbol,
          coinGeckoId: commissionCoinAccountAsset?.coinGeckoId,
          displayCommissionAmount,
        };
      }),
    [coinList?.cosmosAssets, coinList?.cw20Assets, commission.data?.commission.commission, selectedCoin?.chain.chainType, selectedCoin?.chain.id],
  );

  const commissionCoinImages = useMemo(
    () =>
      commissionCoins
        ?.sort((a) => (a.id === selectedCoin?.asset.id ? -1 : 1))
        .map((item) => item.coinImage || '')
        .slice(0, 5)
        .filter((item) => item),
    [commissionCoins, selectedCoin?.asset.id],
  );

  const commissionCoinCounts = commissionCoins?.length || 0;
  const isMultipleCommissionCoins = commissionCoinCounts > 1;

  const displayMainCoinCommissionAmount = commissionCoins?.find((item) => item.id === selectedCoin?.asset.id)?.displayCommissionAmount || '0';

  const displayTotalCommissionValue = useMemo(
    () =>
      commissionCoins?.reduce((acc, item) => {
        const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[userCurrencyPreference]) || 0;
        const value = times(coinPrice, item.displayCommissionAmount);
        return plus(acc, value);
      }, '0'),
    [coinGeckoPrice, userCurrencyPreference, commissionCoins],
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

  const alternativeGasRate = alternativeFeeAsset?.gasRate;

  const memoizedCommissionAminoTx = useMemo<SignAminoDoc<MsgCommission> | undefined>(() => {
    if (selectedCoin) {
      if (account.data?.value.account_number && gt(displayMainCoinCommissionAmount || '0', '0') && alternativeFeeAsset?.asset.id && validatorAddress) {
        const sequence = String(account.data?.value.sequence || '0');

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoin.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedCoin.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
              value: { validator_address: validatorAddress },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    alternativeFeeAsset?.asset.id,
    alternativeGasRate,
    displayMainCoinCommissionAmount,
    inputMemo,
    nodeInfo.data?.default_node_info?.network,
    selectedCoin,
    validatorAddress,
  ]);

  const [commissionAminoTx] = useDebounce(memoizedCommissionAminoTx, 700);

  const commissionProtoTx = useMemo(() => {
    if (commissionAminoTx) {
      const pTx = protoTx(
        commissionAminoTx,
        [''],
        { type: selectedCoin?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [selectedCoin?.address.accountType.pubkeyType, commissionAminoTx]);

  const simulate = useSimulate({ coinId, txBytes: commissionProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedCoin?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedCoin?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedCoin?.chain.feeInfo.defaultGasLimit, selectedCoin?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

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

  const displayTx = useMemo(() => {
    if (!memoizedCommissionAminoTx) return undefined;

    const tx = {
      ...memoizedCommissionAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };
    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedCommissionAminoTx, selectedFeeOption.denom]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!commissionCoins || commissionCoins.length === 0 || !gt(displayMainCoinCommissionAmount, '0')) {
      return t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.noCommission');
    }

    if (gt(currentDisplayFeeAmount, toDisplayDenomAmount(selectedFeeOption.balance || '0', selectedFeeOption.decimals))) {
      return t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.insufficientAmount');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (!commissionAminoTx) {
      return t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    commissionCoins,
    displayMainCoinCommissionAmount,
    currentDisplayFeeAmount,
    selectedFeeOption.balance,
    selectedFeeOption.decimals,
    inputMemoErrorMessage,
    commissionAminoTx,
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

      if (!selectedCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedCommissionAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedCommissionAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedCoin.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedCoin.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedCoin.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedCoin?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedCoin.chain,
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
        address: selectedCoin.address.address,
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
    selectedCoin?.chain,
    selectedCoin?.address.accountType.pubkeyType,
    selectedCoin?.address.address,
    account.data?.value.account_number,
    memoizedCommissionAminoTx,
    selectedFeeOption,
    currentBaseFee,
    currentGas,
    currentAccount,
    currentPassword,
    coinId,
    addTx,
    navigate,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedCommissionAminoTx, simulate.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImageContainer>
              <CoinImage imageURLs={commissionCoinImages} />
            </CoinImageContainer>
            <CoinSymbolText variant="h2_B">
              {isMultipleCommissionCoins
                ? t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.claimCommissions')
                : t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.claimSymbolCommissions', {
                    symbol: coinSymbol,
                  })}
            </CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {isMultipleCommissionCoins
                  ? t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.subtitle', {
                      symbol: coinSymbol,
                      coinCount: commissionCoinCounts - 1,
                    })
                  : t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.stakingCoin', {
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
              label={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.commissionAmount')}
              value={
                displayMainCoinCommissionAmount + ' ' + coinSymbol + `${commissionCoins?.length || 0 > 1 ? ` + ${commissionCoins?.length || 0 - 1} Coins` : ''}`
              }
              disabled
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displayTotalCommissionValue}
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
              label={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.memo')}
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
            title={<Typography variant="b3_M">{t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <InformationPanelBody>
                <Typography variant="b4_R_Multiline">
                  {t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.informDescription', {
                    address: commissionReceiptAddress,
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
        contentsTitle={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.claimCommissionsReview')}
        contentsSubTitle={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.claimCommissionsReviewDescription')}
        confirmButtonText={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.claimCommissions')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.claim-commission.$coinId.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}
