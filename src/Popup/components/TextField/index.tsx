import type { HTMLInputTypeAttribute } from 'react';
import { useState } from 'react';
import type { OutlinedInputProps } from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';

import { StyledTextField, StyledVisibility, StyledVisibilityOff } from './styled';

export default function TextField({ type, ...remainder }: OutlinedInputProps) {
  const [textFieldType, setTextFieldType] = useState<HTMLInputTypeAttribute | undefined>(type);

  return (
    <StyledTextField
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
    />
  );
}
