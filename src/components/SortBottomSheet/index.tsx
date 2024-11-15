import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import type { CommonSortKeyType } from '@/types/sortKey';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type SortBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  optionButtonProps: {
    sortKey: CommonSortKeyType;
    children: JSX.Element;
  }[];
  currentSortOption?: CommonSortKeyType;
  onSelectSortOption?: (val: CommonSortKeyType) => void;
};

export default function SortBottomSheet({ currentSortOption, optionButtonProps, onClose, onSelectSortOption, ...remainder }: SortBottomSheetProps) {
  const { t } = useTranslation();

  const onHandleClick = (val: CommonSortKeyType) => {
    onSelectSortOption?.(val);
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
            <Typography variant="h3_B">{t('components.SortBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          {optionButtonProps.map(({ sortKey, children }) => (
            <OptionButton key={sortKey} sortKey={sortKey} isActive={currentSortOption === sortKey} onSelectSortOption={onHandleClick}>
              {children}
            </OptionButton>
          ))}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
