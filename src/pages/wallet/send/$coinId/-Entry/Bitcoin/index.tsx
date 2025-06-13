import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Network, validate } from 'bitcoin-address-validation';
import { networks, payments, Psbt } from 'bitcoinjs-lib';
import { isTaprootInput, toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { useDebouncedCallback } from 'use-debounce';
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
import BitcoinFee from '@/components/Fee/BitcoinFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { P2PKH__V_BYTES, P2SH__V_BYTES, P2TR__V_BYTES, P2WPKH__V_BYTES } from '@/constants/bitcoin/tx.ts';
import { useEstimateSmartFee } from '@/hooks/bitcoin/useEstimateSmartFee.ts';
import { useUtxo } from '@/hooks/bitcoin/useUtxo.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { executeTransactionSequentially } from '@/utils/bitcoin/sign.ts';
import { ecpairFromPrivateKey, getTweakSigner, initBitcoinEcc } from '@/utils/bitcoin/tx.ts';
import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getUniqueChainId, getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, isEqualsIgnoringCase } from '@/utils/string.ts';
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

type BitcoinProps = {
  coinId: string;
};

export default function Bitcoin({ coinId }: BitcoinProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const utxo = useUtxo({ coinId });

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getBitcoinAccountAsset();

  const selectedChain = selectedCoinToSend?.chain;

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimals);

  const coinDescription = selectedCoinToSend?.asset.description;

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const displaySendAmountPrice = useMemo(() => (sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0'), [coinPrice, sendDisplayAmount]);

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const bitcoinNetwork = useMemo(() => (selectedChain?.isTestnet ? networks.testnet : networks.bitcoin), [selectedChain?.isTestnet]);

  const estimatesmartfee = useEstimateSmartFee({ coinId });

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const keyPair = useMemo(() => selectedChain && getKeypair(selectedChain, currentAccount, currentPassword), [currentAccount, currentPassword, selectedChain]);

  const addressType = useMemo(() => selectedCoinToSend?.address.accountType.pubkeyStyle, [selectedCoinToSend?.address.accountType.pubkeyStyle]);

  const payment = useMemo(() => {
    try {
      if (!keyPair) {
        return undefined;
      }

      initBitcoinEcc();

      if (addressType === 'p2wpkh') {
        return payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey, 'hex'), network: bitcoinNetwork });
      }

      if (addressType === 'p2tr') {
        const tapInternalKey = toXOnly(Buffer.from(keyPair.publicKey, 'hex'));

        return payments.p2tr({
          internalPubkey: tapInternalKey,
          network: bitcoinNetwork,
        });
      }

      if (addressType === 'p2pkh') {
        return payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey, 'hex'), network: bitcoinNetwork });
      }

      if (addressType === 'p2wpkhSh') {
        return payments.p2sh({
          redeem: payments.p2wpkh({
            pubkey: Buffer.from(keyPair.publicKey, 'hex'),
            network: bitcoinNetwork,
          }),
        });
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, [addressType, bitcoinNetwork, keyPair]);

  const currentSendBaseAmount = useMemo(() => Number(toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals)), [coinDecimals, sendDisplayAmount]);

  const currentMemoBytes = useMemo(() => Buffer.from(currentMemo, 'utf8').length, [currentMemo]);

  const selectedVbytes = useMemo(() => {
    if (addressType === 'p2wpkh') return P2WPKH__V_BYTES;

    if (addressType === 'p2tr') return P2TR__V_BYTES;

    if (addressType === 'p2pkh') return P2PKH__V_BYTES;

    if (addressType === 'p2wpkhSh') return P2SH__V_BYTES;

    return undefined;
  }, [addressType]);

  const currentVbytes = useMemo(() => {
    if (!utxo.data?.length || !selectedVbytes) {
      return 0;
    }

    const isMemo = currentMemoBytes > 0;

    return (utxo.data.length || 0) * selectedVbytes.INPUT + 2 * selectedVbytes.OUTPUT + selectedVbytes.OVERHEAD + (isMemo ? 3 : 0) + currentMemoBytes;
  }, [currentMemoBytes, selectedVbytes, utxo.data?.length]);

  const fee = useMemo(() => {
    if (!gasRate) {
      return 0;
    }

    return Math.ceil(currentVbytes * gasRate * 100000);
  }, [gasRate, currentVbytes]);

  const displayFee = useMemo(() => toDisplayDenomAmount(fee, coinDecimals), [coinDecimals, fee]);

  const change = useMemo(() => Number(minus(minus(baseAvailableAmount, currentSendBaseAmount), fee)), [baseAvailableAmount, currentSendBaseAmount, fee]);

  const currentInputs = useMemo(() => {
    if (!payment) return undefined;

    if (addressType === 'p2tr') {
      return utxo.data?.map((u) => ({
        hash: u.txid,
        index: u.vout,
        witnessUtxo: {
          script: payment.output!,
          value: u.value,
        },
        tapInternalKey: payment.internalPubkey,
      }));
    }

    return utxo.data?.map((u) => ({
      hash: u.txid,
      index: u.vout,
      witnessUtxo: {
        script: payment.output!,
        value: u.value,
      },
    }));
  }, [addressType, payment, utxo.data]);

  const currentOutputs = useMemo(() => {
    if (!recipientAddress || gt('0', sendDisplayAmount || '0') || !payment) {
      return [];
    }

    return [
      {
        address: recipientAddress,
        value: currentSendBaseAmount,
      },
      {
        address: payment?.address || '',
        value: change,
      },
    ];
  }, [change, currentSendBaseAmount, payment, recipientAddress, sendDisplayAmount]);

  const txHex = useMemo(() => {
    try {
      if (!selectedChain || currentOutputs.length === 0) {
        return '';
      }

      initBitcoinEcc();
      const psbt = new Psbt({ network: bitcoinNetwork });

      if (currentInputs) {
        psbt.addInputs(currentInputs);
      }

      psbt.addOutputs(currentOutputs);

      if (currentMemoBytes > 0) {
        const memo = Buffer.from(currentMemo, 'utf8');
        psbt.addOutput({ script: payments.embed({ data: [memo] }).output!, value: 0 });
      }

      const tweakSigner = getTweakSigner(currentAccount, selectedChain, currentPassword, {
        tweakHash: null,
        network: selectedChain?.isTestnet ? 'testnet' : 'mainnet',
      });

      const signer = ecpairFromPrivateKey(keyPair!.privateKey!);

      psbt.data.inputs.forEach((input, index) => {
        if (isTaprootInput(input)) {
          psbt.signInput(index, tweakSigner!);
        } else {
          psbt.signInput(index, signer);
        }
      });

      return psbt.finalizeAllInputs().extractTransaction().toHex();
    } catch {
      return null;
    }
  }, [bitcoinNetwork, currentAccount, currentInputs, currentMemo, currentMemoBytes, currentOutputs, currentPassword, keyPair, selectedChain]);

  const handleOnClickMax = () => {
    const displayAvailableMaxAmount = toDisplayDenomAmount(minus(baseAvailableAmount, fee), coinDecimals);

    setSendDisplayAmount(gt(displayAvailableMaxAmount, '0') ? displayAvailableMaxAmount : '0');
  };

  const handleOnClickConfirm = async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!txHex) {
        throw new Error('Transaction not found');
      }

      const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await executeTransactionSequentially(txHex, rpcURLs);
      if (!response.result) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash: response.result, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId,
          txHash: response.result,
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
  };

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)) {
        return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.invalidAddress');
      }

      if (!validate(recipientAddress, selectedChain?.isTestnet ? Network.testnet : Network.mainnet)) {
        return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.invalidAddress');
      }
    }

    return '';
  }, [recipientAddress, selectedChain?.isTestnet, selectedCoinToSend?.address.address, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (sendDisplayAmount) {
      const totalCostAmount = plus(sendDisplayAmount, displayFee);

      if (gt(totalCostAmount, displayAvailableAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.noAvailableAmount');
      }

      if (!gt(sendDisplayAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.tooLowAmount');
      }
    }
    return '';
  }, [displayAvailableAmount, displayFee, sendDisplayAmount, t]);

  const inputMemoErrorMessage = useMemo(() => {
    if (currentMemoBytes > 80) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.memoMaxLength');
    }
    return '';
  }, [currentMemoBytes, t]);

  const errorMessage = useMemo(() => {
    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (gasRate === null) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.failedLoadFee');
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.noAvailableAmount');
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (!txHex) {
      return t('pages.wallet.send.$coinId.Entry.Bitcoin.index.failedCreateTxHex');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    gasRate,
    inputMemoErrorMessage,
    recipientAddress,
    sendAmountInputErrorMessage,
    sendDisplayAmount,
    t,
    txHex,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, txHex]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Bitcoin.index.send')}`}</CoinSymbolText>
            <DescriptionContainer>
              <Typography variant="b3_M">{coinDescription}</Typography>
            </DescriptionContainer>
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={selectedCoinToSend?.chain ? [selectedCoinToSend?.chain] : []}
              currentChainId={selectedCoinToSend?.chain && getUniqueChainId(selectedCoinToSend?.chain)}
              disableSortChain
              label={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.recipientNetwork')}
              disabled
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.recipientAddress')}
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
              label={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.amount')}
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
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.memo')}
              error={!!inputMemoErrorMessage}
              helperText={inputMemoErrorMessage}
              value={currentMemo}
              onChange={(e) => setCurrentMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <BitcoinFee
            feeCoinId={coinId}
            disableConfirm={!!errorMessage || isDisabled || !txHex}
            isLoading={isDisabled || estimatesmartfee.isLoading || utxo.isLoading}
            displayFeeAmount={displayFee}
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
          headerTitle={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={txHex}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.Bitcoin.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.Bitcoin.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Bitcoin.index.txProcessingSub')}
      />
    </>
  );
}
