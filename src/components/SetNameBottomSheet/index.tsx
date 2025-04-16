import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';

import type { NameForm } from './-useSchema';
import { useSchema } from './-useSchema';
import { Body, ConfirmButton, Container, DescriptionText, FormContainer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type SetNameBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentName?: string;
  headerTitleText?: string;
  descriptionText?: string;
  inputPlaceholder?: string;
  setName?: (name: string) => void;
};

export default function SetNameBottomSheet({
  currentName,
  headerTitleText,
  descriptionText,
  inputPlaceholder,
  setName,
  onClose,
  ...remainder
}: SetNameBottomSheetProps) {
  const { t } = useTranslation();

  const { nameForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<NameForm>({
    resolver: joiResolver(nameForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      name: currentName,
    },
  });

  const { name } = watch();
  const isButtonEnabled = !!name;

  const onHandleClose = () => {
    reset({
      name: '',
    });
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: NameForm) => {
    setName?.(data.name);
    onHandleClose();
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <Container>
          <Header>
            <HeaderTitle>
              <Typography variant="h2_B">{headerTitleText || t('components.SetNameBottomSheet.index.header')}</Typography>
            </HeaderTitle>
            <StyledButton onClick={onHandleClose}>
              <Close24Icon />
            </StyledButton>
          </Header>
          <Body>
            <DescriptionText variant="b3_R_Multiline">{descriptionText || t('components.SetNameBottomSheet.index.description')}</DescriptionText>
            <StandardInput
              label={inputPlaceholder || t('components.SetNameBottomSheet.index.accountName')}
              error={!!errors.name}
              helperText={errors.name?.message}
              slotProps={{
                input: {
                  ...register('name'),
                },
              }}
            />

            <ConfirmButton type="submit" disabled={!isButtonEnabled}>
              {t('components.SetNameBottomSheet.index.setUpComplete')}
            </ConfirmButton>
          </Body>
        </Container>
      </FormContainer>
    </StyledBottomSheet>
  );
}
