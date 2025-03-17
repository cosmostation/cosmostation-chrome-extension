import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-is-active': boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base100,

  borderRadius: '0.8rem',
  padding: '1.2rem',

  cursor: 'pointer',

  border: props['data-is-active'] ? `0.1rem solid ${theme.palette.accentColor.purple400}` : `none`,

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const TopContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '5.8rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
  boxSizing: 'border-box',
}));

export const BodyContainer = styled('div')({
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '1.2rem',
});
