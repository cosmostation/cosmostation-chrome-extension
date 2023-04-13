import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_COIN, SUI_TOKEN_TEMPORARY_DECIMALS } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetAllBalancesSWR } from '~/Popup/hooks/SWR/sui/useGetAllBalancesSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { SuiChain } from '~/types/chain';

import { Button, LeftAvailableContainer, LeftContainer, LeftDisplayDenomContainer, LeftImageContainer, LeftInfoContainer, RightContainer } from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type CoinButtonProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
  coinType: string;
  chain: SuiChain;
};

export default function CoinButton({ coinType, chain, isActive, ...remainder }: CoinButtonProps) {
  const { t } = useTranslation();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { currentAccount } = useCurrentAccount();

  const splitedCoinType = coinType.split('::');

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType }, { suspense: true });

  const decimals = useMemo(
    () => (coinMetadata?.result?.decimals || coinType === SUI_COIN ? currentSuiNetwork.decimals : SUI_TOKEN_TEMPORARY_DECIMALS),
    [coinMetadata?.result?.decimals, coinType, currentSuiNetwork.decimals],
  );

  const { data: allCoinBalances } = useGetAllBalancesSWR({ address }, { suspense: true });

  const suiAvailableCoins = useMemo(() => allCoinBalances?.result || [], [allCoinBalances?.result]);

  const currentCoin = useMemo(() => suiAvailableCoins.find((object) => object.coinType === coinType), [suiAvailableCoins, coinType]);

  const baseAmount = useMemo(() => currentCoin?.totalBalance || '0', [currentCoin?.totalBalance]);

  const imageURL = useMemo(
    () => (coinMetadata?.result?.iconUrl || coinType === SUI_COIN ? chain.imageURL : undefined),
    [chain.imageURL, coinMetadata?.result?.iconUrl, coinType],
  );

  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || splitedCoinType[2] || '', [coinMetadata?.result?.symbol, splitedCoinType]);
  const displayAmount = toDisplayDenomAmount(baseAmount, decimals);

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
