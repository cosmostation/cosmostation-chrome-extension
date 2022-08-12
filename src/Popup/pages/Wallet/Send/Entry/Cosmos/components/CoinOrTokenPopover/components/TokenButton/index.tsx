import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { CosmosChain } from '~/types/chain';

import {
  CoinButton,
  CoinLeftAvailableContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightContainer,
} from './styled';
import type { TokenInfo } from '../../../../index';

import Check16Icon from '~/images/icons/Check16.svg';

type TokenButtonProps = {
  onClick?: () => void;
  tokenInfo: TokenInfo;
  chain: CosmosChain;
  address: string;
  isActive?: boolean;
};

const TokenButton = forwardRef<HTMLButtonElement, TokenButtonProps>(({ address, chain, tokenInfo, isActive, onClick }, ref) => {
  const { t } = useTranslation();

  const cw20Balance = useTokenBalanceSWR(chain, tokenInfo.address, address);

  const amount = cw20Balance.data?.balance || '0';

  const displayAmount = toDisplayDenomAmount(amount, tokenInfo.decimals);

  const displayMaxDecimals = getDisplayMaxDecimals(tokenInfo.decimals);

  if (amount === '0') {
    return null;
  }

  return (
    <CoinButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} onClick={onClick}>
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={tokenInfo.imageURL} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftDisplayDenomContainer>
            <Typography variant="h5">{tokenInfo.displayDenom}</Typography>
          </CoinLeftDisplayDenomContainer>
          <CoinLeftAvailableContainer>
            <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.components.CoinOrTokenPopover.components.TokenButton.index.available')} :</Typography>{' '}
            <Tooltip title={displayAmount} arrow placement="top">
              <span>
                <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={displayMaxDecimals}>
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

export default TokenButton;
