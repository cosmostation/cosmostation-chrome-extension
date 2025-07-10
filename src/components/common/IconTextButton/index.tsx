import { StyledIconButton } from './styled';

export type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  leadingIcon?: JSX.Element;
  trailingIcon?: JSX.Element;
  children?: JSX.Element;
  isHovering?: boolean;
  direction?: 'horizontal' | 'vertical';
};

export default function IconTextButton({ leadingIcon, trailingIcon, children, direction = 'horizontal', isHovering, ...remainder }: IconTextButtonProps) {
  return (
    <StyledIconButton type="button" direction={direction} data-is-hovering={isHovering} {...remainder}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </StyledIconButton>
  );
}
