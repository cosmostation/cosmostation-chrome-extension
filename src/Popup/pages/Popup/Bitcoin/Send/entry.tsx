import { useCallback, useMemo, useState } from 'react';
import validate from 'bitcoin-address-validation';
import { address as addressConverter, networks, payments, Psbt } from 'bitcoinjs-lib';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { P2WPKH__V_BYTES } from '~/constants/bitcoin';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useEstimatesmartfeeSWR } from '~/Popup/hooks/SWR/bitcoin/useEstimatesmartfeeSWR';
import { useUtxoSWR } from '~/Popup/hooks/SWR/bitcoin/useUtxoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { post } from '~/Popup/utils/axios';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { ecpairFromPrivateKey } from '~/Popup/utils/crypto';
import { responseToWeb } from '~/Popup/utils/message';
import { shorterAddress } from '~/Popup/utils/string';
import type { SendRawTransaction } from '~/types/bitcoin/transaction';
import type { Queue } from '~/types/extensionStorage';
import type { BitSendBitcoin } from '~/types/message/bitcoin';

import Tx from './components/TxHex';
import TxMessageContainer from './components/TxMessageContainer';
import {
  AddressContainer,
  AmountContainer,
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  DenomContainer,
  FeeContainer,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  InOutputContainer,
  LabelContainer,
  SectionContainer,
  StyledTabPanel,
  TxMessageContentContainer,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';
import Header from '../components/Header';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<BitSendBitcoin>;
};

