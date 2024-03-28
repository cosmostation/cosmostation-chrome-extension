import type { AccordionProps } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
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

  marginTop: '1.6rem',
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
  width: '2.4rem',
  height: '2.4rem',
});

export const SecondLineLeftAbsoluteImageContainer = styled('div')({
  position: 'absolute',

  width: '2.4rem',
  height: '2.4rem',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const SecondLineLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: '0.8rem',

  color: theme.colors.text01,
}));

export const SecondLineRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const ThirdLineContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const FourthLineContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',

  paddingTop: '1rem',

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

  padding: '1rem 0',

  columnGap: '0.8rem',
});

export const StyledRetryIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: '-0.8rem',

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const FaucetButtonContainer = styled('div')({
  marginTop: '1.6rem',
});

export const ErrorDescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.red,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});
