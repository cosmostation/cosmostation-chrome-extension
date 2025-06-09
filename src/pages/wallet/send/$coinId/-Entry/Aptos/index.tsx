import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Account, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet/index.tsx';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import AptosFee from '@/components/Fee/AptosFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { APTOS_COIN_TYPE } from '@/constants/aptos/coin.ts';
import { DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/sui/gas.ts';
import { useEstimateGasPrice } from '@/hooks/aptos/useEstimateGasPrice.ts';
import { useGenerateTx } from '@/hooks/aptos/useGenerateTx.ts';
import { useSimulateTx } from '@/hooks/aptos/useSimulateTx.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import type { AptosSignPayload, AptosSimulationPayload } from '@/types/aptos/tx.ts';
import { signAndExecuteTxSequentially } from '@/utils/aptos/sign.ts';
import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getUniqueChainId, getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { aptosAddressRegex } from '@/utils/regex.ts';
import { isDecimal, isEqualsIgnoringCase, safeStringify } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled.tsx';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type AptosProps = {
  coinId: string;
};

export default function Aptos({ coinId }: AptosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getAptosAccountAsset();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const coinDescription = selectedCoinToSend?.asset.description;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimals);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const displaySendAmountPrice = times(sendDisplayAmount || '0', coinPrice);

  const sendBaseAmount = toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals);

  const aptosAccount = useMemo(() => {
    const keyPair = selectedCoinToSend && getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);

    if (!keyPair?.privateKey) return undefined;
    const pk = PrivateKey.formatPrivateKey(keyPair.privateKey, PrivateKeyVariants.Ed25519);

    return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(pk) });
  }, [currentAccount, currentPassword, selectedCoinToSend]);

  const estimateGasPrice = useEstimateGasPrice({ coinId });

  const currentGasPrice = useMemo(() => {
    if (!estimateGasPrice.data) {
      return null;
    }

    const averageGasPrice = estimateGasPrice.data.gas_estimate || estimateGasPrice.data.prioritized_gas_estimate;

    if (typeof averageGasPrice !== 'number') {
      return null;
    }

    return averageGasPrice;
  }, [estimateGasPrice.data]);

  const memoizedSendTxPayload = useMemo<AptosSignPayload | undefined>(() => {
    if (!selectedCoinToSend?.address.address || !aptosAddressRegex.test(recipientAddress) || !gt(sendBaseAmount, '0')) return undefined;

    if (selectedCoinToSend?.asset.id === APTOS_COIN_TYPE) {
      return {
        sender: selectedCoinToSend?.address.address,
        data: {
          function: '0x1::aptos_account::transfer',
          functionArguments: [recipientAddress, sendBaseAmount],
          typeArguments: [],
        },
        options: {
          gasUnitPrice: currentGasPrice ? currentGasPrice : undefined,
        },
      };
    }
    return {
      sender: selectedCoinToSend?.address.address,
      data: {
        function: '0x1::coin::transfer',
        functionArguments: [recipientAddress, sendBaseAmount],
        typeArguments: [selectedCoinToSend?.asset.id],
      },
      options: {
        gasUnitPrice: currentGasPrice ? currentGasPrice : undefined,
      },
    };
  }, [currentGasPrice, recipientAddress, selectedCoinToSend?.address.address, selectedCoinToSend?.asset.id, sendBaseAmount]);

  const [sendTxPayload] = useDebounce(memoizedSendTxPayload, 500);

  const generateTransaction = useGenerateTx({ coinId, payload: sendTxPayload });

  const simulationPayload = useMemo<AptosSimulationPayload | undefined>(() => {
    if (!generateTransaction.data || !aptosAccount?.publicKey) return undefined;

    return {
      signerPublicKey: aptosAccount.publicKey,
      transaction: generateTransaction.data,
    };
  }, [aptosAccount?.publicKey, generateTransaction.data]);

  const simulateTransaction = useSimulateTx({ coinId, payload: simulationPayload });

  const estimatedGasAmount = useMemo(() => times(simulateTransaction.data?.[0]?.gas_used || '0', DEFAULT_GAS_BUDGET_MULTIPLY, 0), [simulateTransaction.data]);

  const estimatedBaseFeeAmount = useMemo(() => {
    if (!estimatedGasAmount) {
      return '0';
    }

    if (currentGasPrice === null) {
      return '0';
    }

    return times(currentGasPrice, estimatedGasAmount, 0);
  }, [currentGasPrice, estimatedGasAmount]);

  const estimatedDisplayFeeAmount = useMemo(() => {
    if (!gt(estimatedBaseFeeAmount, '0')) {
      return '0';
    }

    return toDisplayDenomAmount(estimatedBaseFeeAmount, coinDecimals);
  }, [coinDecimals, estimatedBaseFeeAmount]);

  const displayTx = useMemo(() => {
    if (!generateTransaction.data?.rawTransaction) return undefined;

    const tx = generateTransaction.data.rawTransaction;

    return safeStringify({
      gas_unit_price: tx.gas_unit_price.toString(),
      max_gas_amount: tx.max_gas_amount.toString(),
      chain_id: tx.chain_id,
      expiration_timestamp_secs: tx.expiration_timestamp_secs.toString(),
      payload: tx.payload,
      sender: tx.sender.toStringLong(),
      sequence_number: tx.sequence_number.toString(),
    });
  }, [generateTransaction.data?.rawTransaction]);

  const handleOnClickMax = () => {
    if (selectedCoinToSend?.asset.id === APTOS_COIN_TYPE) {
      const displayAmount = minus(displayAvailableAmount, estimatedDisplayFeeAmount);
      setSendDisplayAmount(gt(displayAmount, '0') ? displayAmount : '0');
    } else {
      setSendDisplayAmount(displayAvailableAmount);
    }
  };

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)) {
        return t('pages.wallet.send.$coinId.Entry.Aptos.index.invalidAddress');
      }

      if (!aptosAddressRegex.test(recipientAddress)) {
        return t('pages.wallet.send.$coinId.Entry.Aptos.index.invalidAddress');
      }
    }

    return '';
  }, [recipientAddress, selectedCoinToSend?.address.address, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (sendDisplayAmount) {
      if (selectedCoinToSend?.asset.id === APTOS_COIN_TYPE) {
        const totalCostAmount = plus(sendBaseAmount, estimatedBaseFeeAmount);

        if (gt(totalCostAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Aptos.index.insufficientAmount');
        }
      } else {
        if (gt(sendBaseAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Aptos.index.insufficientAmount');
        }
      }

      if (!gt(sendDisplayAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Aptos.index.tooLowAmount');
      }
    }
    return '';
  }, [baseAvailableAmount, estimatedBaseFeeAmount, selectedCoinToSend?.asset.id, sendBaseAmount, sendDisplayAmount, t]);

  const errorMessage = useMemo(() => {
    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Aptos.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.Aptos.index.noAmount');
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Aptos.index.invalidAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (!generateTransaction) {
      return t('pages.wallet.send.$coinId.Entry.Aptos.index.failedGenerateTransaction');
    }

    if (!simulateTransaction.data?.[0]?.success && !generateTransaction.data) {
      return t('pages.wallet.send.$coinId.Entry.Aptos.index.failedGenerateTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    generateTransaction,
    recipientAddress,
    sendAmountInputErrorMessage,
    sendDisplayAmount,
    simulateTransaction.data,
    t,
  ]);

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!aptosAccount) {
        throw new Error('Account not found');
      }

      if (!generateTransaction.data) {
        throw new Error('Transaction not found');
      }

      const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(aptosAccount, generateTransaction.data, rpcURLs);
      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash: response.hash, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId,
          txHash: response.hash,
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
  }, [addTx, aptosAccount, coinId, generateTransaction.data, navigate, recipientAddress, selectedCoinToSend?.address.address, selectedCoinToSend?.chain]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, currentGasPrice, memoizedSendTxPayload, generateTransaction.isFetching, simulateTransaction.isFetching]);

  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (simulateTransaction.data?.[0]?.success) {
      const currentDate = new Date();
      const endDate = new Date(parseInt(simulateTransaction.data[0].expiration_timestamp_secs || '0', 10) * 1000);

      if (endDate > currentDate) {
        const betweenTime = +endDate - +currentDate;

        if (betweenTime - 500 > 0 && !isReloading) {
          setIsReloading(true);
          setTimeout(() => {
            void (async () => {
              await estimateGasPrice.refetch();
              await generateTransaction.refetch();
              setIsReloading(false);
            })();
          }, betweenTime - 500);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateTransaction.data]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Aptos.index.send')}`}</CoinSymbolText>
            <DescriptionContainer>
              <Typography variant="b3_M">{coinDescription}</Typography>
            </DescriptionContainer>
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={selectedCoinToSend?.chain ? [selectedCoinToSend?.chain] : []}
              currentChainId={selectedCoinToSend?.chain && getUniqueChainId(selectedCoinToSend?.chain)}
              disableSortChain
              label={t('pages.wallet.send.$coinId.Entry.Aptos.index.recipientNetwork')}
              disabled
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Aptos.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddressBookButton onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </AddressBookButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Aptos.index.amount')}
              error={!!sendAmountInputErrorMessage}
              helperText={sendAmountInputErrorMessage}
              value={sendDisplayAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimals || 0) && e.currentTarget.value) {
                  return;
                }

                setSendDisplayAmount(e.currentTarget.value);
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
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <AptosFee
            displayFeeAmount={estimatedDisplayFeeAmount}
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          />
        </>
      </BaseFooter>

      {selectedCoinToSend?.chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={getUniqueChainId(selectedCoinToSend.chain)}
          headerTitle={t('pages.wallet.send.$coinId.Entry.Aptos.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.Aptos.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.Aptos.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Aptos.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Aptos.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Aptos.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Aptos.index.txProcessingSub')}
      />
    </>
  );
}
