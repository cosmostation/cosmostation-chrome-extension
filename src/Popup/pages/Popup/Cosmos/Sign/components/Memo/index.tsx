import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import { EditContainer, NoEditContainer, NoEditContentContainer, NoEditTitleContainer, StyledInput } from './styled';

type MemoProps = {
  isEdit?: boolean;
  memo?: string;
  onChange?: (memo: string) => void;
};
export default function Memo({ isEdit = false, memo, onChange }: MemoProps) {
  const { t } = useTranslation();
  if (isEdit) {
    return (
      <EditContainer>
        <StyledInput
          placeholder={t('pages.Popup.Cosmos.Sign.components.Memo.index.memoPlaceholder')}
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
        <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.components.Memo.index.memo')}</Typography>
      </NoEditTitleContainer>
      <NoEditContentContainer>
        <Typography variant="h5">{memo}</Typography>
      </NoEditContentContainer>
    </NoEditContainer>
  );
}
