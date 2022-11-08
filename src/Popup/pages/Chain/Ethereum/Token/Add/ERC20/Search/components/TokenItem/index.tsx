import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { EthereumToken } from '~/types/chain';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type TokenItemProps = {
  isActive?: boolean;
  disabled?: boolean;
  item: EthereumToken;
};

export default function TokenItem({ disabled, isActive = false, item }: TokenItemProps) {
  return (
    <StyledButton disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={item.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5"> {item.displayDenom} </Typography>
            <Typography variant="h6" color="#727E91">
              {item.name}
            </Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}
