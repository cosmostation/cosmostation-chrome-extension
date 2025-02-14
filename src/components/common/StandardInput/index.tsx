import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import {
  BottomContainer,
  BottomWrapper,
  Container,
  HelperTextContainer,
  RightBottomAdornmentContainer,
  StyledCircularProgress,
  StyledIconButton,
  StyledInput,
} from './styled';

import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

type StandardInputProps = TextFieldProps & {
  helperText?: string;
  isLoadingHelperText?: boolean;
  rightBottomAdornment?: React.ReactNode;
};

export default function StandardInput({
  type,
  error = false,
  helperText,
  isLoadingHelperText = false,
  rightBottomAdornment,
  slotProps,
  ...remainder
}: StandardInputProps) {
  const [textFieldType, setTextFieldType] = useState<HTMLInputTypeAttribute | undefined>(type);

  const isShowBottomContainer = isLoadingHelperText || helperText || rightBottomAdornment;

  return (
    <Container>
      <StyledInput
        variant="standard"
        autoComplete="off"
        type={type === 'password' ? textFieldType : type}
        slotProps={{
          ...slotProps,
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
            ...slotProps?.input,
          },
        }}
        {...remainder}
      />
      <BottomWrapper>
        {isShowBottomContainer && (
          <BottomContainer>
            {isLoadingHelperText && !helperText && <StyledCircularProgress size={12} />}
            {helperText && (
              <HelperTextContainer data-is-error={error}>
                <Typography variant="b4_M">{helperText}</Typography>
              </HelperTextContainer>
            )}
            {rightBottomAdornment && <RightBottomAdornmentContainer>{rightBottomAdornment}</RightBottomAdornmentContainer>}
          </BottomContainer>
        )}
      </BottomWrapper>
    </Container>
  );
}
