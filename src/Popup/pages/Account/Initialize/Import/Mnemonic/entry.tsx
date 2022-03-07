import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/IconButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import HDPathDialog from '~/Popup/pages/Account/components/HDPathDialog';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, BottomSettingButtonContainer, Container, InputContainer, StyledInput48, StyledInput140 } from './styled';
import type { MnemonicForm } from './useSchema';
import { useSchema } from './useSchema';

import Setting16Icon from '~/images/icons/Setting16.svg';

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigate } = useNavigate();

  const [newAccount, setNewAccount] = useRecoilState(newMnemonicAccountState);

  const [addressIndex, setAddressIndex] = useState(0);

  const [isOpenHDPathDialog, setIsOpenHDPathDialog] = useState(false);

  const { mnemonicForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<MnemonicForm>({
    resolver: joiResolver(mnemonicForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
    defaultValues: {
      name: newAccount.accountName,
      mnemonic: newAccount.mnemonic,
    },
  });

  const submit = (data: MnemonicForm) => {
    setNewAccount((prev) => ({ ...prev, accountName: data.name, mnemonic: data.mnemonic }));
    navigate('/account/initialize/import/step2');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <InputContainer>
          <div>
            <StyledInput48 placeholder="account name" inputProps={register('name')} error={!!errors.name} helperText={errors.name?.message} />
          </div>
          <div>
            <StyledInput140
              multiline
              minRows={6}
              placeholder={'To restore your password,\nplease enter your Cosmostation Wallet\nrecovery code (or phrase).'}
              inputProps={register('mnemonic', { setValueAs: (v: string) => v.trim() })}
              error={!!errors.mnemonic}
              helperText={errors.mnemonic?.message}
            />
          </div>
        </InputContainer>
        <BottomContainer>
          <BottomSettingButtonContainer>
            <IconButton Icon={Setting16Icon} onClick={() => setIsOpenHDPathDialog(true)}>
              HD path setting
            </IconButton>
          </BottomSettingButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            Import
          </Button>
        </BottomContainer>
        <HDPathDialog
          open={isOpenHDPathDialog}
          currentAddressIndex={addressIndex}
          onSubmitHdPath={(data) => setAddressIndex(data.addressIndex)}
          onClose={() => setIsOpenHDPathDialog(false)}
        />
      </Container>
    </form>
  );
}
