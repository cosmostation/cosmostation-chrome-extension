import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const WrapperContainer = styled('div')({
  width: '100%',
});

export const Container = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  paddingBottom: '1.2rem',

  borderBottom: `0.06rem solid ${theme.palette.color.base200}`,
}));

export const TopContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  margin: '1.6rem 0 0.8rem',

  padding: '0 1.6rem',

  boxSizing: 'border-box',
});

export const TopLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.4rem',
});

export const IconButtonText = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,

  marginLeft: '0.2rem',
}));

export const BodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const AccountButton = styled('button')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  border: 'none',
  background: 'none',

  cursor: 'pointer',

  padding: '1.3rem 1.6rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const AccountImgContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',
  minWidth: '2.8rem',
});

export const AccountLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '1rem',

  marginRight: 'auto',
});

export const AccountInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  rowGap: '0.4rem',
});

export const TitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

type BadgeProps = {
  colorHex?: string;
};

export const Badge = styled('div')<BadgeProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '0.1rem',
  backgroundColor: props['colorHex'] || theme.palette.color.base400,
  color: props['colorHex'] ? theme.palette.color.base1300 : theme.palette.color.base1200,

  padding: '0.2rem 0.6rem',
  borderRadius: '2rem',
}));

export const AddressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1200,
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  overflowWrap: 'break-word',
  textAlign: 'left',
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
