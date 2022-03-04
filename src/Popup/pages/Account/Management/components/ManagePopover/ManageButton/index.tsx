import { Typography } from '@mui/material';

import { ImageContainer, StyledButton, TextContainer } from './styled';

type ManageButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  Icon?: SvgElement;
};

export default function ManageButton({ children, Icon, ...remainder }: ManageButtonProps) {
  return (
    <StyledButton {...remainder}>
      {Icon && (
        <ImageContainer>
          <Icon />
        </ImageContainer>
      )}
      <TextContainer>
        <Typography variant="h6">{children}</Typography>
      </TextContainer>
    </StyledButton>
  );
}
