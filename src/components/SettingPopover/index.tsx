import { type PopoverProps } from '@mui/material';

import { StyledIconTextButton, StyledPopover, StyledTypography } from './styled';

import SettingIcon from 'assets/images/icons/Setting14.svg';

type SettingPopoverProps = Omit<PopoverProps, 'children'>;

export default function SettingPopover({ onClose, ...remainder }: SettingPopoverProps) {
  return (
    <StyledPopover {...remainder} onClose={onClose}>
      <StyledIconTextButton Icon={<SettingIcon />}>
        {/* TODO i18n 적용 필요 */}
        {/* <TextContainer>
          <Typography variant="b3_M">Setting</Typography>
        </TextContainer> */}

        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
      <StyledIconTextButton Icon={<SettingIcon />}>
        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
      <StyledIconTextButton Icon={<SettingIcon />}>
        <StyledTypography variant="b3_M">Setting</StyledTypography>
      </StyledIconTextButton>
    </StyledPopover>
  );
}
