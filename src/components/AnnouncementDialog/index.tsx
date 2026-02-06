import type { DialogProps } from '@mui/material';

import { CloseButtonContainer, Container, LaunchButtonContainer, StyledButton, StyledDialog, StyledIconButton, WrapperContainer } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type AnnouncementDialogProps = Omit<DialogProps, 'children'> & {
  image: string;
  launchButtonText: string;
  launchButtonStyle?: {
    bgColor: string;
  };
  launchFunc?: () => void;
};

export default function AnnouncementDialog({ image, launchButtonText, launchButtonStyle, launchFunc, onClose, ...remainder }: AnnouncementDialogProps) {
  const handleClose = async () => {
    onClose?.({}, 'backdropClick');
  };
  return (
    <StyledDialog {...remainder} onClose={onClose}>
      <WrapperContainer>
        <CloseButtonContainer>
          <StyledIconButton
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <Close24Icon />
          </StyledIconButton>
        </CloseButtonContainer>
        <Container backgroundImage={image}>
          {launchFunc && (
            <LaunchButtonContainer>
              <StyledButton
                typoVarient="b2_B"
                onClick={() => {
                  launchFunc();
                  handleClose();
                }}
                data-bg-color={launchButtonStyle?.bgColor ?? '#7C4FFC'}
              >
                {launchButtonText}
              </StyledButton>
            </LaunchButtonContainer>
          )}
        </Container>
      </WrapperContainer>
    </StyledDialog>
  );
}
