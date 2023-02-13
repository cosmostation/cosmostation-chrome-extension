import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { Base64DataBuffer, Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { SUI_COIN } from '~/constants/sui';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import LedgerToPopup from '~/Popup/components/Loading/LedgerToPopup';
import { useDryRunTransactionSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Sui/components/Header';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { SuiSignAndExecuteTransaction, SuiSignAndExecuteTransactionResponse } from '~/types/message/sui';

import Tx from './components/Tx';
import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  FeeContainer,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  StyledTabPanel,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<SuiSignAndExecuteTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = SUI;

  const { message, messageId, origin } = queue;
  const { params } = message;

  const { chromeStorage } = useChromeStorage();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = chromeStorage;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { deQueue } = useCurrentQueue();

  const [errorMessage, setErrorMessage] = useState('');

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const [isProgress, setIsProgress] = useState(false);

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const provider = useMemo(() => new JsonRpcProvider(currentSuiNetwork.rpcURL), [currentSuiNetwork.rpcURL]);

  const keypair = useMemo(() => Ed25519Keypair.fromSeed(keyPair!.privateKey!), [keyPair]);

  const rawSigner = useMemo(() => new RawSigner(keypair, provider), [keypair, provider]);

  const transaction = useMemo(() => {
    if (typeof params[0] === 'string') {
      return new Base64DataBuffer(params[0]);
    }

    return params[0];
  }, [params]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionSWR({ rawSigner, transaction });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const symbol = useMemo(() => coinMetadata?.result?.symbol || '', [coinMetadata?.result?.symbol]);

  const expectedBaseFee = useMemo(() => {
    if (dryRunTransaction?.gasUsed) {
      const storageCost = dryRunTransaction.gasUsed.storageCost - dryRunTransaction.gasUsed.storageRebate;

      const cost = dryRunTransaction.gasUsed.computationCost + (storageCost > 0 ? storageCost : 0);

      return String(cost);
    }

    return '0';
  }, [dryRunTransaction?.gasUsed]);

  const expectedDisplayFee = useMemo(() => toDisplayDenomAmount(expectedBaseFee, decimals), [decimals, expectedBaseFee]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const baseBudgetFee = useMemo(() => {
    if (typeof params[0] === 'string') {
      return 0;
    }

    return params[0].data.gasBudget || 0;
  }, [params]);

  const displayBudgetFee = useMemo(() => toDisplayDenomAmount(baseBudgetFee, decimals), [baseBudgetFee, decimals]);

  const isDiabled = useMemo(() => !(dryRunTransaction?.status.status === 'success'), [dryRunTransaction?.status.status]);

  useEffect(() => {
    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      setErrorMessage(dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim());
    }

    if (dryRunTransaction?.status.error) {
      setErrorMessage(dryRunTransaction.status.error);
    }

    if (dryRunTransaction === null) {
      setErrorMessage('Unknown Error');
    }

    if (dryRunTransaction?.status.status === 'success') {
      setErrorMessage('');
    }
  }, [dryRunTransaction, dryRunTransactionError?.message]);

  return (
    <Container>
      <Header network={currentSuiNetwork} origin={origin} />
      <ContentContainer>
        <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
          <Tab label="Detail" />
          <Tab label="Data" />
        </Tabs>
        <StyledTabPanel value={tabValue} index={0}>
          <TxMessage transaction={params[0]} />
          <FeeContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">{t('pages.Popup.Sui.Transaction.entry.expectedFee')}</Typography>
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {expectedDisplayFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      0
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
            {!(transaction instanceof Base64DataBuffer) && (
              <FeeInfoContainer>
                <FeeLeftContainer>
                  <Typography variant="h5">{t('pages.Popup.Sui.Transaction.entry.maxFee')}</Typography>
                </FeeLeftContainer>
                <FeeRightContainer>
                  <FeeRightColumnContainer>
                    <FeeRightAmountContainer>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                        {displayBudgetFee}
                      </Number>
                      &nbsp;
                      <Typography variant="h5n">{symbol}</Typography>
                    </FeeRightAmountContainer>
                    <FeeRightValueContainer>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                        0
                      </Number>
                    </FeeRightValueContainer>
                  </FeeRightColumnContainer>
                </FeeRightContainer>
              </FeeInfoContainer>
            )}
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx transaction={params[0]} />
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
            {t('pages.Popup.Sui.Transaction.entry.cancelButton')}
          </OutlineButton>
          {/* <Tooltip title={errorMessage} varient="error" placement="top"> */}
          <div>
            <Button
              disabled={isDiabled}
              isProgress={isProgress}
              onClick={async () => {
                try {
                  setIsProgress(true);
                  const response = await rawSigner.signAndExecuteTransaction(transaction);

                  if ('EffectsCert' in response) {
                    const result: SuiSignAndExecuteTransactionResponse = {
                      certificate: response.EffectsCert.certificate,
                      effects: response.EffectsCert.effects.effects as unknown as SuiSignAndExecuteTransactionResponse['effects'],
                    };

                    responseToWeb({
                      response: {
                        result,
                      },
                      message,
                      messageId,
                      origin,
                    });
                  } else if ('certificate' in response && 'effects' in response) {
                    const result: SuiSignAndExecuteTransactionResponse = {
                      certificate: response.certificate as unknown as SuiSignAndExecuteTransactionResponse['certificate'],
                      effects: response.effects.effects as unknown as SuiSignAndExecuteTransactionResponse['effects'],
                    };

                    responseToWeb({
                      response: {
                        result,
                      },
                      message,
                      messageId,
                      origin,
                    });
                  } else {
                    responseToWeb({
                      response: {
                        result: response,
                      },
                      message,
                      messageId,
                      origin,
                    });
                  }

                  if (queue.channel === 'inApp') {
                    enqueueSnackbar('success');
                  }

                  await deQueue();
                } catch (e) {
                  enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                } finally {
                  setIsProgress(false);
                }
              }}
            >
              {t('pages.Popup.Sui.Transaction.entry.signButton')}
            </Button>
          </div>
          {/* </Tooltip> */}
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToPopup />
    </Container>
  );
}
