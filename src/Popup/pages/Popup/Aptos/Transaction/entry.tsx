import { useCallback, useEffect, useMemo, useState } from 'react';
import { AptosAccount, AptosClient } from 'aptos';
import { useSnackbar } from 'notistack';
import { useDebouncedCallback } from 'use-debounce';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useEstimateGasPriceSWR } from '~/Popup/hooks/SWR/aptos/useEstimateGasPriceSWR';
import { useGenerateTransactionSWR } from '~/Popup/hooks/SWR/aptos/useGenerateTransactionSWR';
import { useSimulateTransactionSWR } from '~/Popup/hooks/SWR/aptos/useSimulateTransactionSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Aptos/components/Header';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type {
  AptosSignAndSubmitTransaction,
  AptosSignAndSubmitTransactionResponse,
  AptosSignTransaction,
  AptosSignTransactionResponse,
} from '~/types/message/aptos';
import type { Path } from '~/types/route';

import Tx from './components/Tx';
import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  FeeButton,
  FeeContainer,
  FeeEditContainer,
  FeeEditLeftContainer,
  FeeEditRightContainer,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  StyledCircularProgress,
  StyledTabPanel,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<AptosSignTransaction | AptosSignAndSubmitTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = APTOS;
  const { extensionStorage } = useExtensionStorage();

  const { currency } = extensionStorage;

  const assets = useAssetsSWR();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const { data: coinInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', address: '0x1', resourceTarget: APTOS_COIN });

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const price = useMemo(
    () => (asset?.coinGeckoId && coinGeckoPrice.data?.[asset.coinGeckoId]?.[currency]) || 0,
    [asset?.coinGeckoId, coinGeckoPrice.data, currency],
  );

  const { enqueueSnackbar } = useSnackbar();

  const [gasMode, setGasMode] = useState<'low' | 'average' | 'high'>('average');
  const [gas, setGas] = useState<string | undefined>();

  const maxGas = useMemo(() => (gas ? times(gas, 2, 0) : undefined), [gas]);

  const [isLoadingFee, setIsLoadingFee] = useState(false);

  const { deQueue } = useCurrentQueue();

  const [errorMessage, setErrorMessage] = useState('');

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const aptosClient = useMemo(() => new AptosClient(currentAptosNetwork.restURL), [currentAptosNetwork.restURL]);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { t } = useTranslation();

  const [isProgress, setIsProgress] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);

  const aptosAccount = useMemo(() => new AptosAccount(keyPair!.privateKey!), [keyPair]);

  const { message, messageId, origin, channel } = queue;
  const { params, method } = message;

  const estimateGasPrice = useEstimateGasPriceSWR();

  const currentGasPrice = useMemo(() => {
    if (!estimateGasPrice.data) {
      return null;
    }

    const lowGasPrice =
      estimateGasPrice.data.deprioritized_gas_estimate || estimateGasPrice.data.gas_estimate || estimateGasPrice.data.prioritized_gas_estimate;

    const averageGasPrice = estimateGasPrice.data.gas_estimate || estimateGasPrice.data.prioritized_gas_estimate;

    const highGasPrice = estimateGasPrice.data.prioritized_gas_estimate;

    if (typeof lowGasPrice !== 'number' || typeof averageGasPrice !== 'number' || typeof highGasPrice !== 'number') {
      return null;
    }

    return gasMode === 'low' ? lowGasPrice : gasMode === 'average' ? averageGasPrice : highGasPrice;
  }, [estimateGasPrice.data, gasMode]);

  const generateTransaction = useGenerateTransactionSWR({
    payload: params[0],
    options: { gas_unit_price: currentGasPrice ? String(currentGasPrice) : undefined, max_gas_amount: maxGas },
  });

  const simulateTransaction = useSimulateTransactionSWR({
    aptosAccount,
    rawTransaction: generateTransaction.data,
    query: gas
      ? { estimatePrioritizedGasUnitPrice: false, estimateGasUnitPrice: false, estimateMaxGasAmount: false }
      : { estimatePrioritizedGasUnitPrice: false, estimateGasUnitPrice: true, estimateMaxGasAmount: true },
  });

  const decimals = useMemo(() => coinInfo?.data.decimals || 0, [coinInfo?.data.decimals]);

  const maxGasAmount = useMemo(() => simulateTransaction.data?.[0]?.max_gas_amount, [simulateTransaction.data]);

  const currentBaseMaxFee = useMemo(() => {
    if (!maxGas) {
      return null;
    }

    if (currentGasPrice === null) {
      return null;
    }

    return times(currentGasPrice, maxGas, 0);
  }, [currentGasPrice, maxGas]);

  const currentDisplayMaxFee = useMemo(() => {
    if (currentBaseMaxFee === null) {
      return '0';
    }

    return toDisplayDenomAmount(currentBaseMaxFee, decimals);
  }, [decimals, currentBaseMaxFee]);

  const currentDisplayMaxFeeValue = useMemo(() => times(currentDisplayMaxFee, price, 0), [currentDisplayMaxFee, price]);

  const handleChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  const [isReloading, setIsReloading] = useState(false);

  const elseError = useDebouncedCallback(() => {
    if (!simulateTransaction.data?.[0]?.success && !generateTransaction.data) {
      setErrorMessage('Unknown Error');
    }
  }, 10000);

  useEffect(() => {
    setIsLoadingFee(true);
    if (simulateTransaction.data?.[0]?.success) {
      setErrorMessage('');

      setGas(simulateTransaction.data[0]?.gas_used);

      const currentDate = new Date();
      const endDate = new Date(parseInt(simulateTransaction.data[0].expiration_timestamp_secs || '0', 10) * 1000);

      if (endDate > currentDate) {
        setIsLoadingFee(false);

        const betweenTime = +endDate - +currentDate;

        if (betweenTime - 500 > 0 && !isReloading) {
          setIsReloading(true);
          setTimeout(() => {
            void (async () => {
              await estimateGasPrice.mutate();
              await generateTransaction.mutate();
              setIsReloading(false);
            })();
          }, betweenTime - 500);
        }
      }
    } else if (simulateTransaction.data?.[0]?.vm_status) {
      const status = simulateTransaction.data[0].vm_status;

      const statusMessage = status.substring(status.lastIndexOf(':') + 1);

      setErrorMessage(statusMessage);
    } else {
      elseError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateTransaction.data]);

  useEffect(() => {
    void generateTransaction.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasMode]);

  return (
    <Container>
      <Header network={currentAptosNetwork} origin={origin} />
      <ContentContainer>
        <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
          <Tab label="Detail" />
          <Tab label="Data" />
        </Tabs>
        <StyledTabPanel value={tabValue} index={0}>
          <TxMessage payload={params[0]} />
          <FeeContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">{t('pages.Popup.Aptos.Transaction.entry.maxFee')}</Typography>
                {isLoadingFee && <StyledCircularProgress size="1.8rem" />}
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {currentDisplayMaxFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{coinInfo?.data.symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {currentDisplayMaxFeeValue}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
            <FeeEditContainer>
              <FeeEditLeftContainer />
              <FeeEditRightContainer>
                <FeeButton type="button" onClick={() => setGasMode('low')} data-is-active={gasMode === 'low' ? 1 : 0}>
                  <Typography variant="h7">{t('pages.Popup.Aptos.Transaction.entry.low')}</Typography>
                </FeeButton>
                <FeeButton type="button" onClick={() => setGasMode('average')} data-is-active={gasMode === 'average' ? 1 : 0}>
                  <Typography variant="h7">{t('pages.Popup.Aptos.Transaction.entry.average')}</Typography>
                </FeeButton>
                <FeeButton type="button" onClick={() => setGasMode('high')} data-is-active={gasMode === 'high' ? 1 : 0}>
                  <Typography variant="h7">{t('pages.Popup.Aptos.Transaction.entry.high')}</Typography>
                </FeeButton>
              </FeeEditRightContainer>
            </FeeEditContainer>
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx payload={params[0]} />
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
            {t('pages.Popup.Aptos.Transaction.entry.cancelButton')}
          </OutlineButton>
          <Tooltip title={errorMessage} varient="error" placement="top">
            <div>
              <Button
                disabled={(typeof maxGas !== 'undefined' && maxGas !== maxGasAmount) || isLoadingFee || !!errorMessage}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

                    if (generateTransaction.data) {
                      const signedTx = await aptosClient.signTransaction(aptosAccount, generateTransaction.data);

                      if (method === 'aptos_signTransaction') {
                        const result: AptosSignTransactionResponse = `0x${Buffer.from(signedTx).toString('hex')}`;

                        responseToWeb({
                          response: {
                            result,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        await deQueue();
                      }

                      if (method === 'aptos_signAndSubmitTransaction') {
                        const result: AptosSignAndSubmitTransactionResponse = await aptosClient.submitTransaction(signedTx);

                        responseToWeb({
                          response: {
                            result,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        if (channel === 'inApp' && result.hash) {
                          await deQueue(`/popup/tx-receipt/${result.hash}` as unknown as Path);
                        } else {
                          await deQueue();
                        }
                      }
                    }
                  } catch {
                    enqueueSnackbar('Unknown Error', { variant: 'error' });
                  } finally {
                    setIsProgress(false);
                  }
                }}
              >
                {t('pages.Popup.Aptos.Transaction.entry.signButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
