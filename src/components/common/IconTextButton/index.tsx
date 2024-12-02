import { StyledIconButton } from './styled';

export type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  leadingIcon?: JSX.Element;
  trailingIcon?: JSX.Element;
  children?: JSX.Element;
  direction?: 'horizontal' | 'vertical';
};

export default function IconTextButton({ leadingIcon, trailingIcon, children, direction = 'horizontal', ...remainder }: IconTextButtonProps) {
  return (
    <StyledIconButton type="button" direction={direction} {...remainder}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </StyledIconButton>
  );
}
