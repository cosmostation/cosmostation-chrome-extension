import { StyledChipButton } from './styled';

type ChipButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children?: JSX.Element;
  variant?: 'light' | 'dark';
};

export default function ChipButton({ children, variant, ...remainder }: ChipButtonProps) {
  return (
    <StyledChipButton type="button" variants={variant} {...remainder}>
      {children}
    </StyledChipButton>
  );
}
