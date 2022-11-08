import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { IBCCosmosChain } from '~/types/chain';

import {
  ChainButton,
  ChainLeftChainNameContainer,
  ChainLeftChannelIdContainer,
  ChainLeftContainer,
  ChainLeftImageContainer,
  ChainLeftInfoContainer,
  ChainRightContainer,
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
          const channelId = item.channelId ?? 'UNKNOWN';
          const imgURL = item.imageURL;
          const isActive = selectedRecipientChain.baseDenom === item.baseDenom;

          return (
            <ChainButton
              type="button"
              key={chainName}
              data-is-active={isActive ? 1 : 0}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickChain?.(item);
                onClose?.({}, 'backdropClick');
              }}
            >
              <ChainLeftContainer>
                <ChainLeftImageContainer>
                  <Image src={imgURL} />
                </ChainLeftImageContainer>
                <ChainLeftInfoContainer>
                  <ChainLeftChainNameContainer>
                    <Typography variant="h5">{chainName}</Typography>
                  </ChainLeftChainNameContainer>
                  <ChainLeftChannelIdContainer>
                    <Typography variant="h6n">{channelId}</Typography>
                  </ChainLeftChannelIdContainer>
                </ChainLeftInfoContainer>
              </ChainLeftContainer>
              <ChainRightContainer>{isActive && <Check16Icon />}</ChainRightContainer>
            </ChainButton>
          );
        })}
      </Container>
    </StyledPopover>
  );
}
