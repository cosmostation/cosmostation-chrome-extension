import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import type { Fee } from '@/types/fee';

import OptionButton from './components/OptionButton';
import { Body, Container, FeeCustomContainer, Header, HeaderTitle, StyledBottomSheet } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type FeeSettingBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  feeList: Fee[];
  currentSelectedFeeId?: string;
  onSelectOption?: (id: string) => void;
};

export default function FeeSettingBottomSheet({ feeList, currentSelectedFeeId, onClose, onSelectOption, ...remainder }: FeeSettingBottomSheetProps) {
  const { t } = useTranslation();

  const onHandleClick = (id: string) => {
    onSelectOption?.(id);
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h3_B">{t('components.FeeSettingBottomSheet.index.title')}</Typography>
          </HeaderTitle>

          <IconTextButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </IconTextButton>
        </Header>
        <Body>
          {feeList.map((item) => (
            <OptionButton key={item.id} fee={item} isActive={currentSelectedFeeId === item.id} onSelectOption={onHandleClick} />
          ))}
        </Body>

        <FeeCustomContainer>
          <Base1300Text variant="b3_R">{t('components.FeeSettingBottomSheet.index.customDescription')}</Base1300Text>
          <TextButton variant="hyperlink">{t('components.FeeSettingBottomSheet.index.custom')}</TextButton>
        </FeeCustomContainer>
      </Container>
    </StyledBottomSheet>
  );
}
