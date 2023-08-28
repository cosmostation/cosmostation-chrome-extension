import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useBlockInfoByHashSWR } from '~/Popup/hooks/SWR/ethereum/useBlockInfoByHashSWR';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/ethereum/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';

import {
  BottomContainer,
  CategoryTitleContainer,
  CheckIconContainer,
  Container,
  ContentContainer,
  DenomContainer,
  Div,
  FeeItemContainer,
  HeaderContainer,
  HeaderTitle,
  IconButtonContainer,
  ImageTextContainer,
  ItemColumnContainer,
  ItemContainer,
  ItemTitleContainer,
  NetworkImageContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightValueContainer,
  StyledDivider,
  StyledIconButton,
  TxHashContainer,
} from './styled';
import CopyButton from '../components/CopyButton';

import Check16Icon from '~/images/icons/Check16.svg';
import Copy16Icon from '~/images/icons/Copy16.svg';
import Explorer16Icon from '~/images/icons/Explorer16.svg';

export default function Ethereum() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { imageURL, explorerURL, networkName, decimals, coinGeckoId, displayDenom } = currentEthereumNetwork;

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency } = extensionStorage;

  const params = useParams();

  const txHash = useMemo(() => params.id || '', [params.id]);

  const txInfo = useTxInfoSWR(txHash);

  const blockHash = useMemo(() => txInfo.data?.result?.blockHash, [txInfo.data?.result?.blockHash]);

  const blockInfo = useBlockInfoByHashSWR(blockHash);

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/tx/${txHash}` : ''), [explorerURL, txHash]);

  const parsedTxDate = useMemo(() => {
    if (blockInfo.data?.result?.timestamp) {
      const timeStamp = Number(times(BigInt(blockInfo.data.result.timestamp || '0').toString(10), '1000'));

      const date = new Date(timeStamp);

      return date.toLocaleString();
    }
    return undefined;
  }, [blockInfo.data?.result?.timestamp]);

  const blockNumber = useMemo(() => BigInt(txInfo.data?.result?.blockNumber || '0').toString(10), [txInfo.data?.result?.blockNumber]);

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
    () => times(displayFeeAmount, coinGeckoId ? coinGeckoPrice.data?.[coinGeckoId]?.[currency] || 0 : 0, 2),
    [coinGeckoId, coinGeckoPrice.data, currency, displayFeeAmount],
  );

  const isLoading = useMemo(
    () => txInfo.error || txInfo.data?.error?.message === 'No result' || txInfo.isValidating || blockInfo.isValidating,
    [blockInfo.isValidating, txInfo.data?.error, txInfo.error, txInfo.isValidating],
  );

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
              <Image src={imageURL} />
            </NetworkImageContainer>

            <Typography variant="h5">{networkName}</Typography>
          </ImageTextContainer>
        </ItemContainer>
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.broadcastResult')}</Typography>
          </ItemTitleContainer>

          <ImageTextContainer>
            <CheckIconContainer>
              <Check16Icon />
            </CheckIconContainer>

            <HeaderTitle>
              <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.success')}</Typography>
            </HeaderTitle>
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

        <Div sx={{ width: '100%' }}>
          <StyledDivider />
        </Div>

        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.information')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.date')}</Typography>
          </ItemTitleContainer>
          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : parsedTxDate ? (
            <Typography variant="h5">{parsedTxDate}</Typography>
          ) : (
            <Typography variant="h5">-</Typography>
          )}
        </ItemContainer>

        <FeeItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.effectiveGasPrice')}</Typography>
          </ItemTitleContainer>

          <RightColumnContainer>
            {isLoading ? (
              <Skeleton width="4rem" height="1.5rem" />
            ) : displayEffectiveGasPrice ? (
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
                    {gt(times(displayEffectiveGasPrice, coinGeckoId ? coinGeckoPrice.data?.[coinGeckoId]?.[currency] || 0 : 0, 2), '0.0001') ? '' : '<'}
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

          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : gt(baseGasUsed, '0') ? (
            <div>
              <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                {baseGasUsed}
              </NumberText>
            </div>
          ) : (
            <Typography variant="h5">-</Typography>
          )}
        </ItemContainer>

        <FeeItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.fees')}</Typography>
          </ItemTitleContainer>

          <RightColumnContainer>
            {isLoading ? (
              <Skeleton width="4rem" height="1.5rem" />
            ) : displayFeeAmount ? (
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
                  <Typography variant="h5">{gt(displayFeeValue, '0.0001') ? '' : '<'}</Typography>
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

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Ethereum.entry.blockNumber')}</Typography>
          </ItemTitleContainer>

          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : blockNumber ? (
            <NumberText typoOfIntegers="h5n">{blockNumber}</NumberText>
          ) : (
            <Typography variant="h5">-</Typography>
          )}
        </ItemContainer>
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
