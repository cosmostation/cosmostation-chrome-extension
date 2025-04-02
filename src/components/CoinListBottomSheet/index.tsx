import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import type { FlatAccountAssets } from '@/types/accountAssets';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';
import CoinSelect from '../CoinSelect';

import Close24Icon from 'assets/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  coinList: FlatAccountAssets[];
  currentCoinId?: string;
  title?: string;
  searchPlaceholder?: string;
  onClickCoin: (id: string) => void;
};

export default function CoinListBottomSheet({
  currentCoinId,
  coinList,
  onClose,
  onClickCoin,
  title,
  searchPlaceholder,
  ...remainder
}: CoinListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet {...remainder} onClose={handleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{title || t('components.CoinListBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <CoinSelect
            coinList={coinList}
            currentCoinId={currentCoinId}
            isBottomSheet
            searchPlaceholder={searchPlaceholder}
            onSelectCoin={(coinId) => {
              onClickCoin(coinId);
              handleClose();
            }}
          />
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
