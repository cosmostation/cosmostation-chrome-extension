import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_COIN, SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { SuiChain } from '~/types/chain';
import type { TokenBalanceObject } from '~/types/sui/rpc';

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
  coin: TokenBalanceObject;
  chain: SuiChain;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, coin, chain, ...remainder }, ref) => {
  const { t } = useTranslation();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const splitedCoinType = coin.coinType.split('::');

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: coin.coinType });

  const decimals = useMemo(
    () => coinMetadata?.result?.decimals || (coin.coinType === SUI_COIN ? currentSuiNetwork.decimals : SUI_TOKEN_TEMPORARY_DECIMALS),
    [coin.coinType, coinMetadata?.result?.decimals, currentSuiNetwork.decimals],
  );

  const baseAmount = useMemo(() => coin.balance || '0', [coin.balance]);

  const imageURL = useMemo(
    () => coinMetadata?.result?.iconUrl || (coin.coinType === SUI_COIN ? chain.imageURL : undefined),
    [chain.imageURL, coin.coinType, coinMetadata?.result?.iconUrl],
  );

  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || splitedCoinType[2] || '', [coinMetadata?.result?.symbol, splitedCoinType]);

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
            <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Sui.components.CoinPopover.components.CoinItem.index.available')} :</Typography>{' '}
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
