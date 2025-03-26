import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  width: '100%',
});

export const EmptyAssetContainer = styled('div')({
  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '1rem',
});

export const MnemonicIconContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const AlertContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const CautionIconContainer = styled('div')(({ theme }) => ({
  width: '1.2rem',
  height: '1.2rem',

  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.accentColor.red400,
    '& > path': {
      fill: theme.palette.accentColor.red400,
    },
  },
}));

export const CautionText = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.red400,
}));
