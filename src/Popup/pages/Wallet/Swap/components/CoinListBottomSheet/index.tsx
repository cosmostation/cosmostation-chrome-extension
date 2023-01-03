import { Typography } from '@mui/material';

import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import CoinItem from './CoinItem';
import { CoinList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  availableCoinList: BaseCoinInfo[];
  onClickCoin?: (clickedCoin: BaseCoinInfo) => void;
};

export default function CoinListBottomSheet({ availableCoinList, onClickCoin, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { t } = useTranslation();

  return (
    <StyledBottomSheet {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('pages.Wallet.Swap.components.CoinListBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={() => onClose?.({}, 'escapeKeyDown')}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <CoinList>
          {availableCoinList.map((item) => (
            <CoinItem
              isActive
              key={item.baseDenom}
              coinInfo={item}
              onClickCoin={(clickedCoin) => {
                onClickCoin?.(clickedCoin);
                onClose?.({}, 'backdropClick');
              }}
            />
          ))}
        </CoinList>
      </Container>
    </StyledBottomSheet>
  );
}
