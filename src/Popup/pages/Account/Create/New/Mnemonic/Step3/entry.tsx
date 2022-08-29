import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { disposableLoadingState } from '~/Popup/recoils/loading';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';
import { aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import {
  BottomContainer,
  CheckWordContainer,
  CheckWordItemContainer,
  CheckWordItemInputContainer,
  CheckWordItemNoContainer,
  Container,
  StyledInput,
} from './styled';
import type { Step3Form } from './useSchema';
import { useSchema } from './useSchema';
import Description from '../components/Description';

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigateBack } = useNavigate();
  const { currentPassword } = useCurrentPassword();

  const newAccount = useRecoilValue(newMnemonicAccountState);

  const { addAccount } = useCurrentAccount();

  const { setLoadingOverlay } = useLoading();

  const { enqueueSnackbar } = useSnackbar();

  const setDisposableLoading = useSetRecoilState(disposableLoadingState);

  const { t } = useTranslation();

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic || !currentPassword) {
      navigateBack(-3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mnemonic, accountName, addressIndex } = newAccount;

  const splitedMnemonic = mnemonic.split(' ');

  const mnemonicLength = splitedMnemonic.length;

  const checkMnemonicIndexes = useMemo(() => {
    const indexes: number[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!mnemonic || indexes.length > 3) break;
      const index = Math.floor(Math.random() * mnemonicLength);

      if (!indexes.includes(index)) {
        indexes.push(index);
      }
    }

    return indexes.sort((a, b) => a - b);
  }, [mnemonic, mnemonicLength]);

  const checkWords: CheckWord[] = checkMnemonicIndexes.map((idx) => ({ index: idx, word: splitedMnemonic[idx] }));

  const { step3Form } = useSchema({ words: checkWords });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<Step3Form>({
    resolver: joiResolver(step3Form),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async () => {
    setDisposableLoading(false);
    setLoadingOverlay(true);

    const accountId = uuidv4();

    await addAccount({
      id: accountId,
      type: 'MNEMONIC',
      bip44: { addressIndex: `${addressIndex}` },
      encryptedMnemonic: aesEncrypt(mnemonic, currentPassword!),
      encryptedPassword: aesEncrypt(currentPassword!, mnemonic),
      encryptedRestoreString: sha512(mnemonic),
      name: accountName,
    });

    setLoadingOverlay(false);

    reset();
    enqueueSnackbar('success creating new account');
    navigateBack(-3);
  };

  const error = () => enqueueSnackbar('단어가 맞지 않습니다.', { variant: 'error' });

  return (
    <form onSubmit={handleSubmit(submit, error)}>
      <Container>
        <Description>{t('pages.Account.Create.New.Mnemonic.Step3.entry.description')}</Description>
        <CheckWordContainer>
          {checkWords.map((checkWord) => (
            <CheckWordItemContainer key={checkWord.index}>
              <CheckWordItemNoContainer>
                <Typography variant="h4">{checkWord.index + 1}</Typography>
              </CheckWordItemNoContainer>
              <CheckWordItemInputContainer>
                <StyledInput inputProps={register(`word${checkWord.index}`)} error={!!errors?.[`word${checkWord.index}`]} />
              </CheckWordItemInputContainer>
            </CheckWordItemContainer>
          ))}
        </CheckWordContainer>
        <BottomContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Account.Create.New.Mnemonic.Step3.entry.done')}
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
