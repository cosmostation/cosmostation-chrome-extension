import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
import { TRANSACTION_RESULT } from '~/constants/ethereum';
import { TX_CONFIRMED_STATUS } from '~/constants/txConfirmedStatus';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import customBeltImg from '~/images/etc/customBelt.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useBlockExplorerURLSWR } from '~/Popup/hooks/SWR/ethereum/useBlockExplorerURLSWR';
import { useBlockInfoByHashSWR } from '~/Popup/hooks/SWR/ethereum/useBlockInfoByHashSWR';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/ethereum/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertToLocales } from '~/Popup/utils/common';

import {
  AbsoluteImageContainer,
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

type EthereumProps = {
  txHash: string;
};

export default function Ethereum({ txHash }: EthereumProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const { currentEthereumNetwork, additionalEthereumNetworks } = useCurrentEthereumNetwork();
  const { imageURL, networkName, decimals, coinGeckoId, displayDenom, id } = currentEthereumNetwork;

  const { getExplorerTxDetailURL } = useBlockExplorerURLSWR(currentEthereumNetwork);

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency, language } = extensionStorage;

  const isCustom = useMemo(() => additionalEthereumNetworks.some((item) => item.id === id), [additionalEthereumNetworks, id]);

  const txInfo = useTxInfoSWR(txHash);

  const blockHash = useMemo(() => txInfo.data?.result?.blockHash, [txInfo.data?.result?.blockHash]);

  const blockInfo = useBlockInfoByHashSWR(blockHash);

  const txDetailExplorerURL = useMemo(() => getExplorerTxDetailURL(txHash), [getExplorerTxDetailURL, txHash]);

  const txConfirmedStatus = useMemo(() => {
    if (txInfo.error?.message === TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING) return TX_CONFIRMED_STATUS.PENDING;

    if (txInfo.data?.result?.status) {
      if (BigInt(txInfo.data.result.status).toString(10) !== TRANSACTION_RESULT.SUCCESS) return TX_CONFIRMED_STATUS.FAILED;

      if (BigInt(txInfo.data.result.status).toString(10) === TRANSACTION_RESULT.SUCCESS) return TX_CONFIRMED_STATUS.CONFIRMED;
    }

    return undefined;
  }, [txInfo.data, txInfo.error]);

  const formattedTimestamp = useMemo(() => {
    if (blockInfo.data?.result?.timestamp) {
      const timeStamp = Number(times(BigInt(blockInfo.data.result.timestamp).toString(10), '1000'));

      const date = new Date(timeStamp);

      return date.toLocaleString(convertToLocales(language));
    }
    return undefined;
  }, [blockInfo.data?.result?.timestamp, language]);

  const blockNumber = useMemo(
    () => (txInfo.data?.result?.blockNumber ? BigInt(txInfo.data.result.blockNumber).toString(10) : undefined),
    [txInfo.data?.result?.blockNumber],
  );

  const baseEffectiveGasPrice = useMemo(() => BigInt(txInfo.data?.result?.effectiveGasPrice || '0').toString(10), [txInfo.data?.result?.effectiveGasPrice]);

  const displayEffectiveGasPrice = useMemo(
    () => toDisplayDenomAmount(BigInt(txInfo.data?.result?.effectiveGasPrice || '0').toString(10), decimals),

    [decimals, txInfo.data?.result?.effectiveGasPrice],
  );

  const effectiveGasPriceValue = useMemo(
    () => times(displayEffectiveGasPrice, coinGeckoId ? coinGeckoPrice.data?.[coinGeckoId]?.[currency] || 0 : 0, 2),

    [coinGeckoId, coinGeckoPrice.data, currency, displayEffectiveGasPrice],
  );

  const baseGasUsed = useMemo(() => BigInt(txInfo.data?.result?.gasUsed || '0').toString(10), [txInfo.data?.result?.gasUsed]);

  const displayFeeAmount = useMemo(
    () => toDisplayDenomAmount(times(baseEffectiveGasPrice, baseGasUsed), decimals),
    [decimals, baseEffectiveGasPrice, baseGasUsed],
  );

  const displayFeeValue = useMemo(
    () => times(displayFeeAmount, coinGeckoId ? coinGeckoPrice.data?.[coinGeckoId]?.[currency] || 0 : 0, 3),
    [coinGeckoId, coinGeckoPrice.data, currency, displayFeeAmount],
  );

  const isLoading = useMemo(() => txInfo.isValidating || blockInfo.isValidating, [blockInfo.isValidating, txInfo.isValidating]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h3">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.transactionReceipt')}</Typography>
      </HeaderContainer>

      <ContentContainer>
        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.status')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.network')}</Typography>
          </ItemTitleContainer>

          <ImageTextContainer>
            <NetworkImageContainer>
              <AbsoluteImageContainer data-is-custom={isCustom && !!imageURL}>
                <Image src={imageURL} defaultImgSrc={unknownChainImg} />
              </AbsoluteImageContainer>
              {isCustom && (
                <AbsoluteImageContainer data-is-custom={isCustom && !!imageURL}>
                  <Image src={customBeltImg} />
                </AbsoluteImageContainer>
              )}
            </NetworkImageContainer>

            <Typography variant="h5">{networkName}</Typography>
          </ImageTextContainer>
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.txHash')}</Typography>
            <CopyButton text={txHash} />
          </ItemTitleContainer>
          <TxHashContainer>
            <Typography variant="h5">{txHash}</Typography>
          </TxHashContainer>
        </ItemColumnContainer>
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.explorer')}</Typography>
          </ItemTitleContainer>

          {txDetailExplorerURL && (
            <IconButtonContainer>
              <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
                <Explorer16Icon />
              </StyledIconButton>
              <StyledIconButton
                onClick={() => {
                  if (copy(txDetailExplorerURL)) {
                    enqueueSnackbar(t('pages.Popup.TxReceipt.Entry.Ethereum.entry.copied'));
                  }
                }}
              >
                <Copy16Icon />
              </StyledIconButton>
            </IconButtonContainer>
          )}
        </ItemContainer>

        <StyledDividerContainer>
          <StyledDivider />
        </StyledDividerContainer>

        {(txInfo.error && !txConfirmedStatus) || txInfo.hasTimedOut || blockInfo.hasTimedOut ? (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={Warning50Icon}
              headerText={t('pages.Popup.TxReceipt.Entry.Ethereum.entry.networkError')}
              subHeaderText={t('pages.Popup.TxReceipt.Entry.Ethereum.entry.networkErrorDescription')}
            />
          </EmptyAssetContainer>
        ) : (
          <>
            <CategoryTitleContainer>
              <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.information')}</Typography>
            </CategoryTitleContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.transactionConfirmed')}</Typography>
              </ItemTitleContainer>

              <ImageTextContainer>
                {isLoading ? (
                  <Skeleton width="4rem" height="1.5rem" />
                ) : txConfirmedStatus ? (
                  txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                    <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.pending')}</Typography>
                  ) : (
                    <>
                      <IconContainer data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? <Check16Icon /> : <Close16Icon />}
                      </IconContainer>

                      <HeaderTitle data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.success')}</Typography>
                        ) : (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.failure')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.blockNumber')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : blockNumber ? (
                <NumberText typoOfIntegers="h5n">{blockNumber}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.date')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.effectiveGasPrice')}</Typography>
              </ItemTitleContainer>

              <RightColumnContainer>
                {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                  <Skeleton width="4rem" height="1.5rem" />
                ) : gt(displayEffectiveGasPrice, '0') ? (
                  <Div>
                    <RightAmountContainer>
                      <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                        {displayEffectiveGasPrice}
                      </NumberText>
                      &nbsp;
                      <DenomContainer>
                        <Typography variant="h5">{displayDenom}</Typography>
                      </DenomContainer>
                    </RightAmountContainer>
                    <RightValueContainer>
                      <Typography variant="h5">
                        {gt(times(displayEffectiveGasPrice, coinGeckoId ? coinGeckoPrice.data?.[coinGeckoId]?.[currency] || 0 : 0, 2), '0.001') ? '' : '<'}
                      </Typography>
                      &nbsp;
                      <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                        {effectiveGasPriceValue}
                      </NumberText>
                    </RightValueContainer>
                  </Div>
                ) : (
                  <Typography variant="h5">-</Typography>
                )}
              </RightColumnContainer>
            </FeeItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.gas')}</Typography>{' '}
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : gt(baseGasUsed, '0') ? (
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {baseGasUsed}
                </NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <FeeItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.fee')}</Typography>
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
          {t('pages.Popup.TxReceipt.Entry.Ethereum.entry.confirm')}
        </Button>
      </BottomContainer>
    </Container>
  );
}
