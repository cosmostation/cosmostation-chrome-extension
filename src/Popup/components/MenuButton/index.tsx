import { Typography } from '@mui/material';

import { LeftContainer, RightContainer, StyledButton } from './styled';

import RightArrowIcon from '~/images/icons/RightArrow.svg';

type MenuButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
};

export default function MenuButton({ children, ...remainder }: MenuButtonProps) {
  return (
    <StyledButton {...remainder}>
      <LeftContainer>
        <Typography variant="h5">{children}</Typography>
      </LeftContainer>
      <RightContainer>
        <RightArrowIcon />
      </RightContainer>
    </StyledButton>
  );
}
