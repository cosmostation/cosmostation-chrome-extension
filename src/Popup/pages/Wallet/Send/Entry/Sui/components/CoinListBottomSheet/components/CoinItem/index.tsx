import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { TokenBalanceObject } from '~/types/sui/rpc';

import {
  CoinButton,
  CoinLefNameContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightAmountContainer,
  CoinRightContainer,
  CoinRightIconContainer,
  CoinRightInfoContainer,
  CoinRightValueContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinItemProps = ComponentProps<typeof CoinButton> & {
  isActive?: boolean;
  coin: TokenBalanceObject;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, coin, ...remainder }, ref) => {
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;

  const splitedCoinType = useMemo(() => coin.coinType.split('::'), [coin.coinType]);

  const baseAmount = useMemo(() => coin.balance || '0', [coin.balance]);

  const displayDenom = useMemo(() => coin.displayDenom || splitedCoinType[2] || '', [coin.displayDenom, splitedCoinType]);

  const displayName = useMemo(() => coin.name || splitedCoinType[2] || '', [coin.name, splitedCoinType]);

  const displayAmount = useMemo(() => toDisplayDenomAmount(baseAmount, coin.decimals || 0), [baseAmount, coin.decimals]);

  const coinPrice = useMemo(
    () => (coin.coinGeckoId && coinGeckoPrice.data?.[coin.coinGeckoId]?.[currency]) || 0,
    [coin.coinGeckoId, coinGeckoPrice.data, currency],
  );

  const coinAmountPrice = useMemo(() => times(displayAmount, coinPrice), [displayAmount, coinPrice]);

  return (
    <CoinButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={coin.imageURL} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftDisplayDenomContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </CoinLeftDisplayDenomContainer>
          <Tooltip title={coin.coinType}>
            <CoinLefNameContainer>
              <Typography variant="h6">{displayName}</Typography>
            </CoinLefNameContainer>
          </Tooltip>
        </CoinLeftInfoContainer>
      </CoinLeftContainer>
      <CoinRightContainer>
        <CoinRightInfoContainer>
          <CoinRightAmountContainer>
            <Tooltip title={displayAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(displayAmount, '0') ? getDisplayMaxDecimals(coin.decimals) : 0}>
                  {displayAmount}
                </Number>
              </div>
            </Tooltip>
          </CoinRightAmountContainer>
          <CoinRightValueContainer>
            <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
              {coinAmountPrice}
            </Number>
          </CoinRightValueContainer>
        </CoinRightInfoContainer>
        <CoinRightIconContainer> {isActive && <Check16Icon />}</CoinRightIconContainer>
      </CoinRightContainer>
    </CoinButton>
  );
});

export default CoinItem;
