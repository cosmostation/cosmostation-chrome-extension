import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import validate from 'bitcoin-address-validation';
import { networks, payments, Psbt } from 'bitcoinjs-lib';
import { isTaprootInput, toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { Typography } from '@mui/material';

import BalanceDisplay from '@/components/BalanceDisplay';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import EmptyAsset from '@/components/EmptyAsset';
import { P2PKH__V_BYTES, P2SH__V_BYTES, P2TR__V_BYTES, P2WPKH__V_BYTES } from '@/constants/bitcoin/tx';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentBitcoinNetwork } from '@/hooks/bitcoin/useCurrentBitcoinNetwork';
import { useEstimateSmartFee } from '@/hooks/bitcoin/useEstimateSmartFee';
import { useUtxo } from '@/hooks/bitcoin/useUtxo';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import {
  AddressContainer,
  AmountContainer,
  AmountWrapper,
  DetailWrapper,
  LabelContainer,
  MsgTitle,
  MsgTitleContainer,
  SymbolText,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import DappInfo from '@/pages/popup/-components/DappInfo';
import type { ResponseAppMessage } from '@/types/message/content';
import type { BitSendBitcoin } from '@/types/message/inject/bitcoin';
import { executeTransactionSequentially } from '@/utils/bitcoin/sign';
import { ecpairFromPrivateKey, getTweakSigner, initBitcoinEcc } from '@/utils/bitcoin/tx';
import { gt, minus, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import {
  Divider,
  DividerContainer,
  EmptyAssetContainer,
  LineDivider,
  RawTxContainer,
  RawTxMessage,
  SticktFooterInnerBody,
  StickyTabContainer,
  StyledTabPanel,
  TxBaseInfoContainer,
  TxMessageContainer,
} from './-styled';

import ErrorIcon from '@/assets/images/icons/Error70.svg';

type EntryProps = {
  request: BitSendBitcoin;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const { to, satAmount } = request.params;

  const nativeAccountAsset = useMemo(
    () => currentBitcoinNetwork && accountAllAssets?.bitcoinAccountAssets.find((item) => isSameChain(item.chain, currentBitcoinNetwork)),
    [accountAllAssets?.bitcoinAccountAssets, currentBitcoinNetwork],
  );

  const displaySendAmount = useMemo(
    () => toDisplayDenomAmount(satAmount, nativeAccountAsset?.asset.decimals || 8),
    [nativeAccountAsset?.asset.decimals, satAmount],
  );

  const symbol = useMemo(() => nativeAccountAsset?.asset.symbol || '', [nativeAccountAsset?.asset.symbol]);

  const symbolColor = useMemo(
    () => nativeAccountAsset?.asset && ('color' in nativeAccountAsset.asset ? (nativeAccountAsset.asset.color as string) : undefined),
    [nativeAccountAsset?.asset],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);
  const nativeCoinAvailableAmount = useMemo(() => nativeAccountAsset?.balance || '0', [nativeAccountAsset?.balance]);

  const utxo = useUtxo({ coinId: nativeAccountAssetCoinId });

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const keyPair = useMemo(
    () => currentBitcoinNetwork && getKeypair(currentBitcoinNetwork, currentAccount, currentPassword),
    [currentAccount, currentBitcoinNetwork, currentPassword],
  );

  const bitcoinNetwork = useMemo(() => (nativeAccountAsset?.chain.isTestnet ? networks.testnet : networks.bitcoin), [nativeAccountAsset?.chain.isTestnet]);

  const addressType = useMemo(() => nativeAccountAsset?.address.accountType.pubkeyStyle, [nativeAccountAsset?.address.accountType.pubkeyStyle]);

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

  const estimatesmartfee = useEstimateSmartFee({ coinId: nativeAccountAssetCoinId });

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const currentMemoBytes = useMemo(() => Buffer.from('', 'utf8').length, []);

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

  const change = useMemo(() => Number(minus(minus(nativeCoinAvailableAmount, satAmount), fee)), [fee, nativeCoinAvailableAmount, satAmount]);

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
    if (!payment?.address) {
      return [];
    }

    return [
      {
        address: to,
        value: satAmount,
      },
      {
        address: payment.address,
        value: change,
      },
    ];
  }, [change, payment?.address, satAmount, to]);

  const txHex = useMemo(() => {
    try {
      if (!currentBitcoinNetwork || currentOutputs.length === 0) {
        return '';
      }

      if (!keyPair) {
        return null;
      }

      initBitcoinEcc();
      const psbt = new Psbt({ network: bitcoinNetwork });

      if (currentInputs) {
        psbt.addInputs(currentInputs);
      }

      psbt.addOutputs(currentOutputs);

      if (currentMemoBytes > 0) {
        const memo = Buffer.from('', 'utf8');
        psbt.addOutput({ script: payments.embed({ data: [memo] }).output!, value: 0 });
      }

      const tweakSigner = getTweakSigner(currentAccount, currentBitcoinNetwork, currentPassword, {
        tweakHash: null,
        network: currentBitcoinNetwork.isTestnet ? 'testnet' : 'mainnet',
      });

      const signer = ecpairFromPrivateKey(keyPair.privateKey);

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
  }, [bitcoinNetwork, currentAccount, currentBitcoinNetwork, currentInputs, currentMemoBytes, currentOutputs, currentPassword, keyPair]);

  const errorMessage = useMemo(() => {
    if (!validate(to)) {
      return t('pages.popup.bitcoin.send.entry.invalidAddress');
    }

    if (gasRate === null) {
      return t('pages.popup.bitcoin.send.entry.failedLoadFee');
    }

    if (!gt(nativeCoinAvailableAmount, '0') || gt('0', minus(minus(nativeCoinAvailableAmount, satAmount), fee))) {
      return t('pages.popup.bitcoin.send.entry.noAvailableAmount');
    }

    if (!satAmount) {
      return t('pages.popup.bitcoin.send.entry.noAmount');
    }

    if (!txHex) {
      return t('pages.popup.bitcoin.send.entry.failedCreateTxHex');
    }

    return '';
  }, [fee, gasRate, nativeCoinAvailableAmount, satAmount, t, to, txHex]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!txHex) {
        throw new Error('Transaction not found');
      }

      const rpcURLs = nativeAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await executeTransactionSequentially(txHex, rpcURLs);

      if (!response.result) {
        throw new Error('Failed to sign transaction');
      }

      const { result } = response;

      await incrementTxCountForOrigin(request.origin);

      sendMessage<ResponseAppMessage<BitSendBitcoin>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result,
        },
      });
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          error: {
            code: RPC_ERROR.INVALID_INPUT,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
          },
        },
      });
    } finally {
      setIsProcessing(false);

      await deQueue();
    }
  };

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={String(fee)} disableFee />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>
          <LineDivider />
          <StickyTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessageContainer>
              <MsgTitleContainer
                sx={{
                  margin: '0.8rem 0 1.2rem',
                }}
              >
                <MsgTitle variant="h3_B">{'# Send'}</MsgTitle>
              </MsgTitleContainer>
              <Divider
                sx={{
                  marginBottom: '1.2rem',
                }}
              />
              <DetailWrapper>
                <LabelContainer>
                  <Base1000Text
                    variant="b3_R"
                    sx={{
                      marginBottom: '0.6rem',
                    }}
                  >
                    {t('pages.popup.bitcoin.send.entry.sendAmount')}
                  </Base1000Text>
                  <AmountWrapper>
                    <AmountContainer>
                      <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={8} isDisableHidden>
                        {displaySendAmount}
                      </BalanceDisplay>
                      &nbsp;
                      <SymbolText data-symbol-color={symbolColor} variant="b2_B">
                        {symbol}
                      </SymbolText>
                    </AmountContainer>
                  </AmountWrapper>
                </LabelContainer>

                <LabelContainer>
                  <Base1000Text
                    variant="b3_R"
                    sx={{
                      marginBottom: '0.4rem',
                    }}
                  >
                    {t('pages.popup.bitcoin.send.entry.from')}
                  </Base1000Text>
                  <AddressContainer>
                    <Base1300Text variant="b3_M">{nativeAccountAsset?.address.address || ''}</Base1300Text>
                  </AddressContainer>
                </LabelContainer>

                <LabelContainer>
                  <Base1000Text
                    variant="b3_R"
                    sx={{
                      marginBottom: '0.4rem',
                    }}
                  >
                    {t('pages.popup.bitcoin.send.entry.to')}
                  </Base1000Text>
                  <AddressContainer>
                    <Base1300Text variant="b3_M">{to}</Base1300Text>
                  </AddressContainer>
                </LabelContainer>
              </DetailWrapper>
            </TxMessageContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            {txHex ? (
              <RawTxContainer>
                <RawTxMessage>
                  <Typography variant="b3_M">{txHex}</Typography>
                </RawTxMessage>
              </RawTxContainer>
            ) : (
              <EmptyAssetContainer>
                <EmptyAsset
                  icon={<ErrorIcon />}
                  title={t('pages.popup.bitcoin.send.entry.failedCreateTxHex')}
                  subTitle={t('pages.popup.bitcoin.send.entry.failedCreateTxHexDescription')}
                />
              </EmptyAssetContainer>
            )}
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={async () => {
                sendMessage({
                  target: 'CONTENT',
                  method: 'responseApp',
                  origin: request.origin,
                  requestId: request.requestId,
                  tabId: request.tabId,
                  params: {
                    id: request.requestId,
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                });

                await deQueue();
              }}
              variant="dark"
            >
              {t('pages.popup.bitcoin.send.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnClickSign}>
                  {t('pages.popup.bitcoin.send.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
