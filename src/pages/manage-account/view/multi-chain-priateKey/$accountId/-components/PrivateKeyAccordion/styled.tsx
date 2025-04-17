import type { AccordionSummaryProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import Accordion, { AccordionDetails, AccordionSummary } from '@/components/common/Accordion';
import Base1300Text from '@/components/common/Base1300Text';

import BottomChevronIcon from '@/assets/images/icons/BottomChevron18.svg';

export const StyledChainAccordion = styled(Accordion)(({ theme }) => ({
  border: '0',
  borderTop: `0.06rem solid ${theme.palette.color.base100}`,
  borderRadius: '0',
}));

export const StyledChainAccordionSummary = styled((props: AccordionSummaryProps) => <AccordionSummary expandIcon={<BottomChevronIcon />} {...props} />)(
  ({ theme }) => ({
    padding: '1.2rem 0.4rem',

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

export const StyledChainAccordionDetails = styled(AccordionDetails)({
  paddingBottom: '1.2rem',
});

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
    width: '3.6rem',
    height: '3.6rem',
  },
});

export const ItemLeftTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: '0.4rem',
});

export const ItemLeftHdPathTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const PrivateKeyViewer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: '0.6rem',
  border: `0.1rem solid ${theme.palette.color.base200}`,
  padding: '1.2rem',
  backgroundColor: theme.palette.color.base100,
}));

export const PrivateKeyText = styled(Base1300Text)({
  width: '90%',
  wordBreak: 'break-all',
});
