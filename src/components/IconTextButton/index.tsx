import { SideTextButton } from './styled';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  Icon: JSX.Element;
  children?: JSX.Element;
  direction?: 'horizontal' | 'vertical';
};

export default function IconTextButton({ Icon, children, direction = 'horizontal', ...remainder }: IconTextButtonProps) {
  return (
    <SideTextButton {...remainder} type="button" direction={direction}>
      {Icon}
      {children}
    </SideTextButton>
  );
}
