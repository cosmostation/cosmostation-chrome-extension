import { useMemo, useState } from 'react';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal, isDecimal } from '~/Popup/utils/big';

import {
  Container,
  HeaderInfoContainer,
  HeaderInfoIconContainer,
  SlippageButton,
  SlippageButtonContainer,
  SlippageButtonTextContainer,
  SlippageCustomInput,
  StyledButton,
  StyledTooltip,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type SlippageSettingDialogProps = Omit<DialogProps, 'children'> & {
  selectedSlippage: string;
  onSubmitSlippage?: (slippage: string) => void;
};

export default function SlippageSettingDialog({ selectedSlippage, onClose, onSubmitSlippage, ...remainder }: SlippageSettingDialogProps) {
  const { t } = useTranslation();

  const [slippage, setCurrentSlippage] = useState(selectedSlippage);
  const [customSlippage, setCustomSlippage] = useState('');

  const currentSlippage = useMemo(() => customSlippage || slippage, [customSlippage, slippage]);

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };
  const submit = () => {
    onSubmitSlippage?.(currentSlippage);
    handleOnClose();
  };
  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Wallet.Swap.components.SlippageSettingDialog.title')}</DialogHeader>
      <Container>
        <HeaderInfoContainer>
          <Typography variant="h5">Slippage tolerance</Typography>
          {/* NOTE  ToolTip Variation */}
          <StyledTooltip title={t('pages.Wallet.Swap.components.SlippageSettingDialog.toleranceInfo')} placement="bottom" arrow>
            <span>
              <HeaderInfoIconContainer>
                <Info16Icon />
              </HeaderInfoIconContainer>
            </span>
          </StyledTooltip>
        </HeaderInfoContainer>
        <SlippageButtonContainer>
          <SlippageButton
            onClick={() => {
              setCustomSlippage('');
              setCurrentSlippage('1');
            }}
            data-is-active={equal(currentSlippage, '1') && !customSlippage}
          >
            <SlippageButtonTextContainer>
              <Typography variant="h5">1%</Typography>
            </SlippageButtonTextContainer>
          </SlippageButton>
          <SlippageButton
            onClick={() => {
              setCustomSlippage('');
              setCurrentSlippage('3');
            }}
            data-is-active={equal(currentSlippage, '3') && !customSlippage}
          >
            <SlippageButtonTextContainer>
              <Typography variant="h5">3%</Typography>
            </SlippageButtonTextContainer>
          </SlippageButton>
          <SlippageButton
            onClick={() => {
              setCustomSlippage('');
              setCurrentSlippage('5');
            }}
            data-is-active={equal(currentSlippage, '5') && !customSlippage}
          >
            <SlippageButtonTextContainer>
              <Typography variant="h5">5%</Typography>
            </SlippageButtonTextContainer>
          </SlippageButton>
          {/* TODO 커스텀 버튼 쪽 value prefix추가 및 중앙정렬 */}
          <SlippageCustomInput
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, 0) && e.currentTarget.value) {
                return;
              }
              setCustomSlippage(e.currentTarget.value);
            }}
            value={customSlippage}
            placeholder="Custom"
            data-is-active={!!customSlippage}
          />
        </SlippageButtonContainer>
        <StyledButton onClick={submit}>{t('pages.Wallet.Swap.components.SlippageSettingDialog.confirm')}</StyledButton>
      </Container>
    </Dialog>
  );
}
