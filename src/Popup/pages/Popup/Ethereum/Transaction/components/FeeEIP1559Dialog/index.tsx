import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';

import { Container, CurrentInfoContainer, InputContainer, LabelButton, LabelContainer, LabelText, StyledButton, StyledDivider, StyledInput } from './styled';
import type { FeeEIP1559Form } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type FeeEIP1559DialogProps = Omit<DialogProps, 'children'> & {
  onSubmitGas?: (data: FeeEIP1559Form) => void;
  currentMaxFeePerGas?: string;
  currentMaxPriorityFeePerGas?: string;
};

export default function FeeEIP1559Dialog({ onClose, onSubmitGas, currentMaxFeePerGas, currentMaxPriorityFeePerGas, ...remainder }: FeeEIP1559DialogProps) {
  const { feeEIP1559Form } = useSchema();
  const { currentFee } = useFeeSWR();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FeeEIP1559Form>({
    resolver: joiResolver(feeEIP1559Form),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: FeeEIP1559Form) => {
    onSubmitGas?.(data);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Popup.Ethereum.SignTransaction.components.FeeEIP1559Dialog.index.maxFeePerGasSetting')}</DialogHeader>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <LabelContainer>
            <LabelText>
              <Typography variant="h6">Max base fee per gas (GWEI)</Typography>
            </LabelText>
            <Tooltip
              title="When your transaction gets included in the block, any difference between your max base fee and the actual base fee will be refunded. Total amount is calculated as max base fee (in GWEI) * gas limit."
              arrow
            >
              <LabelButton type="button">
                <Info16Icon />
              </LabelButton>
            </Tooltip>
          </LabelContainer>
          <InputContainer>
            <StyledInput
              inputProps={register('maxFeePerGas')}
              type="text"
              placeholder={`${toDisplayDenomAmount(currentMaxFeePerGas || '0', 9)}`}
              error={!!errors.maxFeePerGas}
              helperText={errors.maxFeePerGas?.message}
            />
          </InputContainer>
          {currentFee && (
            <CurrentInfoContainer>
              <Typography variant="h7n">Current :&nbsp;</Typography>
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={4}>
                {toDisplayDenomAmount(currentFee.tiny.maxBaseFeePerGas, 9)}
              </Number>
              &nbsp;~&nbsp;
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={4}>
                {toDisplayDenomAmount(currentFee.average.maxBaseFeePerGas, 9)}
              </Number>
            </CurrentInfoContainer>
          )}

          <StyledDivider />

          <LabelContainer>
            <LabelText>
              <Typography variant="h6">Max priority fee per gas (GWEI)</Typography>
            </LabelText>
            <Tooltip title="Priority fee (aka “miner top“) goes directly to minors and incentivizes them to prioritize your transaction." arrow>
              <LabelButton type="button">
                <Info16Icon />
              </LabelButton>
            </Tooltip>
          </LabelContainer>
          <InputContainer>
            <StyledInput
              inputProps={register('maxPriorityFeePerGas')}
              type="text"
              placeholder={`${toDisplayDenomAmount(currentMaxPriorityFeePerGas || '0', 9)}`}
              error={!!errors.maxPriorityFeePerGas}
              helperText={errors.maxPriorityFeePerGas?.message}
            />
          </InputContainer>

          {currentFee && (
            <CurrentInfoContainer>
              <Typography variant="h7n">Current :&nbsp;</Typography>
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={4}>
                {toDisplayDenomAmount(currentFee.tiny.maxPriorityFeePerGas, 9)}
              </Number>
              &nbsp;~&nbsp;
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={4}>
                {toDisplayDenomAmount(currentFee.average.maxPriorityFeePerGas, 9)}
              </Number>
            </CurrentInfoContainer>
          )}

          <StyledButton type="submit" disabled={!isDirty}>
            {t('pages.Popup.Ethereum.SignTransaction.components.FeeEIP1559Dialog.index.submitButton')}
          </StyledButton>
        </Container>
      </form>
    </Dialog>
  );
}
