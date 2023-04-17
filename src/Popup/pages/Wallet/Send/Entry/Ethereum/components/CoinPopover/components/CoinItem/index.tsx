import type { ComponentProps } from 'react';
import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { Token } from '~/types/ethereum/common';

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
  token: Token;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, token, ...remainder }, ref) => {
  const { t } = useTranslation();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const balance = useBalanceSWR();
  const tokenBalace = useTokenBalanceSWR({ token });

  const isNative = token === null;

  const decimals = isNative ? currentEthereumNetwork.decimals : token.decimals;

  const baseAmount = isNative ? BigInt(balance.data?.result || '0').toString(10) : BigInt(tokenBalace.data || '0').toString(10);

  const imageURL = isNative ? currentEthereumNetwork.imageURL : token.imageURL;
  const displayDenom = isNative ? currentEthereumNetwork.displayDenom : token.displayDenom;
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
