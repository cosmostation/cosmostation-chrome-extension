import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import { turnOffAdPopover } from '@/utils/zustand/adPopoverState';

import {
  BottomContainer,
  CloseButtonContainer,
  Container,
  LaunchButtonContainer,
  StyledButton,
  StyledDialog,
  StyledIconButton,
  WrapperContainer,
} from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type EventDialogProps = Omit<DialogProps, 'children'> & {
  popOverId: string;
  image: string;
  launchButtonText: string;
  launchButtonStyle: {
    bgColor: string;
    hoverColor: string;
  };
  launchFunc: () => void;
};

export default function EventDialog({ popOverId, image, launchButtonText, launchButtonStyle, launchFunc, onClose, ...remainder }: EventDialogProps) {
  const { t } = useTranslation();

  const [isHide7days, setIsHide7days] = useState(false);

  const handleClose = async (isHide: boolean) => {
    if (isHide) {
      const lastClosed = new Date().getTime();

      await turnOffAdPopover(popOverId, lastClosed);
      onClose?.({}, 'backdropClick');
    } else {
      onClose?.({}, 'backdropClick');
    }
  };
  return (
    <StyledDialog {...remainder} onClose={onClose}>
      <WrapperContainer>
        <CloseButtonContainer>
          <StyledIconButton
            onClick={(e) => {
              e.stopPropagation();
              handleClose(isHide7days);
            }}
          >
            <Close24Icon />
          </StyledIconButton>
        </CloseButtonContainer>
        <Container backgroundImage={image}>
          <LaunchButtonContainer>
            <StyledButton
              typoVarient="b2_B"
              onClick={() => {
                launchFunc();
                handleClose(isHide7days);
              }}
              data-bg-color={launchButtonStyle.bgColor}
              data-bg-hover-color={launchButtonStyle.hoverColor}
            >
              {launchButtonText}
            </StyledButton>
          </LaunchButtonContainer>
        </Container>
        <BottomContainer>
          <CheckBoxTextButton
            isChecked={isHide7days}
            onClick={() => {
              setIsHide7days((prev) => !prev);
            }}
          >
            <Typography variant="b3_M">{t('components.Overlay.components.EventDialog.index.hideDescription', { duration: 7 })}</Typography>
          </CheckBoxTextButton>
        </BottomContainer>
      </WrapperContainer>
    </StyledDialog>
  );
}
