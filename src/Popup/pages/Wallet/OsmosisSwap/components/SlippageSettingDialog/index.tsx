import { useMemo, useState } from 'react';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal, fix, isDecimal, times } from '~/Popup/utils/big';

import {
  Container,
  HeaderInfoContainer,
  HeaderInfoIconContainer,
  SlippageButton,
  SlippageButtonContainer,
  SlippageButtonTextContainer,
  SlippageCustomInput,
  SlippageCustomInputAdornment,
  SlippageCustomInputConatiner,
  StyledButton,
  StyledTooltip,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type SlippageSettingDialogProps = Omit<DialogProps, 'children'> & {
  currentSlippage: string;
  onSubmitSlippage?: (slippage: string) => void;
};

export default function SlippageSettingDialog({ currentSlippage, onClose, onSubmitSlippage, ...remainder }: SlippageSettingDialogProps) {
  const { t } = useTranslation();

  const [slippage, setCurrentSlippage] = useState(currentSlippage);
  const [customSlippage, setCustomSlippage] = useState('');

  const selectedSlippage = useMemo(() => customSlippage || slippage, [customSlippage, slippage]);

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };
  const submit = () => {
    onSubmitSlippage?.(selectedSlippage);
    handleOnClose();
  };
  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Wallet.OsmosisSwap.components.SlippageSettingDialog.title')}</DialogHeader>
      <Container>
        <HeaderInfoContainer>
          <Typography variant="h5">{t('pages.Wallet.OsmosisSwap.components.SlippageSettingDialog.slippageTolerance')}</Typography>
          <StyledTooltip title={t('pages.Wallet.OsmosisSwap.components.SlippageSettingDialog.toleranceInfo')} placement="bottom" arrow>
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
            data-is-active={equal(selectedSlippage, '1') && !customSlippage}
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
            data-is-active={equal(selectedSlippage, '3') && !customSlippage}
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
            data-is-active={equal(selectedSlippage, '5') && !customSlippage}
          >
            <SlippageButtonTextContainer>
              <Typography variant="h5n">5%</Typography>
            </SlippageButtonTextContainer>
          </SlippageButton>
          <SlippageCustomInputConatiner data-is-active={!!customSlippage}>
            <SlippageCustomInput
              placeholder="Custom"
              data-width={Number(times(customSlippage.length, 0.7))}
              onChange={(e) => {
                if ((!isDecimal(e.currentTarget.value, 2) && e.currentTarget.value) || fix(e.currentTarget.value || '1', 0).length > 2) {
                  return;
                }
                setCustomSlippage(e.currentTarget.value);
              }}
              value={customSlippage}
            />
            {customSlippage && (
              <SlippageCustomInputAdornment>
                <Typography variant="h5n">%</Typography>
              </SlippageCustomInputAdornment>
            )}
          </SlippageCustomInputConatiner>
        </SlippageButtonContainer>
        <StyledButton onClick={submit}>{t('pages.Wallet.OsmosisSwap.components.SlippageSettingDialog.confirm')}</StyledButton>
      </Container>
    </Dialog>
  );
}
