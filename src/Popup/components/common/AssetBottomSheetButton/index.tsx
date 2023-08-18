import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';

import { LeftContainer, LeftHeaderTitleContainer, LeftImageContainer, LeftInfoContainer, RightContainer, StyledButton, TitleContainer } from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type AssetBottomSheetButton = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  title: string;
  leftSubTitle?: string;
  leftHeaderTitle?: string;
  isOpenBottomSheet?: boolean;
  decimals?: number;
};

export default function AssetBottomSheetButton({
  imgSrc,
  isOpenBottomSheet,
  title,
  leftSubTitle,
  leftHeaderTitle,
  decimals,
  ...remainder
}: AssetBottomSheetButton) {
  return (
    <StyledButton type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imgSrc} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <TitleContainer>
            <Typography variant="h5">{title}</Typography>
          </TitleContainer>
          <LeftHeaderTitleContainer>
            <Typography variant="h6n">{leftHeaderTitle}</Typography>
            {decimals && leftSubTitle && (
              <>
                <Typography variant="h6n"> :</Typography>{' '}
                <Tooltip title={leftSubTitle} arrow placement="top">
                  <span>
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={decimals}>
                      {leftSubTitle}
                    </Number>
                  </span>
                </Tooltip>
              </>
            )}
          </LeftHeaderTitleContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isOpenBottomSheet ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </StyledButton>
  );
}
