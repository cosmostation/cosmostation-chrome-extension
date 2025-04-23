import { StyledButton } from './styled';

type BaseButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export default function BaseButton({ ...remainder }: BaseButtonProps) {
  return <StyledButton type="button" {...remainder} />;
}
