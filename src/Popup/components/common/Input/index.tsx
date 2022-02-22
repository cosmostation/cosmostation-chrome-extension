import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import type { OutlinedInputProps } from '@mui/material';
import { InputAdornment, Typography } from '@mui/material';

import IconButton from '~/Popup/components/common/IconButton';

import { HelperContainer, HelperImageContainer, HelperTextContainer, StyledTextField, StyledVisibility, StyledVisibilityOff } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type InputProps = OutlinedInputProps & {
  helperText?: string;
};

export default function Input({ type, helperText, multiline, ...remainder }: InputProps) {
  const [textFieldType, setTextFieldType] = useState<HTMLInputTypeAttribute | undefined>(type);

  return (
    <>
      <StyledTextField
        data-is-multiline-password={multiline && textFieldType === 'password' ? 1 : 0}
        type={type === 'password' ? textFieldType : type}
        endAdornment={
          type === 'password' && (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setTextFieldType((prev) => (prev === 'password' ? 'text' : 'password'));
                }}
                edge="end"
              >
                {textFieldType === 'password' ? <StyledVisibility /> : <StyledVisibilityOff />}
              </IconButton>
            </InputAdornment>
          )
        }
        {...remainder}
        multiline={multiline}
      />
      {helperText && (
        <HelperContainer>
          {remainder.error && (
            <HelperImageContainer>
              <Info16Icon />
            </HelperImageContainer>
          )}
          <HelperTextContainer error={remainder.error ? 1 : 0}>
            <Typography variant="h6">{helperText}</Typography>
          </HelperTextContainer>
        </HelperContainer>
      )}
    </>
  );
}
