import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Switch from '~/Popup/components/common/Switch';

import { ItemContainer, ItemLeftContainer, ItemLeftImageContainer, ItemLeftTextContainer, ItemRightContainer } from './styled';

type ItemProps = {
  imageProps?: React.ComponentProps<typeof Image>;
  switchProps?: React.ComponentProps<typeof Switch>;
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
          <Typography variant="h5">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
