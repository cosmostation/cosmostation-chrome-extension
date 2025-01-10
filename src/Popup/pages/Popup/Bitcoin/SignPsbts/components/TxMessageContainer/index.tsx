import { Typography } from '@mui/material';

import { StyledContainer, StyledDivider, TitleContainer } from './styled';

type TxMessageContainerProps = {
  title: string;
  children?: JSX.Element;
  isMultipleMsgs?: boolean;
};

export default function TxMessageContainer({ title, children, isMultipleMsgs }: TxMessageContainerProps) {
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
