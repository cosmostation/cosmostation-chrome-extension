import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import { upperCaseFirst } from '~/Popup/utils/common';

import {
  ContentContainer,
  ContentLeftContainer,
  ContentLeftImageContainer,
  ContentLeftTextContainer,
  ContentRightImageContainer,
  StyledBottomArrow,
  StyledButton,
  StyledUpArrow,
} from './styled';

type ChainButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  children?: string;
};

export default function ChainButton({ children, imgSrc, type = 'button', isActive = false, ...remainder }: ChainButtonProps) {
  return (
    <StyledButton type={type} {...remainder}>
      <ContentContainer>
        <ContentLeftContainer>
          <ContentLeftImageContainer>
            <Image src={imgSrc} />
          </ContentLeftImageContainer>
          <ContentLeftTextContainer>
            <Typography variant="h5">{upperCaseFirst(children)}</Typography>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightImageContainer>{isActive ? <StyledUpArrow /> : <StyledBottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
