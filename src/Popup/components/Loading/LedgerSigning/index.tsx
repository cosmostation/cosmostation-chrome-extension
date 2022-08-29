import { useRecoilValue } from 'recoil';
import { Typography } from '@mui/material';

import { loadingLedgerSigningState } from '~/Popup/recoils/loading';

import { BottomArrowContainer, Container, StepContainer, StepDescription, StepImage, StepTitle } from './styled';

import Step1Icon from './assets/Step1.svg';
import Step2Icon from './assets/Step2.svg';
import BottomArrow28Icon from '~/images/icons/BottomArrow28.svg';

export default function LedgerSigning() {
  const isShow = useRecoilValue(loadingLedgerSigningState);

  if (!isShow) {
    return null;
  }

  return (
    <Container>
      <StepContainer>
        <StepImage>
          <Step1Icon />
        </StepImage>
        <StepTitle>
          <Typography variant="h3">Step 1</Typography>
        </StepTitle>
        <StepDescription>
          <Typography variant="h5">Check message on your Ledger</Typography>
        </StepDescription>
      </StepContainer>
      <BottomArrowContainer>
        <BottomArrow28Icon />
      </BottomArrowContainer>
      <StepContainer>
        <StepImage>
          <Step2Icon />
        </StepImage>
        <StepTitle>
          <Typography variant="h3">Step 2</Typography>
        </StepTitle>
        <StepDescription>
          <Typography variant="h5">Approve or Reject</Typography>
        </StepDescription>
      </StepContainer>
    </Container>
  );
}
