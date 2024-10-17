import { type ComponentProps, useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { BitcoinChain } from '~/types/chain';

import { Div, LeftAvailableContainer, LeftContainer, LeftDisplayDenomContainer, LeftImageContainer, LeftInfoContainer } from './styled';

type CoinButtonProps = ComponentProps<typeof Div> & {
  chain: BitcoinChain;
  displayAmount?: string;
};

export default function Coin({ chain, displayAmount, ...remainder }: CoinButtonProps) {
  const { t } = useTranslation();

  const displayDenom = useMemo(() => chain.displayDenom, [chain.displayDenom]);

  const dAmount = displayAmount || '0';

  return (
    <Div {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={chain.tokenImageURL} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftDisplayDenomContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </LeftDisplayDenomContainer>
          <LeftAvailableContainer>
            <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Ethereum.components.CoinButton.index.available')} :</Typography>{' '}
            <Tooltip title={dAmount} placement="top" arrow>
              <span>
                <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={getDisplayMaxDecimals(chain.decimals)}>
                  {dAmount}
                </Number>{' '}
              </span>
            </Tooltip>
          </LeftAvailableContainer>
        </LeftInfoContainer>
      </LeftContainer>
    </Div>
  );
}
