import { useMemo, useState } from 'react';
import type { DialogProps } from '@mui/material';
import { InputAdornment, Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal, gt, isDecimal } from '~/Popup/utils/big';

import {
  Container,
  HeaderInfoContainer,
  HeaderInfoIconContainer,
  SlippageButton,
  SlippageButtonContainer,
  SlippageButtonTextContainer,
  SlippageCustomInput,
  SlippageCustomInputText,
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
              <Typography variant="h5n">1%</Typography>
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
              <Typography variant="h5n">3%</Typography>
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
              <Typography variant="h5n">5%</Typography>
            </SlippageButtonTextContainer>
          </SlippageButton>
          <SlippageCustomInput
            endAdornment={
              customSlippage && (
                <InputAdornment position="end">
                  {/* TODO 중앙정렬 필요함 */}
                  <SlippageCustomInputText>
                    <Typography variant="h5n">%</Typography>
                  </SlippageCustomInputText>
                </InputAdornment>
              )
            }
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, 3) && e.currentTarget.value) {
                return;
              }
              setCustomSlippage(e.currentTarget.value);
            }}
            value={customSlippage}
            placeholder="Custom"
            data-is-active={!!customSlippage}
            // TODO 5이상으로 큰 숫자 받을떄도 중앙정렬 되도록 단순 불리언이 아니라 숫자를 넘겨줘야할듯
            data-is-length={gt(currentSlippage.length, 2)}
          />
        </SlippageButtonContainer>
        <StyledButton onClick={submit}>{t('pages.Wallet.Swap.components.SlippageSettingDialog.confirm')}</StyledButton>
      </Container>
    </Dialog>
  );
}
