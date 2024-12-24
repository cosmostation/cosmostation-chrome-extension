import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import type { OutlinedInputProps as BaseOutlinedInputProps } from '@mui/material';
import { InputAdornment, Typography } from '@mui/material';

import { BottomContainer, BottomWrapper, Container, HelperTextContainer, RightBottomAdornmentContainer, StyledIconButton, StyledInput } from './styled';

import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export type OutlinedInputProps = BaseOutlinedInputProps & {
  helperText?: string;
  rightBottomAdornment?: React.ReactNode;
  hideViewIcon?: boolean;
};

export default function OutlinedInput({
  type,
  error = false,
  hideViewIcon = false,
  helperText,
  rightBottomAdornment,
  slotProps,
  ...remainder
}: OutlinedInputProps) {
  const [textFieldType, setTextFieldType] = useState<HTMLInputTypeAttribute | undefined>(type);

  const isShowBottomContainer = helperText || rightBottomAdornment;

  return (
    <Container>
      <StyledInput
        autoComplete="off"
        type={type === 'password' ? textFieldType : type}
        endAdornment={
          type === 'password' &&
          !hideViewIcon && (
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
          )
        }
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
          },
        }}
        {...remainder}
      />
      <BottomWrapper>
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
      </BottomWrapper>
    </Container>
  );
}
