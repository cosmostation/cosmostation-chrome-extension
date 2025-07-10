import { styled } from '@mui/material/styles';

type StyledIconButtonProps = {
  direction?: 'horizontal' | 'vertical';
  'data-is-hovering'?: boolean;
};

export const StyledIconButton = styled('button')<StyledIconButtonProps>(({ ...props }) => ({
  border: 0,

  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  flexDirection: props.direction === 'vertical' ? 'column' : 'row',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',
  '&:disabled': {
    cursor: 'default',
  },

  padding: '0',

  // note 이게 data-is-hovering이 값이 할당이 안되는 컴포넌트에 한해서 호버링에 영향주는지 확인필요.
  opacity: props['data-is-hovering'] ? 0.7 : 1,

  '&:hover': {
    opacity: 0.7,
    '&:disabled': {
      opacity: 1,
    },
  },
}));
