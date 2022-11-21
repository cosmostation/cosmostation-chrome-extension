import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { CosmosChain } from '~/types/chain';

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

type ReceiverIBC = {
  chain: CosmosChain;
  channel: string;
  port: string;
};

type ReceiverIBCPopoverProps = Omit<PopoverProps, 'children'> & {
  recipientList: ReceiverIBC[];
  selectedReceiverIBC?: ReceiverIBC;
  onClickChain?: (selectedReceiverIBC: ReceiverIBC) => void;
};

export default function ReceiverIBCPopover({ selectedReceiverIBC, onClickChain, onClose, recipientList, ...remainder }: ReceiverIBCPopoverProps) {
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
          const { chainName } = item.chain;
          const channelId = item.channel;
          const imgURL = item.chain.imageURL;
          const isActive =
            selectedReceiverIBC?.chain.id === item.chain.id && selectedReceiverIBC?.channel === item.channel && selectedReceiverIBC?.port === item.port;

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
