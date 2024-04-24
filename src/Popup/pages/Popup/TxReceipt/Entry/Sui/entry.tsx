import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
import { TRANSACTION_RESULT } from '~/constants/sui';
import { TX_CONFIRMED_STATUS } from '~/constants/txConfirmedStatus';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/sui/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, minus, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertToLocales } from '~/Popup/utils/common';

import {
  BottomContainer,
  CategoryTitleContainer,
  Container,
  ContentContainer,
  DenomContainer,
  Div,
  EmptyAssetContainer,
  FeeItemContainer,
  HeaderContainer,
  HeaderTitle,
  IconButtonContainer,
  IconContainer,
  ImageTextContainer,
  ItemColumnContainer,
  ItemContainer,
  ItemTitleContainer,
  NetworkImageContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightValueContainer,
  StyledDivider,
  StyledDividerContainer,
  StyledIconButton,
  TxHashContainer,
} from './styled';
import CopyButton from '../components/CopyButton';

import Check16Icon from '~/images/icons/Check16.svg';
import Close16Icon from '~/images/icons/Close16.svg';
import Copy16Icon from '~/images/icons/Copy16.svg';
import Explorer16Icon from '~/images/icons/Explorer16.svg';
import Warning50Icon from '~/images/icons/Warning50.svg';

type SuiProps = {
  txDigest: string;
};

