import { Typography } from '@mui/material';

import { StyledContainer, StyledDivider, TitleContainer } from './styled';

type ContainerProps = {
  title: string;
  children?: JSX.Element;
  isMultipleMsgs: boolean;
};

export default function Container({ title, children, isMultipleMsgs }: ContainerProps) {
  return (
    <StyledContainer data-is-multiple={isMultipleMsgs}>
      <TitleContainer>
        <Typography variant="h4">{title}</Typography>
      </TitleContainer>
      <StyledDivider />
      {children}
    </StyledContainer>
  );
}
