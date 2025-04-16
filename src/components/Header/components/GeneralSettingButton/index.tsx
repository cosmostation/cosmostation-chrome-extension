import { useState } from 'react';
import type { IconButtonProps, PopoverProps } from '@mui/material';

import IconButton from '@/components/common/IconButton';
import SettingPopover from '@/components/SettingPopover';

import SettingIcon from '@/assets/images/icons/Setting16.svg';

type GeneralSettingButtonProps = {
  iconButtonProps?: IconButtonProps;
  popoverProps?: PopoverProps;
};

export default function GeneralSettingButton({ iconButtonProps, popoverProps }: GeneralSettingButtonProps) {
  const [isOpenDialog, setisOpenDialog] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClickOpen = () => {
    setisOpenDialog(true);
  };
  const handleClose = () => {
    setisOpenDialog(false);
  };

  return (
    <>
      <IconButton
        {...iconButtonProps}
        onClick={(event) => {
          handleClickOpen();

          setPopoverAnchorEl(event.currentTarget);
        }}
      >
        <SettingIcon />
      </IconButton>
      <SettingPopover
        {...popoverProps}
        open={isOpenDialog}
        onClose={handleClose}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </>
  );
}
