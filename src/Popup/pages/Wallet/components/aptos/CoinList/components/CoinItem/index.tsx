import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

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
  coin: X1CoinCoinstore;
  onClick?: () => void;
  disabled?: boolean;
};

export default function CoinItem({ coin, onClick, disabled }: CoinItemProps) {
  const { extensionStorage } = useExtensionStorage();

  const coinAddress = useMemo(() => getCoinAddress(coin.type), [coin.type]);
  const accountAddress = useMemo(() => coinAddress.split('::')[0], [coinAddress]);

  const { currency } = extensionStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const { data: coinInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: coinAddress, address: accountAddress });

  const { data: assets } = useAssetsSWR();

  const asset = useMemo(() => assets.find((item) => item.address === coinAddress), [assets, coinAddress]);

  const displayAmount = useMemo(
    () => toDisplayDenomAmount(coin.data.coin.value, coinInfo?.data.decimals || 0),
    [coin.data.coin.value, coinInfo?.data.decimals],
  );
  const displayDenom = useMemo(() => asset?.symbol || coinInfo?.data.symbol || '', [asset?.symbol, coinInfo?.data.symbol]);

  const displayName = useMemo(() => asset?.description?.toUpperCase() || coinInfo?.data.name?.toUpperCase() || '', [asset?.description, coinInfo?.data.name]);

  const price = useMemo(
    () => (asset?.coinGeckoId && coinGeckoPrice.data?.[asset.coinGeckoId]?.[currency]) || 0,
    [asset?.coinGeckoId, coinGeckoPrice.data, currency],
  );

  const displayValue = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  const imageURL = asset?.image;

  if (!coinInfo) {
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

          <Tooltip title={coinAddress}>
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
