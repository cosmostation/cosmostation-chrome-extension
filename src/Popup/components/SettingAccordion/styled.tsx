import { styled } from '@mui/material/styles';

import Accordion, { AccordionDetails, AccordionSummary } from '~/Popup/components/common/Accordion';

import BottomArrow20Icon from '~/images/icons/BottomArrow20.svg';

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `0.1rem solid ${theme.colors.base04}`,

  borderRadius: '0.8rem',
}));

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: '1.2rem 1.2rem 1.2rem 1.6rem',

  color: theme.colors.text01,

  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
}));

export const StyledAccordionDetails = styled(AccordionDetails)({
  padding: '0 1.2rem 1.2rem',
});

export const StyledBottomArrow20Icon = styled(BottomArrow20Icon)(({ theme }) => ({
  '& > path': {
    fill: theme.colors.base05,
  },
}));
