import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { TX_CONFIRMED_STATUS } from '~/constants/txConfirmedStatus';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import customBeltImg from '~/images/etc/customBelt.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBlockExplorerURLSWR } from '~/Popup/hooks/SWR/cosmos/useBlockExplorerURLSWR';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/cosmos/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertToLocales } from '~/Popup/utils/common';
import type { CosmosChain } from '~/types/chain';

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

type CosmosProps = {
  chain: CosmosChain;
  txHash: string;
};

export default function Cosmos({ chain, txHash }: CosmosProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { getExplorerTxDetailURL, getExplorerBlockDetailURL } = useBlockExplorerURLSWR(chain);

  const { currentAdditionalChains } = useCurrentAdditionalChains();
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency, language } = extensionStorage;
  const assets = useAssetsSWR(chain);

  const isCustom = useMemo(() => currentAdditionalChains.some((item) => item.id === chain?.id), [chain?.id, currentAdditionalChains]);

  const txInfo = useTxInfoSWR(chain, txHash);

  const txDetailExplorerURL = useMemo(() => getExplorerTxDetailURL(txHash), [getExplorerTxDetailURL, txHash]);

  const blockDetailExplorerURL = useMemo(
    () => getExplorerBlockDetailURL(txInfo.data?.tx_response.height),
    [getExplorerBlockDetailURL, txInfo.data?.tx_response.height],
  );

  const formattedTimestamp = useMemo(() => {
    if (txInfo.data?.tx_response.timestamp) {
      const date = new Date(txInfo.data.tx_response.timestamp);

      return date.toLocaleString(convertToLocales(language));
    }
    return undefined;
  }, [txInfo.data?.tx_response.timestamp, language]);

  const txConfirmedStatus = useMemo(() => {
    if (txInfo.error?.response?.status && txInfo.error.response.status >= 400 && txInfo.error.response.status < 500) return TX_CONFIRMED_STATUS.PENDING;

    if (txInfo.data?.tx_response.code !== undefined) {
      if (txInfo.data.tx_response.code !== 0) return TX_CONFIRMED_STATUS.FAILED;

      if (txInfo.data.tx_response.code === 0) return TX_CONFIRMED_STATUS.CONFIRMED;
    }

    return undefined;
  }, [txInfo.data?.tx_response.code, txInfo.error?.response?.status]);

  const isLoading = useMemo(() => txInfo.isValidating, [txInfo.isValidating]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h3">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.transactionReceipt')}</Typography>
      </HeaderContainer>

      <ContentContainer>
        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.status')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.network')}</Typography>
          </ItemTitleContainer>

          <ImageTextContainer>
            <NetworkImageContainer>
              <AbsoluteImageContainer data-is-custom={isCustom && !!chain.imageURL}>
                <Image src={chain.imageURL} defaultImgSrc={unknownChainImg} />
              </AbsoluteImageContainer>
              {isCustom && (
                <AbsoluteImageContainer data-is-custom={isCustom && !!chain?.imageURL}>
                  <Image src={customBeltImg} />
                </AbsoluteImageContainer>
              )}
            </NetworkImageContainer>

            <Typography variant="h5">{chain.chainName}</Typography>
          </ImageTextContainer>
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.txHash')}</Typography>
            <CopyButton text={txHash} />
          </ItemTitleContainer>
          <TxHashContainer>
            <Typography variant="h5">{txHash}</Typography>
          </TxHashContainer>
        </ItemColumnContainer>

        {txDetailExplorerURL && (
          <ItemContainer>
            <ItemTitleContainer>
              <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.explorer')}</Typography>
            </ItemTitleContainer>

            <IconButtonContainer>
              <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
                <Explorer16Icon />
              </StyledIconButton>
              <StyledIconButton
                onClick={() => {
                  if (copy(txDetailExplorerURL)) {
                    enqueueSnackbar(t('pages.Popup.TxReceipt.Entry.Cosmos.entry.copied'));
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
              headerText={t('pages.Popup.TxReceipt.Entry.Cosmos.entry.networkError')}
              subHeaderText={t('pages.Popup.TxReceipt.Entry.Cosmos.entry.networkErrorDescription')}
            />
          </EmptyAssetContainer>
        ) : (
          <>
            <CategoryTitleContainer>
              <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.information')}</Typography>
            </CategoryTitleContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.transactionConfirmed')}</Typography>
              </ItemTitleContainer>

              <ImageTextContainer>
                {isLoading ? (
                  <Skeleton width="4rem" height="1.5rem" />
                ) : txConfirmedStatus ? (
                  txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                    <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.pending')}</Typography>
                  ) : (
                    <>
                      <IconContainer data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? <Check16Icon /> : <Close16Icon />}
                      </IconContainer>

                      <HeaderTitle data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.success')}</Typography>
                        ) : (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.failure')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.blockHeight')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : txInfo.data?.tx_response.height ? (
                <IconButtonContainer>
                  <Number typoOfIntegers="h5n">{txInfo.data.tx_response.height}</Number>
                  {blockDetailExplorerURL && (
                    <StyledIconButton onClick={() => window.open(blockDetailExplorerURL)}>
                      <Explorer16Icon />
                    </StyledIconButton>
                  )}
                </IconButtonContainer>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.date')}</Typography>
              </ItemTitleContainer>
              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : formattedTimestamp ? (
                <Typography variant="h5">{formattedTimestamp}</Typography>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.gas')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : txInfo.data?.tx_response.gas_used && txInfo.data.tx_response.gas_wanted ? (
                <div>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {txInfo.data.tx_response.gas_used}
                  </Number>
                  &nbsp;/&nbsp;
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {txInfo.data.tx_response.gas_wanted}
                  </Number>
                </div>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <FeeItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.fees')}</Typography>
              </ItemTitleContainer>

              <RightColumnContainer>
                {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                  <Skeleton width="4rem" height="1.5rem" />
                ) : txInfo.data?.tx.auth_info.fee.amount ? (
                  txInfo.data.tx.auth_info.fee.amount.map((item) => {
                    const feeCoinInfo = assets.data.find((asset) => asset.denom === item.denom);

                    const itemDisplayAmount = toDisplayDenomAmount(item.amount, feeCoinInfo?.decimals || 0);
                    const itemDisplayDenom = feeCoinInfo?.symbol || item.denom;

                    const chainPrice = feeCoinInfo?.coinGeckoId ? coinGeckoPrice.data?.[feeCoinInfo?.coinGeckoId]?.[currency] || 0 : 0;
                    const itemDisplayValue = times(itemDisplayAmount, chainPrice, 3);
                    return (
                      <Div key={item.amount + item.denom}>
                        <RightAmountContainer>
                          <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                            {itemDisplayAmount}
                          </Number>
                          &nbsp;
                          <DenomContainer>
                            <Typography variant="h5">{itemDisplayDenom}</Typography>
                          </DenomContainer>
                        </RightAmountContainer>
                        <RightValueContainer>
                          <Typography variant="h5">{gt(itemDisplayValue, '0.001') ? '' : '<'}</Typography>
                          &nbsp;
                          <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                            {itemDisplayValue}
                          </Number>
                        </RightValueContainer>
                      </Div>
                    );
                  })
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
          {t('pages.Popup.TxReceipt.Entry.Cosmos.entry.confirm')}
        </Button>
      </BottomContainer>
    </Container>
  );
}
