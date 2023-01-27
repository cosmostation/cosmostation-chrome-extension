import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Number from '~/Popup/components/common/Number';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { Msg, MsgSwapExactAmountIn } from '~/types/cosmos/amino';

import CoinAmountInfoContainer from './components/CoinAmountInfoContainer';
import {
  Container,
  ContentContainer,
  HeaderContainer,
  InputCoinContainer,
  LabelContainer,
  OutputCoinContainer,
  PoolContainer,
  PoolValueContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightValueContainer,
  RoutesContainer,
  RoutesValueContainer,
  StyledDivider,
  ValueContainer,
} from './styled';

import SwapArrowIcon from '~/images/icons/SwapArrow.svg';

type SwapProps = {
  msg: Msg<MsgSwapExactAmountIn>;
  isMultipleMsgs: boolean;
};

export default function Swap({ msg, isMultipleMsgs }: SwapProps) {
  const { t } = useTranslation();
  const currentChainAssets = useAssetsSWR(OSMOSIS);
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { value } = msg;

  const { token_in, token_out_min_amount, routes } = value;

  const inputCoin = useMemo(() => currentChainAssets.data.find((item) => item.denom === token_in.denom), [currentChainAssets.data, token_in.denom]);
  const outputCoin = useMemo(
    () => currentChainAssets.data.find((item) => item.denom === routes[routes.length - 1].token_out_denom),
    [currentChainAssets.data, routes],
  );

  const routesTokenOutDenomList = useMemo(() => routes.map(({ token_out_denom }) => token_out_denom), [routes]);

  const routesTokenOutDisplayDenomList = useMemo(
    () => currentChainAssets.data.filter((item) => routesTokenOutDenomList.includes(item.denom)).map((item) => item.symbol),
    [currentChainAssets.data, routesTokenOutDenomList],
  );

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
    <Container data-is-multiple={isMultipleMsgs}>
      <HeaderContainer>
        <CoinAmountInfoContainer coinImg={inputCoin?.image} displayDenom={inputCoin?.symbol} displayAmount={inputDisplayAmount} />
        <SwapArrowIcon />
        <CoinAmountInfoContainer coinImg={outputCoin?.image} displayDenom={outputCoin?.symbol} displayAmount={outputDisplayAmount} isTilde />
      </HeaderContainer>
      <StyledDivider />
      <ContentContainer>
        <InputCoinContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.tokenIn')}</Typography>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.swapAmount')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{inputCoin?.symbol}</Typography>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {inputDisplayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{inputCoin?.symbol}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {inputCoinAmountPrice}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </ValueContainer>
        </InputCoinContainer>

        <OutputCoinContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.tokenOut')}</Typography>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.expectedOutput')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{outputCoin?.symbol}</Typography>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {outputDisplayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{outputCoin?.symbol}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {outputCoinAmountPrice}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </ValueContainer>
        </OutputCoinContainer>

        <RoutesContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.routes')}</Typography>
          </LabelContainer>
          <RoutesValueContainer>
            <Typography variant="h5">{inputCoin?.symbol} </Typography>
            {routesTokenOutDisplayDenomList.map((item) => (
              <Typography key={item} variant="h5">
                / {item}{' '}
              </Typography>
            ))}
          </RoutesValueContainer>
        </RoutesContainer>

        <PoolContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Swap.index.poolId')}</Typography>
          </LabelContainer>
          <PoolValueContainer>
            {routes.map((item, index) => (
              <Typography key={String(item.pool_id)} variant="h5">
                {`${index > 0 ? ` / ` : ``}${String(item.pool_id)}`}
              </Typography>
            ))}
          </PoolValueContainer>
        </PoolContainer>
      </ContentContainer>
    </Container>
  );
}
