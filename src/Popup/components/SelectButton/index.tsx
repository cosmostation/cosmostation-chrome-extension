import { Typography } from '@mui/material';

import { LeftContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type SelectButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  isActive?: boolean;
};

export default function SelectButton({ children, isActive, ...remainder }: SelectButtonProps) {
  return (
    <StyledButton {...remainder}>
      <LeftContainer>
        <Typography variant="h5">{children}</Typography>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}
