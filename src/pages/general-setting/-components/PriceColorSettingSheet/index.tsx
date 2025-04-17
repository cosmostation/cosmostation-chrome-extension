import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { PRICE_TREND_TYPE } from '@/constants/price';
import type { PriceTrendType } from '@/types/price';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type PriceColorSettingSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function PriceColorSettingSheet({ onClose, ...remainder }: PriceColorSettingSheetProps) {
  const { t } = useTranslation();

  const { userPriceTrendPreference, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const onHandleClick = (val: PriceTrendType) => {
    updateExtensionStorageStore('userPriceTrendPreference', val);

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
            <Typography variant="h2_B">{t('pages.general-setting.components.PriceColorSettingBottomSheet.index.title')}</Typography>
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
          {Object.values(PRICE_TREND_TYPE).map((item) => {
            return (
              <OptionButton
                key={item}
                priceTrend={item}
                isActive={userPriceTrendPreference === item}
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
