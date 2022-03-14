import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useLoadingOverlay } from '~/Popup/hooks/useLoadingOverlay';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { disposableLoadingState } from '~/Popup/recoils/loadingOverlay';
import { aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import { BottomContainer, Container, InputContainer, StyledInput48, StyledInput140 } from './styled';
import type { PrivateKeyForm } from './useSchema';
import { useSchema } from './useSchema';

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigateBack } = useNavigate();

  const setLoadingOverlay = useLoadingOverlay();

  const { enqueueSnackbar } = useSnackbar();

  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { inMemory } = useInMemory();

  const setDisposableLoading = useSetRecoilState(disposableLoadingState);

  const { privateKeyForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PrivateKeyForm>({
    resolver: joiResolver(privateKeyForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: PrivateKeyForm) => {
    setDisposableLoading(false);
    setLoadingOverlay(true);

    const privateKey = data.privateKey.startsWith('0x') ? data.privateKey.substring(2) : data.privateKey;

    const privateKeyRestoreStrings = chromeStorage.accounts
      .filter((account) => account.type === 'PRIVATE_KEY')
      .map((account) => account.encryptedRestoreString);

    if (privateKeyRestoreStrings.includes(sha512(privateKey))) {
      enqueueSnackbar('이미 존재하는 개인키 입니다.', { variant: 'error' });
      setLoadingOverlay(false);
      return;
    }

    const accountId = uuidv4();

    await setChromeStorage('accounts', [
      ...chromeStorage.accounts,
      {
        id: accountId,
        type: 'PRIVATE_KEY',
        encryptedPrivateKey: aesEncrypt(privateKey, inMemory.password!),
        encryptedPassword: aesEncrypt(inMemory.password!, privateKey),
        encryptedRestoreString: sha512(privateKey),
      },
    ]);

    await setChromeStorage('accountName', { ...chromeStorage.accountName, [accountId]: data.name });

    setLoadingOverlay(false);

    reset();
    enqueueSnackbar('success creating new account');
    navigateBack();
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
              inputProps={register('privateKey', { setValueAs: (v: string) => v.trim() })}
              error={!!errors.privateKey}
              helperText={errors.privateKey?.message}
            />
          </div>
        </InputContainer>
        <BottomContainer>
          <Button type="submit" disabled={!isDirty}>
            Import
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
