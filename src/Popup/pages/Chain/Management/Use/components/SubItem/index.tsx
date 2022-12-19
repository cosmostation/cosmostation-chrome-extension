import type { SwitchProps } from '@mui/material';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { ItemContainer, ItemLeftContainer, ItemLeftImageContainer, ItemLeftTextContainer, ItemRightContainer, StyledSwitch } from './styled';

type ItemProps = {
  imageProps?: React.ComponentProps<typeof Image>;
  switchProps?: SwitchProps;
  children?: string;
};

export default function Item({ children, imageProps, switchProps }: ItemProps) {
  return (
    <ItemContainer>
      <ItemLeftContainer>
        <ItemLeftImageContainer>
          <Image {...imageProps} />
        </ItemLeftImageContainer>
        <ItemLeftTextContainer>
          <Typography variant="h6">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <StyledSwitch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
