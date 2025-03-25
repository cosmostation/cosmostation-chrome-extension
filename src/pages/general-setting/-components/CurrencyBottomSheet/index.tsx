import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { CURRENCY_TYPE } from '@/constants/currency';
import type { CurrencyType } from '@/types/currency';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type CurrencyBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function CurrencyBottomSheet({ onClose, ...remainder }: CurrencyBottomSheetProps) {
  const { t } = useTranslation();

  const { userCurrencyPreference, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const onHandleClick = (currencyType: CurrencyType) => {
    updateExtensionStorageStore('userCurrencyPreference', currencyType);

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
            <Typography variant="h2_B">{t('pages.general-setting.components.CurrencyBottomSheet.index.title')}</Typography>
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
          {Object.values(CURRENCY_TYPE).map((item) => {
            return (
              <OptionButton
                key={item}
                currency={item}
                isActive={item === userCurrencyPreference}
                onClickButton={(val) => {
                  onHandleClick(val);
                }}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
