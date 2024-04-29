import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

import { Button, LeftAvailableContainer, LeftContainer, LeftDisplayDenomContainer, LeftImageContainer, LeftInfoContainer, RightContainer } from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type CoinButtonProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
  currentCoin: X1CoinCoinstore;
};

export default function CoinButton({ currentCoin, isActive, ...remainder }: CoinButtonProps) {
  const { t } = useTranslation();

  const assets = useAssetsSWR();

  const coinAddress = getCoinAddress(currentCoin.type);
  const accountAddress = coinAddress.split('::')[0];

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const asset = assets.data.find((item) => item.address === coinAddress);

  const { data: coinInfo } = useAccountResourceSWR({
    resourceType: '0x1::coin::CoinInfo',
    resourceTarget: coinAddress,
    address: accountAddress,
  });

  const isNative = useMemo(() => coinAddress === APTOS_COIN, [coinAddress]);

  const decimals = useMemo(() => coinInfo?.data.decimals || 0, [coinInfo?.data.decimals]);

  const baseAmount = useMemo(() => currentCoin.data.coin.value || '0', [currentCoin.data.coin.value]);

  const imageURL = useMemo(() => (isNative ? currentAptosNetwork.tokenImageURL : asset?.image), [asset?.image, currentAptosNetwork.tokenImageURL, isNative]);
  const displayDenom = useMemo(() => asset?.symbol || coinInfo?.data.symbol || '', [asset?.symbol, coinInfo?.data.symbol]);
  const displayAmount = useMemo(() => toDisplayDenomAmount(baseAmount, decimals), [baseAmount, decimals]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftDisplayDenomContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </LeftDisplayDenomContainer>
          <LeftAvailableContainer>
            <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Ethereum.components.CoinButton.index.available')} :</Typography>{' '}
            <Tooltip title={displayAmount} placement="top" arrow>
              <span>
                <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={getDisplayMaxDecimals(decimals)}>
                  {displayAmount}
                </Number>{' '}
              </span>
            </Tooltip>
          </LeftAvailableContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isActive ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </Button>
  );
}
