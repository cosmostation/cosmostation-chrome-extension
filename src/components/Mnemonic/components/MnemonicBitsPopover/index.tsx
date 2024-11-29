import { type PopoverProps } from '@mui/material';

import { StyledIconTextButton, StyledPopover, StyledTypography } from './styled';

import SettingIcon from 'assets/images/icons/Setting14.svg';

type MnemonicBitsPopoverProps = Omit<PopoverProps, 'children'>;

export default function MnemonicBitsPopover({ onClose, ...remainder }: MnemonicBitsPopoverProps) {
  return (
    <StyledPopover {...remainder} onClose={onClose}>
      <StyledIconTextButton leadingIcon={<SettingIcon />}>
        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
      <StyledIconTextButton leadingIcon={<SettingIcon />}>
        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
      <StyledIconTextButton leadingIcon={<SettingIcon />}>
        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
    </StyledPopover>
  );
}
