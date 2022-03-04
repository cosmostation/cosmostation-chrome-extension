import { Typography } from '@mui/material';

import { BackButton, ConnectionLine, Container, Step, StepContainer, StepsContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';

type HeaderProps = {
  step?: {
    total: number;
    current: number;
  };
  onClick?: () => void;
};

export default function Header({ step, onClick }: HeaderProps) {
  return (
    <Container>
      <StepsContainer>
        {step &&
          new Array(step.total).fill(null).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <StepContainer key={index}>
              <Step data-is-active={index + 1 === step.current ? 1 : 0}>
                <Typography variant="h6">{index + 1}</Typography>
              </Step>
              {index + 1 < step.total && <ConnectionLine />}
            </StepContainer>
          ))}
      </StepsContainer>
      <BackButton onClick={onClick}>
        <LeftArrow16Icon />
      </BackButton>
    </Container>
  );
}
