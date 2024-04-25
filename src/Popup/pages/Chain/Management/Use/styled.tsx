import type { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';

import Accordion, { AccordionDetails, AccordionSummary } from '~/Popup/components/common/Accordion';
import Input from '~/Popup/components/common/Input';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  overflow: 'auto',
});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const ItemLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ItemLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const ItemLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginLeft: '0.4rem',
}));

export const ChainAccordionContainer = styled('div')({
  marginTop: '1.6rem',
});

export const StyledChainAccordion = styled(Accordion)(({ theme }) => ({
  border: '0',
  borderTop: `0.1rem solid ${theme.colors.base04}`,
  borderRadius: '0',
}));

type StyledAccordionSummaryProps = {
  'data-is-expanded': boolean;
  'data-is-exists': boolean;
};

export const StyledChainAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary expandIcon={<BottomArrow24Icon />} {...props} />
))<StyledAccordionSummaryProps>(({ theme, ...props }) => ({
  padding: props['data-is-expanded'] ? (props['data-is-exists'] ? '1.2rem 0.4rem 0.8rem' : '1.2rem 0.4rem 0.45rem') : '1.2rem 0.4rem',

  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },

  '& .MuiAccordionSummary-expandIconWrapper': {
    '& > svg > path': {
      stroke: theme.colors.base05,
    },
  },
}));

type StyledAccordionDetailsProps = {
  'data-is-exists': boolean;
};

export const StyledChainAccordionDetails = styled(AccordionDetails)<StyledAccordionDetailsProps>((props) => ({
  paddingBottom: props['data-is-exists'] ? '1.2rem' : '1.4rem',
}));

export const NoResultsContainer = styled('div')(({ theme }) => ({
  paddingLeft: '3.6rem',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.4rem',

  color: theme.colors.text02,

  '& > svg > path': {
    fill: theme.colors.base05,
  },
}));
