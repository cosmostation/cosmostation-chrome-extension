import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import {
  BottomContainer,
  Container,
  MaxButton,
  SwapCoinContainer,
  SwapCoinHeaderContainer,
  SwapCoinLeftHeaderContainer,
  SwapCoinRightHeaderContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoContainer,
} from './styled';

import SwapIcon from '~/images/icons/Swap.svg';

export default function Entry() {
  const { t } = useTranslation();
  const sampleAmount = '4000';
  return (
    <Container>
      <SwapContainer>
        <SwapCoinContainer>
          <SwapCoinHeaderContainer>
            <SwapCoinLeftHeaderContainer>
              <Typography variant="h6">Input Coin</Typography>
            </SwapCoinLeftHeaderContainer>
            <SwapCoinRightHeaderContainer>
              <Typography variant="h6">Available: {sampleAmount}</Typography>
              <MaxButton>
                <Typography variant="h5">MAX</Typography>
              </MaxButton>
            </SwapCoinRightHeaderContainer>
          </SwapCoinHeaderContainer>
        </SwapCoinContainer>
        <SwapCoinContainer>
          <SwapCoinHeaderContainer>
            <SwapCoinLeftHeaderContainer>
              <Typography variant="h6">Output Coin</Typography>
            </SwapCoinLeftHeaderContainer>
            <SwapCoinRightHeaderContainer>
              <Typography variant="h6">Available: {sampleAmount}</Typography>
              <MaxButton>
                <Typography variant="h5">MAX</Typography>
              </MaxButton>
            </SwapCoinRightHeaderContainer>
          </SwapCoinHeaderContainer>
        </SwapCoinContainer>
        <SwapIconButton>
          <SwapIcon />
        </SwapIconButton>
      </SwapContainer>
      <SwapInfoContainer>fsdf</SwapInfoContainer>
      <BottomContainer>
        <Tooltip varient="error" title="errorMessage" placement="top" arrow>
          <div>
            <Button
              type="button"
              // disabled={!!errorMessage || !ibcSendAminoTx}
              // onClick={ }
            >
              {t('pages.Wallet.Swap.Entry.swapButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>
    </Container>
  );
}
