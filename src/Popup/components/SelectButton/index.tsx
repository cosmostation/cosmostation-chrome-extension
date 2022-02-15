import { Typography } from '@mui/material';

import { LeftContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type AddressButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  isActive?: boolean;
};

export default function AddressButton({ children, isActive, ...remainder }: AddressButtonProps) {
  return (
    <StyledButton {...remainder}>
      <LeftContainer>
        <Typography variant="h5">{children}</Typography>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}
