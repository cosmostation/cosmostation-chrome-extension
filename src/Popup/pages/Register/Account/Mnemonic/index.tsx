import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { joiResolver } from '@hookform/resolvers/joi';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { aesEncrypt } from '~/Popup/utils/crypto';

import type { MnemonicForm } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function Mnemonic() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { mnemonicForm } = useSchema({ name: [...chromeStorage.accounts.map((account) => account.name), 'test'] });
  const { inMemory } = useInMemory();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MnemonicForm>({
    resolver: joiResolver(mnemonicForm),
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: MnemonicForm) => {
    console.log(data);

    if (inMemory.password) {
      await setChromeStorage('accounts', [
        ...chromeStorage.accounts,
        {
          type: 'MNEMONIC',
          allowedOrigins: [],
          coinType: data.coinType,
          bip44: { account: '0', addressIndex: '0', change: '0' },
          encryptedMnemonic: aesEncrypt(data.mnemonic, inMemory.password),
          name: data.name,
        },
      ]);
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <FormControl component="fieldset" {...register('coinType')}>
          <FormLabel component="legend">coin type</FormLabel>
          <RadioGroup aria-label="coinType" defaultValue={ACCOUNT_COIN_TYPE.COSMOS} name="radio-buttons-group">
            <FormControlLabel value={ACCOUNT_COIN_TYPE.COSMOS} control={<Radio />} label="cosmos" />
            <FormControlLabel value={ACCOUNT_COIN_TYPE.FOUNDATION} control={<Radio />} label="foundation" />
          </RadioGroup>
        </FormControl>
        <TextField
          multiline
          rows={4}
          {...register('mnemonic')}
          error={!!errors.mnemonic}
          helperText={errors.mnemonic?.message}
        />
        <TextField {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <Button type="submit" variant="contained">
          register
        </Button>
      </form>
    </Container>
  );
}