export default function Sui({ txDigest }: SuiProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { networkName, imageURL, explorerURL, coinGeckoId, decimals, displayDenom } = currentSuiNetwork;
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency, language } = extensionStorage;

  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const txInfo = useTxInfoSWR({ digest: txDigest, network: currentSuiNetwork });

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/tx/${txDigest}` : ''), [explorerURL, txDigest]);

  const formattedTimestamp = useMemo(() => {
    if (txInfo.data?.result?.timestampMs) {
      const date = new Date(Number(txInfo.data.result.timestampMs));

      return date.toLocaleString(convertToLocales(language));
    }
    return undefined;
  }, [language, txInfo.data?.result?.timestampMs]);

  const baseFeeAmount = useMemo(() => {
    if (txInfo.data?.result?.effects?.gasUsed) {
      const storageCost = minus(txInfo.data.result.effects.gasUsed.storageCost, txInfo.data.result.effects.gasUsed.storageRebate);

      const cost = plus(txInfo.data.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      return String(cost);
    }

    return '0';
  }, [txInfo.data?.result?.effects?.gasUsed]);

  const displayFeeAmount = useMemo(() => toDisplayDenomAmount(baseFeeAmount, decimals), [baseFeeAmount, decimals]);

  const displayFeeValue = useMemo(() => times(displayFeeAmount, price, 3), [displayFeeAmount, price]);

  const txConfirmedStatus = useMemo(() => {
    if (txInfo.error?.message === TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING) return TX_CONFIRMED_STATUS.PENDING;

    if (txInfo.data?.result?.effects?.status.status) {
      if (txInfo.data.result.effects.status.status === TRANSACTION_RESULT.FAILURE) return TX_CONFIRMED_STATUS.FAILED;

      if (txInfo.data.result.effects.status.status === TRANSACTION_RESULT.SUCCESS) return TX_CONFIRMED_STATUS.CONFIRMED;
    }

    return undefined;
  }, [txInfo.data, txInfo.error]);

  const isLoading = useMemo(() => txInfo.isValidating, [txInfo.isValidating]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h3">{t('pages.Popup.TxReceipt.Entry.Sui.entry.transactionReceipt')}</Typography>
      </HeaderContainer>

      <ContentContainer>
        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Sui.entry.status')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.network')}</Typography>
          </ItemTitleContainer>

          <ImageTextContainer>
            <NetworkImageContainer>
              <Image src={imageURL} defaultImgSrc={unknownChainImg} />
            </NetworkImageContainer>

            <Typography variant="h5">{networkName}</Typography>
          </ImageTextContainer>
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.digest')}</Typography>
            <CopyButton text={txDigest} />
          </ItemTitleContainer>
          <TxHashContainer>
            <Typography variant="h5">{txDigest}</Typography>
          </TxHashContainer>
        </ItemColumnContainer>

        {txDetailExplorerURL && (
          <ItemContainer>
            <ItemTitleContainer>
              <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.explorer')}</Typography>
            </ItemTitleContainer>

            <IconButtonContainer>
              <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
                <Explorer16Icon />
              </StyledIconButton>
              <StyledIconButton
                onClick={() => {
                  if (copy(txDetailExplorerURL)) {
                    enqueueSnackbar(t('pages.Popup.TxReceipt.Entry.Sui.entry.copied'));
                  }
                }}
              >
                <Copy16Icon />
              </StyledIconButton>
            </IconButtonContainer>
          </ItemContainer>
        )}

        <StyledDividerContainer>
          <StyledDivider />
        </StyledDividerContainer>

        {(txInfo.error && !txConfirmedStatus) || txInfo.hasTimedOut ? (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={Warning50Icon}
              headerText={t('pages.Popup.TxReceipt.Entry.Sui.entry.networkError')}
              subHeaderText={t('pages.Popup.TxReceipt.Entry.Sui.entry.networkErrorDescription')}
            />
          </EmptyAssetContainer>
        ) : (
          <>
            <CategoryTitleContainer>
              <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Sui.entry.information')}</Typography>
            </CategoryTitleContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.transactionConfirmed')}</Typography>
              </ItemTitleContainer>

              <ImageTextContainer>
                {isLoading ? (
                  <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.pending')}</Typography>
                ) : txConfirmedStatus ? (
                  txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                    <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.pending')}</Typography>
                  ) : (
                    <>
                      <IconContainer data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? <Check16Icon /> : <Close16Icon />}
                      </IconContainer>

                      <HeaderTitle data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.success')}</Typography>
                        ) : (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.failure')}</Typography>
                        )}
                      </HeaderTitle>
                    </>
                  )
                ) : (
                  <Typography variant="h5">-</Typography>
                )}
              </ImageTextContainer>
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.epoch')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : txInfo.data?.result?.effects?.executedEpoch ? (
                <NumberText typoOfIntegers="h5n">{txInfo.data.result.effects.executedEpoch}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.checkPoint')}</Typography>
              </ItemTitleContainer>
              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : txInfo.data?.result?.checkpoint ? (
                <NumberText typoOfIntegers="h5n">{txInfo.data.result.checkpoint}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.date')}</Typography>
              </ItemTitleContainer>
              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : formattedTimestamp ? (
                <Typography variant="h5">{formattedTimestamp}</Typography>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <FeeItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Sui.entry.fee')}</Typography>
              </ItemTitleContainer>

              <RightColumnContainer>
                {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                  <Skeleton width="4rem" height="1.5rem" />
                ) : gt(displayFeeAmount, '0') ? (
                  <Div>
                    <RightAmountContainer>
                      <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                        {displayFeeAmount}
                      </NumberText>
                      &nbsp;
                      <DenomContainer>
                        <Typography variant="h5">{displayDenom}</Typography>
                      </DenomContainer>
                    </RightAmountContainer>
                    <RightValueContainer>
                      <Typography variant="h5">{gt(displayFeeValue, '0.001') ? '' : '<'}</Typography>
                      &nbsp;
                      <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                        {displayFeeValue}
                      </NumberText>
                    </RightValueContainer>
                  </Div>
                ) : (
                  <Typography variant="h5">-</Typography>
                )}
              </RightColumnContainer>
            </FeeItemContainer>
          </>
        )}
      </ContentContainer>

      <BottomContainer>
        <Button
          onClick={() => {
            navigate('/');
          }}
        >
          {t('pages.Popup.TxReceipt.Entry.Sui.entry.confirm')}
        </Button>
      </BottomContainer>
    </Container>
  );
}
