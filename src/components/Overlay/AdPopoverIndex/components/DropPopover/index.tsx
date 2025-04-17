import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EventDialogUI from '@/components/Overlay/components/AdPopoverUI';
import Backdrop from '@/components/Overlay/components/Backdrop';
import { DROP_POPOVER_ID } from '@/constants/adPopover';
import { turnOffAdPopover } from '@/utils/zustand/adPopoverState';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { StyledButton } from './styled';

import DropPopoverImage from 'assets/images/ad/dropPopup.png';

export default function DropPopover() {
  const { t } = useTranslation();

  const { adPopoverState } = useExtensionStorageStore((state) => state);

  const [isHide7days, setIsHide7days] = useState(false);

  const { isVisiable } = adPopoverState[DROP_POPOVER_ID];

  const isOpen = isVisiable;

  const handleLaunch = () => {
    window.open('https://app.drop.money/dashboard?referral_code=dropmaga', '_blank');
  };

  const handleClose = async (isHide: boolean) => {
    if (isHide) {
      const lastClosed = new Date().getTime();

      await turnOffAdPopover(DROP_POPOVER_ID, lastClosed);
    } else {
      await turnOffAdPopover(DROP_POPOVER_ID);
    }
  };

  return (
    <>
      <Backdrop
        style={{
          display: isOpen ? 'initial' : 'none',
        }}
      >
        <EventDialogUI
          open={isOpen}
          backgroundImage={DropPopoverImage}
          hideDuration={7}
          isHide={isHide7days}
          onClickHide={(value) => {
            setIsHide7days(value || false);
          }}
          onClickClose={async () => {
            handleClose(isHide7days);
          }}
          buttonComponent={
            <StyledButton
              typoVarient="b2_B"
              onClick={() => {
                handleLaunch();
                handleClose(isHide7days);
              }}
            >
              {t('components.Overlay.EventDialog.components.DropDialog.index.launch')}
            </StyledButton>
          }
        />
      </Backdrop>
    </>
  );
}
