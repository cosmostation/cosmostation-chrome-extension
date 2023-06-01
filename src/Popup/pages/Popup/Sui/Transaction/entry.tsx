import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { SUI_COIN } from '~/constants/sui';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useDryRunTransactionBlockSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionBlockSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Sui/components/Header';
import { gt, minus, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { SuiSignAndExecuteTransactionBlock } from '~/types/message/sui';

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
  queue: Queue<SuiSignAndExecuteTransactionBlock>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = SUI;

  const { message, messageId, origin } = queue;
  const { params } = message;

  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = chromeStorage;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { coinGeckoId } = currentSuiNetwork;

  const price = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0;

  const { deQueue } = useCurrentQueue();

  const [errorMessage, setErrorMessage] = useState('');

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const [isProgress, setIsProgress] = useState(false);

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const provider = useMemo(
    () =>
      new JsonRpcProvider(
        new Connection({
          fullnode: currentSuiNetwork.rpcURL,
        }),
      ),
    [currentSuiNetwork.rpcURL],
  );

  const keypair = useMemo(() => Ed25519Keypair.fromSecretKey(keyPair!.privateKey!), [keyPair]);

  const rawSigner = useMemo(() => new RawSigner(keypair, provider), [keypair, provider]);

  const transactionBlock = useMemo(() => TransactionBlock.from(params[0].transactionBlockSerialized), [params]);

  const transactionBlockInput = useMemo(
    () => ({
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
      ...params[0],
      transactionBlockSerialized: undefined,
      transactionBlock,
    }),
    [params, transactionBlock],
  );
  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionBlockSWR({ rawSigner, transactionBlock });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const decimals = useMemo(
    () => coinMetadata?.result?.decimals || currentSuiNetwork.decimals || 0,
    [coinMetadata?.result?.decimals, currentSuiNetwork.decimals],
  );

  const symbol = useMemo(() => coinMetadata?.result?.symbol || 'SUI', [coinMetadata?.result?.symbol]);

  const expectedBaseFee = useMemo(() => {
    if (dryRunTransaction?.result?.effects.gasUsed) {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      return String(cost);
    }

    return '0';
  }, [dryRunTransaction?.result?.effects.gasUsed]);

  const expectedDisplayFee = useMemo(() => toDisplayDenomAmount(expectedBaseFee, decimals), [decimals, expectedBaseFee]);

  const expectedDisplayFeePrice = useMemo(() => times(expectedDisplayFee, price), [expectedDisplayFee, price]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const baseBudgetFee = useMemo(() => transactionBlock.blockData?.gasConfig?.budget || 0, [transactionBlock.blockData?.gasConfig?.budget]);

  const displayBudgetFee = useMemo(() => toDisplayDenomAmount(baseBudgetFee, decimals), [baseBudgetFee, decimals]);

  const displayBudgetFeePrice = useMemo(() => times(displayBudgetFee, price), [displayBudgetFee, price]);

  const isDiabled = useMemo(() => !(dryRunTransaction?.result?.effects.status.status === 'success'), [dryRunTransaction?.result?.effects.status.status]);

  useEffect(() => {
    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      setErrorMessage(dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim());
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      setErrorMessage(dryRunTransaction?.result.effects.status.error);
    }

    if (dryRunTransaction === null) {
      setErrorMessage('Unknown Error');
    }

    if (dryRunTransaction?.result?.effects.status.status === 'success') {
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
          <TxMessage transactionBlock={transactionBlock} />
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
                      {expectedDisplayFeePrice}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
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
                      {displayBudgetFeePrice}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx transactionBlock={transactionBlock} />
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
                  const response = await rawSigner.signAndExecuteTransactionBlock(transactionBlockInput);

                  responseToWeb({
                    response: {
                      result: response,
                    },
                    message,
                    messageId,
                    origin,
                  });
                  // }

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
      <LedgerToTab />
    </Container>
  );
}
