import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { gt, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';

import {
  CoinButton,
  LeftContainer,
  LeftImageContainer,
  LeftInfoContainer,
  LeftSubTitleContainer,
  LeftTitleContainer,
  RightContainer,
  RightIconContainer,
  RightInfoContainer,
  RightSubTitleContainer,
  RightTitleContainer,
} from './styled';
import type { CoinOrTokenInfo } from '../../../..';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinItemProps = {
  coinInfo: CoinOrTokenInfo;
  isActive: boolean;
  onClickCoin: (clickedToken: CoinOrTokenInfo) => void;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ coinInfo, onClickCoin, isActive }, ref) => {
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;

  const amount = useMemo(() => coinInfo.availableAmount || '0', [coinInfo.availableAmount]);

  const coinDisplayDenomAmount = useMemo(() => toDisplayDenomAmount(amount, gt(amount, '0') ? coinInfo.decimals : 0), [amount, coinInfo.decimals]);

  return (
    <CoinButton
      key={coinInfo.displayDenom}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickCoin?.(coinInfo);
      }}
    >
      <LeftContainer>
        <LeftImageContainer>
          <Image src={coinInfo.imageURL} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftTitleContainer>
            <Typography variant="h5">{coinInfo.displayDenom}</Typography>
          </LeftTitleContainer>
          <LeftSubTitleContainer>
            <Typography variant="h6">{coinInfo.name}</Typography>
          </LeftSubTitleContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>
        <RightInfoContainer>
          <RightTitleContainer>
            <Tooltip title={coinDisplayDenomAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(coinDisplayDenomAmount, '0') ? getDisplayMaxDecimals(coinInfo.decimals) : 0}>
                  {coinDisplayDenomAmount}
                </Number>
              </div>
            </Tooltip>
          </RightTitleContainer>
          {coinInfo.coinGeckoId && (
            <RightSubTitleContainer>
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
                {coinInfo.price}
              </Number>
            </RightSubTitleContainer>
          )}
        </RightInfoContainer>
        <RightIconContainer>{isActive && <Check16Icon />}</RightIconContainer>
      </RightContainer>
    </CoinButton>
  );
});
export default CoinItem;
