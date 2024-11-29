import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';

import type { AccountNameForm } from './-useSchema';
import { useSchema } from './-useSchema';
import { Body, ConfirmButton, Container, DescriptionText, FormContainer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type SetAccountNameBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentAccountName?: string;
  setAccountName?: (accountName: string) => void;
};

export default function SetAccountNameBottomSheet({ currentAccountName, setAccountName, onClose, ...remainder }: SetAccountNameBottomSheetProps) {
  const { t } = useTranslation();

  const { accountNameForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AccountNameForm>({
    resolver: joiResolver(accountNameForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      accountName: currentAccountName,
    },
  });

  const { accountName } = watch();
  const isButtonEnabled = !!accountName;

  const onHandleClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: AccountNameForm) => {
    setAccountName?.(data.accountName);
    onHandleClose();
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <Container>
          <Header>
            <HeaderTitle>
              <Typography variant="h3_B">{t('components.SetAccountNameBottomSheet.index.header')}</Typography>
            </HeaderTitle>
            <StyledButton onClick={onHandleClose}>
              <Close24Icon />
            </StyledButton>
          </Header>
          <Body>
            <DescriptionText variant="b3_R_Multiline">{t('components.SetAccountNameBottomSheet.index.description')}</DescriptionText>
            <StandardInput
              label={t('components.SetAccountNameBottomSheet.index.accountName')}
              error={!!errors.accountName}
              helperText={errors.accountName?.message}
              slotProps={{
                input: {
                  ...register('accountName'),
                },
              }}
            />

            <ConfirmButton type="submit" disabled={!isButtonEnabled}>
              {t('components.SetAccountNameBottomSheet.index.setUpComplete')}
            </ConfirmButton>
          </Body>
        </Container>
      </FormContainer>
    </StyledBottomSheet>
  );
}
