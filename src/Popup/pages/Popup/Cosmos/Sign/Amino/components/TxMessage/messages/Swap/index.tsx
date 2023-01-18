import { useMemo, useRef } from 'react';
import { Typography } from '@mui/material';

import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { Msg, MsgSwapExactAmountIn } from '~/types/cosmos/amino';

import {
  Container,
  ContentContainer,
  HeaderContainer,
  InputCoinContainer,
  InputCoinImageContainer,
  LabelContainer,
  OutputCoinContainer,
  OutputCoinImageContainer,
  PoolContainer,
  RoutesContainer,
  StyledDivider,
  SwapCoinContainer,
  SwapCoinImageContainer,
  SwapCoinInfoContainer,
  SwapCoinSubTitleContainer,
  SwapCoinTitleContainer,
  ValueContainer,
} from './styled';

type SwapProps = {
  msg: Msg<MsgSwapExactAmountIn>;
};

export default function Swap({ msg }: SwapProps) {
  const { t } = useTranslation();
  const currentChainAssets = useAssetsSWR(OSMOSIS);
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const containerAreaRef = useRef<HTMLDivElement>(null);
  const contentsContainerHeight = `${containerAreaRef.current?.clientHeight ? containerAreaRef.current.clientHeight * 0.1 - 6 : 15.7}rem`;

  const { value } = msg;

  const { token_in, token_out_min_amount, routes } = value;

  const inputCoin = useMemo(() => currentChainAssets.data.find((item) => item.denom === token_in.denom), [currentChainAssets.data, token_in.denom]);
  const outputCoin = useMemo(() => currentChainAssets.data.find((item) => item.denom === routes[0].token_out_denom), [currentChainAssets.data, routes]);

  const inputDisplayAmount = useMemo(() => toDisplayDenomAmount(token_in.amount, inputCoin?.decimals || 0), [inputCoin?.decimals, token_in.amount]);
  const outputDisplayAmount = useMemo(
    () => toDisplayDenomAmount(token_out_min_amount, outputCoin?.decimals || 0),
    [outputCoin?.decimals, token_out_min_amount],
  );

  const inputCoinPrice = useMemo(
    () => (inputCoin?.coinGeckoId && coinGeckoPrice.data?.[inputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, inputCoin?.coinGeckoId],
  );
  const outputCoinPrice = useMemo(
    () => (outputCoin?.coinGeckoId && coinGeckoPrice.data?.[outputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, outputCoin?.coinGeckoId],
  );

  const inputCoinAmountPrice = useMemo(() => times(inputDisplayAmount || '0', inputCoinPrice), [inputDisplayAmount, inputCoinPrice]);

  const outputCoinAmountPrice = useMemo(() => times(outputDisplayAmount || '0', outputCoinPrice), [outputDisplayAmount, outputCoinPrice]);

  return (
    <Container ref={containerAreaRef}>
      <HeaderContainer>
        <SwapCoinContainer>
          <SwapCoinImageContainer>
            <Image src={inputCoin?.image} />
          </SwapCoinImageContainer>
          <SwapCoinInfoContainer>
            <SwapCoinTitleContainer>
              <Typography variant="h4">{inputCoin?.symbol}</Typography>
            </SwapCoinTitleContainer>
            <SwapCoinSubTitleContainer>
              <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                {inputDisplayAmount}
              </Number>
            </SwapCoinSubTitleContainer>
          </SwapCoinInfoContainer>
        </SwapCoinContainer>
        <SwapCoinContainer>
          <Typography variant="h4">→</Typography>
          <SwapCoinImageContainer>
            <Image src={outputCoin?.image} />
          </SwapCoinImageContainer>
          <SwapCoinInfoContainer>
            <SwapCoinTitleContainer>
              <Typography variant="h4">{outputCoin?.symbol}</Typography>
            </SwapCoinTitleContainer>
            <SwapCoinSubTitleContainer>
              <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                {`≈ ${outputDisplayAmount}`}
              </Number>
            </SwapCoinSubTitleContainer>
          </SwapCoinInfoContainer>
        </SwapCoinContainer>
      </HeaderContainer>
      <StyledDivider />
      <ContentContainer data-height={contentsContainerHeight}>
        <InputCoinContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.tokenIn')}</Typography>
          </LabelContainer>
          <InputCoinImageContainer>
            <Image src={inputCoin?.image} />
          </InputCoinImageContainer>
          <ValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {inputDisplayAmount}
            </Number>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
              {inputCoinAmountPrice}
            </Number>
            <Typography variant="h5">{inputCoin?.symbol}</Typography>
          </ValueContainer>
        </InputCoinContainer>

        <OutputCoinContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.tokenOut')}</Typography>
          </LabelContainer>
          <OutputCoinImageContainer>
            <Image src={outputCoin?.image} />
          </OutputCoinImageContainer>
          <ValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {outputDisplayAmount}
            </Number>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
              {outputCoinAmountPrice}
            </Number>
            <Typography variant="h5">{outputCoin?.symbol}</Typography>
          </ValueContainer>
        </OutputCoinContainer>

        <RoutesContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.routes')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{token_in.denom}</Typography>
          </ValueContainer>
        </RoutesContainer>

        <PoolContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.poolId')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{String(routes[0].pool_id)}</Typography>
          </ValueContainer>
        </PoolContainer>
      </ContentContainer>
    </Container>
  );
}
