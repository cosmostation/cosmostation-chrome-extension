import { styled } from '@mui/material/styles';

type EllipsisAmountContainerProps = {
  'data-max-width': string;
};

export const EllipsisAmountContainer = styled('div')<EllipsisAmountContainerProps>(({ ...props }) => ({
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: `${props['data-max-width']}rem`,

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
