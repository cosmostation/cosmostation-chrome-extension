import { useCallback, useMemo, useState } from 'react';
import validate from 'bitcoin-address-validation';
import { address as addressConverter, networks, opcodes, Psbt, script } from 'bitcoinjs-lib';
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
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { post } from '~/Popup/utils/axios';
import { gte, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { formatPsbtHex } from '~/Popup/utils/bitcoin';
import { getKeyPair } from '~/Popup/utils/common';
import { ecpairFromPrivateKey, ecpairFromPublicKey } from '~/Popup/utils/crypto';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';
import type { SendRawTransaction } from '~/types/bitcoin/transaction';
import type { Queue } from '~/types/extensionStorage';
import type { BitSignPsbt } from '~/types/message/bitcoin';

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
  queue: Queue<BitSignPsbt>;
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

  const accounts = useAccounts(true);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[currentBitcoinNetwork.id] || '',
    [accounts.data, currentAccount.id, currentBitcoinNetwork.id],
  );
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const decimals = useMemo(() => currentBitcoinNetwork.decimals || 0, [currentBitcoinNetwork.decimals]);

  const symbol = useMemo(() => currentBitcoinNetwork.displayDenom || 'BTC', [currentBitcoinNetwork.displayDenom]);

  const network = useMemo(() => (currentBitcoinNetwork.isSignet ? networks.testnet : networks.bitcoin), [currentBitcoinNetwork.isSignet]);

  const psbtHex = params;

  const parsedPsbt = useMemo(() => {
    const formattedPsbtHex = formatPsbtHex(psbtHex);
    const psbt = Psbt.fromHex(formattedPsbtHex);

    return psbt;
  }, [psbtHex]);

  const estimatesmartfee = useEstimatesmartfeeSWR(currentBitcoinNetwork);

  const gasRate = useMemo(() => {
    if (!estimatesmartfee.data?.result?.feerate) {
      return null;
    }

    return estimatesmartfee.data?.result?.feerate;
  }, [estimatesmartfee.data?.result?.feerate]);

  const keyPair = useMemo(() => getKeyPair(currentAccount, currentBitcoinNetwork, currentPassword), [currentAccount, currentBitcoinNetwork, currentPassword]);

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const memoBytes = useMemo(() => {
    if (!parsedPsbt) {
      return 0;
    }

    const opReturnOutput = parsedPsbt.txOutputs.find((output) => {
      try {
        const chunks = script.decompile(output.script);
        return chunks && chunks[0] === opcodes.OP_RETURN;
      } catch (e) {
        return false;
      }
    });

    if (opReturnOutput) {
      return opReturnOutput.script.length;
    }

    return 0;
  }, [parsedPsbt]);

  const currentVbytes = useMemo(() => {
    if (!utxo.data?.length) {
      return 0;
    }

    const isMemo = memoBytes > 0;

    return (utxo.data.length || 0) * P2WPKH__V_BYTES.INPUT + 2 * P2WPKH__V_BYTES.OUTPUT + P2WPKH__V_BYTES.OVERHEAD + (isMemo ? 3 : 0) + memoBytes;
  }, [memoBytes, utxo.data?.length]);

  const fee = useMemo(() => {
    if (!gasRate) {
      return 0;
    }

    return Math.ceil(currentVbytes * gasRate * 100000);
  }, [gasRate, currentVbytes]);

  const displayFee = useMemo(() => toDisplayDenomAmount(fee, decimals), [fee, decimals]);

  const displayFeePrice = useMemo(() => times(displayFee, price), [displayFee, price]);

  const currentInputs = useMemo(() => {
    const witnessUtxoMapedList = parsedPsbt.data.inputs.map((item) => {
      if (!item.witnessUtxo) {
        return undefined;
      }

      const scriptBuffer = item.witnessUtxo.script;
      const addressFromScript = addressConverter.fromOutputScript(scriptBuffer, network);

      return {
        address: addressFromScript,
        value: item.witnessUtxo?.value,
      };
    });

    return witnessUtxoMapedList.filter((item) => !!item) as {
      address: string;
      value: number;
    }[];
  }, [network, parsedPsbt.data.inputs]);

  const totalInputAmount = useMemo(() => currentInputs.reduce((totalVal, cur) => plus(totalVal, cur?.value || '0'), '0'), [currentInputs]);

  const canSendTx = useMemo(() => gte(availableAmount, totalInputAmount), [availableAmount, totalInputAmount]);

  const currentOutputs = useMemo(() => {
    const mappedOutputs = parsedPsbt.txOutputs.map((item) => {
      const addressFromScript = addressConverter.fromOutputScript(item.script, network);

      return {
        address: addressFromScript,
        value: item.value,
      };
    });

    return mappedOutputs;
  }, [network, parsedPsbt.txOutputs]);

  const errorMessage = useMemo(() => {
    if (!currentInputs.some((item) => isEqualsIgnoringCase(item?.address, address))) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.invalidSender');
    }

    if (currentOutputs.some((item) => !validate(item.address))) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.invalidAddress');
    }

    if (gasRate === null) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.failedLoadFee');
    }

    if (availableAmount === 0 || !canSendTx) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.noAvailableAmount');
    }

    if (!totalInputAmount) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.noAmount');
    }

    if (!psbtHex) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.failedCreateTxHex');
    }

    return '';
  }, [address, availableAmount, canSendTx, currentInputs, currentOutputs, gasRate, psbtHex, t, totalInputAmount]);

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
          <TxMessageContainer title="Sign">
            <TxMessageContentContainer>
              <SectionContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Bitcoin.SignPsbt.entry.input')}</Typography>
                </LabelContainer>
                {currentInputs.map((item) => {
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
              <SectionContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Bitcoin.SignPsbt.entry.output')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.Bitcoin.SignPsbt.entry.expectedFee')}</Typography>
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
          <Tx txHex={psbtHex || ''} />
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
            {t('pages.Popup.Bitcoin.SignPsbt.entry.cancel')}
          </OutlineButton>
          <Tooltip title={errorMessage} varient="error" placement="top">
            <div>
              <Button
                disabled={!!errorMessage}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

                    if (!keyPair?.privateKey) {
                      throw new Error('key does not exist');
                    }

                    const signedPsbt = parsedPsbt.signAllInputs(ecpairFromPrivateKey(keyPair.privateKey));
                    const validatePsbtSignatures = signedPsbt.validateSignaturesOfAllInputs((pubkey, msghash, signature) =>
                      ecpairFromPublicKey(pubkey).verify(msghash, signature),
                    );

                    if (!validatePsbtSignatures) {
                      throw new Error('Failed to sign transaction');
                    }

                    const txHex = signedPsbt.finalizeAllInputs().extractTransaction().toHex();

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
                {t('pages.Popup.Bitcoin.SignPsbt.entry.sign')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
