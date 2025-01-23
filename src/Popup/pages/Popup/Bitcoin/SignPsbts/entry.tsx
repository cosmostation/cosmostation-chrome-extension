import { useCallback, useMemo, useState } from 'react';
import validate from 'bitcoin-address-validation';
import { networks, Psbt } from 'bitcoinjs-lib';
import { isTaprootInput } from 'bitcoinjs-lib/src/psbt/bip371';
import { ECPairFactory } from 'ecpair';
import { useSnackbar } from 'notistack';
import * as ecc from '@bitcoinerlab/secp256k1';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gte, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { decodedPsbt, formatPsbtHex } from '~/Popup/utils/bitcoin';
import { getKeyPair } from '~/Popup/utils/common';
import { getTweakSigner } from '~/Popup/utils/crypto';
import { responseToWeb } from '~/Popup/utils/message';
import { shorterAddress } from '~/Popup/utils/string';
import type { Queue } from '~/types/extensionStorage';
import type { BitSignPsbts, BitSignPsbtsResposne } from '~/types/message/bitcoin';

import Pagination from './components/Pagination';
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
  PaginationContainer,
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
  queue: Queue<BitSignPsbts>;
};

export default function Entry({ queue }: EntryProps) {
  const { message, messageId, origin } = queue;
  const { params } = message;

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = extensionStorage;
  const { setLoadingLedgerSigning } = useLoading();

  const [txMsgPage, setTxMsgPage] = useState(1);

  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const balance = useBalanceSWR(currentBitcoinNetwork);

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

  const psbtHexes = params;

  const parsedPsbts = useMemo(
    () =>
      psbtHexes.map((psbtHex) => {
        const formattedPsbtHex = formatPsbtHex(psbtHex);
        const psbt = Psbt.fromHex(formattedPsbtHex, {
          network,
        });

        return psbt;
      }),
    [network, psbtHexes],
  );

  const keyPair = useMemo(() => getKeyPair(currentAccount, currentBitcoinNetwork, currentPassword), [currentAccount, currentBitcoinNetwork, currentPassword]);

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const decodedPsbtDatas = useMemo(
    () =>
      parsedPsbts.map((parsedPsbt) =>
        decodedPsbt({
          psbt: parsedPsbt,
          psbtNetwork: network,
        }),
      ),
    [network, parsedPsbts],
  );

  const canSend = useMemo(() => {
    const totalOutputAmount = decodedPsbtDatas.reduce(
      (acc, item) =>
        plus(
          acc,
          item.outputInfos.reduce((acc2, item2) => plus(acc2, item2.value), '0'),
        ),
      '0',
    );
    const totalEstimatedFee = decodedPsbtDatas.reduce((acc, item) => plus(acc, item.fee), '0');

    return gte(availableAmount, plus(totalOutputAmount, totalEstimatedFee));
  }, [availableAmount, decodedPsbtDatas]);

  const currentPsbt = decodedPsbtDatas[txMsgPage - 1];

  const errorMessage = useMemo(() => {
    if (decodedPsbtDatas.some((psbt) => psbt.outputInfos.some((item) => !validate(item.address)))) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.invalidAddress');
    }

    if (availableAmount === 0 || !canSend) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.noAvailableAmount');
    }

    if (decodedPsbtDatas.length === 0) {
      return t('pages.Popup.Bitcoin.SignPsbt.entry.failedCreateTxHex');
    }

    return '';
  }, [availableAmount, canSend, decodedPsbtDatas, t]);

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
                {currentPsbt.inputInfos.map((item) => {
                  const displayValue = toDisplayDenomAmount(item.value || '0', decimals);

                  return (
                    <InOutputContainer key={`${item.address}-${item.value || '0'}`}>
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
                {currentPsbt.outputInfos.map((item) => {
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
          {decodedPsbtDatas.length > 1 && (
            <PaginationContainer>
              <Pagination currentPage={txMsgPage} totalPage={decodedPsbtDatas.length} onChange={(page) => setTxMsgPage(page)} />
            </PaginationContainer>
          )}
          <FeeContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">Tx</Typography>
                &nbsp;
                <Typography variant="h5">{`# ${txMsgPage}`}</Typography>
                &nbsp;&nbsp;
                <Typography variant="h5">{t('pages.Popup.Bitcoin.SignPsbt.entry.expectedFee')}</Typography>
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {toDisplayDenomAmount(currentPsbt.fee, decimals)}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {times(toDisplayDenomAmount(currentPsbt.fee, decimals), price)}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx txHex={psbtHexes[txMsgPage - 1] || ''} />
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

                    const ECPair = ECPairFactory(ecc);

                    const signer = ECPair.fromPrivateKey(keyPair.privateKey, {
                      network,
                    });

                    const tweakSigner = getTweakSigner(currentAccount, currentBitcoinNetwork, currentPassword, {
                      tweakHash: null,
                      network: currentBitcoinNetwork.isSignet ? 'testnet' : 'mainnet',
                    });

                    const responses: BitSignPsbtsResposne = parsedPsbts.map((parsedPsbt) => {
                      parsedPsbt.data.inputs.forEach((input, index) => {
                        if (isTaprootInput(input)) {
                          if (input.tapLeafScript && input.tapLeafScript?.length > 0 && !input.tapMerkleRoot) {
                            parsedPsbt.signInput(index, signer);
                          } else {
                            parsedPsbt.signInput(index, tweakSigner!);
                          }
                        } else {
                          parsedPsbt.signInput(index, signer);
                        }
                      });

                      const txHex = parsedPsbt.finalizeAllInputs().toHex();

                      if (!txHex) {
                        throw new Error('Failed to sign transaction');
                      }

                      return txHex;
                    });
                    responseToWeb({
                      response: {
                        result: responses,
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
