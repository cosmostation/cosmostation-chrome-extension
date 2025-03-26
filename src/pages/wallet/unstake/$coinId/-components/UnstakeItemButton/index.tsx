import { forwardRef } from 'react';

import { BodyContainer, StyledButton, TopContainer } from './styled';

export type UnstakeItemButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isActive?: boolean;
  headerContent?: React.ReactNode;
  bodyContent?: React.ReactNode;
};

const UnstakeItemButton = forwardRef<HTMLButtonElement, UnstakeItemButtonProps>(({ headerContent, bodyContent, isActive = false, ...remainder }, ref) => {
  return (
    <StyledButton type="button" data-is-active={isActive} {...remainder} ref={ref}>
      <TopContainer>{headerContent}</TopContainer>
      <BodyContainer>{bodyContent}</BodyContainer>
    </StyledButton>
  );
});

UnstakeItemButton.displayName = 'UnstakeItemButton';

export default UnstakeItemButton;
