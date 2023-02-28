import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import {
  ContentCenterTextContainer,
  ContentContainer,
  ContentLeftAbsoluteImageContainer,
  ContentLeftContainer,
  ContentLeftImageContainer,
  ContentPlaceholderContainer,
  ContentRightImageContainer,
  StyledButton,
} from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type SwapAssetButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  placeholder: string;
  imgUrl?: string;
  title?: string;
  isActive?: boolean;
  isAvailable?: boolean;
};

export default function SwapAssetButton({ imgUrl, title, isAvailable = true, isActive = false, placeholder, ...remainder }: SwapAssetButtonProps) {
  return (
    <StyledButton {...remainder} disabled={!isAvailable} type="button">
      <ContentContainer>
        {imgUrl && title ? (
          <ContentLeftContainer>
            <ContentLeftImageContainer>
              <ContentLeftAbsoluteImageContainer>
                <Image src={imgUrl} />
              </ContentLeftAbsoluteImageContainer>
            </ContentLeftImageContainer>
            <ContentCenterTextContainer>
              <Typography variant="h6">{title}</Typography>
            </ContentCenterTextContainer>
          </ContentLeftContainer>
        ) : (
          <ContentLeftContainer>
            <ContentPlaceholderContainer data-is-disabled={!isAvailable}>
              <Typography variant="h6">{placeholder}</Typography>
            </ContentPlaceholderContainer>
          </ContentLeftContainer>
        )}

        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
