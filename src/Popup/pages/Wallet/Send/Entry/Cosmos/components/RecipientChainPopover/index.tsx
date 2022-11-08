import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { IBCCosmosChain } from '~/types/chain';

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

type RecipientChainPopoverProps = Omit<PopoverProps, 'children'> & {
  recipientList: IBCCosmosChain[];
  selectedRecipientChain: IBCCosmosChain;
  onClickChain?: (selectedRecipientChain: IBCCosmosChain) => void;
};

export default function RecipientChainPopover({ selectedRecipientChain, onClickChain, onClose, recipientList, ...remainder }: RecipientChainPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);
  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {recipientList.map((item) => {
          // eslint-disable-next-line prefer-destructuring
          const chainName = item.chainName;
          const channelId = item.counterChannelId ?? 'UNKNOWN';
          const imgURL = item.imageURL;
          const isActive = selectedRecipientChain.baseDenom === item.baseDenom;

          return (
            <CoinButton
              type="button"
              key={chainName}
              data-is-active={isActive ? 1 : 0}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickChain?.(item);
                onClose?.({}, 'backdropClick');
              }}
            >
              <CoinLeftContainer>
                <CoinLeftImageContainer>
                  <Image src={imgURL} />
                </CoinLeftImageContainer>
                <CoinLeftInfoContainer>
                  <CoinLeftDisplayDenomContainer>
                    <Typography variant="h5">{chainName}</Typography>
                  </CoinLeftDisplayDenomContainer>
                  <CoinLeftAvailableContainer>
                    <Typography variant="h6n">{channelId}</Typography>
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
