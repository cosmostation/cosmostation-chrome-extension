import { forwardRef } from 'react';
import type { AccordionProps } from '@mui/material';
import { Typography } from '@mui/material';

import type { AccountWithName } from '~/types/extensionStorage';

import { StyledAccordion, StyledAccordionDetails, StyledAccordionSummary, StyledBottomArrow20Icon } from './styled';

type SettingAccordionProps = Omit<AccordionProps, 'children'> & { children?: JSX.Element; account: AccountWithName };

const SettingAccordion = forwardRef<HTMLDivElement, SettingAccordionProps>(({ children, account, ...remainder }, ref) => (
  <StyledAccordion {...remainder}>
    <StyledAccordionSummary expandIcon={<StyledBottomArrow20Icon />}>
      <Typography variant="h4">{account.name}</Typography>
    </StyledAccordionSummary>
    <StyledAccordionDetails ref={ref}>{children}</StyledAccordionDetails>
  </StyledAccordion>
));

export default SettingAccordion;
