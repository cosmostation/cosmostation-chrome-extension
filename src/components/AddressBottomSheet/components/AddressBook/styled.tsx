import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseOptionButton from '@/components/common/BaseOptionButton';

export const Container = styled('div')({
  height: '100%',
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  paddingBottom: '1.2rem',
  paddingTop: '1rem',
  overflow: 'auto',
});

export const StyledOptionButton = styled(BaseOptionButton)({
  width: '100%',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const LabelContainer = styled('div')({
  width: '100%',
  display: 'flex',
  columnGap: '0.4rem',
  marginBottom: '0.6rem',
});

export const AddressContainer = styled('div')(({ theme }) => ({
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  overflowWrap: 'break-word',
  textAlign: 'left',
  color: theme.palette.color.base1200,
}));

export const MemoContainer = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  marginBottom: '0.8rem',
});

export const MemoContentsContainer = styled('div')({
  display: 'flex',
  maxWidth: '27rem',
  wordBreak: 'break-all',
  wordWrap: 'break-word',
  textAlign: 'left',
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

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
