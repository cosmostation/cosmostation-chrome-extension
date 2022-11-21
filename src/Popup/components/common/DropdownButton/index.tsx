import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';

import {
  DropdownContainerButton,
  DropdownLeftContainer,
  DropdownLeftHeaderTitleContainer,
  DropdownLeftImageContainer,
  DropdownLeftInfoContainer,
  DropdownRightContainer,
  DropdownTitleContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type DropdownButtonProps = {
  imgSrc?: string;
  title: string;
  leftSubTitle?: string;
  leftHeaderTitle?: string;
  isOpenPopover?: boolean;
  decimals?: number;
  onClickDropdown: (currentTarget: EventTarget & HTMLButtonElement) => void;
};
export default function DropdownButton({ imgSrc, onClickDropdown, isOpenPopover, title, leftSubTitle, leftHeaderTitle, decimals }: DropdownButtonProps) {
  return (
    <DropdownContainerButton
      type="button"
      onClick={(event) => {
        onClickDropdown(event.currentTarget);
      }}
    >
      <DropdownLeftContainer>
        <DropdownLeftImageContainer>
          <Image src={imgSrc} />
        </DropdownLeftImageContainer>
        <DropdownLeftInfoContainer>
          <DropdownTitleContainer>
            <Typography variant="h5">{title}</Typography>
          </DropdownTitleContainer>
          <DropdownLeftHeaderTitleContainer>
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
          </DropdownLeftHeaderTitleContainer>
        </DropdownLeftInfoContainer>
      </DropdownLeftContainer>
      <DropdownRightContainer data-is-active={isOpenPopover ? 1 : 0}>
        <BottomArrow24Icon />
      </DropdownRightContainer>
    </DropdownContainerButton>
  );
}
