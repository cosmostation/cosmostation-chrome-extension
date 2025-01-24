import { useTranslation } from 'react-i18next';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';

import { BottomContainer, CloseButtonContainer, Container, LaunchButtonContainer, StyledIconButton, StyledPopover, WrapperContainer } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type EventDialogUIProps = Omit<PopoverProps, 'children'> & {
  buttonComponent: React.ReactNode;
  backgroundImage: string;
  hideDuration?: number;
  isHide?: boolean;
  onClickClose: () => void;
  onClickHide?: (isHide?: boolean) => void;
};

export default function EventDialogUI({
  backgroundImage,
  buttonComponent,
  hideDuration,
  isHide,
  onClickClose,
  onClickHide,
  onClose,
  ...remainder
}: EventDialogUIProps) {
  const { t } = useTranslation();

  return (
    <StyledPopover
      {...remainder}
      anchorReference="anchorPosition"
      anchorPosition={{ top: window.innerHeight / 2, left: window.innerWidth / 2 }}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
    >
      <WrapperContainer>
        <CloseButtonContainer>
          <StyledIconButton
            onClick={(e) => {
              e.stopPropagation();

              onClickClose?.();
              onClose?.({}, 'backdropClick');
            }}
          >
            <Close24Icon />
          </StyledIconButton>
        </CloseButtonContainer>
        <Container backgroundImage={backgroundImage}>{<LaunchButtonContainer>{buttonComponent}</LaunchButtonContainer>}</Container>
        {onClickHide && hideDuration && (
          <BottomContainer>
            <CheckBoxTextButton
              isChecked={isHide}
              onClick={() => {
                onClickHide(!isHide);
              }}
            >
              <Typography variant="b3_M">
                {t('components.Overlay.components.EventDialog.index.hideDescription', {
                  duration: hideDuration,
                })}
              </Typography>
            </CheckBoxTextButton>
          </BottomContainer>
        )}
      </WrapperContainer>
    </StyledPopover>
  );
}
