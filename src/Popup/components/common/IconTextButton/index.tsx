import { Typography } from '@mui/material';

import { ButtonTextContainer, SideTextButton } from './styled';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children: string;
  Icon: SvgElement;
  isActive?: boolean;
};

export default function IconTextButton({ Icon, children, isActive = true, ...remainder }: IconTextButtonProps) {
  return (
    <SideTextButton {...remainder} type="button" data-is-active={isActive}>
      {Icon}
      <ButtonTextContainer data-is-active={isActive}>
        <Typography variant="h6">{children}</Typography>
      </ButtonTextContainer>
    </SideTextButton>
  );
}
