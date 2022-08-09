import { Typography } from '@mui/material';

import {
  ContentContainer,
  ContentLeftContainer,
  ContentLeftNumberContainer,
  ContentLeftTextContainer,
  ContentRightImageContainer,
  StyledButton,
} from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type TypeButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive?: boolean;
  text?: string;
  number?: string | number;
};

export default function TypeButton({ type = 'button', isActive = false, text, number, ...remainder }: TypeButtonProps) {
  return (
    <StyledButton {...remainder} type={type}>
      <ContentContainer>
        <ContentLeftContainer>
          <ContentLeftTextContainer>
            <Typography variant="h6">{text}</Typography>
          </ContentLeftTextContainer>
          <ContentLeftNumberContainer>
            <Typography variant="h6">{number}</Typography>
          </ContentLeftNumberContainer>
        </ContentLeftContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
