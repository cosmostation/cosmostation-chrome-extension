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
          <Typography variant="h6">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch
          {...switchProps}
          sx={{
            width: '4.2rem',
            height: '2.4rem',
            '& .MuiSwitch-switchBase': {
              padding: '0.4rem 0.1rem 0.4rem 0.4rem',
              '&.Mui-checked': {
                padding: '0.4rem 0.4rem 0.4rem 0.1rem',
              },
            },
            '& .MuiSwitch-thumb': {
              width: '1.6rem',
              height: '1.6rem',
            },
          }}
        />
      </ItemRightContainer>
    </ItemContainer>
  );
}
