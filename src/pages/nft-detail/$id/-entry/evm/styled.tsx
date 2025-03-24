import type { AccordionSummaryProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import Accordion, { AccordionDetails, AccordionSummary } from '@/components/common/Accordion';
import BaseChainImage from '@/components/common/BaseChainImage';
import BaseNFTImage from '@/components/common/BaseNFTImage';

import BottomChevronIcon from '@/assets/images/icons/BottomChevron18.svg';

export const ContentsContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const TopContainer = styled('div')({
  width: '100%',
  margin: '1.6rem 0 1.2rem',
});

export const TopFirstContainer = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.6rem',
});

export const NFTNameContainer = styled('div')({
  display: 'flex',
  maxWidth: '80%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const NFTImageContainer = styled('div')({
  maxWidth: '60%',
  marginTop: '1.2rem',
});

export const NFTImage = styled(BaseNFTImage)({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '0.4rem',
  position: 'relative',
});

export const DescriptionContainer = styled('div')({
  width: '90%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  textAlign: 'left',
});

export const RedirectIconContainer = styled('div')(({ theme }) => ({
  width: '1.8rem',
  height: '1.8rem',

  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base1000,

    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const DetailContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '1rem',
});

export const DetailRowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const DetailRowLabelContainer = styled('div')({
  display: 'flex',
  maxWidth: '11rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const ChainContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '1.6rem',
  height: '1.6rem',
});

export const AttributesContainer = styled('div')({
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

export const StickyFooterInnerBody = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: 0,
  zIndex: 1000,
  padding: '1.2rem 0',
  marginBottom: '-1.2rem',

  backgroundColor: theme.palette.color.base50,
}));
