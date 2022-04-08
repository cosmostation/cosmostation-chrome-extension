import { Typography } from '@mui/material';

import { StyledContainer, StyledDivider, TitleContainer } from './styled';

type ContainerProps = {
  title: string;
  children?: JSX.Element;
};

export default function Container({ title, children }: ContainerProps) {
  return (
    <StyledContainer>
      <TitleContainer>
        <Typography variant="h4">{title}</Typography>
      </TitleContainer>
      <StyledDivider />
      {children}
    </StyledContainer>
  );
}
