import { StyledChipButton } from './styled';

type OutlinedChipButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children?: React.ReactNode;
};

export default function OutlinedChipButton({ children, ...remainder }: OutlinedChipButtonProps) {
  return (
    <StyledChipButton type="button" {...remainder}>
      {children}
    </StyledChipButton>
  );
}
