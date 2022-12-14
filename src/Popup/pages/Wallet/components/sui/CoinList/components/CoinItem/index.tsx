import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';

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
  coin: { type: string; amount: string };
  onClick?: () => void;
  disabled?: boolean;
};

export default function CoinItem({ coin, onClick, disabled }: CoinItemProps) {
  const { chromeStorage } = useChromeStorage();

  const coinType = getCoinAddress(coin.type);

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType }, { suspense: true });

  const { currency } = chromeStorage;

  const displayAmount = useMemo(() => toDisplayDenomAmount(coin.amount, coinMetadata?.result?.decimals || 0), [coin.amount, coinMetadata?.result?.decimals]);
  const displayDenom = coinMetadata?.result?.symbol || '';

  const displayName = coinMetadata?.result?.name || '';

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

          <Tooltip title={coinType}>
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
  const coinAddress = getCoinAddress(coin.type);
  const accountAddress = coinAddress.split('::')[0];

  const { data: coinInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: coinAddress, address: accountAddress });

  if (!coinInfo) {
    return null;
  }

  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{coinInfo.data.symbol}</Typography>
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
