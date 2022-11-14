import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type TokenItemProps = {
  name: string;
  symbol: string;
  imageURL?: string;
  onClick?: () => void;
  isActive: boolean;
  disable?: () => void;
};

export default function TokenItem({ onClick, disable, isActive, name, symbol, imageURL }: TokenItemProps) {
  return (
    <StyledButton type="button" onClick={onClick || disable}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5"> {symbol} </Typography>
            <Typography variant="h6" color="#727E91">
              {name}
            </Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}

// 클릭 횟수에 따라 선택, 해제 가능하도록(클릭 카운팅 방식 x 클릭 횟수가 안세어짐)
// 입력 버튼 누르면 전체 내용이 전송되도록
