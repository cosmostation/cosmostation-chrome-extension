import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { CosmosChain } from '~/types/chain';

import TokenButton from './components/TokenButton';
import {
  CoinButton,
  CoinLeftAvailableContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightContainer,
  Container,
  StyledPopover,
} from './styled';
import type { CoinInfo, CoinOrTokenInfo, TokenInfo } from '../../index';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinOrTokenPopoverProps = Omit<PopoverProps, 'children'> & {
  currentCoinOrTokenInfo: CoinOrTokenInfo;
  coinOrTokenInfos: CoinOrTokenInfo[];
  onClickCoinOrToken?: (coinOrTokenInfo: CoinOrTokenInfo) => void;
  chain: CosmosChain;
  address: string;
};

export default function CoinOrTokenPopover({
  coinOrTokenInfos,
  currentCoinOrTokenInfo,
  onClickCoinOrToken,
  onClose,
  address,
  chain,
  ...remainder
}: CoinOrTokenPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { t } = useTranslation();

  const coinInfos = coinOrTokenInfos.filter((item) => item.type === 'coin').sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)) as CoinInfo[];
  const tokenInfos = coinOrTokenInfos.filter((item) => item.type === 'token').sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)) as TokenInfo[];

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {coinInfos.map((item) => {
          const displayDenom = item.displayDenom ? item.displayDenom : 'UNKNOWN';

          const decimals = item.decimals ?? 0;

          const displayMaxDecimals = getDisplayMaxDecimals(decimals);

          const displayAmount = toDisplayDenomAmount(item.availableAmount, decimals);

          const isActive = currentCoinOrTokenInfo.type === 'coin' && currentCoinOrTokenInfo.baseDenom === item.baseDenom;
          return (
            <CoinButton
              type="button"
              key={item.baseDenom}
              data-is-active={isActive ? 1 : 0}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoinOrToken?.(item);
                onClose?.({}, 'backdropClick');
              }}
            >
              <CoinLeftContainer>
                <CoinLeftImageContainer>
                  <Image src={item.imageURL} />
                </CoinLeftImageContainer>
                <CoinLeftInfoContainer>
                  <CoinLeftDisplayDenomContainer>
                    <Typography variant="h5">{displayDenom}</Typography>
                  </CoinLeftDisplayDenomContainer>
                  <CoinLeftAvailableContainer>
                    <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.components.CoinOrTokenPopover.index.available')} :</Typography>{' '}
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
        })}
        {tokenInfos.map((item) => {
          const isActive = currentCoinOrTokenInfo.type === 'token' && currentCoinOrTokenInfo.address === item.address;

          return (
            <TokenButton
              key={item.id}
              address={address}
              chain={chain}
              tokenInfo={item}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoinOrToken?.(item);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
