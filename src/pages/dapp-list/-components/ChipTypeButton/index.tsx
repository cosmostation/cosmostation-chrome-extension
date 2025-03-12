import { StyledChipButton } from './styled';

type ChipTypeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children?: JSX.Element;
  isActive?: boolean;
};

export default function ChipTypeButton({ children, isActive = false, ...remainder }: ChipTypeButtonProps) {
  return (
    <StyledChipButton type="button" data-is-active={isActive} {...remainder}>
      {children}
    </StyledChipButton>
  );
}
