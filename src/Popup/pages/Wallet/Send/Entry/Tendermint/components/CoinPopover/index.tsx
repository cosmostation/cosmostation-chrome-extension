import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import type { CoinInfo } from '~/Popup/hooks/SWR/tendermint/useCoinListSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';

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

import Check16Icon from '~/images/icons/Check16.svg';

type CoinPopoverProps = Omit<PopoverProps, 'children'> & { currentCoinInfo: CoinInfo; coinInfos: CoinInfo[]; onClickCoin?: (coinInfo: CoinInfo) => void };

export default function CoinPopover({ coinInfos, currentCoinInfo, onClickCoin, onClose, ...remainder }: CoinPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { t } = useTranslation();

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

          const isActive = currentCoinInfo.baseDenom === item.baseDenom;
          return (
            <CoinButton
              type="button"
              key={item.baseDenom}
              data-is-active={isActive ? 1 : 0}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoin?.(item);
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
                    <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Tendermint.components.CoinPopover.index.available')} :</Typography>{' '}
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
      </Container>
    </StyledPopover>
  );
}
