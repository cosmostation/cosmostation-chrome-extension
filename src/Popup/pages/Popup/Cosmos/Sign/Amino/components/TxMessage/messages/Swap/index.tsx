import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { Msg, MsgSwapExactAmountIn } from '~/types/cosmos/amino';

import {
  AfterSwapCoinContainer,
  Container,
  ContentContainer,
  HeaderContainer,
  InputCoinContainer,
  LabelContainer,
  OutputCoinContainer,
  PoolContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightValueContainer,
  RoutesContainer,
  StyledDivider,
  SwapArrowIconContainer,
  SwapCoinContainer,
  SwapCoinImageContainer,
  SwapCoinInfoContainer,
  SwapCoinSubTitleContainer,
  SwapCoinTitleContainer,
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
    <Container data-is-multiple={isMultipleMsgs}>
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
              <Tooltip title={inputDisplayAmount} arrow placement="top">
                <span>
                  <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                    {inputDisplayAmount}
                  </Number>
                </span>
              </Tooltip>
            </SwapCoinSubTitleContainer>
          </SwapCoinInfoContainer>
        </SwapCoinContainer>
        <AfterSwapCoinContainer>
          <SwapArrowIconContainer>
            <SwapArrowIcon />
          </SwapArrowIconContainer>
          <SwapCoinImageContainer>
            <Image src={outputCoin?.image} />
          </SwapCoinImageContainer>
          <SwapCoinInfoContainer>
            <SwapCoinTitleContainer>
              <Typography variant="h4">{outputCoin?.symbol}</Typography>
            </SwapCoinTitleContainer>
            <SwapCoinSubTitleContainer>
              <Tooltip title={outputDisplayAmount} arrow placement="top">
                <span>
                  <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                    {`≈ ${outputDisplayAmount}`}
                  </Number>
                </span>
              </Tooltip>
            </SwapCoinSubTitleContainer>
          </SwapCoinInfoContainer>
        </AfterSwapCoinContainer>
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
          <ValueContainer>
            <Typography variant="h5">
              {inputCoin?.symbol} / {outputCoin?.symbol}
            </Typography>
          </ValueContainer>
        </RoutesContainer>

        <PoolContainer>
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
