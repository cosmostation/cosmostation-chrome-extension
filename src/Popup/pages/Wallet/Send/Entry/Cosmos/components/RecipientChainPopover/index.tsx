import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import { AXELAR } from '~/constants/chain/cosmos/axelar';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import type { CosmosChain } from '~/types/chain';
import type { AssetV2 } from '~/types/cosmos/asset';

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
  recipientList: AssetV2[];
  selectedRecipientChain: AssetV2;
  onClickChain?: (selectedRecipientChain: AssetV2) => void;
  chain: CosmosChain;
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
          const chainName = item.dp_denom.substring(0, 3) === 'axl' ? 'Axelar' : item.chain;
          const channelId = item.channel ?? 'UNKNOWN';
          const imgURL =
            item.dp_denom.substring(0, 3) === 'axl' ? AXELAR.imageURL : COSMOS_CHAINS.find((chain) => chain.baseDenom === item.base_denom)?.imageURL;
          const isActive = selectedRecipientChain.base_denom === item.base_denom;

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
                    <Tooltip title={channelId} arrow placement="top">
                      <Typography variant="h6n">{channelId}</Typography>
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
