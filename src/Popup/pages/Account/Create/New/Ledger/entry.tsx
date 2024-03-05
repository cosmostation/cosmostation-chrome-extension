import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/IconButton';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import HDPathDialog from '~/Popup/pages/Account/components/HDPathDialog';
import { disposableLoadingState } from '~/Popup/recoils/loading';

import {
  BottomContainer,
  BottomGuideButton,
  BottomGuideButtonContainer,
  BottomSettingButtonContainer,
  Container,
  InputContainer,
  StyledInput48,
} from './styled';
import type { LedgerForm } from './useSchema';
import { useSchema } from './useSchema';

import Setting16Icon from '~/images/icons/Setting16.svg';

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigateBack } = useNavigate();

  const { addAccount } = useCurrentAccount();

  const [addressIndex, setAddressIndex] = useState(0);

  const [isOpenHDPathDialog, setIsOpenHDPathDialog] = useState(false);

  const { setLoadingOverlay } = useLoading();

  const { enqueueSnackbar } = useSnackbar();

  const setDisposableLoading = useSetRecoilState(disposableLoadingState);

  const { ledgerForm } = useSchema();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<LedgerForm>({
    resolver: joiResolver(ledgerForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: LedgerForm) => {
    setDisposableLoading(false);
    setLoadingOverlay(true);

    const accountId = uuidv4();

    await addAccount({
      id: accountId,
      type: 'LEDGER',
      bip44: { addressIndex: `${addressIndex}` },
      name: data.name,
    });

    setLoadingOverlay(false);

    reset();
    enqueueSnackbar('success creating new account');
    navigateBack();
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <InputContainer>
            <div>
              <StyledInput48
                placeholder={t('pages.Account.Create.New.Ledger.entry.accountNamePlaceholder')}
                inputProps={register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </div>
          </InputContainer>
          <BottomContainer>
            <BottomGuideButtonContainer>
              <BottomGuideButton type="button" onClick={() => window.open('https://docs.cosmostation.io/extension/guide/account/add-ledger-account')}>
                <Typography variant="h5">{t('pages.Account.Create.New.Ledger.entry.guideButton')}</Typography>
              </BottomGuideButton>
            </BottomGuideButtonContainer>
            <BottomSettingButtonContainer>
              <IconButton Icon={Setting16Icon} onClick={() => setIsOpenHDPathDialog(true)}>
                {t('pages.Account.Create.New.Ledger.entry.hdPathSetting')}
              </IconButton>
            </BottomSettingButtonContainer>
            <Button type="submit" disabled={!isDirty}>
              {t('pages.Account.Create.New.Ledger.entry.done')}
            </Button>
          </BottomContainer>
        </Container>
      </form>
      <HDPathDialog
        open={isOpenHDPathDialog}
        currentAddressIndex={addressIndex}
        onSubmitHdPath={(data) => setAddressIndex(data.addressIndex)}
        onClose={() => setIsOpenHDPathDialog(false)}
      />
    </>
  );
}
