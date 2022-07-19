import type { AccordionProps } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledAccordion = styled((props: AccordionProps) => <Accordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `0.1rem solid ${theme.colors.base04}`,

  borderRadius: '0.8rem',

  backgroundColor: 'transparent',

  '&:before': {
    display: 'none',
  },
}));

export const StyledAccordionSummary = styled(AccordionSummary)({
  padding: 0,
  margin: 0,
  minHeight: 0,

  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
});

export const StyledAccordionDetails = styled(AccordionDetails)({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
});
