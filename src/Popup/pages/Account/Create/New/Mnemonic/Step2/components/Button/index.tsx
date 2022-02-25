import { StyledButton } from './styled';

type ButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
};

export default function Button({ children, ...remainder }: ButtonProps) {
  return <StyledButton {...remainder}>{children}</StyledButton>;
}
