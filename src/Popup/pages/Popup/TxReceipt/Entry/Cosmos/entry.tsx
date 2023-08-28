import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import YAML from 'js-yaml';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/cosmos/useTxInfoSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

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

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currency } = extensionStorage;

  const params = useParams();

  const txHash = useMemo(() => params.id || '', [params.id]);

  const txInfo = useTxInfoSWR(chain, txHash);

  const explorerURL = useMemo(() => chain.explorerURL, [chain.explorerURL]);

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/transactions/${txHash}` : ''), [explorerURL, txHash]);

  const parsedTxDate = useMemo(() => {
    if (txInfo.data?.timestamp) {
      const date = new Date(txInfo.data.timestamp);

      // NOTE 로케일 적용되는지 테스트 필요
      return date.toLocaleString();
    }
    return undefined;
  }, [txInfo.data?.timestamp]);

  const doc = useMemo(
    () => (txInfo.data?.tx ? YAML.dump({ type: txInfo.data.tx.type, value: txInfo.data.tx.value }, { indent: 4 }) : undefined),
    [txInfo.data?.tx],
  );

  const isLoading = useMemo(() => txInfo.error || txInfo.isValidating, [txInfo.error, txInfo.isValidating]);

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
              <Image src={chain.imageURL} />
            </NetworkImageContainer>

            <Typography variant="h5">{chain.chainName}</Typography>
          </ImageTextContainer>
        </ItemContainer>
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.broadcastResult')}</Typography>
          </ItemTitleContainer>

          <ImageTextContainer>
            <CheckIconContainer>
              <Check16Icon />
            </CheckIconContainer>

            <HeaderTitle>
              <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.success')}</Typography>
            </HeaderTitle>
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

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.explorer')}</Typography>
          </ItemTitleContainer>

          {txDetailExplorerURL && (
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
          )}
        </ItemContainer>

        <Div sx={{ width: '100%' }}>
          <StyledDivider />
        </Div>

        <CategoryTitleContainer>
          <Typography variant="h4">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.information')}</Typography>
        </CategoryTitleContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.date')}</Typography>
          </ItemTitleContainer>
          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : parsedTxDate ? (
            <Typography variant="h5">{parsedTxDate}</Typography>
          ) : (
            <Typography variant="h5">-</Typography>
          )}
        </ItemContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.gas')}</Typography>
          </ItemTitleContainer>

          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : txInfo.data?.gas_used && txInfo.data?.gas_wanted ? (
            <div>
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                {txInfo.data.gas_used}
              </Number>
              &nbsp;/&nbsp;
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                {txInfo.data.gas_wanted}
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
            {isLoading ? (
              <Skeleton width="4rem" height="1.5rem" />
            ) : txInfo.data?.tx?.value?.fee?.amount ? (
              txInfo.data.tx.value.fee.amount.map((item) => {
                const feeCoinInfo = COSMOS_CHAINS.find((chains) => chains.baseDenom === item.denom);
                const itemDisplayAmount = toDisplayDenomAmount(item.amount, feeCoinInfo?.decimals || 0);
                const itemDisplayDenom = feeCoinInfo?.displayDenom || item.denom;

                const chainPrice = feeCoinInfo?.coinGeckoId ? coinGeckoPrice.data?.[feeCoinInfo?.coinGeckoId]?.[currency] || 0 : 0;
                const itemDisplayValue = times(itemDisplayAmount, chainPrice, 2);
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
                      <Typography variant="h5">{gt(itemDisplayValue, '0.0001') ? '' : '<'}</Typography>
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

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.blockHeight')}</Typography>
          </ItemTitleContainer>

          {isLoading ? (
            <Skeleton width="4rem" height="1.5rem" />
          ) : txInfo.data?.height ? (
            <Number typoOfIntegers="h5n">{txInfo.data.height}</Number>
          ) : (
            <Typography variant="h5">-</Typography>
          )}
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Popup.TxReceipt.Entry.Cosmos.entry.tx')}</Typography>
          </ItemTitleContainer>
          <TxHashContainer>
            {isLoading ? (
              <Skeleton width="10rem" height="1.5rem" />
            ) : doc ? (
              <Typography variant="h5">{doc}</Typography>
            ) : (
              <Typography variant="h5">-</Typography>
            )}
          </TxHashContainer>
        </ItemColumnContainer>
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
