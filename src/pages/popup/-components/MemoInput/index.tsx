import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';

import MemoBottomSheet from './components/MemoBottomSheet';
import { Container, LeftContainer, RightContainer, StyledIconButton } from './styled';

import EditIcon from '@/assets/images/icons/Edit24.svg';

type MemoInputProps = {
  memo?: string;
  isEditMemo?: boolean;
  onChangeMemo?: (memo: string) => void;
};
export default function MemoInput({ memo, isEditMemo, onChangeMemo }: MemoInputProps) {
  const { t } = useTranslation();

  const [isOpenMemoBottomSheet, setIsOpenMemoBottomSheet] = useState(false);

  return (
    <>
      <Container>
        <LeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.MemoInput.index.memo')}</Base1000Text>
          {memo ? <Base1300Text variant="b3_M">{memo}</Base1300Text> : <Base1000Text variant="b3_M">{'-'}</Base1000Text>}
        </LeftContainer>
        {isEditMemo && (
          <RightContainer>
            <StyledIconButton onClick={() => setIsOpenMemoBottomSheet(true)}>
              <EditIcon />
            </StyledIconButton>
          </RightContainer>
        )}
      </Container>
      <MemoBottomSheet open={isOpenMemoBottomSheet} onClose={() => setIsOpenMemoBottomSheet(false)} currentMemo={memo} onChangeMemo={onChangeMemo} />
    </>
  );
}