export default function Entry({ queue }: EntryProps) {
  const { message, messageId, origin } = queue;
  const { params } = message;

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = extensionStorage;
  const { setLoadingLedgerSigning } = useLoading();

  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const balance = useBalanceSWR(currentBitcoinNetwork);
  const utxo = useUtxoSWR(currentBitcoinNetwork);

  const { coinGeckoId } = currentBitcoinNetwork;

  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const [isProgress, setIsProgress] = useState(false);

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const decimals = useMemo(() => currentBitcoinNetwork.decimals || 0, [currentBitcoinNetwork.decimals]);

  const symbol = useMemo(() => currentBitcoinNetwork.displayDenom || 'BTC', [currentBitcoinNetwork.displayDenom]);

  const network = useMemo(() => (currentBitcoinNetwork.isSignet ? networks.testnet : networks.bitcoin), [currentBitcoinNetwork.isSignet]);

  const { to, satAmount } = params;

  const estimatesmartfee = useEstimatesmartfeeSWR(currentBitcoinNetwork);

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const keyPair = useMemo(() => getKeyPair(currentAccount, currentBitcoinNetwork, currentPassword), [currentAccount, currentBitcoinNetwork, currentPassword]);

  const p2wpkh = useMemo(() => payments.p2wpkh({ pubkey: keyPair!.publicKey, network }), [keyPair, network]);

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const currentMemoBytes = useMemo(() => Buffer.from('', 'utf8').length, []);

  const currentVbytes = useMemo(() => {
    if (!utxo.data?.length) {
      return 0;
    }

    const isMemo = currentMemoBytes > 0;

    return (utxo.data.length || 0) * P2WPKH__V_BYTES.INPUT + 2 * P2WPKH__V_BYTES.OUTPUT + P2WPKH__V_BYTES.OVERHEAD + (isMemo ? 3 : 0) + currentMemoBytes;
  }, [currentMemoBytes, utxo.data]);

  const fee = useMemo(() => {
    if (!gasRate) {
      return 0;
    }

    return Math.ceil(currentVbytes * gasRate * 100000);
  }, [gasRate, currentVbytes]);

  const displayFee = useMemo(() => toDisplayDenomAmount(fee, decimals), [fee, decimals]);

  const change = useMemo(() => availableAmount - satAmount - fee, [availableAmount, satAmount, fee]);

  const displayFeePrice = useMemo(() => times(displayFee, price), [displayFee, price]);

  const currentInputs = useMemo(
    () =>
      utxo.data?.map((u) => ({
        hash: u.txid,
        index: u.vout,
        witnessUtxo: {
          script: p2wpkh.output!,
          value: u.value,
        },
      })),
    [p2wpkh.output, utxo.data],
  );

  const currentOutputs = useMemo(
    () => [
      {
        address: to,
        value: satAmount,
      },
      {
        address: p2wpkh.address!,
        value: change,
      },
    ],
    [change, p2wpkh.address, satAmount, to],
  );

  const txHex = useMemo(() => {
    try {
      const psbt = new Psbt({ network });

      if (currentInputs) {
        psbt.addInputs(currentInputs);
      }

      psbt.addOutputs(currentOutputs);

      if (currentMemoBytes > 0) {
        const memo = Buffer.from('', 'utf8');
        psbt.addOutput({ script: payments.embed({ data: [memo] }).output!, value: 0 });
      }

      return psbt.signAllInputs(ecpairFromPrivateKey(keyPair!.privateKey!)).finalizeAllInputs().extractTransaction().toHex();
    } catch {
      return null;
    }
  }, [currentInputs, currentMemoBytes, currentOutputs, keyPair, network]);

  const errorMessage = useMemo(() => {
    if (!validate(to)) {
      return t('pages.Popup.Bitcoin.Send.entry.invalidAddress');
    }

    if (gasRate === null) {
      return t('pages.Popup.Bitcoin.Send.entry.failedLoadFee');
    }

    if (availableAmount === 0 || availableAmount - satAmount - fee < 0) {
      return t('pages.Popup.Bitcoin.Send.entry.noAvailableAmount');
    }

    if (!satAmount) {
      return t('pages.Popup.Bitcoin.Send.entry.noAmount');
    }

    if (!txHex) {
      return t('pages.Popup.Bitcoin.Send.entry.failedCreateTxHex');
    }

    return '';
  }, [availableAmount, fee, gasRate, satAmount, t, to, txHex]);

  const handleChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  return (
    <Container>
      <Header network={currentBitcoinNetwork} origin={origin} />
      <ContentContainer>
        <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
          <Tab label="Detail" />
          <Tab label="Data" />
        </Tabs>
        <StyledTabPanel value={tabValue} index={0}>
          <TxMessageContainer title="Send">
            <TxMessageContentContainer>
              <SectionContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Bitcoin.Send.entry.input')}</Typography>
                </LabelContainer>

                {currentInputs?.map((item) => {
                  const { value, script } = item.witnessUtxo;
                  const addressFromOutputScript = addressConverter.fromOutputScript(script, network);

                  const displayValue = toDisplayDenomAmount(value || '0', decimals);

                  return (
                    <InOutputContainer key={`${addressFromOutputScript}-${value}`}>
                      <AddressContainer>
                        <Typography variant="h5">{shorterAddress(addressFromOutputScript, 14)}</Typography>
                      </AddressContainer>
                      <AmountContainer>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                          {displayValue}
                        </Number>
                        &nbsp;
                        <DenomContainer>
                          <Typography variant="h5">{currentBitcoinNetwork.displayDenom}</Typography>
                        </DenomContainer>
                      </AmountContainer>
                    </InOutputContainer>
                  );
                })}
              </SectionContainer>

              <SectionContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Bitcoin.Send.entry.output')}</Typography>
                </LabelContainer>
                {currentOutputs.map((item) => {
                  const displayValue = toDisplayDenomAmount(item.value, decimals);

                  return (
                    <InOutputContainer key={`${item.address}-${item.value}`}>
                      <AddressContainer>
                        <Typography variant="h5">{shorterAddress(item.address, 14)}</Typography>
                      </AddressContainer>
                      <AmountContainer>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                          {displayValue}
                        </Number>
                        &nbsp;
                        <DenomContainer>
                          <Typography variant="h5">{currentBitcoinNetwork.displayDenom}</Typography>
                        </DenomContainer>
                      </AmountContainer>
                    </InOutputContainer>
                  );
                })}
              </SectionContainer>
            </TxMessageContentContainer>
          </TxMessageContainer>
          <FeeContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">{t('pages.Popup.Bitcoin.Send.entry.expectedFee')}</Typography>
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {displayFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {displayFeePrice}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx txHex={txHex || ''} />
        </StyledTabPanel>
      </ContentContainer>
      <BottomContainer>
        {errorMessage && (
          <WarningContainer>
            <WarningIconContainer>
              <Info16Icon />
            </WarningIconContainer>
            <WarningTextContainer>
              <Typography variant="h5">{errorMessage}</Typography>
            </WarningTextContainer>
          </WarningContainer>
        )}
        <BottomButtonContainer>
          <OutlineButton
            onClick={async () => {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.USER_REJECTED_REQUEST,
                    message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                  },
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Bitcoin.Send.entry.cancel')}
          </OutlineButton>
          <Tooltip title={errorMessage} varient="error" placement="top">
            <div>
              <Button
                disabled={!!errorMessage}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

                    const response = await post<SendRawTransaction>(
                      currentBitcoinNetwork.rpcURL,
                      {
                        jsonrpc: '2.0',
                        id: '1',
                        method: 'sendrawtransaction',
                        params: [txHex],
                      },
                      { headers: { 'Content-Type': 'application/json' } },
                    );

                    if (!response.result) {
                      throw new Error('Failed to sign transaction');
                    }

                    const { result } = response;

                    responseToWeb({
                      response: {
                        result,
                      },
                      message,
                      messageId,
                      origin,
                    });

                    await deQueue();
                  } catch (e) {
                    enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                  } finally {
                    setLoadingLedgerSigning(false);
                    setIsProgress(false);
                  }
                }}
              >
                {t('pages.Popup.Bitcoin.Send.entry.sign')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
