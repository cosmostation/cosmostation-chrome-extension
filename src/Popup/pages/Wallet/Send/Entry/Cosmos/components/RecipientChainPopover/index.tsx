import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import type { CosmosChain } from '~/types/chain';
import type { IbcSend } from '~/types/cosmos/ibcCoin';

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
  recipientList: IbcSend[];
  selectedRecipientChain: IbcSend;
  onClickChain?: (selectedRecipientChain: IbcSend) => void;
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
          // REVIEW - 현재 오스모시스 기준으로 만든거라 axelar 체인 기준으로 테스트 해볼것
          const chainName = item.display_denom.substring(0, 3) === 'axl' ? 'Axelar' : item.chain_name;
          const channelId = item.channel_id ?? 'UNKNOWN';
          const imgURL =
            item.display_denom.substring(0, 3) === 'axl'
              ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`
              : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.img_Url}`;
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
