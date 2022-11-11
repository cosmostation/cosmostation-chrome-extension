import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { CosmosChain } from '~/types/chain';
import type { AssetV2 } from '~/types/cosmos/asset';

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

type IBCRecipientChain = {
  cosmos: CosmosChain;
  asset: AssetV2 | undefined;
};

type RecipientChainPopoverProps = Omit<PopoverProps, 'children'> & {
  currentCoinType?: string;
  recipientList: IBCRecipientChain[];
  selectedRecipientChain?: IBCRecipientChain;
  onClickChain?: (selectedRecipientChain: IBCRecipientChain) => void;
};

export default function RecipientChainPopover({
  currentCoinType,
  selectedRecipientChain,
  onClickChain,
  onClose,
  recipientList,
  ...remainder
}: RecipientChainPopoverProps) {
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
          const { chainName } = item.cosmos;
          const channelId = currentCoinType === 'ibc' ? item.asset?.channel : item.asset?.counter_party?.channel;
          const imgURL = item.cosmos.imageURL;
          const isActive = selectedRecipientChain?.cosmos.baseDenom === item.cosmos.baseDenom;

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
