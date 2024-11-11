import { StyledIconButton } from './styled';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  LeadingIcon: JSX.Element;
  TrailingIcon?: JSX.Element;
  children?: JSX.Element;
  direction?: 'horizontal' | 'vertical';
};

export default function IconTextButton({ LeadingIcon, TrailingIcon, children, direction = 'horizontal', ...remainder }: IconTextButtonProps) {
  return (
    <StyledIconButton type="button" direction={direction} {...remainder}>
      {LeadingIcon}
      {children}
      {TrailingIcon}
    </StyledIconButton>
  );
}
