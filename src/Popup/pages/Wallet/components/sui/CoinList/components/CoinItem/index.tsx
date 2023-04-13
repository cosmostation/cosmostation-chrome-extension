import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { GetCoinBalance } from '~/types/sui/rpc';

import {
  LeftContainer,
  LeftImageContainer,
  LeftTextChainContainer,
  LeftTextChainNameContainer,
  LeftTextContainer,
  RightContainer,
  RightTextChangeRateContainer,
  RightTextContainer,
  RightTextValueContainer,
  StyledButton,
} from './styled';

type CoinItemProps = {
  coin: GetCoinBalance;
  onClick?: () => void;
  disabled?: boolean;
};

export default function CoinItem({ coin, onClick, disabled }: CoinItemProps) {
  const { chromeStorage } = useChromeStorage();

  const splitedCoinType = coin.coinType.split('::');

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: coin.coinType }, { suspense: true });

  const { currency } = chromeStorage;

  const displayAmount = useMemo(
    () => toDisplayDenomAmount(coin.totalBalance, coinMetadata?.result?.decimals || SUI_TOKEN_TEMPORARY_DECIMALS),
    [coin.totalBalance, coinMetadata?.result?.decimals],
  );
  const displayDenom = coinMetadata?.result?.symbol || splitedCoinType[2] || '';

  const displayName = coinMetadata?.result?.name || splitedCoinType[2] || '';

  const price = 0;

  const displayValue = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  const imageURL = coinMetadata?.result?.iconUrl || undefined;

  if (!coinMetadata) {
    return null;
  }

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </LeftTextChainContainer>

          <Tooltip title={coin.coinType}>
            <LeftTextChainNameContainer>
              <Typography variant="h5">{displayName}</Typography>
            </LeftTextChainNameContainer>
          </Tooltip>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {displayAmount}
            </Number>
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={currency}>
              {displayValue}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}

type CoinItemSkeletonProps = Pick<CoinItemProps, 'coin'>;

export function CoinItemSkeleton({ coin }: CoinItemSkeletonProps) {
  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: coin.coinType });
  const splitedCoinType = coin.coinType.split('::');

  const displayDenom = coinMetadata?.result?.symbol || splitedCoinType[2] || '';

  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Skeleton width={40} variant="text" />
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Skeleton width={40} variant="text" />
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
