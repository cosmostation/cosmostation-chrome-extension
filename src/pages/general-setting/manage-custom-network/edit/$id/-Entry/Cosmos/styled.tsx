import type { AccordionSummaryProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import Accordion, { AccordionDetails, AccordionSummary } from '@/components/common/Accordion';

import BottomChevronIcon from '@/assets/images/icons/BottomChevron18.svg';

export const Container = styled('div')({
  padding: '1.8rem 0',
});

export const InputWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '2.2rem',
});

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

export const AdvancedContainer = styled('div')({
  width: '100%',
});

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: '0',
  borderTop: `0.1rem solid ${theme.palette.color.base100}`,
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  borderRadius: '0',
}));

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => <AccordionSummary expandIcon={<BottomChevronIcon />} {...props} />)(
  ({ theme }) => ({
    padding: '1.6rem 0.4rem',

    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(180deg)',
    },

    '& .MuiAccordionSummary-expandIconWrapper': {
      '& > svg > path': {
        stroke: theme.palette.color.base600,
      },
    },
  }),
);

export const StyledAccordionDetails = styled(AccordionDetails)({
  paddingBottom: '1.2rem',
});

export const ItemLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const Footer = styled('div')(({ theme }) => ({
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: 0,
  zIndex: 1000,

  margin: '0 0 -1.2rem',
  paddingBottom: '1.2rem',

  backgroundColor: theme.palette.color.base50,
}));
