import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
import { TX_CONFIRMED_STATUS } from '~/constants/txConfirmedStatus';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useBlockInfoByVersionSWR } from '~/Popup/hooks/SWR/aptos/useBlockInfoByVersionSWR';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/aptos/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { castTransactionType } from '~/Popup/utils/aptos';
import { fix, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
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

type AptosProps = {
  txHash: string;
};

export default function Aptos({ txHash }: AptosProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { data: aptosInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1' });
  const decimals = useMemo(() => aptosInfo?.data.decimals || 0, [aptosInfo?.data.decimals]);

  const assets = useAssetsSWR();
  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);
  const displayDenom = useMemo(() => asset?.symbol || aptosInfo?.data.symbol || '', [aptosInfo?.data.symbol, asset?.symbol]);

  const { networkName, imageURL, explorerURL, coinGeckoId } = currentAptosNetwork;
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency, language } = extensionStorage;

  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const txDetailExplorerURL = useMemo(
    () => (explorerURL ? `${explorerURL}/txn/${txHash}?network=${networkName.toLowerCase()}` : ''),
    [explorerURL, networkName, txHash],
  );

  const txInfo = useTxInfoSWR(txHash);

  const tx = useMemo(() => castTransactionType(txInfo.data ?? undefined), [txInfo.data]);

  const txVersionId = useMemo(() => {
    if (tx && tx.type !== 'pending_transaction') {
      return tx.version;
    }
    return '';
  }, [tx]);

  const blockInfo = useBlockInfoByVersionSWR(txVersionId);

  const blockHeight = useMemo(() => blockInfo.data?.block_height, [blockInfo.data?.block_height]);

  const formattedTimestamp = useMemo(() => {
    if (tx && tx.type !== 'pending_transaction') {
      const date = new Date(Number(tx.timestamp.slice(0, -3)));

      return date.toLocaleString(convertToLocales(language));
    }
    return undefined;
  }, [tx, language]);

  const formattedExpirationTimestamp = useMemo(() => {
    if (tx && tx.type !== 'pending_transaction') {
      const date = new Date(Number(times(tx.expiration_timestamp_secs, 1000)));

      return date.toLocaleString(convertToLocales(language));
    }
    return undefined;
  }, [tx, language]);

  const vmStatus = useMemo(() => {
    if (tx && tx.type !== 'pending_transaction') {
      return tx.vm_status;
    }
    return undefined;
  }, [tx]);

  const baseFeeAmount = useMemo(() => {
    if (tx && tx.type !== 'pending_transaction') {
      return times(tx.gas_unit_price, tx.gas_used);
    }

    return '0';
  }, [tx]);
  const displayFeeAmount = useMemo(() => String(parseFloat(fix(toDisplayDenomAmount(baseFeeAmount, decimals)))), [baseFeeAmount, decimals]);

  const displayFeeValue = useMemo(() => times(displayFeeAmount, price, 3), [displayFeeAmount, price]);

  const txConfirmedStatus = useMemo(() => {
    if (txInfo.error?.message === TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING) return TX_CONFIRMED_STATUS.PENDING;

    if (tx && tx.type !== 'pending_transaction') {
      return tx.success ? TX_CONFIRMED_STATUS.CONFIRMED : TX_CONFIRMED_STATUS.FAILED;
    }

    return undefined;
  }, [tx, txInfo.error?.message]);

  const isLoading = useMemo(() => txInfo.isValidating || blockInfo.isValidating, [blockInfo.isValidating, txInfo.isValidating]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h3">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.transactionReceipt')}</Typography>
      </HeaderContainer>

      <ContentContainer>
        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.status')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.network')}</Typography>
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
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.txHash')}</Typography>
            <CopyButton text={txHash} />
          </ItemTitleContainer>
          <TxHashContainer>
            <Typography variant="h5">{txHash}</Typography>
          </TxHashContainer>
        </ItemColumnContainer>

        {txDetailExplorerURL && (
          <ItemContainer>
            <ItemTitleContainer>
              <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.explorer')}</Typography>
            </ItemTitleContainer>

            <IconButtonContainer>
              <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
                <Explorer16Icon />
              </StyledIconButton>
              <StyledIconButton
                onClick={() => {
                  if (copy(txDetailExplorerURL)) {
                    enqueueSnackbar(t('pages.Popup.TxReceipt.Entry.Aptos.entry.copied'));
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

        {(txInfo.error && !txConfirmedStatus) || txInfo.hasTimedOut || blockInfo.hasTimedOut ? (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={Warning50Icon}
              headerText={t('pages.Popup.TxReceipt.Entry.Aptos.entry.networkError')}
              subHeaderText={t('pages.Popup.TxReceipt.Entry.Aptos.entry.networkErrorDescription')}
            />
          </EmptyAssetContainer>
        ) : (
          <>
            <CategoryTitleContainer>
              <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.information')}</Typography>
            </CategoryTitleContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.transactionConfirmed')}</Typography>
              </ItemTitleContainer>

              <ImageTextContainer>
                {isLoading ? (
                  <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.pending')}</Typography>
                ) : txConfirmedStatus ? (
                  txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                    <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.pending')}</Typography>
                  ) : (
                    <>
                      <IconContainer data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? <Check16Icon /> : <Close16Icon />}
                      </IconContainer>

                      <HeaderTitle data-is-success={txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED}>
                        {txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED ? (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.success')}</Typography>
                        ) : (
                          <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.failure')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.vmStatus')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : vmStatus ? (
                <NumberText typoOfIntegers="h5n">{vmStatus}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.version')}</Typography>
              </ItemTitleContainer>

              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : txVersionId ? (
                <NumberText typoOfIntegers="h5n">{txVersionId}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.blockHeight')}</Typography>
              </ItemTitleContainer>
              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : blockHeight ? (
                <NumberText typoOfIntegers="h5n">{blockHeight}</NumberText>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.expirationDate')}</Typography>
              </ItemTitleContainer>
              {isLoading || txConfirmedStatus === TX_CONFIRMED_STATUS.PENDING ? (
                <Skeleton width="4rem" height="1.5rem" />
              ) : formattedExpirationTimestamp ? (
                <Typography variant="h5">{formattedExpirationTimestamp}</Typography>
              ) : (
                <Typography variant="h5">-</Typography>
              )}
            </ItemContainer>

            <ItemContainer>
              <ItemTitleContainer>
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.date')}</Typography>
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
                <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Aptos.entry.fee')}</Typography>
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
          {t('pages.Popup.TxReceipt.Entry.Aptos.entry.confirm')}
        </Button>
      </BottomContainer>
    </Container>
  );
}
