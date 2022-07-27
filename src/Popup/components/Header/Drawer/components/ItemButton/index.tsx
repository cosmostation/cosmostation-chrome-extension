import { Typography } from '@mui/material';

import { ItemButtonContainer, ItemLeftContainer, ItemLeftImageContainer, ItemLeftTextContainer, ItemRightContainer } from './styled';

import RightArrowIcon from '~/images/icons/RightArrow.svg';

type ItemButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: string;
  Icon: SvgElement;
};

export default function ItemButton({ onClick, children, Icon }: ItemButtonProps) {
  return (
    <ItemButtonContainer onClick={onClick}>
      <ItemLeftContainer>
        <ItemLeftImageContainer>
          <Icon />
        </ItemLeftImageContainer>
        <ItemLeftTextContainer>
          <Typography variant="h4">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <RightArrowIcon />
      </ItemRightContainer>
    </ItemButtonContainer>
  );
}
