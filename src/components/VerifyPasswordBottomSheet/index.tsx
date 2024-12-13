import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import { sha512 } from '@/utils/crypto/password';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, DescriptionContainer, DescriptionSubTitle, Footer, FormContainer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';
import Button from '../common/Button';
import StandardInput from '../common/StandardInput';

import Close24Icon from 'assets/images/icons/Close24.svg';

type VerifyPasswordBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onSubmit: () => void;
};

export default function VerifyPasswordBottomSheet({ onClose, onSubmit, ...remainder }: VerifyPasswordBottomSheetProps) {
  const { t } = useTranslation();

  const { comparisonPasswordHash } = useExtensionStorageStore((state) => state);

  const { passwordForm } = useSchema({ comparisonPasswordHash: comparisonPasswordHash! });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { password } = watch();
  const isButtonEnabled = !!password;

  const submit = () => {
    onSubmit();
    reset();
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <FormContainer onSubmit={handleSubmit(submit)}>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('components.VerifyPasswordBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionContainer>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('components.VerifyPasswordBottomSheet.index.descriptionSubTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <StandardInput
            label={t('components.VerifyPasswordBottomSheet.index.password')}
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                ...register('password', {
                  setValueAs: (v: string) => {
                    return v ? sha512(v) : '';
                  },
                }),
              },
            }}
          />
        </Body>
        <Footer>
          <Button type="submit" disabled={!isButtonEnabled}>
            {t('components.VerifyPasswordBottomSheet.index.confirm')}
          </Button>
        </Footer>
      </FormContainer>
    </StyledBottomSheet>
  );
}
