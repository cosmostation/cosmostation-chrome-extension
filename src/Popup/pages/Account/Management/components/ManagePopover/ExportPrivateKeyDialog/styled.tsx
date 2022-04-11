import { styled } from '@mui/material/styles';

import ChainPopover from '~/Popup/components/ChainPopover';
import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const ChainContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '1.2rem',
});

export const HdPathTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  flexShrink: 0,

  '& > *': {
    maxWidth: '12rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const InputContainer = styled('div')({});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const StyledButton = styled(Button)({
  marginTop: '1.7rem',
  height: '4rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',

  marginTop: '2rem',
});
export const DescriptionImageContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,
  },
}));

export const DescriptionTextContainer = styled('div')({
  marginLeft: '0.5rem',

  wordBreak: 'break-word',
});

export const AccentText = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const StyledChainPopover = styled(ChainPopover)({
  '& .MuiPaper-root': {
    marginLeft: '-1.6rem',

    '& > div': {
      width: '31.6rem',
      maxHeight: '25rem',
    },
  },
});
