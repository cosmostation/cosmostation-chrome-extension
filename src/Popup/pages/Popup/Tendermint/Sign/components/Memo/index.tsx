import { Typography } from '@mui/material';

import { EditContainer, NoEditContainer, NoEditContentContainer, NoEditTitleContainer, StyledInput } from './styled';

type MemoProps = {
  isEdit?: boolean;
  memo?: string;
  onChange?: (memo: string) => void;
};
export default function Memo({ isEdit = false, memo, onChange }: MemoProps) {
  if (isEdit) {
    return (
      <EditContainer>
        <StyledInput
          placeholder="Memo (option)"
          multiline
          value={memo}
          onChange={(event) => {
            onChange?.(event.currentTarget.value);
          }}
        />
      </EditContainer>
    );
  }

  return (
    <NoEditContainer>
      <NoEditTitleContainer>
        <Typography variant="h5">Memo</Typography>
      </NoEditTitleContainer>
      <NoEditContentContainer>
        <Typography variant="h5">{memo}</Typography>
      </NoEditContentContainer>
    </NoEditContainer>
  );
}
