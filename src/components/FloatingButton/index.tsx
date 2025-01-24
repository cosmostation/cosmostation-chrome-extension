import { useScrollThresholdStore } from '@/zustand/hooks/useScrollThresholdStore';

import { StyledButton } from './styled';

export type FloatingButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  hideByScroll?: boolean;
  children?: JSX.Element;
};

export default function FloatingButton({ hideByScroll = true, children, ...remainder }: FloatingButtonProps) {
  const { isThresholdExceeded } = useScrollThresholdStore((state) => state);

  if (hideByScroll && isThresholdExceeded) {
    return null;
  }

  return (
    <StyledButton type="button" {...remainder}>
      {children}
    </StyledButton>
  );
}
