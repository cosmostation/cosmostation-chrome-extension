import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useLoadingOverlay } from '~/Popup/hooks/useLoadingOverlay';
import { useNavigate } from '~/Popup/hooks/useNavigate';
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

  const newAccount = useRecoilValue(newMnemonicAccountState);

  const setLoadingOverlay = useLoadingOverlay();

  const { enqueueSnackbar } = useSnackbar();

  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { inMemory } = useInMemory();

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic || !inMemory.password) {
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
  }, [mnemonicLength, mnemonic]);

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
    setLoadingOverlay(true);

    const accountId = uuidv4();

    await setChromeStorage('accounts', [
      ...chromeStorage.accounts,
      {
        id: accountId,
        type: 'MNEMONIC',
        bip44: { addressIndex: `${addressIndex}` },
        encryptedMnemonic: aesEncrypt(mnemonic, inMemory.password!),
        encryptedPassword: aesEncrypt(inMemory.password!, mnemonic),
        encryptedRestoreString: sha512(mnemonic),
      },
    ]);

    await setChromeStorage('accountName', { ...chromeStorage.accountName, [accountId]: accountName });

    setLoadingOverlay(false);

    reset();
    enqueueSnackbar('success creating new account');
    navigateBack(-3);
  };

  const error = () => enqueueSnackbar('단어가 맞지 않습니다.', { variant: 'error' });

  return (
    <form onSubmit={handleSubmit(submit, error)}>
      <Container>
        <Description>Enter your secret phrase below to verify it is stored safely.</Description>
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
            Done
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
