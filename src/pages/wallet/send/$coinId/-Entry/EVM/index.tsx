import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidAddress } from 'ethereumjs-util';
import { ethers } from 'ethers';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet/index.tsx';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import EVMFee from '@/components/Fee/EVMFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm.ts';
import { ERC20_ABI } from '@/constants/evm/abi.ts';
import { DEFAULT_GAS_MULTIPLY } from '@/constants/evm/fee.ts';
import { useENS } from '@/hooks/evm/useENS.ts';
import { useEstimateGas } from '@/hooks/evm/useEstimateGas.ts';
import { useFee } from '@/hooks/evm/useFee.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { ethersProvider } from '@/utils/ethereum/ethers.ts';
import { signAndExecuteTxSequentially } from '@/utils/ethereum/sign.ts';
import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, isEqualsIgnoringCase, shorterAddress, toHex } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled.tsx';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type EVMProps = {
  coinId: string;
};

export default function EVM({ coinId }: EVMProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getEVMAccountAsset();
  const selectedChainId = (() => {
    const { chainId, chainType } = parseCoinId(coinId);

    return getUniqueChainId({
      id: chainId,
      chainType: chainType,
    });
  })();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'erc20') {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.contract');
    }

    return '';
  })();

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimals);

  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [debouncedInputRecipientAddress] = useDebounce(inputRecipientAddress, 500);

  const ens = useENS({ coinId, domain: debouncedInputRecipientAddress });

  const nameResolvedAddress = ens.data;
  const recipientAddress = useMemo(() => nameResolvedAddress || debouncedInputRecipientAddress, [debouncedInputRecipientAddress, nameResolvedAddress]);

  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const displaySendAmountPrice = useMemo(() => (sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0'), [coinPrice, sendDisplayAmount]);

  const baseSendAmount = useMemo(() => toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals), [coinDecimals, sendDisplayAmount]);

  const sendTx = useMemo(() => {
    if (!gt(sendDisplayAmount || '0', '0') || !recipientAddress) return undefined;

    const amount = toHex(toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals), { addPrefix: true, isStringNumber: true });

    const senderAddress = selectedCoinToSend?.address.address || '';

    if (selectedCoinToSend?.asset.type !== 'erc20') {
      return {
        from: senderAddress,
        to: recipientAddress,
        value: amount,
      };
    }
    const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

    const provider = ethersProvider(rpcURLs[0]);

    const tokenAddress = selectedCoinToSend?.asset.id;

    const erc20Contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const data = isValidAddress(recipientAddress) ? erc20Contract.interface.encodeFunctionData('transfer', [recipientAddress, amount]) : undefined;

    return {
      from: senderAddress,
      to: tokenAddress,
      data,
    };
  }, [
    coinDecimals,
    recipientAddress,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.asset.id,
    selectedCoinToSend?.asset.type,
    selectedCoinToSend?.chain.rpcUrls,
    sendDisplayAmount,
  ]);
  const [debouncedSendTx] = useDebounce(sendTx, 500);

  const fee = useFee({ coinId });

  const estimateGas = useEstimateGas({ coinId, bodyParams: debouncedSendTx && [debouncedSendTx] });

  const [currentFeeStepKey, setCurrentFeeStepKey] = useState(1);

  const [customGasPrice, setCustomGasPrice] = useState('');

  const [customMaxBaseFeeAmount, setCustomMaxBaseFeeAmount] = useState('');
  const [customPriorityFeeAmount, setCustomPriorityFeeAmount] = useState('');

  const currentEIP1559Fee = useMemo(() => {
    if (fee.type === 'EIP-1559') {
      const customFeeStep = {
        maxBaseFeePerGas: customMaxBaseFeeAmount,
        maxPriorityFeePerGas: customPriorityFeeAmount,
      };

      return [...(fee?.currentFee || []), customFeeStep][currentFeeStepKey];
    }

    return undefined;
  }, [currentFeeStepKey, customMaxBaseFeeAmount, customPriorityFeeAmount, fee?.currentFee, fee.type]);

  const gasRateList = useMemo(() => {
    if (fee.type === 'BASIC') {
      const baseGasPrice = fee.currentGasPrice || '0';

      return [baseGasPrice, times(baseGasPrice, '1.2'), times(baseGasPrice, '2'), customGasPrice];
    }

    if (fee.type === 'EIP-1559') {
      const defaultMaxBaseFeePerGasList = fee.currentFee?.map((item) => item.maxBaseFeePerGas) || [];

      return [...defaultMaxBaseFeePerGasList, customMaxBaseFeeAmount];
    }

    return undefined;
  }, [customGasPrice, customMaxBaseFeeAmount, fee.currentFee, fee.currentGasPrice, fee.type]);

  const currentGasRate = (() => {
    return gasRateList?.[currentFeeStepKey] || '0';
  })();

  const [customGasAmount, setGasAmount] = useState('');

  const gasMultiplier = selectedCoinToSend?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;

  const baseEstimateGas = useMemo(
    () => times(BigInt(estimateGas.data?.result || '21000').toString(10) || '0', gasMultiplier),
    [estimateGas.data?.result, gasMultiplier],
  );

  const gasList = useMemo(() => [...Array(3).fill(baseEstimateGas), customGasAmount], [baseEstimateGas, customGasAmount]);

  const currentGas = useMemo(() => gasList[currentFeeStepKey] || '0', [currentFeeStepKey, gasList]);

  const defaultFeeOption = useMemo(
    () => ({
      maxBaseFeePerGas: customMaxBaseFeeAmount || fee.currentFee?.[0].maxBaseFeePerGas,
      maxPriorityFeePerGas: customPriorityFeeAmount || fee.currentFee?.[0].maxPriorityFeePerGas,
      gasPrice: customGasPrice || gasRateList?.[0],
      gas: customGasAmount || gasList?.[0],
    }),
    [customGasAmount, customGasPrice, customMaxBaseFeeAmount, customPriorityFeeAmount, fee.currentFee, gasList, gasRateList],
  );

  const estimatedFeeBaseAmount = useMemo(() => times(currentGasRate, currentGas), [currentGas, currentGasRate]);

  const finalizedTransaction = useMemo(() => {
    if (!debouncedSendTx || !gt(currentGas, '0') || !gt(currentGasRate, '0') || !fee.type || !selectedCoinToSend?.chain.chainId) {
      return null;
    }

    if (fee.type === 'EIP-1559' && (!currentEIP1559Fee || !currentEIP1559Fee.maxBaseFeePerGas || !currentEIP1559Fee.maxPriorityFeePerGas)) {
      return null;
    }

    return {
      from: debouncedSendTx.from,
      to: debouncedSendTx.to,
      data: debouncedSendTx.data,
      value: BigInt(debouncedSendTx.value || '0').toString(10),
      gasLimit: currentGas,
      chainId: BigInt(selectedCoinToSend.chain.chainId).toString(10),
      type: fee.type === 'EIP-1559' ? 2 : undefined,
      gasPrice: fee.type === 'BASIC' ? BigInt(currentGasRate).toString(10) : undefined,
      maxFeePerGas: fee.type === 'EIP-1559' ? BigInt(currentEIP1559Fee?.maxBaseFeePerGas || '0').toString(10) : undefined,
      maxPriorityFeePerGas: fee.type === 'EIP-1559' ? BigInt(currentEIP1559Fee?.maxPriorityFeePerGas || '0').toString(10) : undefined,
    };
  }, [currentEIP1559Fee, currentGas, currentGasRate, debouncedSendTx, fee.type, selectedCoinToSend?.chain.chainId]);

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (
        (recipientAddress.startsWith('0x') && !isValidAddress(recipientAddress)) ||
        isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)
      ) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidAddress');
      }

      if (recipientAddress.endsWith('.eth') && !nameResolvedAddress && !ens.isLoading) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidENSAddress');
      }

      if (!recipientAddress.endsWith('.eth') && !recipientAddress.startsWith('0x')) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidENSFormat');
      }
    }

    return '';
  }, [ens.isLoading, nameResolvedAddress, recipientAddress, selectedCoinToSend?.address.address, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (sendDisplayAmount) {
      if (isEqualsIgnoringCase(selectedCoinToSend?.asset.id, NATIVE_EVM_COIN_ADDRESS)) {
        const totalCostAmount = plus(baseSendAmount, estimatedFeeBaseAmount);

        if (gt(totalCostAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.EVM.index.insufficientAmount');
        }
      } else {
        if (gt(baseSendAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.EVM.index.insufficientAmount');
        }
      }

      if (!gt(sendDisplayAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.tooLowAmount');
      }
    }

    return '';
  }, [baseAvailableAmount, baseSendAmount, estimatedFeeBaseAmount, selectedCoinToSend?.asset.id, sendDisplayAmount, t]);

  const errorMessages = useMemo(() => {
    if (selectedCoinToSend?.chain.isDiableSend) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.bankLocked');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noRecipientAddress');
    }

    if (baseAvailableAmount === '0') {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noAvailableAmount');
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (!sendTx) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    recipientAddress,
    selectedCoinToSend?.chain.isDiableSend,
    sendAmountInputErrorMessage,
    sendDisplayAmount,
    sendTx,
    t,
  ]);

  const handleOnClickMax = () => {
    if (selectedCoinToSend?.asset.type !== 'erc20') {
      const maxAmount = minus(baseAvailableAmount, estimatedFeeBaseAmount);

      setSendDisplayAmount(gt(maxAmount, '0') ? toDisplayDenomAmount(maxAmount, coinDecimals) : '0');
    } else {
      setSendDisplayAmount(displayAvailableAmount);
    }
  };

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!finalizedTransaction) {
        throw new Error('Failed to calculate final transaction');
      }

      const keyPair = getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(privateKey, finalizedTransaction, rpcURLs);

      if (!response) {
        throw new Error('Failed to send transaction');
      }

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
  }, [coinId, currentAccount, currentPassword, finalizedTransaction, navigate, recipientAddress, selectedCoinToSend?.chain]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, sendTx, estimateGas.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.EVM.index.send')}`}</CoinSymbolText>
            {coinType && (
              <CoinDenomContainer>
                <Typography variant="b4_R">{`${coinType} :`}</Typography>
                &nbsp;
                <Typography variant="b3_M">{shortCoinDenom}</Typography>
              </CoinDenomContainer>
            )}
          </CoinContainer>

          <InputWrapper>
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.EVM.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage || nameResolvedAddress || ''}
              isLoadingHelperText={ens.isLoading}
              value={inputRecipientAddress}
              onChange={(e) => setInputRecipientAddress(e.target.value)}
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
              label={t('pages.wallet.send.$coinId.Entry.EVM.index.amount')}
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
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
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
          <EVMFee
            feeStepKey={currentFeeStepKey}
            gasRate={gasRateList}
            gas={currentGas}
            defaultFeeOption={defaultFeeOption}
            chainId={selectedChainId}
            feeType={fee.type}
            disableConfirm={!!errorMessages || isDisabled || !finalizedTransaction}
            isLoading={isDisabled}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
            onClickFeeStep={(index) => {
              setCurrentFeeStepKey(index);
            }}
            onChangeGas={(gas) => {
              setGasAmount(gas);
            }}
            onChangeGasPrice={(gasPrice) => {
              setCustomGasPrice(gasPrice);
            }}
            onChangeMaxBaseFee={(maxBaseFee) => {
              setCustomMaxBaseFeeAmount(maxBaseFee);
            }}
            onChangePriorityFee={(priorityFee) => {
              setCustomPriorityFeeAmount(priorityFee);
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
          headerTitle={t('pages.wallet.send.$coinId.Entry.EVM.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setInputRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.send.$coinId.Entry.EVM.index.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.EVM.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.EVM.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.EVM.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.EVM.index.txProcessingSub')}
      />
    </>
  );
}
