import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { plus, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getCoinType, isExists } from '~/Popup/utils/sui';
import type { SuiChain } from '~/types/chain';

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
  coinType: string;
  chain: SuiChain;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, coinType, chain, ...remainder }, ref) => {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address }, { suspense: true });

  const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) }, { suspense: true });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType }, { suspense: true });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const suiCoinObjects = useMemo(
    () => objects?.filter(isExists).filter((object) => getCoinType(object.result?.details.data.type || '') === coinType) || [],
    [coinType, objects],
  );

  const coinObjects = useMemo(() => suiCoinObjects.filter((object) => getCoinType(object.result?.details.data.type) === coinType), [coinType, suiCoinObjects]);

  const baseAmount = useMemo(() => coinObjects.reduce((ac, cu) => plus(ac, cu.result?.details.data.fields.balance || '0'), '0'), [coinObjects]);

  const imageURL = useMemo(
    () => (coinMetadata?.result?.iconUrl || coinType === SUI_COIN ? chain.imageURL : undefined),
    [chain.imageURL, coinMetadata?.result?.iconUrl, coinType],
  );

  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || '', [coinMetadata?.result?.symbol]);
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
