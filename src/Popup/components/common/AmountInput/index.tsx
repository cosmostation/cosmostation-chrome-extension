import type { OutlinedInputProps } from '@mui/material';
import { Typography } from '@mui/material';

import { HelperContainer, HelperTextContainer, StyledTextField } from './styled';

type AmountInputProps = OutlinedInputProps & {
  helperText?: string;
};
export default function AmountInput({ helperText, ...remainder }: AmountInputProps) {
  return (
    <>
      <StyledTextField {...remainder} />
      <HelperContainer>
        {helperText && (
          <HelperTextContainer>
            <Typography variant="h6">{helperText}</Typography>
          </HelperTextContainer>
        )}
      </HelperContainer>
    </>
  );
}
