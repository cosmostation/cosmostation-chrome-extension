import type { AccordionProps } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  width: '100%',

  borderRadius: '0.8rem',

  padding: '1.6rem 1.6rem 0',

  position: 'relative',
}));

export const FirstLineContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '2.4rem',
});

export const FirstLineLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const FirstLineRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const StyledIconButton = styled(IconButton)({
  marginRight: '-0.8rem',
});

export const SecondLineContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  margin: '1.6rem 0 1.2rem',
});

export const SecondLineLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const SecondLineLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'relative',
  width: '3.8rem',
  height: '3.8rem',
});

export const SecondLineLeftAbsoluteImageContainer = styled('div')({
  position: 'absolute',

  width: '3.8rem',
  height: '3.8rem',

  '& > img': {
    width: '3.8rem',
    height: '3.8rem',
  },
});

export const SecondLineLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'flex-start',

  marginLeft: '1rem',

  rowGap: '0.2rem',

  color: theme.colors.text01,
}));

export const SecondLineLeftSubTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.6rem',

  color: theme.colors.text02,
}));

export const SecondLineLeftSubTextEmptyContainer = styled('div')({
  height: '1.9rem',
});

export const SecondLineRightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'flex-end',

  rowGap: '0.3rem',
});

export const SecondLineRightTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const SecondLineRightSubTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type TextChangeRateContainerProps = {
  'data-color'?: 'red' | 'green' | 'grey';
};

export const TextChangeRateContainer = styled('div')<TextChangeRateContainerProps>(({ theme, ...props }) => ({
  color: props['data-color'] === 'red' ? theme.accentColors.red : props['data-color'] === 'green' ? theme.accentColors.green01 : theme.colors.text02,
}));

export const StyledDivider = styled(Divider)({
  margin: '0 0 1.2rem',
});

export const FourthLineContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',

  paddingBottom: '1.2rem',

  rowGap: '0.4rem',
});

export const FourthLineContainerItem = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const FourthLineContainerItemLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const FourthLineContainerItemRight = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const StyledAccordion = styled((props: AccordionProps) => <Accordion disableGutters elevation={0} square {...props} />)({
  border: 0,

  backgroundColor: 'transparent',

  '&:before': {
    display: 'none',
  },
});

export const StyledAccordionSummary = styled(AccordionSummary)({
  padding: 0,
  minHeight: 0,
  maxHeight: 0,
});

export const StyledAccordionDetails = styled(AccordionDetails)({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
});

type ExpandedButtonProps = {
  'data-is-expanded'?: number;
};

export const ExpandedButton = styled('button')<ExpandedButtonProps>(({ theme, ...props }) => ({
  border: 0,
  paddingBottom: '1rem',

  backgroundColor: 'transparent',
  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  cursor: 'pointer',

  '& > svg': {
    transform: props['data-is-expanded'] ? 'rotate(180deg)' : 'none',

    '& > path': {
      fill: theme.colors.base05,
    },
  },

  '&:hover': {
    '& > svg': {
      '& > path': {
        fill: theme.colors.base06,
      },
    },
  },
}));

export const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  paddingBottom: '1rem',

  columnGap: '0.8rem',
});

export const StyledRetryIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const FaucetButtonContainer = styled('div')({
  marginBottom: '1rem',
});

export const ErrorDescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  color: theme.accentColors.red,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});
