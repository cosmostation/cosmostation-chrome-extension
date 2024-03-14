import { LeftContainer, RightContainer, StyledButton } from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type AssetBottomSheetButton = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isOpenBottomSheet?: boolean;
  leftProps?: React.ReactNode;
};

export default function AssetBottomSheetButton({ isOpenBottomSheet, leftProps, ...remainder }: AssetBottomSheetButton) {
  return (
    <StyledButton type="button" {...remainder}>
      <LeftContainer>{leftProps}</LeftContainer>
      <RightContainer data-is-active={isOpenBottomSheet ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </StyledButton>
  );
}
