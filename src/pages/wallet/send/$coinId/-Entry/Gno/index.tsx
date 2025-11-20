import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Long from 'long';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { decodeTxMessages, MsgCall, MsgEndpoint, MsgSend } from '@gnolang/gno-js-client';
import type { Tx } from '@gnolang/tm2-js-client';
import { Any, JSONRPCProvider, TransactionEndpoint, Wallet } from '@gnolang/tm2-js-client';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import Fee from '@/components/Fee/GnoFee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { GNO_MEMO_MAX_BYTES } from '@/constants/gno';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/gno/useAutoFeeCurrencySelectionOnInit';
import { useFees } from '@/hooks/gno/useFees';
import { useSimulate } from '@/hooks/gno/useSimulate';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { isTestnetChain } from '@/utils/chain';
import { isValidCosmosAddress } from '@/utils/cosmos/address';
import { getGnoFeeStepNames } from '@/utils/gno/fee';
import { ceil, gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator';
import { getUtf8BytesLength, isDecimal, isEqualsIgnoringCase, safeStringify, shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled';
import TxProcessingOverlay from '../components/TxProcessingOverlay';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type GnoProps = {
  coinId: string;
};

export default function Gno({ coinId }: GnoProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });

  const [isDisabled, setIsDisabled] = useState(false);

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { feeAssets, defaultGasRateKey } = useFees({ coinId });

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');

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

  const selectedCoinToSend = getGnoAccountAsset();

  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const [customGasRate, setCustomGasRate] = useState('');

  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol
    ? selectedCoinToSend.asset.symbol + `${isTestnetChain(selectedCoinToSend.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'grc20') {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.contract');
    }

    return '';
  })();

  const coinDescription = selectedCoinToSend?.asset.description;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = useMemo(() => toDisplayDenomAmount(baseAvailableAmount, coinDecimals), [baseAvailableAmount, coinDecimals]);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [displaySendAmount, setDisplaySendAmount] = useState('');

  const displaySendAmountPrice = useMemo(() => (displaySendAmount ? times(displaySendAmount, coinPrice) : '0'), [coinPrice, displaySendAmount]);

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const currentRecipientChainId = useMemo(() => {
    const defaultRecipientChainId = selectedCoinToSend?.chain ? getUniqueChainId(selectedCoinToSend?.chain) : undefined;

    return defaultRecipientChainId;
  }, [selectedCoinToSend?.chain]);

  const txMessages = useMemo(() => {
    if (!gt(displaySendAmount || '0', '0') || !recipientAddress) return undefined;
    const amount = toBaseDenomAmount(displaySendAmount || '0', coinDecimals);

    const senderAddress = selectedCoinToSend?.address.address || '';

    if (selectedCoinToSend?.asset.type === 'grc20') {
      const contractAddress = selectedCoinToSend?.asset.id;
      const msgCall = MsgCall.encode(
        MsgCall.create({ pkg_path: contractAddress, func: 'Transfer', args: [recipientAddress, amount], caller: senderAddress, send: undefined }),
      ).finish();

      const messageCall = Any.create({ type_url: MsgEndpoint.MSG_CALL, value: msgCall });

      return [messageCall];
    }

    const msgSend = MsgSend.encode(MsgSend.create({ from_address: senderAddress, to_address: recipientAddress, amount: `${amount}${coinDenom}` })).finish();

    const messageSend = Any.create({ type_url: MsgEndpoint.MSG_SEND, value: msgSend });

    return [messageSend];
  }, [
    coinDecimals,
    coinDenom,
    recipientAddress,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.asset.id,
    selectedCoinToSend?.asset.type,
    displaySendAmount,
  ]);

  const { data: estimatedGas, isFetching: isSimulating } = useSimulate({ coinId, messages: txMessages });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedCoinToSend?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = estimatedGas ? times(estimatedGas, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [estimatedGas, selectedCoinToSend?.chain.feeInfo.defaultGasLimit, selectedCoinToSend?.chain.feeInfo.gasCoefficient]);

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

    const feeStepNames = getGnoFeeStepNames(alternativeGasRate);

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
  ]);

  const isCustomStep = useMemo(() => {
    if (!alternativeGasRate || feeOptions.length === 0) return false;
    return feeOptions.length - 1 === currentFeeStepKey;
  }, [alternativeGasRate, currentFeeStepKey, feeOptions.length]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const currentGas = selectedFeeOption.gas || '0';

  const currentFeeAmount = useMemo(() => times(currentGas, selectedFeeOption.gasRate || '0'), [currentGas, selectedFeeOption.gasRate]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(currentCeilFeeAmount, selectedFeeOption.decimals || 0),
    [currentCeilFeeAmount, selectedFeeOption.decimals],
  );
  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(selectedFeeOption?.balance || '0', selectedFeeOption?.decimals || 0),
    [selectedFeeOption?.balance, selectedFeeOption.decimals],
  );

  const sendTx = useMemo(() => {
    if (!txMessages) return undefined;

    const tx: Tx = {
      messages: txMessages,
      fee: { gas_fee: `${currentCeilFeeAmount}${selectedFeeOption.denom}`, gas_wanted: new Long(Number(currentGas)) },
      signatures: [],
      memo: inputMemo,
    };

    return tx;
  }, [currentCeilFeeAmount, currentGas, inputMemo, selectedFeeOption.denom, txMessages]);

  const [debouncedSendTx] = useDebounce(sendTx, 700);

  const handleOnClickMax = () => {
    if (selectedCoinToSend && selectedFeeOption && isMatchingCoinId(selectedCoinToSend?.asset, selectedFeeOption.coinId)) {
      const maxAmount = minus(displayAvailableAmount, currentDisplayFeeAmount);

      setDisplaySendAmount(gt(maxAmount, '0') ? maxAmount : '0');
    } else {
      setDisplaySendAmount(displayAvailableAmount);
    }
  };

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)) {
        return t('pages.wallet.send.$coinId.Entry.Gno.index.invalidAddress');
      }

      if (!isValidCosmosAddress(recipientAddress, selectedCoinToSend?.chain?.accountPrefix || '')) {
        return t('pages.wallet.send.$coinId.Entry.Gno.index.invalidAddress');
      }
    }

    return '';
  }, [recipientAddress, selectedCoinToSend?.address.address, selectedCoinToSend?.chain?.accountPrefix, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (displaySendAmount) {
      if (selectedCoinToSend?.asset.id === selectedFeeOption.denom) {
        const totalCostAmount = plus(displaySendAmount, currentDisplayFeeAmount);

        if (gt(totalCostAmount, currentFeeCoinDisplayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Gno.index.insufficientAmount');
        }
      } else {
        if (gt(displaySendAmount, displayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Gno.index.insufficientAmount');
        }
      }

      if (!gt(displaySendAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Gno.index.tooLowAmount');
      }
    }
    return '';
  }, [
    currentDisplayFeeAmount,
    currentFeeCoinDisplayAvailableAmount,
    displayAvailableAmount,
    displaySendAmount,
    selectedCoinToSend?.asset.id,
    selectedFeeOption.denom,
    t,
  ]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), GNO_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Gno.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const displayTx = useMemo(() => {
    if (!debouncedSendTx) return undefined;

    return safeStringify({ ...debouncedSendTx, messages: decodeTxMessages(debouncedSendTx.messages) });
  }, [debouncedSendTx]);

  const errorMessage = useMemo(() => {
    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.noAvailableAmount');
    }

    if (!displaySendAmount) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (gt(currentDisplayFeeAmount, currentFeeCoinDisplayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.insufficientFee');
    }

    if (!gt(displaySendAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.invalidAmount');
    }

    if (!sendTx) {
      return t('pages.wallet.send.$coinId.Entry.Gno.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    currentDisplayFeeAmount,
    currentFeeCoinDisplayAvailableAmount,
    displaySendAmount,
    inputMemoErrorMessage,
    recipientAddress,
    sendAmountInputErrorMessage,
    sendTx,
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

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!debouncedSendTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const keyPair = getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const rpcURLs = selectedCoinToSend.chain.rpcUrls.map((item) => item.url);

      const provider = new JSONRPCProvider(rpcURLs[0]);
      const wallet = await Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'), { addressPrefix: selectedCoinToSend.chain.accountPrefix });
      wallet.connect(provider);

      const signedTx = await wallet.signTransaction(debouncedSendTx, decodeTxMessages);

      const response = await wallet.sendTransaction(signedTx, TransactionEndpoint.BROADCAST_TX_SYNC);

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const txHash = encodeURIComponent(response.hash);

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId,
          txHash,
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
    addTx,
    coinId,
    currentAccount,
    currentPassword,
    debouncedSendTx,
    navigate,
    recipientAddress,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.chain,
    selectedFeeOption,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, debouncedSendTx, isSimulating]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Gno.index.send')}`}</CoinSymbolText>
            {coinType ? (
              <CoinDenomContainer>
                <Typography variant="b4_R">{`${coinType} :`}</Typography>
                &nbsp;
                <Typography variant="b3_M">{shortCoinDenom}</Typography>
              </CoinDenomContainer>
            ) : (
              <DescriptionContainer>
                <Typography variant="b3_M">{coinDescription}</Typography>
              </DescriptionContainer>
            )}
          </CoinContainer>

          <InputWrapper>
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Gno.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddressBookButton disabled={!currentRecipientChainId} onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </AddressBookButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Gno.index.amount')}
              error={!!sendAmountInputErrorMessage}
              helperText={sendAmountInputErrorMessage}
              value={displaySendAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimals || 0) && e.currentTarget.value) {
                  return;
                }

                setDisplaySendAmount(e.currentTarget.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displaySendAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                selectedCoinToSend && <BalanceButton onClick={handleOnClickMax} coin={selectedCoinToSend?.asset} balance={baseAvailableAmount} />
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              error={!!inputMemoErrorMessage}
              helperText={inputMemoErrorMessage}
              label={t('pages.wallet.send.$coinId.Entry.Gno.index.memo')}
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            feeOptionDatas={feeOptions}
            availableFeeAssets={feeAssets}
            selectedCustomFeeCoinId={alternativeFeeCoinId}
            currentSelectedFeeOptionKey={currentFeeStepKey}
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
            errorMessage={errorMessage}
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
          />
        </>
      </BaseFooter>

      {currentRecipientChainId && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={currentRecipientChainId}
          headerTitle={t('pages.wallet.send.$coinId.Entry.Gno.index.chooseRecipientAddress')}
          onClickAddress={(address, memo) => {
            setRecipientAddress(address);
            if (memo) {
              setInputMemo(memo);
            }
          }}
        />
      )}
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.Gno.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.Gno.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Gno.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Gno.index.send')}
        onClickConfirm={handleOnClickConfirm}
        rawTxString={displayTx}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Gno.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Gno.index.txProcessingSub')}
      />
    </>
  );
}
