import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  padding: '0 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',
  margin: '5rem 1.6rem 0',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  color: theme.colors.text01,
}));

export const StyledDivider = styled(Divider)({
  margin: '1.6rem 0',
});

export const ItemContainer = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
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

  columnGap: '0.8rem',

  color: theme.colors.text02,
}));

export const ItemLabelContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledIconButton = styled(IconButton)({
  marginRight: '-0.8rem',
});

export const TxResultTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '0.8rem',

  // marginBottom: '4rem',
});

export const TxHashContainer = styled('div')({
  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const CheckIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  borderRadius: '50%',

  backgroundColor: theme.accentColors.green01,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.accentColors.green01,
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});
