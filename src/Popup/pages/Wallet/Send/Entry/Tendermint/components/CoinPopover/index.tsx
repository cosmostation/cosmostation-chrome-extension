import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import type { CoinInfo } from '~/Popup/hooks/SWR/tendermint/useCoinListSWR';
import { toDisplayDenomAmount } from '~/Popup/utils/big';

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
  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {coinInfos.map((item) => {
          const displayDenom = item.displayDenom ? item.displayDenom.toUpperCase() : 'UNKNOWN';

          const displayAmount = toDisplayDenomAmount(item.availableAmount, item.decimals ?? 0);

          const isActive = currentCoinInfo.baseDenom === item.baseDenom;
          return (
            <CoinButton
              type="button"
              key={item.baseDenom}
              data-is-active={isActive ? 1 : 0}
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
                    <Typography variant="h6n">Available :</Typography>{' '}
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n">
                      {displayAmount}
                    </Number>{' '}
                    <Typography variant="h6n">{displayDenom}</Typography>
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
