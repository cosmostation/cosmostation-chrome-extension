import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { TokenBalanceObject } from '~/types/sui/rpc';

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
  coin: TokenBalanceObject;
  onClick?: () => void;
  disabled?: boolean;
};

export default function CoinItem({ coin, onClick, disabled }: CoinItemProps) {
  const { extensionStorage } = useExtensionStorage();

  const splitedCoinType = useMemo(() => coin.coinType.split('::'), [coin.coinType]);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: coin.coinType });

  const { currency } = extensionStorage;

  const displayAmount = useMemo(
    () => toDisplayDenomAmount(coin.balance, coinMetadata?.result?.decimals || SUI_TOKEN_TEMPORARY_DECIMALS),
    [coin.balance, coinMetadata?.result?.decimals],
  );
  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || splitedCoinType[2] || '', [coinMetadata?.result?.symbol, splitedCoinType]);

  const displayName = useMemo(
    () => coinMetadata?.result?.name.toUpperCase() || splitedCoinType[2].toUpperCase() || '',
    [coinMetadata?.result?.name, splitedCoinType],
  );

  const price = 0;

  const displayValue = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  const imageURL = useMemo(() => coinMetadata?.result?.iconUrl || undefined, [coinMetadata?.result?.iconUrl]);

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
