import { type TextFieldProps, Typography } from '@mui/material';

import { BottomContainer, HelperTextContainer, RightBottomAdornmentContainer, StyledInput } from './styled';

type StandardInputProps = TextFieldProps & {
  helperText?: string;
  rightBottomAdornment?: React.ReactNode;
};

export default function StandardInput({ error = false, helperText, rightBottomAdornment, ...remainder }: StandardInputProps) {
  const isShowBottomContainer = helperText || rightBottomAdornment;

  return (
    <>
      <StyledInput variant="standard" autoComplete="off" {...remainder} />
      {isShowBottomContainer && (
        <BottomContainer>
          {helperText && (
            <HelperTextContainer data-is-error={error}>
              <Typography variant="b4_M">{helperText}</Typography>
            </HelperTextContainer>
          )}
          {rightBottomAdornment && <RightBottomAdornmentContainer>{rightBottomAdornment}</RightBottomAdornmentContainer>}
        </BottomContainer>
      )}
    </>
  );
}
