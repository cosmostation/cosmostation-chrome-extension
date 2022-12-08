import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
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

import {
  CoinButton,
  CoinLeftAvailableContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinItemProps = ComponentProps<typeof CoinButton> & {
  isActive?: boolean;
  coin: X1CoinCoinstore;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, coin, ...remainder }, ref) => {
  const { t } = useTranslation();

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const coinAddress = getCoinAddress(coin.type);
  const accountAddress = coinAddress.split('::')[0];

  const assets = useAssetsSWR();

  const asset = assets.data.find((item) => item.address === coinAddress);

  const { data: coinInfo } = useAccountResourceSWR({
    resourceType: '0x1::coin::CoinInfo',
    resourceTarget: coinAddress,
    address: accountAddress,
  });

  const isNative = coinAddress === APTOS_COIN;

  const decimals = useMemo(() => coinInfo?.data.decimals || 0, [coinInfo?.data.decimals]);

  const baseAmount = coin.data.coin.value || '0';

  const imageURL = isNative ? currentAptosNetwork.imageURL : asset?.image;
  const displayDenom = asset?.symbol || coinInfo?.data.symbol || '';
  const displayAmount = toDisplayDenomAmount(baseAmount, decimals);

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
          <CoinLeftAvailableContainer>
            <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Ethereum.components.CoinPopover.components.CoinItem.index.available')} :</Typography>{' '}
            <Tooltip title={displayAmount} arrow placement="top">
              <span>
                <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={getDisplayMaxDecimals(decimals)}>
                  {displayAmount}
                </Number>
              </span>
            </Tooltip>
          </CoinLeftAvailableContainer>
        </CoinLeftInfoContainer>
      </CoinLeftContainer>
      <CoinRightContainer>{isActive && <Check16Icon />}</CoinRightContainer>
    </CoinButton>
  );
});

export default CoinItem;
