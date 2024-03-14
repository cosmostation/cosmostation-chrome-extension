import { ContentContainer, ContentRightImageContainer, StyledButton } from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type SwapAssetButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive: boolean;
  leftProps: React.ReactNode;
  isAvailable?: boolean;
};

export default function SwapAssetButton({ leftProps, isAvailable = true, isActive, ...remainder }: SwapAssetButtonProps) {
  return (
    <StyledButton {...remainder} disabled={!isAvailable} type="button">
      <ContentContainer>
        {leftProps}
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
