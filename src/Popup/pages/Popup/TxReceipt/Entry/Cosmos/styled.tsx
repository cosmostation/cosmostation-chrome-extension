import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  padding: '0.6rem 1.2rem 1.2rem',

  position: 'relative',

  height: '100%',
});

export const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  color: theme.colors.text01,
}));

export const CategoryTitleContainer = styled('div')({});

export const ContentContainer = styled('div')(({ theme }) => ({
  height: 'calc(100% - 10.5rem)',

  display: 'flex',
  flexDirection: 'column',

  overflow: 'auto',

  padding: '1.6rem',
  marginTop: '1.4rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  color: theme.colors.text01,

  rowGap: '1rem',
}));

export const StyledDividerContainer = styled('div')({
  width: '100%',
});

export const StyledDivider = styled(Divider)({
  margin: '0.6rem 0',
});

export const NetworkImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '2rem',
  height: '2rem',
  position: 'relative',
});

type AbsoluteNetworkImageContainerProps = {
  'data-is-custom'?: boolean;
};

export const AbsoluteImageContainer = styled('div')<AbsoluteNetworkImageContainerProps>(({ ...props }) => ({
  position: 'absolute',

  width: '2rem',
  height: '2rem',

  '& > img': {
    width: props['data-is-custom'] ? '1.6rem' : '2rem',
    height: props['data-is-custom'] ? '1.6rem' : '2rem',

    margin: props['data-is-custom'] ? '0.2rem' : '0',
  },
}));

export const EmptyAssetContainer = styled('div')({
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ItemContainer = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  color: theme.colors.text01,
}));

export const FeeItemContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',

  color: theme.colors.text01,
}));

export const ItemColumnContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  rowGap: '0.8rem',
});

export const ItemTitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  color: theme.colors.text02,
}));

export const ItemLabelContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  '& svg': {
    width: '1.6rem',
    height: '1.6rem',
    '& > path': {
      fill: theme.colors.base06,
    },
    '&:hover': {
      '& > path': {
        fill: theme.colors.base05,
      },
    },
  },
}));

export const ImageTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '0.4rem',
});

export const TxHashContainer = styled('div')({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

type IconContainerProps = {
  'data-is-success': boolean;
};

export const IconContainer = styled('div')<IconContainerProps>(({ theme, ...props }) => ({
  width: '1.6rem',
  height: '1.6rem',

  borderRadius: '50%',

  backgroundColor: props['data-is-success'] ? theme.accentColors.green01 : theme.accentColors.red,

  '& > svg': {
    fill: theme.accentColors.white,
    '& > path': {
      fill: theme.accentColors.white,
    },
  },
}));

type HeaderTitleProps = {
  'data-is-success': boolean;
};

export const HeaderTitle = styled('div')<HeaderTitleProps>(({ theme, ...props }) => ({
  color: props['data-is-success'] ? theme.accentColors.green01 : theme.accentColors.red,
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const IconButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.4rem',
});

export const RightColumnContainer = styled('div')({});

export const Div = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const DenomContainer = styled('div')({
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '10rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
