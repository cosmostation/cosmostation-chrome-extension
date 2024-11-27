import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import { BottomContainer, Container, HelperTextContainer, RightBottomAdornmentContainer, StyledIconButton, StyledInput } from './styled';

import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

type StandardInputProps = TextFieldProps & {
  helperText?: string;
  rightBottomAdornment?: React.ReactNode;
};

export default function StandardInput({ type, error = false, helperText, rightBottomAdornment, ...remainder }: StandardInputProps) {
  const [textFieldType, setTextFieldType] = useState<HTMLInputTypeAttribute | undefined>(type);

  const isShowBottomContainer = helperText || rightBottomAdornment;

  return (
    <Container>
      <StyledInput
        variant="standard"
        autoComplete="off"
        type={type === 'password' ? textFieldType : type}
        slotProps={{
          input: {
            endAdornment: type === 'password' && (
              <InputAdornment position="end">
                <StyledIconButton
                  onClick={() => {
                    setTextFieldType((prev) => (prev === 'password' ? 'text' : 'password'));
                  }}
                  edge="end"
                >
                  {textFieldType === 'password' ? <ViewIcon /> : <ViewHideIcon />}
                </StyledIconButton>
              </InputAdornment>
            ),
          },
        }}
        {...remainder}
      />
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
    </Container>
  );
}
