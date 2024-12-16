import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import StandardInput from '@/components/common/StandardInput';

import { Body, ButtonContainer, DescriptionText, FormContainer, Header, HeaderTitle, RedTextSpan, StyledBottomSheet, StyledButton } from './styled';
import type { ResetForm } from './useSchema';
import { useSchema } from './useSchema';

import Close24Icon from 'assets/images/icons/Close24.svg';

type ResetBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickReset: () => void;
};

export default function ResetBottomSheet({ onClose, onClickReset, ...remainder }: ResetBottomSheetProps) {
  const { t } = useTranslation();

  const { resetForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ResetForm>({
    resolver: joiResolver(resetForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { resetText } = watch();
  const isButtonDisabled = !resetText;

  const onCloseHandler = () => {
    onClose?.({}, 'backdropClick');
    reset();
  };

  const submit = () => {
    onClickReset();
    reset();
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onCloseHandler}>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={onCloseHandler}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionText variant="b3_R_Multiline">
            {t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.description1')}
            <RedTextSpan>{t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.description1-1')}</RedTextSpan>
            {t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.description2')}
          </DescriptionText>
          <StandardInput
            label={t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.inputLabel')}
            error={!!errors.resetText}
            helperText={errors.resetText?.message}
            slotProps={{
              input: {
                ...register('resetText'),
              },
            }}
          />

          <ButtonContainer>
            <SplitButtonsLayout
              cancelButton={
                <Button onClick={onCloseHandler} variant="dark">
                  {t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.cancel')}
                </Button>
              }
              confirmButton={
                <Button type="submit" variant="red" disabled={isButtonDisabled}>
                  {t('pages.manage-account.reset-wallet.components.ResetBottomSheet.index.reset')}
                </Button>
              }
            />
          </ButtonContainer>
        </Body>
      </FormContainer>
    </StyledBottomSheet>
  );
}
