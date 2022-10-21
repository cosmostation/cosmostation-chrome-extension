import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
// https://mui-treasury.com/styles/tabs/#Apple
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: 0,
    borderRadius: '5rem',
    // FIXME 17.2
    width: '17.2rem',
    height: '3.2rem',
    backgroundColor: theme.colors.base03,
    // flexContainer: {
    //   display: 'inline-flex',
    //   position: 'relative',
    //   zIndex: 1,
    // },
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    padding: '0.4rem',
  },
  '& .MuiTabs-scroller': {
    [theme.breakpoints.up('md')]: {
      padding: '0 8px',
    },
  },
  '& .MuiTabs-indicator': {
    top: 6,
    // bottom: 1,
    // right: 3,
    borderRadius: '0.5rem',
    height: 'auto',
    background: 'none',
    '&:after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 4,
      right: 4,
      bottom: 0,
      borderRadius: 8,
      backgroundColor: theme.accentColors.purple01,
      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
    },
  },
  // NOTE 움직이는 놈
  // '& .MuiTabs-indicator': {
  //   display: 'flex',
  //   alignItems: 'center',
  //   // bottom: 3,
  //   // right: 3,
  //   // left: 3,
  //   width: '3rem',
  //   height: '2.4rem',
  //   background: 'none',
  //   borderRadius: '5rem',
  //   backgroundColor: theme.accentColors.purple01,
  //   // '&:after': {
  //   //   content: '""',
  //   //   display: 'block',
  //   //   position: 'absolute',
  //   // top: 4,
  //   // left: 4,
  //   // right: 4,
  //   // bottom: 1,
  //   // borderRadius: '5rem',
  //   // backgroundColor: theme.accentColors.purple01,
  //   // boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
  //   // },
  // },
}));

// export const StyledTabs = styled(Tabs)(({ theme }) => ({
//   '&.MuiTabs-root': {
//     backgroundColor: theme.colors.base03,
//     borderRadius: '0.5rem',
//     height: '3.2rem',
//     minwidth: '17.2rem',
//   },
//   flexContainer: {
//     display: 'inline-flex',
//     position: 'relative',
//     zIndex: 1,
//   },
//   scroller: {
//     [theme.breakpoints.up('md')]: {
//       padding: '0 8px',
//     },
//   },
//   '& .MuiTabs-indicator': {
//     top: 3,
//     bottom: 3,
//     right: 3,
//     borderRadius: '0.5rem',
//     height: '2.4rem',
//     background: 'none',
//     '&:after': {
//       content: '""',
//       display: 'block',
//       position: 'absolute',
//       top: 0,
//       left: 4,
//       right: 4,
//       bottom: 0,
//       borderRadius: 8,
//       backgroundColor: theme.accentColors.purple01,
//       boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
//     },
//   },
// }));

// NOTE origin
// export const StyledTab = styled(Tab)(({ theme }) => ({
//   zIndex: 2,
//   '&.MuiTab-root': {
//     '&:hover': {
//       opacity: 0.7,
//       color: theme.colors.text01,
//     },
//     // textTransform: 'initial',
//     color: theme.colors.text02,
//     fontFamily: theme.typography.h5.fontFamily,
//     fontStyle: theme.typography.h5.fontStyle,
//     fontSize: theme.typography.h5.fontSize,
//     lineHeight: theme.typography.h5.lineHeight,
//     letterSpacing: theme.typography.h5.letterSpacing,
//     backgroundColor: 'transparent',
//     // width: '5rem',
//     // minHeight: 0,
//     //  minWidth: '5rem',
//   },
//   '&.Mui-selected': { opacity: 1, color: theme.colors.text01 },
// }));

export const StyledTab = styled(Tab)(({ theme }) => ({
  zIndex: 2,
  '&.MuiTabs-root': {
    width: '8.6rem',
    height: '3.2rem',
    padding: '0',
  },
  // root: {
  //   '&:hover': {
  //     opacity: 1,
  //   },
  //   minHeight: 44,
  //   minWidth: 96,
  //   [theme.breakpoints.up('md')]: {
  //     minWidth: 120,
  //   },
  // },
  wrapper: {
    // zIndex: 2,
    // marginTop: spacing(0.5),
    color: theme.colors.text01,
    textTransform: 'initial',
  },
  '&.Mui-selected': { opacity: 1, color: theme.colors.text01 },
}));

export const TabsContainer = styled('div')({ position: 'relative' });
// NOTE 이러면 서큐러 탭의 탭패널만 마진탑이 다른데... 이거 상관없나?
export const TabPanelContainer = styled('div')({
  marginTop: '1.4rem',
});
