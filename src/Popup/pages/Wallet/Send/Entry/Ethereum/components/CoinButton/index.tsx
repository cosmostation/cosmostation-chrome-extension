import { type ComponentProps, useMemo } from 'react';
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

import { Button, LeftAvailableContainer, LeftContainer, LeftDisplayDenomContainer, LeftImageContainer, LeftInfoContainer, RightContainer } from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type CoinButtonProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
  currentToken: Token;
};

export default function CoinButton({ currentToken, isActive, ...remainder }: CoinButtonProps) {
  const { t } = useTranslation();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const balance = useBalanceSWR();
  const tokenBalace = useTokenBalanceSWR({ token: currentToken });

  const isNative = currentToken === null;

  const decimals = useMemo(
    () => (isNative ? currentEthereumNetwork.decimals : currentToken.decimals),
    [currentEthereumNetwork.decimals, currentToken?.decimals, isNative],
  );

  const baseAmount = useMemo(
    () => (isNative ? BigInt(balance.data?.result || '0').toString(10) : BigInt(tokenBalace.data || '0').toString(10)),
    [balance.data?.result, isNative, tokenBalace.data],
  );

  const imageURL = useMemo(
    () => (isNative ? currentEthereumNetwork.tokenImageURL : currentToken.imageURL),
    [currentEthereumNetwork.tokenImageURL, currentToken?.imageURL, isNative],
  );
  const displayDenom = useMemo(
    () => (isNative ? currentEthereumNetwork.displayDenom : currentToken.displayDenom),
    [currentEthereumNetwork.displayDenom, currentToken?.displayDenom, isNative],
  );
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
