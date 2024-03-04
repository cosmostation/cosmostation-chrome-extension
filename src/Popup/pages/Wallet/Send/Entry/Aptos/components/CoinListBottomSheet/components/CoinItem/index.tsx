import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

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
  coin: X1CoinCoinstore;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, coin, ...remainder }, ref) => {
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;

  const coinAddress = useMemo(() => getCoinAddress(coin.type), [coin.type]);
  const accountAddress = useMemo(() => coinAddress.split('::')[0], [coinAddress]);

  const assets = useAssetsSWR();

  const asset = useMemo(() => assets.data.find((item) => item.address === coinAddress), [assets.data, coinAddress]);

  const { data: coinInfo } = useAccountResourceSWR({
    resourceType: '0x1::coin::CoinInfo',
    resourceTarget: coinAddress,
    address: accountAddress,
  });

  const isNative = useMemo(() => coinAddress === APTOS_COIN, [coinAddress]);

  const decimals = useMemo(() => coinInfo?.data.decimals || 0, [coinInfo?.data.decimals]);

  const baseAmount = useMemo(() => coin.data.coin.value || '0', [coin.data.coin.value]);

  const imageURL = useMemo(() => (isNative ? currentAptosNetwork.tokenImageURL : asset?.image), [asset?.image, currentAptosNetwork.tokenImageURL, isNative]);

  const displayDenom = useMemo(() => asset?.symbol || coinInfo?.data.symbol || '', [asset?.symbol, coinInfo?.data.symbol]);
  const displayAmount = toDisplayDenomAmount(baseAmount, decimals);

  const coinGeckoId = useMemo(() => (isNative ? currentAptosNetwork.coinGeckoId : ''), [currentAptosNetwork.coinGeckoId, isNative]);

  const coinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const coinAmountPrice = useMemo(() => times(displayAmount, coinPrice), [displayAmount, coinPrice]);

  const displayName = useMemo(
    () => (isNative ? currentAptosNetwork.networkName.toUpperCase() : asset?.description?.toUpperCase() || coinInfo?.data.name.toUpperCase() || ''),
    [isNative, currentAptosNetwork.networkName, asset?.description, coinInfo?.data.name],
  );

  return (
    <CoinButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={imageURL} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftDisplayDenomContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </CoinLeftDisplayDenomContainer>
          <Tooltip title={coinAddress}>
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
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(displayAmount, '0') ? getDisplayMaxDecimals(decimals) : 0}>
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
