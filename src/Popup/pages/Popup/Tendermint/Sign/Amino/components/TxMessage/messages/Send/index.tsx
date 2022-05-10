import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useAssetsSWR } from '~/Popup/hooks/SWR/tendermint/useAssetsSWR';
import { useIbcCoinSWR } from '~/Popup/hooks/SWR/tendermint/useIbcCoinSWR';
import { useMarketPriceSWR } from '~/Popup/hooks/SWR/tendermint/useMarketPriceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { equalsIgnoringCase, shorterAddress } from '~/Popup/utils/common';
import type { TendermintChain } from '~/types/chain';
import type { Msg, MsgSend } from '~/types/tendermint/amino';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';

type SendProps = {
  msg: Msg<MsgSend>;
  chain: TendermintChain;
};

export default function Send({ msg, chain }: SendProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const ibcCoin = useIbcCoinSWR(chain);
  const assets = useAssetsSWR(chain);
  const marketPrice = useMarketPriceSWR();
  const { t } = useTranslation();

  const { currency } = chromeStorage;
  const { displayDenom, baseDenom, decimals, coinGeckoId } = chain;

  const { value } = msg;

  const { amount, from_address, to_address } = value;

  return (
    <Container title="Send">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Tendermint.Sign.Amino.components.TxMessage.messages.Send.index.fromAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(from_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Tendermint.Sign.Amino.components.TxMessage.messages.Send.index.toAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(to_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
        {amount.map((item, idx) => {
          const itemBaseAmount = item.amount;
          const itemBaseDenom = item.denom;

          const assetCoinInfo = assets.data?.find((coin) => equalsIgnoringCase(coin.denom, item.denom));
          const ibcCoinInfo = ibcCoin.data?.ibc_tokens?.find((coin) => coin.hash === item.denom.replace('ibc/', ''));

          const itemDisplayAmount = (function getDisplayAmount() {
            if (itemBaseDenom === baseDenom) {
              return toDisplayDenomAmount(itemBaseAmount, decimals);
            }

            if (assetCoinInfo?.decimal) {
              return toDisplayDenomAmount(itemBaseAmount, assetCoinInfo.decimal);
            }

            if (ibcCoinInfo?.decimal) {
              return toDisplayDenomAmount(itemBaseAmount, ibcCoinInfo.decimal);
            }

            return itemBaseAmount || '0';
          })();

          const itemDisplayDenom = (function getDisplayDenom() {
            if (itemBaseDenom === baseDenom) {
              return displayDenom;
            }

            if (assetCoinInfo?.origin_symbol) {
              return assetCoinInfo?.origin_symbol;
            }

            if (ibcCoinInfo?.display_denom) {
              return ibcCoinInfo.display_denom.toUpperCase();
            }

            return item.denom.length > 5 ? `${item.denom.substring(0, 5)}...` : item.denom;
          })();

          const itemDisplayValue = (function getDisplayValue() {
            if (itemBaseDenom === baseDenom) {
              const chainPrice = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0;
              return times(itemDisplayAmount, chainPrice);
            }

            if (assetCoinInfo?.denom) {
              const chainPrice =
                marketPrice.data?.find((p) => equalsIgnoringCase(p.denom, assetCoinInfo.denom))?.prices?.find((p) => p.currency === 'usd')?.current_price || 0;
              const tetherPrice = coinGeckoPrice.data?.tether?.[currency] || 0;

              return times(itemDisplayAmount, chainPrice * tetherPrice, 2);
            }

            if (ibcCoinInfo?.base_denom) {
              const chainPrice =
                marketPrice.data?.find((p) => p.denom === ibcCoinInfo.base_denom)?.prices?.find((p) => p.currency === 'usd')?.current_price || 0;
              const tetherPrice = coinGeckoPrice.data?.tether?.[currency] || 0;

              return times(itemDisplayAmount, chainPrice * tetherPrice, 2);
            }

            return '0';
          })();

          return (
            // eslint-disable-next-line react/no-array-index-key
            <AmountInfoContainer key={`${item.denom}${idx}`}>
              <LeftContainer>
                <Typography variant="h5">{t('pages.Popup.Tendermint.Sign.Amino.components.TxMessage.messages.Send.index.amount')}</Typography>
              </LeftContainer>
              <RightContainer>
                <RightColumnContainer>
                  <RightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {itemDisplayAmount}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{itemDisplayDenom}</Typography>
                  </RightAmountContainer>
                  <RightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {itemDisplayValue}
                    </Number>
                  </RightValueContainer>
                </RightColumnContainer>
              </RightContainer>
            </AmountInfoContainer>
          );
        })}
      </ContentContainer>
    </Container>
  );
}
