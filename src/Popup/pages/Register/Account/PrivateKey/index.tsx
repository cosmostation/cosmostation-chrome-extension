import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { aesDecrypt, aesEncrypt } from '~/Popup/utils/crypto';

import type { PrivateKeyForm } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function PrivateKey() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { privateKeyForm } = useSchema({ name: [...chromeStorage.accounts.map((account) => account.name), 'test'] });
  const { inMemory } = useInMemory();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrivateKeyForm>({
    resolver: joiResolver(privateKeyForm),
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: PrivateKeyForm) => {
    console.log(data);

    if (inMemory.password) {
      const privateKey = data.privateKey.startsWith('0x') ? data.privateKey.substring(2) : data.privateKey;

      const accountId = uuidv4();

      await setChromeStorage('accounts', [
        ...chromeStorage.accounts,
        {
          id: accountId,
          type: 'PRIVATE_KEY',
          allowedOrigins: [],
          allowedChains: [],
          selectedChain: '',
          encryptedPrivateKey: aesEncrypt(privateKey, inMemory.password),
          name: data.name,
        },
      ]);

      await setChromeStorage('selectedAccountId', accountId);

      console.log(aesDecrypt(aesEncrypt(data.privateKey, inMemory.password), inMemory.password));
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <TextField {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </div>
        <TextField
          multiline
          rows={4}
          {...register('privateKey')}
          error={!!errors.privateKey}
          helperText={errors.privateKey?.message}
        />

        <Button type="submit" variant="contained">
          register
        </Button>
      </form>
    </Container>
  );
}
