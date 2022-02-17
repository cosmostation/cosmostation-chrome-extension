import { InputAdornment, Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Image from '~/Popup/components/common/Image';
import Switch from '~/Popup/components/common/Switch';

import {
  Container,
  DividerContainer,
  ItemContainer,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  ItemRightContainer,
  ListContainer,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

export default function Entry() {
  return (
    <Container>
      <StyledInput
        startAdornment={
          <InputAdornment position="start">
            <StyledSearch20Icon />
          </InputAdornment>
        }
      />
      <ListContainer>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <DividerContainer>
          <Divider />
        </DividerContainer>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
        <Item>Cosmos</Item>
      </ListContainer>
    </Container>
  );
}

type ItemProps = {
  imageProps?: React.ComponentProps<typeof Image>;
  switchProps?: React.ComponentProps<typeof Switch>;
  children?: string;
};

function Item({ children, imageProps, switchProps }: ItemProps) {
  const chainName = children ? `${children.substring(0, 1).toUpperCase()}${children.substring(1).toLowerCase()}` : '';

  return (
    <ItemContainer>
      <ItemLeftContainer>
        <ItemLeftImageContainer>
          <Image {...imageProps} />
        </ItemLeftImageContainer>
        <ItemLeftTextContainer>
          <Typography variant="h5">{chainName}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
