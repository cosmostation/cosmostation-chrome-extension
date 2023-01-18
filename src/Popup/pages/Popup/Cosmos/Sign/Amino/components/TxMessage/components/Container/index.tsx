import { Typography } from '@mui/material';

import { StyledContainer, StyledDivider, TitleContainer } from './styled';

type ContainerProps = {
  title: string;
  children?: JSX.Element;
  msgLength?: number;
};

export default function Container({ title, children, msgLength }: ContainerProps) {
  return (
    <StyledContainer data-is-length={msgLength ? msgLength > 1 : false}>
      <TitleContainer>
        <Typography variant="h4">{title}</Typography>
      </TitleContainer>
      <StyledDivider />
      {children}
    </StyledContainer>
  );
}
