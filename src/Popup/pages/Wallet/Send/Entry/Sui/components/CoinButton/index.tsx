import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetAllBalancesSWR } from '~/Popup/hooks/SWR/sui/useGetAllBalancesSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { plus, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getCoinType, isExists } from '~/Popup/utils/sui';
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

  const { currentAccount } = useCurrentAccount();

  const splitedCoinType = coinType.split('::');

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  // const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address }, { suspense: true });

  // const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) }, { suspense: true });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType }, { suspense: true });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const { data: allBalances } = useGetAllBalancesSWR({ address }, { suspense: true });

  const suiCoinObjects = useMemo(() => allBalances?.result || [], [allBalances?.result]);

  const coinObjects = useMemo(() => suiCoinObjects.find((object) => object.coinType === coinType), [coinType, suiCoinObjects]);

  const baseAmount = useMemo(() => coinObjects?.totalBalance || '0', [coinObjects?.totalBalance]);

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
