import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useRecoilValue } from 'recoil';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

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

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();

  const newAccount = useRecoilValue(newMnemonicAccountState);

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic) {
      navigateBack(-3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mnemonic } = newAccount;

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

  const submit = () => {
    reset();
    navigate('/account/initialize/new/mnemonic/step4');
  };

  const error = () => enqueueSnackbar('단어가 맞지 않습니다.', { variant: 'error' });

  return (
    <form onSubmit={handleSubmit(submit, error)}>
      <Container>
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
            {t('pages.Account.Initialize.New.Mnemonic.Step3.entry.next')}
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
