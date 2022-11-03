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
import type { CoinOrTokenInfo } from '../IBCSend';

import Check16Icon from '~/images/icons/Check16.svg';

type RecipientChainPopoverProps = Omit<PopoverProps, 'children'> & {
  recipientList?: IbcSend[];
  currentCoinOrTokenInfo: CoinOrTokenInfo;
  onClickChain?: (counterParty: IbcSend) => void;
  chain: CosmosChain;
};

export default function RecipientChainPopover({ currentCoinOrTokenInfo, onClickChain, onClose, recipientList, ...remainder }: RecipientChainPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {recipientList
          ? // FIXME key값 중복값 지워서 baseDenom으로 넣어놓도록하시오

            recipientList.map((item) => {
              // REVIEW - 현재 오스모시스 기준으로 만든거라 axelar 체인 기준으로 테스트 해볼것
              // axelar기준에서는 axl로 시작하는 놈들 다 카운터 파티 애초에 없음
              // FIXME 이더리움에서 넘어온 애들인 체인명이 이더리움으로 잡힘
              // -> 원래 얘네는 axelar로 넘겨줘야함
              // if(item.display_denom.substring(0, 3) === 'axl'){
              //   const chainName = 'Axelar';
              //   const imgURL = `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`;
              // }else{
              //   const chainName = item.chain_name;
              //   const imgURL = `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`;
              // }
              const chainName = item.display_denom.substring(0, 3) === 'axl' ? 'Axelar' : item.chain_name;
              const channelId = item.channel_id ?? 'UNKNOWN';
              const imgURL =
                item.display_denom.substring(0, 3) === 'axl'
                  ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`
                  : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.img_Url}`;
              const isActive = currentCoinOrTokenInfo.type === 'coin' && currentCoinOrTokenInfo.baseDenom === item.base_denom;
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
                          <span>{channelId}</span>
                        </Tooltip>
                      </CoinLeftAvailableContainer>
                    </CoinLeftInfoContainer>
                  </CoinLeftContainer>
                  <CoinRightContainer>{isActive && <Check16Icon />}</CoinRightContainer>
                </CoinButton>
              );
            })
          : undefined}
      </Container>
    </StyledPopover>
  );
}
